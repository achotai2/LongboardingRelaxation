import * as THREE from 'three';
import { DeviceOrientationControls } from "./DeviceOrientationControls.js";

// Logging infrastructure
const logMessages = [];

function addLog(message) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}`;
    logMessages.push(formattedMessage);
    console.log(formattedMessage);
}

// Download log button setup
const downloadButton = document.getElementById('download-log-button');
if (downloadButton) {
    downloadButton.addEventListener('click', () => {
        const logContent = logMessages.join('\n');
        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '360_video_log.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// Setup basic Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);

// Create video element
const video = document.createElement('video');
video.src = import.meta.env.BASE_URL + 'Videos/360Video1.mp4'; // We'll put our video in public/
video.loop = true;
video.muted = true; // Important for autoplay on some browsers, maybe change later if sound needed
video.crossOrigin = 'anonymous';
video.playsInline = true; // Required for iOS

// Instrument video element events
video.addEventListener('loadstart', () => addLog('Video event: loadstart'));
video.addEventListener('loadedmetadata', () => addLog('Video event: loadedmetadata'));
video.addEventListener('loadeddata', () => addLog('Video event: loadeddata'));
video.addEventListener('canplay', () => addLog('Video event: canplay'));
video.addEventListener('canplaythrough', () => addLog('Video event: canplaythrough'));
video.addEventListener('playing', () => addLog('Video event: playing'));
video.addEventListener('waiting', () => addLog('Video event: waiting'));
video.addEventListener('stalled', () => addLog('Video event: stalled'));
video.addEventListener('suspend', () => addLog('Video event: suspend'));
video.addEventListener('error', (e) => {
    const errorMsg = video.error ? `code ${video.error.code}: ${video.error.message}` : 'unknown error';
    addLog(`Video event: error - ${errorMsg}`);
});
video.addEventListener('abort', () => addLog('Video event: abort'));

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
    addLog('Start button clicked.');

    // Hide button
    startButton.style.display = 'none';
    addLog('Start button hidden.');

    // iOS and other strict browsers require media playback and unmuting to be synchronous within the user interaction event
    addLog('Attempting to play video...');
    const playPromise = video.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            addLog('Video playback started successfully.');
        }).catch((error) => {
            addLog(`Video playback failed: ${error.name} - ${error.message}`);
        });
    } else {
        addLog('video.play() did not return a Promise (older browser).');
    }

    addLog('Unmuting video...');
    video.muted = false;

    // DeviceOrientationControls requests permission internally, but we must instantiate it synchronously
    addLog('Instantiating DeviceOrientationControls...');
    try {
        controls = new DeviceOrientationControls(camera);
        addLog('DeviceOrientationControls instantiated successfully.');
    } catch (error) {
        addLog(`Error instantiating DeviceOrientationControls: ${error.message}`);
    }

    addLog('Starting animation loop...');
    animate();
});

function animate() {
    requestAnimationFrame(animate);

    if (controls) {
        controls.update();
    }

    renderer.render(scene, camera);
}
