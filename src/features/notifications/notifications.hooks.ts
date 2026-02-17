import { isPermissionGranted, requestPermission, sendNotification as tauriSendNotification } from '@tauri-apps/plugin-notification'

export async function sendNotification(title: string, body: string) {
  try {
    let permissionGranted = await isPermissionGranted()
    if (!permissionGranted) {
      const permission = await requestPermission()
      permissionGranted = permission === 'granted'
    }
    if (permissionGranted) {
      tauriSendNotification({ title, body })
    }
  } catch (e) {
    // Fallback for browser/dev mode
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body })
    }
  }
}

export function useNotifications() {
  return { sendNotification }
}
