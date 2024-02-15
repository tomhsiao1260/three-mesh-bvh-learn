import * as THREE from "three";
import { Group } from "three";

class MeshBVHHelper extends Group {
	constructor(mesh = null, bvh = null, depth = 10) {
		super();

		this.depth = depth;
		this.mesh = mesh;
		this.bvh = bvh;

		this.update();
	}

	update() {
		this.add(
			new THREE.Mesh(
				new THREE.BoxGeometry(1, 1, 1),
				new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
			)
		);
	}
}

export { MeshBVHHelper };
