import {Component, HostListener} from '@angular/core';
import * as THREE from 'three';
import {
  CanvasTexture, Color,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry, Raycaster,
  Scene, SphereGeometry,
  Vector2, Vector3,
} from 'three';
import {ThreeJsSceneComponent} from '../../../library/components/three-js-scene/three-js-scene.component';

interface Tile {
  mesh: Mesh,
  row: number,
  col: number,
  clicked: boolean,
  is_mine: boolean
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent extends ThreeJsSceneComponent {

  private tiles: Tile[] = [];
  private raycaster = new Raycaster();
  private mouse = new Vector2();
  private particles: { mesh: Mesh, velocity: THREE.Vector3, lifetime: number }[] = [];

  @HostListener('click', ['$event']) on_mouse_click(event: MouseEvent) {
    // Calculate normalized mouse coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Calculate objects intersecting the picking ray
    const tiles_clicked = this.raycaster.intersectObjects(this.tiles.map(tile => tile.mesh));
    if(tiles_clicked.length === 0 ) {
      return;
    }
    const tile_at_position = this.tiles.find(tile => tile.mesh === tiles_clicked[0].object);
    if(!tile_at_position){
      return;
    }

    if(tile_at_position.clicked){
      return;
    }

    tile_at_position.clicked = true;
    console.log(`Tile at (${tile_at_position.col}, ${tile_at_position.row}) index: clicked. Clicked state: ${tile_at_position.clicked}`);
    const material = tile_at_position.mesh.material as MeshBasicMaterial;

    if(tile_at_position.is_mine){
      material.color.set(0xd36d6d);
      material.map = null;
      this.create_explosion(tile_at_position.mesh.position, new Color(0xff0000)); // Create explosion
    } else {
      material.color.set(0x008000);
      material.map = this.createGradientTile(256, 256);
    }
    material.needsUpdate = true;
  }

  protected override init() {
    this.create3x3Board(this.scene);
    super.init();
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

  /**
   *
   * @param width
   * @param height
   * @private
   *
   * @throws Error
   */
  private createGradientTile(width: number, height: number): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas is not available');
    }

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'black');
    gradient.addColorStop(1, 'gray');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return new CanvasTexture(canvas);
  }

  private create3x3Board(scene: Scene, tileSize = 1, spacing = 0.1) {
    console.log('create3x3Board')
    const total_rows = 3,
      total_columns = 3,
      total_mines = Math.round(total_rows*total_rows*0.333);

    console.log(total_rows, total_columns, total_mines);
    const mines: number[] = [];

    // TODO there is a bug here where mines are not being added
    // move this code out to an asynchronous function, then on the click function, check if the tile index is a mine
    while(mines.length < total_mines){
      console.log('adding mine', mines.length, total_mines);
      const random_number = Math.round(Math.random()*((total_rows*total_columns)-1));
      if(mines.includes(random_number)){
        return;
      }
      mines.push(random_number);
    }
    console.log('mines', mines);
    this.tiles = [];
    for (let row = 0; row < total_rows; row++) {
      console.log('creating tile');
      for (let col = 0; col < total_columns; col++) {
        const tileTexture = this.createGradientTile(256, 256); // Adjust resolution as needed
        if (!tileTexture) continue; // Skip if texture creation failed

        const tileMaterial = new MeshBasicMaterial({map: tileTexture});
        const tileGeometry = new PlaneGeometry(tileSize, tileSize);
        const tileMesh: Mesh = new Mesh(tileGeometry, tileMaterial);

        const x = (col - 1) * (tileSize + spacing);
        const y = (1 - row) * (tileSize + spacing); // Invert row for typical coordinate systems.

        tileMesh.position.set(x, y, 0); // Position in 2D plane
        scene.add(tileMesh);
        const tile_index = row * total_columns + col;
        this.tiles.push({
          mesh: tileMesh,
          row: row,
          col: col,
          clicked: false,
          is_mine: mines.includes(tile_index)
        });
      }
    }
    return this.tiles;
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
