# dalaba-rtree
基于坐标点选择的R-Tree实现，使用hilbertcurve打包xy坐标

### Installing
R-Tree依赖基础dalaba框架. 应首先加载dalaba.js，HTML的script在打包后的dist目录中引用最新版本 ```dalaba.js``` 和```dalaba.rtree.js```:
```html
<script type="text/javascript" src="/dist/dalaba.js"></script>
<script type="text/javascript" src="/dist/dalaba.rtree.js"></script>
```

或者使用 import:

```javascript
import * as Dalaba from "/dist/dabala";
import {RTree} from "/dist/dalaba.rtree";
```

### Usage


```javascript
var tree = new Dalaba.geom.RTree;
// 插入节点
tree.insert({x: 56, y: 156, width: 130, height: 130});
tree.insert({x: 103, y: 124, width: 140, height: 130, data: {id: 1, value: "A"}});

// 搜索节点
var nodes = tree.search({x: 50, y: 90});
console.log(nodes);

```

### Quick start

如果要使用源代码
npm start启动服务，即可运行 index.html

* Fork and clone [this repository](https://github.com/flyend/dalaba.rtree.git)
```bash
git clone https://github.com/flyend/dalaba.rtree.git
cd dalaba.rtree
```
* Install [node, npm](https://nodejs.org/download/) 
* Install dependencies
```bash
npm install
```
* Run rollup in dev mode while you edit
```bash
npm start
```
* Push to your local fork and make your pull request
