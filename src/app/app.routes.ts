import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        "path" : "",
        loadComponent: ()=> import('./home/home.component').then(h=>h.HomeComponent)
    },
    {
        "path" : "readySpin",
        loadComponent: ()=> import('./spiner/spiner.component').then(component=>component.SpinerComponent)
    }
];
