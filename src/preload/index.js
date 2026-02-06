import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for Study Helper
const api = {
  openFilePicker: () => ipcRenderer.invoke('open-file-picker'),
  getNotes: () => ipcRenderer.invoke('get-notes'),
  deleteNote: (path) => ipcRenderer.invoke('delete-note', path),
  saveCards: (cards) => ipcRenderer.invoke('save-cards', cards),
  getCards: () => ipcRenderer.invoke('get-cards')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('studyHelperAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in d.ts if using TS)
  window.electron = electronAPI
  // @ts-ignore (define in d.ts if using TS)
  window.studyHelperAPI = api
}
