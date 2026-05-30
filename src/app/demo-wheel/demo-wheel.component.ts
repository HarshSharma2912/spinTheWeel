import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SpinerComponent } from '../spiner/spiner.component';

@Component({
  selector: 'app-demo-wheel',
  standalone: true,
  imports: [RouterLink, SpinerComponent],
  templateUrl: './demo-wheel.component.html',
  styleUrl: './demo-wheel.component.scss',
})
export class DemoWheelComponent {}
