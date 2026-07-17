/**
 * Ridimensiona un'immagine e la restituisce come data URL JPEG.
 *
 * Una foto a piena risoluzione come data URL satura la quota di localStorage
 * (~5 MB): riducendo il lato massimo a `maxSize` px ed esportando in JPEG
 * il risultato pesa pochi KB.
 */
export function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (ev) => {
      const img = new Image()

      img.onload = () => {
        // Mantiene le proporzioni rientrando in maxSize x maxSize
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas non disponibile'))
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }

      img.onerror = () => reject(new Error('Immagine non leggibile'))
      img.src = ev.target?.result as string
    }

    reader.onerror = () => reject(new Error('Lettura del file fallita'))
    reader.readAsDataURL(file)
  })
}
