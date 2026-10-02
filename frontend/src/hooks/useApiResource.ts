import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage, isAbortError } from '../api/client'

export type LoadStatus = 'loading' | 'success' | 'error'

type Loader<T> = (signal: AbortSignal) => Promise<T>

/** Which request finished last, and how. */
interface SettledRequest<T> {
  load: Loader<T>
  reloadCount: number
  error: string | null
}

/**
 * Runs `load` on mount and again whenever `load` changes, so callers should
 * memoise it with useCallback. Pending requests are aborted when the inputs
 * change or the component unmounts.
 *
 * `status` is derived instead of stored: if the last finished request isn't
 * the one for the current inputs, we are still loading. `data` keeps the last
 * successful result meanwhile, so the screen doesn't flash.
 */
export function useApiResource<T>(load: Loader<T>) {
  const [reloadCount, setReloadCount] = useState(0)
  const [data, setDataState] = useState<T | null>(null)
  const [settled, setSettled] = useState<SettledRequest<T> | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    load(controller.signal).then(
      (result) => {
        if (controller.signal.aborted) return
        setDataState(result)
        setSettled({ load, reloadCount, error: null })
      },
      (error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return
        setSettled({ load, reloadCount, error: getErrorMessage(error) })
      },
    )

    return () => controller.abort()
  }, [load, reloadCount])

  const isCurrent = settled?.load === load && settled.reloadCount === reloadCount
  const error = isCurrent ? settled.error : null
  const status: LoadStatus = !isCurrent ? 'loading' : error ? 'error' : 'success'

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  /** Local update after a mutation, without asking the server again. */
  const setData = useCallback((update: (current: T) => T) => {
    setDataState((current) => (current === null ? current : update(current)))
  }, [])

  return { status, data, error, reload, setData }
}
