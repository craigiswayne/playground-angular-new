import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'threejs-mouse-events';

  public get_intersected_objects(mouse_event: MouseEvent, objects: Object3D[]): Intersection[] {
    this._mouse.x = (mouse_event.clientX / window.innerWidth) * 2 - 1;
    this._mouse.y = -(mouse_event.clientY / window.innerHeight) * 2 + 1;
    this._raycaster.setFromCamera(this._mouse, this.camera!);
    return this._raycaster.intersectObjects(objects);
  }

}
