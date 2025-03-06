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
    animation: 'walk',
  }
  private lilGUI = new GUI();

  constructor() {
    this.lilGUI.add(this.guiControls, 'animation', ['walk', 'jump', 'run', 'idle'])
      .onChange((v: string) => {
        this.spinePlayer.setAnimation(v);
        this.spinePlayer.play();
      });
  }
  ngAfterViewInit() {
    this.spinePlayer = new SpinePlayer(this.spine_test_ref()!.nativeElement, {
      skeleton: "/assets/spine/spineboy/spineboy-pro.json",
      atlas: "/assets/spine/spineboy/spineboy-pma.atlas",
      preserveDrawingBuffer: true,
      showControls: false,
      scale: 1,
      success: () => {
        this.spinePlayer.play();
      }
    });
  }
}
