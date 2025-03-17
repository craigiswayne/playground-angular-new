import { Routes } from '@angular/router';
import {SplashScreenComponent} from '../splash-screen/splash-screen.component';
import {MainScreenComponent} from '../main-screen/main-screen.component';

export const routes: Routes = [
  {
    path: '',
    component: SplashScreenComponent
  },
  {
    path: '**',
    component: MainScreenComponent
  }
];
