import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as child_process from 'child_process';
import {Backend} from "./src/app/helper/backend";
import {ConnectorUrl} from "./src/app/helper/connector-url";

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');
let backend: Backend[] = [new Backend('python', "9000", false, new ConnectorUrl('http://10.89.221.27:9000', false))];
let localBackend: Backend[] = [];
function navWin(route) {
  win.webContents.send('nav', route);
}

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    /*win.loadURL(url.format({
      pathname: path.join(__dirname, `dist/index.html#swathlib`),
      protocol: 'file:',
      slashes: true
    }));*/
    win.loadURL('file://' + __dirname + '/dist/index.html');
  }

  // win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }

  });

  app.on("quit", () => {
      console.log('App Exiting.');
      for (const p of localBackend) {
          if (p.process) {
              const promise = p.process.kill();
          }
      }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  ipcMain.on('backend-start', function (event, arg) {
      if (!arg.status) {
          const programPath = path.resolve(__dirname, 'backend', 'main.web.py');
          console.log(arg);
          arg.process = child_process.spawn(arg.pythonPath, ["-u", programPath, "-p", arg.port],{shell: true, detached: true});
          arg.url = 'http://localhost:' + arg.port;
          localBackend.push(arg);
          arg.process.on('close', () => {
              event.sender.send('backend-close', arg);
          });
      }
  });

    ipcMain.on('backend-update', (event, args) => {
        backend = args;
    });

    ipcMain.on('backend-get', (event, args) => {
       event.sender.send('reply-backend-get', backend);
    });

} catch (e) {
  // Catch Error
  // throw e;
}
