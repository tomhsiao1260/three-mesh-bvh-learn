import { Ray, Matrix4, Mesh } from "three";
import { MeshBVH } from "../core/MeshBVH.js";

const ray = /* @__PURE__ */ new Ray();
const tmpInverseMatrix = /* @__PURE__ */ new Matrix4();
const origMeshRaycastFunc = Mesh.prototype.raycast;

export function acceleratedRaycast(raycaster, intersects) {
	origMeshRaycastFunc.call(this, raycaster, intersects);
}

export function computeBoundsTree(options) {
	this.boundsTree = new MeshBVH(this, options);
	return this.boundsTree;
}

export function disposeBoundsTree() {
	this.boundsTree = null;
}
