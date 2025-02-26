import {Component, ElementRef, HostListener, OnInit, viewChild} from '@angular/core';
import * as THREE from 'three';
import {
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry, Raycaster,
  Scene,
  Vector2,
  WebGLRenderer
} from 'three';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private canvas_ref = viewChild<ElementRef<HTMLCanvasElement>>('canvas_ref')
  private scene = new Scene();

  private camera?: OrthographicCamera;
  private renderer?: WebGLRenderer;
  private tiles: { mesh: Mesh, row: number, col: number, clicked: boolean }[] = [];
  private raycaster = new Raycaster();
  private mouse = new Vector2();

  @HostListener('click', ['$event']) on_mouse_click(event: MouseEvent) {
    // Calculate normalized mouse coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera!);

    // Calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(this.tiles.map(tile => tile.mesh));
    console.log('intersects', intersects);
    if (intersects.length > 0) {
      const clickedTile = this.tiles.find(tile => tile.mesh === intersects[0].object);
      if (clickedTile) {
        clickedTile.clicked = !clickedTile.clicked;
        console.log(`Tile at (${clickedTile.col}, ${clickedTile.row}) clicked. Clicked state: ${clickedTile.clicked}`);

        if (clickedTile.clicked) {
          (clickedTile.mesh.material as MeshBasicMaterial).color.set(0x008000);
        } else {
          (clickedTile.mesh.material as MeshBasicMaterial).color.set(0xffffff);
          (clickedTile.mesh.material as MeshBasicMaterial).map = this.createGradientTile(256, 256);
        }
        (clickedTile.mesh.material as MeshBasicMaterial).needsUpdate = true;
      }
    }
  }

  @HostListener('window:resize') setupCameraAndRenderer() {
    console.log('resized');
    const aspectRatio = window.innerWidth / window.innerHeight;
    const viewSize = 3; // Adjust this to control the overall view size

    this.camera = new THREE.OrthographicCamera(
      -viewSize * aspectRatio, // left
      viewSize * aspectRatio,  // right
      viewSize,                // top
      -viewSize,               // bottom
      0.1,                     // near
      10                       // far
    );
    this.camera.position.z = 5;

    if (!this.renderer) { // Create renderer only once
      this.renderer = new THREE.WebGLRenderer({canvas: this.canvas_ref()!.nativeElement});
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer!.render(this.scene, this.camera!);

  }

  ngOnInit(): void {
    this.init()
  }

  private init() {
    this.setupCameraAndRenderer();
    this.create3x3Board(this.scene);
    this.renderer!.render(this.scene, this.camera!);
    this.renderer!.setAnimationLoop(this.animate.bind(this))
  }

  private animate() {
    this.renderer!.render(this.scene, this.camera!);
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
    this.tiles = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const tileTexture = this.createGradientTile(256, 256); // Adjust resolution as needed
        if (!tileTexture) continue; // Skip if texture creation failed

        const tileMaterial = new MeshBasicMaterial({map: tileTexture});
        const tileGeometry = new PlaneGeometry(tileSize, tileSize);
        const tileMesh: Mesh = new Mesh(tileGeometry, tileMaterial);

        const x = (col - 1) * (tileSize + spacing);
        const y = (1 - row) * (tileSize + spacing); // Invert row for typical coordinate systems.

        tileMesh.position.set(x, y, 0); // Position in 2D plane
        scene.add(tileMesh);
        this.tiles.push({
          mesh: tileMesh,
          row: row,
          col: col,
          clicked: false
        });
      }
    }
    return this.tiles;
  }

}
