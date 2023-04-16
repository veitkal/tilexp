
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

  let displaceShader;

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
    noiseBorders: true,
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

  // Canvas settings
  let canvasWidth = p.windowWidth;
  let canvasHeight = p.windowHeight;
  let bgColor = 255;

  // Init Arrays
  let imgArr = [];
  let repeatArr = [];
  let rowArr = [];
  let repeatRandomArr = [];

  let repeatBuffer, textureBuffer, displaceBuffer, screenBuffer;

  // Animation
  let animationSettings = {
    run: true
  }
  let animationCounter = 0;

  const setUpdateBool = () => {
    updateBool = true
    p.loop();
  };

  p.preload = () => {
    // Load shaders
    displaceShader = p.loadShader('./scripts/displaceShader.vert', './scripts/displaceShader.frag');
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
    // gui_settings.add(settings, "repeatSizeX", 1, 5, 1).listen().onChange(function(){updateSettings()});
    // gui_settings.add(settings, "repeatSizeY", 1, 5, 1).listen().onChange(function(){updateSettings()});
    // gui_settings.add(settings, "repeatCount", 1, 10, 1);
    // gui_settings.add(settings, "beatCount", 1, 50, 1);
    // HIDE FOR NOW
    gui_settings.add(settings, "zoom", 0.1, 1.5, 0.1);
    gui_settings.add(settings, "debug").name("Debug");
    //Add displace settings
    let gui_displaceSettings = gui.addFolder("Displace");
    gui_displaceSettings.add(displaceSettings, "maximum", 0, 2, 0.01);
    gui_displaceSettings.add(displaceSettings, "noiseGridRows", 1, 100, 1);
    gui_displaceSettings.add(displaceSettings, "noiseGridCols", 1, 100, 1);
    gui_displaceSettings.add(displaceSettings, "noiseSpeed", 0, 20, 1);
    gui_displaceSettings.add(displaceSettings, "noiseScale", 0.01, 2, 0.01);
    gui_displaceSettings.add(displaceSettings, "noiseThreshold", 0, 1, 0.1);
    gui_displaceSettings.add(displaceSettings, "noiseThresholdMix", 0, 1, 0.01);
    gui_displaceSettings.add(displaceSettings, "noiseBorders");
    gui_displaceSettings.add(displaceSettings, "showDisplacement");
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


    // Allocate image buffers
    repeatBuffer = p.createGraphics(imgRes.width * settings.repeatSizeX, imgRes.height * settings.repeatSizeY);
    repeatBuffer.imageMode(p.CENTER);
    repeatBuffer.angleMode(p.DEGREES);
    repeatBuffer.clear();

    screenBuffer = p.createGraphics(repeatBuffer.width, repeatBuffer.height, p.WEBGL);

    // textureBuffer = p.createGraphics(p.width, p.height);
    textureBuffer = p.createGraphics(repeatBuffer.width, repeatBuffer.height);
    
    
    displaceBuffer = p.createGraphics(repeatBuffer.width, repeatBuffer.width);


    repeatArr = createRepeatArr();

    p.imageMode(p.CENTER);
    p.angleMode(p.DEGREES);
    textureBuffer.imageMode(p.CENTER);
    updateBool = true;
    
    // set shader
  screenBuffer.shader(displaceShader);

    update();
  }

  //
  // Draw Function
  //
  p.draw = () => {
    update();

    p.background(bgColor);

    displaceBuffer.clear();
    displaceBuffer.noStroke();

    for(let i = 0; i < displaceSettings.noiseGridCols; i++) {
      for(let j = 0; j < displaceSettings.noiseGridRows; j++) {
        let sw = displaceBuffer.width / displaceSettings.noiseGridRows;
        let sh = displaceBuffer.height / displaceSettings.noiseGridCols;
        let sx  = sw * j;
        let sy  = sh * i;
        let idx = i + j; 

        let noiseSpeed = animationCounter * (displaceSettings.noiseSpeed / 1000)
        let nx =  ((j * displaceSettings.noiseScale) + noiseSpeed);
        let ny = ((i * displaceSettings.noiseScale) + noiseSpeed);
        			let c = 255 * p.noise(nx, ny);
        // c = c > 255/2 ? 255 * c : 0;
          let threshVal = c > (255 * displaceSettings.noiseThreshold) ?  0 : 255;
         let cMix = p.lerp(c, threshVal, displaceSettings.noiseThresholdMix);

        // Check/Do borders

        if(displaceSettings.noiseBorders) {
        cMix = i === 0 || j === 0 || i === displaceSettings.noiseGridCols - 1 || j === displaceSettings.noiseGridRows - 1 ? 0 : cMix;
        }

        // Fill noise
			displaceBuffer.fill(cMix);
			// displaceBuffer.stroke(cMix);
        // Draw Rectangle in grid
        displaceBuffer.rect(sx, sy, sw, sh);
      }
    }

    textureBuffer.noStroke();
    textureBuffer.clear();
    textureBuffer.background(255);
    textureBuffer.push();
    // textureBuffer.scale(settings.zoom, settings.zoom);
    // textureBuffer.translate(-p.width/2, -p.height/2);

    for(let cols = 0; cols < settings.beatCount; cols++) {
      for(let rows = 0; rows < settings.repeatCount; rows++) {
        let xpos = imgRes.width * settings.repeatSizeX;
        let ypos = imgRes.height * settings.repeatSizeY;
        xpos = repeatBuffer.width;
        ypos = repeatBuffer.height;

        textureBuffer.push();


        textureBuffer.translate(xpos * rows, ypos * cols)

        // Check Repeat Mode
        if(repeatTypes.forward) {
            textureBuffer.image(repeatBuffer,repeatBuffer.width/2, repeatBuffer.height/2);
             // textureBuffer.image(repeatBuffer,repeatBuffer.width/2, repeatBuffer.height/2);
          // drawImgToBuffer(textureBuffer, 0, 0);
         
        } else if(repeatTypes.backward) {
            textureBuffer.scale(-1, 1)
            textureBuffer.image(repeatBuffer,-repeatBuffer.width/2, repeatBuffer.height/2);
        } else  if(repeatTypes.mirror) {
          if((rows % 2) == 0) {
            textureBuffer.scale(-1, 1)
            textureBuffer.image(repeatBuffer,-repeatBuffer.width/2, repeatBuffer.height/2);
          } else {
            textureBuffer.image(repeatBuffer,repeatBuffer.width/2, repeatBuffer.height/2);
          }
        } else if (repeatTypes.random) {

          if (repeatRandomArr[rows]) {
            textureBuffer.scale(-1, 1)
            textureBuffer.image(repeatBuffer,-repeatBuffer.width/2, repeatBuffer.height/2);
          } else {
            textureBuffer.image(repeatBuffer,repeatBuffer.width/2, repeatBuffer.height/2);
          }
        } else {
            textureBuffer.image(repeatBuffer,repeatBuffer.width/2, repeatBuffer.height/2);
        }

        // textureBuffer.stroke(255,0,0);
        // textureBuffer.noFill();
        // textureBuffer.rect(repeatBuffer.width/2, repeatBuffer.height/2, repeatBuffer.width, repeatBuffer.height)
        
        textureBuffer.pop();
      }
    }

    if(settings.debug) {
      textureBuffer.stroke(255,0,0);
      textureBuffer.noFill();
      textureBuffer.rect(0,0, repeatBuffer.width, repeatBuffer.height);
    }
    textureBuffer.pop();


    // p.image(textureBuffer, 0, 0);
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
  

  displaceShader.setUniform('texture', textureBuffer);
  displaceShader.setUniform('dispTexture', displaceBuffer);
  displaceShader.setUniform('noise', getNoiseValue());
  displaceShader.setUniform('maximum', displaceSettings.maximum);
  displaceShader.setUniform('showDisplacement', displaceSettings.showDisplacement);
  
  
  // p.fill(255);
  // p.rect(-p.width/2,- p.height/2, p.width, p.height);
  // p.rect(0, 0, p.width, p.height);

  screenBuffer.rect(-p.width/2, -p.height/2, repeatBuffer.width, repeatBuffer.height)
  p.texture(screenBuffer);
  // p.rect(-p.width/2, -p.height/2, p.width, p.height);

  p.rect(-p.width/2, -p.height/2, repeatBuffer.width * settings.zoom, repeatBuffer.height * settings.zoom);

  // p.rect(0, 0, repeatBuffer.width, repeatBuffer.height);
  // p.image(textureBuffer, 0, 0);
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


}, "app_canvas"); //div id


function init2dArray(cols, rows) {
  // Initiate a 2d Array
  let tempArr = new Array(cols);
  for (let i = 0; i < tempArr.length; i++) {
    tempArr[i] = new Array(rows);
  }
  return tempArr;
}
