import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastrService {
  toastrOn:boolean = false;
  toastrOff:boolean = false;
  toastrTitle:any = "";
  toastrMessage:any = "";
  toastrStatus:number =1;

  constructor() { }


  showToast(title:any,message:any,status:number){
    this.toastrOn = true;
    this.toastrOff = false;
    this.toastrTitle = title;
    this.toastrMessage = message;
    this.toastrStatus = status;


    let timeOutId = setTimeout(() => {
      this.toastrOn = false;
      this.toastrOff = true; 
      clearTimeout(timeOutId);
    }, 3000);
    

  }

  hideToast(){
    this.toastrOff = true; 
    this.toastrOn = false;


  }

}
