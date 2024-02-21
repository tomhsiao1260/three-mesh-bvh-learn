import { Ray, Matrix4, Mesh } from "three";
import { convertRaycastIntersect } from "./GeometryRayIntersectUtilities.js";
import { MeshBVH } from "../core/MeshBVH.js";

const ray = /* @__PURE__ */ new Ray();
const tmpInverseMatrix = /* @__PURE__ */ new Matrix4();
const origMeshRaycastFunc = Mesh.prototype.raycast;

export function acceleratedRaycast(raycaster, intersects) {
	if (this.geometry.boundsTree) {
		if (this.material === undefined) return;

		tmpInverseMatrix.copy(this.matrixWorld).invert();
		ray.copy(raycaster.ray).applyMatrix4(tmpInverseMatrix);

		const bvh = this.geometry.boundsTree;
		const hit = convertRaycastIntersect(
			bvh.raycastFirst(ray, this.material),
			this,
			raycaster
		);
		if (hit) {
			intersects.push(hit);
		}
	} else {
		origMeshRaycastFunc.call(this, raycaster, intersects);
	}
}

export function computeBoundsTree(options) {
	this.boundsTree = new MeshBVH(this, options);
	return this.boundsTree;
}

export function disposeBoundsTree() {
	this.boundsTree = null;
}
