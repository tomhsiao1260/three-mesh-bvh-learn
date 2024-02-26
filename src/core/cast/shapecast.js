import { Box3 } from "three";
import { PrimitivePool } from "../../utils/PrimitivePool.js";
import { BufferStack } from "../utils/BufferStack.js";

let _box1, _box2;
const boxStack = [];
const boxPool = /* @__PURE__ */ new PrimitivePool(() => new Box3());

export function shapecast(
	bvh,
	root,
	intersectsBounds,
	intersectsRange,
	boundsTraverseOrder,
	byteOffset
) {
	// setup
	_box1 = boxPool.getPrimitive();
	_box2 = boxPool.getPrimitive();
	boxStack.push(_box1, _box2);
	BufferStack.setBuffer(bvh._roots[root]);

	const result = shapecastTraverse(
		0,
		bvh.geometry,
		intersectsBounds,
		intersectsRange,
		boundsTraverseOrder,
		byteOffset
	);

	// cleanup
	BufferStack.clearBuffer();
	boxPool.releasePrimitive(_box1);
	boxPool.releasePrimitive(_box2);
	boxStack.pop();
	boxStack.pop();

	const length = boxStack.length;
	if (length > 0) {
		_box2 = boxStack[length - 1];
		_box1 = boxStack[length - 2];
	}

	return result;
}

function shapecastTraverse(
	nodeIndex32,
	geometry,
	intersectsBoundsFunc,
	intersectsRangeFunc,
	nodeScoreFunc = null,
	nodeIndexByteOffset = 0, // offset for unique node identifier
	depth = 0
) {
	return "shapecast traverse here";
}
