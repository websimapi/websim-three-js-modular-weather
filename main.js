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

        const weather = new Weather({ vertexShader, fragmentShader });

        window.addEventListener('message', (event) => {
            // A basic security check for the message origin could be added here
            // if (event.origin !== 'https://expected-parent-origin.com') return;

            if (event.data === 'get-weather-data') {
                const payload = {
                    params: weather.params,
                    vertexShader: weather.vertexShader,
                    fragmentShader: weather.fragmentShader,
                    attributes: {
                        position: weather.points.geometry.attributes.position.array,
                        aRandom: weather.points.geometry.attributes.aRandom.array,
                    }
                };

                event.source.postMessage({ type: 'weather-data', payload }, event.origin);
            }
        }, false);

    } else {
        // This is the core application, which will embed the module
        const { runApp } = await import('./app.js');
        runApp();
    }
}

main().catch(err => {
    console.error(err);
});