import { FLOAT32_EPSILON } from "../Constants.js";
import { getTriCount } from "./geometryUtils.js";

// precomputes the bounding box for each triangle; required for quickly calculating tree splits.
// result is an array of size tris.length * 6 where triangle i maps to a
// [x_center, x_delta, y_center, y_delta, z_center, z_delta] tuple starting at index i * 6,
// representing the center and half-extent in each dimension of triangle i
export function computeTriangleBounds(
	geo,
	target = null,
	offset = null,
	count = null
) {
	const posAttr = geo.attributes.position;
	const index = geo.index ? geo.index.array : null;
	const triCount = getTriCount(geo);
	const normalized = posAttr.normalized;
	let triangleBounds;
	if (target === null) {
		triangleBounds = new Float32Array(triCount * 6 * 4);
		offset = 0;
		count = triCount;
	} else {
		triangleBounds = target;
		offset = offset || 0;
		count = count || triCount;
	}

	// used for non-normalized positions
	const posArr = posAttr.array;

	// support for an interleaved position buffer
	const bufferOffset = posAttr.offset || 0;
	let stride = 3;
	if (posAttr.isInterleavedBufferAttribute) {
		stride = posAttr.data.stride;
	}

	// used for normalized positions
	const getters = ["getX", "getY", "getZ"];

	for (let tri = offset; tri < offset + count; tri++) {
		const tri3 = tri * 3;
		const tri6 = tri * 6;

		let ai = tri3 + 0;
		let bi = tri3 + 1;
		let ci = tri3 + 2;

		if (index) {
			ai = index[ai];
			bi = index[bi];
			ci = index[ci];
		}

		// we add the stride and offset here since we access the array directly
		// below for the sake of performance
		if (!normalized) {
			ai = ai * stride + bufferOffset;
			bi = bi * stride + bufferOffset;
			ci = ci * stride + bufferOffset;
		}

		for (let el = 0; el < 3; el++) {
			let a, b, c;

			if (normalized) {
				a = posAttr[getters[el]](ai);
				b = posAttr[getters[el]](bi);
				c = posAttr[getters[el]](ci);
			} else {
				a = posArr[ai + el];
				b = posArr[bi + el];
				c = posArr[ci + el];
			}

			let min = a;
			if (b < min) min = b;
			if (c < min) min = c;

			let max = a;
			if (b > max) max = b;
			if (c > max) max = c;

			// Increase the bounds size by float32 epsilon to avoid precision errors when
			// converting to 32 bit float. Scale the epsilon by the size of the numbers being
			// worked with.
			const halfExtents = (max - min) / 2;
			const el2 = el * 2;
			triangleBounds[tri6 + el2 + 0] = min + halfExtents;
			triangleBounds[tri6 + el2 + 1] =
				halfExtents + (Math.abs(min) + halfExtents) * FLOAT32_EPSILON;
		}
	}

	return triangleBounds;
}
