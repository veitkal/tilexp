
let p5_draft = new p5(function (p) {
'use strict'

  const sampleImgWidth = 280;
  const sampleImgHeight = 162;

  let updateCounter = 0;
  let updateBool = false;
  
  let imgCount = 11;

  let settings = {
    repeatSize: 3,
    repeatCount: 5,
    beatCount: 10,
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

  let canvasWidth = p.windowWidth;
  let canvasHeight = p.windowHeight;
  let bgColor = 255;
  let imgArr = [];

  let imgRes = {
    width: sampleImgWidth,
    height: sampleImgHeight,
  }

  let repeatArr = [];
  let rowArr = [];

  let repeatBuffer;
  let webglBuffer;

  let displayShaderBool = false;

  const setUpdateBool = () => {updateBool = true};

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
    gui_settings.add(settings, "repeatSize", 1, 5, 1);
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
    repeatBuffer = p.createGraphics(imgRes.width * settings.repeatSize, imgRes.height);


    for(let i = 0; i < imgCount; i++){
      let count = i + 1;
      let baseDir = "../assets/parts/"
      // let baseDir = "https://veitkal.github.io/tilexp/assets/parts/"
      let fileStr = "";
      if (count < 10) {
      fileStr = "mdel_0" + count + ".jpg";
      } else if (count >= 10) {
      fileStr = "mdel_" + count + ".jpg";
      }
      console.log(baseDir + fileStr);

      let tempImg = p.loadImage(baseDir + fileStr);
      imgArr.push(tempImg);

    }

    updateBool = true;
    update();
  }

  p.draw = () => {
    p.scale(settings.zoom, settings.zoom);
    p.translate(20, 0);
    p.fill(255)
    p.background(bgColor);


    // Draw repeat
    p.push();
    p.fill(0)
    p.textSize(60);
    p.text('Repeat', 10, 175);
    p.translate(0, 200);

    p.fill(255)
      for(let i = 0; i < repeatArr.length; i++) {
        let x = (imgRes.width * i);
        let y = 0;
        p.image(imgArr[repeatArr[i]], x, y);
      }
    p.stroke(0)
    p.strokeWeight(2);
    p.noFill();
    // p.rect(0, 0, imgRes.width * settings.repeatSize, imgRes.height);
    p.pop();
    
    // Draw Row
    p.push();
    p.translate(0, 500);
    p.fill(0)
    p.textSize(60);
    p.text('Row', 10, -20);

    p.fill(255)
      for(let i = 0; i < rowArr.length; i++) {
        let x = (imgRes.width * i);
        let y = 0;
        p.image(imgArr[rowArr[i]], x, y);
      }
    p.stroke(0)
    p.strokeWeight(2);
    p.noFill();
    // p.rect(0, 0, imgRes.width * settings.repeatSize, imgRes.height);
    p.pop();

    // Draw pattern
    p.push();
    p.translate(0, 700);
    p.fill(0)
    p.textSize(60);
    p.text('Pattern', 10, 175);
    p.translate(0, 200);
    for(let j = 0; j < settings.beatCount; j++) {
      for(let i = 0; i < rowArr.length; i++) {
        let x = (imgRes.width * i);
        let y = (imgRes.height * j);
        p.image(imgArr[rowArr[i]], x, y);
      }
    }
    p.pop();


    p.push();
    if(displayShaderBool) {
      // p.stroke(255,0,0);
      p.fill(255,0,0);
      // p.rect(0, 900, imgRes.width * rowArr.length, imgRes.height * settings.beatCount);
      p.image(webglBuffer, 0, 900, imgRes.width * rowArr.length, imgRes.height * settings.beatCount);
    }
    p.pop();
    

    update();

    


  }

  p.keyPressed = () => {
    if (p.keyCode === p.RIGHT_ARROW) {
      updateBool = true;
      // p.loop();
    }
  }


  function update() {
    if(updateBool) {

      repeatArr = [];
      rowArr = [];

      // Create repeat 
      for(let i = 0; i < settings.repeatSize; i++) {
        let s;
        if(generatorTypes.random) {
          s = p.random(imgCount - 1);
        } else if(generatorTypes.noise) {
        s = p.noise(p.frameCount + (i));
        s = p.map(s, -1, 1, 0, imgCount);
        } else if(generatorTypes.waveShape) {
        s = Math.sin(p.frameCount + (i));
        s = p.map(s, -1, 1, 0, imgCount);
        }
        //     console.log(s);
        let idx = Math.round(s) % imgCount;
        repeatArr.push(idx);
      }
      console.log("Repeat is: " + repeatArr);;

      // Create row 
      for(let i = 0; i < settings.repeatCount; i++) {
        // copy repeat
        let tempArr = repeatArr;

        // Test repeatTypes and manipulate
        if(repeatTypes.reverse) {
            tempArr.reverse();
        }

        if(repeatTypes.mirror) {
          if((i % 1) === 0) {
            tempArr.reverse();
          }
        }

        if(repeatTypes.random) {
          if(Math.random() > 0.5) {
            tempArr.reverse();
          }
        }
        

        for(let j = 0; j < settings.repeatSize; j++) {
          rowArr.push(repeatArr[j]);
        }
      }

      // let miskArr;
      // for(let i = 0; i < settings.repeatCount; i++) {
      //   let tempArr = repeatArr;
        
      //     miskArr.push(tempArr);
      // }
      // rowArr.flat();
      console.log("Row is: " + rowArr + " length is: " + rowArr.length)
    
    }

    updateCounter++;
    updateBool = false;
  }

  function saveRepeat(){
    repeatBuffer = p.createGraphics(imgRes.width * settings.repeatSize, imgRes.height);
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
    repeatBuffer = p.createGraphics(imgRes.width * settings.repeatSize, imgRes.height * settings.beatCount);
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



  // p.windowResized = () => {
  //   // canvas_width = canvas_div.offsetWidth;
  //   // canvas_height = canvas_div.offsetHeight;
  //   canvas_width = p.windowWidth;
  //   canvas_height = p.windowHeight;
  //   p.resizeCanvas(canvas_width, canvas_height);
  // }


}, "app_canvas"); //div id





/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
    //// RANDOM RANDOM
    // for(let i = 0; i < 20; i++){
    //   for(let j = 0; j < 20; j++){
    //     let x = (imgRes.width * i);
    //     let y = (imgRes.height * j);
    //     let idx = Math.round(p.random(imgCount - 1)) % imgCount;

    //     p.image(imgArr[idx], x, y);
    //   }
    // }

    // // SINE DIAG
    // for(let i = 0; i < 10; i++){
    //   for(let j = 0; j < 10; j++){
    //     let x = (imgRes.width * i);
    //     let y = (imgRes.height * j);
    //     let s = math.sin(p.framecount + (i+j));
    //     s = p.map(s, -1, 1, 0, imgcount);
    //     console.log(s);
    //     let idx = math.round(s) % imgcount;

    //     p.image(imgArr[idx], x, y);
    //   }
    // }
    
    // // SINE SAMPLE
    //let sample = [];
    //for(let i = 0; i < 20; i++){
    //    // let idx = Math.round(p.random(imgCount - 1)) % imgCount;
    //  //
    //    // let s = p.noise(p.frameCount + i);
    //    let s = Math.sin(p.frameCount + (i));
    //  console.log(s);
    //    s = p.map(s, -1, 1, 0, imgCount);
    //    let idx = Math.round(s) % imgCount;
    //  sample.push(imgArr[idx]);
    //}

    //for(let i = 0; i < 20; i++){
    //  for(let j = 0; j < 20; j++){
    //    let x = (imgRes.width * i);
    //    // let x = 0;
    //    let y = (imgRes.height * j);
    //    // let s = Math.sin(p.frameCount + (i+j));
    //    // s = p.map(s, -1, 1, 0, imgCount);
    //    // console.log(s);
    //    // let idx = Math.round(s) % imgCount;

    //    p.image(sample[i % sample.length], x, y);
    //  }
    //}
