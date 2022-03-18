declare module 'shrink-string' {
  export function compress(raw: string): Promise<string>;
  export function decompress(compressedString: string): Promise<string>;
}
