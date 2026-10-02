// localStorage can throw (private mode, blocked cookies, quota), and losing a
// UI preference is never worth crashing the app, so every access is guarded.

export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Storage unavailable: the preference just won't be remembered.
  }
}
