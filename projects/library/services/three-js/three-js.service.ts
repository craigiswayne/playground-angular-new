import {inject, Injectable, isDevMode} from '@angular/core';
import {
  AmbientLight,
  AxesHelper, BoxGeometry,
  CameraHelper,
  DirectionalLight, DirectionalLightHelper,
  GridHelper, Mesh, MeshBasicMaterial, Object3D, OrthographicCamera,
  PerspectiveCamera,
  Scene, Vector3,
  WebGLRenderer
} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ColorRepresentation} from 'three/src/math/Color.js';

interface DirectionalLightOptions {
  color: ColorRepresentation,
  intensity: number,
  x: number,
  y: number,
  z: number
}

interface CameraOptions {
  x: number,
  y: number
  z: number,
}

/**
 * Typical setup for a three js scene
 * service
 * .setup()
 * .addAmbientLight()
 */
@Injectable({
  providedIn: 'root'
})
export class ThreeJsService {

  public readonly scene: Scene;
  private _camera?: PerspectiveCamera|OrthographicCamera;
  public renderer!: WebGLRenderer;

  public ambientLight?: AmbientLight;
  public directionalLight?: DirectionalLight;

  public orbitControls?: OrbitControls;

  private _gltfLoader?: GLTFLoader;
  public _gltfObjects: Object3D[] = [];

  constructor() {
    this.scene = new Scene();
    window.addEventListener('resize', () => this.handleWindowResize());
  }

  private get aspectRatio() {
    return window.innerWidth / window.innerHeight;
  }

  public initializeRenderer(canvas: HTMLCanvasElement): this {
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // todo what to do here?
    // const canvas_width = window.innerWidth;
    // const canvas_height = window.innerHeight;
    // const canvas_width = canvas.width;
    // const canvas_height = canvas.height;
    // renderer.setSize(window.innerWidth, window.innerHeight);

    // light
    // const light = new HemisphereLight(0xd6e6ff, 0xa38c08, 1);
    // scene.add(light);
    return this;
  }

  public addCamera(type: 'perspective' | 'orthographic' = 'perspective', options: Partial<CameraOptions> = {}): this {

    if(type === 'perspective'){
      // this._camera = new PerspectiveCamera(75, this.aspectRatio, 0.1, 1000);
      this._camera = new PerspectiveCamera(75, this.aspectRatio, 0.1, 1000);
      this._camera.position.x = options.x ?? 0;
      this._camera.position.y = options.y ?? 0;
      this._camera.position.z = options.z ?? 5;
      return this;
    }

    if(type === 'orthographic'){
      this._camera = new OrthographicCamera(
        -70, // left
        70, // right
        70, // top
        -70, // bottom
        0.1, // near
        1000 // far
      );
      return this;
    }

    return this;
  }

  public addARandomCube(): this {
    let geometry = new BoxGeometry(1, 1, 1);
    let material = new MeshBasicMaterial({color: 0xf2f2});
    let cube = new Mesh(geometry, material);
    this.scene.add(cube);
    return this;
  }

  public addSimpleGLTFObject(file_path: string, position: Vector3 = new Vector3(0, 0, 0)): this {
    // root file
    // root path
    // file map
    this._gltfLoader = this._gltfLoader ?? new GLTFLoader();
    // loader.load('wood-crate/source/untitled/untitled.glb', (gltf: unknown) => {
    this._gltfLoader.loadAsync(file_path)
      .then((gltf: GLTF) => {
        if (gltf.scene.children.length <= 0) {
          console.error('GLB file has no children.');
          return;
        }
        console.log('gltf.scene.children', gltf.scene.children);
        const glbObject = gltf.scene.children[0]; // Assuming the GLB has a single root object
        glbObject.position.x = position.x;
        glbObject.position.y = position.y;
        glbObject.position.z = position.z;
        this.scene.add(glbObject);
        this._gltfObjects.push(glbObject);
      })
      .catch(error => {
        console.error(error)
      })
    return this;
  }

  public addAmbientLight(): this {
    this.ambientLight = new AmbientLight(0x404040); // Soft white light
    this.scene.add(this.ambientLight);
    return this;
  }

  public addDirectionalLight(options: Partial<DirectionalLightOptions> = {}): this {
    options.color = options.color || 0xffffff;
    options.intensity = options.intensity || 1;
    options.x = options.x ?? 5;
    options.y = options.y ?? 5;
    options.z = options.z ?? 5;
    this.directionalLight = new DirectionalLight(options.color, options.intensity); // White light, intensity 1
    this.directionalLight.position.set(options.x, options.y, options.z);
    this.scene.add(this.directionalLight);
    return this;
  }

  public addOrbitControls(): this {
    if(!isDevMode() || !this._camera){
      return this;
    }
    this.orbitControls = new OrbitControls(this._camera, this.renderer.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    return this;
  }

  public addHelpers(): this {
    if(!isDevMode()){
      return this;
    }
    const gridHelper = new GridHelper(10, 10);
    this.scene.add(gridHelper);

    const axesHelper = new AxesHelper(5);
    this.scene.add(axesHelper);

    if(!!this._camera){
      const cameraHelper = new CameraHelper(this._camera);
      this.scene.add(cameraHelper);
    }

    if (this.directionalLight) {
      const directionalLightHelper = new DirectionalLightHelper(this.directionalLight, 5);
      this.scene.add(directionalLightHelper);
    }

    return this;
  }

  public swayDirectionalLightSideToSide(time: number): void {
    this.directionalLight!.position.x = Math.sin(time / 1000) * 3;
  }

  public handleWindowResize(): void {
    if(this._camera !== undefined){
      if(this._camera instanceof PerspectiveCamera){
        this._camera.aspect = this.aspectRatio;
      }
      this._camera.updateProjectionMatrix();
    }

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public setAnimationLoop(callback: (time: number) => void): this {
    this.renderer.setAnimationLoop(callback);
    return this;
  }

  public render(): void {
    if(!!this._camera){
      this.renderer!.render(this.scene, this._camera);
    }
  }

  public stopRendering(): void {
    if (this.renderer == null) return;
    this.renderer!.dispose();
  }
}
