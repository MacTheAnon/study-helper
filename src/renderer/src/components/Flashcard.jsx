/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs-extra'
import mammoth from 'mammoth'

// Define storage paths
const storagePath = path.join(app.getPath('userData'), 'Notes')
const cardsPath = path.join(storagePath, 'flashcards.json')

// --- 1. Window Management ---

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
  splash.loadFile(path.join(__dirname, '../renderer/splash.html'))
  return splash
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    show: false, // Hidden until splash finishes
    autoHideMenuBar: true,
    title: "Study Helper",
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false // Required to load local files from AppData
    }
  })

  mainWindow.on('ready-to-show', () => {
    // We handle the show/hide in the app.whenReady block
  })

  // Load the app (dev or prod)
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

// --- 2. App Lifecycle ---

app.whenReady().then(() => {
  // Ensure directories exist
  fs.ensureDirSync(storagePath)

  // Show splash, then main window
  const splash = createSplashWindow()
  const mainWindow = createWindow()

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      splash.close()
      mainWindow.show()
    }, 2000) // 2 second display time
  })

  // Standard Electron Mac behavior
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// --- 3. IPC Handlers (Notes & Flashcards) ---

// FILE PICKER
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
  await fs.chmod(destPath, 0o444) // Set to Read-Only

  let content = ""
  if (ext === '.docx') {
    const result = await mammoth.convertToHtml({ path: destPath })
    content = result.value
  } else if (ext === '.txt') {
    content = await fs.readFile(destPath, 'utf8')
  }

  return { name: fileName, path: destPath, type: ext.replace('.', ''), content }
})

// GET ALL NOTES
ipcMain.handle('get-notes', async () => {
  const files = await fs.readdir(storagePath)
  // Filter out the flashcards.json file from the notes list
  return files
    .filter(f => f !== 'flashcards.json')
    .map(f => ({ 
      name: f, 
      path: path.join(storagePath, f),
      type: path.extname(f).replace('.', '')
    }))
})

// DELETE NOTE
ipcMain.handle('delete-note', async (event, filePath) => {
  try {
    await fs.remove(filePath)
    return { success: true }
  } catch (err) {
    console.error("Delete failed:", err)
    return { success: false, error: err.message }
  }
})

// FLASHCARDS: SAVE
ipcMain.handle('save-cards', async (event, cards) => {
  await fs.writeJson(cardsPath, cards)
  return { success: true }
})

// FLASHCARDS: LOAD
ipcMain.handle('get-cards', async () => {
  if (await fs.pathExists(cardsPath)) return await fs.readJson(cardsPath)
  return []
})