import { ensureIndex, getTriCount } from "./geometryUtils.js";
import { computeTriangleBounds } from "./computeBoundsUtils.js";

export function buildPackedTree(bvh, options) {
	const geometry = bvh.geometry;

	ensureIndex(geometry, options);

	const BufferConstructor = ArrayBuffer;
	const triangleBounds = computeTriangleBounds(geometry);
	const geometryRanges = [{ offset: 0, count: getTriCount(geometry) }];

	console.log(triangleBounds, geometryRanges);
}
