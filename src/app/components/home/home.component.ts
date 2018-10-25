import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {ElectronService} from '../../providers/electron.service';
import {TranslateService} from '@ngx-translate/core';
import {AnnoucementService} from '../../helper/annoucement.service';
import {ConnectorService} from '../../helper/connector.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  annoucement: Observable<string>;
  collapsed = true;
  serverStatus: Observable<boolean>;

  constructor(public electronService: ElectronService,
              private translate: TranslateService, private anServ: AnnoucementService, private connector: ConnectorService) {
    this.annoucement = this.anServ.annoucementReader;
  }

  ngOnInit() {
    
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  OpenConnectorModal() {
    const BrowserWindow = this.electronService.remote.BrowserWindow;
    const win = new BrowserWindow({
      width: 500,
      height: 250,
      center: true,
      resizable: false,
      frame: true,
      transparent: false,
    });
    win.loadURL(`file://${__dirname}/index.html#/` + 'connector');
  }
}
