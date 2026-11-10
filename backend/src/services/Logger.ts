//
export interface Logger {
  error: (msg: string, ...args: any[]) => void;
  info: (msg: string, ...args: any[]) => void;
}
