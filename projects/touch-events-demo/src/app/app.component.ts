import {Component, HostListener} from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<h1>{{current_event}}</h1>',
  styles: [
    'h1 {position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%)}'
  ]
})
export class AppComponent {
  @HostListener('window:touchstart', ['$event'])
  @HostListener('window:touchend', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  @HostListener('window:touchcancel', ['$event'])
  onTouch(event: TouchEvent) {
    this.current_event = event.type;
  }

  public current_event = 'START TOUCHING'
}
