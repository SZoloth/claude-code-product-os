/**
 * TypeScript declarations for mammoth.js
 */

declare module 'mammoth' {
  interface ExtractResult {
    value: string
    messages: Array<{ message: string; type: string }>
  }

  interface ConvertResult {
    value: string
    messages: Array<{ message: string; type: string }>
  }

  interface ConvertOptions {
    arrayBuffer?: ArrayBuffer
    convertImage?: any
  }

  export function extractRawText(options: { arrayBuffer: ArrayBuffer }): Promise<ExtractResult>
  export function convertToHtml(options: ConvertOptions): Promise<ConvertResult>
  
  export const images: {
    ignoreAllImages: any
  }
}