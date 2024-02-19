export function arrayToBox(nodeIndex32, array, target) {
	target.min.x = array[nodeIndex32];
	target.min.y = array[nodeIndex32 + 1];
	target.min.z = array[nodeIndex32 + 2];

	target.max.x = array[nodeIndex32 + 3];
	target.max.y = array[nodeIndex32 + 4];
	target.max.z = array[nodeIndex32 + 5];

	return target;
}

export function getLongestEdgeIndex(bounds) {
	let splitDimIdx = -1;
	let splitDist = -Infinity;

	for (let i = 0; i < 3; i++) {
		const dist = bounds[i + 3] - bounds[i];
		if (dist > splitDist) {
			splitDist = dist;
			splitDimIdx = i;
		}
	}

	return splitDimIdx;
}
