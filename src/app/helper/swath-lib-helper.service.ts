import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {AARule, DigestRule} from './digest-rule';
import {Form, FormGroup} from "@angular/forms";
import {Protein} from "./protein";

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
  private _selectedProtein = new BehaviorSubject<Protein>(null);
  selectedProtein = this._selectedProtein.asObservable();
  constructor() { }

  AddMap(id) {
    const changeSource = new Subject<boolean>();
    const selectedSource = new Subject<number[]>();
    this.SequenceMap.set(id, {change: changeSource, selected: selectedSource});
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
    this._generalQueryForm.next(data);
  }

  updateProtein(data: Protein) {
    this._selectedProtein.next(data);
  }
}
