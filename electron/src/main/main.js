import { app } from 'electron'
import App from './app.js'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let main

function createWindow () {
  main = new App()
}

app.on('ready', createWindow)

app.on('activate', () => {
  if (main === null) createWindow()
})
