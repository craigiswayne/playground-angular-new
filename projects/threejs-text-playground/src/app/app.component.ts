import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Group, Mesh, MeshPhongMaterial } from 'three';
import {TextGeometry, TextGeometryParameters } from 'three/examples/jsm/geometries/TextGeometry.js';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'threejs-text-playground';

  public gui_control_options = {
    text_depth: {
      step: 0.01,
      onChange: (value: number) => {
        this.update_text();
      }
    },
    text_size: {
      onChange: (value: number) => {
        this.update_text();
      }
    },
    text_curveSegments: {
      onChange: (value: number) => {
        this.update_text();
      }
    },
    text_bevelThickness: {
      step: 0.01,
      onChange: (value: number) => {
        this.update_text();
      }
    },
    text_bevelOffset: {
      step: 0.01,
      onChange: (value: number) => {
        this.update_text();
      }
    },
    text_bevelSize: {
      onChange: (value: number) => {
        this.update_text();
      }
    },
    text_bevelSegments: {
      onChange: (value: number) => {
        this.update_text();
      }
    }
  }

  public gui_controls = {
    text_position_x: 0,
    text_position_y: 0,
    text_position_z: 0,
    text_size: 50,
    text_depth: 10,
    text_curveSegments: 12,
    // text_bevelEnabled: true,
    text_bevelThickness: 10,
    text_bevelOffset: 0,
    text_bevelSize: 2,
    text_bevelSegments: 5
  }


  public add_test_text(text: string, group: Group, text_geometry?: Partial<TextGeometryParameters>): Promise<{text_geo: TextGeometry, text_mesh: Mesh }> {
    return new Promise((resolve, reject) => {
      const loader = new FontLoader();
      loader.load( '/assets/fonts/spooky-hollow.json', font => {
        // const plane = new Mesh(
        //   new PlaneGeometry( 10000, 10000 ),
        //   new MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } )
        // );
        // plane.position.y = 100;
        // plane.rotation.x = - Math.PI / 2;
        // this.threeJSService.scene.add( plane );
        group.clear();

        const text_geo_params: TextGeometryParameters = {
          font: font,
          size: text_geometry?.size ?? 50, // font size
          // height: 10,
          depth: text_geometry?.depth ?? 10,
          curveSegments: text_geometry?.curveSegments ?? 12,
          bevelEnabled: true,
          bevelThickness: text_geometry?.bevelThickness ?? 10,
          bevelOffset: text_geometry?.bevelOffset ?? 0,
          bevelSize: text_geometry?.bevelSize ?? 2,
          bevelSegments: text_geometry?.bevelSegments ?? 5
        }

        // @ts-ignore
        const textGeo = new TextGeometry(text, text_geo_params);

        textGeo.computeBoundingBox();

        const centerOffset = - 0.5 * ( textGeo.boundingBox!.max.x - textGeo.boundingBox!.min.x );

        const materials = [

          new MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
          new MeshPhongMaterial( { color: 0xffffff } ) // side
        ];

        const textMesh1 = new Mesh( textGeo, materials );

        textMesh1.position.x = centerOffset;
        textMesh1.position.y = 0;
        textMesh1.position.z = 1;
        textMesh1.rotation.x = 0;
        // textMesh1.rotation.y = Math.PI * 2;

        group.add(textMesh1);
        const scale = 0.0038;
        group.scale.set(scale, scale, scale);
        this.scene.add( group );
        resolve({
          text_geo: textGeo,
          text_mesh: textMesh1,
        });
      });
    })
  }

  public update_text(){
    this._threejs_service.add_test_text('fuck you almighty', this.text_group, {
      size: this.gui_controls.text_size,
      depth: this.gui_controls.text_depth,
      curveSegments: this.gui_controls.text_curveSegments,
      bevelThickness: this.gui_controls.text_bevelThickness,
      bevelOffset: this.gui_controls.text_bevelOffset,
      bevelSize: this.gui_controls.text_bevelSize,
      bevelSegments: this.gui_controls.text_bevelSegments,
    })
  }

}
