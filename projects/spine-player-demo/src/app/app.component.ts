import {AfterViewInit, Component, ElementRef, viewChild} from '@angular/core';
import {SpinePlayer} from '@esotericsoftware/spine-player';
import GUI, {Controller} from 'lil-gui';

const animation_per_model = {
  'coin': ['animation'],
  'raptor': ['gun-grab', 'gun-holster', 'jump', 'roar', 'walk'],
  'spineboy': ['aim', 'death', 'hoverboard', 'idle', 'idle-turn', 'jump', 'portal', 'run', 'run-to-idle', 'shoot', 'walk'],
  'teefz': ['animation', 'antiaipation', 'antiaipation2','Lose', 'win']
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: 'app.component.html',
  styles: [],
})
export class AppComponent implements AfterViewInit {
  public spine_test_ref = viewChild.required<ElementRef<HTMLDivElement>>('spine_test');
  private spinePlayer!: SpinePlayer;
  private guiControls = {
    model: 'teefz',
    animation: animation_per_model['teefz'][0],
  }
  private lilGUI = new GUI();
  private animation_controller: Controller;

  constructor() {
    this.lilGUI.add(this.guiControls, 'model', ['coin', 'raptor', 'spineboy', 'teefz'])
      .onChange((model: string) => {
        this.set_model(model);
        // @ts-ignore
        this.animation_controller.options(animation_per_model[model])
        // @ts-ignore
        this.animation_controller.setValue(animation_per_model[model][0]);
      })
    // @ts-ignore
    this.animation_controller = this.lilGUI.add(this.guiControls, 'animation', animation_per_model[this.guiControls.model])
      .onChange((v: string) => {
        this.spinePlayer.setAnimation(v);
        this.spinePlayer.play();
      });
  }
  ngAfterViewInit() {
    this.set_model(this.guiControls.model);
  }

  private set_model(model: string){
    this.spine_test_ref()!.nativeElement.innerHTML = '';
    this.spinePlayer = new SpinePlayer(this.spine_test_ref()!.nativeElement, {
      skeleton: `/assets/spine/${model}/spine.json`,
      atlas: `/assets/spine/${model}/spine.atlas`,
      preserveDrawingBuffer: true,
      showControls: true,
      scale: 1,
      success: (v) => {
        console.log(v);
        this.spinePlayer.play();
      }
    });
  }
}
