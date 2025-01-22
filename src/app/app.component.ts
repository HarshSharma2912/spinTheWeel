import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgwheelcustomComponent } from '../ngwheelcustom/ngwheelcustom.component';
import { HomeComponent } from './home/home.component';
import { ReactiveExampleComponent } from './reactive-example/reactive-example.component';
import { ToastrService } from './Services/toastr.service';
import { CommonModule } from '@angular/common';
import {MyCustomToastService} from 'my-custom-toast';
import {HarshJangidToastrrService} from 'harsh-jangid-toastrr';
import { DataService } from './Services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,NgwheelcustomComponent,HomeComponent,ReactiveExampleComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'spinWheel';
 

  constructor(public toastrService:ToastrService, private mycustom:HarshJangidToastrrService, private dataService:DataService){
    this.mycustom.showToast("hh","jjj",1);


    console.log(" this.dataService.spinData  =>", this.dataService.spinData );
    

    
  }

  closeToast(){
    this.toastrService.hideToast();
  }
}
