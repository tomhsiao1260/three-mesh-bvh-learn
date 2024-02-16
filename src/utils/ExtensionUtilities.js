import { MeshBVH } from "../core/MeshBVH.js";

export function computeBoundsTree(options) {
	this.boundsTree = new MeshBVH(this, options);
	return this.boundsTree;
}

export function disposeBoundsTree() {
	this.boundsTree = null;
}
