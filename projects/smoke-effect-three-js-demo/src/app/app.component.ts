import {Component, ElementRef, HostBinding, HostListener, inject, OnDestroy, OnInit, viewChild} from '@angular/core';
import * as THREE from 'three';
import {Clock, PerspectiveCamera, Scene, WebGLRenderer} from 'three';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {tap} from 'rxjs';

const random_number_in_range = (min: number, max: number): number =>  {
  return Math.random() * (max - min) + min;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
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
  private smoke_texture?: THREE.Texture;
  private frameId?: number;

  private readonly formBuilder = inject(FormBuilder);
  public demoForm = this.formBuilder.group({
    opacity: [0.15, Validators.required]
  });

  constructor() {
    this.camera.position.z = 1000;
    this.scene.fog = new THREE.FogExp2(0xc0f0ff, 0.0015);
    this.demoForm.valueChanges.pipe(
      tap(changes => {
        console.log('changes', changes);
      })
    ).subscribe();
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

    this.smoke_texture = new THREE.TextureLoader().load("smoke.png");
    // smokeTexture.encoding = THREE.sRGBEncoding;
    const smoke_size = new THREE.PlaneGeometry(300, 300);

    // MeshLambert good for non-shiny materials
    const smoke_material = this.generate_material();

    new Array(90).fill('').forEach(i => {
      let smoke_particle = new THREE.Mesh(smoke_size, smoke_material);
      smoke_particle.scale.set(2, 2, 2);
      const x = random_number_in_range((window.innerWidth/2)*-1, window.innerWidth/2)
      const y = random_number_in_range((window.innerHeight/2)*-1, -200)
      const z = Math.random() * 1000 - 100
      smoke_particle.position.set(x, y, z);
      smoke_particle.rotation.z = Math.random() * 360;

      this.scene.add(smoke_particle);
      this.smoke_particles.push(smoke_particle);
    })

    this.renderer.setAnimationLoop(this.animate.bind(this));
  }

  private generate_material() {
    return new THREE.MeshLambertMaterial({
      map: this.smoke_texture,
      emissive: 0x222222, // emissive light of material
      // emissive: 0xffffff, // emissive light of material
      opacity: this.demoForm.value.opacity!, // less will look like less smoke, high inverse
      // opacity: 0.3, // less will look like less smoke, high inverse
      transparent: true
    });
  }

  private animate() {
    this.delta = this.clock.getDelta();
    this.renderer!.render(this.scene, this.camera);

    this.smoke_particles.forEach(particle => {
      particle.rotation.z += (this.delta * 0.12);
      particle.material = this.generate_material();
    })
  }
}
