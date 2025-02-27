import {Component, ElementRef, HostBinding, HostListener, inject, OnDestroy, OnInit, viewChild} from '@angular/core';
import * as THREE from 'three';
import {
  Clock,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  PlaneGeometry,
  Texture,
  Vector3, BufferGeometry, Line, Vector2, LineBasicMaterial
} from 'three';
import GUI from 'lil-gui';
import {LineMaterial} from 'three/examples/jsm/lines/LineMaterial.js';

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
    // console.log('x/y', rotate_x, rotate_y)

    this.sky_image_ref()!.nativeElement.style.setProperty('--sky-rotate-x', `${rotate_x}deg`);
    this.sky_image_ref()!.nativeElement.style.setProperty('--sky-rotate-y', `${rotate_y}deg`);
  }

  private canvas_ref = viewChild<ElementRef<HTMLCanvasElement>>('canvas_ref')
  private clock: Clock = new THREE.Clock();
  private camera: PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1500)
  private scene: Scene = new THREE.Scene();
  private renderer?: WebGLRenderer;
  private smoke_particles: Mesh<PlaneGeometry, MeshLambertMaterial>[] = [];
  private frameId?: number;
  private texture_loader = new THREE.TextureLoader();
  private smoke_size = new THREE.PlaneGeometry(300, 300);
  private max_smoke_height = -200;
  private min_smoke_height = (window.innerHeight / 2) * -1 * 2;

  public gui_options = {
    background_opacity: 1,
    texture_file: 'particle-smoke.png',
    texture: new Texture(),
    particle_count: 50,
    particle_scale: 2,
    opacity: 0.58,
    emissive: '#5a7ce2',
    rotation_speed: 0.37,
    rising_speed: 20,
    fade_out_speed: 0.001,
    toggle_background: () => this.no_images = !this.no_images,
    stop_effects: () => this.stop_effects()
  }

  constructor() {
    this.setup_gui_controls();
    this.camera.position.z = 1000;
    this.scene.fog = new THREE.FogExp2(0xc0f0ff, 0.0015);
  }

  private async setup_gui_controls(): Promise<void> {
    const gui = new GUI();
    gui.add(this.gui_options, 'background_opacity', 0, 1, 0.1)
    gui.add(this.gui_options, 'texture_file', ['particle-smoke.png', 'particle-fog.png'])
      .onChange((v: string) => {
        this.gui_options.texture = this.texture_loader.load(v);
        this.smoke_particles.forEach(particle => {
          particle.material = this.generate_material();
        })
      })
    gui.add(this.gui_options, 'particle_count', 0, 600, 1)
      .onChange((v: number) => {
        const new_particle_count = +v!;
        if (new_particle_count > this.smoke_particles.length) {
          this.add_smoke_particles(new_particle_count - this.smoke_particles.length);
        } else if (new_particle_count < this.smoke_particles.length) {
          const difference = this.smoke_particles.length - new_particle_count;
          this.smoke_particles.splice(-1 * difference).forEach((item, index) => {
            this.scene.remove(item);
          })
        }
      })
    gui.add(this.gui_options, 'particle_scale', 0.1, 2, 0.1)
      .onChange((v: number) => {
        this.smoke_particles.forEach(particle => {
          particle.scale.set(this.gui_options.particle_scale, this.gui_options.particle_scale, this.gui_options.particle_scale);
        })
      })
    gui.add(this.gui_options, 'opacity', 0, 1, 0.01)
      .onChange((v: number) => {
        this.smoke_particles.forEach(particle => {
          particle.material = this.generate_material();
        })
      })
    gui.addColor(this.gui_options, 'emissive')
      .onChange(() => {
        this.smoke_particles.forEach(particle => {
          particle.material = this.generate_material();
        })
      });
    gui.add(this.gui_options, 'rotation_speed', 0.01, 5, 0.02)
    gui.add(this.gui_options, 'rising_speed', 1, 100, 1)
    gui.add(this.gui_options, 'fade_out_speed', 0.001, 1, 0.001)

    gui.add(this.gui_options, 'toggle_background'); // Button
    gui.add(this.gui_options, 'stop_effects'); // Button
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
    this.drawHorizontalLine();
    const light = new THREE.HemisphereLight(0xd6e6ff, 0xa38c08, 1);
    this.scene.add(light);

    this.gui_options.texture = this.texture_loader.load(this.gui_options.texture_file);
    this.add_smoke_particles(this.gui_options.particle_count!);
    this.renderer.setAnimationLoop(this.animate.bind(this));
  }

  private async drawHorizontalLine(): Promise<void> {
    const material = new LineBasicMaterial({color: 0xffff00}); // Yellow color

    // const material = new LineMaterial({
    //   color: 0xffff00, // Yellow color
    //   linewidth: 3, // Line thickness
    //   resolution: new Vector2(window.innerWidth, window.innerHeight), // Required for LineMaterial
    // });
    const points = [];
    points.push(new Vector3(-1 * window.innerWidth, this.max_smoke_height, 0)); // Start point (adjust -10 for scene width)
    points.push(new Vector3(window.innerWidth, this.max_smoke_height, 0)); // End point (adjust 10 for scene width)

    const geometry = new BufferGeometry().setFromPoints(points);
    const line = new Line(geometry, material);
    this.scene.add(line);
  }

  private add_smoke_particles(count: number) {
    console.log('add_smoke_particles');
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
      map: this.gui_options.texture,
      emissive: new THREE.Color(this.gui_options.emissive!),
      opacity: opacity ?? this.gui_options.opacity!,
      transparent: true
    });
  }

  private generate_particle(size: PlaneGeometry, material: MeshLambertMaterial): Mesh<PlaneGeometry, MeshLambertMaterial> {
    const particle = new THREE.Mesh(size, material);
    particle.scale.set(this.gui_options.particle_scale!, this.gui_options.particle_scale, this.gui_options.particle_scale);
    const [x, y, z] = this.get_random_coordinates();
    particle.position.set(x, y, z);
    particle.rotation.z = Math.random() * 360;
    return particle;
  }

  private get_random_coordinates(): THREE.Vector3 {
    const x = random_number_in_range((window.innerWidth / 2) * -1, window.innerWidth / 2)
    const y = random_number_in_range(this.min_smoke_height, window.innerHeight / 2 * -1);
    const z = Math.random() * 1000 - 100
    return new THREE.Vector3(x, y, z);
  }

  private animate() {
    const delta = this.clock.getDelta();
    this.renderer!.render(this.scene, this.camera);

    this.smoke_particles.forEach((particle, index) => {
      // rotate and rise every particle
      particle.rotation.z += (delta * this.gui_options.rotation_speed!);
      particle.position.y += (delta * this.gui_options.rising_speed!);

      // we need to fade out particles
      // however, if the particle is above the threshold, lets fade it out 3x faster
      if(particle.position.y >= this.max_smoke_height) {
        particle.material.opacity -= this.gui_options.fade_out_speed * 3;
      } else {
        particle.material.opacity -= (this.gui_options.fade_out_speed * Math.random());
      }

      // once the particle is completely gone
      // remove the particle and generate another one
      // TODO: investigate if its worth while just updating its y-index and opacity
      if (particle.material.opacity <= 0) {
        this.scene.remove(particle);
        this.smoke_particles.splice(index, 1);
        console.log(this.smoke_particles.length)
        this.add_smoke_particles(1)
      }
    })
  }
}
