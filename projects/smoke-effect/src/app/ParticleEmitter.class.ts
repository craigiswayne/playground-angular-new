import {Particle} from './Particle.class';
import {Globals} from './global';

export class ParticleEmitter {
  // @ts-ignore
  public m_x: number;
  // @ts-ignore
  public m_y: number;
  // @ts-ignore
  public m_dieRate: number;
  // @ts-ignore
  public m_image: HTMLImageElement;
  public m_speed = 0.04;
  public m_alpha = 1.0;

  private m_listParticle: Particle[] = [];

  // ParticleEmitter().init function
  // xScale = number between 0 and 1. 0 = on left side 1 = on top
  // yScale = number between 0 and 1. 0 = on top 1 = on bottom
  // particles = number of particles
  // image = smoke graphic for each particle
  public init(xScale: number, yScale: number, particles: number, image: HTMLImageElement) {
    // the effect is positioned relative to the width and height of the
    // canvas
    this.m_x = Globals.CANVAS_WIDTH * xScale;
    this.m_y = Globals.CANVAS_HEIGHT * yScale;
    this.m_image = image;
    this.m_dieRate = 0.95;
    // start with smoke already in place
    for ( let n = 0; n < particles; n++) {
      this.m_listParticle.push(new Particle());
      this.m_listParticle[n].init(this, n * 50000 * this.m_speed);
    }
  }

  public update(timeElapsed: number) {
    for ( let n = 0; n < this.m_listParticle.length; n++) {
      this.m_listParticle[n].update(timeElapsed);
    }
  }

  public render(context: CanvasRenderingContext2D) {
    for ( let n = 0; n < this.m_listParticle.length; n++) {
      this.m_listParticle[n].render(context);
    }
  }
}
