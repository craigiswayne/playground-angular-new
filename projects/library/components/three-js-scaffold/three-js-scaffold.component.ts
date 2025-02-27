import {AfterViewInit, Component, ElementRef, HostListener, viewChild} from '@angular/core';
import {PerspectiveCamera, Scene, WebGLRenderer} from 'three';
import GUI from 'lil-gui';

@Component({
  template: ''
})
export class ThreeJsScaffoldComponent implements AfterViewInit {
  private canvas_ref= viewChild<ElementRef<HTMLCanvasElement>>('canvas_ref')
  protected scene = new Scene();
  protected camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private gui: GUI = new GUI();
  protected gui_control_options= {};

  @HostListener('window:resize') handle_window_resize() {
    console.log('resized');
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  constructor() {
    this.setup_gui_controls();
  }

  ngAfterViewInit(): void {
    console.log('ngOnInit')
    this.setup();
  }

  /**
   * Run before the setup
   * @protected
   */
  protected pre_setup(): void {

  }

  private setup(): void {
    this.pre_setup();
    this.setup_camera_and_renderer();
    this.render();
  }

  /**
   * This is meant to be overridden
   * @private
   */
  private async setup_gui_controls(){}

  private setup_camera_and_renderer(): void {
    const aspect_ratio = window.innerWidth / window.innerHeight;

    this.camera = new PerspectiveCamera(75, aspect_ratio, 0.1, 1000);
    this.camera.position.set(0, 0, 5);

    this.renderer = new WebGLRenderer({
      canvas: this.canvas_ref()!.nativeElement,
      alpha: true
    });

    this.renderer!.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  /**
   * Override this method to run functionality before every frame render
   * @protected
   */
  protected pre_render(): void {}

  /**
   * This is run every frame
   * All we're doing is telling the renderer to re-render
   * @protected
   */
  private render(): void {
    this.pre_render();
    this.renderer.render(this.scene, this.camera);
  }
}
