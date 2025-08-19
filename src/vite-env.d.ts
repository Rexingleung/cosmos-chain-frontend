/// <reference types="vite/client" />

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
  
  const Buffer: {
    new (data: any, encoding?: string): any;
    from(data: any, encoding?: string): any;
    isBuffer(obj: any): boolean;
  };
}

export {};