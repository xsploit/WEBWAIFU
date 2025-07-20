// setup

// Mobile device detection (needs to be at the top)
var isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Mobile-friendly voice input (removed complex hold-to-speak for better compatibility)

  //expression setup
var expressionyay = 0;
var expressionoof = 0;
var expressionlimityay = 0.5;
var expressionlimitoof = 0.5;
var expressionease = 100;
var expressionintensity = 0.75;

// TTS Audio Context Variables
var ttsAudioContext = null;
var ttsAnalyser = null;
var ttsAudioSource = null;
var ttsInputVolume = 0;
var currentTTSAudio = null;
var isTTSPlaying = false;
var isProcessingTTS = false;
var isBrowserTTSActive = false;

// Live Speech Recognition for TTS Audio Capture
var ttsRecognition = null;
var isLiveTTSRecognizing = false;
var liveSubtitleText = '';
var recognitionTimeout = null;
var ttsAudioStream = null;
var ttsMediaRecorder = null;
var ttsAudioChunks = [];

// TTS Audio Processing Function
function setupTTSAudioProcessing(audioElement) {
  if (!ttsAudioContext) {
    ttsAudioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  ttsAnalyser = ttsAudioContext.createAnalyser();
  ttsAudioSource = ttsAudioContext.createMediaElementSource(audioElement);
  
  ttsAnalyser.smoothingTimeConstant = 0.5;
  ttsAnalyser.fftSize = 1024;
  
  ttsAudioSource.connect(ttsAnalyser);
  ttsAudioSource.connect(ttsAudioContext.destination);
  
  // Process TTS audio for mouth movement
  function processTTSAudio() {
    if (isTTSPlaying) {
      var array = new Uint8Array(ttsAnalyser.frequencyBinCount);
      ttsAnalyser.getByteFrequencyData(array);
      var values = 0;
      
      var length = array.length;
      for (var i = 0; i < length; i++) {
        values += array[i];
      }
      
      ttsInputVolume = values / length;
      requestAnimationFrame(processTTSAudio);
    }
  }
  
  audioElement.onplay = function() {
    isTTSPlaying = true;
    processTTSAudio();
    updateButtonStates();
    
    // Stop listening when TTS starts playing
    if (isListening) {
      stopListening();
    }
    
    // Show speech bubble when TTS starts
    const currentText = audioElement.getAttribute('data-text') || 'AI is speaking...';
    showSpeechBubble(currentText);
    
    
    console.log('TTS audio started playing');
  };
  
  audioElement.onended = function() {
    isTTSPlaying = false;
    ttsInputVolume = 0;
    isProcessingTTS = false;
    updateButtonStates();
    
    // Stop live TTS recognition
    stopLiveTTSRecognition();
    
    // Hide speech bubble and subtitles when TTS ends
    hideSpeechBubble();
    hideSubtitles();
    
    console.log('TTS audio ended');
  };
  
  audioElement.onpause = function() {
    isTTSPlaying = false;
    ttsInputVolume = 0;
    updateButtonStates();
    console.log('TTS audio paused');
  };
}

  //interface values
if (localStorage.localvalues) {
  var initvalues = true;
  var mouththreshold = Number(localStorage.mouththreshold) ;
  var mouthboost = Number(localStorage.mouthboost) ;
  var bodythreshold = Number(localStorage.bodythreshold) ;
  var bodymotion = Number(localStorage.bodymotion) ;
  var expression = Number(localStorage.expression) ;
} else {
  var mouththreshold = 10;
  var mouthboost = 10;
  var bodythreshold = 10;
  var bodymotion = 10;
  var expression = 80;
}

// setup three-vrm

// renderer
const renderer = new THREE.WebGLRenderer({ alpha: true , antialias: true ,powerPreference: "low-power" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x00ff00); // Green screen default background
document.getElementById('canvas-container').appendChild(renderer.domElement);

// camera
const camera = new THREE.PerspectiveCamera( 30.0, window.innerWidth / window.innerHeight, 0.1, 20.0 );
camera.position.set(0.0, 1.45, 0.75);

// camera controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;
controls.target.set(0.0, 1.45, 0.0);
controls.update();

// scene
const scene = new THREE.Scene();

// light
const light = new THREE.DirectionalLight(0xffffff);
light.position.set(1.0, 1.0, 1.0).normalize();
scene.add(light);

// lookat target
const lookAtTarget = new THREE.Object3D();
camera.add(lookAtTarget);

// gltf and vrm
let currentVrm = undefined;
const loader = new THREE.GLTFLoader();

function load( url ) {

loader.crossOrigin = 'anonymous';
loader.load(

url,

( gltf ) => {

//THREE.VRMUtils.removeUnnecessaryVertices( gltf.scene ); Vroid VRM can't handle this for some reason
THREE.VRMUtils.removeUnnecessaryJoints( gltf.scene );

THREE.VRM.from( gltf ).then( ( vrm ) => {

if ( currentVrm ) {

 scene.remove( currentVrm.scene );
 currentVrm.dispose();

}

currentVrm = vrm;
scene.add( vrm.scene );

// Apply saved VRM position
applyVRMPosition();

// Apply saved arm positions  
setTimeout(() => {
  applyArmPositions();
}, 100);

vrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Hips ).rotation.y = Math.PI;
vrm.springBoneManager.reset();

  // un-T-pose

    vrm.humanoid.getBoneNode(
      THREE.VRMSchema.HumanoidBoneName.RightUpperArm
    ).rotation.z = 250;
  
            vrm.humanoid.getBoneNode(
      THREE.VRMSchema.HumanoidBoneName.RightLowerArm
    ).rotation.z = -0.2;

    vrm.humanoid.getBoneNode(
      THREE.VRMSchema.HumanoidBoneName.LeftUpperArm
    ).rotation.z = -250;
 
    vrm.humanoid.getBoneNode(
      THREE.VRMSchema.HumanoidBoneName.LeftLowerArm
    ).rotation.z = 0.2;

  // randomise init positions

    function randomsomesuch() {
      return (Math.random() - 0.5) / 10;
    }

    vrm.humanoid.getBoneNode(
      THREE.VRMSchema.HumanoidBoneName.Head
    ).rotation.x = randomsomesuch();
    vrm.humanoid.getBoneNode(
      THREE.VRMSchema.HumanoidBoneName.Head
    ).rotation.y = randomsomesuch();
    vrm.humanoid.getBoneNode(
      THREE.VRMSchema.HumanoidBoneName.Head
    ).rotation.z = randomsomesuch();

    vrm.humanoid.getBoneNode(
      THREE.VRMSchema.HumanoidBoneName.Neck
    ).rotation.x = randomsomesuch();
    vrm.humanoid.getBoneNode(
      THREE.VRMSchema.HumanoidBoneName.Neck
    ).rotation.y = randomsomesuch();
    vrm.humanoid.getBoneNode(
      THREE.VRMSchema.HumanoidBoneName.Neck
    ).rotation.z = randomsomesuch();

    vrm.humanoid.getBoneNode(
      THREE.VRMSchema.HumanoidBoneName.Spine
    ).rotation.x = randomsomesuch();
    vrm.humanoid.getBoneNode(
      THREE.VRMSchema.HumanoidBoneName.Spine
    ).rotation.y = randomsomesuch();
    vrm.humanoid.getBoneNode(
      THREE.VRMSchema.HumanoidBoneName.Spine
    ).rotation.z = randomsomesuch();

    vrm.lookAt.target = lookAtTarget;
    vrm.springBoneManager.reset();

    // Store the natural pose after ALL VRM setup is complete
    setTimeout(() => {
      if (typeof storeNaturalPose === 'function') {
        storeNaturalPose();
      }
    }, 200); // Longer delay to ensure everything is settled

    console.log(vrm);
        } );

      },

      ( progress ) => console.log( 'Loading model...', 100.0 * ( progress.loaded / progress.total ), '%' ),

      ( error ) => console.error( error )

    );

  }

// beware of CORS errors when using this locally. If you can't https, import the required libraries.
// Load saved model path from localStorage, or use default
const savedModelPath = localStorage.getItem('vrmModelPath') || '1768080537824958249.vrm';
load( savedModelPath );

// grid / axis helpers
//			const gridHelper = new THREE.GridHelper( 10, 10 );
//			scene.add( gridHelper );
//			const axesHelper = new THREE.AxesHelper( 5 );
//			scene.add( axesHelper );

// animate

const clock = new THREE.Clock();

function updateMouthMovement() {
    // Exit if there's no VRM model or if talking is disabled
    if (!currentVrm || !talktime) return;

    // Read slider values in real-time on every frame
    const mouthThresholdValue = Number(document.getElementById("mouththreshold").value);
    const mouthBoostValue = Number(document.getElementById("mouthboost").value);

    const voweldamp = 53;
    const vowelmin = 12;

    let currentVolume = ttsInputVolume; // Default to the real audio volume

    // If the free browser TTS is active, we can't measure volume.
    // Instead, we create a fake, oscillating "volume" to make the mouth move.
    if (isBrowserTTSActive) {
        const time = Date.now();
        // Generates a wave pattern that looks like talking
        currentVolume = (Math.sin(time / 100) * 0.5 + 0.5) * 60 + 20; 
    }

    // Check if TTS is playing and the audio volume is above the threshold
    if (isTTSPlaying && currentVolume > (mouthThresholdValue * 1.5)) {
        const normalizedVolume = Math.min(1, (currentVolume - vowelmin) / voweldamp) * (mouthBoostValue / 10);
        const time = Date.now() * 0.01;

        // Animate vowels for a more dynamic, natural look
        const aWeight = Math.max(0, normalizedVolume * (0.7 + Math.sin(time) * 0.3));
        const iWeight = Math.max(0, normalizedVolume * (0.3 + Math.cos(time * 1.3) * 0.2));
        const uWeight = Math.max(0, normalizedVolume * (0.2 + Math.sin(time * 0.8) * 0.15));
        const eWeight = Math.max(0, normalizedVolume * (0.25 + Math.cos(time * 1.7) * 0.15));
        const oWeight = Math.max(0, normalizedVolume * (0.2 + Math.sin(time * 1.1) * 0.1));

        currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.A, aWeight);
        currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.I, iWeight);
        currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.U, uWeight);
        currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.E, eWeight);
        currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.O, oWeight);
    } else {
        // Smoothly close the mouth when not talking
        const blendShapeProxy = currentVrm.blendShapeProxy;
        blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.A, blendShapeProxy.getValue(THREE.VRMSchema.BlendShapePresetName.A) * 0.7);
        blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.I, blendShapeProxy.getValue(THREE.VRMSchema.BlendShapePresetName.I) * 0.7);
        blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.U, blendShapeProxy.getValue(THREE.VRMSchema.BlendShapePresetName.U) * 0.7);
        blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.E, blendShapeProxy.getValue(THREE.VRMSchema.BlendShapePresetName.E) * 0.7);
        blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.O, blendShapeProxy.getValue(THREE.VRMSchema.BlendShapePresetName.O) * 0.7);
    }
}

function animate() {
requestAnimationFrame(animate);

const deltaTime = clock.getDelta();

if (currentVrm) {
  // Enhanced spring bone physics
  if (currentVrm.springBoneManager && currentVrm.springBoneManager.springs) {
    // Add subtle environmental force for more natural movement
    const environmentalForce = new THREE.Vector3(
      Math.sin(Date.now() * 0.001) * 0.02,
      Math.cos(Date.now() * 0.0015) * 0.01,
      Math.sin(Date.now() * 0.0008) * 0.015
    );
    
    // Apply slight gravity effect to spring bones (with safety check)
    try {
      currentVrm.springBoneManager.springs.forEach(spring => {
        if (spring && spring.bone && spring.bone.position) {
          spring.bone.position.add(environmentalForce.clone().multiplyScalar(deltaTime));
        }
      });
    } catch (error) {
      console.warn('Spring bone enhancement error:', error);
    }
  }
  
  // Update eye tracking
  updateEyeTracking();
  
  // ✅ ADD THIS LINE to run the mouth animation on every frame
  updateMouthMovement();

  // update vrm
  currentVrm.update(deltaTime);
}

renderer.render(scene, camera);
}

animate();

// Microphone and audio variables
let selectedMicrophoneId = null;
let gainNode = null;
let audioContext = null;
let analyser = null;
let microphone = null;
let javascriptNode = null;
let average = 0;

// Speech recognition variables (global scope)
let holdToSpeakActive = false;
let holdToSpeakTimeout = null;

// Ollama model loading optimization variables
let isLoadingOllamaModels = false;
let ollamaModelsLoadTimeout = null;
let lastOllamaUrl = '';

// mic listener - get a value
function initializeMicrophone() {
  const audioConstraints = { audio: true };
  
  // Use selected microphone if available
  if (selectedMicrophoneId) {
    audioConstraints.audio = { deviceId: { exact: selectedMicrophoneId } };
  }
  
  navigator.mediaDevices
  .getUserMedia(audioConstraints)
.then(
  function (stream) {
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();
    microphone = audioContext.createMediaStreamSource(stream);
    javascriptNode = audioContext.createScriptProcessor(256, 1, 1);

    analyser.smoothingTimeConstant = 0.5;
    analyser.fftSize = 1024;

    microphone.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);

    javascriptNode.onaudioprocess = function () {
      var array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      var values = 0;

      var length = array.length;
      for (var i = 0; i < length; i++) {
        values += array[i];
      }

      // audio in expressed as one number
      var average = values / length;
      var inputvolume = average;
      
      // audio in spectrum expressed as array
      // console.log(array.toString());
      // useful for mouth shape variance
      
      // move the interface slider
              document.getElementById("inputlevel").value = inputvolume;



// mic based / endless animations (do stuff)

      if (currentVrm != undefined){ //best to be sure




// Enhanced body movement with smoother audio mapping

      // Improved damping and spring calculations 
      var damping = 750/(bodymotion/10);
      var springback = 1.002; // Slightly increased for more natural decay
      var smoothness = 0.15; // Smoothing factor for audio input
      
      // Use TTS audio for body movement if playing, otherwise use mic
      var bodyAudioSource = isTTSPlaying ? ttsInputVolume : average;
      var bodyThresholdValue = isTTSPlaying ? (bodythreshold * 0.8) : (1 * bodythreshold);
      
      // Smooth the audio input for more natural movement
      if (!window.smoothedAudio) window.smoothedAudio = 0;
      window.smoothedAudio = window.smoothedAudio * (1 - smoothness) + bodyAudioSource * smoothness;
      
      // Calculate movement intensity based on smoothed audio
      var movementIntensity = Math.max(0, (window.smoothedAudio - bodyThresholdValue) / (bodyThresholdValue * 2));
      movementIntensity = Math.min(1, movementIntensity); // Clamp to 0-1
      
      if (window.smoothedAudio > bodyThresholdValue) {
        // Enhanced head movement with intensity-based scaling
        var headMovement = movementIntensity * 0.8; // Scale head movement by intensity
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Head
        ).rotation.x += (Math.random() - 0.5) * headMovement / damping;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Head
        ).rotation.x /= springback;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Head
        ).rotation.y += (Math.random() - 0.5) * headMovement / damping;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Head
        ).rotation.y /= springback;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Head
        ).rotation.z += (Math.random() - 0.5) * headMovement / damping;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Head
        ).rotation.z /= springback;

        // Enhanced neck movement with reduced intensity
        var neckMovement = movementIntensity * 0.5; // Less neck movement than head
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Neck
        ).rotation.x += (Math.random() - 0.5) * neckMovement / damping;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Neck
        ).rotation.x /= springback;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Neck
        ).rotation.y += (Math.random() - 0.5) * neckMovement / damping;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Neck
        ).rotation.y /= springback;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Neck
        ).rotation.z += (Math.random() - 0.5) * neckMovement / damping;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Neck
        ).rotation.z /= springback;

        // Enhanced chest movement with subtle breathing-like motion
        var chestMovement = movementIntensity * 0.3; // Subtle chest movement
        var breathingEffect = Math.sin(Date.now() * 0.002) * 0.1 * movementIntensity; // Subtle breathing
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.UpperChest
        ).rotation.x += ((Math.random() - 0.5) * chestMovement + breathingEffect) / damping;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.UpperChest
        ).rotation.x /= springback;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.UpperChest
        ).rotation.y += (Math.random() - 0.5) * chestMovement / damping;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.UpperChest
        ).rotation.y /= springback;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.UpperChest
        ).rotation.z += (Math.random() - 0.5) * chestMovement / damping;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.UpperChest
        ).rotation.z /= springback;

        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.RightShoulder
        ).rotation.x += (Math.random() - 0.5) / damping;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.RightShoulder
        ).rotation.x /= springback;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.RightShoulder
        ).rotation.y += (Math.random() - 0.5) / damping;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.RightShoulder
        ).rotation.y /= springback;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.RightShoulder
        ).rotation.z += (Math.random() - 0.5) / damping;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.RightShoulder
        ).rotation.z /= springback;

        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.LeftShoulder
        ).rotation.x += (Math.random() - 0.5) / damping;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.LeftShoulder
        ).rotation.x /= springback;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.LeftShoulder
        ).rotation.y += (Math.random() - 0.5) / damping;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.LeftShoulder
        ).rotation.y /= springback;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.LeftShoulder
        ).rotation.z += (Math.random() - 0.5) / damping;
        currentVrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.LeftShoulder
        ).rotation.z /= springback;

      }

// yay/oof expression drift
expressionyay += (Math.random() - 0.5) / expressionease;
if(expressionyay > expressionlimityay){expressionyay=expressionlimityay};
if(expressionyay < 0){expressionyay=0};
currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.Fun, expressionyay);
expressionoof += (Math.random() - 0.5) / expressionease;
if(expressionoof > expressionlimitoof){expressionoof=expressionlimitoof};
if(expressionoof < 0){expressionoof=0};
currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.Angry, expressionoof);
    
    }





      //look at camera (now handled by updateEyeTracking in main loop)
      // lookAtTarget.position.x = camera.position.x;
      // lookAtTarget.position.y = ((camera.position.y-camera.position.y-camera.position.y)/2)+0.5;

    }; // end fn stream
  },
  function (err) {
    console.log("The following error occured: " + err.name);
  }
);
}

// Initialize microphone on page load
initializeMicrophone();


// blink

function blink() {
  if (!currentVrm) return; // Safety check
  
  var blinktimeout = Math.floor(Math.random() * 150) + 100; // Faster, more natural blink
  
  // Start blink - close eyes
  currentVrm.blendShapeProxy.setValue(
    THREE.VRMSchema.BlendShapePresetName.BlinkL,
    1
  );
  currentVrm.blendShapeProxy.setValue(
    THREE.VRMSchema.BlendShapePresetName.BlinkR,
    1
  );
  
  // End blink - open eyes
  setTimeout(() => {
    if (currentVrm) {
      currentVrm.blendShapeProxy.setValue(
        THREE.VRMSchema.BlendShapePresetName.BlinkL,
        0
      );
      currentVrm.blendShapeProxy.setValue(
        THREE.VRMSchema.BlendShapePresetName.BlinkR,
        0
      );
    }
  }, blinktimeout);
}



// loop blink timing
(function loop() {
var rand = Math.round(Math.random() * 10000) + 1000;
setTimeout(function () {
  if (currentVrm) {
    blink();
  }
  loop();
}, rand);
})();

// Camera eye tracking - eyes follow the camera position (simple method)
function updateEyeTracking() {
  if (!currentVrm || !currentVrm.lookAt) return;
  
  // Simple camera following - like the original
  lookAtTarget.position.x = camera.position.x;
  lookAtTarget.position.y = ((camera.position.y-camera.position.y-camera.position.y)/2)+0.5;
}

// Eye tracking will be added to the existing animate function

// drag and drop + file handler
window.addEventListener( 'dragover', function( event ) {
event.preventDefault();
} );

window.addEventListener( 'drop', function( event ) {
event.preventDefault();

// read given file then convert it to blob url
const files = event.dataTransfer.files;
if ( !files ) { return; }
const file = files[0];
if ( !file ) { return; }
const blob = new Blob( [ file ], { type: "application/octet-stream" } );
const url = URL.createObjectURL( blob );
 load( url );
} );


// handle window resizes


window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}
// interface handling

var talktime = true;

function interface() {

  if (initvalues == true){
  if (localStorage.localvalues) {
    initvalues = false;
    document.getElementById("mouththreshold").value = mouththreshold;
    document.getElementById("mouthboost").value = mouthboost;
    document.getElementById("bodythreshold").value = bodythreshold;
    document.getElementById("bodymotion").value = bodymotion;
    document.getElementById("expression").value = expression;
  }}

    mouththreshold = document.getElementById("mouththreshold").value;
    mouthboost = document.getElementById("mouthboost").value;
    bodythreshold = document.getElementById("bodythreshold").value;
    bodymotion = document.getElementById("bodymotion").value;

    expression = document.getElementById("expression").value;
    expressionlimityay = (expression);
    expressionlimitoof = (100 - expression); 
    expressionlimityay = expressionlimityay/100;
    expressionlimitoof = expressionlimitoof/100;
    expressionlimityay = expressionlimityay*expressionintensity;
    expressionlimitoof = expressionlimitoof*expressionintensity;    

    console.log("Expression " + expressionyay + " yay / " + expressionoof + " oof");
    console.log("Expression mix " + expressionlimityay + " yay / " + expressionlimitoof + " oof");

    // store it too
    localStorage.localvalues = 1;
    localStorage.mouththreshold = mouththreshold;
    localStorage.mouthboost = mouthboost;
    localStorage.bodythreshold = bodythreshold;
    localStorage.bodymotion = bodymotion;
    localStorage.expression = expression;

}

// click to dismiss non-vrm divs
  function hideinterface() {

  var a = document.getElementById("backplate");
  var b = document.getElementById("interface");
  var x = document.getElementById("infobar");
  var y = document.getElementById("credits");
  a.style.display = "none";
  b.style.display = "none";
  x.style.display = "none";
  y.style.display = "none";

  }

// click to dismiss non-interface divs
function hideinfo() {

  var a = document.getElementById("backplate");
  var x = document.getElementById("infobar");
  var y = document.getElementById("credits");
  a.style.display = "none";
  x.style.display = "none";
  y.style.display = "none";

  }

// load file from user picker
  function dofile(){
  var file = document.querySelector('input[type=file]').files[0];
  if ( !file ) { return; }
  const blob = new Blob( [ file ], { type: "application/octet-stream" } );
  const url = URL.createObjectURL( blob );
  
  // Save model path to localStorage
  localStorage.setItem('vrmModelPath', url);
  
  load( url );
  }

// TTS Speech Recognition Setup
function setupTTSSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    console.warn('Speech Recognition not supported for TTS subtitles');
    return;
  }
  
  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    ttsRecognition = new SpeechRecognition();
    
    ttsRecognition.continuous = true;
    ttsRecognition.interimResults = true;
    ttsRecognition.lang = 'en-US';
    
    ttsRecognition.onstart = () => {
      isLiveTTSRecognizing = true;
      console.log('TTS Speech Recognition started');
    };
    
    ttsRecognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      const displayText = finalTranscript || interimTranscript;
      if (displayText.trim()) {
        updateLiveSubtitle(displayText);
      }
    };
    
    ttsRecognition.onerror = (event) => {
      console.log('TTS Speech Recognition error:', event.error);
      if (event.error !== 'no-speech' && event.error !== 'audio-capture') {
        stopTTSSpeechRecognition();
      }
    };
    
    ttsRecognition.onend = () => {
      isLiveTTSRecognizing = false;
      console.log('TTS Speech Recognition ended');
      
      // Restart if TTS is still playing and subtitles enabled
      if (isTTSPlaying && document.getElementById('showSubtitles').checked) {
        setTimeout(startTTSSpeechRecognition, 100);
      }
    };
    
    console.log('TTS Speech Recognition setup complete');
  } catch (error) {
    console.error('Error setting up TTS Speech Recognition:', error);
  }
}

function startTTSSpeechRecognition() {
  if (!ttsRecognition) {
    setupTTSSpeechRecognition();
  }
  
  if (ttsRecognition && !isLiveTTSRecognizing) {
    try {
      ttsRecognition.start();
      console.log('Started TTS Speech Recognition');
    } catch (error) {
      console.error('Error starting TTS Speech Recognition:', error);
    }
  }
}

function stopTTSSpeechRecognition() {
  if (ttsRecognition && isLiveTTSRecognizing) {
    try {
      ttsRecognition.stop();
      console.log('Stopped TTS Speech Recognition');
    } catch (error) {
      console.error('Error stopping TTS Speech Recognition:', error);
    }
  }
}

// Live TTS Speech Recognition Functions
function startLiveTTSRecognition() {
  // Only start if subtitles are enabled
  if (!document.getElementById('showSubtitles').checked) {
    console.log('Subtitles disabled - not starting TTS speech recognition');
    return;
  }
  
  // Start Web Speech Recognition to listen to TTS audio
  startTTSSpeechRecognition();
}

function stopLiveTTSRecognition() {
  stopTTSSpeechRecognition();
  
  if (recognitionTimeout) {
    clearTimeout(recognitionTimeout);
    recognitionTimeout = null;
  }
  
  isLiveTTSRecognizing = false;
  liveSubtitleText = '';
}

function updateLiveSubtitle(text) {
  const subtitleContainer = document.getElementById('subtitleContainer');
  const subtitleText = document.getElementById('subtitleText');
  const subtitleProgress = document.getElementById('subtitleProgress');
  
  if (!subtitleContainer || !subtitleText || !subtitleProgress) {
    return;
  }
  
  // Check if subtitles are enabled
  if (!document.getElementById('showSubtitles').checked) {
    // Hide subtitles if they're disabled
    subtitleContainer.classList.remove('show');
    subtitleProgress.classList.remove('animate');
    return;
  }
  
  // Set the live recognition text
  subtitleText.textContent = text;
  
  // Show subtitle container and start progress animation
  if (!subtitleContainer.classList.contains('show')) {
    subtitleContainer.classList.add('show');
    subtitleProgress.style.transitionDuration = '10000ms';
    subtitleProgress.classList.add('animate');
  }
}

// Background functions
function loadBackground() {
  const fileInput = document.getElementById('backgroundFile');
  const file = fileInput.files[0];
  
  if (!file) return;
  
  // Check if file is video
  const isVideo = file.type.startsWith('video/');
  
  // Check file size (warn if over 50MB)
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > 50) {
    updateStatus('⚠️', `Large file (${fileSizeMB.toFixed(1)}MB) - may impact performance`);
  }
  
  if (isVideo) {
    // For videos, use object URL for better performance
    const videoUrl = URL.createObjectURL(file);
    setBackground(videoUrl, true, file);
    
    // Store minimal info (videos aren't persisted across sessions due to size)
    const backgroundData = {
      isVideo: true,
      type: file.type,
      size: file.size,
      name: file.name,
      temporary: true
    };
    
    try {
      localStorage.setItem('backgroundMedia', JSON.stringify(backgroundData));
    } catch (error) {
      console.warn('Could not save video info to localStorage:', error);
    }
    
    updateStatus('🎬', `Video background loaded (${fileSizeMB.toFixed(1)}MB)`);
  } else {
    // For images, try localStorage first, fallback to object URL for large images
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const imageUrl = e.target.result;
      
      // Try to save to localStorage
      const backgroundData = {
        url: imageUrl,
        isVideo: false,
        type: file.type,
        size: file.size
      };
      
      try {
        localStorage.setItem('backgroundMedia', JSON.stringify(backgroundData));
        setBackground(imageUrl, false);
        updateStatus('🖼️', `Image background saved (${fileSizeMB.toFixed(1)}MB)`);
      } catch (error) {
        // If localStorage fails, use object URL (won't persist)
        console.warn('Image too large for localStorage, using temporary URL:', error);
        const tempUrl = URL.createObjectURL(file);
        setBackground(tempUrl, false, file);
        
        const tempData = {
          isVideo: false,
          type: file.type,
          size: file.size,
          name: file.name,
          temporary: true
        };
        localStorage.setItem('backgroundMedia', JSON.stringify(tempData));
        updateStatus('⚠️', `Large image loaded temporarily (${fileSizeMB.toFixed(1)}MB)`);
      }
    };
    
    reader.readAsDataURL(file);
  }
}

// Curve effect function
function applyCurveEffect(mesh) {
  // Early exit if no curve effects are requested - this is the common case
  if (backgroundConfig.curveX === 0 && backgroundConfig.curveY === 0) {
    return;
  }
  
  if (!mesh || !mesh.geometry) {
    console.warn('applyCurveEffect: Invalid mesh or geometry - cannot apply curve effects');
    return;
  }
  
  const geometry = mesh.geometry;
  
  // Check if geometry has position attribute
  if (!geometry.attributes || !geometry.attributes.position) {
    console.warn('applyCurveEffect: This background type does not support curve effects (missing position attribute)');
    return;
  }
  
  const position = geometry.attributes.position;
  
  // Ensure position array exists
  if (!position.array) {
    console.warn('applyCurveEffect: Position attribute missing array');
    return;
  }
  
  // Reset geometry to original flat state
  if (!geometry.userData.originalPositions) {
    geometry.userData.originalPositions = position.array.slice();
  }
  
  // Restore original positions
  for (let i = 0; i < position.array.length; i++) {
    position.array[i] = geometry.userData.originalPositions[i];
  }
  
  // Only apply curves if there are curve values
  if ((backgroundConfig.curveX > 0 || backgroundConfig.curveY > 0) && position.count > 0) {
    const curveMultiplier = backgroundConfig.curveDirection === 'inward' ? -1 : 1;
    
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      let z = position.getZ(i);
      
      // Apply horizontal curve (based on X position)
      if (backgroundConfig.curveX > 0) {
        const normalizedX = x / 10; // Normalize to -1 to 1
        z += curveMultiplier * backgroundConfig.curveX * Math.pow(normalizedX, 2);
      }
      
      // Apply vertical curve (based on Y position)
      if (backgroundConfig.curveY > 0) {
        const normalizedY = y / 10; // Normalize to -1 to 1
        z += curveMultiplier * backgroundConfig.curveY * Math.pow(normalizedY, 2);
      }
      
      position.setZ(i, z);
    }
    
    position.needsUpdate = true;
    
    // Only compute normals if geometry supports it
    if (geometry.computeVertexNormals) {
      geometry.computeVertexNormals();
    }
  }
}

// Enhanced background function supporting videos and images
function setBackground(mediaUrl, isVideo = false, fileObject = null) {
  // Remove existing background if any
  const existingBg = scene.getObjectByName('customBackground');
  if (existingBg) {
    scene.remove(existingBg);
    
    // Cleanup video and object URLs
    if (existingBg.userData.videoElement) {
      existingBg.userData.videoElement.pause();
      existingBg.userData.videoElement.src = '';
    }
    if (existingBg.userData.objectUrl) {
      URL.revokeObjectURL(existingBg.userData.objectUrl);
    }
  }
  
  if (isVideo) {
    // Create video element
    const video = document.createElement('video');
    video.src = mediaUrl;
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    
    video.addEventListener('loadeddata', () => {
      // Create video texture
      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.format = THREE.RGBFormat;
      
      createBackgroundMesh(videoTexture, video, mediaUrl);
      console.log('Video background loaded:', mediaUrl);
    });
    
    video.addEventListener('error', (e) => {
      console.error('Video loading error:', e);
      console.error('Error details:', e.target.error);
      updateStatus('❌', `Video loading failed: ${e.target.error?.message || 'Unknown error'}`);
      
      // Try to reload the video once if it's a network error
      if (e.target.error?.code === e.target.error?.MEDIA_ERR_NETWORK) {
        console.log('Network error detected, attempting to reload video...');
        setTimeout(() => {
          video.load();
        }, 1000);
      }
    });
    
    video.addEventListener('stalled', () => {
      console.warn('Video stalled - network issues or invalid source');
    });
    
    video.addEventListener('abort', () => {
      console.warn('Video loading aborted');
    });
    
    video.addEventListener('canplay', () => {
      console.log('Video can start playing');
      video.play().catch(err => console.error('Video play failed:', err));
    });
    
    video.load();
  } else {
    // Create texture from image
    const loader = new THREE.TextureLoader();
    loader.load(
      mediaUrl, 
      function(texture) {
        createBackgroundMesh(texture, null, mediaUrl);
        console.log('Image background loaded:', mediaUrl);
      },
      undefined,
      function(error) {
        console.error('Image loading error:', error);
        updateStatus('❌', 'Image loading failed');
      }
    );
  }
}

function createBackgroundMesh(texture, videoElement = null, objectUrl = null) {
  try {
    // Create background geometry with more subdivisions for better curves
    const geometry = new THREE.PlaneGeometry(20, 20, 32, 32);
    const material = new THREE.MeshBasicMaterial({ 
      map: texture, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: backgroundConfig.opacity
    });
    
    // Create and add new background
    const backgroundMesh = new THREE.Mesh(geometry, material);
    backgroundMesh.name = 'customBackground';
    backgroundMesh.position.set(backgroundConfig.posX, backgroundConfig.posY, backgroundConfig.posZ);
    backgroundMesh.scale.set(backgroundConfig.scale, backgroundConfig.scale, backgroundConfig.scale);
    backgroundMesh.rotation.z = (backgroundConfig.rotation * Math.PI) / 180;
    
    // Store references for cleanup
    if (videoElement) {
      backgroundMesh.userData.videoElement = videoElement;
    }
    if (objectUrl) {
      backgroundMesh.userData.objectUrl = objectUrl;
    }
    
    // Add to scene first
    scene.add(backgroundMesh);
    
    // Apply curve effect after a small delay to ensure geometry is ready
    setTimeout(() => {
      applyCurveEffect(backgroundMesh);
    }, 100);
    
  } catch (error) {
    console.error('Error creating background mesh:', error);
    updateStatus('❌', 'Error creating background');
  }
}

function updateBackground() {
  // Update background config from UI
  backgroundConfig.scale = parseFloat(document.getElementById('bgScale').value);
  backgroundConfig.posX = parseFloat(document.getElementById('bgPosX').value);
  backgroundConfig.posY = parseFloat(document.getElementById('bgPosY').value);
  backgroundConfig.posZ = parseFloat(document.getElementById('bgPosZ').value);
  backgroundConfig.rotation = parseFloat(document.getElementById('bgRotation').value);
  backgroundConfig.opacity = parseFloat(document.getElementById('bgOpacity').value);
  backgroundConfig.curveX = parseFloat(document.getElementById('bgCurveX')?.value || 0);
  backgroundConfig.curveY = parseFloat(document.getElementById('bgCurveY')?.value || 0);
  backgroundConfig.curveDirection = document.getElementById('bgCurveDirection')?.value || 'inward';
  
  // Update range value displays
  document.getElementById('bgScaleValue').textContent = backgroundConfig.scale.toFixed(1);
  document.getElementById('bgPosXValue').textContent = backgroundConfig.posX.toFixed(1);
  document.getElementById('bgPosYValue').textContent = backgroundConfig.posY.toFixed(2);
  document.getElementById('bgPosZValue').textContent = backgroundConfig.posZ.toFixed(1);
  document.getElementById('bgRotationValue').textContent = backgroundConfig.rotation + '°';
  document.getElementById('bgOpacityValue').textContent = Math.round(backgroundConfig.opacity * 100) + '%';
  
  // Update curve value displays
  if (document.getElementById('bgCurveXValue')) {
    document.getElementById('bgCurveXValue').textContent = backgroundConfig.curveX.toFixed(1);
  }
  if (document.getElementById('bgCurveYValue')) {
    document.getElementById('bgCurveYValue').textContent = backgroundConfig.curveY.toFixed(1);
  }
  
  // Update existing background if it exists
  const existingBg = scene.getObjectByName('customBackground');
  if (existingBg) {
    existingBg.position.set(backgroundConfig.posX, backgroundConfig.posY, backgroundConfig.posZ);
    existingBg.scale.set(backgroundConfig.scale, backgroundConfig.scale, backgroundConfig.scale);
    existingBg.rotation.z = (backgroundConfig.rotation * Math.PI) / 180;
    existingBg.material.opacity = backgroundConfig.opacity;
    
    // Apply curve effect to geometry
    applyCurveEffect(existingBg);
  }
  
  // Save background config
  saveUISettings();
}

function removeBackground() {
  const existingBg = scene.getObjectByName('customBackground');
  if (existingBg) {
    // Cleanup video if it exists
    if (existingBg.userData.videoElement) {
      existingBg.userData.videoElement.pause();
      existingBg.userData.videoElement.src = '';
    }
    
    scene.remove(existingBg);
    
    // Remove both old and new storage formats
    localStorage.removeItem('backgroundImage');
    localStorage.removeItem('backgroundMedia');
    
    updateStatus('🗑️', 'Background removed');
  }
}

function resetBackgroundSettings() {
  // Reset to default values
  backgroundConfig.scale = 1.2;
  backgroundConfig.posX = 0;
  backgroundConfig.posY = 0.8;
  backgroundConfig.posZ = -4;
  backgroundConfig.rotation = 0;
  backgroundConfig.opacity = 0.85;
  backgroundConfig.curveX = 0.5;
  backgroundConfig.curveY = 0.3;
  backgroundConfig.curveDirection = 'inward';
  
  // Update UI elements
  if (document.getElementById('bgScale')) document.getElementById('bgScale').value = backgroundConfig.scale;
  if (document.getElementById('bgPosX')) document.getElementById('bgPosX').value = backgroundConfig.posX;
  if (document.getElementById('bgPosY')) document.getElementById('bgPosY').value = backgroundConfig.posY;
  if (document.getElementById('bgPosZ')) document.getElementById('bgPosZ').value = backgroundConfig.posZ;
  if (document.getElementById('bgRotation')) document.getElementById('bgRotation').value = backgroundConfig.rotation;
  if (document.getElementById('bgOpacity')) document.getElementById('bgOpacity').value = backgroundConfig.opacity;
  if (document.getElementById('bgCurveX')) document.getElementById('bgCurveX').value = backgroundConfig.curveX;
  if (document.getElementById('bgCurveY')) document.getElementById('bgCurveY').value = backgroundConfig.curveY;
  if (document.getElementById('bgCurveDirection')) document.getElementById('bgCurveDirection').value = backgroundConfig.curveDirection;
  
  // Update the background display
  updateBackground();
  
  updateStatus('🔄', 'Background settings reset to defaults');
}

// Load saved background on startup
function loadSavedBackground() {
  // Try new format first
  const savedBackgroundMedia = localStorage.getItem('backgroundMedia');
  if (savedBackgroundMedia) {
    try {
      const backgroundData = JSON.parse(savedBackgroundMedia);
      
      // Check if it's a temporary file (won't persist across sessions)
      if (backgroundData.temporary) {
        const fileSizeMB = backgroundData.size ? (backgroundData.size / (1024 * 1024)).toFixed(1) : 'Unknown';
        const mediaType = backgroundData.isVideo ? 'video' : 'image';
        updateStatus('⚠️', `Previous ${mediaType} was too large to save (${fileSizeMB}MB). Please reload it.`);
        
        // Clear the temporary entry
        localStorage.removeItem('backgroundMedia');
        return;
      }
      
      // Only load if it has a valid URL
      if (backgroundData.url) {
        setBackground(backgroundData.url, backgroundData.isVideo);
        return;
      }
    } catch (error) {
      console.error('Error parsing background media data:', error);
      localStorage.removeItem('backgroundMedia'); // Clear corrupted data
    }
  }
  
  // Fallback to old format
  const savedBackground = localStorage.getItem('backgroundImage');
  if (savedBackground) {
    setBackground(savedBackground, false);
  }
}

// VRM Position Control Functions
function updateVRMPosition() {
  // Update VRM config from UI
  vrmConfig.posX = parseFloat(document.getElementById('vrmPosX')?.value || 0);
  vrmConfig.posY = parseFloat(document.getElementById('vrmPosY')?.value || 0);
  vrmConfig.posZ = parseFloat(document.getElementById('vrmPosZ')?.value || 0);
  vrmConfig.scale = parseFloat(document.getElementById('vrmScale')?.value || 1);
  vrmConfig.rotY = parseFloat(document.getElementById('vrmRotY')?.value || 0);
  
  // Update range value displays
  if (document.getElementById('vrmPosXValue')) {
    document.getElementById('vrmPosXValue').textContent = vrmConfig.posX.toFixed(1);
  }
  if (document.getElementById('vrmPosYValue')) {
    document.getElementById('vrmPosYValue').textContent = vrmConfig.posY.toFixed(1);
  }
  if (document.getElementById('vrmPosZValue')) {
    document.getElementById('vrmPosZValue').textContent = vrmConfig.posZ.toFixed(1);
  }
  if (document.getElementById('vrmScaleValue')) {
    document.getElementById('vrmScaleValue').textContent = vrmConfig.scale.toFixed(1);
  }
  if (document.getElementById('vrmRotYValue')) {
    document.getElementById('vrmRotYValue').textContent = vrmConfig.rotY + '°';
  }
  
  // Apply position to current VRM if it exists
  applyVRMPosition();
  
  // Save VRM config
  saveVRMConfig();
}

function applyVRMPosition() {
  if (currentVrm && currentVrm.scene) {
    // Apply position
    currentVrm.scene.position.set(vrmConfig.posX, vrmConfig.posY, vrmConfig.posZ);
    
    // Apply scale
    currentVrm.scene.scale.set(vrmConfig.scale, vrmConfig.scale, vrmConfig.scale);
    
    // Apply Y rotation (convert degrees to radians)
    currentVrm.scene.rotation.y = (vrmConfig.rotY * Math.PI) / 180;
    
    console.log('VRM position updated:', vrmConfig);
  }
}

function resetVRMPosition() {
  // Reset config to defaults
  vrmConfig.posX = 0;
  vrmConfig.posY = 0;
  vrmConfig.posZ = 0;
  vrmConfig.scale = 1.0;
  vrmConfig.rotY = 0;
  
  // Update UI elements
  if (document.getElementById('vrmPosX')) document.getElementById('vrmPosX').value = 0;
  if (document.getElementById('vrmPosY')) document.getElementById('vrmPosY').value = 0;
  if (document.getElementById('vrmPosZ')) document.getElementById('vrmPosZ').value = 0;
  if (document.getElementById('vrmScale')) document.getElementById('vrmScale').value = 1;
  if (document.getElementById('vrmRotY')) document.getElementById('vrmRotY').value = 0;
  
  // Update displays and apply
  updateVRMPosition();
  
  updateStatus('🎯', 'VRM position reset to center');
}

function saveVRMConfig() {
  try {
    localStorage.setItem('vu-vrm-position', JSON.stringify(vrmConfig));
  } catch (error) {
    console.warn('Could not save VRM position config:', error);
  }
}

function loadVRMConfig() {
  try {
    const saved = localStorage.getItem('vu-vrm-position');
    if (saved) {
      const savedConfig = JSON.parse(saved);
      Object.assign(vrmConfig, savedConfig);
      
      // Update UI elements
      if (document.getElementById('vrmPosX')) document.getElementById('vrmPosX').value = vrmConfig.posX;
      if (document.getElementById('vrmPosY')) document.getElementById('vrmPosY').value = vrmConfig.posY;
      if (document.getElementById('vrmPosZ')) document.getElementById('vrmPosZ').value = vrmConfig.posZ;
      if (document.getElementById('vrmScale')) document.getElementById('vrmScale').value = vrmConfig.scale;
      if (document.getElementById('vrmRotY')) document.getElementById('vrmRotY').value = vrmConfig.rotY;
      
      // Update displays
      updateVRMPosition();
      
      console.log('VRM position config loaded:', vrmConfig);
    }
  } catch (error) {
    console.warn('Could not load VRM position config:', error);
  }
}

// Simple Arm Control System
function updateArmPositions() {
  // Update arm config from UI
  armConfig.leftArmZ = parseFloat(document.getElementById('leftArmZ')?.value || 0);
  armConfig.rightArmZ = parseFloat(document.getElementById('rightArmZ')?.value || 0);
  armConfig.leftArmX = parseFloat(document.getElementById('leftArmX')?.value || 0);
  armConfig.rightArmX = parseFloat(document.getElementById('rightArmX')?.value || 0);
  armConfig.leftElbow = parseFloat(document.getElementById('leftElbow')?.value || 0.2);
  armConfig.rightElbow = parseFloat(document.getElementById('rightElbow')?.value || 0.2);
  
  // Update displays
  if (document.getElementById('leftArmZValue')) {
    document.getElementById('leftArmZValue').textContent = armConfig.leftArmZ.toFixed(1);
  }
  if (document.getElementById('rightArmZValue')) {
    document.getElementById('rightArmZValue').textContent = armConfig.rightArmZ.toFixed(1);
  }
  if (document.getElementById('leftArmXValue')) {
    document.getElementById('leftArmXValue').textContent = armConfig.leftArmX.toFixed(1);
  }
  if (document.getElementById('rightArmXValue')) {
    document.getElementById('rightArmXValue').textContent = armConfig.rightArmX.toFixed(1);
  }
  if (document.getElementById('leftElbowValue')) {
    document.getElementById('leftElbowValue').textContent = armConfig.leftElbow.toFixed(1);
  }
  if (document.getElementById('rightElbowValue')) {
    document.getElementById('rightElbowValue').textContent = armConfig.rightElbow.toFixed(1);
  }
  
  // Apply to VRM
  applyArmPositions();
  
  // Save settings
  saveArmConfig();
}

function applyArmPositions() {
  if (!currentVrm || !currentVrm.humanoid) return;
  
  try {
    // Get arm bones
    const leftUpperArm = currentVrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftUpperArm);
    const rightUpperArm = currentVrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightUpperArm);
    const leftLowerArm = currentVrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftLowerArm);
    const rightLowerArm = currentVrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightLowerArm);
    
    // Apply arm positions
    if (leftUpperArm) {
      leftUpperArm.rotation.z = -armConfig.leftArmZ; // Inverted for symmetrical behavior
      leftUpperArm.rotation.x = -armConfig.leftArmX; // Inverted for symmetrical behavior
    }
    if (rightUpperArm) {
      rightUpperArm.rotation.z = armConfig.rightArmZ;
      rightUpperArm.rotation.x = armConfig.rightArmX;
    }
    
    // Apply elbow bends
    if (leftLowerArm) {
      leftLowerArm.rotation.z = -armConfig.leftElbow; // Inverted for symmetrical behavior
    }
    if (rightLowerArm) {
      rightLowerArm.rotation.z = armConfig.rightElbow;
    }
    
  } catch (error) {
    console.warn('Error applying arm positions:', error);
  }
}

function resetArmPositions() {
  // Reset to default values
  armConfig.leftArmZ = 0;
  armConfig.rightArmZ = 0;
  armConfig.leftArmX = 0;
  armConfig.rightArmX = 0;
  armConfig.leftElbow = 0.2;
  armConfig.rightElbow = 0.2;
  
  // Update UI
  if (document.getElementById('leftArmZ')) document.getElementById('leftArmZ').value = 0;
  if (document.getElementById('rightArmZ')) document.getElementById('rightArmZ').value = 0;
  if (document.getElementById('leftArmX')) document.getElementById('leftArmX').value = 0;
  if (document.getElementById('rightArmX')) document.getElementById('rightArmX').value = 0;
  if (document.getElementById('leftElbow')) document.getElementById('leftElbow').value = 0.2;
  if (document.getElementById('rightElbow')) document.getElementById('rightElbow').value = 0.2;
  
  // Apply and save
  updateArmPositions();
  
  updateStatus('💪', 'Arm positions reset');
}

function saveArmConfig() {
  try {
    localStorage.setItem('vu-vrm-arms', JSON.stringify(armConfig));
  } catch (error) {
    console.warn('Could not save arm config:', error);
  }
}

function loadArmConfig() {
  try {
    const saved = localStorage.getItem('vu-vrm-arms');
    if (saved) {
      const savedConfig = JSON.parse(saved);
      Object.assign(armConfig, savedConfig);
      
      // Update UI
      if (document.getElementById('leftArmZ')) document.getElementById('leftArmZ').value = armConfig.leftArmZ;
      if (document.getElementById('rightArmZ')) document.getElementById('rightArmZ').value = armConfig.rightArmZ;
      if (document.getElementById('leftArmX')) document.getElementById('leftArmX').value = armConfig.leftArmX;
      if (document.getElementById('rightArmX')) document.getElementById('rightArmX').value = armConfig.rightArmX;
      if (document.getElementById('leftElbow')) document.getElementById('leftElbow').value = armConfig.leftElbow;
      if (document.getElementById('rightElbow')) document.getElementById('rightElbow').value = armConfig.rightElbow;
      
      // Apply and update displays
      updateArmPositions();
      
      console.log('Arm config loaded:', armConfig);
    }
  } catch (error) {
    console.warn('Could not load arm config:', error);
  }
}

// Cleanup - removed complex animation system, now using simple arm sliders
// end

// wait to trigger interface and load init values

setTimeout(() => {  interface(); }, 500);

// Microphone enumeration and selection
async function enumerateMicrophones() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(device => device.kind === 'audioinput');
    
    const micSelect = document.getElementById('microphoneSelect');
    micSelect.innerHTML = '<option value="">Select microphone...</option>';
    
    audioInputs.forEach(device => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.textContent = device.label || `Microphone ${device.deviceId.substring(0, 8)}`;
      micSelect.appendChild(option);
    });
    
    // Load saved microphone from localStorage
    const savedMicId = localStorage.getItem('selectedMicrophone');
    if (savedMicId) {
      micSelect.value = savedMicId;
      selectedMicrophoneId = savedMicId;
    }
  } catch (error) {
    console.error('Error enumerating microphones:', error);
  }
}

function changeMicrophone() {
  const micSelect = document.getElementById('microphoneSelect');
  selectedMicrophoneId = micSelect.value;
  
  // Save to localStorage
  if (selectedMicrophoneId) {
    localStorage.setItem('selectedMicrophone', selectedMicrophoneId);
  } else {
    localStorage.removeItem('selectedMicrophone');
  }
  
  console.log('Microphone changed to:', selectedMicrophoneId);
  
  // Reinitialize microphone with new selection
  if (audioContext) {
    audioContext.close();
  }
  initializeMicrophone();
}

function updateMicGain() {
  const gainSlider = document.getElementById('micGain');
  const gainValue = document.getElementById('micGainValue');
  const gain = parseFloat(gainSlider.value);
  
  if (gainNode) {
    gainNode.gain.value = gain;
  }
  
  gainValue.textContent = `${gain.toFixed(1)}x`;
  saveUISettings();
}

// Initialize microphone list on page load
document.addEventListener('DOMContentLoaded', () => {
  enumerateMicrophones();
});

// TTS and AI Integration Functions

// Default Azure TTS and Ollama settings
var azureConfig = {
  key: '',
  region: 'eastus',
  voice: 'en-US-JennyNeural',
  style: 'cheerful',
  pitch: 1.3,
  volume: 0.9,
  rate: 1.0
};

var browserTTSConfig = {
  selectedVoice: '' // Empty means auto-select
};

var ollamaConfig = {
  url: 'http://localhost:11434',
  model: '',
  temperature: 0.7,
  top_p: 0.9,
  top_k: 40,
  repeat_penalty: 1.1,
  context_length: 2048,
  max_tokens: 512,
  seed: 0,
  system_message: '',
  mirostat: 0,
  mirostat_tau: 5.0,
  mirostat_eta: 0.1,
  penalty_alpha: 0,
  presence_penalty: 0,
  frequency_penalty: 0,
  gpu_layers: 0,
  threads: 4,
  batch_size: 512
};

var backgroundConfig = {
  scale: 1.2,
  posX: 0,
  posY: 0.8,
  posZ: -4,
  rotation: 0,
  opacity: 0.85,
  curveX: 0.5,
  curveY: 0.3,
  curveDirection: 'inward'
};

var vrmConfig = {
  posX: 0,
  posY: 0,
  posZ: 0,
  scale: 1.0,
  rotY: 0
};

var armConfig = {
  leftArmZ: 0,    // Up/Down
  rightArmZ: 0,   // Up/Down  
  leftArmX: 0,    // Forward/Back
  rightArmX: 0,   // Forward/Back
  leftElbow: 0.2, // Elbow bend
  rightElbow: 0.2 // Elbow bend
};

var openaiConfig = {
  key: '',
  model: 'gpt-4.1',
  temperature: 0.7,
  max_tokens: 512,
  top_p: 1.0,
  frequency_penalty: 0,
  presence_penalty: 0,
  system_message: ''
};

var geminiConfig = {
  key: '',
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  max_output_tokens: 1024,
  top_p: 0.95,
  top_k: 40,
  system_instruction: ''
};

var currentProvider = 'gemini'; // 'ollama', 'openai', or 'gemini' - default to Gemini

var userName = localStorage.getItem('userName') || 'Local User'; // Default user name

function updateUserName() {
  const userNameInput = document.getElementById('userName');
  if (userNameInput) {
    userName = userNameInput.value || 'User';
    localStorage.setItem('userName', userName);
    console.log('User name updated to:', userName);
    // Optionally, update any displayed user names immediately
    updateChatDisplayUserName();
  }
}

function updateChatDisplayUserName() {
    // This function is called when the user name is updated.
    // It should find all existing messages from the "Local User" and update the name.
    // Since the DOM structure for local chat messages isn't clear from the provided files,
    // this function will remain a placeholder to prevent errors.
    // New messages will correctly use the new user name.
    console.log("User name updated. New messages will use the name: " + userName);
}

// Chat toggle functions
function toggleChatVisibility() {
  const floatingChat = document.getElementById('floatingChat');
  const toggleBtn = document.querySelector('.header-right .chat-toggle-btn');
  
  if (floatingChat) {
    // Check if chat is currently hidden (either by style.display or stream-mode-hidden class)
    const isHiddenByDisplay = floatingChat.style.display === 'none';
    const isHiddenByStreamMode = floatingChat.classList.contains('stream-mode-hidden');
    const isCurrentlyHidden = isHiddenByDisplay || isHiddenByStreamMode;
    
    if (isCurrentlyHidden) {
      // Show the chat - remove both hiding mechanisms
      floatingChat.style.display = 'block';
      floatingChat.classList.remove('stream-mode-hidden');
      if (toggleBtn) {
        toggleBtn.textContent = '🔇';
        toggleBtn.title = 'Hide chat input';
      }
    } else {
      // Hide the chat using display style
      floatingChat.style.display = 'none';
      if (toggleBtn) {
        toggleBtn.textContent = '💬';
        toggleBtn.title = 'Show chat input';
      }
    }
  }
}

function updateChatToggleButtonState() {
  const floatingChat = document.getElementById('floatingChat');
  const toggleBtn = document.querySelector('.header-right .chat-toggle-btn');
  
  if (floatingChat && toggleBtn) {
    const isHiddenByDisplay = floatingChat.style.display === 'none';
    const isHiddenByStreamMode = floatingChat.classList.contains('stream-mode-hidden');
    const isCurrentlyHidden = isHiddenByDisplay || isHiddenByStreamMode;
    
    if (isCurrentlyHidden) {
      toggleBtn.textContent = '💬';
      toggleBtn.title = 'Show chat input';
    } else {
      toggleBtn.textContent = '🔇';
      toggleBtn.title = 'Hide chat input';
    }
  }
}

function toggleDock() {
  const chatOverlay = document.getElementById('twitchChatOverlay');
  if (chatOverlay) {
    chatOverlay.classList.toggle('docked');
  }
}

// Speech Bubble functions
function toggleSpeechBubbleDock() {
  const speechOverlay = document.getElementById('speechBubbleOverlay');
  if (speechOverlay) {
    speechOverlay.classList.toggle('docked');
  }
}

function showSpeechBubble(aiResponse) {
  // Check if chat bubble is enabled in display options
  if (!document.getElementById('showChatBubble').checked) {
    return;
  }
  
  const speechOverlay = document.getElementById('speechBubbleOverlay');
  const aiResponseText = document.getElementById('aiResponseText');
  
  if (speechOverlay && aiResponseText) {
    aiResponseText.textContent = aiResponse;
    speechOverlay.style.display = 'block';
  }
}

function hideSpeechBubble() {
  const speechOverlay = document.getElementById('speechBubbleOverlay');
  if (speechOverlay) {
    speechOverlay.style.display = 'none';
  }
}

// AI personality is now defined in the global system prompt textbox
// Removed hardcoded aiPersonality object - users can customize via UI

// Removed aiPersonality object - personality is now fully customizable via the global system prompt


var conversationHistory = [];

// Speech Recognition - Clean Working Implementation
let mediaRecorder;
let audioChunks = [];
let transcriber = null;
let isListening = false;
let isInitializingTranscriber = false;
const MODEL_NAME = 'Xenova/whisper-tiny.en';

// Check Whisper model status
function getWhisperStatus() {
  if (isInitializingTranscriber) {
    return { loaded: false, status: 'Initializing...', model: MODEL_NAME };
  } else if (transcriber === null) {
    return { loaded: false, status: 'Not initialized' };
  } else if (transcriber) {
    return { loaded: true, status: 'Ready', model: MODEL_NAME };
  } else {
    return { loaded: false, status: 'Loading failed' };
  }
}

// Global functions to check Whisper status (call from console)
window.checkWhisperStatus = function() {
  const status = getWhisperStatus();
  console.log('🔍 Whisper Model Status Check:');
  console.log('📊 Loaded:', status.loaded);
  console.log('📊 Status:', status.status);
  if (status.model) console.log('📊 Model:', status.model);
  console.log('📊 Transcriber object:', transcriber);
  console.log('📊 Is Initializing:', isInitializingTranscriber);
  return status;
};

// Alternative ways to check status
window.whisperStatus = function() { return window.checkWhisperStatus(); };
window.transcriber = null; // Will be updated when model loads

// Make status check available immediately
console.log('🔧 Debug functions available: checkWhisperStatus() or whisperStatus()');

// Initialize the transcriber using the working implementation
async function initializeTranscriber() {
    try {
        // Use the pipeline function for an easy interface
        transcriber = await window.transformersPipeline('automatic-speech-recognition', MODEL_NAME, {
            // Caching the model is important for performance
            cache: 'force-cache' 
        });
        updateStatus('✅', 'Model loaded. Ready to record.');
        console.log('Model loaded successfully');
    } catch (error) {
        updateStatus('❌', `Error loading model: ${error.message}`);
        console.error('Model loading error:', error);
    }
}

// Start Recording
async function startListening() {
  if (isTTSPlaying) {
    updateStatus('🔊', 'Please wait for AI to finish speaking');
    return;
  }
  if (isProcessingTTS) {
    updateStatus('🤖', 'AI is processing your request');
    return;
  }
  if (isListening) {
    return;
  }
  
  if (!transcriber) {
    console.log('❌ Cannot start listening - Whisper not loaded');
    console.log('📊 Current Whisper Status:', getWhisperStatus());
    updateStatus('❌', 'Whisper not loaded yet');
    return;
  }

  console.log('🎤 Starting speech recognition with Whisper');
  console.log('📊 Using Whisper model:', MODEL_NAME);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = event => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = processAudio;

    mediaRecorder.start();
    isListening = true;
    console.log('✅ Recording started - using Whisper for transcription');
    updateStatus('🎤', 'Listening...');
    updateButtonStates();
  } catch (error) {
    updateStatus('❌', `Error accessing microphone: ${error.message}`);
    console.error('Microphone access error:', error);
  }
}

// Stop Recording and Process Audio
function stopListening() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    updateStatus('⏳', 'Processing audio... Please wait.');
  }
}

// Process and Transcribe Audio
async function processAudio() {
  if (audioChunks.length === 0) {
    updateStatus('❌', 'No audio recorded.');
    isListening = false;
    updateButtonStates();
    return;
  }

  try {
    console.log('🔄 Processing audio with Whisper...');
    
    // Combine audio chunks into a single Blob
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const audioBuffer = await audioBlob.arrayBuffer();
    console.log(`📊 Audio data size: ${audioBuffer.byteLength} bytes`);

    // The model expects a Float32Array at 16,000 Hz
    // We need to decode and resample the audio
    console.log('🔄 Decoding and resampling audio to 16kHz...');
    const audioData = await decodeAndResample(audioBuffer);
    console.log(`📊 Resampled audio length: ${audioData.length} samples`);
    
    // Transcribe using Whisper
    console.log('🤖 Transcribing with Whisper model...');
    const output = await transcriber(audioData, {
      chunk_length_s: 30, // Process in 30-second chunks
      stride_length_s: 5  // Overlap chunks by 5 seconds
    });

    const transcript = output.text ? output.text.trim() : '';
    console.log('📝 Whisper transcription result:', transcript || 'No text detected');
    
    if (transcript) {
      console.log('✅ Whisper successfully transcribed speech:', transcript);
      updateStatus('✅', 'Speech recognized');
      
      // Add to chat and send to AI
      addMessage(transcript, 'user', userName);
      await sendMessageToAI(transcript);
    } else {
      console.log('❌ Whisper returned empty transcription');
      updateStatus('❌', 'Could not transcribe audio.');
    }
  } catch (error) {
    updateStatus('❌', `Transcription failed: ${error.message}`);
    console.error('Transcription error:', error);
  } finally {
    // Reset for next recording
    audioChunks = [];
    isListening = false;
    updateButtonStates();
  }
}

// Helper function to decode and resample audio
async function decodeAndResample(arrayBuffer) {
  const targetSampleRate = 16000;
  const audioContext = new AudioContext({ sampleRate: targetSampleRate });
  const decodedAudioData = await audioContext.decodeAudioData(arrayBuffer);
  return decodedAudioData.getChannelData(0);
}

function addMessage(message, role, username) {
  const chatContent = document.getElementById('twitchChatContent');
  const chatOverlay = document.getElementById('twitchChatOverlay');
  
  // Don't add messages if chat doesn't exist or is hidden
  if (!chatContent || !chatOverlay || chatOverlay.style.display === 'none') {
    return;
  }

  const placeholder = chatContent.querySelector('.chat-placeholder');
  if (placeholder) {
    placeholder.remove();
  }

  const messageEl = document.createElement('div');
  messageEl.className = 'twitch-message local-user-message'; 

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const displayName = username || 'You';

  messageEl.innerHTML = `
    <div class="message-timestamp">${timestamp}</div>
    <div class="twitch-username" style="color: #82eefd;">${displayName}</div>
    <div class="twitch-message-text">${message}</div>
  `;

  chatContent.appendChild(messageEl);
  chatContent.scrollTop = chatContent.scrollHeight;

  while (chatContent.children.length > 50) {
    chatContent.removeChild(chatContent.firstChild);
  }
}

// AI Chat Functions
async function sendMessageToAI(message) {
  // Block ALL requests until completely finished (AI response + TTS)
  if (isProcessingTTS) {
    console.log('AI is busy - blocking request to prevent spam');
    updateStatus('🚫', 'AI is busy, please wait...');
    return;
  }
  
  try {
    isProcessingTTS = true;
    updateButtonStates(); // Disable all inputs immediately
    console.log('Sending message to AI:', message);
    
    let response;
    switch(currentProvider) {
      case 'ollama':
        response = await getOllamaResponse(message);
        break;
      case 'openai':
        response = await getOpenAIResponse(message);
        break;
      case 'gemini':
        response = await getGeminiResponse(message);
        break;
      default:
        throw new Error('Unknown AI provider');
    }
    
    console.log('AI response:', response);
    await enhancedSpeakAIResponse(response);
  } catch (error) {
    console.error('Error communicating with AI:', error);
    updateStatus('❌', error.message || 'AI request failed');
    isProcessingTTS = false;
    updateButtonStates();
  }
}

async function getOllamaResponse(message) {
  if (!ollamaConfig.model) {
    throw new Error('No Ollama model selected. Please select one in Settings > AI Configuration.');
  }

  const systemMessage = ollamaConfig.system_message || document.getElementById('globalSystemMessage').value || 'You are a helpful AI assistant.';
  
  const messages = [
    { role: 'system', content: systemMessage },
    ...conversationHistory,
    { role: 'user', content: message }
  ];

  // Build options object with all parameters
  const options = {
    temperature: ollamaConfig.temperature,
    top_p: ollamaConfig.top_p,
    top_k: ollamaConfig.top_k,
    repeat_penalty: ollamaConfig.repeat_penalty,
    num_ctx: ollamaConfig.context_length,
    num_predict: ollamaConfig.max_tokens,
    num_gpu: ollamaConfig.gpu_layers,
    num_thread: ollamaConfig.threads,
    num_batch: ollamaConfig.batch_size
  };

  // Add seed if not random
  if (ollamaConfig.seed !== 0) {
    options.seed = ollamaConfig.seed;
  }

  // Add mirostat settings
  if (ollamaConfig.mirostat > 0) {
    options.mirostat = ollamaConfig.mirostat;
    options.mirostat_tau = ollamaConfig.mirostat_tau;
    options.mirostat_eta = ollamaConfig.mirostat_eta;
  }

  // Add penalty settings if not zero
  if (ollamaConfig.penalty_alpha > 0) {
    options.penalty_alpha = ollamaConfig.penalty_alpha;
  }
  if (ollamaConfig.presence_penalty > 0) {
    options.presence_penalty = ollamaConfig.presence_penalty;
  }
  if (ollamaConfig.frequency_penalty > 0) {
    options.frequency_penalty = ollamaConfig.frequency_penalty;
  }

  const response = await fetch(`${ollamaConfig.url}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: ollamaConfig.model,
      messages: messages,
      options: options,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`);
  }

  const data = await response.json();
  const aiResponse = data.message.content;

  // Add to conversation history
  conversationHistory.push({ role: 'user', content: message });
  conversationHistory.push({ role: 'assistant', content: aiResponse });

  // Keep conversation history manageable
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }
  
  // Save conversation history
  saveUISettings();

  return aiResponse;
}

async function getOpenAIResponse(message) {
  if (!openaiConfig.key) {
    throw new Error('No OpenAI API key provided');
  }

  const systemMessage = openaiConfig.system_message || document.getElementById('globalSystemMessage').value || 'You are a helpful AI assistant.';
  
  const messages = [
    { role: 'developer', content: systemMessage },
    ...conversationHistory,
    { role: 'user', content: message }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiConfig.key}`
    },
    body: JSON.stringify({
      model: openaiConfig.model,
      messages: messages,
      temperature: openaiConfig.temperature,
      max_tokens: openaiConfig.max_tokens,
      top_p: openaiConfig.top_p,
      frequency_penalty: openaiConfig.frequency_penalty,
      presence_penalty: openaiConfig.presence_penalty
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;

  // Add to conversation history
  conversationHistory.push({ role: 'user', content: message });
  conversationHistory.push({ role: 'assistant', content: aiResponse });

  // Keep conversation history manageable
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }
  
  // Save conversation history
  saveUISettings();

  return aiResponse;
}

async function getGeminiResponse(message) {
  if (!geminiConfig.key) {
    throw new Error('No Gemini API key provided');
  }

  const systemInstruction = geminiConfig.system_instruction || document.getElementById('globalSystemMessage').value || 'You are a helpful AI assistant.';
  
  // Build conversation history for Gemini format
  const contents = [];
  
  // Add system instruction as first user message if we have no history
  if (conversationHistory.length === 0) {
    contents.push({
      role: 'user',
      parts: [{ text: systemInstruction }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: 'I understand. I will follow those instructions in our conversation.' }]
    });
  }
  
  // Add conversation history - properly convert roles for Gemini
  conversationHistory.forEach(msg => {
    const role = msg.role === 'assistant' ? 'model' : 'user';
    contents.push({
      role: role,
      parts: [{ text: msg.content }]
    });
  });
  
  // Add current message
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const requestBody = {
    contents: contents,
    generationConfig: {
      temperature: geminiConfig.temperature,
      topK: geminiConfig.top_k,
      topP: geminiConfig.top_p,
      maxOutputTokens: geminiConfig.max_output_tokens
    }
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiConfig.model}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': geminiConfig.key
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Full Gemini API response:', JSON.stringify(data, null, 2));
  
  // Check if response has expected structure
  if (!data.candidates) {
    console.error('No candidates in Gemini API response:', data);
    throw new Error(`Gemini API returned no candidates. Response: ${JSON.stringify(data)}`);
  }
  
  if (!Array.isArray(data.candidates) || data.candidates.length === 0) {
    console.error('Candidates is not an array or is empty:', data.candidates);
    throw new Error('Gemini API returned invalid or empty candidates array');
  }
  
  if (!data.candidates[0]) {
    console.error('No first candidate in Gemini API response:', data);
    throw new Error('Gemini API returned empty candidates array');
  }
  
  const candidate = data.candidates[0];
  if (!candidate.content) {
    console.error('Candidate missing content:', candidate);
    throw new Error('Gemini API candidate missing content');
  }
  
  console.log('Candidate content structure:', JSON.stringify(candidate.content, null, 2));
  
  // Handle different possible content structures
  let aiResponse = '';
  
  if (candidate.content.parts && Array.isArray(candidate.content.parts) && candidate.content.parts.length > 0) {
    // Standard structure: content.parts[0].text
    const part = candidate.content.parts[0];
    if (part.text || part.text === '') {
      aiResponse = part.text;
    } else {
      console.error('Part missing text property:', part);
      throw new Error('Gemini API response part missing text');
    }
  } else if (candidate.content.text) {
    // Alternative structure: content.text
    aiResponse = candidate.content.text;
  } else if (typeof candidate.content === 'string') {
    // Direct string content
    aiResponse = candidate.content;
  } else if (candidate.content.role === 'model') {
    // Empty model response - Gemini sometimes returns this when blocked or filtered
    console.warn('Gemini returned empty model response - content may have been filtered');
    aiResponse = "I apologize, but I couldn't generate a response. Please try rephrasing your message.";
  } else {
    console.error('Candidate content missing parts and text:', candidate.content);
    throw new Error('Gemini API candidate content has unknown structure');
  }

  // Add to conversation history
  conversationHistory.push({ role: 'user', content: message });
  conversationHistory.push({ role: 'assistant', content: aiResponse });

  // Keep conversation history manageable
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }
  
  // Save conversation history
  saveUISettings();

  return aiResponse;
}

// TTS Functions
async function speakAIResponse(text) {
  // Check if TTS is enabled
  if (!document.getElementById('enableTTS').checked) {
    console.log('TTS disabled, skipping speech');
    // Still need to reset processing flag
    isProcessingTTS = false;
    updateButtonStates();
    return;
  }

  // Try Azure TTS first, then fallback to browser TTS
  if (azureConfig.key && azureConfig.region) {
    try {
      await speakWithAzure(text);
      return;
    } catch (error) {
      console.warn('Azure TTS failed, falling back to browser TTS:', error);
    }
  }
  
  // Fallback to browser's built-in TTS
  await speakWithBrowserTTS(text);
}

async function speakWithAzure(text) {
  const ssml = createSSML(
    text,
    azureConfig.voice,
    'default',
    azureConfig.pitch,
    azureConfig.rate,
    azureConfig.volume
  );
  const audioBlob = await synthesizeWithAzure(ssml);
  
  // Stop any currently playing TTS
  if (currentTTSAudio) {
    currentTTSAudio.pause();
    currentTTSAudio.currentTime = 0;
    isTTSPlaying = false;
    ttsInputVolume = 0;
  }
  
  // Create audio element and play
  const audioUrl = URL.createObjectURL(audioBlob);
  currentTTSAudio = new Audio(audioUrl);
  
  // Store the text for speech bubble display
  currentTTSAudio.setAttribute('data-text', text);
  
  // Setup audio processing for VRM mouth movement
  setupTTSAudioProcessing(currentTTSAudio);
  
  await currentTTSAudio.play();
  
  currentTTSAudio.onended = () => {
    URL.revokeObjectURL(audioUrl);
    isTTSPlaying = false;
    ttsInputVolume = 0;
    isProcessingTTS = false;
    updateButtonStates();
  };
}

async function speakWithBrowserTTS(text) {
  // Stop any currently playing TTS
  if (currentTTSAudio) {
    currentTTSAudio.pause();
    currentTTSAudio.currentTime = 0;
  }
  
  // Stop any ongoing speech synthesis
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = azureConfig.rate || 1.0;
    utterance.pitch = Math.max(0, Math.min(2, (azureConfig.pitch + 12) / 24)); // Convert Azure pitch to browser pitch
    utterance.volume = azureConfig.volume || 0.9;
    
    // Use selected browser voice or auto-select
    const selectedVoice = getSelectedBrowserVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Selected voice:', selectedVoice.name);
    }
    
    // Set up event handlers
    utterance.onstart = () => {
      isTTSPlaying = true;
      isBrowserTTSActive = true; // Set flag for browser TTS
      updateButtonStates();
      
      // Show speech bubble when browser TTS starts
      showSpeechBubble(text);
      
      
      console.log('Browser TTS started');
    };
    
    utterance.onend = () => {
      isTTSPlaying = false;
      isBrowserTTSActive = false; // Clear flag for browser TTS
      ttsInputVolume = 0;
      isProcessingTTS = false;
      updateButtonStates();
      
      // Stop live TTS recognition
      stopLiveTTSRecognition();
      
      // Hide speech bubble and subtitles when browser TTS ends
      hideSpeechBubble();
      hideSubtitles();
      
      console.log('Browser TTS ended');
      resolve();
    };
    
    utterance.onerror = (error) => {
      console.error('Browser TTS error:', error);
      isTTSPlaying = false;
      ttsInputVolume = 0;
      isProcessingTTS = false;
      updateButtonStates();
      resolve();
    };
    
    // Start speaking
    speechSynthesis.speak(utterance);
  });
}

function createSSML(text, voice, style, pitch, rate, volume) {
  const styleTag = style !== 'default' ? ` mstts:express-as style='${style}'` : '';
  const escapedText = text.replace(/[<>&'"]/g, (char) => {
    const entities = { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' };
    return entities[char];
  });
  
  // Convert volume from decimal (0.9) to percentage (90%)
  const volumePercent = Math.round(volume * 100) + '%';
  
  return `
    <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='en-US'>
      <voice name='${voice}'${styleTag}>
        <prosody pitch='${pitch >= 0 ? '+' : ''}${pitch.toFixed(1)}st' rate='${rate.toFixed(1)}' volume='${volumePercent}'>
          ${escapedText}
        </prosody>
      </voice>
    </speak>
  `;
}

async function synthesizeWithAzure(ssml) {
  const response = await fetch(`https://${azureConfig.region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': azureConfig.key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3'
    },
    body: ssml
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
  }

  return await response.blob();
}

// Browser voice selection functions
function getSelectedBrowserVoice() {
  const browserVoiceSelect = document.getElementById('browserVoice');
  const selectedVoiceName = browserVoiceSelect?.value;
  
  if (!selectedVoiceName) {
    // Auto-select female voice as fallback
    return getAutoSelectedFemaleVoice();
  }
  
  const voices = speechSynthesis.getVoices();
  return voices.find(voice => voice.name === selectedVoiceName) || getAutoSelectedFemaleVoice();
}

function getAutoSelectedFemaleVoice() {
  const voices = speechSynthesis.getVoices();
  
  // Look for female voices with various criteria
  const femaleVoice = voices.find(voice => 
    voice.lang.startsWith('en') && (
      voice.name.toLowerCase().includes('female') ||
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('girl') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('victoria') ||
      voice.name.toLowerCase().includes('karen') ||
      voice.name.toLowerCase().includes('moira') ||
      voice.name.toLowerCase().includes('tessa') ||
      voice.name.toLowerCase().includes('veena') ||
      voice.name.toLowerCase().includes('fiona') ||
      voice.name.toLowerCase().includes('kate') ||
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('hazel')
    )
  ) || voices.find(voice => 
    voice.lang.startsWith('en') && voice.name.toLowerCase().includes('us') && !voice.name.toLowerCase().includes('male')
  ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
  
  return femaleVoice;
}

function populateBrowserVoices() {
  const browserVoiceSelect = document.getElementById('browserVoice');
  if (!browserVoiceSelect) return;
  
  const voices = speechSynthesis.getVoices();
  
  // Clear existing options except the first one
  browserVoiceSelect.innerHTML = '<option value="">Auto-select female voice</option>';
  
  // Filter for English voices and sort them
  const englishVoices = voices
    .filter(voice => voice.lang.startsWith('en'))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  englishVoices.forEach(voice => {
    const option = document.createElement('option');
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    
    // Mark likely female voices with a symbol
    if (voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('victoria') ||
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('moira') ||
        voice.name.toLowerCase().includes('tessa') ||
        voice.name.toLowerCase().includes('kate') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('hazel')) {
      option.textContent = `♀️ ${option.textContent}`;
    }
    
    browserVoiceSelect.appendChild(option);
  });
  
  console.log(`Populated ${englishVoices.length} browser voices`);
}

function updateBrowserVoice() {
  const browserVoiceSelect = document.getElementById('browserVoice');
  const selectedVoiceName = browserVoiceSelect?.value || '';
  
  // Save to localStorage
  if (typeof(Storage) !== "undefined") {
    localStorage.setItem('vu-vrm-browser-voice', selectedVoiceName);
  }
  
  console.log('Browser voice updated:', selectedVoiceName || 'Auto-select');
}

function loadBrowserVoiceSettings() {
  const browserVoiceSelect = document.getElementById('browserVoice');
  if (!browserVoiceSelect) return;
  
  // Load saved voice selection
  if (typeof(Storage) !== "undefined") {
    const savedVoice = localStorage.getItem('vu-vrm-browser-voice');
    if (savedVoice) {
      browserVoiceSelect.value = savedVoice;
    }
  }
}

// Load Ollama models
async function loadOllamaModels() {
  try {
    const url = `${ollamaConfig.url}/api/tags`;
    console.log('Fetching Ollama models from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Ollama API response:', data);
    
    if (data.models && Array.isArray(data.models)) {
      console.log('Available Ollama models:', data.models);
      return data.models;
    } else {
      console.warn('No models array in response:', data);
      return [];
    }
  } catch (error) {
    console.error('Error loading Ollama models:', error);
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network error - Make sure Ollama is running at:', ollamaConfig.url);
    }
    
    return [];
  }
}

// Optimized initialization - only load Ollama models if needed
function initializeOllamaModels() {
  // Only load if Ollama is the current provider and models aren't already loaded
  if (currentProvider === 'ollama') {
    const modelSelect = document.getElementById('ollamaModel');
    const hasModels = modelSelect && modelSelect.children.length > 1;
    
    if (!hasModels) {
      console.log('Initial Ollama models load - provider is Ollama');
      // Delay initial load to avoid conflicts with other initialization
      setTimeout(() => {
        refreshOllamaModels(false);
      }, 1500);
    } else {
      console.log('Ollama models already present, skipping initial load');
    }
  } else {
    console.log('Skipping Ollama model load - current provider is:', currentProvider);
  }
}

// Initialize UI settings only (Ollama loads in DOMContentLoaded)
setTimeout(() => {
  loadUISettings();
}, 1000);

// For manual refresh button - force refresh
function forceRefreshOllamaModels() {
  console.log('Manual Ollama model refresh requested');
  refreshOllamaModels(true); // Force refresh
}

function loadUISettings() {
  const saved = localStorage.getItem('neurolink-vrm-settings');
  if (saved) {
    const settings = JSON.parse(saved);
    
    // Update configs
    if (settings.azureConfig) Object.assign(azureConfig, settings.azureConfig);
    if (settings.ollamaConfig) Object.assign(ollamaConfig, settings.ollamaConfig);
    if (settings.openaiConfig) Object.assign(openaiConfig, settings.openaiConfig);
    if (settings.geminiConfig) Object.assign(geminiConfig, settings.geminiConfig);
    if (settings.currentProvider) currentProvider = settings.currentProvider;
    // aiPersonality removed - using global system prompt instead
    
    // Update display options
    if (settings.displayOptions) {
      if (document.getElementById('showSubtitles')) document.getElementById('showSubtitles').checked = settings.displayOptions.showSubtitles !== false;
      if (document.getElementById('showChatBubble')) {
        document.getElementById('showChatBubble').checked = settings.displayOptions.showChatBubble !== false;
        // Apply speech bubble visibility based on setting
        const speechBubbleOverlay = document.getElementById('speechBubbleOverlay');
        if (speechBubbleOverlay) {
          speechBubbleOverlay.style.display = settings.displayOptions.showChatBubble !== false ? 'block' : 'none';
        }
      }
      if (document.getElementById('subtitleDuration')) document.getElementById('subtitleDuration').value = settings.displayOptions.subtitleDuration || 5;
      if (document.getElementById('enableTTS')) document.getElementById('enableTTS').checked = settings.displayOptions.enableTTS !== false;
    }

    if (settings.micGain) {
      if (document.getElementById('micGain')) document.getElementById('micGain').value = settings.micGain;
      updateMicGain();
    }
    
    // Restore conversation history
    if (settings.conversationHistory && Array.isArray(settings.conversationHistory)) {
      conversationHistory = settings.conversationHistory;
    }
    
    // Restore background config
    if (settings.backgroundConfig) {
      Object.assign(backgroundConfig, settings.backgroundConfig);
    }
    
    // Update UI elements
    if (document.getElementById('azureKey')) document.getElementById('azureKey').value = azureConfig.key || '';
    if (document.getElementById('azureRegion')) document.getElementById('azureRegion').value = azureConfig.region || 'eastus';
    if (document.getElementById('voiceSelect')) document.getElementById('voiceSelect').value = azureConfig.voice || 'en-US-JennyNeural';
    if (document.getElementById('ttsVolume')) document.getElementById('ttsVolume').value = azureConfig.volume || 0.9;
    if (document.getElementById('ttsPitch')) document.getElementById('ttsPitch').value = azureConfig.pitch || 1.3;
    if (document.getElementById('ttsRate')) document.getElementById('ttsRate').value = azureConfig.rate || 1.0;
    
    // Update AI provider selection - default to Gemini instead of Ollama
    if (document.getElementById('aiProvider')) document.getElementById('aiProvider').value = currentProvider || 'gemini';
    
    // Update OpenAI UI elements
    if (document.getElementById('openaiKey')) document.getElementById('openaiKey').value = openaiConfig.key || '';
    if (document.getElementById('openaiModel')) document.getElementById('openaiModel').value = openaiConfig.model || 'gpt-4.1';
    if (document.getElementById('openaiTemperature')) document.getElementById('openaiTemperature').value = openaiConfig.temperature || 0.7;
    if (document.getElementById('openaiMaxTokens')) document.getElementById('openaiMaxTokens').value = openaiConfig.max_tokens || 512;
    if (document.getElementById('openaiTopP')) document.getElementById('openaiTopP').value = openaiConfig.top_p || 1.0;
    if (document.getElementById('openaiFreqPenalty')) document.getElementById('openaiFreqPenalty').value = openaiConfig.frequency_penalty || 0;
    if (document.getElementById('openaiPresencePenalty')) document.getElementById('openaiPresencePenalty').value = openaiConfig.presence_penalty || 0;
    
    // Update Gemini UI elements
    if (document.getElementById('geminiKey')) document.getElementById('geminiKey').value = geminiConfig.key || '';
    if (document.getElementById('geminiModel')) document.getElementById('geminiModel').value = geminiConfig.model || 'gemini-2.5-flash';
    if (document.getElementById('geminiTemperature')) document.getElementById('geminiTemperature').value = geminiConfig.temperature || 0.7;
    if (document.getElementById('geminiMaxTokens')) document.getElementById('geminiMaxTokens').value = geminiConfig.max_output_tokens || 1024;
    if (document.getElementById('geminiTopP')) document.getElementById('geminiTopP').value = geminiConfig.top_p || 0.95;
    if (document.getElementById('geminiTopK')) document.getElementById('geminiTopK').value = geminiConfig.top_k || 40;
    
    // Update shared system prompt
    if (document.getElementById('globalSystemMessage')) {
        if (currentProvider === 'ollama') {
            document.getElementById('globalSystemMessage').value = ollamaConfig.system_message || '';
        } else if (currentProvider === 'openai') {
            document.getElementById('globalSystemMessage').value = openaiConfig.system_message || '';
        } else if (currentProvider === 'gemini') {
            document.getElementById('globalSystemMessage').value = geminiConfig.system_instruction || '';
        }
    }

    // Update Ollama UI elements
    if (document.getElementById('ollamaUrl')) document.getElementById('ollamaUrl').value = ollamaConfig.url || 'http://localhost:11434';
    if (document.getElementById('ollamaModel')) document.getElementById('ollamaModel').value = ollamaConfig.model || '';
    if (document.getElementById('ollamaTemperature')) document.getElementById('ollamaTemperature').value = ollamaConfig.temperature || 0.7;
    if (document.getElementById('ollamaTopP')) document.getElementById('ollamaTopP').value = ollamaConfig.top_p || 0.9;
    if (document.getElementById('ollamaTopK')) document.getElementById('ollamaTopK').value = ollamaConfig.top_k || 40;
    if (document.getElementById('ollamaRepeatPenalty')) document.getElementById('ollamaRepeatPenalty').value = ollamaConfig.repeat_penalty || 1.1;
    if (document.getElementById('ollamaContextLength')) document.getElementById('ollamaContextLength').value = ollamaConfig.context_length || 2048;
    if (document.getElementById('ollamaMaxTokens')) document.getElementById('ollamaMaxTokens').value = ollamaConfig.max_tokens || 512;
    if (document.getElementById('ollamaSeed')) document.getElementById('ollamaSeed').value = ollamaConfig.seed || 0;
    if (document.getElementById('ollamaMirostat')) document.getElementById('ollamaMirostat').value = ollamaConfig.mirostat || 0;
    if (document.getElementById('ollamaMirostatTau')) document.getElementById('ollamaMirostatTau').value = ollamaConfig.mirostat_tau || 5.0;
    if (document.getElementById('ollamaMirostatEta')) document.getElementById('ollamaMirostatEta').value = ollamaConfig.mirostat_eta || 0.1;
    if (document.getElementById('ollamaGpuLayers')) document.getElementById('ollamaGpuLayers').value = ollamaConfig.gpu_layers || 0;
    if (document.getElementById('ollamaThreads')) document.getElementById('ollamaThreads').value = ollamaConfig.threads || 4;

    // Update background UI elements
    if (document.getElementById('bgScale')) document.getElementById('bgScale').value = backgroundConfig.scale || 1.2;
    if (document.getElementById('bgPosX')) document.getElementById('bgPosX').value = backgroundConfig.posX || 0;
    if (document.getElementById('bgPosY')) document.getElementById('bgPosY').value = backgroundConfig.posY || 0.8;
    if (document.getElementById('bgPosZ')) document.getElementById('bgPosZ').value = backgroundConfig.posZ || -4;
    if (document.getElementById('bgRotation')) document.getElementById('bgRotation').value = backgroundConfig.rotation || 0;
    if (document.getElementById('bgOpacity')) document.getElementById('bgOpacity').value = backgroundConfig.opacity || 0.85;
    
    // Update curve UI elements
    if (document.getElementById('bgCurveX')) document.getElementById('bgCurveX').value = backgroundConfig.curveX || 0.5;
    if (document.getElementById('bgCurveY')) document.getElementById('bgCurveY').value = backgroundConfig.curveY || 0.3;
    if (document.getElementById('bgCurveDirection')) document.getElementById('bgCurveDirection').value = backgroundConfig.curveDirection || 'inward';
    
    // Update TTS range displays
    updateTTSRangeValues();
    
    // Update Ollama range displays
    updateOllamaRangeValues();
    
    // Update background displays
    updateBackground();
    
    // Update AI provider visibility
    updateAIProvider();
  }
}

function updateOllamaConfig() {
  // Store old URL for comparison
  const oldUrl = ollamaConfig.url;
  
  // Basic settings
  ollamaConfig.url = document.getElementById('ollamaUrl').value;
  ollamaConfig.model = document.getElementById('ollamaModel').value;
  
  // Generation parameters
  ollamaConfig.temperature = parseFloat(document.getElementById('ollamaTemperature').value);
  ollamaConfig.top_p = parseFloat(document.getElementById('ollamaTopP').value);
  ollamaConfig.top_k = parseInt(document.getElementById('ollamaTopK').value);
  ollamaConfig.repeat_penalty = parseFloat(document.getElementById('ollamaRepeatPenalty').value);
  ollamaConfig.context_length = parseInt(document.getElementById('ollamaContextLength').value);
  ollamaConfig.max_tokens = parseInt(document.getElementById('ollamaMaxTokens').value);
  
  // Advanced parameters
  ollamaConfig.seed = parseInt(document.getElementById('ollamaSeed').value);
  ollamaConfig.system_message = document.getElementById('globalSystemMessage').value;
  ollamaConfig.mirostat = parseInt(document.getElementById('ollamaMirostat').value);
  ollamaConfig.mirostat_tau = parseFloat(document.getElementById('ollamaMirostatTau').value);
  ollamaConfig.mirostat_eta = parseFloat(document.getElementById('ollamaMirostatEta').value);
  
  // Performance settings
  ollamaConfig.gpu_layers = parseInt(document.getElementById('ollamaGpuLayers').value);
  ollamaConfig.threads = parseInt(document.getElementById('ollamaThreads').value);
  
  // Update range value displays
  updateOllamaRangeValues();
  
  saveUISettings();
  console.log('Ollama config updated:', ollamaConfig);
  
  // Only refresh models if URL actually changed and currently using Ollama
  if (oldUrl !== ollamaConfig.url && currentProvider === 'ollama') {
    console.log('Ollama URL changed, refreshing models');
    debouncedRefreshOllamaModels();
  }
}

function updateOllamaRangeValues() {
  // Update all range value displays
  if (document.getElementById('ollamaTemperatureValue')) document.getElementById('ollamaTemperatureValue').textContent = ollamaConfig.temperature.toFixed(1);
  if (document.getElementById('ollamaTopPValue')) document.getElementById('ollamaTopPValue').textContent = ollamaConfig.top_p.toFixed(2);
  if (document.getElementById('ollamaTopKValue')) document.getElementById('ollamaTopKValue').textContent = ollamaConfig.top_k;
  if (document.getElementById('ollamaRepeatPenaltyValue')) document.getElementById('ollamaRepeatPenaltyValue').textContent = ollamaConfig.repeat_penalty.toFixed(1);
  if (document.getElementById('ollamaContextLengthValue')) document.getElementById('ollamaContextLengthValue').textContent = ollamaConfig.context_length;
  if (document.getElementById('ollamaMaxTokensValue')) document.getElementById('ollamaMaxTokensValue').textContent = ollamaConfig.max_tokens;
  if (document.getElementById('ollamaMirostatTauValue')) document.getElementById('ollamaMirostatTauValue').textContent = ollamaConfig.mirostat_tau.toFixed(1);
  if (document.getElementById('ollamaMirostatEtaValue')) document.getElementById('ollamaMirostatEtaValue').textContent = ollamaConfig.mirostat_eta.toFixed(2);
  
  // Performance settings
  const gpuValue = ollamaConfig.gpu_layers === 0 ? '0 (CPU)' : ollamaConfig.gpu_layers;
  if (document.getElementById('ollamaGpuLayersValue')) document.getElementById('ollamaGpuLayersValue').textContent = gpuValue;
  if (document.getElementById('ollamaThreadsValue')) document.getElementById('ollamaThreadsValue').textContent = ollamaConfig.threads;
}

function setOllamaPreset(preset) {
  switch(preset) {
    case 'creative':
      setOllamaValues({
        temperature: 0.9,
        top_p: 0.9,
        top_k: 40,
        repeat_penalty: 1.0,
        mirostat: 0
      });
      break;
    case 'balanced':
      setOllamaValues({
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
        repeat_penalty: 1.1,
        mirostat: 0
      });
      break;
    case 'precise':
      setOllamaValues({
        temperature: 0.3,
        top_p: 0.7,
        top_k: 20,
        repeat_penalty: 1.2,
        mirostat: 2
      });
      break;
    case 'fast':
      setOllamaValues({
        temperature: 0.5,
        top_p: 0.8,
        top_k: 30,
        repeat_penalty: 1.1,
        max_tokens: 256,
        mirostat: 0
      });
      break;
  }
  
  updateStatus('⚙️', `Applied ${preset} preset`);
}

function setOllamaValues(values) {
  Object.keys(values).forEach(key => {
    if (ollamaConfig.hasOwnProperty(key)) {
      ollamaConfig[key] = values[key];
      
      // Update UI elements
      const elementId = 'ollama' + key.charAt(0).toUpperCase() + key.slice(1);
      const element = document.getElementById(elementId);
      if (element) {
        element.value = values[key];
      }
    }
  });
  
  updateOllamaRangeValues();
  saveUISettings();
}

function updateOpenAIConfig() {
  openaiConfig.key = document.getElementById('openaiKey').value;
  openaiConfig.model = document.getElementById('openaiModel').value;
  openaiConfig.temperature = parseFloat(document.getElementById('openaiTemperature').value);
  openaiConfig.max_tokens = parseInt(document.getElementById('openaiMaxTokens').value);
  openaiConfig.top_p = parseFloat(document.getElementById('openaiTopP').value);
  openaiConfig.frequency_penalty = parseFloat(document.getElementById('openaiFreqPenalty').value);
  openaiConfig.presence_penalty = parseFloat(document.getElementById('openaiPresencePenalty').value);
  openaiConfig.system_message = document.getElementById('globalSystemMessage').value;
  
  // Update range value displays
  document.getElementById('openaiTemperatureValue').textContent = openaiConfig.temperature.toFixed(1);
  document.getElementById('openaiMaxTokensValue').textContent = openaiConfig.max_tokens;
  document.getElementById('openaiTopPValue').textContent = openaiConfig.top_p.toFixed(2);
  document.getElementById('openaiFreqPenaltyValue').textContent = openaiConfig.frequency_penalty.toFixed(1);
  document.getElementById('openaiPresencePenaltyValue').textContent = openaiConfig.presence_penalty.toFixed(1);
  
  saveUISettings();
  console.log('OpenAI config updated:', openaiConfig);
}

function updateGeminiConfig() {
  geminiConfig.key = document.getElementById('geminiKey').value;
  geminiConfig.model = document.getElementById('geminiModel').value;
  geminiConfig.temperature = parseFloat(document.getElementById('geminiTemperature').value);
  geminiConfig.max_output_tokens = parseInt(document.getElementById('geminiMaxTokens').value);
  geminiConfig.top_p = parseFloat(document.getElementById('geminiTopP').value);
  geminiConfig.top_k = parseInt(document.getElementById('geminiTopK').value);
  geminiConfig.system_instruction = document.getElementById('globalSystemMessage').value;
  
  // Update range value displays
  document.getElementById('geminiTemperatureValue').textContent = geminiConfig.temperature.toFixed(1);
  document.getElementById('geminiMaxTokensValue').textContent = geminiConfig.max_output_tokens;
  document.getElementById('geminiTopPValue').textContent = geminiConfig.top_p.toFixed(2);
  document.getElementById('geminiTopKValue').textContent = geminiConfig.top_k;
  
  saveUISettings();
  console.log('Gemini config updated:', geminiConfig);
}

function updateAIProvider() {
  const newProvider = document.getElementById('aiProvider').value;
  
  // Don't reload models if switching to the same provider
  if (currentProvider === newProvider) {
    console.log('Provider unchanged, skipping model refresh');
    return;
  }
  
  currentProvider = newProvider;
  
  // Show/hide relevant sections
  document.getElementById('ollamaConfig').style.display = currentProvider === 'ollama' ? 'block' : 'none';
  document.getElementById('openaiConfig').style.display = currentProvider === 'openai' ? 'block' : 'none';
  document.getElementById('geminiConfig').style.display = currentProvider === 'gemini' ? 'block' : 'none';
  
  saveUISettings();
  updateStatus('🔄', `Switched to ${currentProvider.toUpperCase()}`);
  console.log('AI provider switched to:', currentProvider);
  
  // Only load Ollama models when switching TO Ollama (and not already loaded)
  if (currentProvider === 'ollama') {
    const modelSelect = document.getElementById('ollamaModel');
    const hasModels = modelSelect && modelSelect.children.length > 1;
    
    if (!hasModels) {
      console.log('Loading Ollama models for first time switch');
      debouncedRefreshOllamaModels();
    } else {
      console.log('Ollama models already loaded');
    }
  }
}

// Optimized Ollama model loading with debouncing and duplicate prevention
async function refreshOllamaModels(force = false) {
  const currentUrl = ollamaConfig.url || document.getElementById('ollamaUrl')?.value || 'http://localhost:11434';
  
  // Skip if already loading (unless forced)
  if (isLoadingOllamaModels && !force) {
    console.log('Ollama models already loading, skipping...');
    return;
  }
  
  // Skip if URL hasn't changed and not forced
  if (lastOllamaUrl === currentUrl && !force) {
    console.log('Ollama URL unchanged, skipping model refresh');
    return;
  }
  
  // Clear any pending timeout
  if (ollamaModelsLoadTimeout) {
    clearTimeout(ollamaModelsLoadTimeout);
    ollamaModelsLoadTimeout = null;
  }
  
  // Set loading flag
  isLoadingOllamaModels = true;
  lastOllamaUrl = currentUrl;
  
  const modelSelect = document.getElementById('ollamaModel');
  const refreshBtn = document.querySelector('.refresh-btn');
  
  if (!modelSelect) {
    console.error('Model select element not found');
    isLoadingOllamaModels = false;
    return;
  }
  
  try {
    console.log('Loading Ollama models from:', currentUrl);
    
    // Update UI to show loading
    modelSelect.disabled = true;
    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.textContent = '⏳';
    }
    
    updateStatus('🔄', 'Loading Ollama models...');
    
    const models = await loadOllamaModels();
    modelSelect.innerHTML = '<option value="">Select model...</option>';
    
    if (models && models.length > 0) {
      models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.name;
        option.textContent = model.name;
        modelSelect.appendChild(option);
      });
      
      // Restore saved selection from both config and localStorage
      const savedModel = ollamaConfig.model || localStorage.getItem('ollamaSelectedModel');
      if (savedModel) {
        modelSelect.value = savedModel;
        ollamaConfig.model = savedModel;
      } else {
        // Try to set default model to llama3.1:8b if available
        const defaultModel = 'llama3.1:8b';
        const defaultOption = Array.from(modelSelect.options).find(opt => opt.value === defaultModel);
        if (defaultOption) {
          modelSelect.value = defaultModel;
          ollamaConfig.model = defaultModel;
          localStorage.setItem('ollamaSelectedModel', defaultModel);
          console.log('Set default Ollama model to:', defaultModel);
        }
      }
      
      updateStatus('✅', `Loaded ${models.length} models`);
      console.log(`Successfully loaded ${models.length} Ollama models`);
    } else {
      modelSelect.innerHTML = '<option value="">No models found</option>';
      updateStatus('❌', 'No models found');
      console.warn('No Ollama models found');
    }
    
  } catch (error) {
    console.error('Error refreshing models:', error);
    modelSelect.innerHTML = '<option value="">Error loading models</option>';
    updateStatus('❌', 'Error loading models - Check Ollama connection');
  } finally {
    // Reset loading state
    isLoadingOllamaModels = false;
    modelSelect.disabled = false;
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.textContent = '🔄';
    }
  }
}

// Debounced version that waits 500ms before actually calling
function debouncedRefreshOllamaModels() {
  // Clear existing timeout
  if (ollamaModelsLoadTimeout) {
    clearTimeout(ollamaModelsLoadTimeout);
  }
  
  // Set new timeout
  ollamaModelsLoadTimeout = setTimeout(() => {
    refreshOllamaModels(false);
  }, 500);
}

function saveUISettings() {
  const settings = {
    azureConfig: azureConfig,
    ollamaConfig: ollamaConfig
  };
  localStorage.setItem('vu-vrm-ai-settings', JSON.stringify(settings));
}

function loadUISettings() {
  const saved = localStorage.getItem('vu-vrm-ai-settings');
  if (saved) {
    const settings = JSON.parse(saved);
    
    // Update configs
    if (settings.azureConfig) {
      Object.assign(azureConfig, settings.azureConfig);
    }
    if (settings.ollamaConfig) {
      Object.assign(ollamaConfig, settings.ollamaConfig);
    }
    // aiPersonality removed - using global system prompt instead
    
    // Update UI elements
    if (document.getElementById('azureKey')) document.getElementById('azureKey').value = azureConfig.key || '';
    if (document.getElementById('azureRegion')) document.getElementById('azureRegion').value = azureConfig.region || 'eastus';
    if (document.getElementById('voiceSelect')) document.getElementById('voiceSelect').value = azureConfig.voice || 'en-US-JennyNeural';
    if (document.getElementById('ollamaUrl')) document.getElementById('ollamaUrl').value = ollamaConfig.url || 'http://localhost:11434';
    if (document.getElementById('ollamaModel')) document.getElementById('ollamaModel').value = ollamaConfig.model || '';
  }
}

// Update button states based on listening status
function updateButtonStates() {
  const listenBtn = document.getElementById('listenBtn');
  const stopBtn = document.getElementById('stopBtn');
  const voiceBtn = document.getElementById('voiceBtn');
  
  // Disable all voice controls when TTS is playing or processing
  const isBlocked = isTTSPlaying || isProcessingTTS;
  
  if (listenBtn) {
    listenBtn.disabled = isListening || isBlocked;
  }
  if (stopBtn) {
    stopBtn.disabled = !isListening;
  }
  if (voiceBtn) {
    voiceBtn.disabled = isBlocked;
    if (isBlocked) {
      voiceBtn.classList.remove('recording');
    }
  }
  
  if (isListening) {
    if (listenBtn) listenBtn.textContent = '🎤 Listening...';
    if (stopBtn) stopBtn.textContent = '⏹️ Stop';
  } else {
    if (listenBtn) listenBtn.textContent = '🎤 Start Listening';
    if (stopBtn) stopBtn.textContent = '⏹️ Stop';
  }
}

// Removed duplicate speech recognition function - using clean Whisper implementation

// New UI Functions

// Toggle Settings Panel
function toggleSettings() {
  const panel = document.getElementById('settingsPanel');
  const isShowing = panel.classList.contains('show');
  
  if (isShowing) {
    panel.classList.remove('show');
    // Remove click-outside listener
    document.removeEventListener('click', handleSettingsClickOutside);
  } else {
    panel.classList.add('show');
    // Add click-outside listener after a brief delay
    setTimeout(() => {
      document.addEventListener('click', handleSettingsClickOutside);
    }, 100);
  }
}

// Handle clicks outside settings panel
function handleSettingsClickOutside(e) {
  const panel = document.getElementById('settingsPanel');
  const settingsBtn = document.querySelector('.settings-btn');
  
  // Check if click is outside the panel and not on the settings button
  if (panel && !panel.contains(e.target) && (!settingsBtn || !settingsBtn.contains(e.target))) {
    panel.classList.remove('show');
    document.removeEventListener('click', handleSettingsClickOutside);
  }
}

// Toggle Password Visibility
function togglePasswordVisibility(inputId, buttonElement) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  if (input.type === 'password') {
    input.type = 'text';
    buttonElement.textContent = '🙈';
  } else {
    input.type = 'password';
    buttonElement.textContent = '👁️';
  }
}

// AI Provider Config Switching
function updateAIProvider() {
  const provider = document.getElementById('aiProvider').value;
  const ollamaConfig = document.getElementById('ollamaConfig');
  const openaiConfig = document.getElementById('openaiConfig');
  const geminiConfig = document.getElementById('geminiConfig');
  
  // Hide all provider configs
  ollamaConfig.style.display = 'none';
  openaiConfig.style.display = 'none';
  geminiConfig.style.display = 'none';
  
  // Show selected provider config
  switch(provider) {
    case 'ollama':
      ollamaConfig.style.display = 'block';
      break;
    case 'openai':
      openaiConfig.style.display = 'block';
      break;
    case 'gemini':
      geminiConfig.style.display = 'block';
      break;
  }
  
  // Update current provider
  currentProvider = provider;
  saveUISettings();
  
  console.log('AI Provider switched to:', provider);
}

// Speech Hotkey Update
function updateSpeechHotkey() {
  speechHotkey = document.getElementById('speechHotkey').value;
  saveTwitchSettings();
  console.log('Speech hotkey updated to:', speechHotkey);
}

// Accordion Toggle Function
function toggleAccordion(sectionId) {
  const content = document.getElementById(sectionId);
  const header = content.previousElementSibling;
  
  if (!content || !header) return;
  
  // Close all other accordion sections first
  const allContents = document.querySelectorAll('.accordion-content');
  const allHeaders = document.querySelectorAll('.accordion-header');
  
  allContents.forEach((item, index) => {
    if (item.id !== sectionId) {
      item.classList.remove('expanded');
      allHeaders[index].classList.remove('active');
    }
  });
  
  // Toggle the clicked section
  const isExpanded = content.classList.contains('expanded');
  
  if (isExpanded) {
    content.classList.remove('expanded');
    header.classList.remove('active');
  } else {
    content.classList.add('expanded');
    header.classList.add('active');
  }
  
  console.log('Toggled accordion:', sectionId, isExpanded ? 'closed' : 'opened');
}

// Initialize Accordion (expand first section by default)
function initializeAccordion() {
  // Expand the VRM Controls section by default
  const defaultSection = 'vrmControls';
  const content = document.getElementById(defaultSection);
  const header = content?.previousElementSibling;
  
  if (content && header) {
    content.classList.add('expanded');
    header.classList.add('active');
    console.log('Initialized accordion with default section:', defaultSection);
  }
}

// Chat Input Handler
function handleChatKeyPress(event) {
  if (event.key === 'Enter') {
    sendChatMessage();
  }
}


// Voice Input Toggle - Unified function for both mobile and desktop
function toggleVoiceInput() {
  const btn = document.getElementById('voiceBtn');

  // Block if AI is busy or TTS is playing
  if (isTTSPlaying || isProcessingTTS) {
    const message = isTTSPlaying ? 'Please wait for AI to finish speaking' : 'AI is processing your request';
    updateStatus('🚫', message);
    return;
  }

  if (isListening) {
    // If we are already listening, stop it
    stopListening();
    if (btn) {
      btn.classList.remove('recording');
      // Reset any visual effects
      btn.style.transform = '';
      btn.style.boxShadow = '';
    }
    updateStatus('🎤', 'Voice input stopped');
  } else {
    // If not listening, start it (triggered directly by user tap/click)
    try {
      startListening();
      if (btn) {
        btn.classList.add('recording');
      }
      const actionText = isMobileDevice ? 'Listening... (tap to stop)' : 'Listening... (click to stop)';
      updateStatus('🎤', actionText);
    } catch (error) {
      console.error('Could not start speech recognition:', error);
      updateStatus('❌', 'Voice input failed to start');
    }
  }
}

// Update Status Indicator
function updateStatus(icon, text) {
  const statusIndicator = document.getElementById('statusIndicator');
  const statusIcon = document.getElementById('statusIndicator').querySelector('.status-icon');
  const statusText = document.getElementById('statusIndicator').querySelector('.status-text');
  
  statusIcon.textContent = icon;
  statusText.textContent = text;
  
  // Show status indicator
  statusIndicator.classList.add('show');
  
  // Auto-hide after 3 seconds for non-permanent messages
  if (text !== 'Ready to chat' && text !== 'Listening...') {
    setTimeout(() => {
      statusIndicator.classList.remove('show');
    }, 3000);
  }
}

// Subtitle System - Shows static text from TTS
function showSubtitle(text, duration = null) {
  // Check if subtitles are enabled
  if (!document.getElementById('showSubtitles').checked) {
    return;
  }
  
  const subtitleContainer = document.getElementById('subtitleContainer');
  const subtitleText = document.getElementById('subtitleText');
  const subtitleProgress = document.getElementById('subtitleProgress');
  
  if (!subtitleContainer || !subtitleText || !subtitleProgress) {
    return;
  }
  
  // Show the TTS text directly (no speech recognition needed)
  subtitleText.textContent = text;
  subtitleContainer.classList.add('show');
  
  // Calculate duration based on text length and settings
  let displayDuration;
  if (duration === null) {
    const baseDurationPerSecond = parseFloat(document.getElementById('subtitleDuration').value) || 5;
    const characterCount = text.length;
    const readingTimeSeconds = Math.max(2, characterCount / 15);
    const sliderMultiplier = baseDurationPerSecond / 5;
    displayDuration = Math.max(2000, readingTimeSeconds * 1000 * sliderMultiplier);
  } else {
    displayDuration = duration;
  }
  
  // Start progress animation
  subtitleProgress.style.transitionDuration = displayDuration + 'ms';
  subtitleProgress.classList.add('animate');
  
  // Hide after duration only if TTS is not playing
  if (!isTTSPlaying) {
    setTimeout(() => {
      hideSubtitles();
    }, displayDuration);
  }
}

function hideSubtitles() {
  const subtitleContainer = document.getElementById('subtitleContainer');
  const subtitleProgress = document.getElementById('subtitleProgress');
  
  if (subtitleContainer && subtitleProgress) {
    subtitleContainer.classList.remove('show');
    subtitleProgress.classList.remove('animate');
  }
}

// Chat Bubble System

// Display Options Toggles
function toggleSubtitles() {
  const enabled = document.getElementById('showSubtitles').checked;
  
  if (enabled) {
    updateStatus('📺', 'Subtitles enabled');
  } else {
    hideSubtitles();
    updateStatus('📺', 'Subtitles disabled');
  }
  
  saveUISettings();
}

function toggleChatBubble() {
  const enabled = document.getElementById('showChatBubble').checked;
  const speechBubbleOverlay = document.getElementById('speechBubbleOverlay');
  
  if (speechBubbleOverlay) {
    speechBubbleOverlay.style.display = enabled ? 'block' : 'none';
  }
  
  updateStatus('💬', enabled ? 'Chat bubble enabled' : 'Chat bubble disabled');
  saveUISettings();
}

// Test TTS Function
async function testTTS() {
  const testText = "Hey there! This is a test of my voice settings. How do I sound? Pretty cool, right?";
  updateStatus('🔊', 'Testing TTS...');
  
  try {
    await enhancedSpeakAIResponse(testText);
  } catch (error) {
    console.error('TTS test failed:', error);
    updateStatus('❌', 'TTS test failed');
  }
}

// Test Browser TTS Function
async function testBrowserTTS() {
  const testText = "This is a test of the browser's built-in text-to-speech. No Azure key required!";
  updateStatus('📢', 'Testing browser TTS...');
  
  try {
    await speakWithBrowserTTS(testText);
    updateStatus('✅', 'Browser TTS test completed');
  } catch (error) {
    console.error('Browser TTS test failed:', error);
    updateStatus('❌', 'Browser TTS test failed');
  }
}

// Enhanced AI Response Handler
async function enhancedSpeakAIResponse(text) {
  // Show subtitle with character-based duration
  showSubtitle(text);
  
  // Show speech bubble with AI response
  showSpeechBubble(text);

  // Add AI response to the chat overlay
  addTwitchChatMessage('Neuro-sama', text);
  
  // Update status
  updateStatus('🔊', 'AI is speaking...');
  
  // Call original TTS function
  await speakAIResponse(text);
  
  // Update status when done
  setTimeout(() => {
    updateStatus('🎤', 'Ready to chat');
  }, 1000);
}

// Update Range Value Displays
function updateRangeValues() {
  const ranges = [
    { id: 'mouththreshold', valueId: 'mouthThresholdValue' },
    { id: 'bodythreshold', valueId: 'bodyThresholdValue' },
    { id: 'mouthboost', valueId: 'mouthBoostValue' },
    { id: 'bodymotion', valueId: 'bodyMotionValue' },
    { id: 'expression', valueId: 'expressionValue' },
    { id: 'subtitleDuration', valueId: 'subtitleDurationValue', suffix: 's' }
  ];
  
  ranges.forEach(range => {
    const element = document.getElementById(range.id);
    const valueElement = document.getElementById(range.valueId);
    
    if (element && valueElement) {
      element.addEventListener('input', () => {
        valueElement.textContent = element.value + (range.suffix || '');
        // Save settings when subtitle duration changes
        if (range.id === 'subtitleDuration') {
          saveUISettings();
        }
      });
    }
  });
  
  // Add TTS-specific range updates
  setupTTSRangeUpdates();
}

// Setup TTS Range Updates
function setupTTSRangeUpdates() {
  const ttsVolumeSlider = document.getElementById('ttsVolume');
  const ttsPitchSlider = document.getElementById('ttsPitch');
  
  if (ttsVolumeSlider) {
    ttsVolumeSlider.addEventListener('input', updateTTSRangeValues);
  }
  
  if (ttsPitchSlider) {
    ttsPitchSlider.addEventListener('input', updateTTSRangeValues);
  }
}

// Update TTS Range Values
function updateTTSRangeValues() {
  const ttsVolumeValue = document.getElementById('ttsVolumeValue');
  const ttsPitchValue = document.getElementById('ttsPitchValue');
  const ttsRateValue = document.getElementById('ttsRateValue');
  
  if (ttsVolumeValue) {
    const volume = document.getElementById('ttsVolume').value;
    ttsVolumeValue.textContent = Math.round(volume * 100) + '%';
  }
  
  if (ttsPitchValue) {
    const pitch = document.getElementById('ttsPitch').value;
    ttsPitchValue.textContent = (pitch >= 0 ? '+' : '') + pitch + 'st';
  }
  
  if (ttsRateValue) {
    const rate = document.getElementById('ttsRate').value;
    ttsRateValue.textContent = rate + 'x';
  }
}

// Update Azure TTS Config
function updateAzureConfig() {
  azureConfig.key = document.getElementById('azureKey').value;
  azureConfig.region = document.getElementById('azureRegion').value;
  azureConfig.voice = document.getElementById('voiceSelect').value;
  azureConfig.volume = parseFloat(document.getElementById('ttsVolume').value);
  azureConfig.pitch = parseFloat(document.getElementById('ttsPitch').value);
  azureConfig.rate = parseFloat(document.getElementById('ttsRate').value);
  
  // Update range value displays
  updateTTSRangeValues();
  
  // Save settings
  saveUISettings();
  
  console.log('Azure TTS config updated:', azureConfig);
}

// Input level display
function updateInputLevel() {
  const inputLevel = document.getElementById('inputlevel');
  const inputValue = document.getElementById('inputValue');
  
  if (inputLevel && inputValue) {
    inputValue.textContent = inputLevel.value;
  }
}

// Initialize UI
function initializeUI() {
  // Update range values
  updateRangeValues();
  
  // Setup input level monitoring
  setInterval(updateInputLevel, 100);

  // Setup mic gain listener
  document.getElementById('micGain').addEventListener('input', updateMicGain);
  
  // Show initial status
  updateStatus('🎤', 'Ready to chat');
  
  // Hide loading screen
  setTimeout(() => {
    document.getElementById('loadingScreen').classList.remove('show');
  }, 2000);
}

// Enhanced settings save/load
const originalSaveUISettings = saveUISettings;
function saveUISettings() {
  const settings = {
    azureConfig: azureConfig,
    ollamaConfig: ollamaConfig,
    openaiConfig: openaiConfig,
    geminiConfig: geminiConfig,
    currentProvider: currentProvider,
    backgroundConfig: backgroundConfig,
    displayOptions: {
      showSubtitles: document.getElementById('showSubtitles').checked,
      showChatBubble: document.getElementById('showChatBubble').checked,
      subtitleDuration: document.getElementById('subtitleDuration').value,
      enableTTS: document.getElementById('enableTTS').checked
    },
    micGain: document.getElementById('micGain').value,
    conversationHistory: conversationHistory
  };
  localStorage.setItem('neurolink-vrm-settings', JSON.stringify(settings));
}

function loadUISettings() {
  const saved = localStorage.getItem('neurolink-vrm-settings');
  if (saved) {
    const settings = JSON.parse(saved);
    
    // Update configs
    if (settings.azureConfig) Object.assign(azureConfig, settings.azureConfig);
    if (settings.ollamaConfig) Object.assign(ollamaConfig, settings.ollamaConfig);
    if (settings.openaiConfig) Object.assign(openaiConfig, settings.openaiConfig);
    if (settings.geminiConfig) Object.assign(geminiConfig, settings.geminiConfig);
    if (settings.currentProvider) currentProvider = settings.currentProvider;
    // aiPersonality removed - using global system prompt instead
    
    // Update display options
    if (settings.displayOptions) {
      if (document.getElementById('showSubtitles')) document.getElementById('showSubtitles').checked = settings.displayOptions.showSubtitles !== false;
      if (document.getElementById('showChatBubble')) {
        document.getElementById('showChatBubble').checked = settings.displayOptions.showChatBubble !== false;
        // Apply speech bubble visibility based on setting
        const speechBubbleOverlay = document.getElementById('speechBubbleOverlay');
        if (speechBubbleOverlay) {
          speechBubbleOverlay.style.display = settings.displayOptions.showChatBubble !== false ? 'block' : 'none';
        }
      }
      if (document.getElementById('subtitleDuration')) document.getElementById('subtitleDuration').value = settings.displayOptions.subtitleDuration || 5;
      if (document.getElementById('enableTTS')) document.getElementById('enableTTS').checked = settings.displayOptions.enableTTS !== false;
    }

    if (settings.micGain) {
      if (document.getElementById('micGain')) document.getElementById('micGain').value = settings.micGain;
      updateMicGain();
    }
    
    // Restore conversation history
    if (settings.conversationHistory && Array.isArray(settings.conversationHistory)) {
      conversationHistory = settings.conversationHistory;
    }
    
    // Restore background config
    if (settings.backgroundConfig) {
      Object.assign(backgroundConfig, settings.backgroundConfig);
    }
    
    // Update UI elements
    if (document.getElementById('azureKey')) document.getElementById('azureKey').value = azureConfig.key || '';
    if (document.getElementById('azureRegion')) document.getElementById('azureRegion').value = azureConfig.region || 'eastus';
    if (document.getElementById('voiceSelect')) document.getElementById('voiceSelect').value = azureConfig.voice || 'en-US-JennyNeural';
    if (document.getElementById('ttsVolume')) document.getElementById('ttsVolume').value = azureConfig.volume || 0.9;
    if (document.getElementById('ttsPitch')) document.getElementById('ttsPitch').value = azureConfig.pitch || 1.3;
    if (document.getElementById('ttsRate')) document.getElementById('ttsRate').value = azureConfig.rate || 1.0;
    
    // Update AI provider selection - default to Gemini instead of Ollama
    if (document.getElementById('aiProvider')) document.getElementById('aiProvider').value = currentProvider || 'gemini';
    
    // Update OpenAI UI elements
    if (document.getElementById('openaiKey')) document.getElementById('openaiKey').value = openaiConfig.key || '';
    if (document.getElementById('openaiModel')) document.getElementById('openaiModel').value = openaiConfig.model || 'gpt-4.1';
    if (document.getElementById('openaiTemperature')) document.getElementById('openaiTemperature').value = openaiConfig.temperature || 0.7;
    if (document.getElementById('openaiMaxTokens')) document.getElementById('openaiMaxTokens').value = openaiConfig.max_tokens || 512;
    if (document.getElementById('openaiTopP')) document.getElementById('openaiTopP').value = openaiConfig.top_p || 1.0;
    if (document.getElementById('openaiFreqPenalty')) document.getElementById('openaiFreqPenalty').value = openaiConfig.frequency_penalty || 0;
    if (document.getElementById('openaiPresencePenalty')) document.getElementById('openaiPresencePenalty').value = openaiConfig.presence_penalty || 0;
    
    // Update Gemini UI elements
    if (document.getElementById('geminiKey')) document.getElementById('geminiKey').value = geminiConfig.key || '';
    if (document.getElementById('geminiModel')) document.getElementById('geminiModel').value = geminiConfig.model || 'gemini-2.5-flash';
    if (document.getElementById('geminiTemperature')) document.getElementById('geminiTemperature').value = geminiConfig.temperature || 0.7;
    if (document.getElementById('geminiMaxTokens')) document.getElementById('geminiMaxTokens').value = geminiConfig.max_output_tokens || 1024;
    if (document.getElementById('geminiTopP')) document.getElementById('geminiTopP').value = geminiConfig.top_p || 0.95;
    if (document.getElementById('geminiTopK')) document.getElementById('geminiTopK').value = geminiConfig.top_k || 40;
    
    // Update shared system prompt
    if (document.getElementById('globalSystemMessage')) {
        if (currentProvider === 'ollama') {
            document.getElementById('globalSystemMessage').value = ollamaConfig.system_message || '';
        } else if (currentProvider === 'openai') {
            document.getElementById('globalSystemMessage').value = openaiConfig.system_message || '';
        } else if (currentProvider === 'gemini') {
            document.getElementById('globalSystemMessage').value = geminiConfig.system_instruction || '';
        }
    }

    // Update Ollama UI elements
    if (document.getElementById('ollamaUrl')) document.getElementById('ollamaUrl').value = ollamaConfig.url || 'http://localhost:11434';
    if (document.getElementById('ollamaModel')) document.getElementById('ollamaModel').value = ollamaConfig.model || '';
    if (document.getElementById('ollamaTemperature')) document.getElementById('ollamaTemperature').value = ollamaConfig.temperature || 0.7;
    if (document.getElementById('ollamaTopP')) document.getElementById('ollamaTopP').value = ollamaConfig.top_p || 0.9;
    if (document.getElementById('ollamaTopK')) document.getElementById('ollamaTopK').value = ollamaConfig.top_k || 40;
    if (document.getElementById('ollamaRepeatPenalty')) document.getElementById('ollamaRepeatPenalty').value = ollamaConfig.repeat_penalty || 1.1;
    if (document.getElementById('ollamaContextLength')) document.getElementById('ollamaContextLength').value = ollamaConfig.context_length || 2048;
    if (document.getElementById('ollamaMaxTokens')) document.getElementById('ollamaMaxTokens').value = ollamaConfig.max_tokens || 512;
    if (document.getElementById('ollamaSeed')) document.getElementById('ollamaSeed').value = ollamaConfig.seed || 0;
    if (document.getElementById('ollamaMirostat')) document.getElementById('ollamaMirostat').value = ollamaConfig.mirostat || 0;
    if (document.getElementById('ollamaMirostatTau')) document.getElementById('ollamaMirostatTau').value = ollamaConfig.mirostat_tau || 5.0;
    if (document.getElementById('ollamaMirostatEta')) document.getElementById('ollamaMirostatEta').value = ollamaConfig.mirostat_eta || 0.1;
    if (document.getElementById('ollamaGpuLayers')) document.getElementById('ollamaGpuLayers').value = ollamaConfig.gpu_layers || 0;
    if (document.getElementById('ollamaThreads')) document.getElementById('ollamaThreads').value = ollamaConfig.threads || 4;

    // Update background UI elements
    if (document.getElementById('bgScale')) document.getElementById('bgScale').value = backgroundConfig.scale || 1.2;
    if (document.getElementById('bgPosX')) document.getElementById('bgPosX').value = backgroundConfig.posX || 0;
    if (document.getElementById('bgPosY')) document.getElementById('bgPosY').value = backgroundConfig.posY || 0.8;
    if (document.getElementById('bgPosZ')) document.getElementById('bgPosZ').value = backgroundConfig.posZ || -4;
    if (document.getElementById('bgRotation')) document.getElementById('bgRotation').value = backgroundConfig.rotation || 0;
    if (document.getElementById('bgOpacity')) document.getElementById('bgOpacity').value = backgroundConfig.opacity || 0.85;
    
    // Update curve UI elements
    if (document.getElementById('bgCurveX')) document.getElementById('bgCurveX').value = backgroundConfig.curveX || 0.5;
    if (document.getElementById('bgCurveY')) document.getElementById('bgCurveY').value = backgroundConfig.curveY || 0.3;
    if (document.getElementById('bgCurveDirection')) document.getElementById('bgCurveDirection').value = backgroundConfig.curveDirection || 'inward';
    
    // Update TTS range displays
    updateTTSRangeValues();
    
    // Update Ollama range displays
    updateOllamaRangeValues();
    
    // Update background displays
    updateBackground();
    
    // Update AI provider visibility
    updateAIProvider();
  }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Page loaded - Starting Whisper AI initialization...');
  
  // Initialize Whisper AI first for immediate speech recognition availability
  initializeTranscriber();
  
  // Initialize other components
  loadUISettings();
  initializeUI();
  loadSavedBackground();
  loadVRMConfig(); // Load VRM position settings
  loadArmConfig(); // Load arm position settings
  loadTwitchSettings(); // Load Twitch stream settings
  initializeAccordion(); // Initialize accordion sections
  setupGlobalHotkeyListeners(); // Setup always-active speech hotkeys
  updateChatToggleButtonState(); // Set initial chat toggle button state
  
  // Load user name into input field
  const userNameInput = document.getElementById('userName');
  if (userNameInput) {
    userNameInput.value = userName;
  }
  
  // Ensure stream mode is off by default
  ensureStreamModeOff();
  
  // Initialize browser voices (wait for voices to load)
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
      populateBrowserVoices();
      loadBrowserVoiceSettings();
    };
  }
  // Try to populate immediately in case voices are already loaded
  setTimeout(() => {
    populateBrowserVoices();
    loadBrowserVoiceSettings();
  }, 200);
  
  // Only load Ollama models if Ollama is the current provider
  setTimeout(() => {
    if (currentProvider === 'ollama') {
      console.log('Loading Ollama models - provider is Ollama');
      refreshOllamaModels();
    } else {
      console.log('Skipping Ollama model load - current provider is:', currentProvider);
    }
  }, 500);
});

// ====================================
// TWITCH STREAM INTEGRATION
// ====================================

function toggleChatOverlay() {
    const chatOverlay = document.getElementById('twitchChatOverlay');
    if (chatOverlay) {
        if (chatOverlay.style.display === 'none') {
            chatOverlay.style.display = 'flex';
        } else {
            chatOverlay.style.display = 'none';
        }
    }
}

function toggleFoldChat() {
    const chatOverlay = document.getElementById('twitchChatOverlay');
    const icon = document.querySelector('#dockBtn .accordion-icon');

    if (chatOverlay.classList.contains('folded')) {
        chatOverlay.classList.remove('folded');
        icon.textContent = '▼';
    } else {
        chatOverlay.classList.add('folded');
        icon.textContent = '▲';
    }
}

let twitchSocket = null;
let isStreamModeEnabled = false;
let isTwitchConnected = false;
let twitchChannel = '';
let accumulatedMessages = [];
let messageAccumulationTarget = 15;
let speechHotkey = 'Shift';
let hotkeyPressed = false;
let totalTwitchMessages = 0;

// Twitch Settings Management
function saveTwitchSettings() {
  const settings = {
    twitchChannel: document.getElementById('twitchChannel').value,
    messageAccumulation: parseInt(document.getElementById('messageAccumulation').value),
    speechHotkey: document.getElementById('speechHotkey').value,
    streamModeEnabled: document.getElementById('enableStreamMode').checked
  };
  
  localStorage.setItem('twitch-settings', JSON.stringify(settings));
  
  // Update UI
  messageAccumulationTarget = settings.messageAccumulation;
  speechHotkey = settings.speechHotkey;
  document.getElementById('messageAccumulationValue').textContent = settings.messageAccumulation;
  document.getElementById('accumulationTarget').textContent = settings.messageAccumulation;
  
  console.log('Twitch settings saved:', settings);
}

function loadTwitchSettings() {
  const saved = localStorage.getItem('twitch-settings');
  if (saved) {
    const settings = JSON.parse(saved);
    
    if (document.getElementById('twitchChannel')) {
      document.getElementById('twitchChannel').value = settings.twitchChannel || '';
    }
    if (document.getElementById('messageAccumulation')) {
      document.getElementById('messageAccumulation').value = settings.messageAccumulation || 15;
      document.getElementById('messageAccumulationValue').textContent = settings.messageAccumulation || 15;
      document.getElementById('accumulationTarget').textContent = settings.messageAccumulation || 15;
    }
    if (document.getElementById('speechHotkey')) {
      document.getElementById('speechHotkey').value = settings.speechHotkey || 'Shift';
    }
    if (document.getElementById('enableStreamMode')) {
      document.getElementById('enableStreamMode').checked = settings.streamModeEnabled === true;
    }
    
    messageAccumulationTarget = settings.messageAccumulation || 15;
    speechHotkey = settings.speechHotkey || 'Shift';
    twitchChannel = settings.twitchChannel || '';
    
    // Apply stream mode if explicitly enabled
    if (settings.streamModeEnabled === true) {
      toggleStreamMode();
    }
  }
}

// Ensure stream mode is off by default
function ensureStreamModeOff() {
  const chatOverlay = document.getElementById('twitchChatOverlay');
  const floatingChat = document.getElementById('floatingChat');
  const appFooter = document.querySelector('.app-footer');
  const streamModeCheckbox = document.getElementById('enableStreamMode');
  
  // Force stream mode off
  if (streamModeCheckbox) {
    streamModeCheckbox.checked = false;
  }
  
  isStreamModeEnabled = false;
  
  // Ensure UI is in correct state
  if (chatOverlay) {
    chatOverlay.style.display = 'none';
  }
  if (floatingChat) {
    floatingChat.classList.remove('stream-mode-hidden');
  }
  if (appFooter) {
    appFooter.style.display = 'block';
  }
  
  console.log('Stream mode forced off by default');
}

// Stream Mode Toggle
function toggleStreamMode() {
    isStreamModeEnabled = document.getElementById('enableStreamMode').checked;
    const floatingChat = document.getElementById('floatingChat');
    const appFooter = document.querySelector('.app-footer');

    if (isStreamModeEnabled) {
        floatingChat.classList.add('stream-mode-hidden');
        if (appFooter) appFooter.style.display = 'none';
        setupHotkeyListeners();
        console.log('Stream mode enabled - Text input and footer hidden');
    } else {
        floatingChat.classList.remove('stream-mode-hidden');
        if (appFooter) appFooter.style.display = 'block';
        removeHotkeyListeners();
        if (isTwitchConnected) {
            disconnectFromTwitch();
        }
        console.log('Stream mode disabled - Text input and footer visible');
    }
    
    // Update chat toggle button state to reflect current visibility
    updateChatToggleButtonState();
    
    saveTwitchSettings();
}


// Global Hotkey Management (Always Active)
function setupGlobalHotkeyListeners() {
  document.addEventListener('keydown', handleGlobalHotkeyDown);
  document.addEventListener('keyup', handleGlobalHotkeyUp);
  console.log('Global hotkey listeners setup - Speech recognition always available');
}

function handleGlobalHotkeyDown(event) {
  // Skip if user is typing in an input field
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
  
  const key = event.code || event.key;
  if ((speechHotkey === 'Shift' && event.shiftKey) ||
      (speechHotkey === 'Control' && event.ctrlKey) ||
      (speechHotkey === 'Alt' && event.altKey) ||
      (speechHotkey === 'Space' && key === 'Space') ||
      (key === speechHotkey)) {
    
    if (!hotkeyPressed) {
      hotkeyPressed = true;
      event.preventDefault();
      startVoiceInput();
    }
  }
}

function handleGlobalHotkeyUp(event) {
  const key = event.code || event.key;
  if ((speechHotkey === 'Shift' && !event.shiftKey) ||
      (speechHotkey === 'Control' && !event.ctrlKey) ||
      (speechHotkey === 'Alt' && !event.altKey) ||
      (speechHotkey === 'Space' && key === 'Space') ||
      (key === speechHotkey)) {
    
    if (hotkeyPressed) {
      hotkeyPressed = false;
      stopVoiceInput();
    }
  }
}

function startVoiceInput() {
  if (transcriber && !isListening) {
    console.log('Starting voice input with hotkey:', speechHotkey);
    startListening();
  }
}

function stopVoiceInput() {
  if (transcriber && isListening) {
    console.log('Stopping voice input');
    stopListening();
  }
}

// Legacy functions for stream mode compatibility
function setupHotkeyListeners() {
  // No longer needed - global hotkeys are always active
}

function removeHotkeyListeners() {
  // No longer needed - global hotkeys are always active
}

function startStreamVoiceInput() {
  if (transcriber && !isListening) {
    console.log('Starting stream voice input with hotkey:', speechHotkey);
    startListening();
  }
}

function stopStreamVoiceInput() {
  if (transcriber && isListening) {
    console.log('Stopping stream voice input');
    stopListening();
  }
}

// Twitch Connection Management
function toggleTwitchConnection() {
  if (isTwitchConnected) {
    disconnectFromTwitch();
  } else {
    connectToTwitch();
  }
}

function connectToTwitch() {
  twitchChannel = document.getElementById('twitchChannel').value.trim();
  if (!twitchChannel) {
    alert('Please enter a Twitch channel name');
    return;
  }
  
  if (twitchSocket) {
    twitchSocket.close();
  }
  
  updateTwitchStatus('Connecting...', 'connecting');
  
  twitchSocket = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
  
  twitchSocket.onopen = () => {
    console.log('Connected to Twitch IRC for channel:', twitchChannel);
    
    // Send authentication (anonymous)
    twitchSocket.send('PASS SCHMOOPIIE');
    twitchSocket.send('NICK justinfan' + Math.floor(Math.random() * 100000));
    twitchSocket.send(`JOIN #${twitchChannel.toLowerCase()}`);
    
    isTwitchConnected = true;
    updateTwitchStatus('Connected', 'connected');
    document.getElementById('twitchConnectBtn').textContent = 'Disconnect';
  };
  
  twitchSocket.onmessage = (event) => {
    const rawMessage = event.data.trim();
    console.log('Twitch Raw:', rawMessage);
    
    handleTwitchMessage(rawMessage);
  };
  
  twitchSocket.onclose = () => {
    console.log('Disconnected from Twitch IRC');
    isTwitchConnected = false;
    updateTwitchStatus('Disconnected', 'disconnected');
    document.getElementById('twitchConnectBtn').textContent = 'Connect to Chat';
  };
  
  twitchSocket.onerror = (error) => {
    console.error('Twitch WebSocket error:', error);
    updateTwitchStatus('Connection Error', 'error');
  };
}

function disconnectFromTwitch() {
  if (twitchSocket) {
    twitchSocket.close();
  }
  isTwitchConnected = false;
  accumulatedMessages = [];
  updateAccumulationProgress();
}

function updateTwitchStatus(status, className) {
  const statusEl = document.getElementById('chatConnectionStatus');
  const twitchStatusEl = document.getElementById('twitchStatus');
  
  if (statusEl) statusEl.textContent = status;
  if (twitchStatusEl) twitchStatusEl.textContent = status;
  
  // Add color coding
  const colors = {
    'connected': '#4ecdc4',
    'connecting': '#ffc107',
    'disconnected': '#6c757d',
    'error': '#dc3545'
  };
  
  if (statusEl && colors[className]) {
    statusEl.style.color = colors[className];
  }
}

// Twitch Message Parsing
function handleTwitchMessage(rawMessage) {
  // Handle PING/PONG
  if (rawMessage.startsWith('PING')) {
    twitchSocket.send('PONG :tmi.twitch.tv');
    return;
  }
  
  // Parse PRIVMSG (chat messages)
  if (rawMessage.includes('PRIVMSG')) {
    const parsed = parseTwitchChatMessage(rawMessage);
    if (parsed) {
      addTwitchChatMessage(parsed.username, parsed.message);
      accumulateMessage(parsed.username, parsed.message);
    }
  }
}

function parseTwitchChatMessage(rawMessage) {
  try {
    // Example: :username!username@username.tmi.twitch.tv PRIVMSG #channel :message text
    const parts = rawMessage.split(' PRIVMSG ');
    if (parts.length !== 2) return null;
    
    // Extract username
    const userMatch = parts[0].match(/:([^!]+)!/);
    if (!userMatch) return null;
    const username = userMatch[1];
    
    // Extract message
    const messageMatch = parts[1].match(/#\w+ :(.*)$/);
    if (!messageMatch) return null;
    const message = messageMatch[1];
    
    return { username, message };
  } catch (error) {
    console.error('Error parsing Twitch message:', error);
    return null;
  }
}

// Chat Display
function addTwitchChatMessage(username, message) {
  const chatContent = document.getElementById('twitchChatContent');
  const chatOverlay = document.getElementById('twitchChatOverlay');
  
  // Don't write to chat if it doesn't exist or if the overlay is hidden
  if (!chatContent || !chatOverlay || chatOverlay.style.display === 'none') {
    return;
  }
  
  // Remove placeholder if exists
  const placeholder = chatContent.querySelector('.chat-placeholder');
  if (placeholder) {
    placeholder.remove();
  }
  
  // Create message element
  const messageEl = document.createElement('div');
  messageEl.className = 'twitch-message';
  
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  messageEl.innerHTML = `
    <div class="message-timestamp">${timestamp}</div>
    <div class="twitch-username">${username}</div>
    <div class="twitch-message-text">${message}</div>
  `;
  
  chatContent.appendChild(messageEl);
  chatContent.scrollTop = chatContent.scrollHeight;
  
  // Keep only last 50 messages
  while (chatContent.children.length > 50) {
    chatContent.removeChild(chatContent.firstChild);
  }
  
  // Update message count
  totalTwitchMessages++;
  const chatMessageCount = document.getElementById('chatMessageCount');
  if (chatMessageCount) {
    chatMessageCount.textContent = `${totalTwitchMessages} messages`;
  }
}

function clearTwitchChat() {
  const chatContent = document.getElementById('twitchChatContent');
  const chatOverlay = document.getElementById('twitchChatOverlay');
  
  // Only clear if chat exists and is visible
  if (chatContent && chatOverlay && chatOverlay.style.display !== 'none') {
    chatContent.innerHTML = '<div class="chat-placeholder">Chat cleared...</div>';
  }
  
  accumulatedMessages = [];
  totalTwitchMessages = 0;
  updateAccumulationProgress();
  document.getElementById('chatMessageCount').textContent = '0 messages';
}


function updateAccumulationProgress() {
  const count = accumulatedMessages.length;
  const target = messageAccumulationTarget;
  const percentage = (count / target) * 100;
  
  document.getElementById('accumulationCount').textContent = count;
  document.getElementById('accumulationTarget').textContent = target;
  document.getElementById('accumulationProgress').style.width = `${Math.min(percentage, 100)}%`;
}

function sendAccumulatedMessagesToAI() {
  if (accumulatedMessages.length === 0) return;
  
  // Format messages for AI
  const chatSummary = accumulatedMessages
    .map(msg => `${msg.username}: ${msg.message}`)
    .join('\n');
  
  const prompt = `Here are recent chat messages from your Twitch viewers:\n\n${chatSummary}\n\nRespond to the chat! Be engaging and acknowledge some of the messages. Keep it conversational and fun!`;
  
  console.log('Sending accumulated messages to AI:', accumulatedMessages.length, 'messages');
  
  // Add to queue with high priority since it's accumulated messages
  addToQueue(prompt, 'twitch', 'Multiple Users', 'high');
  
  // Clear accumulated messages
  accumulatedMessages = [];
  updateAccumulationProgress();
}

// Range input updates
document.addEventListener('DOMContentLoaded', function() {
  // Add range input listener for message accumulation
  const messageAccumulationSlider = document.getElementById('messageAccumulation');
  if (messageAccumulationSlider) {
    messageAccumulationSlider.oninput = function() {
      document.getElementById('messageAccumulationValue').textContent = this.value;
      messageAccumulationTarget = parseInt(this.value);
      document.getElementById('accumulationTarget').textContent = this.value;
      saveTwitchSettings();
    };
  }
});

//ok

// ====================================
// ENHANCED QUEUE SYSTEM FOR STREAM MODE
// ====================================

// Queue system variables
let messageQueue = [];
let localUserQueue = [];
let twitchUserQueue = [];
let currentQueueMode = 'mixed'; // 'mixed', 'twitch-priority', 'local-priority'
let queueProcessingEnabled = true;
let lastResponseSource = null; // Track who was last responded to
let responseHistory = []; // Track recent responses for context

// Queue management functions
function addToQueue(message, source, username = null, priority = 'normal') {
  const queueItem = {
    id: Date.now() + Math.random(),
    message: message,
    source: source, // 'twitch' or 'local'
    username: username,
    priority: priority, // 'high', 'normal', 'low'
    timestamp: new Date(),
    processed: false
  };
  
  // For Twitch messages, check if we have multiple unique users
  if (source === 'twitch') {
    // Get unique users from recent Twitch messages
    const recentTwitchMessages = twitchUserQueue.filter(item => 
      (Date.now() - item.timestamp.getTime()) < 300000 // Last 5 minutes
    );
    const uniqueUsers = new Set(recentTwitchMessages.map(item => item.username));
    
    // Only add if we have multiple users or if it's a high priority message
    if (uniqueUsers.size >= 2 || priority === 'high') {
      twitchUserQueue.push(queueItem);
      messageQueue.push(queueItem);
      console.log(`Added to queue: ${source} - ${message.substring(0, 50)}... (${uniqueUsers.size} unique users)`);
    } else {
      console.log(`Skipped single user message: ${username} - ${message.substring(0, 50)}...`);
      return; // Don't add single user messages
    }
  } else if (source === 'local') {
    // Always add local user messages
    addMessage(message, 'user', userName);
    localUserQueue.push(queueItem);
    messageQueue.push(queueItem);
    console.log(`Added to queue: ${source} - ${message.substring(0, 50)}...`);
  }
  
  updateQueueDisplay();
  
  // Process queue if enabled
  if (queueProcessingEnabled) {
    processQueue();
  }
  
  console.log(`Added to queue: ${source} - ${message}`);
}

function processQueue() {
  if (messageQueue.length === 0 || isProcessingTTS || isTTSPlaying) {
    return;
  }
  
  // Get next message based on queue mode and AI context
  const nextMessage = getNextQueueMessage();
  
  if (nextMessage) {
    // Mark as processed
    nextMessage.processed = true;
    
    // Remove from queues
    messageQueue = messageQueue.filter(item => item.id !== nextMessage.id);
    twitchUserQueue = twitchUserQueue.filter(item => item.id !== nextMessage.id);
    localUserQueue = localUserQueue.filter(item => item.id !== nextMessage.id);
    
    // Add to response history
    responseHistory.push({
      source: nextMessage.source,
      username: nextMessage.username,
      timestamp: new Date(),
      message: nextMessage.message
    });
    
    // Keep only last 10 responses in history
    if (responseHistory.length > 10) {
      responseHistory.shift();
    }
    
    // Update last response source
    lastResponseSource = nextMessage.source;
    
    // Process the message
    processQueuedMessage(nextMessage);
    
    updateQueueDisplay();
    
    console.log(`Processing queue item from ${nextMessage.source}: ${nextMessage.message}`);
  }
}

function getNextQueueMessage() {
  if (messageQueue.length === 0) return null;
  
  // AI context-aware selection
  const contextualChoice = getAIContextualChoice();
  if (contextualChoice) {
    return contextualChoice;
  }
  
  // Fallback to queue mode logic
  switch (currentQueueMode) {
    case 'twitch-priority':
      return twitchUserQueue.length > 0 ? twitchUserQueue[0] : localUserQueue[0];
    case 'local-priority':
      return localUserQueue.length > 0 ? localUserQueue[0] : twitchUserQueue[0];
    case 'mixed':
    default:
      return messageQueue[0]; // First in, first out
  }
}

function getAIContextualChoice() {
  // AI logic to decide who to respond to based on context
  const twitchCount = twitchUserQueue.length;
  const localCount = localUserQueue.length;
  
  // If no messages, return null
  if (twitchCount === 0 && localCount === 0) return null;
  
  // If only one type has messages, choose that
  if (twitchCount === 0) return localUserQueue[0];
  if (localCount === 0) return twitchUserQueue[0];
  
  // Check recent response history for balance
  const recentTwitchResponses = responseHistory.filter(r => r.source === 'twitch').length;
  const recentLocalResponses = responseHistory.filter(r => r.source === 'local').length;
  
  // Prioritize underrepresented source
  if (recentTwitchResponses > recentLocalResponses + 2) {
    return localUserQueue[0];
  } else if (recentLocalResponses > recentTwitchResponses + 2) {
    return twitchUserQueue[0];
  }
  
  // Check for high priority messages
  const highPriorityTwitch = twitchUserQueue.find(item => item.priority === 'high');
  const highPriorityLocal = localUserQueue.find(item => item.priority === 'high');
  
  if (highPriorityTwitch && !highPriorityLocal) return highPriorityTwitch;
  if (highPriorityLocal && !highPriorityTwitch) return highPriorityLocal;
  
  // Default to mixed mode (FIFO)
  return messageQueue[0];
}

function processQueuedMessage(queueItem) {
  let contextualPrompt = '';
  
  // Add context about the message source
  if (queueItem.source === 'twitch') {
    if (queueItem.username === 'Multiple Users') {
      // This is an accumulated message summary - use as-is since it's already formatted
      contextualPrompt = queueItem.message;
    } else {
      contextualPrompt = `[Twitch Chat] ${queueItem.username}: ${queueItem.message}`;
    }
  } else {
    contextualPrompt = `[${userName}]: ${queueItem.message}`;
  }
  
  // Add context about recent activity (skip for accumulated messages)
  if (queueItem.username !== 'Multiple Users' && responseHistory.length > 0) {
    const recentSources = responseHistory.slice(-3).map(r => r.source);
    const sourceBalance = {
      twitch: recentSources.filter(s => s === 'twitch').length,
      local: recentSources.filter(s => s === 'local').length
    };
    
    if (sourceBalance.twitch > sourceBalance.local) {
      contextualPrompt += '\n\n[AI Context: You\'ve been responding more to Twitch chat recently. Consider acknowledging both audiences.]';
    } else if (sourceBalance.local > sourceBalance.twitch) {
      contextualPrompt += `

[AI Context: You've been responding more to ${userName} recently. Consider acknowledging your Twitch viewers too.]`;
    }
  }
  
  // Add queue status context (skip for accumulated messages)
  if (queueItem.username !== 'Multiple Users') {
    const queueStatus = `\n\n[Queue Status: ${twitchUserQueue.length} Twitch messages, ${localUserQueue.length} local messages waiting]`;
    contextualPrompt += queueStatus;
  }
  
  // Send to AI
  sendMessageToAI(contextualPrompt);
}

function updateQueueDisplay() {
  // Update queue indicators if they exist
  const queueIndicator = document.getElementById('queueIndicator');
  if (queueIndicator) {
    const totalMessages = messageQueue.length;
    const twitchMessages = twitchUserQueue.length;
    const localMessages = localUserQueue.length;
    
    queueIndicator.innerHTML = `
      <div class="queue-status">
        <span>Queue: ${totalMessages} total</span>
        <span>📺 ${twitchMessages} | 💬 ${localMessages}</span>
      </div>
    `;
  }
}

function clearQueue() {
  messageQueue = [];
  twitchUserQueue = [];
  localUserQueue = [];
  updateQueueDisplay();
  console.log('Queue cleared');
}

function setQueueMode(mode) {
  currentQueueMode = mode;
  console.log(`Queue mode set to: ${mode}`);
}

function toggleQueueProcessing() {
  queueProcessingEnabled = !queueProcessingEnabled;
  console.log(`Queue processing ${queueProcessingEnabled ? 'enabled' : 'disabled'}`);
  
  if (queueProcessingEnabled) {
    processQueue();
  }
}

// ====================================
// ENHANCED MESSAGE HANDLING
// ====================================

// Message accumulation using queue system
function accumulateMessage(username, message) {
  // Add message to accumulation array
  accumulatedMessages.push({ username, message, timestamp: new Date() });
  updateAccumulationProgress();
  
  // Check if we've reached the target
  if (accumulatedMessages.length >= messageAccumulationTarget) {
    sendAccumulatedMessagesToAI();
  }
}

// Send chat message using queue system
function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Add to queue
  addToQueue(message, 'local', userName, 'normal');
  
  // Clear input
  input.value = '';
};

// ====================================
// UI ENHANCEMENTS
// ====================================

// Add queue controls to the UI
function addQueueControls() {
  const settingsContent = document.querySelector('.settings-content');
  if (!settingsContent) return;
  
  const queueSection = document.createElement('div');
  queueSection.className = 'accordion-section';
  queueSection.innerHTML = `
    <div class="accordion-header" onclick="toggleAccordion('queueSettings')">
      <span>⚡ Queue System</span>
      <span class="accordion-icon">▼</span>
    </div>
    <div class="accordion-content" id="queueSettings">
      <div class="control-group">
        <label>Queue Mode</label>
        <select id="queueMode" onchange="setQueueMode(this.value)">
          <option value="mixed">Mixed (FIFO)</option>
          <option value="twitch-priority">Twitch Priority</option>
          <option value="local-priority">Local Priority</option>
        </select>
      </div>
      <div class="control-group">
        <label>
          <input type="checkbox" id="queueProcessing" checked onchange="toggleQueueProcessing()">
          Enable Queue Processing
        </label>
      </div>
      <div class="control-group">
        <div id="queueIndicator" class="queue-indicator">
          <div class="queue-status">
            <span>Queue: 0 total</span>
            <span>📺 0 | 💬 0</span>
          </div>
        </div>
      </div>
      <div class="control-group">
        <button class="control-btn" onclick="clearQueue()">Clear Queue</button>
      </div>
    </div>
  `;
  
  // Insert after Twitch settings
  const twitchSection = document.querySelector('#twitchSettings').parentElement;
  twitchSection.parentNode.insertBefore(queueSection, twitchSection.nextSibling);
}

// Initialize queue system
document.addEventListener('DOMContentLoaded', function() {
  // Add queue controls to settings
  setTimeout(addQueueControls, 500);
  
  // Initialize queue processing
  setInterval(() => {
    if (queueProcessingEnabled && !isProcessingTTS && !isTTSPlaying) {
      processQueue();
    }
  }, 1000); // Check every 1 second for faster response
});

console.log('Enhanced Queue System loaded successfully!');

// Generic draggable utility function
function makeElementDraggable(element, dragHandle, storageKey) {
    if (!element || !dragHandle) return;

    // Load saved position
    const savedPosition = localStorage.getItem(storageKey);
    if (savedPosition) {
        const { x, y } = JSON.parse(savedPosition);
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.right = 'auto';
        element.style.bottom = 'auto';
    }

    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    dragHandle.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);

    function startDrag(e) {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
        isDragging = true;
        const rect = element.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        element.style.position = 'absolute';
        element.style.zIndex = '1200';
        e.preventDefault();
    }

    function drag(e) {
        if (!isDragging) return;
        const x = e.clientX - dragOffset.x;
        const y = e.clientY - dragOffset.y;
        const maxX = window.innerWidth - element.offsetWidth;
        const maxY = window.innerHeight - element.offsetHeight;
        element.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
        element.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
    }

    function stopDrag() {
        if (!isDragging) return;
        isDragging = false;
        const rect = element.getBoundingClientRect();
        localStorage.setItem(storageKey, JSON.stringify({ x: rect.left, y: rect.top }));
    }
}

// Initialize draggable elements when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    const twitchChatOverlay = document.getElementById('twitchChatOverlay');
    makeElementDraggable(
        twitchChatOverlay,
        twitchChatOverlay?.querySelector('.chat-drag-header'),
        'twitchChatPosition'
    );

    const speechBubbleOverlay = document.getElementById('speechBubbleOverlay');
    makeElementDraggable(
        speechBubbleOverlay,
        speechBubbleOverlay?.querySelector('.chat-drag-header'),
        'speechBubblePosition'
    );
  }, 1000);
});





function showChatbot() {
  // Show the floating chat input
  const floatingChat = document.getElementById('floatingChat');
  if (floatingChat) {
    floatingChat.classList.remove('stream-mode-hidden');
    floatingChat.style.opacity = '1';
    floatingChat.style.pointerEvents = 'auto';
    
    // Focus on the chat input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
      setTimeout(() => chatInput.focus(), 100);
    }
    
    console.log('Chatbot shown via double-click');
  }
}
