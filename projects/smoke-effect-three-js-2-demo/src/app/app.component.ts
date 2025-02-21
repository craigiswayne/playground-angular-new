import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AppService} from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  public constructor(private service: AppService) {}

  public ngOnInit(): void {
    this.service.createScene(this.rendererCanvas);
    this.service.animate();
  }
}
