import {
  AfterViewInit,
  Component,
  HostBinding,
  inject, Input,
  input,
  isDevMode,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import {LilGuiService} from './lil-gui.service';

interface ControlOptions {
  [key: string]: {
    step?: number,
    onChange?: Function
  }
}

@Component({
  selector: 'lib-lil-gui',
  template: '',
  styles: ['body:has(lib-lil-gui) .lil-gui.top-left {right: unset; left: 15px}'],
  encapsulation: ViewEncapsulation.None
})
export class LilGuiComponent implements OnChanges, AfterViewInit {
  private service = inject(LilGuiService);
  public params = input<{[key:string]: number|Function|string|boolean}>({});
  public control_options = input<ControlOptions>({});
  @HostBinding('class') @Input() position: 'top-left'|'top-right' = 'top-right';

  ngAfterViewInit() {
  //   Object.keys(this['params']).forEach((key: string) => {
  //     this.service.gui!.add(this.params(), key)
    // })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!isDevMode()) {
      return;
    }
    const params = this.params();
    if(!params){
      return;
    }
    Object.keys(changes['params'].currentValue).forEach((key: string) => {
      this.service.gui!.add(params, key)
    })

    Object.keys(changes['control_options'].currentValue).forEach((key: string) => {
      const controller = this.service.gui.controllers.find(controller => controller.property === key);

      if(!controller){
        return;
      }

      const step_value = this.control_options()[key].step;
      if(step_value !== undefined){
        controller.step(step_value)
      }

      const onChangeCallback = this.control_options()[key].onChange;
      if(onChangeCallback !== undefined){
        controller.onChange(() => onChangeCallback())
      }
    });
    this.service.gui.close();
  }

  ngOnDestroy() {
    this.service.gui!.destroy();
  }
}
