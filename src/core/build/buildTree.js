import { BYTES_PER_NODE } from "../Constants.js";
import { ensureIndex, getTriCount } from "./geometryUtils.js";
import { getBounds, computeTriangleBounds } from "./computeBoundsUtils.js";
import { partition } from "./sortUtils.js";
import { MeshBVHNode } from "../MeshBVHNode.js";
import { populateBuffer } from "./buildUtils.js";

export function buildTree(bvh, triangleBounds, offset, count, options) {
	// epxand variables
	const { maxLeafTris } = options;
	const geometry = bvh.geometry;
	const indexArray = geometry.index ? geometry.index.array : null;
	const partionFunc = partition;

	const cacheCentroidBoundingData = new Float32Array(6);

	const root = new MeshBVHNode();
	getBounds(
		triangleBounds,
		offset,
		count,
		root.boundingData,
		cacheCentroidBoundingData
	);
	splitNode(root, offset, count, cacheCentroidBoundingData);
	return root;

	// either recursively splits the given node, creating left and right subtrees for it, or makes it a leaf node,
	// recording the offset and count of its triangles and writing them into the reordered geometry index.
	function splitNode(
		node,
		offset,
		count,
		centroidBoundingData = null,
		depth = 0
	) {
		// early out if we've met our capacity
		if (count <= maxLeafTris) {
			node.offset = offset;
			node.count = count;
			return node;
		}

		const split = { axis: 0, pos: 0 };

		const splitOffset = partionFunc(
			(indirectBuffer = null),
			indexArray,
			triangleBounds,
			offset,
			count,
			split
		);

		node.splitAxis = split.axis;

		// create the left child and compute its bounding box
		const left = new MeshBVHNode();
		const lstart = 0;
		const lcount = splitOffset - offset;
		node.left = left;

		getBounds(
			triangleBounds,
			lstart,
			lcount,
			left.boundingData,
			cacheCentroidBoundingData
		);
		splitNode(left, lstart, lcount, cacheCentroidBoundingData, depth + 1);

		// repeat for right
		const right = new MeshBVHNode();
		const rstart = splitOffset;
		const rcount = count - lcount;
		node.right = right;

		getBounds(
			triangleBounds,
			rstart,
			rcount,
			right.boundingData,
			cacheCentroidBoundingData
		);
		splitNode(right, rstart, rcount, cacheCentroidBoundingData, depth + 1);
	}
}

export function buildPackedTree(bvh, options) {
	const geometry = bvh.geometry;

	ensureIndex(geometry, options);

	const BufferConstructor = ArrayBuffer;
	const triangleBounds = computeTriangleBounds(geometry);
	const geometryRanges = [{ offset: 0, count: getTriCount(geometry) }];

	bvh._roots = geometryRanges.map((range) => {
		const root = buildTree(
			bvh,
			triangleBounds,
			range.offset,
			range.count,
			options
		);
		console.log("MeshBVHNode", root);
		const nodeCount = 1;
		const buffer = new BufferConstructor(BYTES_PER_NODE * nodeCount);
		populateBuffer(0, root, buffer);
		return buffer;
	});
}
