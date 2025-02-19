import {Component, HostListener} from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  template: `
    <h1>Welcome to {{title}}!</h1>
    <p>check the console</p>

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
