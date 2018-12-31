import { Component, OnInit } from '@angular/core';
import {SwathLibHelperService} from "../../helper/swath-lib-helper.service";
import {FastaFileService} from "../../helper/fasta-file.service";
import {Observable} from "rxjs";
import {FastaFile} from "../../helper/fasta-file";
import {Protein} from "../../helper/protein";
import {SwathQuery} from "../../helper/swath-query";
import {ElectronService} from "../../providers/electron.service";
import {AnnoucementService} from "../../helper/annoucement.service";
import {SwathResultService} from "../../helper/swath-result.service";
import {FileService} from "../../providers/file.service";
import {FileHandlerService} from "../../helper/file-handler.service";
import * as TextEncoding from 'text-encoding';

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

  constructor(private helper: SwathLibHelperService, private fastaFile: FastaFileService, private electron: ElectronService,
              private anSer: AnnoucementService, private srs: SwathResultService, private fileService: FileService,
              private _fh: FileHandlerService) {
    this.fasta = this.fastaFile.fastaFileReader;
  }

  ngOnInit() {
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
    this.selected.push(this.helper.queryMap.get(p.unique_id));
  }

  SendQueries() {
    this.finished = false;
    this.collectTrigger = true;
    this.queryCollection = [];
    this.resultCollection = [];
    this.anSer.Announce('Queries submitted. Waiting for processing...');
    this.srs.UpdateSendTrigger(true);
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
