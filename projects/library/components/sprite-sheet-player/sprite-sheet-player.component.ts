import {AfterViewInit, Component, ElementRef, Input, OnDestroy, Optional, viewChild} from '@angular/core';

@Component({
  selector: 'lib-sprite-sheet-player',
  imports: [],
  templateUrl: './sprite-sheet-player.component.html',
  styleUrl: './sprite-sheet-player.component.css'
})
export class SpriteSheetPlayerComponent implements AfterViewInit, OnDestroy {
  @Input() sprite_sheet_url: string| undefined;
  @Input() frame_width: number | undefined;
  @Input() total_frames: number| undefined;

  @Optional() @Input() frame_rate: number = 20;
  @Optional() @Input() frames_per_row?: number;
  @Optional() @Input() loop = false
  @Optional() @Input() frame_height: number| undefined;

  private canvas_ref = viewChild<ElementRef<HTMLCanvasElement>>('canvas')

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private temp_image_element: HTMLImageElement = new Image();
  private current_frame: number = 0;
  private animationInterval: any;

  ngAfterViewInit() {
    const required_props = [
      this.sprite_sheet_url,
      this.frame_width
    ];

    if(required_props.includes(undefined)){
      console.log('missing required props', {
        sprite_sheet_url: this.sprite_sheet_url,
        frame_width: this.frame_width,
        frame_height: this.frame_height,
        frame_rate: this.frame_rate,
        frames_per_row: this.frames_per_row,
        loop: this.loop,
      });
      return;
    }


    this.canvas = this.canvas_ref()!.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.temp_image_element.onload = () => {
      this.frame_height = this.frame_height ?? this.temp_image_element.naturalHeight;
      this.total_frames = this.total_frames ?? this.temp_image_element.naturalWidth / this.frame_width!;
      this.frames_per_row = this.frames_per_row ?? this.total_frames;

      this.canvas.width = this.frame_width!;
      this.canvas.height = this.frame_height!;
      this.start_animation();
    };

    this.temp_image_element.src = this.sprite_sheet_url!;
  }

  start_animation() {
    this.animationInterval = setInterval(() => {
      this.draw_frame();
    }, 1000 / this.frame_rate);
  }

  private draw_frame() {

    let row_index, column_index;

    if(this.loop){
      this.current_frame = (this.current_frame + 1) % this.total_frames!;
      row_index = Math.floor(this.current_frame / this.frames_per_row!);
      column_index = this.current_frame % this.frames_per_row!;
    } else {
      if(this.current_frame >= this.total_frames!){
        clearInterval(this.animationInterval)
        return;
      }
      this.current_frame++
      row_index = 0;
      column_index = this.current_frame-1;
    }

    const sourceX = column_index * this.frame_width!;
    const sourceY = row_index * this.frame_height!;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      this.temp_image_element,
      sourceX,
      sourceY,
      this.frame_width!,
      this.frame_height!,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  ngOnDestroy() {
    clearInterval(this.animationInterval);
  }
}
