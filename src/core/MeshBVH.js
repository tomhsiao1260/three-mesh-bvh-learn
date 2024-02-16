export class MeshBVH {
	constructor(geometry, options = {}) {
		// retain references to the geometry so we can use them it without having to
		// take a geometry reference in every function.
		this.geometry = geometry;
		this._roots = null;
	}
}
