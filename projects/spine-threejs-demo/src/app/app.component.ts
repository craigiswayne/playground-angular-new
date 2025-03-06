import {AfterViewInit, Component, ElementRef, inject, viewChild} from '@angular/core';
import {ThreeJsService} from '../../../library/services/three-js/three-js.service';
import {AssetManager, AtlasAttachmentLoader, SkeletonJson, SkeletonMesh} from '@esotericsoftware/spine-threejs';
import {BoxGeometry, Mesh, MeshBasicMaterial} from 'three';
import GUI from 'lil-gui';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss'
})
export class AppComponent implements AfterViewInit {
  private canvas_ref = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private threeJSService = inject(ThreeJsService);

  private spineDefinitions = {
    'raptor': {
      skeleton: 'raptor.json',
      atlas: 'raptor.atlas',
    },
    'coin': {
      skeleton: 'coin.json',
      atlas: 'coin.atlas',
    },
    'spineboy': {
      skeleton: 'spineboy.json',
      atlas: 'spineboy.atlas',
    },
    'teefz': {
      skeleton: 'teefz.skel',
      atlas: 'teefz.atlas',
    }
  }

  private guiOptions = {
    model: 'coin',
    scale: 0.005,
    modelX: 0,
    modelY: 0,
    modelZ: 0
  }

  private gui = new GUI();

  private boxGeometry?: BoxGeometry;
  private assetManager = new AssetManager('/assets/spine/');
  private mesh?: Mesh;
  private skeletonMesh?: SkeletonMesh;
  private lastFrameTime = Date.now() / 1000;

  constructor() {
    this.gui.add(this.guiOptions, 'model', Object.keys(this.spineDefinitions))
      .onChange((v: string) => {
        this.injectModel();
      });
    this.gui.add(this.guiOptions, 'scale');
    this.gui.add(this.guiOptions, 'modelX');
    this.gui.add(this.guiOptions, 'modelY');
    this.gui.add(this.guiOptions, 'modelZ');
  }

  ngAfterViewInit() {
    this.threeJSService
      .initializeRenderer(this.canvas_ref()!.nativeElement)
      .addCamera('perspective', {x: 0, y: 2, z: 12})
      .addOrbitControls()
      .addHelpers()

    Object.keys(this.spineDefinitions).forEach((key) => {
      // @ts-ignore
      this.assetManager.loadText(`${key}/${this.spineDefinitions[key].skeleton}`);
      // @ts-ignore
      this.assetManager.loadTextureAtlas(`${key}/${this.spineDefinitions[key].atlas}`);
    })
    requestAnimationFrame(this.load.bind(this));
  }

  private load() {
    if (!this.assetManager.isLoadingComplete()) {
      requestAnimationFrame(this.load.bind(this));
      return
    }
    const geometrySize = 10;
    // Add a box to the scene to which we attach the skeleton mesh
    this.boxGeometry = new BoxGeometry(geometrySize, geometrySize, geometrySize);
    const material = new MeshBasicMaterial({color: 0xff0000, wireframe: true});
    this.mesh = new Mesh(this.boxGeometry, material);
    this.threeJSService.scene.add(this.mesh);

    this.injectModel()

    this.threeJSService.setAnimationLoop(this.render.bind(this));
  }

  private injectModel(){
    this.mesh?.clear();
    // Load the texture atlas using name.atlas and name.png from the AssetManager.
    // The function passed to TextureAtlas is used to resolve relative paths.
    // @ts-ignore
    const atlas = this.assetManager.get(`${this.guiOptions.model}/${this.spineDefinitions[this.guiOptions.model].atlas}`);

    // Create a AtlasAttachmentLoader that resolves region, mesh, bounding box and path attachments
    const atlasLoader = new AtlasAttachmentLoader(atlas);

    // Create a SkeletonJson instance for parsing the .json file.
    const skeletonJSON = new SkeletonJson(atlasLoader);

    // Set the scale to apply during parsing, parse the file, and create a new skeleton.
    skeletonJSON.scale = this.guiOptions.scale;
    // @ts-ignore
    const skeletonData = skeletonJSON.readSkeletonData(this.assetManager.get(`${this.guiOptions.model}/${this.spineDefinitions[this.guiOptions.model].skeleton}`));
    console.log('skeletonData', skeletonData, '')
    // Create a SkeletonMesh from the data and attach it to the scene
    this.skeletonMesh = new SkeletonMesh({
      skeletonData: skeletonData,
    })
    this.skeletonMesh.position.y = -(10/4);

    this.skeletonMesh.state.setAnimation(0, skeletonData.animations[skeletonData.animations.length-1].name, true);
    this.mesh!.add(this.skeletonMesh);
  }

  private render(change: number) {
    const now = Date.now() / 1000;
    const delta = now - this.lastFrameTime;
    this.skeletonMesh?.position.set(this.guiOptions.modelX, this.guiOptions.modelY, this.guiOptions.modelZ);
    this.lastFrameTime = now;
    this.skeletonMesh!.update(delta);
    this.threeJSService.render()
  }
}
