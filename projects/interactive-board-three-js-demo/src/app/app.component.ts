import {Component, HostListener, inject} from '@angular/core';
import {
  Color,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry, Raycaster,
  SphereGeometry, Texture, TextureLoader,
  Vector2, Vector3,
} from 'three';
import {ThreeJsScaffoldComponent} from '../../../library/components/three-js-scaffold/three-js-scaffold.component';
import {MyThreeJsService} from '../../../library/services/my-three-js/my-three-js.service';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

interface Tile {
  index: number,
  mesh: Mesh,
  row: number,
  col: number,
  clicked: boolean
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent extends ThreeJsScaffoldComponent {

  private myThreeJS = inject(MyThreeJsService);

  private mines: number[] = [];
  private tiles: Tile[] = [];
  private raycaster = new Raycaster();
  private mouse = new Vector2();
  private particles: { mesh: Mesh, velocity: Vector3, lifetime: number }[] = [];
  private texture_loader = new TextureLoader();
  private bomb_image!: Texture;
  private smiley_face!: Texture;
  private box_question!: Texture;

  @HostListener('click', ['$event']) on_mouse_click(event: MouseEvent) {
    // Calculate normalized mouse coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Calculate objects intersecting the picking ray
    const tiles_clicked = this.raycaster.intersectObjects(this.tiles.map(tile => tile.mesh));
    if (tiles_clicked.length === 0) {
      return;
    }
    const tile_at_position = this.tiles.find(tile => tile.mesh === tiles_clicked[0].object);
    if (!tile_at_position) {
      return;
    }

    this.handle_tile_click(tile_at_position);
  }

  protected override pre_setup() {
    this.determine_mine_positions();
    this.load_textures();
    const loader = new GLTFLoader()
    loader.load('crate.glb', (gltf) => {
      this.scene.add(gltf.scene);

      // Optional: Add animations if your model has them
      // if (gltf.animations && gltf.animations.length > 0) {
      //   const mixer = new THREE.AnimationMixer(gltf.scene);
      //   gltf.animations.forEach((clip) => {
      //     mixer.clipAction(clip).play();
      //   });
      //
      //   // Add mixer to your animation loop
      //   function animate() {
      //     requestAnimationFrame(animate);
      //     mixer.update(0.01); // Update the animation mixer
      //     renderer.render(scene, camera);
      //   }
      //   animate();
      // } else {
      //   // If no animations, just render the scene.
      //   function animate() {
      //     requestAnimationFrame(animate);
      //     this.renderer.render(scene, camera);
      //   }
      //   animate();
      // }
    })
    this.create3x3Board();
  }

  protected override pre_render() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.mesh.position.add(particle.velocity);
      particle.lifetime -= 0.016; // Approximate 60 FPS

      if (particle.lifetime <= 0) {
        this.scene.remove(particle.mesh);
        this.particles.splice(i, 1);
      }
    }
  }

  private async determine_mine_positions(): Promise<void> {
    const total_tiles = 9;
    const total_mines = 3;
    while (this.mines.length < total_mines) {
      const random_number = Math.round(Math.random() * (total_tiles - 1));
      if (this.mines.includes(random_number)) {
        continue;
      }
      console.log('adding mine', random_number);
      this.mines.push(random_number);
    }
    console.log('mines', this.mines);
  }

  private async load_textures(): Promise<void> {
    this.bomb_image = this.texture_loader.load('/bomb.png');
    this.smiley_face = this.texture_loader.load('/happy.png')
    this.box_question = this.texture_loader.load('/box-question.png')
  }

  private create_tile_mesh(tile_size: number): Mesh {
    const texture = this.box_question;
    const tileMaterial = new MeshBasicMaterial({map: texture});
    const tileGeometry = new PlaneGeometry(tile_size, tile_size);
    return new Mesh(tileGeometry, tileMaterial);
  }

  private create3x3Board(tileSize = 1, spacing = 0.1) {
    const total_rows = 3,
      total_columns = 3;

    for (let row = 0; row < total_rows; row++) {
      for (let col = 0; col < total_columns; col++) {
        const tile_mesh = this.create_tile_mesh(tileSize);
        const x = (col - 1) * (tileSize + spacing);
        const y = (1 - row) * (tileSize + spacing); // Invert row for typical coordinate systems.
        tile_mesh.position.set(x, y, 0); // Position in 2D plane
        this.scene.add(tile_mesh);
        this.tiles.push({
          mesh: tile_mesh,
          row: row,
          col: col,
          clicked: false,
          index: row * total_columns + col
        });
      }
    }
    return this.tiles;
  }

  private async handle_tile_click(tile: Tile): Promise<void> {
    if (tile.clicked) {
      return;
    }

    tile.clicked = true;
    const material = tile.mesh.material as MeshBasicMaterial;
    const is_mine = this.mines.includes(tile.index);
    if (is_mine) {
      material.map = this.bomb_image;
      material.transparent = true;
      material.opacity = 1;
      this.create_explosion(tile.mesh.position, new Color(0xff0000));
    } else {
      material.transparent = true;
      material.map = this.smiley_face;
    }
    material.needsUpdate = true;
  }

  private create_explosion(position: Vector3, color: Color): void {
    console.log('create_explosion');
    const particleCount = 20; // Number of particles in the explosion
    for (let i = 0; i < particleCount; i++) {
      const geometry = new SphereGeometry(0.05, 8, 8); // Small sphere particles
      const material = new MeshBasicMaterial({color: color});
      const particle = new Mesh(geometry, material);
      particle.position.copy(position);

      const velocity = new Vector3(
        (Math.random() - 0.5) * 0.2, // Random velocity
        (Math.random() - 0.5) * 0.2,
        0
      );
      this.particles.push({mesh: particle, velocity: velocity, lifetime: 1.0}); // Lifetime in seconds
      this.scene.add(particle);
    }
  }

}
