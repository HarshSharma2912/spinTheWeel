import {
  AfterViewInit,
  Component,
  DoCheck,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DataService } from '../Services/data.service';
import {
  createDemoSectors,
  mapInputToCanvasSector,
  resolveSpinTarget,
  WheelCanvasSector,
  WheelSectorInput,
} from '../models/wheel-sector.model';

@Component({
  selector: 'app-spiner',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './spiner.component.html',
  styleUrl: './spiner.component.scss',
})
export class SpinerComponent implements OnInit, AfterViewInit, DoCheck, OnChanges {
  @Input() demoMode = false;
  @Input() sectorData: WheelSectorInput[] | null = null;
  @Input() showControls = false;
  @Input() embeddedLayout = false;

  @ViewChild('wheel') wheel!: ElementRef<HTMLCanvasElement>;
  @ViewChild('spin') spin!: ElementRef<HTMLElement>;

  sectors: WheelCanvasSector[] = [];
  rand = (m: number, M: number) => Math.random() * (M - m) + m;
  tot: number | undefined;
  ctx: CanvasRenderingContext2D | null = null;
  dia: number | undefined;
  rad: number | undefined;
  arcDeg: number | undefined;
  finalAngle: string | number = '';
  friction = 0.995;
  angVel = 0;
  ang = 0;
  targetIndex = 0;
  isThisStop = true;

  spinWheelObjectArray: WheelSectorInput[] = [];

  tarInx: number | undefined;
  targetId: string | undefined;
  targetSelection = '';
  validationError = '';

  wantToStopSpecificPosition = true;

  isSpinOn = false;
  wheelInitialized = false;

  constructor(private dataService: DataService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sectorData'] && this.sectorData?.length) {
      this.wantToStopSpecificPosition = false;
      this.initializeSectors(this.sectorData);
      setTimeout(() => this.createWheel(), 0);
    }
  }

  ngOnInit(): void {
    if (this.demoMode) {
      this.wantToStopSpecificPosition = false;
      this.initializeSectors(createDemoSectors());
      return;
    }

    if (this.sectorData?.length) {
      this.wantToStopSpecificPosition = false;
      this.initializeSectors(this.sectorData);
      return;
    }

    const configuredSectors = this.dataService.spinData?.numberOfspinAdd;
    if (configuredSectors?.length) {
      this.initializeSectors(configuredSectors);
    }
  }

  ngDoCheck(): void {
    this.engine();
  }

  ngAfterViewInit(): void {
    if (this.demoMode || this.sectorData?.length) {
      setTimeout(() => this.createWheel(), 0);
    }
  }

  initializeSectors(sectorInputs: WheelSectorInput[]): void {
    this.spinWheelObjectArray = sectorInputs;
    this.sectors = sectorInputs.map(mapInputToCanvasSector);
  }

  showSpin(): void {
    this.validationError = '';

    const resolution = resolveSpinTarget(this.targetSelection || String(this.targetId ?? ''), this.sectors);
    if (!resolution.valid) {
      this.validationError = resolution.error ?? 'Invalid sector selection.';
      return;
    }

    this.targetId = resolution.targetId;
    this.wantToStopSpecificPosition = false;

    setTimeout(() => {
      this.createWheel();
    }, 500);
  }

  onSpinClick(): void {
    if (this.isSpinOn) {
      return;
    }

    this.validationError = '';

    const resolution = resolveSpinTarget(this.targetSelection, this.sectors);
    if (!resolution.valid) {
      this.validationError = resolution.error ?? 'Invalid sector selection.';
      return;
    }

    if (!this.wheelInitialized) {
      this.createWheel();
    }

    this.targetId = resolution.targetId;
    this.spinner();
  }

  resetWheel(): void {
    this.angVel = 0;
    this.ang = 0;
    this.isThisStop = true;
    this.isSpinOn = false;
    this.finalAngle = '';
    this.tarInx = undefined;
    this.validationError = '';

    if (this.wheel?.nativeElement) {
      this.wheel.nativeElement.style.transition = '';
    }

    if (this.sectors.length) {
      this.createWheel();
    }
  }

  createWheel(): void {
    if (!this.wheel?.nativeElement) {
      return;
    }

    this.ctx = this.wheel.nativeElement.getContext('2d');
    if (!this.ctx) {
      return;
    }

    this.dia = this.ctx.canvas.width;
    this.tot = this.sectors.length;
    this.rad = this.dia / 2;
    this.arcDeg = 360 / this.sectors.length;

    this.sectors.forEach((sector, i) => this.drawSector(sector, i));
    this.rotate(true);
    this.wheelInitialized = true;
  }

  private getSectorStartAngle(i: number): number {
    const arcDeg = this.arcDeg ?? 0;
    const offset = 90 + arcDeg / 2;
    return -arcDeg * i - offset;
  }

  private getSectorFontSize(): number {
    const count = this.sectors.length;
    if (count <= 4) {
      return 26;
    }
    if (count <= 6) {
      return 22;
    }
    if (count <= 10) {
      return 18;
    }
    if (count <= 16) {
      return 14;
    }
    return 12;
  }

  private getLabelRadiusOffset(): number {
    const count = this.sectors.length;
    if (count <= 6) {
      return 48;
    }
    if (count <= 10) {
      return 42;
    }
    return 36;
  }

  private drawSectorLabel(sector: WheelCanvasSector): void {
    if (!this.ctx || this.rad === undefined) {
      return;
    }

    const fontSize = this.getSectorFontSize();
    const labelOffset = this.getLabelRadiusOffset();
    this.ctx.font = `bold ${fontSize}px 'Afacad', sans-serif`;
    this.ctx.fillStyle = '#fff';
    this.ctx.strokeStyle = 'black';

    if (sector.label == '0') {
      const smallFont = Math.max(fontSize - 2, 9);
      this.ctx.font = `bold ${smallFont}px 'Afacad', sans-serif`;
      this.ctx.fillText('Better Luck', this.rad - labelOffset + 20, -4);
      this.ctx.strokeText('Better Luck', this.rad - labelOffset + 20, -4);
      this.ctx.fillText('Next Time', this.rad - labelOffset + 8, 14);
      this.ctx.strokeText('Next Time', this.rad - labelOffset + 8, 14);
      return;
    }

    this.ctx.fillText(sector.label, this.rad - labelOffset, 5);
    this.ctx.strokeText(sector.label, this.rad - labelOffset, 5);
  }

  drawSector(sector: WheelCanvasSector, i: number): void {
    if (!this.ctx || this.rad === undefined || this.arcDeg === undefined) {
      return;
    }

    const ang = this.getSectorStartAngle(i);
    this.ctx.save();

    this.ctx.beginPath();
    this.ctx.fillStyle = sector.color;
    this.ctx.moveTo(this.rad, this.rad);
    this.ctx.arc(this.rad, this.rad, this.rad, this.degToRad(ang), this.degToRad(ang + this.arcDeg));
    this.ctx.lineTo(this.rad, this.rad);
    this.ctx.fill();

    this.ctx.translate(this.rad, this.rad);
    this.ctx.rotate(this.degToRad(ang + this.arcDeg / 2));
    this.ctx.textAlign = 'right';
    this.drawSectorLabel(sector);

    this.ctx.restore();
  }

  rotate(first = false): void {
    if (!this.ctx) {
      return;
    }

    this.ctx.canvas.style.transform = `rotate(${this.ang}deg)`;
  }

  highlightSector(sector: WheelCanvasSector, i: number, colorFill: string): void {
    if (!this.ctx || this.rad === undefined || this.arcDeg === undefined) {
      return;
    }

    const ang = this.getSectorStartAngle(i);

    this.ctx.save();

    this.ctx.beginPath();
    this.ctx.fillStyle = colorFill;
    this.ctx.moveTo(this.rad, this.rad);
    this.ctx.arc(this.rad, this.rad, this.rad, this.degToRad(ang), this.degToRad(ang + this.arcDeg));
    this.ctx.lineTo(this.rad, this.rad);
    this.ctx.fill();

    this.ctx.translate(this.rad, this.rad);
    this.ctx.rotate(this.degToRad(ang + this.arcDeg / 2));
    this.ctx.textAlign = 'right';
    this.drawSectorLabel(sector);

    this.ctx.restore();
  }

  frame(): void {
    if (!this.angVel) {
      return;
    }

    this.angVel *= this.friction;
    if (this.angVel < 0.02) {
      this.angVel = 0;
    }
    this.ang += this.angVel;
    this.ang %= 360;

    let startingAng =
      this.targetIndex !== null ? (this.targetIndex * (this.arcDeg ?? 0)) % 360 : this.getIndex() * (this.arcDeg ?? 0);

    let lastAng = startingAng + (this.arcDeg ?? 0) * 0.45;

    // console.log('ang =>', this.ang);
    // console.log('ang startingAng=>', startingAng);
    // console.log('ang lastAng=>', lastAng);
    // console.log('ang angVel=>', this.angVel);
    // console.log('arcDeg =>', this.arcDeg);

    if (this.ang >= startingAng && this.ang <= lastAng && this.angVel < 2) {
      // console.log('sector ang stop1=> ', this.angVel);
      this.angVel = 0;
      this.isThisStop = true;

      this.ctx?.save();

      let index = 0;

      let interval = setInterval(() => {
        if (this.tarInx === undefined) {
          clearInterval(interval);
          return;
        }

        const winningSector = this.sectors[this.tarInx];
        if (!winningSector) {
          clearInterval(interval);
          return;
        }

        if (index % 2 == 0) {
          this.highlightSector(winningSector, this.tarInx, 'white');
        } else {
          // console.log('Harsh spin->', this.spinWheelObjectArray[this.tarInx]);
          this.highlightSector(winningSector, this.tarInx, winningSector.color);
        }
        index++;
        if (index == 6) {
          clearInterval(interval);
          this.isThisStop = true;
        }
      }, 200);
    }

    this.rotate();
  }

  engine(): void {
    if (this.angVel > 0) {
      requestAnimationFrame(this.frame.bind(this));
    }
  }

  getIndex = (): number => {
    const sectorAngle = 360 / (this.tot ?? 1);
    let normalizedAngle = this.ang % 360;
    if (normalizedAngle < 0) {
      normalizedAngle += 360;
    }

    for (let i = 0; i < (this.tot ?? 0); i++) {
      if (normalizedAngle >= i * sectorAngle && normalizedAngle < (i + 1) * sectorAngle) {
        return i;
      }
    }
    return 0;
  };

  degToRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  spinner(): void {
    if (this.isSpinOn || this.angVel > 0) {
      return;
    }

    this.isSpinOn = true;
    this.finalAngle = '';

    const canvas = this.wheel.nativeElement;
    canvas.style.transition = '';
    this.angVel = 8;
    this.angVel = 20;

    this.ang = 0;
    // console.log('angularVelocity', this.angVel, this.arcDeg, this.rand(0.25, 0.35));
    this.engine();

    let tIndex = -1;

    for (let index = 0; index < this.sectors.length; index++) {
      if (this.sectors[index].id == this.targetId) {
        tIndex = index;
        this.tarInx = index;
        break;
      }
    }

    if (tIndex == -1) {
      let ranadomIndexStop = Math.floor(Math.random() * this.sectors.length);
      this.tarInx = ranadomIndexStop;
    }

    this.targetIndex = this.tarInx ?? 0;

    this.isThisStop = false;
  }

  reset(): void {
    this.resetWheel();
  }
}
