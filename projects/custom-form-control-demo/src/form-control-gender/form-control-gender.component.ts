import { Component } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type gender = 'male' | 'female' | 'n/a';

@Component({
  selector: 'app-form-control-gender',
  templateUrl: 'form-control-gender.component.html',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: FormControlGenderComponent
    }
  ]
})
export class FormControlGenderComponent implements ControlValueAccessor {

  onChange = (value: gender) => {};
  onTouched = () => {};
  touched = false;
  disabled = false;

  /**
   * My custom prop for storing the control variable
   * @private
   */
  private controlValue: gender|null = null;

  /**
   * My custom method for setting the value of the control
   * When the user clicks the button
   * @param gender
   */
  public setControlValue(gender: gender) {
    this.markAsTouched();
    this.controlValue = gender;
    this.onChange(gender);
  }

  /**
   * When a form value changes due to user input,
   * we need to report the value back to the parent form.
   * This is done by calling a callback,
   * that was initially registered with the control using the registerOnChange method
   * @param onChange
   */
  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  /**
   * When the user first interacts with the form control,
   * the control is considered to have the status touched,
   * which is useful for styling.
   * In order to report to the parent form that the control was touched,
   * we need to use a callback registered using the registerOnTouched method
   * @param onTouched
   */
  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  /**
   * form controls can be enabled and disabled using the Forms API.
   * This state can be transmitted to the form control via the setDisabledState method
   * @param isDisabled
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * this method is called by the Forms module to write a value into a form control
   * @param value
   */
  writeValue(value: gender): void {
    this.controlValue = value;
  }

  /**
   * Sets our control as touched
   * and relays that information to the parent form
   * This is useful for validation
   */
  markAsTouched() {
    if (this.touched) {
      return;
    }
    this.onTouched();
    this.touched = true;
  }
}
