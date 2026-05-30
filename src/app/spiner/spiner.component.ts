import {

  AfterViewInit,

  Component,

  ElementRef,

  Input,

  OnChanges,

  OnDestroy,

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

export class SpinerComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

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



  /** Visual / animation state (does not affect stop logic) */

  isAccelerating = false;

  spinStartTime = 0;

  maxAngVel = 20;

  wheelBlur = 0;

  pointerTick = false;

  pointerBounce = false;

  isCelebrating = false;

  celebrationPhase = 0;



  private rafId: number | null = null;

  private celebrationRafId: number | null = null;

  private pointerTickTimeout: ReturnType<typeof setTimeout> | null = null;

  private pointerBounceTimeout: ReturnType<typeof setTimeout> | null = null;

  private lastPointerSector = -1;

  private readonly boundFrame = () => this.frame();

  private readonly accelDurationMs = 650;



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



  ngAfterViewInit(): void {

    if (this.demoMode || this.sectorData?.length) {

      setTimeout(() => this.createWheel(), 0);

    }

  }



  ngOnDestroy(): void {

    this.stopAnimationLoop();

    this.stopCelebration();

    this.clearPointerTimers();

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

    this.stopAnimationLoop();

    this.stopCelebration();

    this.clearPointerTimers();



    this.angVel = 0;

    this.ang = 0;

    this.isThisStop = true;

    this.isSpinOn = false;

    this.finalAngle = '';

    this.tarInx = undefined;

    this.validationError = '';

    this.isAccelerating = false;

    this.wheelBlur = 0;

    this.pointerTick = false;

    this.pointerBounce = false;

    this.isCelebrating = false;

    this.celebrationPhase = 0;

    this.lastPointerSector = -1;



    if (this.wheel?.nativeElement) {

      this.wheel.nativeElement.style.transition = '';

      this.wheel.nativeElement.style.filter = '';

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



    this.redrawWheel();

    this.rotate(true);

    this.wheelInitialized = true;

  }



  private redrawWheel(): void {

    if (!this.ctx || this.dia === undefined) {

      return;

    }



    this.ctx.clearRect(0, 0, this.dia, this.dia);

    this.sectors.forEach((sector, i) => this.drawSector(sector, i));

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



  private drawSectorWedge(sector: WheelCanvasSector, i: number, colorFill: string): void {

    if (!this.ctx || this.rad === undefined || this.arcDeg === undefined) {

      return;

    }



    const ang = this.getSectorStartAngle(i);

    this.ctx.beginPath();

    this.ctx.fillStyle = colorFill;

    this.ctx.moveTo(this.rad, this.rad);

    this.ctx.arc(this.rad, this.rad, this.rad, this.degToRad(ang), this.degToRad(ang + this.arcDeg));

    this.ctx.lineTo(this.rad, this.rad);

    this.ctx.fill();

  }



  drawSector(sector: WheelCanvasSector, i: number): void {

    if (!this.ctx || this.rad === undefined || this.arcDeg === undefined) {

      return;

    }



    const ang = this.getSectorStartAngle(i);

    this.ctx.save();



    this.drawSectorWedge(sector, i, sector.color);



    // Subtle depth shading on each wedge

    const midAng = ang + this.arcDeg / 2;

    const shadeX = this.rad + Math.cos(this.degToRad(midAng)) * this.rad * 0.35;

    const shadeY = this.rad + Math.sin(this.degToRad(midAng)) * this.rad * 0.35;

    const depthGrad = this.ctx.createRadialGradient(shadeX, shadeY, 0, this.rad, this.rad, this.rad);

    depthGrad.addColorStop(0, 'rgba(255, 255, 255, 0.14)');

    depthGrad.addColorStop(0.55, 'rgba(0, 0, 0, 0)');

    depthGrad.addColorStop(1, 'rgba(0, 0, 0, 0.18)');

    this.ctx.fillStyle = depthGrad;

    this.ctx.beginPath();

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

    this.ctx.canvas.style.filter = this.wheelBlur > 0.1 ? `blur(${this.wheelBlur}px)` : '';

  }



  highlightSector(sector: WheelCanvasSector, i: number, colorFill: string): void {

    if (!this.ctx || this.rad === undefined || this.arcDeg === undefined) {

      return;

    }



    const ang = this.getSectorStartAngle(i);

    this.ctx.save();



    this.drawSectorWedge(sector, i, colorFill);



    this.ctx.translate(this.rad, this.rad);

    this.ctx.rotate(this.degToRad(ang + this.arcDeg / 2));

    this.ctx.textAlign = 'right';

    this.drawSectorLabel(sector);



    this.ctx.restore();

  }



  private drawWinningSectorOverlay(sector: WheelCanvasSector, i: number, pulse: number): void {

    if (!this.ctx || this.rad === undefined || this.arcDeg === undefined) {

      return;

    }



    const ang = this.getSectorStartAngle(i);

    const midAng = ang + this.arcDeg / 2;

    const glowStrength = 0.45 + 0.55 * Math.sin(pulse * Math.PI * 2);

    const scale = 1 + 0.045 * Math.sin(pulse * Math.PI * 2);



    this.ctx.save();

    this.ctx.translate(this.rad, this.rad);

    this.ctx.rotate(this.degToRad(midAng));

    this.ctx.scale(scale, scale);

    this.ctx.rotate(this.degToRad(-midAng));

    this.ctx.translate(-this.rad, -this.rad);



    this.ctx.shadowColor = '#fbbf24';

    this.ctx.shadowBlur = 18 + glowStrength * 22;

    this.drawSectorWedge(sector, i, sector.color);



    this.ctx.shadowBlur = 0;

    this.ctx.lineWidth = 3 + glowStrength * 2;

    this.ctx.strokeStyle = `rgba(251, 191, 36, ${0.55 + glowStrength * 0.45})`;

    this.ctx.beginPath();

    this.ctx.arc(this.rad, this.rad, this.rad - 2, this.degToRad(ang), this.degToRad(ang + this.arcDeg));

    this.ctx.stroke();



    this.ctx.translate(this.rad, this.rad);

    this.ctx.rotate(this.degToRad(midAng));

    this.ctx.textAlign = 'right';

    this.ctx.fillStyle = '#fff';

    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';

    this.drawSectorLabel(sector);



    this.ctx.restore();

  }



  private easeOutCubic(t: number): number {

    return 1 - Math.pow(1 - t, 3);

  }



  private applyAcceleration(): void {

    if (!this.isAccelerating) {

      return;

    }



    const elapsed = performance.now() - this.spinStartTime;

    const progress = Math.min(1, elapsed / this.accelDurationMs);

    this.angVel = this.maxAngVel * this.easeOutCubic(progress);



    if (progress >= 1) {

      this.isAccelerating = false;

    }

  }



  private updateVisualEffects(): void {

    if (this.angVel > 0) {

      this.wheelBlur = Math.min(3.5, this.angVel * 0.14);

      this.updatePointerTick();

    } else {

      this.wheelBlur = Math.max(0, this.wheelBlur * 0.82);

    }

  }



  private updatePointerTick(): void {

    const arc = this.arcDeg ?? 360;

    const currentSector = Math.floor(((this.ang % 360) + 360) % 360 / arc);



    if (this.lastPointerSector !== -1 && currentSector !== this.lastPointerSector && this.angVel > 1.5) {

      this.triggerPointerTick();

    }



    this.lastPointerSector = currentSector;

  }



  private triggerPointerTick(): void {

    this.pointerTick = true;



    if (this.pointerTickTimeout) {

      clearTimeout(this.pointerTickTimeout);

    }



    this.pointerTickTimeout = setTimeout(() => {

      this.pointerTick = false;

      this.pointerTickTimeout = null;

    }, 90);

  }



  private triggerPointerBounce(): void {

    this.pointerBounce = true;



    if (this.pointerBounceTimeout) {

      clearTimeout(this.pointerBounceTimeout);

    }



    this.pointerBounceTimeout = setTimeout(() => {

      this.pointerBounce = false;

      this.pointerBounceTimeout = null;

    }, 650);

  }



  private startWinCelebration(): void {

    this.stopCelebration();

    this.isCelebrating = true;

    this.celebrationPhase = 0;



    const startTime = performance.now();

    const duration = 2200;

    const pulseCount = 3;



    const animate = (now: number) => {

      if (this.tarInx === undefined) {

        this.stopCelebration();

        return;

      }



      const winningSector = this.sectors[this.tarInx];

      if (!winningSector) {

        this.stopCelebration();

        return;

      }



      const elapsed = now - startTime;

      const progress = Math.min(1, elapsed / duration);

      this.celebrationPhase = progress * pulseCount;



      this.redrawWheel();

      this.drawWinningSectorOverlay(winningSector, this.tarInx, this.celebrationPhase);



      if (progress < 1) {

        this.celebrationRafId = requestAnimationFrame(animate);

      } else {

        this.redrawWheel();

        this.drawWinningSectorOverlay(winningSector, this.tarInx, pulseCount);

        this.isCelebrating = false;

        this.celebrationRafId = null;

      }

    };



    this.celebrationRafId = requestAnimationFrame(animate);

  }



  private stopCelebration(): void {

    if (this.celebrationRafId !== null) {

      cancelAnimationFrame(this.celebrationRafId);

      this.celebrationRafId = null;

    }

    this.isCelebrating = false;

  }



  private clearPointerTimers(): void {

    if (this.pointerTickTimeout) {

      clearTimeout(this.pointerTickTimeout);

      this.pointerTickTimeout = null;

    }

    if (this.pointerBounceTimeout) {

      clearTimeout(this.pointerBounceTimeout);

      this.pointerBounceTimeout = null;

    }

  }



  frame(): void {

    if (!this.angVel && !this.isAccelerating) {

      this.rafId = null;

      return;

    }



    this.applyAcceleration();



    if (!this.isAccelerating) {

      this.angVel *= this.friction;

      if (this.angVel < 0.02) {

        this.angVel = 0;

      }

    }



    this.ang += this.angVel;

    this.ang %= 360;



    let startingAng =

      this.targetIndex !== null ? (this.targetIndex * (this.arcDeg ?? 0)) % 360 : this.getIndex() * (this.arcDeg ?? 0);



    let lastAng = startingAng + (this.arcDeg ?? 0) * 0.45;



    if (!this.isAccelerating && this.ang >= startingAng && this.ang <= lastAng && this.angVel < 2) {

      this.angVel = 0;

      this.isThisStop = true;



      this.triggerPointerBounce();

      this.startWinCelebration();

    }



    this.updateVisualEffects();

    this.rotate();



    if (this.angVel > 0 || this.isAccelerating) {

      this.rafId = requestAnimationFrame(this.boundFrame);

    } else {

      this.rafId = null;

      this.wheelBlur = 0;

      this.rotate();

    }

  }



  private startAnimationLoop(): void {

    if (this.rafId === null) {

      this.rafId = requestAnimationFrame(this.boundFrame);

    }

  }



  private stopAnimationLoop(): void {

    if (this.rafId !== null) {

      cancelAnimationFrame(this.rafId);

      this.rafId = null;

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

    this.stopCelebration();

    this.lastPointerSector = -1;



    const canvas = this.wheel.nativeElement;

    canvas.style.transition = '';



    this.isAccelerating = true;

    this.spinStartTime = performance.now();

    this.maxAngVel = 20;

    this.angVel = 0;



    this.ang = 0;

    this.startAnimationLoop();



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


