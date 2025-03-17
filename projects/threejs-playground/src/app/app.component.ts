import {AfterViewInit, Component, ElementRef, inject, OnDestroy, viewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {LilGuiComponent} from '../../../library/components/lil-gui/lil-gui.component';
import {ThreeJSService} from '../../../library/services/threejs/threejs.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LilGuiComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private canvas_ref = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas')
  private readonly _threejs_service = inject(ThreeJSService);

  public gui_controls = {
    camera_zoom: 0.25,
    light_intensity: 5
  }

  ngAfterViewInit() {
    this._threejs_service
      .initializeRenderer(this.canvas_ref()!.nativeElement)
      // .addCamera('perspective', {x: 0, y: 0, z: 3.5})
      .addCamera('orthographic', {zoom: this.gui_controls.camera_zoom})
      // .addAmbientLight()
      .addDirectionalLight({x: 0, y: 3, z: 5, intensity: 10})
      .addOrbitControls()
      .add_helpers()

    // this.threeJSService.add_test_text('fuck you almighty', this.text_group)
    //   .then(res => {
    //     this.textGeo = res.text_geo;
    //     this.text_mesh = res.text_mesh;
    //   })

    this._threejs_service.addAnimationLoop(this.update_from_gui_controls.bind(this));

    this._threejs_service.start_animation_loop();
  }

  ngOnDestroy() {
    this._threejs_service.stopRendering();
  }

  private update_from_gui_controls() {
    this._threejs_service.renderer.clear();
    if(this._threejs_service.camera){
      this._threejs_service.camera.zoom = this.gui_controls.camera_zoom;
      this._threejs_service.camera.updateProjectionMatrix();
    }
  }
}
