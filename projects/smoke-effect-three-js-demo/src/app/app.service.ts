import {Injectable, ElementRef} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppService {
  private canvas?: HTMLCanvasElement;
  constructor() {}

  public createScene(canvas_ref: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvas_ref.nativeElement;
  }
}
