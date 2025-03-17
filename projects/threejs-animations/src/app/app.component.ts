import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Object3D} from 'three';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'threejs-animations';

  public static levitate(object: Object3D, time: number): Object3D {
    object.position.y += Math.sin(time/1000) * 0.001;
    return object;
  }


  public swayDirectionalLightSideToSide(time: number): void {
    this.directional_light!.position.x = Math.sin(time / 1000) * 3;
  }


}
