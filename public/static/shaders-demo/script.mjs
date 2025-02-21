import * as THREE from "../node_modules/three/build/three.module.js";

/**
 * Image Credits:
 * flare: https://opengameart.org/content/flare-effect-blender
 * smoke: https://opengameart.org/content/smoke-aura
 */

let clock = new THREE.Clock(); // keep track of time
let delta = 0; // will store getDelta value (amount of time passed since clock updated)
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1, // near
  1500 // far
);

camera.position.z = 1000; // set camera position on z-axis

// SCENE
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x09043d);
// scene.fog = new THREE.FogExp2(0x000000, 0.00025);
scene.fog = new THREE.FogExp2(0xc0f0ff, 0.0015); // color, near

// RENDERER
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Light - no shadows
const light = new THREE.HemisphereLight(0xd6e6ff, 0xa38c08, 1);
scene.add(light);

// const controls = new OrbitControls(camera, renderer.domElement);

const smokeTexture = new THREE.TextureLoader().load("smoke.png");

// smokeTexture.encoding = THREE.sRGBEncoding;
const smokeGeometry  = new THREE.PlaneGeometry(300,300);
// MeshLambert good for non-shiny materials
const smokeMaterial = new THREE.MeshLambertMaterial({
  map: smokeTexture,
  emissive: 0x222222, // emissive light of material
  opacity: 0.15, // less will look like less smoke, high inverse
  transparent: true
});

let smokeParticles = [];

for (let i=0; i<90; i++){
  let smokeElement = new THREE.Mesh(smokeGeometry, smokeMaterial);
  smokeElement.scale.set(2,2,2); // set scale x,y, z to double

  // position smoke textures at random x,y,z positions
  smokeElement.position.set(Math.random()*1000-500, Math.random()*1000-500, Math.random()*1000-100);
  // set smoke texture rotations to random amounts on z axis
  smokeElement.rotation.z = Math.random() * 360;

  scene.add(smokeElement);
  smokeParticles.push(smokeElement);
}

window.addEventListener('resize', onWindowResize);
animate();

function animate() {
  requestAnimationFrame(animate);
  delta = clock.getDelta();

  // go through all smoke textures and rotate them
  for (let i=0; i<smokeParticles.length; i++){
    smokeParticles[i].rotation.z += (delta*0.12);
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  console.log('window resized');
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
