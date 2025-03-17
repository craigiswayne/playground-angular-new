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
  title = 'threejs-pan-camera';

  public static pan(object: Object3D, time: number): Object3D {
    object.position.x = Math.sin(time / 1000) * 3;
    return object;
  }

}
