import { contextBridge, ipcRenderer } from 'electron'

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('studyHelperAPI', {
      openFilePicker: () => ipcRenderer.invoke('open-file-picker'),
      getNotes: () => ipcRenderer.invoke('get-notes'),
      deleteNote: (path) => ipcRenderer.invoke('delete-note', path)
    })
  } catch (error) {
    console.error(error)
  }
}
