import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {ElectronService} from '../../providers/electron.service';
import {TranslateService} from '@ngx-translate/core';
import {AnnoucementService} from '../../helper/annoucement.service';
import {ConnectorService} from '../../helper/connector.service';
import {SwathLibHelperService} from "../../helper/swath-lib-helper.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  annoucement: Observable<string>;
  collapsed = true;
  serverStatus: Observable<boolean>;
  sidebarSelect: Subscription;
  selected = 1;
  constructor(public electronService: ElectronService,
              private translate: TranslateService, private anServ: AnnoucementService, private connector: ConnectorService, private helper: SwathLibHelperService) {
    this.annoucement = this.anServ.annoucementReader;
  }

  ngOnInit() {
    this.sidebarSelect = this.helper.selectSidebarObservable.subscribe((data) => {
      this.selected = data;
    })
  }

  ngOnDestroy(): void {
    this.sidebarSelect.unsubscribe();
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  OpenConnectorModal() {
      this.electronService.ipcRenderer.send("window-open", {options:{width: 700, height: 500, center: true, frame: true, transparent: false}, url: `file://${__dirname}/index.html#/` + 'connector'});
/*    const BrowserWindow = this.electronService.remote.BrowserWindow;
    const win = new BrowserWindow({
      width: 700,
      height: 500,
      center: true,
      // resizable: false,
      frame: true,
      transparent: false,
    });
    win.loadURL(`file://${__dirname}/index.html#/` + 'connector');*/
  }

  updateRT(data) {
    this.helper.updateRT(data);
  }
}
