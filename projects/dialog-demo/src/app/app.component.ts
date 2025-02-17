import {AfterViewInit, Component, ElementRef, viewChild} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="dialog.showModal()">show dialog</button>
    <dialog #dialog>I am a dialog that you cannot close</dialog>
  `,
  styles: [
    `dialog {
      border: 2px solid white;
      border-radius: 1rem;
      display: none;
      color: white;
      background: rgba(0, 0, 0, 0.3);
      max-width: 600px;
      margin: auto;
      text-align: center;
      padding: 9rem 2rem;

      &[open] {
        display: initial;
      }

      &::backdrop {
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        -moz-backdrop-filter: blur(5px);
        -ms-backdrop-filter: blur(5px);
      }
    }`
  ],
})
export class AppComponent implements AfterViewInit{

  private dialog_element_ref = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  ngAfterViewInit(): void {
    this.dialog_element_ref()?.nativeElement.addEventListener('close', ($event) => this.prevent_closing($event))
    this.dialog_element_ref()?.nativeElement.addEventListener('cancel', ($event) => this.prevent_closing($event));
  }

  public prevent_closing($event: Event) {
    $event.preventDefault();
    this.dialog_element_ref()?.nativeElement.showModal();
  }
}
