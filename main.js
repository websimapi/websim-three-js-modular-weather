import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Weather } from './Weather.js';
import { createGUI } from './gui.js';

async function main() {
    const urlParams = new URLSearchParams(window.location.search);
    const isEmbed = urlParams.get('embed') === 'true';

    if (isEmbed) {
        // This is the iframe/embeddable part
        const { Weather } = await import('./Weather.js');
        const vertexShader = await fetch('./rain.vert').then(res => res.text());
        const fragmentShader = await fetch('./rain.frag').then(res => res.text());
        
        // Don't attach to a scene, just prepare the instance
        const weather = new Weather({ vertexShader, fragmentShader });

        // Expose the instance for the parent window to consume
        window.weather = weather;
    } else {
        // This is the core application, which will embed the module
        const { runApp } = await import('./app.js');
        runApp();
    }
}

main().catch(err => {
    console.error(err);
});