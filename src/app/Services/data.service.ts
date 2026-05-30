import { Injectable } from '@angular/core';

export interface SpinFormData {
  items: Array<{
    nameOfSpin: string;
    numberOfSectors: number;
  }>;
  numberOfspinAdd: Array<{
    name: string;
    bgColor: string;
    textColor: string;
    id: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  spinData: SpinFormData | null = null;
}
