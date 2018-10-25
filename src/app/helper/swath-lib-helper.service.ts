import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import {AARule, DigestRule} from './digest-rule';

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
}
