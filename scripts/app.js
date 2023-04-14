
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

  let testShader;

  let updateCounter = 0;
  let updateBool = false;


  // Settings
  let settings = {
    repeatSizeX: 3,
    repeatSizeY: 3,
    repeatCount: 1,
    beatCount: 1,
    zoom: 0.6,
    debug: false
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
    repeatWeighting: .5,
  }

  // Vanvas settings
  let canvasWidth = p.windowWidth;
  let canvasHeight = p.windowHeight;
  let bgColor = 155;

  // Image arrays
  let imgArr = [];
 
  // 
  let repeatArr = [];
  let rowArr = [];

  let repeatRandomArr = [];

  let repeatBuffer, shaderBuffer, displaceBuffer, webglBuffer;

  let displayShaderBool = false;

  const setUpdateBool = () => {
    updateBool = true
    p.loop();
  };

  p.preload = () => {
    // Load shaders
    testShader = p.loadShader('./scripts/testShader.vert', './scripts/testShader.frag');
    // Load Images;
    for(let i = 0; i < imgCount; i++){
      let count = i + 1;
      let fileStr = "";
      if (count < 10) {
        fileStr = "mdel_0" + count + ".jpg";
      } else if (count >= 10) {
        fileStr = "mdel_" + count + ".jpg";
      }
      // console.log(BASE_DIR + fileStr);

      let tempImg = p.loadImage(BASE_DIR + fileStr);
      imgArr.push(tempImg);
    }

  }

  p.setup = () => {
  // p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.createCanvas(imgRes.width * settings.repeatSizeX, imgRes.height * settings.repeatSizeY, p.WEBGL);
    p.pixelDensity(1);
    p.noSmooth();
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
    gui_settings.add(settings, "debug").name("Debug");
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
    repeatBuffer.clear();

    shaderBuffer = p.createGraphics(p.width, p.height);
    
    displaceBuffer = p.createGraphics(200, 200);


    repeatArr = createRepeatArr();

    p.imageMode(p.CENTER);
    p.angleMode(p.DEGREES);
    shaderBuffer.imageMode(p.CENTER);
    updateBool = true;
    
    // set shader
  p.shader(testShader);
    testShader.setUniform("normalRes", [1.0/p.width, 1.0/p.height]);

    update();
  }

  //
  // Draw Function
  //
  p.draw = () => {
    update();

    p.background(bgColor);

    displaceBuffer.clear();
      displaceBuffer.fill(255, 0, 0);
    displaceBuffer.rect(0,0, displaceBuffer.width, displaceBuffer.height)
			displaceBuffer.noStroke();
    let gridCount = 20;
    for(let i = 0; i < gridCount; i++) {
      for(let j = 0; j < gridCount; j++) {
        let sw = displaceBuffer.width /gridCount;
        let sh = displaceBuffer.width / gridCount;
        let sx  = sh * j;
        let sy  = sw * i;
        let idx = i + j; 
        // if((idx % 2) == 0) {
        //   displaceBuffer.fill(0);
        // } else {
        //   displaceBuffer.fill(255);
        // }
        let nx =  ((j * 0.1) + p.millis() / 3000);
        let ny = ((i * 0.1) + p.millis() / 3000);
        			let c = 255 * p.noise(nx, ny);
        c = c > 255/2 ? 255 * c : 0;
			displaceBuffer.fill(c);
        displaceBuffer.rect(sx, sy, sw, sh);
      }
    }

    shaderBuffer.noStroke();
    shaderBuffer.clear();
    shaderBuffer.background(255);
    shaderBuffer.push();
    shaderBuffer.scale(settings.zoom, settings.zoom);
    // shaderBuffer.translate(-p.width/2, -p.height/2);

    for(let cols = 0; cols < settings.beatCount; cols++) {
      for(let rows = 0; rows < settings.repeatCount; rows++) {
        let xpos = imgRes.width * settings.repeatSizeX;
        let ypos = imgRes.height * settings.repeatSizeY;
        xpos = repeatBuffer.width;
        ypos = repeatBuffer.height;

        shaderBuffer.push();


        shaderBuffer.translate(xpos * rows, ypos * cols)

        // Check Repeat Mode
        if(repeatTypes.forward) {
            shaderBuffer.image(repeatBuffer,repeatBuffer.width/2, repeatBuffer.height/2);
             // shaderBuffer.image(repeatBuffer,repeatBuffer.width/2, repeatBuffer.height/2);
          // drawImgToBuffer(shaderBuffer, 0, 0);
         
        } else if(repeatTypes.backward) {
            shaderBuffer.scale(-1, 1)
            shaderBuffer.image(repeatBuffer,-repeatBuffer.width/2, repeatBuffer.height/2);
        } else  if(repeatTypes.mirror) {
          if((rows % 2) == 0) {
            shaderBuffer.scale(-1, 1)
            shaderBuffer.image(repeatBuffer,-repeatBuffer.width/2, repeatBuffer.height/2);
          } else {
            shaderBuffer.image(repeatBuffer,repeatBuffer.width/2, repeatBuffer.height/2);
          }
        } else if (repeatTypes.random) {

          if (repeatRandomArr[rows]) {
            shaderBuffer.scale(-1, 1)
            shaderBuffer.image(repeatBuffer,-repeatBuffer.width/2, repeatBuffer.height/2);
          } else {
            shaderBuffer.image(repeatBuffer,repeatBuffer.width/2, repeatBuffer.height/2);
          }
        } else {
            shaderBuffer.image(repeatBuffer,repeatBuffer.width/2, repeatBuffer.height/2);
        }

        // shaderBuffer.stroke(255,0,0);
        // shaderBuffer.noFill();
        // shaderBuffer.rect(repeatBuffer.width/2, repeatBuffer.height/2, repeatBuffer.width, repeatBuffer.height)
        
        shaderBuffer.pop();
      }
    }

    if(settings.debug) {
      shaderBuffer.stroke(255,0,0);
      shaderBuffer.noFill();
      shaderBuffer.rect(0,0, repeatBuffer.width, repeatBuffer.height);
    }
    shaderBuffer.pop();


    // p.image(shaderBuffer, 0, 0);
          drawScreen();
    // p.image(displaceBuffer, p.width/2, p.height/2);

    // p.noLoop();

  }

  p.keyPressed = () => {
    if (p.keyCode === p.RIGHT_ARROW) {
      setUpdateBool();
    }
  }



function drawScreen() {
  testShader.setUniform('texture', shaderBuffer);
  testShader.setUniform('dispTexture', displaceBuffer);
  testShader.setUniform('noise', getNoiseValue());
  
  p.fill(255);
  // p.rect(-p.width/2,- p.height/2, p.width, p.height);
  p.rect(0, 0, p.width, p.height);
  // p.image(shaderBuffer, 0, 0);
}

function getNoiseValue() { 
  let v = p.noise(p.millis()/100);
  const cutOff = 0.5;
  
  if(v < cutOff) {
    return 0;
  }
  
  v = p.pow((v-cutOff) * 1/(1-cutOff), 2);
  
  return v;
}

  //
  // Update Function
  //
  function update() {
    if(updateBool) {
      console.log("update")
      updateRepeat(repeatArr);


    }

    updateCounter++;
    updateBool = false;
  }


  //
  // Create Repeat Function
  //
  function createRepeatArr(){
    let tempArr = init2dArray(settings.repeatSizeY, settings.repeatSizeX);

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
        let s;
        if(generatorTypes.random) {
          s = p.random(imgCount - 1);
        } else if(generatorTypes.noise) {
          s = p.noise(p.frameCount + (x + y));
          s = p.map(s, -1, 1, 0, imgCount);
        } else if(generatorTypes.waveShape) {
          s = Math.sin(p.frameCount + (x+y));
          s = p.map(s, -1, 1, 0, imgCount);
        }
        let idx = Math.round(s) % imgCount;
        // let idx = Math.floor(p.random(imgCount));
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

    //
    // FIND A WAY TO RESIZE INSTEAD OF RECREATING
    //
    // repeatBuffer.width = settings.repeatSizeX * imgRes.width;
    // repeatBuffer.height = settings.repeatSizeY * imgRes.height;
    repeatBuffer = p.createGraphics(imgRes.width * settings.repeatSizeX, imgRes.height * settings.repeatSizeY);
    repeatBuffer.imageMode(p.CENTER);
    repeatBuffer.angleMode(p.DEGREES);
    //
    //
    //
   
    repeatBuffer.clear();

    repeatBuffer.noStroke();
    repeatBuffer.fill(255);
    repeatBuffer.rect(0,0, repeatBuffer.width, repeatBuffer.height);
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

    // DEBUG
    if(settings.debug) {
      for(let y = 0; y < repeatArr.length; y++) {
        for(let x = 0; x < repeatArr[y].length; x++) {
          const posX = (imgRes.width * x) 
          const posY = (imgRes.height * y)

          repeatBuffer.stroke(255,0,0);
          repeatBuffer.noFill();
          repeatBuffer.rect(posX, posY, imgRes.width, imgRes.height)
        }
      }
    }

    console.log(repeatArr)
    console.log("calc width: " + imgRes.width * repeatArr[0].length + " bufferWidth: " + repeatBuffer.width)
    console.log("calc height: " + imgRes.height * repeatArr.length + " bufferHeigh: " + repeatBuffer.height)
   
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
    // updateBool = true;

    repeatRandomArr.length = settings.repeatCount;
    for(let i = 0; i < repeatRandomArr.length; i++) {
      repeatRandomArr[i] = p.random() > randomSettings.repeatWeighting ? true : false;
    }
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
