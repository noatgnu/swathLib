import {Component, OnInit, Input, OnDestroy, ViewChild} from '@angular/core';
import {Protein} from '../../helper/protein';
import {SeqCoordinate} from '../../helper/seq-coordinate';
import {Modification} from '../../helper/modification';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {
  NgbDropdownConfig,
  NgbModal,
  NgbTooltipConfig,

  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import {SwathLibAssetService} from '../../helper/swath-lib-asset.service';
import {Observable} from 'rxjs';
import {SwathResultService} from '../../helper/swath-result.service';
import {SwathQuery} from '../../helper/swath-query';
import {Subscription} from 'rxjs';
import {DataStore} from '../../helper/data-row';
import {Oxonium} from '../../helper/oxonium';
import {AnnoucementService} from '../../helper/annoucement.service';
import {Subject} from 'rxjs';
import {SwathLibHelperService} from '../../helper/swath-lib-helper.service';

@Component({
  selector: 'app-sequence-selector',
  templateUrl: './sequence-selector.component.html',
  styleUrls: ['./sequence-selector.component.scss'],
  providers: [NgbTooltipConfig, NgbDropdownConfig]
})
export class SequenceSelectorComponent implements OnInit, OnDestroy {
  modalref: NgbModalRef;
  preMadeForm: FormGroup;
  addModForm: FormGroup;
  extraForm: FormGroup;
  staticMods: Observable<Modification[]>;
  variableMods: Observable<Modification[]>;
  Ymods: Observable<Modification[]>;
  oxonium: Observable<Oxonium[]>;
  sent: boolean;
  progress: number;
  b_selected = [];
  y_selected = [];
  b_stop_at = -1;
  y_stop_at = -1;
  progressStage = 'info';
  @ViewChild('coordEditor') coordEditor;

  get currentCoord(): SeqCoordinate {
    return this._currentCoord;
  }

  set currentCoord(value: SeqCoordinate) {
    this._currentCoord = value;
  }
  get modSummary(): Modification[] {
    return this._modSummary;
  }

  set modSummary(value: Modification[]) {
    this._modSummary = value;
  }
  get protein(): Protein {
    return this._protein;
  }
  @Input()
  set protein(value: Protein) {
    this._protein = value;
    if (this.form) {
      if (!this.libHelper.SequenceMap.has(this.protein.unique_id)) {
        this.libHelper.AddMap(this.protein.unique_id);
      }

      this.modMap = new Map<number, Modification[]>();
      this.seqCoord = [];
      this.decorSeq();
      this.createExtraForm();
      if (this._form.value['ion-type']) {
        this.protein.ion_type = this._form.value['ion-type'].join().replace(/,/g, '');
      } else {
        this.protein.ion_type = '';
      }
    }
  }

  get form(): FormGroup {
    return this._form;
  }
  @Input()
  set form(value: FormGroup) {
    this._form = value;
    if (this.protein) {
      if (!this.libHelper.SequenceMap.has(this.protein.unique_id)) {
        this.libHelper.AddMap(this.protein.unique_id);
      }

      this.modMap = new Map<number, Modification[]>();
      this.seqCoord = [];
      this.decorSeq();
      this.createExtraForm();
      if (this._form.value['ion-type']) {
        this.protein.ion_type = this._form.value['ion-type'].join().replace(/,/g, '');
      } else {
        this.protein.ion_type = '';
      }
    }

  }
  private _protein: Protein;
  private _form: FormGroup;

  seqCoord: SeqCoordinate[] = [];
  modMap: Map<number, Modification[]> = new Map<number, Modification[]>();
  private _modSummary: Modification[];
  SendTriggerSub: Subscription;
  sendTriggerRead: Observable<boolean>;
  conflict: Map<number, SeqCoordinate>;
  by_run = false;
  service;
  oxonium_only = false;
  constructor(private mod: SwathLibAssetService,
              tooltip: NgbTooltipConfig,
              dropdown: NgbDropdownConfig,
              private modalService: NgbModal,
              private fb: FormBuilder,
              private srs: SwathResultService,
              private ans: AnnoucementService,
              private libHelper: SwathLibHelperService) {
    this.staticMods = mod.staticMods;
    this.variableMods = mod.variableMods;
    this.Ymods = mod.YtypeMods;
    this.oxonium = mod.oxoniumReader;
    this.sendTriggerRead = this.srs.sendTriggerReader;
    tooltip.placement = 'top';
    tooltip.triggers = 'hover';

  }

  private _currentCoord: SeqCoordinate;

  ngOnInit() {

    console.log(this.libHelper.SequenceMap);
    this.createExtraForm();
    this.SendTriggerSub = this.sendTriggerRead.subscribe((data) => {
      this.progressStage = 'info';
      this.sent = false;
      this.progress = 0;
      if (data) {
        this.sent = true;
        this.progress = 20;
        const sm = this.summarize(this.seqCoord);
        this.modSummary = sm.modSummary;
        this.conflict = sm.conflict;

        this.progress = 40;
          const query = this.createQuery(this.protein, this.modSummary, this.form.value['windows'], this.form.value['rt'],
              this.form.value['extra-mass'], this.form.value['max-charge'], this.form.value['precursor-charge'],
              this.b_stop_at, this.y_stop_at, this.form.value['variable-bracket-format'], this.extraForm.value['oxonium'],
              Array.from(this.conflict.values()), this.by_run, this.oxonium_only, this.b_selected, this.y_selected
          );
        this.srs.SendQuery(query).subscribe((response) => {
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
        /*if (this.conflict !== undefined) {
          const conflictNum = Array.from(this.conflict.keys());
          if (conflictNum.length > 0) {
            const result = this.recursiveMods(conflictNum, this.conflict, true);
            for (const m of result) {
              const seqCoord = Object.create(this.seqCoord);
              for (const i of conflictNum) {
                seqCoord[conflictNum[i]] = Object.create(seqCoord[conflictNum[i]]);
                for (const key in seqCoord[conflictNum[i]]) {
                  seqCoord[conflictNum[i]][key] = seqCoord[conflictNum[i]][key];
                }
                seqCoord[conflictNum[i]].modType = m.get(conflictNum[i]).type;
                seqCoord[conflictNum[i]].mods = [m.get(conflictNum[i])];
              }
              const variant = this.summarize(seqCoord);
              const query = this.createQuery(this.protein, <Modification[]>variant[0], this.form.value['windows'], this.form.value['rt'],
                this.form.value['extra-mass'], this.form.value['max-charge'], this.form.value['precursor-charge'],
                this.b_stop_at, this.y_stop_at, this.form.value['variable-bracket-format'], this.extraForm.value['oxonium']
              );
              this.srs.SendQuery(query).subscribe((response) => {
                const df = new DataStore(response.body['data'], true, '');
              });
            }
          } else {
            const query = this.createQuery(this.protein, this.modSummary, this.form.value['windows'], this.form.value['rt'],
              this.form.value['extra-mass'], this.form.value['max-charge'], this.form.value['precursor-charge'],
              this.b_stop_at, this.y_stop_at, this.form.value['variable-bracket-format'], this.extraForm.value['oxonium']
            );
            this.srs.SendQuery(query).subscribe((response) => {
              this.progress = 60;
              const df = new DataStore(response.body['data'], true, '');
              this.progress = 80;
              this.srs.UpdateOutput(df);
              this.progress = 100;
            });
          }
        }*/
      }
    });
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

  recursiveMods(conflictKeys: Array<number>, conflictMap: Map<number, SeqCoordinate>, start: boolean, resolve?: Map<number, Modification>, key?: number, result?: Array<Map<number, Modification>>) {
    if (start) {
      resolve = new Map<number, Modification>();
      result = [];
    }
    for (const m of conflictMap.get(conflictKeys[key]).mods) {
      resolve.set(conflictMap.get(conflictKeys[key]).coordinate, m);
      if (key + 1 >= conflictKeys.length) {
        result = this.recursiveMods(conflictKeys, conflictMap, false, Object.create(resolve), key + 1, result);
      } else {
        result.push(resolve);
      }
    }
    return result;
  }

  ngOnDestroy() {
    this.SendTriggerSub.unsubscribe();
  }

  decorSeq() {
    if (this.form.value['static'] !== null || this.form.value['variable'] !== null || this.form.value['ytype'] !== null) {
      this.applyModification(this.protein);
    }
    this.transformSequence(this.protein);
  }

  transformSequence(protein: Protein) {
    this.modSummary = [];
    this.seqCoord = [];
    for (let i = 0; i < protein.sequence.length; i++) {
      const s = new SeqCoordinate(protein.sequence[i], i, '', []);
      this.setMod(i, s);
      this.seqCoord.push(s);
    }

    const sm = this.summarize(this.seqCoord);
    this.modSummary = sm.modSummary;
    this.conflict = sm.conflict;
  }

  private setMod(i: number, s: SeqCoordinate) {
    if (this.modMap !== undefined) {
      if (this.modMap.has(i)) {
        for (const m of this.modMap.get(i)) {
          this.appendMod(s, m);
        }
      }
    }
  }

  private appendMod(s, m) {
    if (s.modType !== m.type) {

      if (s.modType !== '') {
        s.modType = 'conflicted';
      } else {
        s.modType = m.type;
      }
    } else {
      if (s.modType !== 'Ytype') {
        s.modType = 'conflicted';
      }
    }
    s.mods.push(m);
  }

  applyModification(protein: Protein) {
    this.modifySeq(protein, 'static');
    this.modifySeq(protein, 'variable');
    this.modifySeq(protein, 'ytype');
  }

  private modifySeq(f, modCat) {
    if (this.form.value[modCat] !== null) {
      for (const m of this.form.value[modCat]) {
        const reg = new RegExp(m.regex, 'g');
        let seq = f.sequence;
        if (f.metadata !== undefined) {
          if (m.offset !== 0) {
            if (f.metadata.originalEnd + m.offset <= f.metadata.original.sequence.length) {
              seq = f.metadata.original.sequence.slice(f.metadata.originalStart, f.metadata.originalEnd + m.offset);
            }
          }
        }
        let match = reg.exec(seq);
        while (match != null) {
          const newMod = Object.create(m);
          for (const key in newMod) {
            newMod[key] = newMod[key];
          }
          if (this.modMap.has(match.index)) {
            const mM = this.modMap.get(match.index);
            mM.push(newMod);

            this.modMap.set(match.index, mM);
          } else {
            const n = [];
            n.push(newMod);
            this.modMap.set(match.index, n);
          }
          match = reg.exec(seq);
        }
      }
    }
  }

  summarize(seqCoord: SeqCoordinate[]) {
    const modSummary = [];
    const conflict = new Map<number, SeqCoordinate>();
    const summaryMap = new Map<string, number>();

    let count = 0;
    for (const i of seqCoord) {
      if (i.mods.length > 0) {
        if (i.modType === 'conflicted') {
          conflict.set(i.coordinate, i);
        }
        for (const m of i.mods) {
          if (summaryMap.has(m.name + m.Ytype)) {
            const sumIndex = summaryMap.get(m.name + m.Ytype);
            modSummary[sumIndex].positions.push(i.coordinate);
          } else {
            const newMod = Object.create(m);
            for (const key in newMod) {
              newMod[key] = newMod[key];
            }
            modSummary.push(newMod);
            modSummary[count].positions = [];
            modSummary[count].positions.push(i.coordinate);
            if (m.status !== false) {
              modSummary[count].status = m.status;
            }
            summaryMap.set(m.name + m.Ytype, count);
            count ++;
          }
        }
      }
    }
    this.libHelper.Change(this.protein.unique_id, true);
    return {modSummary, conflict};
  }

  selectCoordinates(coordinates: number[]) {
    /*for (const c of coordinates) {
      const el = this.getElement(this.protein.unique_id + c);
      el.click();
    }*/
    console.log(coordinates);
    this.libHelper.Selected(this.protein.unique_id, coordinates);
  }

  getElement(id) {
    return document.getElementById(id);
  }

  clickEvent(t) {
    if (!t.isOpen()) {
      t.toggle();
    }
  }

  contextClick(c) {
    c.open();
    return false;
  }

  openEditModal(modal, position) {
    this.currentCoord = this.seqCoord[position];
    this.modalService.open(modal);
  }

  openProteinEditor(modal) {
    this.modalref = this.modalService.open(modal);
  }

  createForm(position, aa) {
    this.addModForm = this.fb.group({
      'name': ['', Validators.required],
      'mass': [0, Validators.required],
      'regex': aa,
      'multiple_pattern': false,
      'label': [],
      'type': 'static',
      'Ytype': [],
      'status': false,
      'auto_allocation': 'FALSE',
      'positions': [],
      'display_label': ''
    });
  }

  createExtraForm() {
    console.log(this.form.value['oxonium']);
    if (this.form.value['oxonium']) {
      if (this.form.value['oxonium'].length > 0) {
        this.extraForm = this.fb.group({
          'name': '',
          'oxonium': Object.create(this.form.value['oxonium'])
        });
      } else {
        this.extraForm = this.fb.group({
          'name': '',
          'oxonium': []
        });
      }
    } else {
      this.extraForm = this.fb.group({
        'name': '',
        'oxonium': []
      });
    }

  }

  createFormPremade() {
    this.preMadeForm = this.fb.group({
      'static': [],
      'variable': [],
      'ytype': []
    });
  }

  addToCurrent(c) {
    if (c === 'premade') {
      this.helperPremade('static');
      this.helperPremade('variable');
      this.helperPremade('ytype');
    } else {
      this.appendMod(this.currentCoord,
        new Modification(
          [this.currentCoord.coordinate],
          this.addModForm.value['status'],
          this.addModForm.value['multiple_pattern'],
          this.addModForm.value['Ytype'],
          this.addModForm.value['auto_allocation'],
          this.addModForm.value['type'],
          this.addModForm.value['mass'],
          this.addModForm.value['regex'],
          this.addModForm.value['label'],
          this.addModForm.value['name'],
          this.addModForm.value['display_label'],
          0
          ));
    }

    const sm = this.summarize(this.seqCoord);
    this.modSummary = sm.modSummary;
    this.conflict = sm.conflict;
  }

  private helperPremade(m) {
    if (this.preMadeForm.value[m] !== null) {
      for (const c of this.preMadeForm.value[m]) {
        this.appendMod(this.currentCoord, Object.create(c));
      }
    }
  }

  changeStatus(t, m) {
    if (t.checked) {
      for (const k of m.positions) {
        for (const m2 of this.seqCoord[k].mods) {
          if ((m.name + m.Ytype) === (m2.name + m2.Ytype)) {
            console.log(this.protein.id);
            m2.status = true;
          }
        }
      }
      m.status = true;
    } else {
      for (const k of m.positions) {
        for (const m2 of this.seqCoord[k].mods) {
          if ((m.name + m.Ytype) === (m2.name + m2.Ytype)) {
            m2.status = false;
          }
        }
      }
      m.status = false;
    }
  }

  changePattern(t, m) {
    if (t.checked) {
      for (const k of m.positions) {
        for (const m2 of this.seqCoord[k].mods) {
          if ((m.name + m.Ytype) === (m2.name + m2.Ytype)) {
            m2.multiple_pattern = true;
          }
        }
      }
      m.multiple_pattern = true;
    } else {
      for (const k of m.positions) {
        for (const m2 of this.seqCoord[k].mods) {
          if ((m.name + m.Ytype) === (m2.name + m2.Ytype)) {
            m2.multiple_pattern = false;
          }
        }
      }
      m.multiple_pattern = false;
    }
  }

  removeModification(m) {
    m.forErase = true;
    let ind = -1;
    for (let i = 0; i < this.currentCoord.mods.length; i++) {
      if (this.currentCoord.mods[i].forErase) {
        ind = i;
        break;
      }
    }
    if (ind !== -1) {
      this.currentCoord.mods.splice(ind, 1);
      let temp = '';
      for (const mod of this.currentCoord.mods) {
        if (temp === '') {
          temp = mod.type;
        } else {
          if (temp === mod.type) {
            if (temp !== 'Ytype') {
              temp = 'conflicted';
              break;
            }
          } else {
            temp = 'conflicted';
            break;
          }
        }
      }
      this.currentCoord.modType = temp;
      const sm = this.summarize(this.seqCoord);
      this.modSummary = sm.modSummary;
      this.conflict = sm.conflict;
    }
  }

  clearModifications() {
    for (const s of this.seqCoord) {
      s.modType = undefined;
      s.mods = [];
    }
    const sm = this.summarize(this.seqCoord);
    this.modSummary = sm.modSummary;
    this.conflict = sm.conflict;
  }

  saveProtein() {
    this.protein.id = this.extraForm.value['name'];
    this.modalref.close();
  }

  trackbyCoord(index, item) {
    return item.coordinate;
  }

  eventHandler(event) {
    switch (event.event) {
      case 'edit':
        this.openEditModal(this.coordEditor, event.residue);
        break;
      case 'bstop':
        this.b_stop_at = event.residue;
        break;
        case 'ystop':
            this.y_stop_at = event.residue;
            break;
        case 'bselect':

            if (!this.b_selected.includes(event.residue)) {
                this.b_selected.push(event.residue);
            } else {
                const pos = this.b_selected.indexOf(event.residue);
                this.b_selected.splice(pos, 1);
            }
            break;
        case 'yselect':

            if (!this.y_selected.includes(event.residue)) {
                this.y_selected.push(event.residue);
            } else {
                const pos = this.y_selected.indexOf(event.residue);
                this.y_selected.splice(pos, 1);
            }
            break;
    }
    console.log(event);
  }
}
