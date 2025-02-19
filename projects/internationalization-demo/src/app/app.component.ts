import {Component, Inject, LOCALE_ID} from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  template: `
    <h1>Welcome to {{title}}!</h1>
    <p i18n>Hello world!</p>
  `,
  styles: [],
})
export class AppComponent {
  title = 'internationalization-demo';

  constructor(@Inject(LOCALE_ID) public locale: string) {
    console.log("Current Locale:", this.locale); // Check the locale
  }
}
