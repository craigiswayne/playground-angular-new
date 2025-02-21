import {AfterViewInit, Component, ElementRef, viewChild} from '@angular/core';
import {Globals} from './global';
import { ParticleEmitter } from './ParticleEmitter.class';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  private canvas_ref = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private context!: CanvasRenderingContext2D;
  private smoke_1 = new ParticleEmitter();
  private smoke_2 = new ParticleEmitter();
  private smoke_3 = new ParticleEmitter();

  private lastRender = new Date().getTime();

  ngAfterViewInit() {
    this.init();
  }

  private init(): void {
    const canvas = this.canvas_ref()?.nativeElement!;
    this.context = canvas.getContext('2d')!;
    canvas.width = Globals.CANVAS_WIDTH;
    canvas.height = Globals.CANVAS_HEIGHT;

    const img_smoke_1 = new Image(),
      img_smoke_2 = new Image(),
      img_smoke_3 = new Image();

    img_smoke_1.src = '/smoke_1.webp';
    img_smoke_2.src = '/smoke_2.webp';
    img_smoke_3.src = '/smoke_3.webp';

    this.smoke_1.m_alpha = 0.2;
    this.smoke_1.m_speed = 0.001;
    this.smoke_1.init(.142, .631, 90, img_smoke_1);

    this.smoke_2.m_alpha = 0.3;
    this.smoke_2.init(.322, .753, 90, img_smoke_2);

    this.smoke_3.m_alpha = 0.1;
    this.smoke_3.m_speed = 0.02;
    this.smoke_3.init(.222, .553, 90, img_smoke_3);

    requestAnimationFrame(this.render.bind(this))
  }

  private render(): void {
    const timeElapsed = new Date().getTime() - this.lastRender;
    this.lastRender = new Date().getTime();
    this.context.clearRect(Globals.dirtyLeft, Globals.dirtyTop, Globals.dirtyRight - Globals.dirtyLeft, Globals.dirtyBottom - Globals.dirtyTop);
    Globals.dirtyLeft = 1000;
    Globals.dirtyTop = 1000;
    Globals.dirtyRight = 0;
    Globals.dirtyBottom = 0;

    this.smoke_1.update(timeElapsed);
    this.smoke_1.render(this.context);

    this.smoke_2.update(timeElapsed);
    this.smoke_2.render(this.context);

    this.smoke_3.update(timeElapsed);
    this.smoke_3.render(this.context);

    Globals.windVelocity += (Math.random() - 0.5) * 0.002;
    if (Globals.windVelocity > 0.015) {
      Globals.windVelocity = 0.015;
    }
    if (Globals.windVelocity < 0.0) {
      Globals.windVelocity = 0.0;
    }
    requestAnimationFrame(this.render.bind(this))
  }
}
