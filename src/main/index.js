import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { electronApp, is } from '@electron-toolkit/utils'
import fs from 'fs-extra'
import mammoth from 'mammoth'

const storagePath = path.join(app.getPath('userData'), 'Notes')
const cardsPath = path.join(storagePath, 'flashcards.json')

function createSplashWindow() {
  const splash = new BrowserWindow({
    width: 400,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: { nodeIntegration: false }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    splash.loadFile(path.join(__dirname, '../../src/renderer/splash.html'))
  } else {
    splash.loadFile(path.join(__dirname, '../renderer/splash.html'))
  }
  return splash
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    title: 'Study Helper',
    fullscreenable: true, // Enables native full-screen on Mac/Win
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false // Required to view local files
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // Optional: Open DevTools in development for debugging
  if (is.dev) {
    mainWindow.webContents.openDevTools()
  }

  return mainWindow
}

app.whenReady().then(() => {
  fs.ensureDirSync(storagePath)
  const splash = createSplashWindow()
  const mainWindow = createWindow()

  mainWindow.webContents.once('did-finish-load', () => {
    setTimeout(() => {
      if (splash && !splash.isDestroyed()) splash.close()
      mainWindow.maximize()
      mainWindow.show()
      mainWindow.focus()
    }, 2000)
  })

  // Set App ID for Windows Taskbar
  if (process.platform === 'win32') {
    electronApp.setAppUserModelId('com.studyhelper')
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // MacOS specific: Re-create window if dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// --- IPC HANDLERS ---

ipcMain.handle('open-file-picker', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Study Docs', extensions: ['pdf', 'docx', 'txt'] }]
  })
  if (canceled) return null

  const sourcePath = filePaths[0]
  const fileName = path.basename(sourcePath)
  const ext = path.extname(fileName).toLowerCase()
  const destPath = path.join(storagePath, fileName)

  await fs.copy(sourcePath, destPath)

  // Cross-platform permission handling
  try {
    await fs.chmod(destPath, 0o444) // Read-only
  } catch (err) {
    console.log('Could not set read-only permissions (safe to ignore on some OSs):', err)
  }

  let content = ''
  if (ext === '.docx') {
    const result = await mammoth.convertToHtml({ path: destPath })
    content = result.value
  } else if (ext === '.txt') {
    content = await fs.readFile(destPath, 'utf8')
  }

  return { name: fileName, path: destPath, type: ext.replace('.', ''), content }
})

ipcMain.handle('get-notes', async () => {
  const files = await fs.readdir(storagePath)
  return files
    .filter((f) => f !== 'flashcards.json')
    .map((f) => ({
      name: f,
      path: path.join(storagePath, f),
      type: path.extname(f).replace('.', '')
    }))
})

ipcMain.handle('delete-note', async (event, filePath) => {
  const choice = await dialog.showMessageBox({
    type: 'warning',
    buttons: ['Cancel', 'Delete'],
    title: 'Confirm Deletion',
    message: `Delete "${path.basename(filePath)}"?`,
    checkboxLabel: 'I understand'
  })
  if (choice.response === 1) {
    await fs.remove(filePath)
    return { success: true }
  }
  return { success: false }
})

ipcMain.handle('save-cards', async (event, cards) => {
  await fs.writeJson(cardsPath, cards)
  return { success: true }
})

ipcMain.handle('get-cards', async () => {
  if (await fs.pathExists(cardsPath)) return await fs.readJson(cardsPath)
  return []
})
