import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { createGeneratedSectors, isValidSectorCount, WheelSectorInput } from '../models/wheel-sector.model';
import { ToastrService } from '../Services/toastr.service';
import { SpinerComponent } from '../spiner/spiner.component';

@Component({
  selector: 'app-custom-wheel',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    SpinerComponent,
  ],
  templateUrl: './custom-wheel.component.html',
  styleUrl: './custom-wheel.component.scss',
})
export class CustomWheelComponent {
  myForm: FormGroup;
  sectorInputAdded = false;
  sectorCountError = '';
  wheelSectors: WheelSectorInput[] = [];

  constructor(
    private readonly formBuilder: FormBuilder,
    private taostrService: ToastrService
  ) {
    this.myForm = this.formBuilder.group({
      items: this.formBuilder.array([
        this.formBuilder.group({
          nameOfSpin: ['My Custom Wheel', [Validators.required, this.nameOfSpinShouldBeString()]],
          numberOfSectors: ['', [Validators.required, Validators.min(1)]],
        }),
      ]),
      numberOfspinAdd: this.formBuilder.array([]),
    });
  }

  addInputs(): void {
    this.sectorCountError = '';

    if (!this.firstInputData.valid) {
      this.taostrService.showToast('', 'Please enter a valid wheel name and sector count.', 0);
      return;
    }

    const numberOfSectors = Number(this.firstInputData.value[0].numberOfSectors);

    if (!isValidSectorCount(numberOfSectors)) {
      this.sectorCountError = 'Please enter a valid sector count greater than 0.';
      this.taostrService.showToast('', this.sectorCountError, 0);
      return;
    }

    this.sectorInputData.clear();
    const generatedSectors = createGeneratedSectors(numberOfSectors);

    generatedSectors.forEach((sector) => {
      this.sectorInputData.push(
        this.formBuilder.group({
          name: new FormControl({ value: sector.name, disabled: true }, [Validators.required]),
          bgColor: new FormControl(sector.bgColor, [Validators.required]),
          textColor: new FormControl(sector.textColor, [Validators.required]),
          id: new FormControl(sector.id, [Validators.required, this.uniqueSectorIdValidator()]),
        })
      );
    });

    this.sectorInputAdded = true;
    this.syncWheelPreview();
  }

  syncWheelPreview(): void {
    if (!this.sectorInputAdded) {
      this.wheelSectors = [];
      return;
    }

    this.sectorInputData.controls.forEach((control) => {
      control.get('id')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    this.wheelSectors = (this.sectorInputData.getRawValue() as WheelSectorInput[]).map((sector) => ({
      ...sector,
    }));
  }

  get firstInputData(): FormArray {
    return this.myForm.get('items') as FormArray;
  }

  get sectorInputData(): FormArray {
    return this.myForm.get('numberOfspinAdd') as FormArray;
  }

  uniqueSectorIdValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const currentValue = String(control.value ?? '').trim();
      if (!currentValue) {
        return null;
      }

      const duplicateCount = this.sectorInputData.controls.filter(
        (item) => String(item.get('id')?.value ?? '').trim() === currentValue
      ).length;

      return duplicateCount > 1 ? { duplicateId: true } : null;
    };
  }

  nameOfSpinShouldBeString(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value?.trim().length < 3
        ? { minLength: 'Name length should be greater than 3' }
        : null;
    };
  }

  onSectorIdChange(): void {
    this.sectorInputData.controls.forEach((control) => {
      control.get('id')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.syncWheelPreview();
  }

  onSectorColorChange(): void {
    this.syncWheelPreview();
  }
}
