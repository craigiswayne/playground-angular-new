import {Component, ElementRef, HostBinding, HostListener, inject, OnDestroy, OnInit, viewChild} from '@angular/core';
import * as THREE from 'three';
import {Clock, Mesh, MeshLambertMaterial, PerspectiveCamera, Scene, WebGLRenderer, PlaneGeometry} from 'three';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {merge, takeLast, tap} from 'rxjs';

const random_number_in_range = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
}

const presets: {
  [key: string]: Partial<{
    opacity: number,
    emissive: string,
    rotation_speed: number,
    rising_speed: number,
    fade_out_speed: number
  }>
} = {
  'preset_1': {
    opacity: 0.25,
    emissive: '#5a7ce2',
    rotation_speed: 1.01
  },
  'preset_2': {
    opacity: 0.46,
    emissive: '#5a7ce2',
    rotation_speed: 1.01,
    rising_speed: 20,
    fade_out_speed: 0.1500
  },
  'preset_3': {
    opacity: 0.58,
    emissive: '#5a7ce2',
    rotation_speed: 0.37,
    rising_speed: 20,
    fade_out_speed: 0.1500
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

  private sky_image_ref = viewChild<ElementRef<HTMLImageElement>>('sky_image');

  // TODO move this to a directive or something
  @HostListener('mouseleave') on_mouse_leave() {
    // this.sky_image_ref()!.nativeElement.style.removeProperty('sky-rotate-x');
    // this.sky_image_ref()!.nativeElement.style.removeProperty('sky-rotate-y');
  }

  @HostListener('mousemove', ['$event']) on_mouse_move(mouse_event: MouseEvent) {
    const rotate_x_deg_minimum = -10;
    const rotate_x_deg_maximum = 10;
    const rotate_x_deg_length = rotate_x_deg_maximum - rotate_x_deg_minimum;
    const x_percent = mouse_event.clientX / window.innerWidth
    const rotate_x = rotate_x_deg_minimum + (rotate_x_deg_length * x_percent)

    const rotate_y_deg_minimum = -10;
    const rotate_y_deg_maximum = 10;
    const rotate_y_deg_length = rotate_y_deg_maximum - rotate_y_deg_minimum;
    const y_percent = mouse_event.clientY / window.innerHeight
    const rotate_y = rotate_y_deg_minimum + (rotate_y_deg_length * y_percent)

    //  | ---------------------------------------|
    // -10 ------------------------------------ 10
    //                      x%

    // console.log('mouse_event', mouse_event);
    // console.log('window dimensions', window.innerWidth, window.innerHeight);
    // console.log('x%', x_percent);
    // console.log('y%', y_percent);
    //
    console.log('x/y', rotate_x, rotate_y)

    this.sky_image_ref()!.nativeElement.style.setProperty('--sky-rotate-x', `${rotate_x}deg`);
    this.sky_image_ref()!.nativeElement.style.setProperty('--sky-rotate-y', `${rotate_y}deg`);
  }

  private canvas_ref = viewChild<ElementRef<HTMLCanvasElement>>('canvas_ref')
  private clock: Clock = new THREE.Clock();
  private camera: PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1500)
  private scene: Scene = new THREE.Scene();
  private renderer?: WebGLRenderer;
  private smoke_particles: Mesh<PlaneGeometry, MeshLambertMaterial>[] = [];
  private smoke_texture?: THREE.Texture;
  private frameId?: number;
  private texture_loader = new THREE.TextureLoader();
  private smoke_size = new THREE.PlaneGeometry(300, 300);
  private max_smoke_height = -200;
  private min_smoke_height = (window.innerHeight / 2) * -1;


  private readonly formBuilder = inject(FormBuilder);
  public demoForm = this.formBuilder.group({
    background_opacity: [1, Validators.required],
    texture: ['smoke.png', Validators.required],
    particle_count: [90, Validators.required],
    particle_scale: [2, Validators.required],
    opacity: [0.15, Validators.required],
    emissive: ['#222222', Validators.required],
    rotation_speed: [0.12, Validators.required],
    rising_speed: [20, Validators.required],
    fade_out_speed: [0.0005, Validators.required],
    preset: ['', Validators.required]
  });

  constructor() {
    this.camera.position.z = 1000;
    this.scene.fog = new THREE.FogExp2(0xc0f0ff, 0.0015);

    this.demoForm.controls.particle_count.valueChanges.subscribe(value => {
      const new_particle_count = +value!;
      if (new_particle_count > this.smoke_particles.length) {
        this.add_smoke_particles(new_particle_count - this.smoke_particles.length);
      } else if (new_particle_count < this.smoke_particles.length) {
        const difference = this.smoke_particles.length - new_particle_count;
        this.smoke_particles.splice(-1 * difference).forEach((item, index) => {
          this.scene.remove(item);
        })
      }
    })

    this.demoForm.controls.preset.valueChanges.subscribe(value => {
      if (value === undefined || value === null || value === '') {
        this.demoForm.reset()
        return;
      }
      this.demoForm.patchValue(presets[value]);
    })

    this.demoForm.controls.emissive.valueChanges.subscribe(value => {
      this.demoForm.controls.emissive.setValue(value, {emitEvent: false});
      this.smoke_particles.forEach(particle => {
        particle.material = this.generate_material();
      })
    })

    this.demoForm.controls.particle_scale.valueChanges.subscribe(value => {
      this.smoke_particles.forEach(particle => {
        particle.scale.set(this.demoForm.value.particle_scale!, this.demoForm.value.particle_scale!, this.demoForm.value.particle_scale!);
      })
    })

    merge(...[
      this.demoForm.controls.texture.valueChanges,
      this.demoForm.controls.opacity.valueChanges
    ])
      .pipe(
        tap((v) => {
          this.smoke_texture = this.texture_loader.load(this.demoForm.value.texture!);
          this.smoke_particles.forEach(particle => {
            particle.material = this.generate_material();
          })
        })
      )
      .subscribe()
  }

  @HostBinding('class.no-images') no_images = false;

  @HostListener('window:resize') on_window_resize() {
    this.setup_camera_and_renderer();
  }

  ngOnInit() {
    this.setup_three_js();
  }

  ngOnDestroy() {
    this.stop_effects();
  }

  private setup_camera_and_renderer() {
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

    this.smoke_texture = this.texture_loader.load(this.demoForm.value.texture!);
    this.add_smoke_particles(+this.demoForm.value.particle_count!);
    this.renderer.setAnimationLoop(this.animate.bind(this));
  }

  private add_smoke_particles(count: number) {
    new Array(count).fill('').forEach(() => {
      const smoke_material = this.generate_material();
      const smoke_particle = this.generate_particle(this.smoke_size, smoke_material);
      this.scene.add(smoke_particle);
      this.smoke_particles.push(smoke_particle);
    })
  }

  /**
   * the material in use is the same for all objects
   * @param opacity
   * @private
   */
  private generate_material(opacity?: number): MeshLambertMaterial {
    return new THREE.MeshLambertMaterial({
      map: this.smoke_texture,
      emissive: new THREE.Color(this.demoForm.value.emissive!),
      opacity: opacity ?? this.demoForm.value.opacity!,
      transparent: true
    });
  }

  private generate_particle(size: PlaneGeometry, material: MeshLambertMaterial): Mesh<PlaneGeometry, MeshLambertMaterial> {
    const particle = new THREE.Mesh(size, material);
    particle.scale.set(this.demoForm.value.particle_scale!, this.demoForm.value.particle_scale!, this.demoForm.value.particle_scale!);
    const [x, y, z] = this.get_random_coordinates();
    particle.position.set(x, y, z);
    particle.rotation.z = Math.random() * 360;
    return particle;
  }

  private get_random_coordinates(): THREE.Vector3 {
    const x = random_number_in_range((window.innerWidth / 2) * -1, window.innerWidth / 2)
    const y = random_number_in_range(this.min_smoke_height, this.max_smoke_height);
    const z = Math.random() * 1000 - 100
    return new THREE.Vector3(x, y, z);
  }

  private animate() {
    const delta = this.clock.getDelta();
    this.renderer!.render(this.scene, this.camera);

    this.smoke_particles.forEach((particle, index) => {
      particle.rotation.z += (delta * this.demoForm.value.rotation_speed!);
      particle.position.y += (delta * this.demoForm.value.rising_speed!);
      if (particle.material.opacity < this.demoForm.value.opacity! && particle.position.y < this.max_smoke_height) {
        particle.material.opacity += (delta * this.demoForm.value.fade_out_speed!);
      }


      /**
       * if the particle is higher than the ceiling,
       * lets start to fade out the smoke / mist
       * when it is finally zero, we'll:
       *  > reset the particle's
       *  > put its opacity back to the original value
       */
      if (particle.position.y > this.max_smoke_height) {
        const new_opacity = particle.material.opacity - (delta * this.demoForm.value.fade_out_speed!);
        particle.material.opacity = new_opacity;
        if (new_opacity < 0) {
          const [x, y, z] = this.get_random_coordinates();
          particle.position.set(x, y, z);
        }
      }
    })
  }
}
