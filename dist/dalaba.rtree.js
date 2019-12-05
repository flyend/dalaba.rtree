/**
 * dalaba.rtree - Rtree implementation based on point selection.
 * @date 2019/12/04
 * @version v0.0.1
 * @license MIT
 */
"use strict";
;(function (global, factory) {
    typeof exports === "object" && typeof module !== "undefined"
        ? factory(exports)
        : typeof define === "function" && define.amd
            ? define(["exports"], factory)
            : factory((global.Dalaba = global.Dalaba || {}));
}(typeof window !== "undefined" ? window : typeof this !== "undefined" ? this : global, (function (exports) {

    (exports.geom = exports.geom || {}).RTree = (function () {
    function intersects (p0, p1) {
    var rx = (p0.x - p1.x) * (p0.x - (p1.x + p1.width));
    var ry = (p0.y - p1.y) * (p0.y - (p1.y + p1.height));
    return rx <= 0.0 && ry <= 0.0;
}

function contains (p0, p1) {
    return p0.x <= p1.x &&
        p0.x + p0.width >= p1.x + p1.width &&
        p0.y <= p1.y &&
        p0.y + p0.height >= p1.y + p1.height;
};
    function distance (a, b) {
    // a is current node, b is new node
    var minX, minY, maxX, maxY;
    var area;

    if (a.isRoot === true) return b.width * b.height;
    area = a.width * a.height;
    minX = nativeMin(a.x, b.x);
    minY = nativeMin(a.y, b.y);
    maxX = nativeMax(a.x + a.width, b.x + b.width);
    maxY = nativeMax(a.y + a.height, b.y + b.height);

    return (maxX - minX) * (maxY - minY) - area;
};

    var splitSiblings = (function () {
    var hilbertcurves = (function () {
    function interleave (x) {
        x = (x | (x << 8)) & 0x00FF00FF;
        x = (x | (x << 4)) & 0x0F0F0F0F;
        x = (x | (x << 2)) & 0x33333333;
        x = (x | (x << 1)) & 0x55555555;
        return x;
    }
    function deinterleave (x) {
        x = (x | (x << 8)) & 0x00FF00FF;
        x = (x | (x << 4)) & 0x0F0F0F0F;
        x = (x | (x << 2)) & 0x33333333;
        x = (x | (x << 1)) & 0x55555555;
        return x;
    }
    // z-order of a point to coords
    function zOrder (x, y) {
        x = interleave(x);
        y = deinterleave(y);

        return (x | (y << 1)) >>> 0;
    }

    // A Hilbert space-filling curve
    function hilbert (x, y) {
        var a = x ^ y;
        var b = 0xFFFF ^ a;
        var c = 0xFFFF ^ (x | y);
        var d = x & (y ^ 0xFFFF);

        var A = a | (b >> 1);
        var B = (a >> 1) ^ a;// descan
        var C = ((c >> 1) ^ (b & (d >> 1))) ^ c;
        var D = ((a & (c >> 1)) ^ (d >> 1)) ^ d;// sw

        var i0, i1;

        a = A; b = B; c = C; d = D;
        A = ((a & (a >> 2)) ^ (b & (b >> 2)));
        B = ((a & (b >> 2)) ^ (b & ((a ^ b) >> 2)));
        C ^= ((a & (c >> 2)) ^ (b & (d >> 2)));
        D ^= ((b & (c >> 2)) ^ ((a ^ b) & (d >> 2)));// nw

        a = A; b = B; c = C; d = D;
        A = ((a & (a >> 4)) ^ (b & (b >> 4)));
        B = ((a & (b >> 4)) ^ (b & ((a ^ b) >> 4)));
        C ^= ((a & (c >> 4)) ^ (b & (d >> 4)));
        D ^= ((b & (c >> 4)) ^ ((a ^ b) & (d >> 4)));// ne

        a = A; b = B; c = C; d = D;
        C ^= ((a & (c >> 8)) ^ (b & (d >> 8)));
        D ^= ((b & (c >> 8)) ^ ((a ^ b) & (d >> 8)));// se

        // undo transformation prefix scan
        // 前缀扫描技术来并行化从索引到坐标的映射
        a = C ^ (C >> 1);
        b = D ^ (D >> 1);

        // recover index bits
        i0 = x ^ y;
        i1 = b | (0xFFFF ^ (i0 | a));

        // Z曲线空间填充 https://en.wikipedia.org/wiki/Z-order_curve
        return zOrder(i0, i1);
    }
    return hilbert;
})();;
    var bisect = (function () {
    function defaultCompare (a, b) {
        return a - b;
    }

    function bisect (arrays, value, left, right, compare) {
        if (left == null) left = 0;
        if (right == null) right = arrays.length;
        if (compare == null) compare = defaultCompare;

        var mid;

        while (left < right) {
            mid = left + right >>> 1;
            if (compare(arrays[mid], value) > 0) right = mid;
            else left = mid + 1;
        }
        return left;
    }
    return bisect;
})();; // bisect([1, 2, 2, 2, 3, 4], 2);

    var nativeCeil = Math.ceil;

    function splitSiblings (node, insertChild) {
        var childs = node.children || [],
            child;
        var siblingLeft = addNode(null, null, null, null);// empty node, x, y, width, height
        var siblingRight = addNode(null, null, null, null);
        var n, i, j;
        var pivot;
        var x, y;
        var indexes = [];

        if (!(n = childs.length)) return [];
        pivot = n >> 1;
        
        for (i = 0; i < n; i++) {
            child = childs[i];
            x = nativeCeil(child.x + child.width / 2.0);
            y = nativeCeil(child.y + child.height / 2.0);
            child.__sorted = hilbertcurves(x, y);
            if (i) {
                j = bisect(indexes, child.__sorted, null, null, function (a, b) {
                    return a.__sorted - b;
                });
                indexes.splice(j, 0, child);
            }
            else indexes[i] = child;
        }
        // console.log(indexes.map(d => d.__sorted));

        for (i = 0; i < n; i++) {
            child = childs[i];
            insertChild(child, i <= pivot ? siblingLeft : siblingRight);
            delete child.__sorted;
        }
        node.children = indexes = null;
        child = null;
        return [siblingLeft, siblingRight];
    }
    return splitSiblings;
})();;

    var treeOp = (function () {
    function lerp (x, s, dx) {
        return dx + x * s;
    }
    function setTransform (node, transform) {
        var x = node.x, y = node.y;
        var width = node.width, height = node.height;
        var translate = transform.translate;
        var scale = transform.scale;

        return {
            x: lerp(x, scale[0], translate[0]),
            y: lerp(y, scale[1], translate[1]),
            width: lerp(width, scale[0], 0),
            height: lerp(height, scale[1], 0)
        };
    }
	var treeSearch = function (boundary, node, transform) {
        var translate = transform.translate,
            scale  = transform.scale;
        function childrensOf (node) {
            var childs = node.children || [];
            if (childs.length === 0) return [node];
            return childs.map(childrensOf);
        }

        function dfs (boundary, node) {
            var childs = node.children || [],
                child;
            var n = childs.length, i;
            var nodes = [], childrens;

            if (contains(boundary, setTransform(node, {translate: translate, scale: scale})) || (!node.children || node.children.length === 0)) return childrensOf(node);

            for (i = 0; i < n; i++) {
                child = childs[i];
                if (intersects(boundary, setTransform(child, {translate: translate, scale: scale}))) {
                    childrens = dfs(boundary, child);
                    if (childrens.length) [].push.apply(nodes, childrens);
                }
            }
            return nodes;
        }
        return dfs(boundary, node);
    };
    return {
    	search: treeSearch
    };
})();;

    var nativeMin = Math.min;
    var nativeMax = Math.max;

    function addNode (x, y, width, height) {
        return {
            x: x, y: y,
            width: width, height: height,
            children: null
        };
    }

    function factoy (Dalaba) {
        var extend = Dalaba.extend;
        var pack = Dalaba.pack;
        var isArray = Dalaba.isArray;

        var treeIsLeaf = function (node) {
            var childs = node.children;
            if (!isArray(childs)) return true;
            if (node.children.length === 0) return true;
            childs = childs[0].children;
            if (!isArray(childs)) return true;
            if (node.children.length === 0) return true;
            return false;
        };

        function updateBBox (newNode, node) {
            var newWidth, newHeight;
            var minX, minY;

            if (node.isRoot === true || node.x === Infinity) {
                node.x = newNode.x, node.y = newNode.y;
                node.width = newNode.width, node.height = newNode.height;
            }
            else {
                newWidth = newNode.x + newNode.width;
                newHeight = newNode.y + newNode.height;
                minX = nativeMin(node.x, newNode.x);
                minY = nativeMin(node.y, newNode.y);
                node.x = minX;
                node.y = minY;
                node.width = nativeMax(node.x + node.width, newWidth) - minX;
                node.height = nativeMax(node.y + node.height, newHeight) - minY;
            }
            return node;
        }

        function insertChild (node, parent) {
            node.parent = parent;
            if (!parent.children) parent.children = [];
            parent.children.push(node);
            updateBBox(node, parent);
        }
        function removeChild (node, parent) {
            var childs = parent.children || [];
            var i = childs.indexOf(node);
            childs.splice(i, 1);
        }

        var treeInserted = function (boundary) {
            var node = this.root;
            var newNode = extend({}, boundary);// clone new node
            var childs, child;
            var minNode, minDistance;
            var dist;
            var n, i;

            if (newNode.id != null) this.indices[newNode.id] = newNode;

            newNode.x = boundary.x, newNode.y = boundary.y;
            newNode.width = boundary.width, newNode.height = boundary.height;

            while (!treeIsLeaf(node)) {
                node = updateBBox(newNode, node);
                n = (childs = node.children || []).length;
                minDistance = Infinity;
                for (i = 0; i < n; i++) {
                    dist = distance(child = childs[i], newNode);
                    if (dist < minDistance) {
                        minDistance = dist;
                        minNode = child;
                    }
                }
                node = minNode;
            }
            insertChild(newNode, node);
            balanceTree(this.root, newNode, this.maxDepth);
        };

        function balanceTree (root, newNode, maxDepth) {
            var node = newNode;
            var siblings;
            var n, i;

            while (node.parent != null && node.parent.children.length > maxDepth) {
                node = node.parent;// 往上递归
                if (node.isRoot !== true) {
                    siblings = splitSiblings(node, insertChild);
                    removeChild(node, node.parent);
                    for (i = 0, n = siblings.length; i < n; i++) {
                        insertChild(siblings[i], node.parent);
                    }
                }
                else if (node === root) {
                    siblings = splitSiblings(node, insertChild);
                    for (i = 0, n = siblings.length; i < n; i++) {
                        insertChild(siblings[i], node);
                    }
                }
            }
        }

        var RTree = function (maxDepth) {
            this.maxDepth = pack("number", maxDepth, 4);
            this.root = addNode(null, null, null, null);
            this.root.isRoot = true;
            this.indices = {};
        };
        var prototypeRTree = {
            insert: treeInserted,
            search: function (boundary, node, transform) {
                var tr = {};
                if (node == null) node = this.root;
                if (transform == null) tr = {translate: [0, 0], scale: [1, 1]};
                else {
                    if (transform.translate != null) tr.translate = [pack("number", transform.translate[0]), pack("number", transform.translate[1])];
                    if (transform.zoom != null) tr.scale = [pack("number", transform.zoom, transform.zoom[0], 1), pack("number", transform.zoom, transform.zoom[1], 1)];
                    if (transform.scale != null) tr.scale = [pack("number", transform.scale, transform.scale[0], 1), pack("number", transform.scale, transform.scale[1], 1)];
                }
                return treeOp.search(boundary, node, tr);
            },
            remove: function () {
                // TODO
            },
            get: function (id) {
                var node = this.indices[id];
                return node == null ? null : node;
            },
            isleaf: treeIsLeaf,
            clear: function () {
                this.root = addNode(null, null, null, null);
                this.root.isRoot = true;
                this.indices = {};
            }
        };

        Object.assign(RTree.prototype, prototypeRTree);

        return RTree;
    }

    var exports = (function (global) {
        return {
            deps: function (Dalaba) {
                return factoy.call(global, Dalaba);
            }
        };
    })(this);

    if (typeof module === "object" && module.exports) {
        module.exports = exports;
    }
    else if (typeof define === "function" && define.amd) {
        define(function () {
            return exports;
        });
    }
    return exports;
})(typeof window !== "undefined" ? window : this).deps(exports);

    Object.defineProperty(exports, "__esModule", { value: true });
})));