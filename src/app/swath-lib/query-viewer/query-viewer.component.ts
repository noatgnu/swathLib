import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SwathLibHelperService} from "../../helper/swath-lib-helper.service";
import {Observable, Subscription} from "rxjs";
import {FormGroup} from "@angular/forms";
import {Protein} from "../../helper/protein";

@Component({
  selector: 'app-query-viewer',
  templateUrl: './query-viewer.component.html',
  styleUrls: ['./query-viewer.component.scss']
})
export class QueryViewerComponent implements OnInit, OnDestroy {
  protein: Observable<Protein>;
  formSub: Subscription;
  form: FormGroup;

  constructor(private helper: SwathLibHelperService) {
    this.protein = this.helper.selectedProtein;
  }

  ngOnInit() {
    this.formSub = this.helper.generalQueryFormObs.subscribe((data) => {
      this.form = data;
    });

  }

  ngOnDestroy(): void {
    this.formSub.unsubscribe();
  }
}
