import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {AARule, DigestRule} from './digest-rule';
import {FormGroup} from "@angular/forms";
import {Protein} from "./protein";
import {SwathQuery} from "./swath-query";

@Injectable({
  providedIn: 'root'
})
export class SwathLibHelperService {
  private _changeSource = new Subject<boolean>();
  changeObservable = this._changeSource.asObservable();
  private _selectedSource = new Subject<number[]>();
  selectedObservable = this._selectedSource.asObservable();
  SequenceMap: Map<string, any> = new Map();
  regexFilter = [{name: 'N-Glycosylation', pattern: /N[^XP][S|T]/, offset: 2}];
  private _selectSidebar = new BehaviorSubject<number>(1);
  selectSidebarObservable = this._selectSidebar.asObservable();
  private _rtSource = new Subject<number[]>();
  rtObservable = this._rtSource.asObservable();
  private _generalQueryForm = new BehaviorSubject<FormGroup>(null);
  generalQueryFormObs = this._generalQueryForm.asObservable();
  private _selectedQueries = new BehaviorSubject<SwathQuery[]>(null);
  selectedQueries = this._selectedQueries.asObservable();
  private _selectedProtein = new BehaviorSubject<Protein>(null);
  selectedProtein = this._selectedProtein.asObservable();
  queryMap = new Map<string, SwathQuery>();

  constructor() { }

  AddMap(id) {
    const changeSource = new Subject<boolean>();
    const selectedSource = new Subject<number[]>();
    this.SequenceMap.set(id, {change: changeSource, selected: selectedSource});
    console.log(this.SequenceMap);
  }
  Selected(id, data) {
    this.SequenceMap.get(id).selected.next(data);
  }

  Change(id, data) {
    this.SequenceMap.get(id).change.next(data);
  }

  permutations(inputArr) {
    let result = [];
    result = this.permutate(inputArr.slice(), [], result);
    return result;
  }

  permutate(arr, m, result) {
    if (arr.length === 0) {
      const a = JSON.stringify(m);
      if (!result.includes(a)) {
        result.push(a);
      }
    } else {
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice();
        const next = curr.splice(i, 1);

        result = this.permutate(curr.slice(), m.concat(next), result);
      }
    }
    return result;
  }

  mapDigestRule(digestRules: DigestRule) {
    const m = new Map<string, AARule>();
    if (digestRules['rules'].length > 0) {
      for (const r of digestRules.rules) {
        m.set(r.aa, r);
      }
    }
    return m;
  }

  selectSidebar(n: number) {
    console.log("Switching to "+n);
    this._selectSidebar.next(n);
  }

  updateRT(data: number[]) {
    this._rtSource.next(data);
  }

  updateForm(data: FormGroup) {
    console.log(data);
    this._generalQueryForm.next(data);
  }

  updateProtein(data: Protein) {
    console.log("Selected " + data.unique_id);
    this._selectedProtein.next(data);
  }

  updateSelectedQueries(data) {
    this._selectedQueries.next(data);
  }
}
