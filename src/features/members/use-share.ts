import { toast } from 'sonner'

type ShareData = { title: string; text: string; url: string }

/**
 * Opens the native share sheet on Android / iOS (WhatsApp, SMS, Messenger…),
 * and falls back to copying the link on browsers without the Web Share API.
 */
export function useShare() {
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const share = async (data: ShareData) => {
    if (canShare) {
      try {
        await navigator.share(data)
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
    await copy(data.url)
  }

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Lien copié dans le presse-papiers')
    } catch {
      // The Clipboard API requires HTTPS: over plain HTTP the link has to be copied by hand.
      toast.info('Sélectionnez le lien pour le copier manuellement')
    }
  }

  return { share, copy, canShare }
}
