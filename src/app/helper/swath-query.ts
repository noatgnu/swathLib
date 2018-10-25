import {Protein} from './protein';
import {Modification} from './modification';
import {SwathWindows} from './swath-windows';
import {Oxonium} from './oxonium';
import {SeqCoordinate} from './seq-coordinate';

export class SwathQuery {
  get oxonium_only(): boolean {
    return this._oxonium_only;
  }

  set oxonium_only(value: boolean) {
    this._oxonium_only = value;
  }
  get by_run(): boolean {
    return this._by_run;
  }

  set by_run(value: boolean) {
    this._by_run = value;
  }
  constructor(protein: Protein, modifications: Modification[], windows: SwathWindows[], rt: Array<number>, extra: number, charge: number, precursor_charge: number, conflict: SeqCoordinate[]) {
    this._protein = protein;
    this._modifications = modifications;
    this._windows = windows;
    this._rt = rt;
    this._extra = extra;
    this._charge = charge;
    this._precursor_charge = precursor_charge;
    this._conflict = conflict;

  }
  get conflict(): SeqCoordinate[] {
    return this._conflict;
  }

  set conflict(value: SeqCoordinate[]) {
    this._conflict = value;
  }
  get variable_format(): string {
    return this._variable_format;
  }

  set variable_format(value: string) {
    this._variable_format = value;
  }
  get b_stop_at(): number {
    return this._b_stop_at;
  }

  set b_stop_at(value: number) {
    this._b_stop_at = value;
  }
  get y_stop_at(): number {
    return this._y_stop_at;
  }

  set y_stop_at(value: number) {
    this._y_stop_at = value;
  }
  get oxonium(): Oxonium[] {
    return this._oxonium;
  }

  set oxonium(value: Oxonium[]) {
    const newOxonium = [];
    if (value) {
      for (const o of value) {
        /*if (this.modifications.length > 0) {
          for (const m of this.modifications) {
            if (o.dependencies.includes(m.name)) {
              if (!newOxonium.includes(o)) {
                newOxonium.push(o);
              }
              break;
            }
          }
        }*/
        newOxonium.push(o);
      }
      if (newOxonium.length > 0) {
        this._oxonium = newOxonium;
      }
    }
  }


  get precursor_charge(): number {
    return this._precursor_charge;
  }

  set precursor_charge(value: number) {
    this._precursor_charge = value;
  }

  get extra(): number {
    return this._extra;
  }

  set extra(value: number) {
    this._extra = value;
  }

  get windows(): SwathWindows[] {
    return this._windows;
  }

  set windows(value: SwathWindows[]) {
    this._windows = value;
  }

  get rt(): Array<number> {
    return this._rt;
  }

  set rt(value: Array<number>) {
    this._rt = value;
  }

  get protein(): Protein {
    return this._protein;
  }

  set protein(value: Protein) {
    this._protein = value;
  }

  get modifications(): Modification[] {
    return this._modifications;
  }

  set modifications(value: Modification[]) {
    this._modifications = value;
  }

  get charge(): number {
    return this._charge;
  }

  set charge(value: number) {
    this._charge = value;
  }

  private _protein: Protein;
  private _modifications: Modification[];
  private _windows: SwathWindows[];
  private _rt: Array<number>;
  private _extra: number;
  private _charge: number;
  private _precursor_charge: number;
  private _b_stop_at: number;
  private _y_stop_at: number;
  private _variable_format: string;
  private _oxonium: Oxonium[];
  private _conflict: SeqCoordinate[];
  private _by_run: boolean;
  private _oxonium_only: boolean;
}
