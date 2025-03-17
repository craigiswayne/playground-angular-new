import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {OrthographicCamera, PerspectiveCamera} from 'three';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'threejs-shake-screen';

  public _is_shaking = false;
  private _camera?: PerspectiveCamera|OrthographicCamera;

  private shake_screen(){
    const shakeIntensity = 0.1;
    const shakeDuration = 200;

    if (this._is_shaking) return; // Prevent multiple shakes at once

    this._is_shaking = true;
    const originalPosition = this._camera!.position.clone();
    const startTime = Date.now();

    const shake = () => {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > shakeDuration) {
        this._camera!.position.copy(originalPosition);
        this._is_shaking = false;
        return;
      }

      this._camera!.position.x = originalPosition.x + (Math.random() - 0.5) * shakeIntensity;
      this._camera!.position.y = originalPosition.y + (Math.random() - 0.5) * shakeIntensity;

      requestAnimationFrame(shake);
    };

    shake();
  }
}
