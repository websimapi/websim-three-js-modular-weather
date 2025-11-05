import * as THREE from 'three';

export class Weather {
    constructor(options) {
        this.scene = options.scene;
        this.vertexShader = options.vertexShader;
        this.fragmentShader = options.fragmentShader;

        this.params = {
            count: 10000,
            size: 0.1,
            speed: 5.0,
            wind: 1.0,
            height: 15.0,
            area: 30.0,
            color: '#ffffff',
            enabled: true,
        };

        this.points = null; // Expose points object

        this.init();
    }

    init() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.params.count * 3);
        const randoms = new Float32Array(this.params.count);

        for (let i = 0; i < this.params.count; i++) {
            positions[i * 3 + 0] = (Math.random() - 0.5) * this.params.area; // x
            positions[i * 3 + 1] = Math.random() * this.params.height;        // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * this.params.area; // z
            randoms[i] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

        this.material = new THREE.ShaderMaterial({
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            uniforms: {
                uTime: { value: 0.0 },
                uSize: { value: this.params.size },
                uSpeed: { value: this.params.speed },
                uWind: { value: this.params.wind },
                uHeight: { value: this.params.height },
                uColor: { value: new THREE.Color(this.params.color) },
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        this.points = new THREE.Points(geometry, this.material);
        if (this.scene) {
            this.scene.add(this.points);
        }
        this.updateVisibility();
    }

    update(deltaTime, elapsedTime) {
        if (this.material && this.params.enabled) {
            this.material.uniforms.uTime.value = elapsedTime;
        }
    }

    updateParams() {
        if (!this.material) return;
        this.material.uniforms.uSize.value = this.params.size;
        this.material.uniforms.uSpeed.value = this.params.speed;
        this.material.uniforms.uWind.value = this.params.wind;
        this.material.uniforms.uHeight.value = this.params.height;
        this.material.uniforms.uColor.value.set(this.params.color);
        this.updateVisibility();
        // Note: Count and Area require re-creating the geometry, which is more involved.
        // For this example, we'll stick to uniform-based parameters.
    }

    updateVisibility() {
        if (this.points) {
            this.points.visible = this.params.enabled;
        }
    }
}