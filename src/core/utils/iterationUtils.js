import { intersectTri } from "../../utils/ThreeRayIntersectUtilities.js";

function intersectClosestTri(bvh, side, ray, offset, count) {
	const { geometry } = bvh;
	let dist = Infinity;
	let res = null;
	for (let i = offset, end = offset + count; i < end; i++) {
		let intersection;

		intersection = intersectTri(geometry, side, ray, i);

		if (intersection && intersection.distance < dist) {
			res = intersection;
			dist = intersection.distance;
		}
	}

	return res;
}

export { intersectClosestTri };
