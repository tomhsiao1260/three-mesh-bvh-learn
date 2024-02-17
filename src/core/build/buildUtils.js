let float32Array, uint32Array, uint16Array, uint8Array;

export function populateBuffer(byteOffset, node, buffer) {
	float32Array = new Float32Array(buffer);
	uint32Array = new Uint32Array(buffer);
	uint16Array = new Uint16Array(buffer);
	uint8Array = new Uint8Array(buffer);

	const stride4Offset = byteOffset / 4;
	const stride2Offset = byteOffset / 2;
	const boundingData = node.boundingData;
	for (let i = 0; i < 6; i++) {
		float32Array[stride4Offset + i] = boundingData[i];
	}
}
