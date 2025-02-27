import {Component, AfterViewInit, ElementRef, ViewChild, HostListener} from '@angular/core';
import * as THREE from 'three';
import {
  Mesh,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
  MeshBasicMaterial,
  Color,
  SphereGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  AmbientLight,
  DirectionalLight
} from 'three';
import {GLTFLoader, TrackballControls} from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas_ref') private canvasRef!: ElementRef;
  @HostListener('click', ['$event']) handle_click(mouse_event: MouseEvent){
    this.onMouseClick(mouse_event);
  }

  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private tiles: { mesh: Mesh; row: number; col: number; clicked: boolean }[] = [];
  private raycaster = new Raycaster();
  private mouse = new Vector2();
  private particles: { mesh: Mesh; velocity: THREE.Vector3; lifetime: number }[] = [];
  private crateModel: THREE.Group | null = null;
  private gui: GUI = new GUI();
  private controls!: TrackballControls;

  private gui_control_options = {
    rotation_speed: 0.01,
    crateScale: 1,
    crateRotationX: 0,
    outlineColor: '#000000',
    crateColor: '#a7947a'
  };

  ngAfterViewInit(): void {
    this.init();
  }

  private loadCrateModel(): void {
    const loader = new GLTFLoader();
    loader.load('/crate.glb', (gltf) => {
      this.crateModel = gltf.scene;
      this.create3x3Board(this.scene);
      this.setupGUI();
      // const light = new THREE.HemisphereLight(0xd6e6ff, 0xa38c08, 1);
      // this.scene.add(light);
      this.addLights();
    }, undefined, (error) => {
      console.error('Error loading crate.glb:', error);
    });
  }

  private addLights(): void {
    const ambientLight = new AmbientLight(0xffffff);
    this.scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 5);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);
  }

  private create3x3Board(scene: Scene, tileSize: number = 1, spacing: number = 0.1): void {
    if (!this.crateModel) return;

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const crateClone = this.crateModel.clone();
        // @ts-ignore
        const tileMesh = crateClone as Mesh;

        const x = (col - 1) * (tileSize + spacing);
        const y = (1 - row) * (tileSize + spacing);

        crateClone.position.set(x, y, 0);
        scene.add(crateClone);

        const edges = new EdgesGeometry(tileMesh.geometry);
        const lineMaterial = new LineBasicMaterial({color: this.gui_control_options.outlineColor});
        const outline = new LineSegments(edges, lineMaterial);
        crateClone.add(outline);

        this.tiles.push({
          mesh: tileMesh,
          row: row,
          col: col,
          clicked: false,
        });
      }
    }
  }


  private createExplosion(position: THREE.Vector3, color: THREE.Color): void {
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const geometry = new SphereGeometry(0.05, 8, 8);
      const material = new MeshBasicMaterial({color: color});
      const particle = new Mesh(geometry, material);
      particle.position.copy(position);

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        0
      );
      this.particles.push({mesh: particle, velocity: velocity, lifetime: 1.0});
      this.scene.add(particle);
    }
  }

  private init(): void {
    this.scene = new Scene();
    this.setupCameraAndRenderer();
    this.loadCrateModel();

    this.animate();
  }

  private setupCameraAndRenderer(): void {
    const aspectRatio = window.innerWidth / window.innerHeight;

    this.camera = new PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    this.camera.position.set(0, 0, 5);

    if (!this.renderer) {
      this.renderer = new WebGLRenderer({canvas: this.canvasRef.nativeElement, alpha: true});
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.controls = new TrackballControls( this.camera, this.renderer.domElement );
  }

  private onMouseClick(event: MouseEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.tiles.map(tile => tile.mesh));


    if (intersects.length > 0) {
      const clickedTile = this.tiles.find(tile => tile.mesh === intersects[0].object);
      if (clickedTile) {
        clickedTile.clicked = !clickedTile.clicked;
        console.log(`Tile at (${clickedTile.col}, ${clickedTile.row}) clicked. Clicked state: ${clickedTile.clicked}`);

        if (clickedTile.clicked) {
          (clickedTile.mesh.material as MeshBasicMaterial).color.set(0xff0000);
          (clickedTile.mesh.material as MeshBasicMaterial).map = null;
          this.createExplosion(clickedTile.mesh.position, new Color(0xff0000));
        } else {
          (clickedTile.mesh.material as MeshBasicMaterial).color.set(0xffffff);
        }
        (clickedTile.mesh.material as MeshBasicMaterial).needsUpdate = true;
      }
    }
  }


  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.mesh.position.add(particle.velocity);
      particle.lifetime -= 0.016;

      if (particle.lifetime <= 0) {
        this.scene.remove(particle.mesh);
        this.particles.splice(i, 1);
      }
    }
    this.updateCrateProperties();
    this.rotateCrates();
  }

  private rotateCrates(): void {
    this.crateModel?.traverse((child) => {
      // if (child instanceof Mesh) {
        child.rotation.x += this.gui_control_options.rotation_speed;
      // } else {
      //   console.log('child is not an instance of Mesh');
      // }
    });
  }


  private onWindowResize(): void {
    this.setupCameraAndRenderer();
  }

  private setupGUI(): void {
    if (!this.crateModel) return;

    this.gui.add(this.gui_control_options, 'crateScale', 0.5, 2).name('Crate Scale').onChange(() => {
      this.updateCrateProperties();
    });
    this.gui.add(this.gui_control_options, 'crateRotationX', 0, Math.PI * 2).name('Crate Rotation X').onChange(() => {
      this.updateCrateProperties();
    });
    this.gui.addColor(this.gui_control_options, 'crateColor').name('Crate Color').onChange(() => {
      this.updateCrateProperties();
    });
    this.gui.addColor(this.gui_control_options, 'outlineColor').name('Outline Color').onChange(() => {
      this.updateOutlineColor();
    });

    this.gui.add(this.gui_control_options, 'rotation_speed', 0, 0.1).name('Rotation Speed').onChange(()=>{
      this.rotateCrates();
    })
  }

  private updateCrateProperties(): void {
    if (!this.crateModel) return;

    this.crateModel.scale.set(this.gui_control_options.crateScale, this.gui_control_options.crateScale, this.gui_control_options.crateScale);
    this.crateModel.rotation.x = this.gui_control_options.crateRotationX;
    // this.crateModel.traverse((child) => {
      // if (child instanceof Mesh) {
        // @ts-ignore
      // (child.material as MeshBasicMaterial).color.set(this.gui_control_options.crateColor);
      // }
    // });
  }

  private updateOutlineColor(): void {
    this.crateModel?.traverse((child) => {
      // if (child instanceof LineSegments) {
        // @ts-ignore
      // (child.material as LineBasicMaterial).color.set(this.gui_control_options.outlineColor);
      // }
    });
  }
}
