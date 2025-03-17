import {Injectable} from '@angular/core';
import GUI from 'lil-gui';

@Injectable({
  providedIn: 'root'
})
export class LilGuiService {
  public _gui: GUI | undefined;

  public get gui(): GUI {
    return this._gui ?? (this._gui = new GUI());
  }
}
