import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { electronApp, is } from '@electron-toolkit/utils'
import fs from 'fs-extra'
import mammoth from 'mammoth'

// 1. PATH CONFIGURATION
const storagePath = path.join(app.getPath('userData'), 'Notes')
const cardsPath = path.join(storagePath, 'flashcards.json')

// 2. WINDOW MANAGEMENT
function createSplashWindow() {
  const splash = new BrowserWindow({
    width: 400,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false
    }
  })

  // Correctly load splash.html based on environment
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
    show: false, // Hidden initially
    autoHideMenuBar: true,
    title: 'Study Helper',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // DEBUGGING: Open DevTools automatically in dev mode to catch errors
  if (is.dev) {
    mainWindow.webContents.openDevTools()
  }

  return mainWindow
}

// 3. APP LIFECYCLE
app.whenReady().then(() => {
  fs.ensureDirSync(storagePath)

  const splash = createSplashWindow()
  const mainWindow = createWindow()

  // SAFEGUARD: Use 'did-finish-load' instead of 'ready-to-show'
  // This ensures the window opens even if React has rendering errors
  mainWindow.webContents.once('did-finish-load', () => {
    setTimeout(() => {
      if (splash && !splash.isDestroyed()) {
        splash.close()
      }
      mainWindow.show()
      mainWindow.focus()
    }, 2000)
  })

  electronApp.setAppUserModelId('com.studyhelper')
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// 4. IPC HANDLERS
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
  await fs.chmod(destPath, 0o444)

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
  const fileName = path.basename(filePath)
  const choice = await dialog.showMessageBox({
    type: 'warning',
    buttons: ['Cancel', 'Delete'],
    defaultId: 0,
    cancelId: 0,
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete "${fileName}"?`,
    detail: 'This action is permanent and cannot be undone.',
    checkboxLabel: 'I understand'
  })

  if (choice.response === 1) {
    try {
      await fs.remove(filePath)
      return { success: true }
    } catch (err) {
      console.error('Delete failed:', err)
      return { success: false, error: err.message }
    }
  }
  return { success: false, error: 'User cancelled' }
})

ipcMain.handle('save-cards', async (event, cards) => {
  await fs.writeJson(cardsPath, cards)
  return { success: true }
})

ipcMain.handle('get-cards', async () => {
  if (await fs.pathExists(cardsPath)) return await fs.readJson(cardsPath)
  return []
})