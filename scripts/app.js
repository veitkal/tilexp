
let p5_draft = new p5(function (p) {
'use strict'

  // Constants
      // const BASE_DIR = "../assets/parts/"
      let BASE_DIR = "https://veitkal.github.io/tilexp/assets/parts/"
  const imgRes = {
    width: 280,
    height: 162,
  }

  const imgCount = 11;

  let displaceShader, noiseShader, feedbackShader;

  let updateCounter = 0;
  let updateBool = false;

  let DISPLACE_WEBGL = false;


  // Settings
  let settings = {
    repeatSizeX: 3,
    repeatSizeY: 3,
    repeatCount: 1,
    beatCount: 1,
    zoom: 0.6,
    debug: false
  }
  
  // Displace Uniforms
  let displaceSettings = {
    showDisplacement: false,
    maximum: 0.1,
    noiseGridCols: 20,
    noiseGridRows: 20,
    noiseSpeed: 5,
    noiseScale: 0.1,
    noiseThreshold: 0.5,
    noiseThresholdMix: 0.75,
    noiseBorders: false,
  }

  let displaceNoiseSettingsGLSL = {
    xScale: 5.0,
    yScale: 5.0,
    xSpeed: 0.1,
    ySpeed: 0.1,
    smoothAmnt: 0.1,
    stepAmnt: 0.1
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

  let displaceTypes = {
    noiseCPU: false,
    noiseGPU: true,
    grid: false,
  }

  let randomSettings = {
    weighting: .5,
    repeatWeighting: .5,
  }

  // Canvas settings
  let canvasWidth = p.windowWidth;
  let canvasHeight = p.windowHeight;
  let bgColor = 255;

  // Init Arrays
  let imgArr = [];
  let repeatArr = [];
  let rowArr = [];
  let repeatRandomArr = [];

  let repeatBuffer, textureBuffer, displaceBuffer, displaceBufferWEBGL, screenBuffer, feedbackBufferA, feedbackBufferB;

  // Animation
  let animationSettings = {
    run: true
  }

  let animationCounter = 0;



    let gui_displaceTypeNoiseCPU;
    let gui_displaceTypeNoiseGPU;
    let gui_displaceTypeNoiseGrid;

  const setUpdateBool = () => {
    updateBool = true
    p.loop();
  };

  p.preload = () => {
    // Load shaders
    displaceShader = p.loadShader('./scripts/displaceShader.vert', './scripts/displaceShader.frag');
    noiseShader = p.loadShader('./scripts/noiseGPU.vert', './scripts/noiseGPU.frag');
    feedbackShader = p.loadShader('./scripts/feedback.vert', './scripts/feedback.frag');
    
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
  p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    // p.createCanvas(imgRes.width * settings.repeatSizeX, imgRes.height * settings.repeatSizeY, p.WEBGL);
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
    // Add animation toggle
    gui.add(animationSettings, "run").name("Animate");
    // Add Settings
    let gui_settings = gui.addFolder("Settings");
    // HIDE FOR NOW
    gui_settings.add(settings, "repeatSizeX", 1, 10, 1).listen().onChange(function(){updateSettings()});
    gui_settings.add(settings, "repeatSizeY", 1, 10, 1).listen().onChange(function(){updateSettings()});
    // gui_settings.add(settings, "repeatCount", 1, 10, 1);
    // gui_settings.add(settings, "beatCount", 1, 50, 1);
    // HIDE FOR NOW
    gui_settings.add(settings, "zoom", 0.1, 1.5, 0.1);
    gui_settings.add(settings, "debug").name("Debug");
    //Add displace settings
    let gui_displaceSettings = gui.addFolder("Displace");
    gui_displaceSettings.add(displaceSettings, "maximum", 0, 2, 0.01);
    gui_displaceSettings.add(displaceSettings, "showDisplacement");

    let gui_displaceType = gui.addFolder("Displace Type");
    gui_displaceType.add(displaceTypes, 'noiseCPU').name('Noise CPU').listen().onChange(function(){setDisplaceType("noiseCPU")});
    gui_displaceType.add(displaceTypes, 'noiseGPU').name('Noise GPU').listen().onChange(function(){setDisplaceType("noiseGPU")});
    gui_displaceType.add(displaceTypes, 'grid').name('Grid').listen().onChange(function(){setDisplaceType("grid")});

    gui_displaceTypeNoiseCPU = gui_displaceType.addFolder("Displace Noise CPU");
    gui_displaceTypeNoiseCPU.add(displaceSettings, "noiseGridRows", 1, 100, 1);
    gui_displaceTypeNoiseCPU.add(displaceSettings, "noiseGridCols", 1, 100, 1);
    gui_displaceTypeNoiseCPU.add(displaceSettings, "noiseSpeed", 0, 20, 1);
    gui_displaceTypeNoiseCPU.add(displaceSettings, "noiseScale", 0.01, 2, 0.01);
    gui_displaceTypeNoiseCPU.add(displaceSettings, "noiseThreshold", 0, 1, 0.1);
    gui_displaceTypeNoiseCPU.add(displaceSettings, "noiseThresholdMix", 0, 1, 0.01);
    gui_displaceTypeNoiseCPU.add(displaceSettings, "noiseBorders");

    gui_displaceTypeNoiseGPU = gui_displaceType.addFolder("Displace Noise GPU");
    gui_displaceTypeNoiseGPU.add(displaceNoiseSettingsGLSL, "xScale", 0, 100, 1);
    gui_displaceTypeNoiseGPU.add(displaceNoiseSettingsGLSL, "yScale", 0, 100, 1);
    gui_displaceTypeNoiseGPU.add(displaceNoiseSettingsGLSL, "xSpeed", 0, 1, 0.01);
    gui_displaceTypeNoiseGPU.add(displaceNoiseSettingsGLSL, "ySpeed", 0, 1, 0.01);
    gui_displaceTypeNoiseGPU.add(displaceNoiseSettingsGLSL, "smoothAmnt", 0, 1, 0.01);
    gui_displaceTypeNoiseGPU.add(displaceNoiseSettingsGLSL, "stepAmnt", 0, 1, 0.01);

    gui_displaceTypeNoiseGrid = gui_displaceType.addFolder("Displace Grid");
    //Add repeat type
    // HIDE FOR NOW
    // let gui_repeat_type = gui.addFolder("Row Repeat Mode");
    // gui_repeat_type.add(repeatTypes, 'forward').name('Forward').listen().onChange(function(){setRepeatType("forward")});
    // gui_repeat_type.add(repeatTypes, 'backward').name('Backward').listen().onChange(function(){setRepeatType("backward")});
    // gui_repeat_type.add(repeatTypes, 'mirror').name('Mirror').listen().onChange(function(){setRepeatType("mirror")});
    // gui_repeat_type.add(repeatTypes, 'random').name('Random').listen().onChange(function(){setRepeatType("random")});
    // HIDE FOR NOW
    //Add generator type
    let gui_generator_type = gui.addFolder("Generator Select");
    gui_generator_type.add(generatorTypes, 'random').name('Random').listen().onChange(function(){setGeneratorType("random")});
    gui_generator_type.add(generatorTypes, 'noise').name('Noise').listen().onChange(function(){setGeneratorType("noise")});
    gui_generator_type.add(generatorTypes, 'waveShape').name('Wave Shape').listen().onChange(function(){setGeneratorType("waveShape")});
    // Add Save Btns
    gui.add({'saveDisplacedRepeat': saveDisplacedRepeat}, 'saveDisplacedRepeat').name('Save Displaced Repeat');
    gui.add({'saveRepeat': saveRepeat}, 'saveRepeat').name('Save Repeat');
    // gui.add({'savePattern': savePattern}, 'savePattern').name('Save Pattern'); // HIDE FOR NOW

    init();

  }

  function init() {
    // Init image buffers
    repeatBuffer = p.createGraphics(imgRes.width * settings.repeatSizeX, imgRes.height * settings.repeatSizeY);
    repeatBuffer.imageMode(p.CENTER);
    repeatBuffer.angleMode(p.DEGREES);
    repeatBuffer.clear();

    screenBuffer = p.createGraphics(repeatBuffer.width, repeatBuffer.height, p.WEBGL);
    textureBuffer = p.createGraphics(repeatBuffer.width, repeatBuffer.height);
    displaceBuffer = p.createGraphics(repeatBuffer.width, repeatBuffer.width);
    displaceBufferWEBGL = p.createGraphics(repeatBuffer.width, repeatBuffer.width, p.WEBGL);
    feedbackBufferA= p.createGraphics(repeatBuffer.width, repeatBuffer.width, p.WEBGL);
    feedbackBufferB= p.createGraphics(repeatBuffer.width, repeatBuffer.width, p.WEBGL);


    repeatArr = createRepeatArr();

    p.imageMode(p.CENTER);
    p.angleMode(p.DEGREES);
    textureBuffer.imageMode(p.CENTER);
    updateBool = true;
    
    // set shader
    screenBuffer.shader(displaceShader);
    feedbackBufferA.shader(feedbackShader);

    setDisplaceType("noiseGPU");

    update();
  }

  //
  // Draw Function
  //
  p.draw = () => {
    update();

    p.background(bgColor);
    p.background(175)

    displaceBuffer.clear();
    screenBuffer.clear();
    displaceBuffer.noStroke();

    drawDisplace();

    textureBuffer.noStroke();
    textureBuffer.clear();
    // textureBuffer.background(255);
    textureBuffer.push();
    // textureBuffer.scale(settings.zoom, settings.zoom);
    // textureBuffer.translate(-p.width/2, -p.height/2);

    //
    // for(let cols = 0; cols < settings.beatCount; cols++) {
    //   for(let rows = 0; rows < settings.repeatCount; rows++) {
    //     let xpos = imgRes.width * settings.repeatSizeX;
    //     let ypos = imgRes.height * settings.repeatSizeY;
    //     xpos = repeatBuffer.width;
    //     ypos = repeatBuffer.height;

    //     textureBuffer.push();


    //     textureBuffer.translate(xpos * rows, ypos * cols)

    //     // Check Repeat Mode
    //     if(repeatTypes.forward) {
    //         textureBuffer.image(repeatBuffer,repeatBuffer.width/2, repeatBuffer.height/2);
    //          // textureBuffer.image(repeatBuffer,repeatBuffer.width/2, repeatBuffer.height/2);
    //       // drawImgToBuffer(textureBuffer, 0, 0);
         
    //     } else if(repeatTypes.backward) {
    //         textureBuffer.scale(-1, 1)
    //         textureBuffer.image(repeatBuffer,-repeatBuffer.width/2, repeatBuffer.height/2);
    //     } else  if(repeatTypes.mirror) {
    //       if((rows % 2) == 0) {
    //         textureBuffer.scale(-1, 1)
    //         textureBuffer.image(repeatBuffer,-repeatBuffer.width/2, repeatBuffer.height/2);
    //       } else {
    //         textureBuffer.image(repeatBuffer,repeatBuffer.width/2, repeatBuffer.height/2);
    //       }
    //     } else if (repeatTypes.random) {

    //       if (repeatRandomArr[rows]) {
    //         textureBuffer.scale(-1, 1)
    //         textureBuffer.image(repeatBuffer,-repeatBuffer.width/2, repeatBuffer.height/2);
    //       } else {
    //         textureBuffer.image(repeatBuffer,repeatBuffer.width/2, repeatBuffer.height/2);
    //       }
    //     } else {
    //         textureBuffer.image(repeatBuffer,repeatBuffer.width/2, repeatBuffer.height/2);
    //     }

    //     // textureBuffer.stroke(255,0,0);
    //     // textureBuffer.noFill();
    //     // textureBuffer.rect(repeatBuffer.width/2, repeatBuffer.height/2, repeatBuffer.width, repeatBuffer.height)
        
    //     textureBuffer.pop();
    //   }
    // }

    // if(settings.debug) {
    //   textureBuffer.stroke(255,0,0);
    //   textureBuffer.noFill();
    //   textureBuffer.rect(0,0, repeatBuffer.width, repeatBuffer.height);
    // }
    textureBuffer.pop();


            // textureBuffer.image(repeatBuffer,textureBuffer.width/2, textureBuffer.height/2);
    // console.log(repeatArr)
    // console.log("calc width: " + imgRes.width * repeatArr[0].length + " bufferWidth: " + repeatBuffer.width + " screenBuffer Width: " + screenBuffer.width + " textureBuffer Width: " + textureBuffer.width)
    // console.log("calc height: " + imgRes.height * repeatArr.length + " bufferHeigh: " + repeatBuffer.height + " screenBuffer Height: " + screenBuffer.height + " textureBuffer Height: " + textureBuffer.height)

    // textureBuffer.image(repeatBuffer, textureBuffer.width/2, textureBuffer.height/2, imgRes.width * settings.repeatSizeX, imgRes.height * settings.repeatSizeY)
    // textureBuffer.image(imgArr[0], 0,0, textureBuffer.width, textureBuffer.height)
    //
    //!!!!!!!!
    textureBuffer.fill(255,0,0);
    textureBuffer.rect(0,0,textureBuffer.width, textureBuffer.height);
    textureBuffer.fill(255,0,0);
////    // textureBuffer.image(imgArr[0], textureBuffer.width/2, textureBuffer.height/2, textureBuffer.width, textureBuffer.height)



    textureBuffer.image(repeatBuffer, textureBuffer.width/2, textureBuffer.height/2, textureBuffer.width, textureBuffer.height)
    // p.image(repeatBuffer, 0, 0)

    console.log(textureBuffer.width)
    
          drawScreen();
    // p.image(displaceBuffer, p.width/2, p.height/2);

    // p.noLoop();
    // p.image(repeatBuffer, 0, 0);

  }

  p.keyPressed = () => {
    if (p.keyCode === p.RIGHT_ARROW) {
      setUpdateBool();
    }
  }



function drawScreen() {
  displaceShader.setUniform('texture', textureBuffer);
  if(DISPLACE_WEBGL) {
  displaceShader.setUniform('dispTexture', displaceBufferWEBGL);
  } else {
  displaceShader.setUniform('dispTexture', displaceBuffer);
  }
  displaceShader.setUniform('noise', getNoiseValue());
  displaceShader.setUniform('maximum', displaceSettings.maximum);
  displaceShader.setUniform('showDisplacement', displaceSettings.showDisplacement);

  screenBuffer.rect(-p.width/2, -p.height/2, screenBuffer.width, screenBuffer.height)
  p.texture(screenBuffer);

  p.rect(-p.width/2, -p.height/2, repeatBuffer.width * settings.zoom, repeatBuffer.height * settings.zoom);
  
  ///// Feedback Experiment

  //feedbackBufferA.texture(screenBuffer);
  //feedbackBufferA.rect(0, 0, feedbackBufferA.width, feedbackBufferA.height)
  //let t = feedbackBufferA;
  //feedbackBufferA = feedbackBufferB;
  //feedbackBufferB = t;
  //feedbackShader.setUniform('texture', feedbackBufferB);
  //feedbackShader.setUniform('texture_src', repeatBuffer);

  //p.texture(feedbackBufferA);
  //p.rect(0, 0, repeatBuffer.width * settings.zoom, repeatBuffer.height * settings.zoom);
  ///////
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

    if(animationSettings.run) {
      animationCounter++
    }

    updateCounter++;
    updateBool = false;
  }

function drawDisplace() {
    if(displaceTypes.noiseCPU) { 
      for(let i = 0; i < displaceSettings.noiseGridCols; i++) {
        for(let j = 0; j < displaceSettings.noiseGridRows; j++) {
          let sw = Math.ceil(displaceBuffer.width / displaceSettings.noiseGridRows);
          let sh = Math.ceil(displaceBuffer.height / displaceSettings.noiseGridCols);
          let sx  = sw * j;
          let sy  = sh * i;
          let idx = i + j; 

          let noiseSpeed = animationCounter * (displaceSettings.noiseSpeed / 1000)
          let nx =  ((j * displaceSettings.noiseScale) + noiseSpeed);
          let ny = ((i * displaceSettings.noiseScale) + noiseSpeed);
          let c = 255 * p.noise(nx, ny);
          // c = c > 255/2 ? 255 * c : 0;
          let threshVal = c > (255 * displaceSettings.noiseThreshold) ?  255 : 0;
          let cMix = p.lerp(c, threshVal, displaceSettings.noiseThresholdMix);

          // Check/Do borders

          if(displaceSettings.noiseBorders) {
            cMix = i === 0 || j === 0 || i === displaceSettings.noiseGridCols - 1 || j === displaceSettings.noiseGridRows - 1 ? 0 : cMix;
          }

          // Fill noise
          displaceBuffer.stroke(cMix);
          displaceBuffer.fill(cMix);
          //
          // Draw Rectangle in grid
          displaceBuffer.rect(sx, sy, sw, sh);
        }
      }
    } else if(displaceTypes.noiseGPU) { 
      noiseShader.setUniform("u_resolution",[displaceBufferWEBGL.width,displaceBufferWEBGL.height]);
      noiseShader.setUniform("u_time", animationCounter);
      noiseShader.setUniform("u_xscale", displaceNoiseSettingsGLSL.xScale);
      noiseShader.setUniform("u_yscale", displaceNoiseSettingsGLSL.yScale);
      noiseShader.setUniform("u_xspeed", displaceNoiseSettingsGLSL.xSpeed);
      noiseShader.setUniform("u_yspeed", displaceNoiseSettingsGLSL.ySpeed);
      noiseShader.setUniform("u_smooth", displaceNoiseSettingsGLSL.smoothAmnt);
      noiseShader.setUniform("u_threshold", displaceNoiseSettingsGLSL.stepAmnt);

      displaceBufferWEBGL.shader(noiseShader);

      displaceBufferWEBGL.rect(0,0, displaceBuffer.width, displaceBuffer.height );

    } else if(displaceTypes.grid) { 

    }

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
    //
    // repeatBuffer.width = settings.repeatSizeX * imgRes.width;
    // repeatBuffer.height = settings.repeatSizeY * imgRes.height;
    //
    repeatBuffer = p.createGraphics(imgRes.width * settings.repeatSizeX, imgRes.height * settings.repeatSizeY);

    repeatBuffer.imageMode(p.CENTER);
    repeatBuffer.angleMode(p.DEGREES);
   
    repeatBuffer.clear();

    repeatBuffer.noStroke();
    repeatBuffer.fill(255);
    repeatBuffer.rect(0,0, repeatBuffer.width, repeatBuffer.height);

    for(let y = 0; y < repeatArr.length; y++) {
      for(let x = 0; x < repeatArr[y].length; x++) {
        const posX = (imgRes.width * x) + (imgRes.width / 2)
        const posY = (imgRes.height * y) + (imgRes.height / 2)
        // const posX = x * (imgWidth)
        // const posY = y * (imgHeight)
         
        repeatBuffer.push();
          repeatBuffer.translate(posX, posY);
        // if(p.random() > 0.3) {
        //   repeatBuffer.rotate(90);
        // }
          const idx = repeatArr[y][x];
          repeatBuffer.image(imgArr[idx], 0, 0,imgRes.width, imgRes.height);
          // repeatBuffer.image(imgArr[idx], 0, 0, imgWidth, imgHeight);

        repeatBuffer.pop();

        }
      }

    // DEBUG
    if(settings.debug) {
      for(let y = 0; y < repeatArr.length; y++) {
        for(let x = 0; x < repeatArr[y].length; x++) {
          const posX = (imgRes.width * x) 
          const posY = (imgRes.height * y)

          if (y === 0 && x === 0){
          repeatBuffer.stroke(0,255,0);
          } else {
          repeatBuffer.stroke(255,0,0);
          }
          repeatBuffer.noFill();
          repeatBuffer.rect(posX, posY, imgRes.width, imgRes.height)
        }
      }
    }
    // repeatBuffer.fill(120, 100, 100);
    // repeatBuffer.strokeWeight(3);
    // repeatBuffer.stroke(0,255,255);
    // repeatBuffer.rect(0, 0, repeatBuffer.width, repeatBuffer.height)

    console.log(repeatArr)
    console.log("calc width: " + imgRes.width * repeatArr[0].length + " bufferWidth: " + repeatBuffer.width + " screenBuffer Width: " + screenBuffer.width + " textureBuffer Width: " + textureBuffer.width)
    console.log("calc height: " + imgRes.height * repeatArr.length + " bufferHeigh: " + repeatBuffer.height + " screenBuffer Height: " + screenBuffer.height + " textureBuffer Height: " + textureBuffer.height)
   
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
    // textureBuffer = p.createGraphics(repeatBuffer.width, repeatBuffer.height);
  }

  function saveDisplacedRepeat(){
    let fileName = 'displacedRepeat' + updateCounter;

    p.saveCanvas(screenBuffer, fileName, 'jpg');
  }

  function saveRepeat(){
    // repeatBuffer = p.createGraphics(imgRes.width * settings.repeatSizeiX, imgRes.height * settings.repeatSizeY);
    let fileName = 'repeat' + updateCounter;

    // repeatBuffer.fill(255)
    // for(let i = 0; i < repeatArr.length; i++) {
    //   let x = (imgRes.width * i);
    //   let y = 0;
    //   repeatBuffer.image(imgArr[repeatArr[i]], x, y);
    // }

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

  function setDisplaceType( prop ){
    for (let param in displaceTypes){
      displaceTypes[param] = false;
    }
    displaceTypes[prop] = true;

    // show/hide Gui folders
    gui_displaceTypeNoiseCPU.hide();
    gui_displaceTypeNoiseGPU.hide();
    gui_displaceTypeNoiseGrid.hide();

    switch(prop) {
      case "noiseCPU":
        DISPLACE_WEBGL = false;
    gui_displaceTypeNoiseCPU.show();
    gui_displaceTypeNoiseCPU.open();
        break;
      case "noiseGPU":
        DISPLACE_WEBGL = true;
    gui_displaceTypeNoiseGPU.show();
    gui_displaceTypeNoiseGPU.open();
        break;
      case "grid":
        DISPLACE_WEBGL = true;
    gui_displaceTypeNoiseGrid.show();
    gui_displaceTypeNoiseGrid.open();
        break;
      default:
        break;
    }

    updateBool = true;
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
