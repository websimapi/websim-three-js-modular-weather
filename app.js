import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createGUI } from './gui.js';

export async function runApp() {
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

    // --- Weather Module Integration ---
    const iframe = document.createElement('iframe');
    iframe.src = '/?embed=true'; // Use relative path for same-origin in dev, will be cross-origin in production
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    let weatherEffect = null;

    iframe.onload = () => {
        // Use postMessage for secure cross-origin communication
        iframe.contentWindow.postMessage('get-weather-data', '*');
    };

    window.addEventListener('message', (event) => {
        // Basic security: check origin if known, or message type
        if (event.source !== iframe.contentWindow || event.data.type !== 'weather-data') {
            return;
        }

        const data = event.data.payload;

        // Reconstruct the weather effect in the main scene
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(data.attributes.position, 3));
        geometry.setAttribute('aRandom', new THREE.BufferAttribute(data.attributes.aRandom, 1));

        const material = new THREE.ShaderMaterial({
            vertexShader: data.vertexShader,
            fragmentShader: data.fragmentShader,
            uniforms: {
                uTime: { value: 0.0 },
                uSize: { value: data.params.size },
                uSpeed: { value: data.params.speed },
                uWind: { value: data.params.wind },
                uHeight: { value: data.params.height },
                uColor: { value: new THREE.Color(data.params.color) },
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        weatherEffect = {
            points,
            material,
            params: data.params,
            update: (deltaTime, elapsedTime) => {
                if (points.visible) {
                    material.uniforms.uTime.value = elapsedTime;
                }
            },
            updateParams: () => {
                material.uniforms.uSize.value = data.params.size;
                material.uniforms.uSpeed.value = data.params.speed;
                material.uniforms.uWind.value = data.params.wind;
                material.uniforms.uColor.value.set(data.params.color);
                points.visible = data.params.enabled;
            }
        };

        // Create GUI to control the weather module from the core app
        createGUI(weatherEffect);
        console.log("Weather module loaded successfully from iframe.");
    }, false);


    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const deltaTime = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();

        // Update the weather module if it has been loaded
        if (weatherEffect) {
            weatherEffect.update(deltaTime, elapsedTime);
        }

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