import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getNotes: () => ipcRenderer.invoke('get-notes'),
  openFilePicker: () => ipcRenderer.invoke('open-file-picker'),
  deleteNote: (path) => ipcRenderer.invoke('delete-note', path),
  saveCards: (cards) => ipcRenderer.invoke('save-cards', cards),
  getCards: () => ipcRenderer.invoke('get-cards')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('studyHelperAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.studyHelperAPI = api
}