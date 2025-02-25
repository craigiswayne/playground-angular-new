import {Component, ElementRef, HostBinding, HostListener, inject, OnDestroy, OnInit, viewChild} from '@angular/core';
import * as THREE from 'three';
import {Clock, Mesh, MeshLambertMaterial, PerspectiveCamera, Scene, WebGLRenderer, PlaneGeometry} from 'three';
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
  },
  'preset_2': {
    opacity: 0.46,
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
  private texture_loader = new THREE.TextureLoader();
  private smoke_size = new THREE.PlaneGeometry(300, 300);


  private readonly formBuilder = inject(FormBuilder);
  public demoForm = this.formBuilder.group({
    opacity_image: [1, Validators.required],
    texture: ['smoke.png', Validators.required],
    particle_count: [90, Validators.required],
    opacity: [0.15, Validators.required],
    emissive: ['#222222', Validators.required],
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
            this.smoke_texture = this.texture_loader.load(value.texture);
          }

          const new_particle_count = +this.demoForm.value.particle_count!;

          if(new_particle_count > this.smoke_particles.length ){
            const smoke_particle = this.generate_particle(this.smoke_size, this.generate_material());
            this.scene.add(smoke_particle);
            this.smoke_particles.push(smoke_particle);
          } else if (new_particle_count < this.smoke_particles.length) {
            const difference = this.smoke_particles.length - new_particle_count;
            this.smoke_particles.splice(-1*difference).forEach((item, index) => {
              this.scene.remove(item);
            })
          }
        })
      )
      .subscribe();

    this.demoForm.controls.preset.valueChanges.subscribe(value => {
      if(value !== undefined && value !== null){
        this.demoForm.patchValue(presets[value], {emitEvent: false})
      }
    })
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

    this.smoke_texture = this.texture_loader.load('smoke.png');
    const smoke_material = this.generate_material();

    new Array(+this.demoForm.value.particle_count!).fill('').forEach(() => {
      const smoke_particle = this.generate_particle(this.smoke_size, smoke_material);
      this.scene.add(smoke_particle);
      this.smoke_particles.push(smoke_particle);
    })

    this.renderer.setAnimationLoop(this.animate.bind(this));
  }

  private generate_material(): MeshLambertMaterial {
    return new THREE.MeshLambertMaterial({
      map: this.smoke_texture,
      emissive: new THREE.Color(this.demoForm.value.emissive!),
      opacity: this.demoForm.value.opacity!,
      transparent: true
    });
  }

  private generate_particle(size: PlaneGeometry, material: MeshLambertMaterial): Mesh<PlaneGeometry, MeshLambertMaterial> {
    const particle = new THREE.Mesh(size, material);
    particle.scale.set(2, 2, 2);
    const x = random_number_in_range((window.innerWidth/2)*-1, window.innerWidth/2)
    const y = random_number_in_range((window.innerHeight/2)*-1, -200)
    const z = Math.random() * 1000 - 100
    particle.position.set(x, y, z);
    particle.rotation.z = Math.random() * 360;
    return particle;
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
