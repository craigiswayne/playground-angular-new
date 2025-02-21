import {AfterViewInit, Component, ElementRef, HostListener, viewChild} from '@angular/core';
import * as THREE from 'three';
import {Clock, PerspectiveCamera, Scene, WebGLRenderer} from 'three';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent implements AfterViewInit {

  @HostListener('window:resize') on_window_resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private container_ref = viewChild<ElementRef>('container');
  private clock: Clock = new THREE.Clock();
  private delta: number = 0;
  private camera: PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1500);
  private scene: Scene = new THREE.Scene();
  private renderer: WebGLRenderer = new THREE.WebGLRenderer({antialias: true});
  private smokeParticles: THREE.Mesh[] = [];

  constructor() {
    this.camera.position.z = 1000;
    this.scene.fog = new THREE.FogExp2(0xc0f0ff, 0.0015);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  ngAfterViewInit() {
    this.container_ref()?.nativeElement.appendChild(this.renderer.domElement);
    const light = new THREE.HemisphereLight(0xd6e6ff, 0xa38c08, 1);
    this.scene.add(light);

    const smokeTexture = new THREE.TextureLoader().load("smoke.png");
    // smokeTexture.encoding = THREE.sRGBEncoding;
    const smokeGeometry  = new THREE.PlaneGeometry(300,300);

    // MeshLambert good for non-shiny materials
    const smokeMaterial = new THREE.MeshLambertMaterial({
      map: smokeTexture,
      emissive: 0x222222, // emissive light of material
      opacity: 0.15, // less will look like less smoke, high inverse
      transparent: true
    });

    for (let i=0; i<90; i++){
      let smokeElement = new THREE.Mesh(smokeGeometry, smokeMaterial);
      smokeElement.scale.set(2,2,2); // set scale x,y, z to double

      // position smoke textures at random x,y,z positions
      smokeElement.position.set(Math.random()*1000-500, Math.random()*1000-500, Math.random()*1000-100);
      // set smoke texture rotations to random amounts on z axis
      smokeElement.rotation.z = Math.random() * 360;

      this.scene.add(smokeElement);
      this.smokeParticles.push(smokeElement);
    }

    this.animate();
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.delta = this.clock.getDelta();
    this.renderer.render(this.scene, this.camera);

    // go through all smoke textures and rotate them
    for (let i=0; i<this.smokeParticles.length; i++){
      this.smokeParticles[i].rotation.z += (this.delta * 0.12);
    }
  }
}
