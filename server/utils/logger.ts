export function createLogger(context: string) {
  return {
    info: (...args: any[]) => console.log(`[${context}]`, ...args),
    warn: (...args: any[]) => console.warn(`[${context}]`, ...args),
    error: (...args: any[]) => console.error(`[${context}]`, ...args)
  };
}
