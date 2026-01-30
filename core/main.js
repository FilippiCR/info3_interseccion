import * as THREE from 'https://unpkg.com/three@0.182.0/build/three.module.js';
import { SceneManager } from './SceneManager.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Luz básica (ambiente + direccional)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// Posición inicial de la cámara
camera.position.set(0, 15, 20);
camera.lookAt(0, 0, 0);

const sceneManager = new SceneManager(scene);

function animate() {
    requestAnimationFrame(animate);
    sceneManager.update();
    renderer.render(scene, camera);
}

// Ajuste de cámara y render al redimensionar la ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
