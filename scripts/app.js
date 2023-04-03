
let p5_draft = new p5(function (p) {
'use strict'

  // Constants
      const BASE_DIR = "../assets/parts/"
      // let BASE_DIR = "https://veitkal.github.io/tilexp/assets/parts/"
  const imgRes = {
    width: 280,
    height: 162,
  }

  const imgCount = 11;

  let updateCounter = 0;
  let updateBool = false;


  // Settings
  let settings = {
    repeatSizeX: 3,
    repeatSizeY: 5,
    repeatCount: 1,
    beatCount: 1,
    zoom: 0.2
  }

  let generatorTypes = {
    random: true,
    noise: false,
    waveShape: false,
  }

  let repeatTypes = {
    forward: true,
    backward: false,
    mirror: false,
    random: false,
  }

  let randomSettings = {
    weighting: .5,
  }

  // Vanvas settings
  let canvasWidth = p.windowWidth;
  let canvasHeight = p.windowHeight;
  let bgColor = 255;

  // Image arrays
  let imgArr = [];
 
  // 
  let repeatArr = [];
  let rowArr = [];

  let repeatBuffer, webglBuffer;

  let displayShaderBool = false;

  const setUpdateBool = () => {
    updateBool = true
    p.loop();
  };

  p.preload = () => {
    // Load Images;
    for(let i = 0; i < imgCount; i++){
      let count = i + 1;
      let fileStr = "";
      if (count < 10) {
        fileStr = "mdel_0" + count + ".jpg";
      } else if (count >= 10) {
        fileStr = "mdel_" + count + ".jpg";
      }
      console.log(BASE_DIR + fileStr);

      let tempImg = p.loadImage(BASE_DIR + fileStr);
      imgArr.push(tempImg);

    }
  }

  p.setup = () => {
    p.createCanvas(canvasWidth - 20,canvasHeight);
    p.background(bgColor);
    p.noStroke();
    p.noFill();
    // p.noLoop();

    // GUI
    // Add main GUI
    let gui = new dat.GUI();
    // Add update btn
    gui.add({'update': setUpdateBool}, 'update').name('Click to Update');
    // Add Settings
    let gui_settings = gui.addFolder("Settings");
    gui_settings.add(settings, "repeatSizeX", 1, 5, 1).listen().onChange(function(){updateSettings()});
    gui_settings.add(settings, "repeatSizeY", 1, 5, 1).listen().onChange(function(){updateSettings()});
    gui_settings.add(settings, "repeatCount", 1, 10, 1);
    gui_settings.add(settings, "beatCount", 1, 50, 1);
    gui_settings.add(settings, "zoom", 0.1, 1.5, 0.1);
    //Add repeat type
    let gui_repeat_type = gui.addFolder("Row Repeat Mode");
    gui_repeat_type.add(repeatTypes, 'forward').name('Forward').listen().onChange(function(){setRepeatType("forward")});
    gui_repeat_type.add(repeatTypes, 'backward').name('Backward').listen().onChange(function(){setRepeatType("backward")});
    gui_repeat_type.add(repeatTypes, 'mirror').name('Mirror').listen().onChange(function(){setRepeatType("mirror")});
    gui_repeat_type.add(repeatTypes, 'random').name('Random').listen().onChange(function(){setRepeatType("random")});
    //Add generator type
    let gui_generator_type = gui.addFolder("Generator Select");
    gui_generator_type.add(generatorTypes, 'random').name('Random').listen().onChange(function(){setGeneratorType("random")});
    gui_generator_type.add(generatorTypes, 'noise').name('Noise').listen().onChange(function(){setGeneratorType("noise")});
    gui_generator_type.add(generatorTypes, 'waveShape').name('Wave Shape').listen().onChange(function(){setGeneratorType("waveShape")});
    // Add generate texture btn
    gui.add({'displayShader': displayShader}, 'displayShader').name('Display Shader');
    // Add Save Btns
    gui.add({'saveRepeat': saveRepeat}, 'saveRepeat').name('Save Repeat');
    gui.add({'savePattern': savePattern}, 'savePattern').name('Save Pattern');


    // Allocate image buffers
    repeatBuffer = p.createGraphics(imgRes.width * settings.repeatSizeX, imgRes.height * settings.repeatSizeY);
    repeatBuffer.imageMode(p.CENTER);
    repeatBuffer.angleMode(p.DEGREES);


    repeatArr = createRepeatArr();

    p.imageMode(p.CENTER);
    p.angleMode(p.DEGREES);
    updateBool = true;
    update();
  }

  //
  // Draw Function
  //
  p.draw = () => {
    update();
    p.background(bgColor);
    p.push();
    p.scale(settings.zoom, settings.zoom);

    for(let cols = 0; cols < settings.beatCount; cols++) {
      for(let rows = 0; rows < settings.repeatCount; rows++) {
        p.push();
        let xpos = imgRes.width * settings.repeatSizeX;
        let ypos = imgRes.height * settings.repeatSizeY;
        xpos = repeatBuffer.width;
        ypos = repeatBuffer.height;
        p.translate(xpos * rows, ypos * cols)
        p.image(repeatBuffer,repeatBuffer.width/2, repeatBuffer.height/2);
        // p.image(repeatBuffer,xpos/2, ypos/2);
        p.stroke(255,0,0);
        p.noFill();
        p.rect(0, 0, xpos, ypos)
        p.pop();
      }
    }

    p.pop();


    p.noLoop();



  }

  p.keyPressed = () => {
    if (p.keyCode === p.RIGHT_ARROW) {
      setUpdateBool();
    }
  }


  //
  // Update Function
  //
  function update() {
    if(updateBool) {
      console.log("update")
      updateRepeat(repeatArr);

      // repeatArr = [];
      // rowArr = [];

      // // Create repeat 
      // for(let i = 0; i < settings.repeatSize; i++) {
      //   let s;
      //   if(generatorTypes.random) {
      //     s = p.random(imgCount - 1);
      //   } else if(generatorTypes.noise) {
      //     s = p.noise(p.frameCount + (i));
      //     s = p.map(s, -1, 1, 0, imgCount);
      //   } else if(generatorTypes.waveShape) {
      //     s = Math.sin(p.frameCount + (i));
      //     s = p.map(s, -1, 1, 0, imgCount);
      //   }
      //   //     console.log(s);
      //   let idx = Math.round(s) % imgCount;
      //   repeatArr.push(idx);
      // }
      // console.log("Repeat is: " + repeatArr);;

      // // Create row 
      // for(let i = 0; i < settings.repeatCount; i++) {
      //   // copy repeat
      //   let tempArr = repeatArr;

      //   // Test repeatTypes and manipulate
      //   if(repeatTypes.reverse) {
      //     tempArr.reverse();
      //   }

      //   if(repeatTypes.mirror) {
      //     if((i % 1) === 0) {
      //       tempArr.reverse();
      //     }
      //   }

      //   if(repeatTypes.random) {
      //     if(Math.random() > 0.5) {
      //       tempArr.reverse();
      //     }
      //   }


      //   for(let j = 0; j < settings.repeatSize; j++) {
      //     rowArr.push(repeatArr[j]);
      //   }
      // }

      // let miskArr;
      // for(let i = 0; i < settings.repeatCount; i++) {
      //   let tempArr = repeatArr;

      //     miskArr.push(tempArr);
      // }
      // rowArr.flat();
      // console.log("Row is: " + rowArr + " length is: " + rowArr.length)

    }

    updateCounter++;
    updateBool = false;
  }


  //
  // Create Repeat Function
  //
  function createRepeatArr(){
    let tempArr = init2dArray(settings.repeatSizeY, settings.repeatSizeX);
    console.log(tempArr)

    for(let y = 0; y < settings.repeatSizeY; y++) {
      for(let x = 0; x < settings.repeatSizeX; x++) {
        let idx = 0;
        // let idx = (x+y) % imgCount;
        // let idx = Math.floor(p.random(imgCount));
        tempArr[y][x] = idx;
        }
      }

   return tempArr;
  }

  //
  // Update Repeat Function
  //
  function updateRepeat(_repeatArr){

    for(let y = 0; y < _repeatArr.length; y++) {
      for(let x = 0; x < _repeatArr[y].length; x++) {
        let idx = Math.floor(p.random(imgCount));
        idx = Math.floor(p.random(imgCount));
        _repeatArr[y][x] = idx;
        }
      }
    drawRepeatToBuffer();

  }

  //
  // Update Repeat Function
  //
  function drawRepeatToBuffer(){
    repeatBuffer.width = settings.repeatSizeX * imgRes.width;
    repeatBuffer.height = settings.repeatSizeY * imgRes.height;
    repeatBuffer.clear();

    console.log(repeatBuffer.width, repeatBuffer.height);

    for(let y = 0; y < repeatArr.length; y++) {
      for(let x = 0; x < repeatArr[y].length; x++) {
        const posX = (imgRes.width * x) + (imgRes.width / 2)
        const posY = (imgRes.height * y) + (imgRes.height / 2)
         
        repeatBuffer.push();
          repeatBuffer.translate(posX, posY);
        if(p.random() > 0.3) {
          repeatBuffer.rotate(90);
        }
          const idx = repeatArr[y][x];
          repeatBuffer.image(imgArr[idx], 0, 0);
        repeatBuffer.pop();
        }
      }
   
    console.log(repeatBuffer);
  }

  //
  // GUI Callbacks
  //

  function updateSettings(){
    repeatArr.length = settings.repeatSizeY;

    for(let i = 0; i < repeatArr.length; i++) {
     if(repeatArr[i] === undefined) {
       repeatArr[i] = new Array(settings.repeatSizeX).fill(0);
     }
      // console.log(repeatArr[i])
      repeatArr[i].length = settings.repeatSizeX;
    }
      console.log(repeatArr)
    
    setUpdateBool();
  }

  function saveRepeat(){
    repeatBuffer = p.createGraphics(imgRes.width * settings.repeatSizeiX, imgRes.height * settings.repeatSizeY);
    let fileName = 'repeat' + updateCounter;

    repeatBuffer.fill(255)
    for(let i = 0; i < repeatArr.length; i++) {
      let x = (imgRes.width * i);
      let y = 0;
      repeatBuffer.image(imgArr[repeatArr[i]], x, y);
    }

    p.saveCanvas(repeatBuffer, fileName, 'jpg');
  }

  function savePattern(){
    repeatBuffer = p.createGraphics(imgRes.width * settings.repeatSizeX, imgRes.height * settings.beatCount);
    let fileName = 'pattern' + updateCounter;

    repeatBuffer.fill(255)
    for(let j = 0; j < settings.beatCount; j++) {
      for(let i = 0; i < rowArr.length; i++) {
        let x = (imgRes.width * i);
        let y = (imgRes.height * j);
        repeatBuffer.image(imgArr[rowArr[i]], x, y);
      }
    }

    p.saveCanvas(repeatBuffer, fileName, 'jpg');
  }

  function setRepeatType( prop ){
    for (let param in repeatTypes){
      repeatTypes[param] = false;
    }
    repeatTypes[prop] = true;
    updateBool = true;
  }

  function setGeneratorType( prop ){
    for (let param in generatorTypes){
      generatorTypes[param] = false;
    }
    generatorTypes[prop] = true;
    updateBool = true;
  }

  function displayShader(){
    webglBuffer = p.createGraphics(imgRes.width * rowArr.length, imgRes.height * settings.beatCount);

    webglBuffer.fill(255)
    for(let j = 0; j < settings.beatCount; j++) {
      for(let i = 0; i < rowArr.length; i++) {
        let x = (imgRes.width * i);
        let y = (imgRes.height * j);
        webglBuffer.image(imgArr[rowArr[i]], x, y);
      }
    }

    webglBuffer.loadPixels();

    for(var i = 0; i < 2; i++){
      for(var y = 0; y < webglBuffer.height; y++){
        for(var x = 0; x < webglBuffer.width; x++){
          // calculate 1D index from x,y
          let pixelIndex = x + (y * webglBuffer.width);
          // note that as opposed to Processing Java, p5.Image is RGBA (has 4 colour channels, hence the 4 bellow)
          // and the pixels[] array is equal to width * height * 4 (colour cannels)
          // therefore the index is also * 4
          let rIndex = pixelIndex * 4;

          let nextIndex = (y * webglBuffer.width + x) * 4 + (4 * p.int(p.random(-2, 2)));
          nextIndex = nextIndex % (webglBuffer.width * webglBuffer.height * 4);

          const r = webglBuffer.pixels[nextIndex + 0];
          const g = webglBuffer.pixels[nextIndex + 1];
          const b = webglBuffer.pixels[nextIndex + 2];

          webglBuffer.pixels[rIndex]     = r;
          webglBuffer.pixels[rIndex + 1]     = g;
          webglBuffer.pixels[rIndex + 2]     = b;

          // newPixels.push(r, g, b, 255);

          // console.log('x',x,'y',y,'pixelIndex',pixelIndex,'red index',rIndex);
          // access and assign red
          // webglBuffer.pixels[rIndex]     = p.round(p.map(x,0,3,0,255));
          // webglBuffer.pixels[rIndex + 2]     = 1;
          // webglBuffer.pixels[rIndex + 2]     = p.round(p.map(x,0,3,0,255));
          // webglBuffer.pixels[rIndex]     = 0;
          // access and assign green
          // webglBuffer.pixels[rIndex + 1] = p.round(p.map(y,0,3,0,255));
          // access and assign blue
          // webglBuffer.pixels[rIndex + 2] = 255 - webglBuffer.pixels[rIndex] + webglBuffer.pixels[rIndex + 1] 
          // access and assign alpha
          webglBuffer.pixels[rIndex + 3] = 255;

        }
      }
    }
    webglBuffer.updatePixels();
    displayShaderBool = true;
  }



}, "app_canvas"); //div id


function init2dArray(cols, rows) {
  // Initiate a 2d Array
  let tempArr = new Array(cols);
  for (let i = 0; i < tempArr.length; i++) {
    tempArr[i] = new Array(rows);
  }
  return tempArr;
}
