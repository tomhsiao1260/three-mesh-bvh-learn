import Stats from "stats.js";
import * as dat from "three/examples/jsm/libs/lil-gui.module.min.js";
import * as THREE from "three";
import { computeBoundsTree, disposeBoundsTree, MeshBVHHelper } from "..";

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

const bgColor = 0x263238 / 2;

let renderer, scene, stats, camera;
let geometry, material, boundsViz, containerObj;
const knots = [];

// Delta timer
let lastFrameTime = null;
let deltaTime = 0;

const params = {
	mesh: {
		speed: 1,
	},
};

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
	geometry = new THREE.PlaneGeometry(2, 2, 4, 4);
	material = new THREE.MeshPhongMaterial({
		color: 0xe91e63,
		side: THREE.FrontSide,
	});
	containerObj.scale.multiplyScalar(10);
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
	knots.push(mesh);
	containerObj.add(mesh);
}

function updateFromOptions() {
	geometry.computeBoundsTree({ maxLeafTris: 5 });
	console.log("Geometry", geometry);

	addKnot();

	boundsViz = new MeshBVHHelper(knots[0]);
	containerObj.add(boundsViz);
}

function render() {
	stats.begin();

	const currTime = window.performance.now();
	lastFrameTime = lastFrameTime || currTime;
	deltaTime = currTime - lastFrameTime;

	containerObj.rotation.x += 0.0001 * params.mesh.speed * deltaTime;
	containerObj.rotation.y += 0.0002 * params.mesh.speed * deltaTime;
	containerObj.updateMatrixWorld();

	renderer.render(scene, camera);

	lastFrameTime = currTime;

	stats.end();

	requestAnimationFrame(render);
}
