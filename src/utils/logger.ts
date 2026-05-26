export function logError(message: string, error?: unknown): void {
  const detail = error
    ? ` | ${error instanceof Error ? error.message : String(error)}`
    : "";
  console.error(`${message}${detail}`);
}

export function logInfo(message: string): void {
  console.info(message);
}

export function logWarn(message: string): void {
  console.warn(message);
}
