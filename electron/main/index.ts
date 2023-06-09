import {app, BrowserWindow, shell, ipcMain} from 'electron'
import {release} from 'node:os'
import {join} from 'node:path'
import {RabbitEntity} from "../services/entity/rabbit.entity";


// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
    ? join(process.env.DIST_ELECTRON, '../public')
    : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
    app.quit()
    process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
app.setName("mq-tool")
const APP_DATA: string = app.getPath("appData");
const APP_NAME: string = app.getName();

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {
    win = new BrowserWindow({
        title: 'mq-tool',
        width: 975,
        height: 720,
        resizable: false,
        maximizable: false,
        icon: join(process.env.PUBLIC, 'favicon.ico'),
        webPreferences: {
            preload,
            // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
            // Consider using contextBridge.exposeInMainWorld
            // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
            nodeIntegration: true,
            contextIsolation: false,
        },
    })
    if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
        win.loadURL(url).then()
        // Open devTool if the app is not packaged
        win.webContents.openDevTools()
    } else {
        win.loadFile(indexHtml).then()
    }

    // Test actively push message to the Electron-Renderer
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', new Date().toLocaleString())
    })

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({url}) => {
        if (url.startsWith('https:')) shell.openExternal(url)
        return {action: 'deny'}
    })
    // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    win = null
    if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
    if (win) {
        // Focus on the main window if the user tried to open another
        if (win.isMinimized()) win.restore()
        win.focus()
    }
})

app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length) {
        allWindows[0].focus()
    } else {
        createWindow().then()
    }
})


// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
    const childWindow = new BrowserWindow({
        webPreferences: {
            preload,
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    if (process.env.VITE_DEV_SERVER_URL) {
        childWindow.loadURL(`${url}#${arg}`).then()
    } else {
        childWindow.loadFile(indexHtml, {hash: arg}).then()
    }
})

export {
    APP_DATA,
    APP_NAME
}

import('../datasource/datasource')

import("../server/server")

import { AMQPClient } from '@cloudamqp/amqp-client'
// const rabbitEntity = new RabbitEntity();
// rabbitEntity.name = "dev"
// rabbitEntity.host = "127.0.0.1"
// rabbitEntity.port = 5672
// rabbitEntity.username = 'admin'
// rabbitEntity.password = '123456'
// async function run() {
//     try {
//         const amqp = new AMQPClient(rabbitEntity.url)
//         const conn = await amqp.connect()
//         const ch = await conn.channel()
//         const q = await ch.queue("hello")
//         const consumer = await q.subscribe({noAck: true}, async (msg) => {
//             console.log(msg.bodyToString())
//             await consumer.cancel()
//         })
//         await q.publish("Hello World", {deliveryMode: 2})
//         await consumer.wait() // will block until consumer is canceled or throw an error if server closed channel/connection
//         await conn.close()
//     } catch (e) {
//         console.error("ERROR", e)
//         e.connection.close()
//         setTimeout(run, 1000) // will try to reconnect in 1s
//     }
// }
//
// run()
