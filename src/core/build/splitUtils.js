import { getLongestEdgeIndex } from "../../utils/ArrayBoxUtilities.js";

export function getOptimalSplit(centroidBoundingData) {
	let axis = -1;
	let pos = 0;

	// Center strategy
	axis = getLongestEdgeIndex(centroidBoundingData);

	if (axis !== -1) {
		pos = (centroidBoundingData[axis] + centroidBoundingData[axis + 3]) / 2;
	}

	return { axis, pos };
}
