import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Weather } from './Weather.js';
import { createGUI } from './gui.js';

async function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111122);
    scene.fog = new THREE.Fog(scene.background, 1, 40);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 3, 12);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // prevent camera from going below ground
    controls.minDistance = 2;
    controls.maxDistance = 50;
    controls.update();

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8, metalness: 0.2 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Some objects
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.5 });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(0, 1, 0);
    scene.add(box);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x666688, 2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 10, 5);
    scene.add(pointLight);

    // Fetch shaders and initialize weather
    const vertexShader = await fetch('./rain.vert').then(res => res.text());
    const fragmentShader = await fetch('./rain.frag').then(res => res.text());  
    
    const weather = new Weather({ scene, vertexShader, fragmentShader });
    
    // GUI
    createGUI(weather);

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const deltaTime = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();
        
        weather.update(deltaTime, elapsedTime);
        controls.update();

        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize);

    animate();
}

main().catch(err => {
    console.error(err);
});