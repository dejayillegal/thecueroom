// server/types/dotenv.d.ts
declare module 'dotenv' {
  interface DotenvConfigOptions {
    path?: string;
    encoding?: string;
    debug?: boolean;
  }
  interface DotenvConfigOutput {
    parsed?: Record<string, string>;
    error?: Error;
  }
  function config(options?: DotenvConfigOptions): DotenvConfigOutput;
  export { config };
}
