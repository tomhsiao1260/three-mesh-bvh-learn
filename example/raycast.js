import Stats from "stats.js";
import * as dat from "three/examples/jsm/libs/lil-gui.module.min.js";
import * as THREE from "three";

const bgColor = 0x263238 / 2;

let renderer, scene, stats, camera;
let geometry, material, containerObj;

init();
updateFromOptions();
render();

function init() {
	// renderer setup
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(bgColor, 1);
	document.body.appendChild(renderer.domElement);

	// scene setup
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0x263238 / 2, 20, 60);

	const light = new THREE.DirectionalLight(0xffffff, 0.5);
	light.position.set(1, 1, 1);
	scene.add(light);
	scene.add(new THREE.AmbientLight(0xffffff, 0.4));

	containerObj = new THREE.Object3D();
	geometry = new THREE.SphereGeometry(1.5, 32, 16);
	material = new THREE.MeshPhongMaterial({ color: 0xe91e63 });
	containerObj.scale.multiplyScalar(10);
	containerObj.rotation.x = 10.989999999999943;
	containerObj.rotation.y = 10.989999999999943;
	scene.add(containerObj);

	// camera setup
	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		50
	);
	camera.position.z = 40;
	camera.far = 100;
	camera.updateProjectionMatrix();

	// stats setup
	stats = new Stats();
	document.body.appendChild(stats.dom);

	// Run
	const gui = new dat.GUI();

	window.addEventListener(
		"resize",
		function () {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize(window.innerWidth, window.innerHeight);
		},
		false
	);
}

function addKnot() {
	const mesh = new THREE.Mesh(geometry, material);
	mesh.rotation.x = Math.random() * 10;
	mesh.rotation.y = Math.random() * 10;
	containerObj.add(mesh);
}

function updateFromOptions() {
	addKnot();
}

function render() {
	stats.begin();

	renderer.render(scene, camera);

	stats.end();

	requestAnimationFrame(render);
}
