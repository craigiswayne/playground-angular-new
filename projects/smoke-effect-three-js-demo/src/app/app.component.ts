import {Component, ElementRef, HostBinding, HostListener, inject, OnDestroy, OnInit, viewChild} from '@angular/core';
import * as THREE from 'three';
import {Clock, PerspectiveCamera, Scene, WebGLRenderer} from 'three';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {tap} from 'rxjs';

const random_number_in_range = (min: number, max: number): number =>  {
  return Math.random() * (max - min) + min;
}

const presets: { [key: string]: {opacity: number, emissive: string, rotation_speed: number}} = {
  'preset_1': {
    opacity: 0.25,
    emissive: '#5a7ce2',
    rotation_speed: 1.01
  }
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
    emissive: ['#222222', Validators.required],
    texture: ['smoke.png', Validators.required],
    opacity_image: [1, Validators.required],
    opacity: [0.15, Validators.required],
    rotation_speed: [0.12, Validators.required],
    preset: ['', Validators.required]
  });

  constructor() {
    this.camera.position.z = 1000;
    this.scene.fog = new THREE.FogExp2(0xc0f0ff, 0.0015);
    this.demoForm.valueChanges
      .pipe(
        tap(value => {
          if(value.texture !== undefined && value.texture !== null){
            this.smoke_texture = new THREE.TextureLoader().load(value.texture);
          }
          if(value.preset !== undefined && value.preset !== null ){
            this.demoForm.patchValue(presets[value.preset], {emitEvent: false})
          }
        })
      )
      .subscribe();
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

    this.smoke_texture = new THREE.TextureLoader().load('smoke.png');
    // smokeTexture.encoding = THREE.sRGBEncoding;
    const smoke_size = new THREE.PlaneGeometry(300, 300);
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
      emissive: new THREE.Color(this.demoForm.value.emissive!),
      opacity: this.demoForm.value.opacity!,
      transparent: true
    });
  }

  private animate() {
    this.delta = this.clock.getDelta();
    this.renderer!.render(this.scene, this.camera);

    this.smoke_particles.forEach(particle => {
      particle.rotation.z += (this.delta * this.demoForm.value.rotation_speed!);
      particle.material = this.generate_material();
    })
  }
}
