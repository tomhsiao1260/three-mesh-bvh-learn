import { BYTES_PER_NODE } from "../Constants.js";
import { ensureIndex, getTriCount } from "./geometryUtils.js";
import { getBounds, computeTriangleBounds } from "./computeBoundsUtils.js";
import { MeshBVHNode } from "../MeshBVHNode.js";
import { populateBuffer } from "./buildUtils.js";

export function buildTree(bvh, triangleBounds, offset, count, options) {
	// epxand variables
	const { maxLeafTris } = options;

	const cacheCentroidBoundingData = new Float32Array(6);

	const root = new MeshBVHNode();
	getBounds(
		triangleBounds,
		offset,
		count,
		root.boundingData,
		cacheCentroidBoundingData
	);
	return root;
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
		const nodeCount = 1;
		const buffer = new BufferConstructor(BYTES_PER_NODE * nodeCount);
		populateBuffer(0, root, buffer);
		return buffer;
	});
}
