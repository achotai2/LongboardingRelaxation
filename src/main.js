import * as THREE from 'three';
import { DeviceOrientationControls } from "./DeviceOrientationControls.js";

// Setup basic Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);

// Create video element
const video = document.createElement('video');
video.src = '/sample.mp4'; // We'll put our video in public/
video.loop = true;
video.muted = true; // Important for autoplay on some browsers, maybe change later if sound needed
video.crossOrigin = 'anonymous';
video.playsInline = true; // Required for iOS

// Create video texture
const texture = new THREE.VideoTexture(video);
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.format = THREE.RGBAFormat;

// Create sphere geometry to map video onto
// Scale X by -1 to put video inside the sphere so we can look around from the center
const geometry = new THREE.SphereGeometry(500, 60, 40);
geometry.scale(-1, 1, 1);

const material = new THREE.MeshBasicMaterial({ map: texture });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

let controls;

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Setup device orientation controls after user interaction (required by browsers)
const startButton = document.getElementById('start-button');
startButton.addEventListener('click', () => {
    // Hide button
    startButton.style.display = 'none';

    // Request permissions for device orientation if needed (iOS 13+)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    initControlsAndPlay();
                } else {
                    console.error('Permission to access device orientation was denied');
                    // Fallback to touch controls here if desired
                }
            })
            .catch(console.error);
    } else {
        // Non iOS 13+ devices
        initControlsAndPlay();
    }
});

function initControlsAndPlay() {
    controls = new DeviceOrientationControls(camera);
    video.play();

    // Attempt to unmute if we muted earlier for autoplay, requires user interaction which we just got
    video.muted = false;

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    if (controls) {
        controls.update();
    }

    renderer.render(scene, camera);
}
