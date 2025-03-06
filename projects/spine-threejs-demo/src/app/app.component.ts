import {AfterViewInit, Component, ElementRef, inject, viewChild} from '@angular/core';
import {ThreeJsService} from '../../../library/services/three-js/three-js.service';
import {AssetManager, AtlasAttachmentLoader, SkeletonJson, SkeletonMesh} from '@esotericsoftware/spine-threejs';
import {BoxGeometry, Mesh, MeshBasicMaterial} from 'three';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss'
})
export class AppComponent implements AfterViewInit {
  private canvas_ref = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private threeJSService = inject(ThreeJsService);


  private skeletonFile = "raptor-pro.json";
  private atlasFile = 'raptor.atlas';
  // private assetManager = new AssetManager('/assets/spine/raptor/');
  private assetManager = new AssetManager('/assets/spine/raptor/');
  private mesh?: Mesh;
  private skeletonMesh?: SkeletonMesh;
  private lastFrameTime = Date.now() / 1000;

  ngAfterViewInit() {
    this.threeJSService
      .initializeRenderer(this.canvas_ref()!.nativeElement)
      .addCamera('perspective', {x: -3, y: 6, z: 13})
      .addOrbitControls()
      .addHelpers()

    // load the assets required to display the Raptor model
    this.assetManager.loadText(this.skeletonFile);
    this.assetManager.loadTextureAtlas(this.atlasFile);

    requestAnimationFrame(this.load.bind(this));
  }

  private load() {
    if (!this.assetManager.isLoadingComplete()) {
      requestAnimationFrame(this.load.bind(this));
      return
    }

    // Add a box to the scene to which we attach the skeleton mesh
    const geometry = new BoxGeometry(200, 200, 200);
    const material = new MeshBasicMaterial({color: 0xff0000, wireframe: true});
    this.mesh = new Mesh(geometry, material);
    this.threeJSService.scene.add(this.mesh);

    // Load the texture atlas using name.atlas and name.png from the AssetManager.
    // The function passed to TextureAtlas is used to resolve relative paths.
    const atlas = this.assetManager.get(this.atlasFile);

    // Create a AtlasAttachmentLoader that resolves region, mesh, boundingbox and path attachments
    const atlasLoader = new AtlasAttachmentLoader(atlas);

    // Create a SkeletonJson instance for parsing the .json file.
    const skeletonJson = new SkeletonJson(atlasLoader);

    // Set the scale to apply during parsing, parse the file, and create a new skeleton.
    skeletonJson.scale = 0.4;
    const skeletonData = skeletonJson.readSkeletonData(this.assetManager.get(this.skeletonFile));

    // Create a SkeletonMesh from the data and attach it to the scene
    this.skeletonMesh = new SkeletonMesh({
      skeletonData: skeletonData,
    })

    this.skeletonMesh.state.setAnimation(0, 'walk', true);
    this.mesh.add(this.skeletonMesh);

    this.threeJSService.setAnimationLoop(this.render.bind(this));

  }

  private render() {
    const now = Date.now() / 1000;
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.skeletonMesh!.update(delta);
    this.threeJSService.render()
  }
}
