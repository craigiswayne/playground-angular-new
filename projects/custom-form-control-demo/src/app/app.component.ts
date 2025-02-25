import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {FormControlGenderComponent} from '../form-control-gender/form-control-gender.component';
import {KeyValuePipe, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: [],
  imports: [
    FormControlGenderComponent,
    ReactiveFormsModule,
    KeyValuePipe,
    NgForOf,
    NgIf
  ],
  standalone: true
})
export class AppComponent {
  private readonly formBuilder = inject(FormBuilder);
  public demoForm = this.formBuilder.group({
    firstName: [null, [Validators.required]],
    lastName: [null, [Validators.required]],
    gender: [null, [Validators.required]]
  });
}
