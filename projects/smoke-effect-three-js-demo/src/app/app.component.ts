import {Component, ElementRef, HostBinding, HostListener, OnDestroy, OnInit, viewChild} from '@angular/core';
import * as THREE from 'three';
import {Clock, PerspectiveCamera, Scene, WebGLRenderer} from 'three';

const random_number_in_range = (min: number, max: number): number =>  {
  return Math.random() * (max - min) + min;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  private canvas_ref = viewChild<ElementRef<HTMLCanvasElement>>('canvas')
  private clock: Clock = new THREE.Clock();
  private delta: number = 0;
  private camera: PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1500)
  private scene: Scene = new THREE.Scene();
  private renderer?: WebGLRenderer;
  private smoke_particles: THREE.Mesh[] = [];
  private frameId?: number;

  constructor() {
    this.camera.position.z = 1000;
    this.scene.fog = new THREE.FogExp2(0xc0f0ff, 0.0015);
  }

  @HostBinding('class.no-images') no_images = false;

  @HostListener('window:resize') on_window_resize() {
    this.resize();
  }

  ngOnInit() {
    this.setup_three_js();
  }

  ngOnDestroy() {
    this.stop_effects();
  }

  private setup_three_js() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas_ref()?.nativeElement,
      alpha: true,
      antialias: true
    });

    this.renderer!.setPixelRatio(window.devicePixelRatio);
    this.renderer!.setSize(window.innerWidth, window.innerHeight);

    const light = new THREE.HemisphereLight(0xd6e6ff, 0xa38c08, 1);
    this.scene.add(light);

    const smoke_texture = new THREE.TextureLoader().load("smoke.png");
    // smokeTexture.encoding = THREE.sRGBEncoding;
    const smokeGeometry = new THREE.PlaneGeometry(300, 300);

    // MeshLambert good for non-shiny materials
    const smokeMaterial = new THREE.MeshLambertMaterial({
      map: smoke_texture,
      emissive: 0x222222, // emissive light of material
      // emissive: 0xffffff, // emissive light of material
      opacity: 0.15, // less will look like less smoke, high inverse
      // opacity: 0.3, // less will look like less smoke, high inverse
      transparent: true
    });

    new Array(90).fill('').forEach(i => {
      let smoke_particle = new THREE.Mesh(smokeGeometry, smokeMaterial);
      smoke_particle.scale.set(2, 2, 2);
      const x = random_number_in_range((window.innerWidth/2)*-1, window.innerWidth/2)
      const y = random_number_in_range((window.innerHeight/2)*-1, -200)
      const z = Math.random() * 1000 - 100
      console.log('Coordinates', x, y, z)
      smoke_particle.position.set(x, y, z);
      smoke_particle.rotation.z = Math.random() * 360;

      this.scene.add(smoke_particle);
      this.smoke_particles.push(smoke_particle);
    })

    this.renderer.setAnimationLoop(this.animate.bind(this));
    this.animate();
  }

  private animate() {
    this.delta = this.clock.getDelta();
    this.renderer!.render(this.scene, this.camera);

    this.smoke_particles.forEach(particle => {
      particle.rotation.z += (this.delta * 0.12);
    })
  }

  private resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer!.setSize(window.innerWidth, window.innerHeight);
  }

  public stop_effects() {
    if (this.frameId != undefined || this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
    if (this.renderer != null) {
      this.renderer.dispose();
      // this.renderer = null;
      // this.canvas = null;
    }
  }

  public set_image_opacity(value: number|string){
    console.log(value)
  }
}
