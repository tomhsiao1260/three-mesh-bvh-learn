import Stats from "stats.js";
import * as dat from "three/examples/jsm/libs/lil-gui.module.min.js";
import * as THREE from "three";
import {
	acceleratedRaycast,
	computeBoundsTree,
	disposeBoundsTree,
	MeshBVHHelper,
} from "..";

THREE.Mesh.prototype.raycast = acceleratedRaycast;
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

const bgColor = 0x263238 / 2;

let renderer, scene, stats, camera;
let geometry, material, boundsViz, containerObj;
const knots = [];
const rayCasterObjects = [];

// Create ray casters in the scene
const raycaster = new THREE.Raycaster();
const sphere = new THREE.SphereGeometry(0.25, 20, 20);
const cylinder = new THREE.CylinderGeometry(0.01, 0.01);
const pointDist = 20;

// Delta timer
let lastFrameTime = null;
let deltaTime = 0;

const params = {
	raycasters: {
		count: 3,
		speed: 1,
	},
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
	containerObj.position.y = 3;
}

function addRaycaster() {
	// Objects
	const obj = new THREE.Object3D();
	const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
	const origMesh = new THREE.Mesh(sphere, material);
	const hitMesh = new THREE.Mesh(sphere, material);
	hitMesh.scale.multiplyScalar(0.25);
	origMesh.scale.multiplyScalar(0.5);

	const cylinderMesh = new THREE.Mesh(
		cylinder,
		new THREE.MeshBasicMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.25,
		})
	);

	// Init the rotation root
	obj.add(cylinderMesh);
	obj.add(origMesh);
	obj.add(hitMesh);
	scene.add(obj);

	// set transforms
	origMesh.position.set(pointDist, 0, 0);
	obj.rotation.x = Math.random() * 10;
	obj.rotation.y = Math.random() * 10;
	obj.rotation.z = Math.random() * 10;

	// reusable vectors
	const origVec = new THREE.Vector3();
	const dirVec = new THREE.Vector3();
	const xDir = Math.random() - 0.5;
	const yDir = Math.random() - 0.5;
	const zDir = Math.random() - 0.5;
	rayCasterObjects.push({
		update: () => {
			obj.rotation.x += xDir * 0.0001 * params.raycasters.speed * deltaTime;
			obj.rotation.y += yDir * 0.0001 * params.raycasters.speed * deltaTime;
			obj.rotation.z += zDir * 0.0001 * params.raycasters.speed * deltaTime;

			origMesh.updateMatrixWorld();
			origVec.setFromMatrixPosition(origMesh.matrixWorld);
			dirVec.copy(origVec).multiplyScalar(-1).normalize();

			raycaster.set(origVec, dirVec);
			const res = raycaster.intersectObject(containerObj, true);
			const length = res.length ? res[0].distance : pointDist;

			hitMesh.position.set(pointDist - length, 0, 0);

			cylinderMesh.position.set(pointDist - length / 2, 0, 0);
			cylinderMesh.scale.set(1, length, 1);

			cylinderMesh.rotation.z = Math.PI / 2;
		},

		remove: () => {
			scene.remove(obj);
		},
	});
}

function updateFromOptions() {
	geometry.computeBoundsTree({ maxLeafTris: 5 });
	console.log("Geometry", geometry);

	addKnot();

	while (rayCasterObjects.length < params.raycasters.count) {
		addRaycaster();
	}

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

	rayCasterObjects.forEach((f) => f.update());

	renderer.render(scene, camera);

	lastFrameTime = currTime;

	stats.end();

	requestAnimationFrame(render);
}
