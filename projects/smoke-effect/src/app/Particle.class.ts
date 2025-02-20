import {ParticleEmitter} from './ParticleEmitter.class';
import {Changeables} from './global';

export class Particle {
  // @ts-ignore
  private m_x: number;
  // @ts-ignore
  private m_y: number;
  // @ts-ignore
  private m_age: number;
  // @ts-ignore
  private m_xVector: number;
  // @ts-ignore
  private m_yVector: number;
  // @ts-ignore
  private m_scale: number;
  // @ts-ignore
  private m_alpha: number;
  // @ts-ignore
  private m_canRegen: boolean;
  // @ts-ignore
  private m_timeDie;
  // @ts-ignore
  private m_emitter: ParticleEmitter;

  public init(emitter: ParticleEmitter, age: number) {
    this.m_age = age;
    this.m_emitter = emitter;
    this.m_canRegen = true;
    this.startRand();
  }

  private isAlive(): boolean {
    return this.m_age < this.m_timeDie;
  }

  private startRand() {
    // smoke rises and spreads
    this.m_xVector = Math.random() * 0.5 - 0.25;
    this.m_yVector = -1.5 - Math.random();
    this.m_timeDie = 20000 + Math.floor(Math.random() * 12000);

    var invDist = 1.0 / Math.sqrt(this.m_xVector * this.m_xVector
      + this.m_yVector * this.m_yVector);
    // normalise speed
    this.m_xVector = this.m_xVector * invDist * this.m_emitter.m_speed;
    this.m_yVector = this.m_yVector * invDist * this.m_emitter.m_speed;
    // starting position within a 20 pixel area
    this.m_x = (this.m_emitter.m_x + Math.floor(Math.random() * 20) - 10);
    this.m_y = (this.m_emitter.m_y + Math.floor(Math.random() * 20) - 10);
    // the initial age may be > 0. This is so there is already a smoke trail
    // in
    // place at the start
    this.m_x += (this.m_xVector + Changeables.windVelocity) * this.m_age;
    this.m_y += this.m_yVector * this.m_age;
    this.m_scale = 0.01;
    this.m_alpha = 0.0;
  }

  public update(timeElapsed: number) {
    this.m_age += timeElapsed;
    if (!this.isAlive()) {
      // smoke eventually dies
      if (Math.random() > this.m_emitter.m_dieRate) {
        this.m_canRegen = false;
      }
      if (!this.m_canRegen) {
        return;
      }
      // regenerate
      this.m_age = 0;
      this.startRand();
      return;
    }
    // At start the particle fades in and expands rapidly (like in real
    // life)
    var fadeIn = this.m_timeDie * 0.05;
    var startScale;
    var maxStartScale = 0.3;
    if (this.m_age < fadeIn) {
      this.m_alpha = this.m_age / fadeIn;
      startScale = this.m_alpha * maxStartScale;
      // y increases quicker because particle is expanding quicker
      this.m_y += this.m_yVector * 2.0 * timeElapsed;
    } else {
      this.m_alpha = 1.0 - (this.m_age - fadeIn)
        / (this.m_timeDie - fadeIn);
      startScale = maxStartScale;
      this.m_y += this.m_yVector * timeElapsed;
    }
    // the x direction is influenced by wind velocity
    this.m_x += (this.m_xVector + Changeables.windVelocity) * timeElapsed;
    this.m_alpha *= this.m_emitter.m_alpha;
    this.m_scale = 0.001 + startScale + this.m_age / 4000.0;
  }

  public render(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive())
      return;
    ctx.globalAlpha = this.m_alpha;
    const height = this.m_emitter.m_image.height * this.m_scale;
    const width = this.m_emitter.m_image.width * this.m_scale;

    // round it to an integer to prevent subpixel positioning
    const x = Math.round(this.m_x - width / 2);
    const y = Math.round(this.m_y + height / 2);
    ctx.drawImage(this.m_emitter.m_image, x, y, width, height);
    if (x < Changeables.dirtyLeft) {
      Changeables.dirtyLeft = x;
    }
    if (x + width > Changeables.dirtyRight) {
      Changeables.dirtyRight = x + width;
    }
    if (y < Changeables.dirtyTop) {
      Changeables.dirtyTop = y;
    }
    if (y + height > Changeables.dirtyBottom) {
      Changeables.dirtyBottom = y + height;
    }
  }
};
