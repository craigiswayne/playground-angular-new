import { Injectable } from '@angular/core';
import {CanvasTexture} from 'three';

@Injectable({
  providedIn: 'root'
})
export class MyThreeJsService {

  public create_gradient_texture(width: number, height: number): CanvasTexture {
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
}
