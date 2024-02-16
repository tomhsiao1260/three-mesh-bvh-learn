import { BufferAttribute } from "three";

export function getVertexCount(geo) {
	return geo.index ? geo.index.count : geo.attributes.position.count;
}

export function getTriCount(geo) {
	return getVertexCount(geo) / 3;
}

// ensures that an index is present on the geometry
export function ensureIndex(geo, options) {
	if (!geo.index) {
		const vertexCount = geo.attributes.position.count;
		const BufferConstructor = options.useSharedArrayBuffer
			? SharedArrayBuffer
			: ArrayBuffer;
		const index = getIndexArray(vertexCount, BufferConstructor);
		geo.setIndex(new BufferAttribute(index, 1));

		for (let i = 0; i < vertexCount; i++) {
			index[i] = i;
		}
	}
}
