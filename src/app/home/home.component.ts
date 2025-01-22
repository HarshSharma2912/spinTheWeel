import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormBuilder,FormGroup,Validator, AbstractControl, ValidationErrors,ValidatorFn } from '@angular/forms';
import { ToastrService } from '../Services/toastr.service';

import {MyfirstlibraryharshComponent} from 'myfirstlibraryharsh';
 import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import { Router } from '@angular/router';
import { DataService } from '../Services/data.service';
 

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,FormsModule,MyfirstlibraryharshComponent,MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  myForm:FormGroup;
  obj:any = {"name" : "harsh"};
  sectorInputAdded:boolean = false;
  
  constructor(private readonly formBuilder : FormBuilder, private taostrService:ToastrService, private router:Router,private dataService:DataService){
 
 
    setTimeout(() => {
      
      this.taostrService.showToast("Title","Some internal server error occured and something went wrong some mistake are tbere ther need to be some ",2)
    }, 1000);
   

    this.myForm = this.formBuilder.group({
      items : this.formBuilder.array([ 
        this.formBuilder.group({ 
         nameOfSpin : ['',[Validators.required, this.nameOfSpinShouldBeString()]], 
         numberOfSectors: ['',[Validators.required, Validators.min(3)]],
         
        }),

        // this.formBuilder.group({
        //   // nameOfSpin : ['',[Validators.required, this.nameOfSpinShouldBeString()]],
        //   numberOfSectors: ['',[Validators.required, Validators.min(3)]],
        //  })
      ]), 

      numberOfspinAdd : this.formBuilder.array([]),

    })

    
    
  }

  ngOnInit(){
    // this.myForm.disable();
    // this.firstInputData.controls[0].get("nameOfSpin")?.disable();
    console.log(this.firstInputData, "harsh spisnis si i");
    
 
  }



  addInputs(){
    console.log("on add firstInputData ",this.firstInputData, this.firstInputData.valid);

    if(!this.firstInputData.valid){
      return;
    }

    this.sectorInputData.clear(); 

    let numberOfSectors = this.firstInputData.value[0].numberOfSectors;

    for (let index = 0; index < numberOfSectors; index++) {
      const newItem = this.formBuilder.group({
        name : new FormControl('',[Validators.required]),
        bgColor : new FormControl('#000000',[Validators.required]),
        textColor : new FormControl('#000000',[Validators.required]),
        id : new FormControl('',[Validators.required])
      })

      this.sectorInputData.push(newItem);

      
    }
    this.sectorInputAdded = true;

    console.log("sectorInputData =>",this.sectorInputData);
    

    for (let item of  this.sectorInputData.controls) { 
       console.log(item); 
    } 
    console.log(this.firstInputData.value[0].numberOfSectors); 
  }

  get firstInputData() : FormArray{
    return this.myForm.get('items') as FormArray;
  }

  get sectorInputData() : FormArray{
    return this.myForm.get('numberOfspinAdd') as FormArray;
  }


  get numberOfSpinValidate(){
    return this.myForm.get('numberOfSectors')
  }

  uniqueIdRequired():ValidatorFn{
    return (control : AbstractControl):ValidationErrors | null =>{
      console.log("harsh unique 1",this.sectorInputData.controls);
      

     const index = this.sectorInputData.controls.indexOf(control);
    console.log("harsh 2 ",index);
    

       for (let item of  this.sectorInputData.controls) { 
        console.log("conrole harsh 3",control);
        
        
        console.log("harsh unique 4", item.get('id')?.value, "and =>",control.value, "and loop +>",item.value); 
        if(control.value == item.get('id')?.value){
             console.log("harsh doubled");
             
        }else{
          console.log("harsh unique");
        }
     } 
     return null;
    }
  }

  nameOfSpinShouldBeString():ValidatorFn{
    return (control:AbstractControl):ValidationErrors | null =>{ 
      console.log("harsh =>",control, control.value); 
      return control.value?.trim().length<3 ? { "minLength": "Name length should be greater than 3"} : null ;
    }
  }

  onSubmit(){
    console.log("myForm =>",this.myForm.valid);
    console.log("myForm harsh valid=>",this.myForm?.value); 
    
    if(!this.myForm.valid){
         this.taostrService.showToast("","Please fill mandatory fields",0);
         return;
    }
    
    this.dataService.spinData = this.myForm.value;

    this.router.navigate(["/readySpin"])
    
  }

 
  
  isInputFill:any = -1;
  inputValue:any = "";

  spinNameStatus:any = -1;
  sectonNumberStatus:any = -1;


  inputFocusEvent(type:any,obj:any,status:any){
    let value = String(obj.value);
    console.log(obj.value, "status =>",status);
    // console.log('obj.value.trim().length=>',obj.value.trim().length);
    console.log("type ->",type);
    

    if(type ==0 && status ==1){
      this.spinNameStatus = value.trim().length == 0 ? -1 : status;



    }else if(type ==0 &&  status ==2){
      this.sectonNumberStatus = value.trim().length == 0 ? -1 : status; 
    }
    
    else if(status ==1){
      this.spinNameStatus =status;

      // this.isInputFill = true;
    }else{
      this.sectonNumberStatus =status;
    }


    // alert(type)



  }


}
