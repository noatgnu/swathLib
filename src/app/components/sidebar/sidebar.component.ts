import { Component, OnInit } from '@angular/core';
import {SwathLibHelperService} from "../../helper/swath-lib-helper.service";
import {FastaFileService} from "../../helper/fasta-file.service";
import {Observable, Subscription} from "rxjs";
import {FastaFile} from "../../helper/fasta-file";
import {Protein} from "../../helper/protein";
import {SwathQuery} from "../../helper/swath-query";
import {ElectronService} from "../../providers/electron.service";
import {AnnoucementService} from "../../helper/annoucement.service";
import {SwathResultService} from "../../helper/swath-result.service";
import {FileService} from "../../providers/file.service";
import {FileHandlerService} from "../../helper/file-handler.service";
import * as TextEncoding from 'text-encoding';
import {DataStore} from "../../helper/data-row";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  fasta: Observable<FastaFile>;
  selected: SwathQuery[] = [];
  maxQueryListHeight: number;
  finished = false;
  collectTrigger = false;
  queryCollection = [];
  resultCollection = [];
  outputSubscription: Subscription;
  resultReader: Observable<DataStore>;
  acceptedProtein = [];
  finishedTime;
  errSub: Subscription;
  constructor(private helper: SwathLibHelperService, private fastaFile: FastaFileService, private electron: ElectronService,
              private anSer: AnnoucementService, private srs: SwathResultService, private fileService: FileService,
              private _fh: FileHandlerService) {
    this.fasta = this.fastaFile.fastaFileReader;
    this.resultReader = srs.OutputReader;
  }

  ngOnInit() {
    this.errSub = this.anSer.errorReader.subscribe((data) => {
      if (data) {
        this.anSer.Announce('Error.');
        this.collectTrigger = false;
      }
    });
    this.outputSubscription = this.resultReader.subscribe((data) => {
      if (this.collectTrigger) {
        this.resultCollection.push(data);
        this.anSer.Announce(`Processed ${this.resultCollection.length} of ${this.acceptedProtein.length}`);
        if (this.resultCollection.length === this.acceptedProtein.length) {
          this.finishedTime = this.getCurrentDate();
          this.finished = true;
          this.collectTrigger = false;
          this.anSer.Announce('All results have been collected.');
        }
      }
    });
  }

  getCurrentDate() {
    return Date.now();
  }



  SelectSidebar(n: number) {
    this.helper.selectSidebar(n);
  }

  SelectPeptide(p: Protein) {
    this.helper.updateProtein(p);

  }

  SelectQuery() {
    this.helper.updateSelectedQueries(this.selected);
    console.log(this.selected);
    this.SelectSidebar(4);
  }

  clearSelection() {
    this.selected = [];
  }

  selectSeq(p: Protein) {
    const ind = this.selected.indexOf(this.helper.queryMap.get(p.unique_id));
    if ( ind > -1) {
      this.selected.splice(ind, 1);
    } else {
      this.selected.push(this.helper.queryMap.get(p.unique_id));
    }
  }

  SendQueries() {
    this.finished = false;
    this.collectTrigger = true;
    this.queryCollection = [];
    this.resultCollection = [];
    this.anSer.Announce('Queries submitted. Waiting for processing...');
    //this.srs.UpdateSendTrigger(true);
    this.acceptedProtein = Array.from(this.helper.queryMap.values());
    for (const a of this.acceptedProtein) {
      a.progressStage = 'info';
      a.sent = false;
      a.progress = 0;
      a.sent = true;
      console.log("Query sent for" + a.protein.unique_id);
      a.progress = 20;
      a.progress = 40;
      this.srs.SendQuery(a).subscribe((response) => {
        a.progress = 60;
        const df = new DataStore(response.body['data'], true, '');
        a.progress = 80;
        this.srs.UpdateOutput(df);
        a.progress = 100;
        a.progressStage = 'success';
        }, (error) => {
        a.progressStage = 'error';
        this.anSer.AnnounceError(true);
        if (error.error instanceof ErrorEvent) {
          console.error(error.error.message);

        } else {
          console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
        }
      });

    }
  }

  downloadFile(filename: string) {
    let count = 0;
    if (window.location.protocol === 'file:') {
      this.anSer.Announce('Saving...');
      const picked = this.fileService.save('txt');
      const fileWriter = this.electron.fs.createWriteStream(picked);
      let writeHeader = false;
      for (const r of this.resultCollection) {
        count++;
        if (r.header !== undefined) {
          if (writeHeader === false) {
            fileWriter.write(r.header.join('\t') + '\n');
            writeHeader = true;
          }
          if (r.data.constructor === Array) {
            if (r.data.length > 0) {
              for (const row of r.data) {
                if (row.row !== undefined) {
                  fileWriter.write(row.row.join('\t') + '\n');
                }
              }
            }
          }
        }
      }
      fileWriter.end();
    } else if (this._fh.checkSaveStreamSupport()) {
      this.anSer.Announce('Starting stream.');
      const fileStream = this._fh.createSaveStream(`${filename}_library.txt`);
      const writer = fileStream.getWriter();
      const encoder = new TextEncoding.TextEncoder;
      let writeHeader = false;
      for (const r of this.resultCollection) {
        count++;
        if (r.header !== undefined) {
          if (writeHeader === false) {
            const uint8array = encoder.encode(r.header.join('\t') + '\n');
            writer.write(uint8array);
            writeHeader = true;
          }
          if (r.data.constructor === Array) {
            if (r.data.length > 0) {
              for (const row of r.data) {
                if (row.row !== undefined) {
                  const uint8array = encoder.encode(row.row.join('\t') + '\n');
                  writer.write(uint8array);
                }
              }
            }
          }
        }
      }
      writer.close();
    }
    this.anSer.Announce('Finished.');
  }
}
