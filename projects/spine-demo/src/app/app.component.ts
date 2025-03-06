import {AfterViewInit, Component, ElementRef, viewChild} from '@angular/core';
import {SpinePlayer} from '@esotericsoftware/spine-player';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: 'app.component.html',
  styles: [],
})
export class AppComponent implements AfterViewInit {
  public spine_test_ref = viewChild.required<ElementRef<HTMLDivElement>>('spine_test');

  ngAfterViewInit() {
    new SpinePlayer(this.spine_test_ref()!.nativeElement, {
      skeleton: "/assets/spine/spineboy/spineboy-pro.json",
      atlas: "/assets/spine/spineboy/spineboy-pma.atlas",
      preserveDrawingBuffer: true
    });
  }
}
