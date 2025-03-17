import {Injectable, isDevMode} from '@angular/core';
import {
  AmbientLight,
  AxesHelper, BoxGeometry,
  CameraHelper, Clock,
  DirectionalLight, DirectionalLightHelper,
  GridHelper, Group, Intersection, MathUtils, Mesh, MeshBasicMaterial, MeshPhongMaterial, Object3D, OrthographicCamera,
  PerspectiveCamera, Raycaster,
  Scene, SkeletonHelper, Vector2, Vector3,
  WebGLRenderer
} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/addons/libs/stats.module.js';
import {ColorRepresentation} from 'three/src/math/Color.js';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry, TextGeometryParameters} from 'three/examples/jsm/geometries/TextGeometry.js';

interface DirectionalLightOptions {
  color: ColorRepresentation,
  intensity: number,
  x: number,
  y: number,
  z: number
}

interface CameraOptions {
  x?: number,
  y?: number
  z?: number,
  zoom?: number
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
export class ThreeJSService {

  public readonly scene: Scene;
  public camera?: PerspectiveCamera|OrthographicCamera;
  private _orthographic_perspective_distance = 2.5;
  public renderer!: WebGLRenderer;

  public clock = new Clock();
  private _animation_loops: Function[] = [];

  public ambientLight?: AmbientLight;
  public directionalLight?: DirectionalLight;

  private _orbitControls?: OrbitControls;

  private _gltfLoader?: GLTFLoader;
  public gltf_objects: Object3D[] = [];

  private _raycaster = new Raycaster();
  private _mouse = new Vector2();

  private canvas!: HTMLCanvasElement;

  private _helpers_on = false;
  private _stats?: Stats;

  private _is_shaking = false;

  constructor() {
    this.scene = new Scene();
    window.addEventListener('resize', () => this.handleWindowResize());
  }

  public initializeRenderer(canvas: HTMLCanvasElement): this {
    this.canvas = canvas;
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
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
      this.camera = new PerspectiveCamera(75, this.aspectRatio, 0.1, 1000);
      this.camera.position.x = options.x ?? 0;
      this.camera.position.y = options.y ?? 0;
      this.camera.position.z = options.z ?? 5;
    }
    else if(type === 'orthographic'){
      const halfFovV = MathUtils.DEG2RAD * 45 * 0.5;
      const halfFovH = Math.atan((window.innerWidth / window.innerHeight) * Math.tan(halfFovV));

      const halfW = this._orthographic_perspective_distance * Math.tan( halfFovH );
      const halfH = this._orthographic_perspective_distance * Math.tan( halfFovV );
      const near = 0.01;
      const far = 2000;
      this.camera = new OrthographicCamera(-halfW, halfW, halfH, -halfH, near, far);
      const orthographicDistance = 2;
      this.camera.position.set(0, 0, orthographicDistance);
      // this._camera.zoom = options.zoom ?? 1;
      this.camera.zoom = 1;
    }

    return this;
  }

  public addARandomCube(): this {
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({color: 0xf2f2});
    const cube = new Mesh(geometry, material);
    this.scene.add(cube);
    return this;
  }

  public addSimpleGLTFObject(file_path: string, position: Vector3 = new Vector3(0, 0, 0)): this {
    // root file
    // root path
    // file map
    this._gltfLoader = this._gltfLoader ?? new GLTFLoader();
    this._gltfLoader.loadAsync(file_path)
      .then((gltf: GLTF) => {
          if (gltf.scene.children.length <= 0) {
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
    if(!isDevMode() || !this.camera){
      return this;
    }
    this._orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this._orbitControls.enableDamping = true;
    this._orbitControls.dampingFactor = 0.05;
    this._orbitControls.minZoom = 0.01;
    this._orbitControls.maxZoom = 2;
    return this;
  }

  public add_helpers(): this {
    if(!isDevMode()){
      return this;
    }
    this._helpers_on = true;
    const gridHelper = new GridHelper(10, 10);
    this.scene.add(gridHelper);

    const axes_helper = new AxesHelper(5);
    this.scene.add(axes_helper);

    if(this.camera){
      const cameraHelper = new CameraHelper(this.camera);
      this.scene.add(cameraHelper);
    }

    if (this.directionalLight) {
      const directionalLightHelper = new DirectionalLightHelper(this.directionalLight, 5);
      this.scene.add(directionalLightHelper);
    }

    this._stats = new Stats();
    document.body.appendChild( this._stats.dom );
    return this;
  }

  public addSkeletonHelpers(): this {
    if(!isDevMode()){
      return this;
    }

    if(this.gltf_objects.length >  0){
      this.gltf_objects.forEach(object => {
        console.log('adding skeleton helper for')
        const skeleton_helper = new SkeletonHelper(object);
        this.scene.add(skeleton_helper)
      })
    } else {
      console.log('no gltf objects to add skeleton helper for', this.gltf_objects)
    }

    return this;
  }

  public toggleHelpers(){
    this._helpers_on = !this._helpers_on;
    this.scene.children.forEach(child => {
      if(child instanceof DirectionalLightHelper){
        child.visible = !child.visible;
      }

      if(child instanceof CameraHelper){
        child.visible = !child.visible;
      }

      if(child instanceof AxesHelper){
        child.visible = !child.visible;
      }

      if(child instanceof GridHelper){
        child.visible = !child.visible;
      }

      if(child instanceof SkeletonHelper){
        child.visible = !child.visible;
      }

    })
  }

  public swayDirectionalLightSideToSide(time: number): void {
    this.directionalLight!.position.x = Math.sin(time / 1000) * 3;
  }

  private handleWindowResize(): void {

    if(this.camera !== undefined){

      if(this.camera instanceof PerspectiveCamera){
        this.camera.aspect = this.aspectRatio;
      }
      else if (this.camera instanceof OrthographicCamera){
        const halfFovV = MathUtils.DEG2RAD * 45 * 0.5;
        const halfFovH = Math.atan( ( window.innerWidth / window.innerHeight ) * Math.tan( halfFovV ) );

        const halfW = this._orthographic_perspective_distance * Math.tan( halfFovH );
        const halfH = this._orthographic_perspective_distance * Math.tan( halfFovV );
        this.camera.left = - halfW;
        this.camera.right = halfW;
        this.camera.top = halfH;
        this.camera.bottom = - halfH;
      }
      this.camera.updateProjectionMatrix();
    }

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public stopRendering(): void {
    if (this.renderer == null) return;
    this.renderer!.dispose();
  }

  private get aspectRatio() {
    return window.innerWidth / window.innerHeight;
  }

  public static pan(object: Object3D, time: number): Object3D {
    object.position.x = Math.sin(time / 1000) * 3;
    return object;
  }

  public static levitate(object: Object3D, time: number): Object3D {
    object.position.y += Math.sin(time/1000) * 0.001;
    return object;
  }

  public static rotate_on_y(object: Object3D): Object3D {
    object.rotation.z += 0.01;
    return object;
  }

  public get_intersected_objects(mouse_event: MouseEvent, objects: Object3D[]): Intersection[] {
    this._mouse.x = (mouse_event.clientX / window.innerWidth) * 2 - 1;
    this._mouse.y = -(mouse_event.clientY / window.innerHeight) * 2 + 1;
    this._raycaster.setFromCamera(this._mouse, this.camera!);
    return this._raycaster.intersectObjects(objects);
  }

  public shake_screen(){

    const shakeIntensity = 0.1;
    const shakeDuration = 200;

    if (this._is_shaking) return; // Prevent multiple shakes at once

    this._is_shaking = true;
    const originalPosition = this.camera!.position.clone();
    const startTime = Date.now();

    const shake = () => {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > shakeDuration) {
        this.camera!.position.copy(originalPosition);
        this._is_shaking = false;
        return;
      }

      this.camera!.position.x = originalPosition.x + (Math.random() - 0.5) * shakeIntensity;
      this.camera!.position.y = originalPosition.y + (Math.random() - 0.5) * shakeIntensity;

      requestAnimationFrame(shake);
    };

    shake();
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

  private render(): void {
    if(this._orbitControls){
      this._orbitControls.update();
    }

    if(this._stats){
      this._stats.update();
    }
    if(this.camera && this.renderer){
      this.renderer.render(this.scene, this.camera);
    }
  }


  public addAnimationLoop(callback: (time: number) => void): this {
    this._animation_loops.push(callback);
    return this;
  }

  public start_animation_loop(): this {
    this.renderer.setAnimationLoop(this.animate.bind(this));
    return this;
  }

  private animate(){
    this._animation_loops.forEach(callback => callback(performance.now()));
    this.render();
  }

}
