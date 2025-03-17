import {AfterViewInit, Component, ElementRef, inject, signal, viewChild} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import GUI from 'lil-gui';
@Component({
  selector: 'app-root',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {

  private source_preview_container_ref = viewChild<ElementRef<HTMLDivElement>>('source_preview_container');
  private canvas_ref = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private ctx!: CanvasRenderingContext2D;

  // DRAG AND DROP IMAGE
  // IMAGE SHOULD NOT TAKE UP ENTIRE SCREEN
  // VISUALLY PLAY
  private form_builder = inject(FormBuilder);
  public gui_options = {
    sprite_sheet_width: 0,
    sprite_sheet_height: 0,
    frames_per_row: 1,
    number_of_rows: 1,
    total_frames: 0,
    frame_height: 0,
    frame_rate: 1,
    padding_top: 0,
    padding_right: 0,
    padding_bottom: 0,
    padding_left: 0,
    image_natural_width: 0,
    image_natural_height: 0,
    play: this.play_animation.bind(this)
  };
  public form = this.form_builder.group({
    file: [null, [Validators.required]]
  })
  public frames = signal<number[]>([])
  private current_frame = 0;
  public temp_image_element: HTMLImageElement = new Image();
  private animationInterval: any;

  constructor() {
    this.temp_image_element.addEventListener('load', this.onImageLoad.bind(this));
  }

  ngAfterViewInit(): void {
    const gui = new GUI();
    gui.add(this.gui_options, 'sprite_sheet_width').listen().disable();

    gui.add(this.gui_options, 'frames_per_row', 1).onChange((v: number) => {
      this.source_preview_container_ref()?.nativeElement.style.setProperty('--frames_per_row', `${v}`);
      this.gui_options.total_frames = v * this.gui_options.number_of_rows;
      this.frames.set(Array(this.gui_options.total_frames).fill(0).map((_, i) => i + 1));
    })

    gui.add(this.gui_options, 'number_of_rows', 1).onChange((v: number) => {
      this.source_preview_container_ref()?.nativeElement.style.setProperty('--rows', `${v}`);
      this.gui_options.total_frames = v * this.gui_options.frames_per_row;
      this.frames.set(Array(this.gui_options.total_frames).fill(0).map((_, i) => i + 1));
    })
    gui.add(this.gui_options, 'total_frames', 1)
      .listen()
      .onChange((v: number) => {
        this.frames.set(Array(v).fill(0).map((_, i) => i + 1));
      })
    gui.add(this.gui_options, 'frame_rate', 1, 60, 1)
    gui.add(this.gui_options, 'padding_top', 0).onChange((v: number) => {
      this.source_preview_container_ref()?.nativeElement.style.setProperty('--padding-top', `${v}px`);
    })
    gui.add(this.gui_options, 'padding_right', 0).onChange((v: number) => {
      this.source_preview_container_ref()?.nativeElement.style.setProperty('--padding-right', `${v}px`);
    })
    gui.add(this.gui_options, 'padding_bottom', 0).onChange((v: number) => {
      this.source_preview_container_ref()?.nativeElement.style.setProperty('--padding-bottom', `${v}px`);
    })
    gui.add(this.gui_options, 'padding_left', 0).onChange((v: number) => {
      this.source_preview_container_ref()?.nativeElement.style.setProperty('--padding-left', `${v}px`);
    })
    gui.add(this.gui_options, 'play');


    this.ctx = this.canvas_ref()!.nativeElement.getContext('2d')!;
  }

  public onFileChange(file_upload_event: Event){
    const input_element = file_upload_event.target as HTMLInputElement;
    const file = input_element.files?.[0] ?? null;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.temp_image_element.src = e.target.result;
      }
      reader.readAsDataURL(file);
    } else {
    }
  }

  public onImageLoad(){
    this.gui_options.sprite_sheet_width = this.temp_image_element.naturalWidth;
    this.gui_options.sprite_sheet_height = this.temp_image_element.naturalHeight;
    this.gui_options.image_natural_width = this.temp_image_element.naturalWidth;
  }

  private play_animation(){
    this.ctx.clearRect(0, 0, this.canvas_ref()!.nativeElement.width, this.canvas_ref()!.nativeElement.height);
    this.animationInterval = setInterval(() => {
      this.draw_frame();
    }, 1000 / this.gui_options.frame_rate);
  }

  private draw_frame() {
    let row_index, column_index;

    // if(this.loop){
      this.current_frame = (this.current_frame + 1) % this.gui_options.total_frames;
      row_index = Math.floor(this.current_frame / this.gui_options.frames_per_row);
      column_index = this.current_frame % this.gui_options.frames_per_row!;
    // } else {
    //   if(this.current_frame >= this.total_frames!){
    //     clearInterval(this.animationInterval)
    //     return;
    //   }
    //   this.current_frame++
    //   row_index = 0;
    //   column_index = this.current_frame-1;
    // }

    const frame_width = this.gui_options.sprite_sheet_width / this.gui_options.frames_per_row;
    const frame_height   = this.gui_options.sprite_sheet_height / this.gui_options.number_of_rows;
    const sourceX = column_index * frame_width;
    const sourceY = row_index * frame_height;

    const canvas_width = this.canvas_ref()!.nativeElement.width;
    const canvas_height = this.canvas_ref()!.nativeElement.height;

    this.ctx.clearRect(0, 0, this.canvas_ref()!.nativeElement.width, this.canvas_ref()!.nativeElement.height);
    this.ctx.drawImage(
      this.temp_image_element,
      sourceX,
      sourceY,
      frame_width,
      frame_height,
      0,
      0,
      canvas_width,
      canvas_height
    );
  }

}
