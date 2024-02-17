import { buildPackedTree } from "./build/buildTree.js";

export class MeshBVH {
	constructor(geometry, options = {}) {
		// retain references to the geometry so we can use them it without having to
		// take a geometry reference in every function.
		this.geometry = geometry;
		this._roots = null;

		buildPackedTree(this, options);
	}

	traverse(callback, rootIndex = 0) {
		const buffer = this._roots[rootIndex];

		callback(new Float32Array(buffer, 0 * 4, 6));
	}
}
