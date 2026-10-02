const BASE_URL = '/api'

export const NETWORK_ERROR_MESSAGE =
  'No se puede conectar con la API. ¿Está arrancado el backend en el puerto 8081?'

/** RFC 9457 error body returned by the backend. */
export interface ProblemDetail {
  type?: string
  title?: string
  status?: number
  detail?: string
  /** Field name -> message. Only present on 400 validation errors. */
  errors?: Record<string, string>
}

/** The API answered with an error status (4xx/5xx). */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(status: number, problem: ProblemDetail) {
    super(problem.detail ?? problem.title ?? `Error ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = problem.errors ?? {}
  }
}

/** The API could not be reached at all (backend down, no network...). */
export class NetworkError extends Error {
  constructor() {
    super(NETWORK_ERROR_MESSAGE)
    this.name = 'NetworkError'
  }
}

/** Turns any thrown value into a message we can show to the user. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof NetworkError) {
    return error.message
  }
  return 'Ha ocurrido un error inesperado.'
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new NetworkError()
  }

  if (!response.ok) {
    throw await toError(response)
  }
  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

async function toError(response: Response): Promise<Error> {
  const isJson = response.headers.get('Content-Type')?.includes('json') ?? false
  if (isJson) {
    const problem = (await response.json().catch(() => ({}))) as ProblemDetail
    return new ApiError(response.status, problem)
  }
  // The Vite dev proxy answers 502 (and other gateways 503/504) without a JSON
  // body when the backend is not running: treat it as a connection problem.
  if (response.status >= 502 && response.status <= 504) {
    return new NetworkError()
  }
  return new ApiError(response.status, {})
}
