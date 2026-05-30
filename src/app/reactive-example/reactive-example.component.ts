import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import this module

@Component({
  selector: 'app-reactive-example',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './reactive-example.component.html',
  styleUrl: './reactive-example.component.scss'
})
export class ReactiveExampleComponent {


  myForm: any;

  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      items: this.fb.array([
        this.fb.group({
          name: ['', Validators.required],
          description: ['', Validators.required],
        }),
      ]),
      categories: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
      ]),
    });
  }

  // Getter for items FormArray
  get items(): FormArray {
    return this.myForm.get('items') as FormArray;
  }

  // Getter for categories FormArray
  get categories(): FormArray {
    return this.myForm.get('categories') as FormArray;
  }

  // Function to submit the form data
  onSubmit(): void {
    if (this.myForm.invalid) {
      return;      
    }
    // console.log(this.myForm.value);
  }
}
