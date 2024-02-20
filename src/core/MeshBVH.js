import { buildPackedTree } from "./build/buildTree.js";
import { BYTES_PER_NODE, IS_LEAFNODE_FLAG } from "./Constants.js";

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
		const uint32Array = new Uint32Array(buffer);
		const uint16Array = new Uint16Array(buffer);
		_traverse(0);

		function _traverse(node32Index, depth = 0) {
			const node16Index = node32Index * 2;
			const isLeaf = uint16Array[node16Index + 15] === IS_LEAFNODE_FLAG;
			if (isLeaf) {
				const offset = uint32Array[node32Index + 6];
				const count = uint16Array[node16Index + 14];
				callback(
					depth,
					isLeaf,
					new Float32Array(buffer, node32Index * 4, 6),
					offset,
					count
				);
			} else {
				// TODO: use node functions here
				const left = node32Index + BYTES_PER_NODE / 4;
				const right = uint32Array[node32Index + 6];
				const splitAxis = uint32Array[node32Index + 7];
				const stopTraversal = callback(
					depth,
					isLeaf,
					new Float32Array(buffer, node32Index * 4, 6),
					splitAxis
				);

				if (!stopTraversal) {
					_traverse(left, depth + 1);
					_traverse(right, depth + 1);
				}
			}
		}
	}
}
