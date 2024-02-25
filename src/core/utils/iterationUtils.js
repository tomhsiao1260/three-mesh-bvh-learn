import { intersectTri } from "../../utils/ThreeRayIntersectUtilities.js";
import { setTriangle } from "../../utils/TriangleUtilities.js";

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

function iterateOverTriangles(
	offset,
	count,
	bvh,
	intersectsTriangleFunc,
	contained,
	depth,
	triangle
) {
	const { geometry } = bvh;
	const { index } = geometry;
	const pos = geometry.attributes.position;
	for (let i = offset, l = count + offset; i < l; i++) {
		let tri = i;

		setTriangle(triangle, tri * 3, index, pos);
		triangle.needsUpdate = true;

		if (intersectsTriangleFunc(triangle, tri, contained, depth)) {
			return true;
		}
	}

	return false;
}

export { intersectClosestTri, iterateOverTriangles };
