"use strict";
(function () {
    // var painter = new Dalaba.Painter;
    function Column () {
        this.container = document.createElement("div");
        this.container.innerHTML = "<h1> Column Shadow</h1>";
    }
    function Pie () {
        this.container = document.createElement("div");
        this.container.appendChild(document.createTextNode("Pie shadow"));
    }
    function Line () {
        this.container = document.createElement("div");
        this.container.appendChild(document.createTextNode("Line shadow"));
    }

    function Particle (width, height) {
        var p = window.Particle(width, height);
        this.container = p.container;
    }
    var painter = new Dalaba.Painter({
        treeview: {
            data: [
                {pid: 3, id: 7, name: "Particle", type: "column", bounds: [12, 47, 420, 350], selected: true},
                {pid: 1, id: 2, name: "组 2", type: "group", disabled: false, expanded: false, /*locked: true, visibled: false,*/ },
                {pid: 1, id: 3, name: "组 3", type: "group", expanded: false, sortWeighted: 1},
                {pid: 2, id: 5, name: "组 5", type: "group"},
                {pid: 3, id: 6, name: "组 6", type: "group"},
                {pid: 2, id: 0, name: "layer 6", type: "column", bounds: [20, 70, 300, 350]},

                {pid: 3, id: 4, name: "marker", type: "column", bounds: [120, 120, 500, 400]},
            ]
        }
    });
    console.log(painter);
})();