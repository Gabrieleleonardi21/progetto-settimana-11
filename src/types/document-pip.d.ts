// Document Picture-in-Picture API (Chrome/Edge 116+).
// Non è ancora nelle lib DOM di TypeScript: la dichiariamo qui.
// https://developer.chrome.com/docs/web-platform/document-picture-in-picture

interface DocumentPictureInPictureOptions {
  width?: number
  height?: number
}

interface DocumentPictureInPicture extends EventTarget {
  requestWindow(options?: DocumentPictureInPictureOptions): Promise<Window>
  readonly window: Window | null
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture
  }
}

export {}
