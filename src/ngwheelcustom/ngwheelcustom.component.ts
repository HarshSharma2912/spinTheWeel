import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
// import { DataService } from '../../dataService/data.service';
// import { Renderer2 } from '@angular/core';
// import { ApiService } from '../../Services/api.service';
// import { URLS } from '../../../environments/environment';

@Component({
  selector: 'app-ngwheelcustom',
  templateUrl: './ngwheelcustom.component.html',
  styleUrls: ['./ngwheelcustom.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
}) 

export class NgwheelcustomComponent implements OnInit {

  backgroundImage:any="./assets/img/bgImage.gif";
  // canvasBgImage:any="./assets/img/canvasImage.svg";  
  showContentDiv:boolean = false;
  showGifDiv:boolean = false;

  defaultOpts = ["Numbar1", "Numbar2", "Numbar3", "Numbar4", "Numbar5", "Numbar6", "Numbar7","Numbar8","Numbar9",];
  targetIndexArray:any = [];
  @ViewChild("wheel") wheel!: ElementRef<HTMLCanvasElement>;
  @ViewChild("spin") spin!: ElementRef;

  // COLORS = ["#f82", "#0bf", "#fb0", "#0fb","black"];
  COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet','blue', 'indigo'];
  // const colors: string[] = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

  sectors: any[] = []; 
  rand = (m: any, M: any) => Math.random() * (M - m) + m;
  tot: any;
  ctx: any;
  dia: any;
  rad: any;
  arcDeg: any;
  wheelSelectedData:any;
  finalAngle: any = '';  
  friction = 0.995; // 0.995=soft, 0.99=mid, 0.98=hard
  angVel = 0; // Angular velocity
  ang = 0; // Angle in degrees
  lastSelection: any;
  targetIndex: number = 0; // Index to stop at
  isThisStop:boolean = true;



  spinWheelObjectArray:any=[];
  targetSectorObject:any;

  tarInx:any;

  // targetIndex:any;

  constructor( ) {
    let spinWheel =  {
  
  
      "segementDetail":[
        {
          "auto_id": "1",
          "denomination": "₹ 380",
          "total_quantity": "1000",
          "remaining_quantity": "1000",
          "utilised_quantity": "1",
          "color": "#9B59FB"
      },
      {
          "auto_id": "2",
          "denomination": "₹ 1500",
          "total_quantity": "1000",
          "remaining_quantity": "1000",
          "utilised_quantity": "0",
          "color": "#20D087"
      },
      {
          "auto_id": "3",
          "denomination": "₹ 1000",
          "total_quantity": "1000",
          "remaining_quantity": "1000",
          "utilised_quantity": "0",
          "color": "#2DFCD2"
      }
      
    ],
    "userId": 18,
    "winningData": {
        "auto_id": "2",
        "reward_amount": "19"
    },
    "isRegistered": 0
  
  }

    this.spinWheelObjectArray =  spinWheel.segementDetail;
    this.targetSectorObject = spinWheel.winningData;


    // console.log("wheel data =>",this.spinWheelObjectArray);
    // console.log("target object =>",this.targetSectorObject);
    

    let tarInx = this.spinWheelObjectArray.findIndex((x:any) => x.auto_id == this.targetSectorObject.auto_id);
    // console.log("index =>",tarInx);
 
 

    for (let inx = 0; inx < this.spinWheelObjectArray.length; inx++) {
      // if(this.spinWheelObjectArray[inx].color){
      //   this.sectors.push({ 'color':this.spinWheelObjectArray[inx].color, 'label': this.spinWheelObjectArray[inx].denomination , 'check' : true });

      // }else{
      // this.sectors.push({ 'color': this.COLORS[inx], 'label': this.spinWheelObjectArray[inx].denomination , 'check' : true });
        
      // }
      this.sectors.push({ 'color':this.spinWheelObjectArray[inx].color, 'label': this.spinWheelObjectArray[inx].denomination , 'check' : true });
    }
    



    // for (let inx = 0; inx < this.COLORS.length; inx++) {
    //   this.sectors.push({ 'color': this.COLORS[inx], 'label': this.defaultOpts[inx] , 'check' : true });
    // }
    // this.sectors[2].check = false;

    for (let inx = 0; inx <  this.sectors.length; inx++) {
      // if( this.sectors[inx].check)
      // this.targetIndexArray.push(inx);
    }


    this.targetIndexArray.push(tarInx);

    this.tarInx = tarInx;
    // this.targetIndex = tarInx;

    // console.log(this.sectors);
  }


  // clearCanvas() {
  //   const canvas = this.wheel.nativeElement;
  //   const context = canvas.getContext('2d');

  //   if (context) {
  //     context.clearRect(0, 0, canvas.width, canvas.height);
  //   }
  // }


  ngDoCheck(): void { 
    this.engine();
    // console.log("runnig"); 
  }

  ngOnInit() {
    // Initial rotation
    // Start engine
  }

  ngAfterViewInit(): void {
    this.createWheel();
  }

  createWheel() {
    this.ctx = this.wheel.nativeElement.getContext("2d");
    this.dia = this.ctx.canvas.width;
    this.tot = this.sectors.length;
    this.rad = this.dia / 2;
    this.arcDeg = 360 / this.sectors.length;

    this.sectors.forEach((sector, i) => this.drawSector(sector, i));
    this.rotate(true);
  }

  
  drawSector(sector: any, i: any) {
    const ang = -this.arcDeg * i -(100 + this.arcDeg - 20);
    this.ctx.save();

    // debugger

    // console.log("sector =>",sector.label,"index =>",ang,this.arcDeg);
    
    // Draw Sector
    this.ctx.beginPath();
    this.ctx.fillStyle = sector.color;
    this.ctx.moveTo(this.rad, this.rad);
    this.ctx.arc(this.rad, this.rad, this.rad, this.degToRad(ang), this.degToRad(ang + this.arcDeg));
    this.ctx.lineTo(this.rad, this.rad);
    this.ctx.fill();

    //Add Text
    this.ctx.translate(this.rad, this.rad);
    // this.ctx.translate(0, 0);


    // console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhh=>",this.degToRad(ang + this.arcDeg / 2));
    
    this.ctx.rotate(this.degToRad(ang + this.arcDeg / 2));
    this.ctx.textAlign = "right";
    this.ctx.fillStyle = "#fff";
    this.ctx.strokeStyle = "black";
    // this.ctx.font = "bold 30px sans-serif";

 
// this.ctx.lineWidth = 2;  // Optional: Define the width of the stroke
 


    if(sector.label == '0'){
    this.ctx.font = "bold 30px 'Afacad', sans-serif"; 
      this.ctx.fillText("Better Luck", this.rad - 25, -5);
      this.ctx.strokeText("Better Luck", this.rad - 25, -5); 
      this.ctx.fillText("Next Time", this.rad - 37, 20);
      this.ctx.strokeText("Next Time", this.rad - 37, 20);

    }else{
    this.ctx.font = "bold 40px 'Afacad', sans-serif"; 
      this.ctx.fillText(sector.label, this.rad - 55, 10);
      this.ctx.strokeText(sector.label, this.rad - 55, 10);
      // this.ctx.fillText(sector.label, this.rad - 10, 50);
    }
    


    // Draw Image
    // const image = new Image();
    // image.src = 'https://benepik.com/wp-content/uploads/2023/09/logo3-1.png';
    // image.onload = () => {
    //   this.ctx.save();
    //   this.ctx.translate(this.rad, this.rad);
    //   this.ctx.rotate(this.degToRad(ang + this.arcDeg / 2));
    //   const imgWidth = 100; // Adjust as needed
    //   const imgHeight = 100; // Adjust as needed
    //   this.ctx.drawImage(image, -(imgWidth-50) / 2, -this.rad + 10, imgWidth, imgHeight);
    //   this.ctx.restore();
    // };

    this.ctx.restore();

    
  }


  rotate(first = false) { 
    // const canvas = this.wheel.nativeElement;
    // const sector = this.sectors[this.getIndex()];
    // let startingAng = (this.targetIndex * (360 - this.arcDeg))%360;
    // let lastAng  = (this.targetIndex * (360 - this.arcDeg))%360 + this.arcDeg;
   
    
    // console.log("startingAng=>",startingAng);
    // console.log("startingAng lastAng=>",lastAng);
    
    


    // Add transition effect when the wheel is stopping
    // if (!first && !this.angVel || (first && this.targetIndex > 0)) {
    //   if ((!first && !this.angVel )) { 
      // console.log("this is =>",this.arcDeg,(360 - this.arcDeg),this.angVel); 
    //   this.finalAngle = this.targetIndex !== null ? (this.targetIndex * (360 - this.arcDeg))%360 + 360 : this.getIndex() * this.arcDeg;
    //   canvas.style.transition = 'transform 5s ease-in-out';
    //   canvas.style.transform = `rotate(${this.finalAngle}deg)`;
      // console.log('time taken',this.finalAngle,(this.targetIndex * (360 - this.arcDeg))%360);
      
    //   setTimeout(() => {
    //     this.isThisStop = true; 
    //   }, 3000);
    //    return;
    // } else {
    //   canvas.style.transition = ''; 
    // }

    // this.ctx.canvas.style.transition = 'transform 1s ease-out';
    this.ctx.canvas.style.transform = `rotate(${this.ang}deg)`;
    

    // this.spin.nativeElement.textContent = !this.angVel ? "spin" : sector.label;
    
    // if (!first) {
    //   this.lastSelection = !this.angVel ? this.lastSelection : this.getIndex();
    // }
    this.spin.nativeElement.style.background = '#fff';

  
  }


  highlightSector(sector: any, i: any,colorFill:any) {

    sector.label = sector.denomination;
    // const ang = -this.arcDeg * i - 100;
    const ang = -this.arcDeg * i -(100 + this.arcDeg - 20);

    this.ctx.save();
  
    // Draw the highlighted sector with a different color
    this.ctx.beginPath();
    this.ctx.fillStyle = colorFill;  // For example, use a gold color for highlighting
    this.ctx.moveTo(this.rad, this.rad);
    this.ctx.arc(this.rad, this.rad, this.rad, this.degToRad(ang), this.degToRad(ang + this.arcDeg));
    this.ctx.lineTo(this.rad, this.rad);
    this.ctx.fill();
  
    // Draw Text (use the existing logic to redraw the text)
    this.ctx.translate(this.rad, this.rad);
    this.ctx.rotate(this.degToRad(ang + this.arcDeg / 2));
    this.ctx.textAlign = "right";
    this.ctx.fillStyle = "#fff";  // Same text color
    this.ctx.strokeStyle = "black";
    // this.ctx.font = "bold 30px sans-serif";

    if(sector.label == '0'){
      this.ctx.font = "bold 30px 'Afacad', sans-serif"; 
        this.ctx.fillText("Better Luck", this.rad - 25, -5);
        this.ctx.strokeText("Better Luck", this.rad - 25, -5); 
        this.ctx.fillText("Next Time", this.rad - 37, 20);
        this.ctx.strokeText("Next Time", this.rad - 37, 20);
  
      }else{
      this.ctx.font = "bold 40px 'Afacad', sans-serif"; 
        this.ctx.fillText(sector.label, this.rad - 55, 10);
        this.ctx.strokeText(sector.label, this.rad - 55, 10);
        // this.ctx.fillText(sector.label, this.rad - 10, 50);
      }

  
    this.ctx.restore();
  }
 

  frame() {
    
    
    if (!this.angVel) return;
    
    this.angVel *= this.friction; // Decrement velocity by friction
    if (this.angVel < 0.02) this.angVel = 0; // Bring to stop
    this.ang += this.angVel; // Update angle
    this.ang %= 360; // Normalize angle

    
    // if(this.angVel < 0.529 && this.ang<359){
      // console.log("ang=> inner",this.ang, this.angVel);
    //   let targetI=this.getIndex();
    //   this.finalAngle = this.targetIndex !== null ? (this.targetIndex * (360 - this.arcDeg))%360 + 360 : targetI * this.arcDeg;
    //   // console.log("ang=> this.targetIndex * (360 - this.arcDeg))%360",this.targetIndex * (360 - this.arcDeg)%360);
    //   // console.log("ang=> this.getIndex()", targetI);
    //   const canvas = this.wheel.nativeElement;
    //   canvas.style.transition = 'transform 5s ease-in-out';
    //   // canvas.style.transform = `rotate(${this.finalAngle + 720}deg)`;
    //   // this.angVel = 0;
    //   // return; 
    
      
      
    // } 
  
    // this.targetIndex = 2

    let startingAng = this.targetIndex !== null ? (this.targetIndex * (this.arcDeg))%360  : this.getIndex() * this.arcDeg;
    //  startingAng = this.getIndex() * this.arcDeg + 15;

    // console.log("ang getIndex=> before",this.getIndex(),"startingAng=>",startingAng);
    
    //  startingAng = startingAng - this.arcDeg +15;
    
    let lastAng  = startingAng+ this.arcDeg -15;
   
    
    let startingAngRoate = this.getIndex()*this.arcDeg;
    let lastAngRoate = startingAngRoate + this.arcDeg;
    // console.log("startingAng ang=>",startingAng,"startingAngRoate=>",startingAngRoate,"startingAngRoateWithminu=>",360-startingAngRoate);
    // console.log("lastAng ang=> ", lastAng,"lastAngRoate =>",lastAngRoate, "lastAngRoate =>",360-lastAngRoate); 

    // console.log("ang =>",this.ang);
    // console.log("ang startingAng=>",startingAng);
    // console.log("ang lastAng=>",lastAng);
    // console.log("ang angVel=>",this.angVel);
    // console.log("arcDeg =>",this.arcDeg);



    var audio:any = document.getElementById("myAudio");
    // audio.currentTime = 0;
    audio.play();
    
    
    
    

    if( ((this.ang)>= startingAng && (this.ang) <= lastAng ) && this.angVel < 2){
      // console.log("sector ang stop1=> ",this.angVel); 
      this.angVel = 0;
      var audio:any = document.getElementById("myAudio");
      audio.currentTime = 0;
      audio.pause();
      // this.showCongratulation = true;
      // this.showGifDiv = true;

      var loosingSound:any = document.getElementById("loosingSound");
      var winningAudio:any = document.getElementById("winningSound");
      var till_till:any = document.getElementById("till_till");

      till_till.play();
 
      this.ctx.save();

      // debugger
  
      // console.log("sector =>",sector.label,"index =>",ang,this.arcDeg);
      
      // Draw Sector


      setTimeout(() => {
        this.showGifDiv = true;
        till_till.pause();
        till_till.currentTime = 0;
      }, 1400);
     
      
      setTimeout(() => {
         this.showContentDiv = true;  
        if(this.targetSectorObject.reward_amount == '0'){ 
          loosingSound.play(); 
        }else{ 
          winningAudio.play(); 
        }
 
      }, 2400);


      setTimeout(()=>{
        if(this.targetSectorObject.reward_amount == '0'){ 
          loosingSound.pause();
          loosingSound.currentTime = 0;

        }else{ 
          winningAudio.pause();
          winningAudio.currentTime = 0;

        }
        //  this.dataService.pageNumber = 3;
      },5900)


       let index = 0; 

      // Redraw all sectors but highlight the selected one
       
         let interval= setInterval(()=>{ 
            if(index%2 == 0){
              this.highlightSector(this.spinWheelObjectArray[this.tarInx],this.tarInx,'white');
             }else{ 
              // console.log("Harsh spin->",this.spinWheelObjectArray[this.tarInx]);
              
              
              this.highlightSector(this.spinWheelObjectArray[this.tarInx],this.tarInx,this.spinWheelObjectArray[this.tarInx].color );

            }
            index++;
            if(index == 6){
              clearInterval(interval);
            }
          },200);
          // this.highlightSector(sector, i);  // Highlight the selected sector
           
         
      // console.log("sector ang stop2=> ",this.angVel);

    }
    // if (this.angVel < 0.529 && this.ang < 359) {
    //   const targetIndex = this.getIndex();      
    //   // Calculate the final angle by always adding the necessary degrees to complete the spin clockwise
    //   const angleToAdd = (this.targetIndex * this.arcDeg) - this.ang;
    //   this.finalAngle = this.ang + angleToAdd + 360; // Add 360 to ensure it's a clockwise rotation  
    //   const canvas = this.wheel.nativeElement;
    //   canvas.style.transition = 'transform 3s ease-in-out';  // Adjust time as necessary
    //   canvas.style.transform = `rotate(${this.finalAngle}deg)`;
    //   this.angVel = 0;
    //   this.isThisStop = true;
    //   return;
    // }
    // console.log("ang=> final",this.ang, this.angVel);


    
    this.rotate();
  }

  engine() {
    if (this.angVel > 0) {
      requestAnimationFrame(this.frame.bind(this));
    }
    // requestAnimationFrame(this.frame.bind(this));
  }


  getIndex2 = () => {
    const sectorAngle = 360 / this.tot;
    let normalizedAngle = this.ang % 360;
    if (normalizedAngle < 0) {
      normalizedAngle += 360;
    }

    for (let i = 0; i < this.tot; i++) {
      if (normalizedAngle >= i * sectorAngle && normalizedAngle < (i + 1) * sectorAngle) {
        return i;
      }
    }

    return 0;
  }
  


  getIndex = () => {
    const sectorAngle = 360 / this.tot;
    let normalizedAngle = this.ang % 360;
    if (normalizedAngle < 0) {
      normalizedAngle += 360;
    }

    for (let i = 0; i < this.tot; i++) {
      if (normalizedAngle >= i * sectorAngle && normalizedAngle < (i + 1) * sectorAngle) {
        // console.log("ang=> normalizedAngle",normalizedAngle);
        // console.log("sector ang=> ",sectorAngle); 
        return i;
      }
    }       

    return 0;
  }

  degToRad(deg: number) {
    return (deg * Math.PI) / 180;
  }

  
  isSpinOn:boolean = false;
 
  spinner() {
   
    var audio:any = document.getElementById("myAudio");
    audio.currentTime = 0;
    audio.play();

    this.updateClientStatsu();
    this.isSpinOn = true;
    this.finalAngle = '';
    // console.log("hello stop1==", this.isThisStop);  
    // if (this.angVel !== 0) {
      // console.log("The wheel is still spinning. Please wait until it stops completely.");
    //   return; // Prevent further spinning until the wheel stops completely
    // }    
    // if (this.initialSpin) {
    //   this.ang = 0; // Start from the 0 index
    //   this.initialSpin = false; // Mark the first spin as completed
    // }
    if (!this.isThisStop) { 
      return    
    } 
    // this.angVel = this.rand(0.25, 0.35)
    const canvas = this.wheel.nativeElement;
    canvas.style.transition = ''; // Remove transition before starting the spin 
    this.angVel = 8; 
    this.angVel = 20; 
 

    this.ang = 0;
    // console.log("angularVelocity", this.angVel,this.arcDeg, this.rand(0.25, 0.35)); 
    this.engine();
    const randomIndex = Math.floor(Math.random() * this.targetIndexArray.length);
    const randomElementIndex = this.targetIndexArray[randomIndex];
    this.wheelSelectedData = this.sectors[randomElementIndex].label;
    this.targetIndex = randomElementIndex; 
    // console.log("harshs wheelSelectedData",this.targetIndexArray, this.wheelSelectedData);
    this.isThisStop = false;
    
  
    // audio.playbackRate = "0.5";
    // console.log("hello stop2==", this.isThisStop); 


  }


  updateClientStatsu(){ 

     
    }
  


  reset(){
    // this.ctx.reset();
    // this.createWheel();
  }


}
  
