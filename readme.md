# Introduction

Try to learn the logic behind `three-mesh-bvh` [library](https://github.com/gkjohnson/three-mesh-bvh).

# Run

Install the packages

```
npm install
```

Run the examples and navigate to `localhost:1234/<demo-name>.html`

```
npm start
```

# Personal Note

## Build BVH tree

當對一個 geometry 使用 computeBoundsTree 方法時

```javascript
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

geometry.computeBoundsTree();
```

這會在 geometry 上加上一個 `boundsTree` 屬性，也就是產生一個 `MeshBVH` 的類實例

```javascript
export function computeBoundsTree(options) {
	this.boundsTree = new MeshBVH(this, options);
	return this.boundsTree;
}
```

`MeshBVH` 會在初始化時呼叫 `buildPackedTree` 函數，來建立一個尋訪 geometry 的樹狀結構，這個結構的結果會儲存在 `geometry.boundsTree._roots` 裡，這是個 array，但如果這樹的起始只有一個切入點那 array 裡只會有一項，這一項是個 buffer，記錄了整個樹的一些節點資訊，後面會更詳細解釋

另外，`MeshBVH` 在創建的過程還會在內部維護一個 geometry，這個內部的 geometry 裡的三角形 indices 會在樹建立的過程被重新排序，所以才能做到搭配 buffer 的資訊對空間進行快速的訪問

```javascript
export class MeshBVH {
	constructor(geometry, options = {}) {
		this.geometry = geometry;
		this._roots = null;

		buildPackedTree(this, options);
	}
```

更詳細來說，樹的建立是在 `buildPackedTree` 函數裡先透過 `buildTree` 函數建立的，這個函數會計算出一個樹狀結構的物件，並同時對內部維護的 geometry 裡的三角形重新排序，然後這個樹狀結構的物件再透過 `populateBuffer` 函數轉換成 buffer 供外部快速讀取。

所以說，整個核心程式碼寫在 `buildTree` 函數裡，裡面是個遞迴結構，大致上就是為每個節點寫入相關資訊。其中每個節點都是個 `MeshBVHNode` 的類實例，裡面都有一個 `boundingData` 屬性紀錄該節點的 bounding box 資訊，但對於該節點是否為 Leaf Node 則有下面兩種寫入屬性的方式：

```javascript
// Is Not Leaf Node
boundingData: 表示法 [ xmin, ymin, zmin, xmax, ymax, zmax ]
splitAxis: 分割軸，0, 1, 2 對應 x, y, z 軸
left: 分割軸左側節點，MeshBVHNode
right: 分割軸右側節點，MeshBVHNode

// Is Leaf Node
boundingData: 表示法 [ xmin, ymin, zmin, xmax, ymax, zmax ]
offset: 起始三角形的 index 值
count: 節點內的三角形個數
```

在了解整個樹狀結構想要寫入什麼資訊後，我們可以再進一步來看 `buildTree` 函數是怎麼做到這件事的。首先，在進入函數前，`computeTriangleBounds` 會負責先計算出所有小三角形的 bounding box，把三角形視為長方體以便做後續的排序比較，再來就是遞迴式的計算每個節點的資訊，也就是執行 `splitNode` 函數，這個函數每次會依序做這五件事：

1. 找出分割軸並將三角形重新排序：會透過 `getOptimalSplit` 找出最寬的那個軸作為分割軸，且以中心作為切割點，然後透過 `partionFunc` 把內部維護的 geometry 內的三角形由左到右重新排序 (沿軸的垂直方向)，並回傳 `splitOffset` 作為左右兩邊三角形的 index 分水嶺。

2. 透過 `getBounds` 函數計算左側的 bounding box

3. 執行左側的 `splitNode` 函數

4. 透過 `getBounds` 函數計算右側的 bounding box

5. 執行右側的 `splitNode` 函數

這樣跑完後，樹就建立好了，內部維護的 geometry 也排序好了。再來就是要透過 `populateBuffer` 把樹的節點資訊寫進 buffer，下面是寫入的格式。在這樣的架構下，你可以對照 `nodeBufferUtils.js` 檔案裡的方法是怎麼讀取這些 buffer 資料的：

```javascript
boundingData : 6 float32
right / offset : 1 uint32
splitAxis / isLeaf + count : 1 uint32 / 2 uint16
```

## Traverse

上面就是整個空間依照 geometry 被切割，以方便往後尋訪的過程。依照需求的不同，尋訪的方式也不同，下面先介紹最經典的應用情境，也就是 Raycasting 要怎麼尋訪這樣的樹狀結構。首先是加入下面這行，這會覆蓋掉 Three.js 內建的 raycast 方法

```javascript
THREE.Mesh.prototype.raycast = acceleratedRaycast;
```

遍歷的核心程式碼寫在 `raycastFirst.js` 裡，會先透過遞迴式的訪問一系列的 bounding box，然後當走到某個 Leaf Node 時，再透過 `intersectClosestTri` 方法找出那個節點裡有沒有三角形被射線打到，並回傳相關資訊

另一種應用情境就是某個點到 geometry 上的距離計算，外部可以透過呼叫 `closestPointToPoint` 這個方法來計算，遍歷的方式就比較繁雜點，程式的切入點寫在 `closestPointToPoint.js`，內部用到了一個叫 `shapecast` 的方法，它定義了一套在遍歷時的評分機制，並根據這些評分來決定要往哪個節點尋訪，並且到 Leaf Node 時，會透過 `iterateOverTriangles` 函數來對內部的所有三角形逐一的進行距離的比較計算。不過這段我覺得因為作者為了要讓 `shapecast` 能涵蓋許多應用情境，做了一定程度的抽象，這也使得這部分的程式碼有點跳來跳去的不太好閱讀
