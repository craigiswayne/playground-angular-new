import {AfterViewInit, Component, ElementRef, viewChild} from '@angular/core';
import {SpinePlayer} from '@esotericsoftware/spine-player';
import GUI from 'lil-gui';

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
    animation: 'animation',
  }
  private lilGUI = new GUI();

  constructor() {
    this.lilGUI.add(this.guiControls, 'animation', ['animation', 'antiaipation', 'antiaipation2','Lose', 'win'])
      .onChange((v: string) => {
        this.spinePlayer.setAnimation(v);
        this.spinePlayer.play();
      });
  }
  ngAfterViewInit() {
    this.spinePlayer = new SpinePlayer(this.spine_test_ref()!.nativeElement, {
      // skeleton: "/assets/spine/spineboy/spineboy-pro.json",
      // atlas: "/assets/spine/spineboy/spineboy-pma.atlas",
      skeleton: "/assets/spine/teefz/spine.skel",
      atlas: "/assets/spine/teefz/spine.atlas",
      preserveDrawingBuffer: true,
      showControls: false,
      scale: 1,
      success: (v) => {
        console.log(v);
        this.spinePlayer.play();
      }
    });
  }
}
