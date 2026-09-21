import * as THREE from 'three/webgpu';

import {
    step,
    normalWorldGeometry,
    output,
    texture,
    vec3,
    vec4,
    normalize,
    positionWorld,
    bumpMap,
    cameraPosition,
    color,
    uniform,
    mix,
    uv,
    max
} from 'three/tsl';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * THREE.MathUtils.DEG2RAD;
    const theta = (lon + 180) * THREE.MathUtils.DEG2RAD;

    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
         radius * Math.cos(phi),
         radius * Math.sin(phi) * Math.sin(theta)
    );
}


export class Globe {

    constructor() {

        this.timer = new THREE.Timer();
        this.timer.connect(document);

        this.camera = 
			new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);

        this.camera.position.set(4.5, 2, 3);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        this.globe = null;
        this.sphereGeometry = null;
        this.renderer = null;
        this.controls = null;

        this.flyToActive = false;
        this.flyToTargetQuaternion = new THREE.Quaternion();
        this.flyToSpeed = 4.0;
        this.locationMarker = null;
    }

    start() {

        // Uniforms
        this.atmosphereDayColor = uniform(color('#10135b'));
        this.atmosphereTwilightColor = uniform(color('#06254d'));
        this.roughnessLow = uniform(0.25);
        this.roughnessHigh = uniform(0.35);


        // Textures
        const textureLoader = new THREE.TextureLoader();
        this.nightTexture = textureLoader.load('./assets/earth_lights_2048.png');
        this.nightTexture.colorSpace = THREE.SRGBColorSpace;
        this.nightTexture.anisotropy = 8;


        this.bumpRoughnessCloudsTexture =
            textureLoader.load('./assets/earth_bump_roughness_clouds_4096.jpg');
        this.bumpRoughnessCloudsTexture.anisotropy = 8;


        // Fresnel
        const viewDirection = positionWorld.sub(cameraPosition).normalize();
        this.fresnel =
            viewDirection.dot(normalWorldGeometry).abs().oneMinus().toVar();

        // Atmosphere color
        this.atmosphereColor =
            mix(this.atmosphereTwilightColor, this.atmosphereDayColor);

        // Globe
        const globeMaterial = new THREE.MeshStandardNodeMaterial();
        const cloudsStrength =
            texture(this.bumpRoughnessCloudsTexture, uv()).b.smoothstep(0.2, 1);
        const cloudColor = vec3(0.15, 0.35, 0.18);


        globeMaterial.colorNode =
            mix(texture(this.dayTexture), cloudColor, cloudsStrength.mul(0.1));

        const roughness =
            max(texture(this.bumpRoughnessCloudsTexture).g, step(0.01, cloudsStrength));

        globeMaterial.roughnessNode =
            roughness.remap(0, 1, this.roughnessLow, this.roughnessHigh);

        const night = texture(this.nightTexture);
        globeMaterial.outputNode = vec4(night.rgb, output.a);

        const bumpElevation =
            max(texture(this.bumpRoughnessCloudsTexture).r, cloudsStrength.mul(0.1));
        globeMaterial.normalNode = bumpMap(bumpElevation);


        this.sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
        this.globe = new THREE.Mesh(this.sphereGeometry, globeMaterial);
        this.scene.add(this.globe);

        // Atmosphere
        const atmosphereMaterial =
            new THREE.MeshBasicNodeMaterial({side: THREE.BackSide, transparent: true});

        let alpha = this.fresnel.remap(0.73, 1, 1, 0).pow(3);
        atmosphereMaterial.outputNode =vec4(this.atmosphereColor, alpha);
        const atmosphere =new THREE.Mesh(this.sphereGeometry, atmosphereMaterial);
        atmosphere.scale.setScalar(1.04);
        this.scene.add(atmosphere);
    }


    render(container) {
        this.renderer = new THREE.WebGPURenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop(() => this.animate());
        // document.body.appendChild(this.renderer.domElement);

        container.appendChild(this.renderer.domElement);
    }


    orbitControl() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.minDistance = 0.1;
        this.controls.maxDistance = 50;
    }


    addEvent() {
        window.addEventListener('resize', () => this.onWindowResize());
    }


    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }


    addMarker(lon, lat, status) {

        let markerColor;

        switch (status) {
            case "ACTIVE":
                markerColor = 0x18c52b;
                break;
            case "IDLE":
                markerColor = 0xd0dccc;
                break;
            case "OFFLINE":
                markerColor = 0xd52b2b;
                break;
            default:
                throw new Error(`Unknown marker status: ${status}`);
        }

		const group = new THREE.Group();

		// Core
		const coreGeometry = new THREE.SphereGeometry(0.009, 16, 16);
		const coreMaterial = new THREE.MeshBasicMaterial({color: markerColor});
		const core = new THREE.Mesh(coreGeometry, coreMaterial);
		group.add(core);


		// Ring
		const ringGeometry = new THREE.RingGeometry(0.015, 0.011, 32);
		const ringMaterial = new THREE.MeshBasicMaterial({
		    color: markerColor, transparent: true, opacity: 0.7, side: THREE.DoubleSide
		});
		const ring = new THREE.Mesh(ringGeometry, ringMaterial);
		group.add(ring);
        
        group.position.copy(latLonToVector3(lat, lon, 1.06));
        this.globe.add(group);        
		return group;
    }


    animate() {
        this.timer.update();
        const delta = this.timer.getDelta();

        if (this.flyToActive) {
            const step = Math.min(delta * this.flyToSpeed, 1);
            this.globe.quaternion.slerp(this.flyToTargetQuaternion, step);
            if (this.globe.quaternion.angleTo(this.flyToTargetQuaternion) < 0.001) {
                this.globe.quaternion.copy(this.flyToTargetQuaternion);
                this.flyToActive = false;
            }
        } else {
            this.globe.rotation.y += delta * 0.025;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    flyTo(lon, lat) {

        if (!this.globe) {
            return;
        }

        const targetLocal = latLonToVector3(lat, lon, 1);
        
        /*
         * Where is the target currently pointing in world space?
         *
         * targetLocal = coordinate on the Earth
         * globe.quaternion = Earth's current orientation
         */
        const targetWorld =
            targetLocal.clone().applyQuaternion(this.globe.quaternion).normalize();

        /*
         * Direction from the center of the globe toward
         * the camera.
         *
         * Camera itself does NOT move.
         */
        const cameraDirection = this.camera.position.clone().normalize();
    
        // Find the shortest rotation that moves: targetWorld → cameraDirection
        const correction =
            new THREE.Quaternion().setFromUnitVectors(targetWorld, cameraDirection);

        // Apply that correction to the globe's CURRENT orientation.
        this.flyToTargetQuaternion = correction.multiply(this.globe.quaternion.clone());
        this.flyToActive = true;

        // create the searched-location ring.
        if (this.locationMarker) {
            this.globe.remove(this.locationMarker);
        }

        const geometry = new THREE.RingGeometry(0.015, 0.020, 32);
        const material =
            new THREE.MeshBasicMaterial({color: 0x58cef2, side: THREE.DoubleSide, transparent: true, opacity: 0.95});

        this.locationMarker = new THREE.Mesh(geometry, material);
        this.locationMarker.position.copy(latLonToVector3(lat, lon, 1.06));

        // Make the ring face outward from the Earth.
        this.locationMarker.lookAt(this.locationMarker.position.clone().multiplyScalar(2));

        // rotate with Earth
        this.globe.add(this.locationMarker);
    }
}