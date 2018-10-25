import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs';
import {ConnectorUrl} from './connector-url';


@Injectable({
  providedIn: 'root'
})
export class ConnectorService {
  urls = [new ConnectorUrl('http://10.89.221.27:9000', false)];
  previousUrlIndex = -1;
  connectMap = new Map<string, boolean>();
  private connectorModal = new Subject<boolean>();
  connectorModalSignal = this.connectorModal.asObservable();
  constructor(private http: HttpClient) { }

  UpdateURLs(urls: ConnectorUrl[]) {
    this.urls = urls;
  }

  CheckURL(u: string) {
    console.log(u);
    return this.http.get(u + '/api/swathlib/upload/', {observe: 'response'});
  }

  SendModalSignal(data: boolean) {
    this.connectorModal.next(data);
  }

  GetURL(checkStatus: boolean = false) {
    let i = this.previousUrlIndex;
    while (i > -1 && i < this.urls.length) {
        i ++;
        if (checkStatus) {
          if (this.urls[i]) {
            this.previousUrlIndex = i;
            return this.urls[i];
          }
        } else {
          this.previousUrlIndex = i;
          return this.urls[i];
        }
    }
    this.previousUrlIndex = -1;
    return this.urls[0];
  }
}
