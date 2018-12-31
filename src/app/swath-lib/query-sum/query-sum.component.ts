import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Protein} from "../../helper/protein";
import {SwathQuery} from "../../helper/swath-query";
import {SwathLibHelperService} from "../../helper/swath-lib-helper.service";
import {Modification} from "../../helper/modification";
import {Subscription} from "rxjs";
import {FormGroup} from "@angular/forms";
import {SwathResultService} from "../../helper/swath-result.service";
import {AnnoucementService} from "../../helper/annoucement.service";
import {DataStore} from "../../helper/data-row";

@Component({
  selector: 'app-query-sum',
  templateUrl: './query-sum.component.html',
  styleUrls: ['./query-sum.component.scss']
})
export class QuerySumComponent implements OnInit, OnDestroy {
  @Input() protein: Protein;
  @Output() outQuery = new EventEmitter<SwathQuery>();
  query: SwathQuery;
  formSub: Subscription;
  form: FormGroup;
  SendTriggerSub: Subscription;
  progress;
  progressStage;
  sent;

  constructor(private libHelper: SwathLibHelperService,
              private srs: SwathResultService,
              private ans: AnnoucementService,) {

  }

  ngOnInit() {
    this.formSub = this.libHelper.generalQueryFormObs.subscribe((data)=>{
      this.form = data;
      if (this.form) {
        if (this.protein) {
          if (!this.libHelper.SequenceMap.has(this.protein.unique_id)) {

          }
          this.libHelper.AddMap(this.protein.unique_id);
          if (!this.libHelper.queryMap.has(this.protein.unique_id)) {

          }
          this.query = this.createQuery(this.protein, [], this.form.value['windows'], this.form.value['rt'],
            this.form.value['extra-mass'], this.form.value['max-charge'], this.form.value['precursor-charge'],
            -1, -1, this.form.value['variable-bracket-format'], //this.extraForm.value['oxonium'],
            null, null, false, false, [], []
          );
          console.log("Update query of " + this.protein.unique_id);
          this.libHelper.queryMap.set(this.protein.unique_id, this.query);
        }
      }
    });

    this.SendTriggerSub = this.srs.sendTriggerReader.subscribe((data) => {
      this.progressStage = 'info';
      this.sent = false;
      this.progress = 0;
      if (data) {
        this.sent = true;
        this.progress = 20;
        this.progress = 40;

        this.srs.SendQuery(this.query).subscribe((response) => {
          this.progress = 60;
          const df = new DataStore(response.body['data'], true, '');
          this.progress = 80;
          this.srs.UpdateOutput(df);
          this.progress = 100;
          this.progressStage = 'success';
        }, (error) => {
          this.progressStage = 'error';
          this.ans.AnnounceError(true);
          if (error.error instanceof ErrorEvent) {
            console.error(error.error.message);

          } else {
            console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
          }
        });

      }
    });
  }

  ngOnDestroy(): void {
    this.formSub.unsubscribe();
    if (this.protein) {
      this.libHelper.SequenceMap.delete(this.protein.unique_id);
      this.libHelper.queryMap.delete(this.protein.unique_id);
    }
  }

  createQuery(protein, modSummary, windows, rt, extramass, maxcharge, precursorcharge, b_stop_at, y_stop_at,
                      variableformat, oxonium, conflict, by_run, oxonium_only, b_selected, y_selected) {
    const query = new SwathQuery(protein, modSummary, windows, rt, extramass, maxcharge, precursorcharge, conflict);
    query.b_stop_at = b_stop_at;
    query.y_stop_at = y_stop_at;
    query.by_run = by_run;
    query.variable_format = variableformat;
    query.oxonium = oxonium;
    query.oxonium_only = oxonium_only;
    query.b_selected = b_selected;
    query.y_selected = y_selected;
    query.libHelper = this.libHelper;
    query.modMap = new Map();
    query.form = this.form;
    query.seqCoord = [];
    query.decorSeq();
    if (query.form.value['ion-type']) {
      query.protein.ion_type = query.form.value['ion-type'].join().replace(/,/g, '');
    } else {
      query.protein.ion_type = '';
    }
    console.log(query);
    return query;
  }


}
