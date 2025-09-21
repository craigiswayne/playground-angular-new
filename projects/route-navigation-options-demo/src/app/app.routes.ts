import { Routes } from '@angular/router';
import {ExamplePageComponent} from '../example-page.component';
import {HomePageComponent} from '../home.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'standard-router-link', component: ExamplePageComponent },
];
