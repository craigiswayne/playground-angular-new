import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Object3D} from 'three';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'threejs-rotating-box';

  public static rotate_on_y(object: Object3D): Object3D {
    object.rotation.z += 0.01;
    return object;
  }

  public addSimpleGLTFObject(file_path: string, position: Vector3 = new Vector3(0, 0, 0)): this {
    // root file
    // root path
    // file map
    this._gltfLoader = this._gltfLoader ?? new GLTFLoader();
    this._gltfLoader.loadAsync(file_path)
      .then((gltf: GLTF) => {
        if (gltf.scene.children.length <= 0) {
          this.eventService.error('GLB file has no children.');
          return;
        }

        const gltf_child = gltf.scene.children[0]; // Assuming the GLB has a single root object
        // gltf_child.castShadow = true;
        // gltf_child.receiveShadow = true;
        gltf_child.position.x = position.x;
        gltf_child.position.y = position.y;
        gltf_child.position.z = position.z;
        this.scene.add(gltf_child);
        this.gltf_objects.push(gltf_child);
        if(this._helpers_on){
          const skeleton_helper = new SkeletonHelper(gltf_child);
          this.scene.add(skeleton_helper)
        }
      })
      .catch(error => {
        this.eventService.error(error)
      })
    return this;
  }

  public addARandomCube(): this {
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({color: 0xf2f2});
    const cube = new Mesh(geometry, material);
    this.scene.add(cube);
    return this;
  }
}
