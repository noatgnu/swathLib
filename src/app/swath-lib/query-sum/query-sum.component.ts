import {Component, Input, OnInit} from '@angular/core';
import {Protein} from "../../helper/protein";
import {SwathQuery} from "../../helper/swath-query";

@Component({
  selector: 'app-query-sum',
  templateUrl: './query-sum.component.html',
  styleUrls: ['./query-sum.component.scss']
})
export class QuerySumComponent implements OnInit {
  @Input() protein: Protein;
  constructor() { }

  ngOnInit() {
  }

  private createQuery(protein, modSummary, windows, rt, extramass, maxcharge, precursorcharge, b_stop_at, y_stop_at,
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
    return query;
  }


}
