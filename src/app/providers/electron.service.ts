import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, remote } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as notifier from 'node-notifier';

@Injectable()
export class ElectronService {

  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;
  path: typeof path;
  notifier: typeof notifier;
  appID = 'me.glycoproteo.swathlib';
  appName = 'SWATHLib';

  constructor() {
    // Conditional imports
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      this.path = window.require('path');
        this.notifier = window.require('node-notifier');
    }
  }

  isElectron = () => {
    return window && window.process && window.process.type;
  };

  notify(options) {
      options.appId = this.appID;
      options.appName = this.appName;
      this.notifier.notify(options)
  }
}
