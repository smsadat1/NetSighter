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

    	this.camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
    	this.camera.position.set(4.5, 2, 3);

	    this.scene = new THREE.Scene();
	    this.scene.background = new THREE.Color(0x000000);
	}

	prepare_sun() {
	    const sun = new THREE.DirectionalLight('#ffffff', 2);
	    sun.position.set(0, 0, 3);
	    this.scene.add(sun);
	    this.sunOrientation =
	        normalWorldGeometry.dot(normalize(sun.position)).toVar();
	}

	prepare_atmos() {
    	
		this.atmosphereDayColor = uniform(color('#18c52ce6'));
    	this.atmosphereTwilightColor = uniform(color('#064d12'));
		this.roughnessLow = uniform( 0.25 );
		this.roughnessHigh = uniform( 0.35 );

		const textureLoader = new THREE.TextureLoader();
		this.dayTexture = textureLoader.load( './assets/earth_day_4096.jpg' );
		this.dayTexture.colorSpace = THREE.SRGBColorSpace;
		this.dayTexture.anisotropy = 8;

		this.nightTexture = textureLoader.load( './assets/earth_night_4096.jpg' );
		this.nightTexture.colorSpace = THREE.SRGBColorSpace;
		this.nightTexture.anisotropy = 8;
		this.bumpRoughnessCloudsTexture = textureLoader.load( './assets/earth_bump_roughness_clouds_4096.jpg' );
		this.bumpRoughnessCloudsTexture.anisotropy = 8;

    	this.fresnel =
    	    positionWorld
    	        .sub(cameraPosition)
    	        .normalize()
    	        .dot(normalWorldGeometry)
    	        .abs()
    	        .oneMinus()
    	        .toVar();

    	this.atmosphereColor = mix(
    	    this.atmosphereTwilightColor,
    	    this.atmosphereDayColor,
    	    this.sunOrientation.smoothstep(-0.25, 0.75)
	    );
	}

	start_atmos() {
    	const atmosphereMaterial =
        	new THREE.MeshBasicNodeMaterial({side: THREE.BackSide, transparent: true});

    	let alpha = this.fresnel.remap(0.73, 1, 1, 0).pow(3);
    	alpha = alpha.mul(this.sunOrientation.smoothstep(-0.5, 1));

    	atmosphereMaterial.outputNode = vec4(this.atmosphereColor, alpha);

    	const atmosphere = new THREE.Mesh(this.sphereGeometry, atmosphereMaterial);
    	atmosphere.scale.setScalar(1.04);

	    this.scene.add(atmosphere);
	}

	prepare_globe() {
    	const globeMaterial = new THREE.MeshStandardNodeMaterial();
    	const cloudsStrength = texture(this.bumpRoughnessCloudsTexture, uv()).b.smoothstep(0.2, 1);

    	globeMaterial.colorNode = mix(texture(this.dayTexture), vec3(1), cloudsStrength.mul(1));

    	const roughness = max(texture(this.bumpRoughnessCloudsTexture).g, step(0.01, cloudsStrength));

    	globeMaterial.roughnessNode = roughness.remap(0, 1, this.roughnessLow, this.roughnessHigh);

   	 	const night = texture(this.nightTexture);
   	 	const dayStrength = this.sunOrientation.smoothstep(-0.25, 0.5);
    	const atmosphereDayStrength = this.sunOrientation.smoothstep(-0.5, 2);

    	const atmosphereMix =
    	    atmosphereDayStrength.mul(this.fresnel.pow(2)).clamp(0, 1);

   	 	let finalOutput = mix(night.rgb, output.rgb, dayStrength);
    	finalOutput = mix(finalOutput, this.atmosphereColor, atmosphereMix);

    	globeMaterial.outputNode = vec4(finalOutput, output.a);

    	const bumpElevation = max(texture(this.bumpRoughnessCloudsTexture).r, cloudsStrength);

    	globeMaterial.normalNode = bumpMap(bumpElevation);

    	this.sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
    	this.globe = new THREE.Mesh(this.sphereGeometry, globeMaterial);
	    this.scene.add(this.globe);
	}

	start() {
		this.prepare_sun();
		this.prepare_atmos();
		this.prepare_globe();
		this.start_atmos();
	}

	render() {
	    this.renderer = new THREE.WebGPURenderer();
    	this.renderer.setPixelRatio(window.devicePixelRatio);
    	this.renderer.setSize(window.innerWidth, window.innerHeight);
    	this.renderer.setAnimationLoop(() => this.animate());

	    document.body.appendChild(this.renderer.domElement);
	}

	orbitControl() {
	    this.controls = new OrbitControls(
	        this.camera,
	        this.renderer.domElement
	    );

	    this.controls.enableDamping = true;
	    this.controls.minDistance = 0.1;
	    this.controls.maxDistance = 50;
	}

	addEvent() {
    	window.addEventListener('resize', () => this.onWindowResize());

    	gui
    	    .addColor(
    	        {
    	            color: this.atmosphereDayColor.value.getHex(
    	                THREE.SRGBColorSpace
    	            )
    	        },
    	        'color'
    	    )
    	    .onChange((value) => {
    	        this.atmosphereDayColor.value.set(value);
    	    })
    	    .name('atmosphereDayColor');

    	gui
    	    .addColor(
    	        {
    	            color: this.atmosphereTwilightColor.value.getHex(
    	                THREE.SRGBColorSpace
    	            )
    	        },
    	        'color'
    	    )
    	    .onChange((value) => {
    	        this.atmosphereTwilightColor.value.set(value);
    	    })
    	    .name('atmosphereTwilightColor');

    	gui
    	    .add(this.roughnessLow, 'value', 0, 1, 0.001)
    	    .name('roughnessLow');

    	gui
    	    .add(this.roughnessHigh, 'value', 0, 1, 0.001)
    	    .name('roughnessHigh');
	}	

	onWindowResize() {
    	this.camera.aspect = window.innerWidth / window.innerHeight;
    	this.camera.updateProjectionMatrix();
	    this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	async animate() {
	    this.timer.update();

	    const delta = this.timer.getDelta();

	    this.globe.rotation.y += delta * 0.025;
	    this.controls.update();
	    this.renderer.render(this.scene, this.camera);
	}

	addMarker(lon, lat, status) {
    	let color;

    	switch (status) {
    	    case "ACTIVE":
    	        color = 0x18c52b;
    	        break;

    	    case "IDLE":
    	        color = 0x666666;
    	        break;

    	    case "OFFLINE":
    	        color = 0xd52b2b;
    	        break;

    	    default:
    	        throw new Error(`Unknown marker status: ${status}`);
    	}

    	const geometry = new THREE.SphereGeometry(0.025, 12, 12);
    	const material = new THREE.MeshBasicMaterial({ color });
    	const marker = new THREE.Mesh(geometry, material);
    	marker.position.copy(latLonToVector3(lat, lon, 1.02));
    	this.scene.add(marker);
    	return marker;
	}
}
