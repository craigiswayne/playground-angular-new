import {Component, HostListener} from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  template: `
    <h1>Welcome to {{title}}!</h1>
    <p>check the console</p>
    <p>https://www.digitalocean.com/community/tutorials/angular-binding-keyup-keydown-events</p>
    <p>https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values</p>

  `,
  styles: [],
})
export class AppComponent {
  title = 'spacebar-listener';
  @HostListener('document:keydown.space', ['$event'])
  onSpaceBar(event: KeyboardEvent) {
    console.log('spacebar pressed');
  }
}
