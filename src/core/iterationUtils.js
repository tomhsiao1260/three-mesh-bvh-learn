import { setTriangle } from "../../utils/TriangleUtilities.js";

export function iterateOverTriangles /* @echo INDIRECT_STRING */(
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
