
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

  let canvasWidth = p.windowWidth;
  let canvasHeight = p.windowHeight;
  let bgColor = 231;
  let imgArr = [];

  let imgRes = {
    width: sampleImgWidth,
    height: sampleImgHeight,
  }

  let repeatArr = [];
  let rowArr = [];

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
    let gui_repeat_type = gui.addFolder("Repeat Select");
    gui_repeat_type.add(repeatTypes, 'forward').name('Forward').listen().onChange(function(){setRepeatType("forward")});
    gui_repeat_type.add(repeatTypes, 'backward').name('Backward').listen().onChange(function(){setRepeatType("backward")});
    gui_repeat_type.add(repeatTypes, 'mirror').name('Mirror').listen().onChange(function(){setRepeatType("mirror")});
    gui_repeat_type.add(repeatTypes, 'random').name('Random').listen().onChange(function(){setRepeatType("random")});
    //Add generator type
    let gui_generator_type = gui.addFolder("Generator Select");
    gui_generator_type.add(generatorTypes, 'random').name('Random').listen().onChange(function(){setGeneratorType("random")});
    gui_generator_type.add(generatorTypes, 'noise').name('Noise').listen().onChange(function(){setGeneratorType("noise")});
    gui_generator_type.add(generatorTypes, 'waveShape').name('Wave Shape').listen().onChange(function(){setGeneratorType("waveShape")});



    for(let i = 0; i < imgCount; i++){
      let count = i + 1;
      // let baseDir = "../assets/parts/"
      let baseDir = "https://veitkal.github.io/tilexp/assets/parts/"
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
    p.fill(255)
    p.background(bgColor);

    // Clear arrays


    // Draw pattern
    for(let j = 0; j < settings.beatCount; j++) {
      for(let i = 0; i < rowArr.length; i++) {
        let x = (imgRes.width * i);
        let y = (imgRes.height * j);
        // p.image(imgArr[rowArr[i]], x, y);
      }
    }

    update();

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



  // p.windowResized = () => {
  //   // canvas_width = canvas_div.offsetWidth;
  //   // canvas_height = canvas_div.offsetHeight;
  //   canvas_width = p.windowWidth;
  //   canvas_height = p.windowHeight;
  //   p.resizeCanvas(canvas_width, canvas_height);
  // }


}, "app_canvas"); //div id
