import { Component, OnInit } from '@angular/core';
import {SwathLibHelperService} from "../../helper/swath-lib-helper.service";
import {FastaFileService} from "../../helper/fasta-file.service";
import {Observable} from "rxjs";
import {FastaFile} from "../../helper/fasta-file";
import {Protein} from "../../helper/protein";
import {SwathQuery} from "../../helper/swath-query";
import {ElectronService} from "../../providers/electron.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  fasta: Observable<FastaFile>;
  selected: SwathQuery[] = [];
  maxQueryListHeight: number;
  constructor(private helper: SwathLibHelperService, private fastaFile: FastaFileService, private electron: ElectronService) {
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
}
