import * as THREE from 'three';
import { DeviceOrientationControls } from "./DeviceOrientationControls.js";
import { CONFIG } from "./config.js";

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
const camera = new THREE.PerspectiveCamera(CONFIG.baseZoom, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.outputColorSpace = THREE.SRGBColorSpace;
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
texture.colorSpace = THREE.SRGBColorSpace;

// Create sphere geometry to map video onto
// Scale X by -1 to put video inside the sphere so we can look around from the center
const geometry = new THREE.SphereGeometry(500, 60, 40);
geometry.scale(-1, 1, 1);

const material = new THREE.MeshBasicMaterial({ map: texture });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

let controls;

// Player circle state and swipe logic
let circleX = window.innerWidth / 2;
let circleVelocity = 0;
let lastTouchX = 0;
let lastTouchTime = 0;
const playerCircleEl = document.getElementById('player-circle');

window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
        lastTouchX = e.touches[0].clientX;
        lastTouchTime = performance.now();
        circleVelocity = 0; // Stop momentum on new touch
    }
}, { passive: true });

window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        const currentTouchX = e.touches[0].clientX;
        const currentTime = performance.now();

        const deltaX = currentTouchX - lastTouchX;
        const deltaTime = currentTime - lastTouchTime;

        // Update circle position directly while dragging
        circleX += deltaX;

        // Calculate velocity (pixels per ms)
        if (deltaTime > 0) {
             // scale up a bit for momentum effect later
             circleVelocity = (deltaX / deltaTime) * 10;
        }

        lastTouchX = currentTouchX;
        lastTouchTime = currentTime;
    }
}, { passive: true });

window.addEventListener('touchend', (e) => {
    // When touch ends, velocity is left at whatever it was during the last move,
    // which gives it momentum.
}, { passive: true });

// Mouse fallback for testing on desktop
let isMouseDown = false;
window.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    lastTouchX = e.clientX;
    lastTouchTime = performance.now();
    circleVelocity = 0;
});
window.addEventListener('mousemove', (e) => {
    if (isMouseDown) {
        const currentTouchX = e.clientX;
        const currentTime = performance.now();

        const deltaX = currentTouchX - lastTouchX;
        const deltaTime = currentTime - lastTouchTime;

        circleX += deltaX;

        if (deltaTime > 0) {
             circleVelocity = (deltaX / deltaTime) * 10;
        }

        lastTouchX = currentTouchX;
        lastTouchTime = currentTime;
    }
});
window.addEventListener('mouseup', () => {
    isMouseDown = false;
});


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

        const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
        const lookFactor = Math.abs(Math.sin(euler.y));
        camera.fov = CONFIG.baseZoom + (CONFIG.zoomChangeOnLookAround * lookFactor);
        camera.updateProjectionMatrix();
    }

    // Apply momentum and friction to circle
    if (Math.abs(circleVelocity) > 0.1) {
        circleX += circleVelocity;
        circleVelocity *= 0.95; // Friction
    } else {
        circleVelocity = 0;
    }

    // Clamp to screen bounds
    const circleRadius = 25; // 50px width/height / 2
    if (circleX < circleRadius) {
        circleX = circleRadius;
        circleVelocity = 0; // stop at edge
    } else if (circleX > window.innerWidth - circleRadius) {
        circleX = window.innerWidth - circleRadius;
        circleVelocity = 0; // stop at edge
    }

    // Update DOM
    if (playerCircleEl) {
        playerCircleEl.style.left = `${circleX}px`;
    }

    renderer.render(scene, camera);
}
