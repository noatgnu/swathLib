import { Component, OnInit } from '@angular/core';
import {SwathLibHelperService} from "../../helper/swath-lib-helper.service";
import {FastaFileService} from "../../helper/fasta-file.service";
import {Observable} from "rxjs";
import {FastaFile} from "../../helper/fasta-file";
import {Protein} from "../../helper/protein";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  fasta: Observable<FastaFile>;
  constructor(private helper: SwathLibHelperService, private fastaFile: FastaFileService) {
    this.fasta = this.fastaFile.fastaFileReader;
  }

  ngOnInit() {
  }

  SelectSidebar(n: number) {
    this.helper.selectSidebar(n);
  }

  SelectPeptide(p: Protein) {
    this.helper.updateProtein(p);
    this.SelectSidebar(4);
  }
}
