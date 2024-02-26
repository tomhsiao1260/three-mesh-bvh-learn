import * as THREE from "three";
import { buildPackedTree } from "./build/buildTree.js";
import { BYTES_PER_NODE, IS_LEAFNODE_FLAG } from "./Constants.js";
import { raycastFirst } from "./cast/raycastFirst.js";
import { closestPointToPoint } from "./cast/closestPointToPoint.js";
import { ExtendedTrianglePool } from "../utils/ExtendedTrianglePool.js";
import { iterateOverTriangles } from "./utils/iterationUtils.js";
import { shapecast } from "./cast/shapecast.js";

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

	raycastFirst(ray, material) {
		const roots = this._roots;
		const geometry = this.geometry;

		let closestResult = null;

		for (let i = 0, l = roots.length; i < l; i++) {
			const result = raycastFirst(this, i, material.side, ray);
			if (
				result != null &&
				(closestResult == null || result.distance < closestResult.distance)
			) {
				closestResult = result;
			}
		}

		return closestResult;
	}

	shapecast(callbacks) {
		const triangle = ExtendedTrianglePool.getPrimitive();
		const iterateFunc = iterateOverTriangles;
		let {
			boundsTraverseOrder,
			intersectsBounds,
			intersectsRange,
			intersectsTriangle,
		} = callbacks;

		intersectsRange = (offset, count, contained, depth, nodeIndex) => {
			return iterateFunc(
				offset,
				count,
				this,
				intersectsTriangle,
				contained,
				depth,
				triangle
			);
		};

		// run shapecast
		let result = false;
		let byteOffset = 0;
		const roots = this._roots;
		for (let i = 0, l = roots.length; i < l; i++) {
			const root = roots[i];
			result = shapecast(
				this,
				i,
				intersectsBounds,
				intersectsRange,
				boundsTraverseOrder,
				byteOffset
			);

			if (result) {
				break;
			}

			byteOffset += root.byteLength;
		}

		ExtendedTrianglePool.releasePrimitive(triangle);

		return result;
	}

	closestPointToPoint(
		point,
		target = {},
		minThreshold = 0,
		maxThreshold = Infinity
	) {
		return closestPointToPoint(this, point, target, minThreshold, maxThreshold);
	}
}
