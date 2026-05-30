import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'demo',
    loadComponent: () => import('./demo-wheel/demo-wheel.component').then((m) => m.DemoWheelComponent),
  },
  {
    path: 'custom',
    loadComponent: () => import('./custom-wheel/custom-wheel.component').then((m) => m.CustomWheelComponent),
  },
  {
    path: 'readySpin',
    loadComponent: () => import('./spiner/spiner.component').then((component) => component.SpinerComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
