import {
	LineBasicMaterial,
	BufferAttribute,
	BufferGeometry,
	Group,
	Box3,
	Object3D,
	Vector3,
} from "three";
import { arrayToBox } from "../utils/ArrayBoxUtilities.js";

const boundingBox = /* @__PURE__ */ new Box3(
	new Vector3(-1, -1, -1),
	new Vector3(1, 1, 1)
);

class MeshBVHRootHelper extends Object3D {
	get isMesh() {
		return !this.displayEdges;
	}

	get isLineSegments() {
		return this.displayEdges;
	}

	get isLine() {
		return this.displayEdges;
	}

	constructor(bvh, material, depth = 10, group = 0) {
		super();

		this.material = material;
		this.geometry = new BufferGeometry();
		this.name = "MeshBVHRootHelper";
		this.depth = depth;
		this.displayParents = false;
		this.bvh = bvh;
		this.displayEdges = true;
		this._group = group;
	}

	update() {
		const geometry = this.geometry;
		const boundsTree = this.bvh;
		const group = this._group;
		geometry.dispose();
		this.visible = false;

		if (boundsTree) {
			// count the number of bounds required
			let boundsCount = 0;
			boundsTree.traverse((depth, isLeaf) => {
				boundsCount++;
				return isLeaf;
			}, group);

			// fill in the position buffer with the bounds corners
			let posIndex = 0;
			const positionArray = new Float32Array(8 * 3 * boundsCount);
			boundsTree.traverse((depth, isLeaf, boundingData) => {
				arrayToBox(0, boundingData, boundingBox);

				const { min, max } = boundingBox;
				for (let x = -1; x <= 1; x += 2) {
					const xVal = x < 0 ? min.x : max.x;
					for (let y = -1; y <= 1; y += 2) {
						const yVal = y < 0 ? min.y : max.y;
						for (let z = -1; z <= 1; z += 2) {
							const zVal = z < 0 ? min.z : max.z;
							positionArray[posIndex + 0] = xVal;
							positionArray[posIndex + 1] = yVal;
							positionArray[posIndex + 2] = zVal;

							posIndex += 3;
						}
					}
				}

				return isLeaf;
			}, group);

			let indexArray;
			let indices;

			// fill in the index buffer to point to the corner points
			indices = new Uint8Array([
				// x axis
				0, 4, 1, 5, 2, 6, 3, 7,
				// y axis
				0, 2, 1, 3, 4, 6, 5, 7,
				// z axis
				0, 1, 2, 3, 4, 5, 6, 7,
			]);

			indexArray = new Uint16Array(indices.length * boundsCount);

			for (let i = 0; i < boundsCount; i++) {
				const posOffset = i * 8;
				const indexOffset = i * indices.length;
				for (let j = 0; j < indices.length; j++) {
					indexArray[indexOffset + j] = posOffset + indices[j];
				}
			}

			// update the geometry
			geometry.setIndex(new BufferAttribute(indexArray, 1, false));
			geometry.setAttribute(
				"position",
				new BufferAttribute(positionArray, 3, false)
			);
			this.visible = true;
		}
	}
}

class MeshBVHHelper extends Group {
	constructor(mesh = null, bvh = null, depth = 10) {
		super();

		this.depth = depth;
		this.mesh = mesh;
		this.bvh = bvh;

		const edgeMaterial = new LineBasicMaterial({
			color: 0x00ff88,
			transparent: true,
			opacity: 0.3,
			depthWrite: false,
		});

		this.edgeMaterial = edgeMaterial;

		this.update();
	}

	update() {
		const bvh = this.bvh || this.mesh.geometry.boundsTree;
		const { depth, edgeMaterial } = this;

		const root = new MeshBVHRootHelper(bvh, edgeMaterial, depth, 0);
		this.add(root);

		root.update();
	}
}

export { MeshBVHHelper };
