import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.20/+esm';

const scene = new THREE.Scene();
// Light - no shadows
// const light = new THREE.HemisphereLight(0xd6e6ff, 0xa38c08, 1);
// const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White light, intensity 1
directionalLight.position.set(5, 5, 5); // Position the light
scene.add(directionalLight);

// GUI for light controls
const gui = new GUI();
const lightFolder = gui.addFolder('Lights');
lightFolder.add(ambientLight, 'intensity', 0, 2).name('Ambient Intensity');
lightFolder.addColor(ambientLight, 'color').name('Ambient Color');
lightFolder.add(directionalLight, 'intensity', 0, 2).name('Directional Intensity');
lightFolder.addColor(directionalLight, 'color').name('Directional Color');
lightFolder.add(directionalLight.position, 'x', -10, 10).name('Directional X');
lightFolder.add(directionalLight.position, 'y', -10, 10).name('Directional Y');
lightFolder.add(directionalLight.position, 'z', -10, 10).name('Directional Z');
lightFolder.open();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement); // Initialize controls
controls.enableDamping = true; // Optional, adds damping for smoother interaction
controls.dampingFactor = 0.05;

// Instantiate a loader
const loader = new GLTFLoader();

// Load a glTF resource
loader.load(
  // resource URL
  'crate.glb', // Replace with your model's path

  // called when the resource is loaded
  function (gltf) {
    scene.add(gltf.scene);

    // Optional: Add animations if your model has them
    // if (gltf.animations && gltf.animations.length > 0) {
    //   const mixer = new THREE.AnimationMixer(gltf.scene);
    //   gltf.animations.forEach((clip) => {
    //     mixer.clipAction(clip).play();
    //   });
    //
    //   // Add mixer to your animation loop
    //   function animate() {
    //     requestAnimationFrame(animate);
    //     mixer.update(0.01); // Update the animation mixer
    //     renderer.render(scene, camera);
    //   }
    //   animate();
    // } else {
    //   // If no animations, just render the scene.
    //   function animate() {
    //     requestAnimationFrame(animate);
    //     renderer.render(scene, camera);
    //   }
    //   animate();
    // }
  },

  // called while loading is progressing
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },

  // called when loading has errors
  function (error) {
    console.error('An error happened', error);
  }
);

// Basic render loop if you don't use animations.
if(!scene.getObjectByName('scene')){ //check if the model has already been loaded, if so, the animation loop takes over.
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);
