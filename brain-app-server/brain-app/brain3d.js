/// <reference path="../extern/ts/descent.ts"/>
/// <reference path="../extern/ts/shortestpaths.ts"/>
/**
    This application uses similarity data between areas of the brain to construct a thresholded graph with edges
    between the most similar areas. It is designed to be embedded in a view defined in brainapp.html / brainapp.ts.
*/
var colans = cola;
var sliderSpace = 70; // The number of pixels to reserve at the bottom of the div for the slider
//var uniqueID = 0; // Each instance of this application is given a unique ID so that the DOM elements they create can be identified as belonging to them
var maxEdgesShowable = 1000;
var initialEdgesShown = 20; // The number of edges that are shown when the application starts
// The width and the height of the box in the xy-plane that we must keep inside the camera (by modifying the distance of the camera from the scene)
var widthInCamera = 520;
var heightInCamera = 360;
var RENDER_ORDER_BRAIN = 0.5;
// TODO: Proper reset and destruction of the application (the 'instances' variable will continue to hold a reference - this will cause the application to live indefinitely)
/*
var instances = Array<Brain3DApp>(0); // Stores each instance of an application under its id, for lookup by the slider input element

function sliderChangeForID(id: number, v: number) {
    instances[id].sliderChange(v);
}
*/
var Brain3DApp = /** @class */ (function () {
    /*
    closeBrainAppCallback;

    regCloseBrainAppCallback(callback: (id: number) => void) {
        this.closeBrainAppCallback = callback;f
    }
    */
    function Brain3DApp(info, commonData, inputTargetCreator, saveFileObj) {
        var _this = this;
        this.deleted = false;
        this.cursor = new THREE.Vector2();
        // Brain Surface
        this.surfaceUniformList = [];
        this.needUpdate = false;
        this.isAnimationOn = false;
        this.isControllingGraphOnly = false;
        this.svgNeedsUpdate = false;
        this.d3Zoom = d3.behavior.zoom();
        this.dissimilarityMatrix = []; // An inversion of the similarity matrix, used for Cola graph distances
        // State
        this.showingTopologyNetwork = false;
        this.transitionInProgress = false;
        this.currentThreshold = 0;
        this.selectedNodeID = -1;
        this.edgeCountSliderValue = 0;
        this.surfaceLoaded = false;
        //CAMERA
        this.CAMERA_ZOOM_SPEED = 15;
        this.fovZoomRatio = 1;
        this.allLabels = false;
        this.autoRotation = false;
        this.weightEdges = false;
        this.colorMode = "none";
        this.directionMode = "none";
        this.bundlingEdges = false;
        this.edgeTransitionColor = "#ee2211";
        this.useTransitionColor = false;
        this.mouse = {
            dx: 0,
            dy: 0
        };
        // Constants
<<<<<<< HEAD
        this.nearClip = 0;
=======
        this.nearClip = 1;
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        this.farClip = 2000;
        //modeLerpLength: number = 0.6;
        this.modeLerpLength = 0.0; //TODO: Effectively kills the animation. Remove it properly (or fix if easy to do)
        this.rotationSpeed = 1.2;
        this.graphOffset = 120;
        this.colaLinkDistance = 15;
        this.getNodeUnderPointer = function (pointer) {
            var raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(pointer, _this.camera);
            var nCola = (_this.colaGraph && _this.colaGraph.nodeMeshes) || [];
            var nPhysio = (_this.physioGraph && _this.physioGraph.nodeMeshes) || [];
            var n = raycaster.intersectObjects(nCola)[0] || raycaster.intersectObjects(nPhysio)[0];
            if (n) {
                _this.commonData.nodeIDUnderPointer[_this.id] = n.object.userData.id;
                return n.object;
            }
            _this.commonData.nodeIDUnderPointer[_this.id] = -1;
            return;
        };
        this.id = info.id;
        this.brainModelOrigin = info.brainModelOrigin;
        this.jDiv = info.jDiv;
        if (info.brainSurfaceMode) {
            this.brainSurfaceMode = info.brainSurfaceMode;
        }
        else {
            this.brainSurfaceMode = 0;
        }
        this.commonData = commonData;
        this.saveFileObj = saveFileObj;
        this.input = inputTargetCreator(0, 0, 0, sliderSpace);
        this.edgeCountSliderValue = initialEdgesShown;
        // Setting up viewport
        this.setupInput();
        this.setupUserInteraction(this.jDiv);
        // Set up camera
<<<<<<< HEAD
        this.camera = new THREE.OrthographicCamera(-this.jDiv.width() / 4, // left
        this.jDiv.width() / 4, // right
        this.jDiv.height() / 4, // top
        -this.jDiv.height() / 4, // bottom
        this.nearClip, this.farClip);
        this.resize(this.jDiv.width(), this.jDiv.height(), 'resizestart');
        this.brain3DModelDefaultXPosition = this.camera.left + (this.camera.right - this.camera.left) / 4;
=======
        this.camera = new THREE.PerspectiveCamera(45, 1, this.nearClip, this.farClip);
        this.resize(this.jDiv.width(), this.jDiv.height());
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        // Set up scene
        var ambient = new THREE.AmbientLight(0x1f1f1f);
        var directionalLight = new THREE.DirectionalLight(0xffeedd);
        directionalLight.position.set(0, 0, 1);
        this.scene = new THREE.Scene();
        this.scene.add(directionalLight);
        this.scene.add(ambient);
        // Set up the base objects for the graphs
        this.brainObject = new THREE.Object3D();
        this.brainContainer = new THREE.Object3D();
        this.brainContainer.add(this.brainObject);
<<<<<<< HEAD
        this.brainContainer.position.set(this.brain3DModelDefaultXPosition, 0, 0);
        // CA causes the brain to look at the camera
        //this.brainContainer.lookAt(this.camera.position);
        this.scene.add(this.brainContainer);
        this.colaObject = new THREE.Object3D();
        this.colaObject.position.set(-this.brain3DModelDefaultXPosition, 0, 0);
=======
        this.brainContainer.position.set(-this.graphOffset, 0, 0);
        this.brainContainer.lookAt(this.camera.position);
        this.scene.add(this.brainContainer);
        this.colaObject = new THREE.Object3D();
        this.colaObject.position.set(-this.graphOffset, 0, 0);
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        this.scene.add(this.colaObject);
        // Register the data callbacks
        var coords = function () {
            _this.restart();
        };
        var lab = function () {
            _this.restart();
        };
        //if (this.commonData.noBranSurface == true) this.surfaceLoaded = true;
        // Load default brain surface mode when the new model is loaded
        this.setBrainMode(this.brainSurfaceMode);
        commonData.regNotifyCoords(coords);
        commonData.regNotifyLabels(lab);
        // Set up loop
        if (!this.loop)
            this.loop = new Loop(this, 0.03);
        // Initialise Graph Objects
        this.circularGraph = new CircularGraph(this.id, this.jDiv, this.dataSet, this.svg, this.svgDefs, this.svgAllElements, this.d3Zoom, this.commonData, this.saveFileObj);
        //initialize display
        this.initialiseDisplay();
<<<<<<< HEAD
        this.resize(this.jDiv.width(), this.jDiv.height(), 'resizestart');
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
    }
    Brain3DApp.prototype.initialiseDisplay = function () {
        var displaySettings_mode = $('#display_settings_mode').val();
        var displaySettings_labels = $('#display_settings_labels').val();
        var displaySettings_split = $('#display_settings_split').val();
        var displaySettings_rotation = $('#display_settings_rotation').val();
        if (displaySettings_mode != 'top') {
            this.defaultOrientationsOnClick(displaySettings_mode);
        }
        if (displaySettings_labels != 'false') {
            this.allLabelsOnChange();
        }
        if (displaySettings_split != 'false') {
        }
        if (displaySettings_rotation != 'false') {
            this.autoRotationOnChange('anticlockwise');
        }
    };
    Brain3DApp.prototype.setEdgeDirection = function (directionMode) {
        this.directionMode = directionMode;
        if (this.physioGraph)
            this.physioGraph.setEdgeDirection(directionMode);
        if (this.colaGraph)
            this.colaGraph.setEdgeDirection(directionMode);
        if (this.circularGraph)
            this.circularGraph.circularLayoutEdgeDirectionModeOnChange(directionMode);
        if (this.canvasGraph)
            this.canvasGraph.setDirectionMode(directionMode);
        this.isAnimationOn = (directionMode === "animation");
        this.svgNeedsUpdate = true;
        if (this.dataSet.info.isSymmetricalMatrix && directionMode !== "none") {
            CommonUtilities.launchAlertMessage(CommonUtilities.alertType.WARNING, "The given similarity matrix is symmetrical," +
                "so the animation of edges do not reflect their actual direction.");
        }
    };
    Brain3DApp.prototype.getNodeColors = function (colorAttribute, minColor, maxColor) {
        /* Get the color array, a mapping of the configured color attribute to color values, e.g.
            [
                // Continuous values are evenly split
                [
                    {color: 0xfa36dd, portion: 0.33},
                    {color: 0x006f34, portion: 0.33},
                    {color: 0x228d00, portion: 0.33}
                ]
            ]
        */
        var a = this.dataSet.attributes;
        if (!a.info[colorAttribute]) {
            return this.getNodeColorsEmpty();
        }
        var valueArray = a.get(colorAttribute);
        // D3 can scale colours, but needs to use color strings
<<<<<<< HEAD
        // remove any leading # characters and then append
        var minString = "#" + minColor.toString(16).replace(/^#+/gm, '');
        var maxString = "#" + maxColor.toString(16).replace(/^#+/gm, '');
=======
        var minString = "#" + minColor.toString(16);
        var maxString = "#" + maxColor.toString(16);
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        // Continuous has each value mapped with equal proportion
        var i = a.columnNames.indexOf(colorAttribute);
        var singlePortion = (1 / a.info[colorAttribute].numElements) || 0;
        var colorMap = d3.scale
            .linear()
            .domain([a.getMin(i), a.getMax(i)])
            .range([minString, maxString]);
        return valueArray.map(function (aArray) { return aArray.map(function (value) { return ({
            color: parseInt(colorMap(value).substring(1), 16),
            portion: singlePortion
        }); }); });
    };
    Brain3DApp.prototype.getNodeColorsDiscrete = function (colorAttribute, discreteValues, discreteColors) {
        /* Get the color array, a mapping of the configured color attribute to color values, e.g.
            [
                // Discrete values are weighted by proportion
                [
                    {color: 0xff0000, portion: 1.0},
                    {color: 0x00ff00, portion: 0.0},
                    {color: 0x0000ff, portion: 0.0}
                ]
            ]
        */
        var a = this.dataSet.attributes;
        if (!a.info[colorAttribute]) {
            return this.getNodeColorsEmpty();
        }
        var valueArray = a.get(colorAttribute);
        if (a.info[colorAttribute].numElements > 1) {
            // Discrete multi-value has each color from the mapping with its proportion of total value in that node
            return valueArray.map(function (aArray) {
                var singlePortion = (1 / aArray.reduce(function (weight, acc) { return acc + weight; }, 0)) || 0;
                return aArray.map(function (value, i) { return ({
                    color: discreteColors[i],
                    portion: value * singlePortion
                }); });
            });
        }
        else {
            // Discrete single value is just an ordinal mapping
            var colorMap_1 = d3.scale
                .ordinal()
                .domain(discreteValues)
                .range(discreteColors);
            return valueArray.map(function (aArray) { return aArray.map(function (value) { return ({
                color: colorMap_1(value),
                portion: 1.0
            }); }); });
        }
    };
    Brain3DApp.prototype.getNodeColorsEmpty = function () {
        /* Get a minimal practical color array
            [
                // Empty values are a minimal set of grey
                [
                    {color: 0xd3d3d3, portion: 1.0}
                ]
            ]
        */
        var defaultColor = { color: 0xd3d3d3, portion: 1.0 };
        return Array.apply(null, Array(this.dataSet.attributes.numRecords)).map(function (d) { return [defaultColor]; });
    };
    Brain3DApp.prototype.setupUserInteraction = function (jDiv) {
        var _this = this;
        var varEdgesBundlingOnChange = function () { _this.edgesBundlingOnChange(); };
        var varAllLabelsOnChange = function () { _this.allLabelsOnChange(); };
        var varAutoRotationOnChange = function (s) { _this.autoRotationOnChange(s); };
        var varGraphViewSliderOnChange = function (v) { _this.graphViewSliderOnChange(v); };
        var varEdgeCountSliderOnChange = function (v) { _this.edgeCountSliderOnChange(v); };
        var varCloseBrainAppOnClick = function () { _this.closeBrainAppOnClick(); };
        var varDefaultOrientationsOnClick = function (s) { _this.defaultOrientationsOnClick(s); };
        var varNetworkTypeOnChange = function (s) { _this.networkTypeOnChange(s); };
        var varBrainSurfaceModeOnChange = function () {
            if (_this.brainSurfaceMode === 0) {
                _this.brainSurfaceMode = 1;
                //record display settting
                $('#display_settings_split').val('true');
                _this.setBrainMode(1);
                if (_this.dataSet) {
                    var newCoords = _this.computeMedialViewCoords();
                    _this.physioGraph.setNodePositions(newCoords);
                    _this.physioGraph.update();
                }
            }
            else {
                _this.brainSurfaceMode = 0;
                //record display setting
                $('#display_settings_split').val('false');
                _this.setBrainMode(0);
                if (_this.dataSet) {
                    _this.physioGraph.setNodePositions(_this.dataSet.brainCoords);
                    _this.physioGraph.update();
                }
            }
        };
        var varShowProcessingNotification = function () { _this.showProcessingNotification(); };
        // Set the background color
        jDiv.css({ backgroundColor: '#ffffff' });
        // Set up renderer, and add the canvas and the slider to the div
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true,
            alpha: true
        });
        this.renderer.sortObjects = true;
        this.renderer.setSize(jDiv.width(), (jDiv.height() - sliderSpace));
        jDiv
            //.append($('<span id="close-brain-app-' + this.id + '" title="Close" class="view-panel-span"  data-toggle="tooltip" data-placement="bottom">x</span>')
            //.css({ 'right': '6px', 'top': '10px', 'font-size': '12px', 'z-index': 1000 })
            //.click(function () { varCloseBrainAppOnClick(); }))
            .append($('<span id="top-view-' + this.id + '" title="Top view" class="view-panel-span" data-toggle="tooltip" data-placement="left">T</span>')
            .css({ 'right': '6px', 'top': '30px', 'z-index': 1000 })
            .click(function () { varDefaultOrientationsOnClick("top"); }))
            .append($('<span id="bottom-view-' + this.id + '" title="Bottom view" class="view-panel-span" data-toggle="tooltip" data-placement="left">B</span>')
            .css({ 'right': '6px', 'top': '50px', 'z-index': 1000 })
            .click(function () { varDefaultOrientationsOnClick("bottom"); }))
            .append($('<span id="left-view-' + this.id + '" title="Left view" class="view-panel-span" data-toggle="tooltip" data-placement="left">L</span>')
            .css({ 'right': '6px', 'top': '70px', 'z-index': 1000 })
            .click(function () { varDefaultOrientationsOnClick("left"); }))
            .append($('<span id="right-view-' + this.id + '" title="Right view" class="view-panel-span" data-toggle="tooltip" data-placement="left">R</span>')
            .css({ 'right': '6px', 'top': '90px', 'z-index': 1000 })
            .click(function () { varDefaultOrientationsOnClick("right"); }))
            .append($('<span id="front-view-' + this.id + '" title="Front view" class="view-panel-span" data-toggle="tooltip" data-placement="left">F</span>')
            .css({ 'right': '6px', 'top': '110px', 'z-index': 1000 })
            .click(function () { varDefaultOrientationsOnClick("front"); }))
            .append($('<span id="back-view-' + this.id + '" title="Back view" class="view-panel-span" data-toggle="tooltip" data-placement="left">B</span>')
            .css({ 'right': '6px', 'top': '130px', 'z-index': 1000 })
            .click(function () { varDefaultOrientationsOnClick("back"); }))
            .append($('<span id="all-labels-' + this.id + '" title="Show/hide all node labels" class="view-panel-span" data-toggle="tooltip" data-placement="left">&#8704</span>')
            .css({ 'right': '6px', 'top': '150px', 'z-index': 1000 })
            .click(function () { varAllLabelsOnChange(); }))
            .append($('<span id="top-view-' + this.id + '" title="Split brain" class="view-panel-span" data-toggle="tooltip" data-placement="left">M</span>')
            .css({ 'right': '6px', 'top': '170px', 'z-index': 1000 })
            .click(function () { varBrainSurfaceModeOnChange(); }))
            .append($('<span id="anti-auto-rotation-' + this.id + '" title="Anticlockwise auto-rotation" class="view-panel-span" data-toggle="tooltip" data-placement="left">&#8634</span>')
            .css({ 'right': '6px', 'top': '190px', 'z-index': 1000 })
            .click(function () { varAutoRotationOnChange("anticlockwise"); }))
            // Circular Graph
            .append($('<div id="div-graph-' + this.id + '"></div>')
            .css({ 'position': 'absolute', 'width': '100%', 'height': '100%', 'top': 0, 'left': 0, 'z-index': 10, 'overflow': 'hidden' })
            .append(this.renderer.domElement))
            .append($("<div id='div-graph-controls'></div>").css({ position: "absolute", bottom: 0 })
            // Controls for the bottom of the graph area
            .append('<p>Showing <label id="count-' + this.id + '">0</label> edges (<label id=percentile-' + this.id + '>0</label>th percentile)</p>')
            .append($("<input id=\"edge-count-slider-".concat(this.id, "\" type=\"text\" />")))
            // Select Network Type button group
            .append($("<div id=\"select-network-type-".concat(this.id, "\" class=\"btn-group\" data-toggle=\"buttons\">\n                    <label id=\"select-network-type-").concat(this.id, "-3D\" class=\"btn btn-primary btn-sm\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"3D topological projection based on the cola method, as provided by WebCola\">\n                        <input class=\"select-network-type-input\" type=\"radio\" name=\"select-network-type-").concat(this.id, "\" value=\"3d\" autocomplete=\"off\">3D\n                    </label>\n                    <label id=\"select-network-type-").concat(this.id, "-2D\" class=\"btn btn-primary btn-sm\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"2D topological projection generated according to one of several different algorithms. See Options for details.\">\n                        <input class=\"select-network-type-input\" type=\"radio\" name=\"select-network-type-").concat(this.id, "\" value=\"2d\" autocomplete=\"off\">2D\n                    </label>\n                    <label id=\"select-network-type-").concat(this.id, "-circular\" class=\"btn btn-primary btn-sm\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Circular layout with additional attribute visualisation. See Options for details.\">\n                        <input class=\"select-network-type-input\" type=\"radio\" name=\"select-network-type-").concat(this.id, "\" value=\"circular\" autocomplete=\"off\">Circular\n                    </label>\n                    <label id=\"select-network-type-").concat(this.id, "-none\" class=\"btn btn-primary btn-sm\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Remove the secondary view\">\n                        <input class=\"select-network-type-input\" type=\"radio\" name=\"select-network-type-").concat(this.id, "\" value=\"none\" autocomplete=\"off\">None\n                    </label>\n                </div>")).css({ 'margin-left': '5px', 'position': 'relative', 'z-index': 1000 })));
        $("#edge-count-slider-" + this.id)['bootstrapSlider']({
            min: 1,
            max: maxEdgesShowable,
            step: 1,
            value: initialEdgesShown,
            id: "edge-count-slider-" + this.id + "-slider"
        });
        $("#edge-count-slider-" + this.id).on("slide", function (event) { return varEdgeCountSliderOnChange(event["value"]); });
        $("#edge-count-slider-" + this.id).on("slideStop", function (event) { return _this.showNetwork(false); });
        $("#edge-count-slider-" + this.id + "-slider").css({
            'width': '300px',
            'margin-right': 10,
            'margin-left': 10,
            'z-index': 1000
        });
        var $checkboxTips = $("#checkbox-tips");
        var onToggleTips = function () {
            if ($checkboxTips.is(":checked")) {
                $("[data-toggle='tooltip']").tooltip({ container: 'body', trigger: 'hover' });
            }
            else {
                $("[data-toggle='tooltip']").tooltip("destroy");
            }
        };
        $checkboxTips.change(onToggleTips);
        onToggleTips();
        $("input[name=select-network-type-".concat(this.id, "]:radio")).change(function (event) { return varNetworkTypeOnChange(event.target["value"]); });
        // Graph canvas setup
        this.graph2dContainer = d3.select('#div-graph-' + this.id)
            .append("div")
            .style({
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0
        })
            .classed("graph2dContainer", true)
            .node();
        // SVG Initializing
        var varSVGZoom = function () { _this.svgZoom(); };
        this.svg = d3.select('#div-graph-' + this.id).append("svg")
            .attr("width", jDiv.width())
            .attr("height", jDiv.height() - sliderSpace)
            .call(this.d3Zoom.on("zoom", varSVGZoom));
        try {
            this.svg[0][0].setAttribute("id", "svgGraph" + this.id);
            this.svg[0][0].setAttribute("style", "position: absolute; top: 0; left: 0");
            this.svgAllElements = this.svg.append("g"); // svg Group of shapes
            // add arrow marker
            this.svgAllElements.append("defs").append("marker")
                .attr("id", "arrowhead-circular")
                .attr("refX", 0)
                .attr("refY", 2)
                .attr("markerWidth", 6)
                .attr("markerHeight", 4)
                .attr("orient", "auto")
                .attr("viewbox", "0 0 20 20")
                .append("path")
                .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead
            this.svgAllElements.append("defs").append("marker")
                .attr("id", "arrowhead-2d")
                .attr("refX", 8)
                .attr("refY", 2)
                .attr("markerWidth", 6)
                .attr("markerHeight", 4)
                .attr("orient", "auto")
                .attr("viewbox", "0 0 20 20")
                .append("path")
                .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead
            var varSvg = this.svg[0];
            var varNamespaceURI = varSvg[0].namespaceURI;
            this.svgDefs = document.createElementNS(varNamespaceURI, 'defs');
            this.createMarker();
            varSvg[0].appendChild(this.svgDefs);
            this.jDivProcessingNotification = document.createElement('div');
            this.jDivProcessingNotification.id = 'div-processing-notification';
        }
        catch (err) {
            console.log(err);
        }
    };
    Brain3DApp.prototype.setupInput = function () {
        var _this = this;
        // Register callbacks
        this.input.regKeyTickCallback('a', function (deltaTime) {
            var quat = new THREE.Quaternion();
            var axis = new THREE.Vector3(0, -1, 0);
            quat.setFromAxisAngle(axis, _this.rotationSpeed * deltaTime); // axis must be normalised, angle in radians
            _this.brainObject.quaternion.multiplyQuaternions(quat, _this.brainObject.quaternion);
            _this.colaObject.quaternion.multiplyQuaternions(quat, _this.colaObject.quaternion);
        });
        this.input.regKeyTickCallback('d', function (deltaTime) {
            var quat = new THREE.Quaternion();
            var axis = new THREE.Vector3(0, 1, 0);
            quat.setFromAxisAngle(axis, _this.rotationSpeed * deltaTime); // axis must be normalised, angle in radians
            _this.brainObject.quaternion.multiplyQuaternions(quat, _this.brainObject.quaternion);
            _this.colaObject.quaternion.multiplyQuaternions(quat, _this.colaObject.quaternion);
        });
        this.input.regKeyTickCallback('w', function (deltaTime) {
            var quat = new THREE.Quaternion();
            var axis = new THREE.Vector3(-1, 0, 0);
            quat.setFromAxisAngle(axis, _this.rotationSpeed * deltaTime); // axis must be normalised, angle in radians
            _this.brainObject.quaternion.multiplyQuaternions(quat, _this.brainObject.quaternion);
            _this.colaObject.quaternion.multiplyQuaternions(quat, _this.colaObject.quaternion);
        });
        this.input.regKeyTickCallback('s', function (deltaTime) {
            var quat = new THREE.Quaternion();
            var axis = new THREE.Vector3(1, 0, 0);
            quat.setFromAxisAngle(axis, _this.rotationSpeed * deltaTime); // axis must be normalised, angle in radians
            _this.brainObject.quaternion.multiplyQuaternions(quat, _this.brainObject.quaternion);
            _this.colaObject.quaternion.multiplyQuaternions(quat, _this.colaObject.quaternion);
        });
        var leapRotationSpeed = 0.03; // radians per mm
        this.input.regLeapXCallback(function (mm) {
            _this.brainObject.rotation.set(_this.brainObject.rotation.x, _this.brainObject.rotation.y, _this.brainObject.rotation.z + leapRotationSpeed * mm);
            _this.colaObject.rotation.set(_this.colaObject.rotation.x, _this.colaObject.rotation.y, _this.colaObject.rotation.z + leapRotationSpeed * mm);
        });
        this.input.regLeapYCallback(function (mm) {
            _this.brainObject.rotation.set(_this.brainObject.rotation.x - leapRotationSpeed * mm, _this.brainObject.rotation.y, _this.brainObject.rotation.z);
            _this.colaObject.rotation.set(_this.colaObject.rotation.x - leapRotationSpeed * mm, _this.colaObject.rotation.y, _this.colaObject.rotation.z);
        });
        this.input.regMouseDragCallback(function (dx, dy, mode) {
<<<<<<< HEAD
            var SZ = {
                height: _this.jDiv.height(),
                width: _this.jDiv.width()
            };
            var pixelHeight = (_this.camera.top - _this.camera.bottom) / SZ.height;
            var pixelWidth = (_this.camera.right - _this.camera.left) / SZ.width;
            var pointer = _this.input.localPointerPosition();
            var raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(pointer, _this.camera);
            var inBoundingSphere = !!(raycaster.intersectObject(_this.brainSurfaceBoundingSphere, true).length);
            if (!inBoundingSphere) {
                if (_this.networkType == '3d') {
                    _this.colaObject.position.set(_this.colaObject.position.x + dx * pixelWidth, _this.colaObject.position.y - dy * pixelHeight, _this.colaObject.position.z);
                    return;
                }
                return;
            }
            // right button: rotation
            if (mode == 2) {
=======
            if (_this.isControllingGraphOnly)
                return;
            // right button: rotation
            if (mode == 3) {
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
                if (_this.autoRotation == false) {
                    var pixelAngleRatio = 50;
                    var quatX = new THREE.Quaternion();
                    var axisX = new THREE.Vector3(0, 1, 0);
                    quatX.setFromAxisAngle(axisX, dx / pixelAngleRatio); // axis must be normalised, angle in radians
                    _this.brainObject.quaternion.multiplyQuaternions(quatX, _this.brainObject.quaternion);
                    _this.colaObject.quaternion.multiplyQuaternions(quatX, _this.colaObject.quaternion);
                    var quatY = new THREE.Quaternion();
                    var axisY = new THREE.Vector3(1, 0, 0);
                    quatY.setFromAxisAngle(axisY, dy / pixelAngleRatio); // axis must be normalised, angle in radians
                    _this.brainObject.quaternion.multiplyQuaternions(quatY, _this.brainObject.quaternion);
                    _this.colaObject.quaternion.multiplyQuaternions(quatY, _this.colaObject.quaternion);
<<<<<<< HEAD
                    _this.saveBrainRotation();
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
                }
                else {
                    _this.mouse.dx = dx;
                    _this.mouse.dy = dy;
                }
            }
            // left button: pan
<<<<<<< HEAD
            else if (mode == 0) {
=======
            else if (mode == 1) {
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
                var pixelDistanceRatio = 1.6; // with: defaultCameraFov = 25; defaultViewWidth = 800;
                var defaultCameraFov = 25;
                var defaultViewWidth = 800;
                // move brain model
<<<<<<< HEAD
                //perspective camera
                //pixelDistanceRatio /= (this.camera.fov / defaultCameraFov);
                //pixelDistanceRatio *= (this.currentViewWidth / defaultViewWidth);
                //this.brainContainer.position.set(this.brainContainer.position.x + dx / pixelDistanceRatio, this.brainContainer.position.y - dy / pixelDistanceRatio, this.brainContainer.position.z);
                //this.colaObject.position.set(this.colaObject.position.x + dx / pixelDistanceRatio, this.colaObject.position.y - dy / pixelDistanceRatio, this.colaObject.position.z);
                //var prevQuaternion = this.brainContainer.quaternion.clone();
                //this.brainContainer.lookAt(this.camera.position);
                //orthographic camera
                // the height and width of each pixel in world space
                var pixelHeight_1 = (_this.camera.top - _this.camera.bottom) / SZ.height;
                var pixelWidth = (_this.camera.right - _this.camera.left) / SZ.width;
                //console.log({
                //    cameraWidth: cameraWidth,
                //    cameraHeight: cameraHeight
                //});
                // why is this causing the brain to rotate?
                _this.brainContainer.position.set(_this.brainContainer.position.x + dx * pixelWidth, _this.brainContainer.position.y - dy * pixelHeight_1, _this.brainContainer.position.z);
            }
        });
        this.input.regMouseLeftClickCallback(function (x, y) {
            console.log("regMouseLeftClickCallback");
=======
                pixelDistanceRatio /= (_this.camera.fov / defaultCameraFov);
                pixelDistanceRatio *= (_this.currentViewWidth / defaultViewWidth);
                _this.brainContainer.position.set(_this.brainContainer.position.x + dx / pixelDistanceRatio, _this.brainContainer.position.y - dy / pixelDistanceRatio, _this.brainContainer.position.z);
                _this.colaObject.position.set(_this.colaObject.position.x + dx / pixelDistanceRatio, _this.colaObject.position.y - dy / pixelDistanceRatio, _this.colaObject.position.z);
                var prevQuaternion = _this.brainContainer.quaternion.clone();
                _this.brainContainer.lookAt(_this.camera.position);
            }
        });
        this.input.regMouseLeftClickCallback(function (x, y) {
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
            var oldSelectedNodeID = _this.commonData.selectedNode;
            _this.commonData.selectedNode = -1;
            // Check if pointer is over 3D Model
            var node = _this.getNodeUnderPointer(_this.input.localPointerPosition());
            _this.getBoundingSphereUnderPointer(_this.input.localPointerPosition());
            // Check if pointer is over 2D Model in all view
            var nodeIDUnderPointer = -1;
            for (var i = 0; i < _this.commonData.nodeIDUnderPointer.length; i++) {
                if (_this.commonData.nodeIDUnderPointer[i] != -1) {
                    nodeIDUnderPointer = _this.commonData.nodeIDUnderPointer[i];
                    break;
                }
            }
            if (oldSelectedNodeID != -1) {
                // Deselect the previous selected node
                _this.physioGraph.deselectNode(oldSelectedNodeID);
                _this.colaGraph.deselectNode(oldSelectedNodeID);
                var varNodeID = oldSelectedNodeID;
                if (_this.networkType == "circular") {
                    var varMouseOutedCircularLayout = function (d) { _this.circularGraph.mouseOutedCircularLayout(d); };
                    _this.svgAllElements.selectAll(".nodeCircular")
                        .each(function (d) {
                        if (varNodeID == d.id)
                            varMouseOutedCircularLayout(d);
                    });
                }
                else if (_this.networkType == "2d") {
                    _this.svgNeedsUpdate = true;
                }
            }
            // If the pointer is pointing to any node in 2D or 3D graph
            if (node || (nodeIDUnderPointer != -1)) {
                _this.commonData.selectedNode = node ? node.userData.id : nodeIDUnderPointer;
                // Select the new node
                _this.physioGraph.selectNode(_this.commonData.selectedNode, false);
                _this.colaGraph.selectNode(_this.commonData.selectedNode, _this.ignore3dControl);
                var varNodeID = _this.commonData.selectedNode;
                if (_this.networkType == "circular") {
                    var varMouseOveredCircularLayout = function (d) { _this.circularGraph.mouseOveredCircularLayout(d); };
                    _this.svgAllElements.selectAll(".nodeCircular")
                        .each(function (d) {
                        if (varNodeID == d.id)
                            varMouseOveredCircularLayout(d);
                    });
                }
                else if (_this.networkType == "2d") {
                    _this.svgNeedsUpdate = true;
                }
<<<<<<< HEAD
                _this.physioGraph.update();
                _this.colaGraph.update();
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
            }
        });
        this.input.regMouseRightClickCallback(function (x, y) {
            if (_this.isControllingGraphOnly)
                return;
            var record;
            var node = _this.getNodeUnderPointer(_this.input.localPointerPosition());
            if (node) {
                record = _this.dataSet.getRecord(node.userData.id);
                record["color"] = node.material.color.getHex();
            }
            return record;
        });
        /* Double Click the viewport will reset the Model*/
        this.input.regMouseDoubleClickCallback(function () {
            if (_this.isControllingGraphOnly)
                return;
<<<<<<< HEAD
            //this.fovZoomRatio = 1;
            //this.camera.fov = this.defaultFov;
            _this.camera.updateProjectionMatrix();
            _this.brain3DModelDefaultXPosition = _this.camera.left + (_this.camera.right - _this.camera.left) / 4;
            _this.brainContainer.position.set(_this.brain3DModelDefaultXPosition, 0, 0);
            _this.brainContainer.lookAt(_this.camera.position);
            _this.brainObject.rotation.set(0, 0, 0);
            _this.colaObject.position.set(-_this.brain3DModelDefaultXPosition, 0, 0);
            _this.colaObject.rotation.set(0, 0, 0);
            _this.saveBrainRotation();
        });
        /* Interact with mouse wheel will zoom in and out the 3D Model */
        this.input.regMouseWheelCallback(function (delta) {
            var ZOOM_FACTOR = 50;
            if (_this.isControllingGraphOnly)
                return; // 2D Flat Version of the network
            var pointer = _this.input.localPointerPosition();
            //var pointerNDC = new THREE.Vector3(pointer.x, pointer.y, 1);
            // the box for the pointer is
            // [left edge, right edge]: [-1, 1]
            // [bottom edge, top edge]: [-1, 1]
            // I'm not zooming if the pointer is outside the fov
            if (Math.abs(pointer.x) > 1 || Math.abs(pointer.y) > 1) {
                return;
            }
            // point coordinates in normalized coordinates, from top-left [0, 0], bottom-right [1, 1]
            var pointerFrac = {
                x: (pointer.x + 1) / 2,
                y: (1 - pointer.y) / 2
            };
            //console.log({
            //    left: this.camera.left,
            //    right: this.camera.right,
            //    top: this.camera.top,
            //    bottom: this.camera.bottom
            //});
            //console.log(pointer);
            //console.log(pointerFrac);
            // expand or contract the box around the pointer location
            //let cameraAspect = (this.originalCameraBox.right - this.originalCameraBox.left) / (this.originalCameraBox.top - this.originalCameraBox.bottom);
            //console.log(this.originalCameraBox);
            // change the left proportionally to the location of the pointer in the screen
            // if the pointer is closer to the left then we zoom less on the left, more on the right
            var leftDelta = -(pointerFrac.x * CommonUtilities.sign(delta) * (_this.camera.right - _this.camera.left) / ZOOM_FACTOR);
            var rightDelta = (1 - pointerFrac.x) * CommonUtilities.sign(delta) * (_this.camera.right - _this.camera.left) / ZOOM_FACTOR;
            var topDelta = pointerFrac.y * CommonUtilities.sign(delta) * (_this.camera.top - _this.camera.bottom) / ZOOM_FACTOR;
            var bottomDelta = -((1 - pointerFrac.y) * CommonUtilities.sign(delta) * (_this.camera.top - _this.camera.bottom) / ZOOM_FACTOR);
            if ((_this.camera.left + leftDelta > _this.camera.right + rightDelta)
                || (_this.camera.bottom + bottomDelta > _this.camera.top + topDelta)) {
                return;
            }
            _this.camera.left += leftDelta;
            _this.camera.right += rightDelta;
            _this.camera.top += topDelta;
            _this.camera.bottom += bottomDelta;
            _this.brain3DModelDefaultXPosition = _this.camera.left + (_this.camera.right - _this.camera.left) / 4;
            _this.saveFileObj.surfaceSettings.brain3DModelDefaultXPosition = _this.brain3DModelDefaultXPosition;
            //this.camera.left -= pointerFrac.x * Math.sign(delta) * (this.originalCameraBox.right - this.originalCameraBox.left) / ZOOM_FACTOR;
            //this.camera.right += (1 - pointerFrac.x) * Math.sign(delta) * (this.originalCameraBox.right - this.originalCameraBox.left) / ZOOM_FACTOR * cameraAspect;
            //this.camera.top += pointerFrac.y * Math.sign(delta) * (this.originalCameraBox.top - this.originalCameraBox.bottom) / ZOOM_FACTOR / cameraAspect;
            //this.camera.bottom -= (1 - pointerFrac.y) * Math.sign(delta) * (this.originalCameraBox.top - this.originalCameraBox.bottom) / ZOOM_FACTOR / cameraAspect;
            // delta > 0 = zoom out, delta < 0 = zoom in
            // this zooms in and out from the centre, not the pointer
            // need to find a cap for this, i.e. maximum zoom in and zoom out
            //let XDelta = Math.sign(delta) * (this.originalCameraBox.right - this.originalCameraBox.left) / ZOOM_FACTOR;
            //let YDelta = Math.sign(delta) * (this.originalCameraBox.top - this.originalCameraBox.bottom) / ZOOM_FACTOR;
            // do not allow the box to "invert"
            //if ((this.camera.left - XDelta) > (this.camera.right + XDelta)
            //    || (this.camera.bottom - YDelta) > (this.camera.top + YDelta)) {
            //    return;
            //}
            //this.camera.left -= XDelta;
            //this.camera.right += XDelta;
            //this.camera.top += YDelta;
            //this.camera.bottom -= YDelta;
            //console.log("aspect : " + cameraAspect);
            //console.log("aspect after resize: " + (this.camera.right - this.camera.left) / (this.camera.top - this.camera.bottom));
            //pointerNDC.unproject(this.camera);
            //pointerNDC.sub(this.camera.position);
            // the perspective version wont work with the orthographic
            //this.camera.position.addVectors(this.camera.position, pointerNDC.setLength(delta < 0 ? ZOOM_FACTOR : -ZOOM_FACTOR));
            //var curZoom = this.camera.zoom;
            //this.camera.zoom = curZoom + Math.sign(delta) * 0.1;
            _this.camera.updateProjectionMatrix();
=======
            _this.fovZoomRatio = 1;
            _this.camera.fov = _this.defaultFov;
            _this.camera.updateProjectionMatrix();
            _this.brainContainer.position.set(-_this.graphOffset, 0, 0);
            _this.brainContainer.lookAt(_this.camera.position);
            _this.brainObject.rotation.set(0, 0, 0);
            _this.colaObject.position.set(_this.graphOffset, 0, 0);
            _this.colaObject.rotation.set(0, 0, 0);
        });
        /* Interact with mouse wheel will zoom in and out the 3D Model */
        this.input.regMouseWheelCallback(function (delta) {
            var ZOOM_FACTOR = 10;
            if (_this.isControllingGraphOnly)
                return; // 2D Flat Version of the network
            var pointer = _this.input.localPointerPosition();
            var pointerNDC = new THREE.Vector3(pointer.x, pointer.y, 1);
            pointerNDC.unproject(_this.camera);
            pointerNDC.sub(_this.camera.position);
            if (delta < 0) {
                _this.camera.position.addVectors(_this.camera.position, pointerNDC.setLength(ZOOM_FACTOR));
            }
            else {
                _this.camera.position.addVectors(_this.camera.position, pointerNDC.setLength(-ZOOM_FACTOR));
            }
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        });
        this.input.regGetRotationCallback(function () {
            var rotation = [];
            rotation.push(_this.brainObject.rotation.x);
            rotation.push(_this.brainObject.rotation.y);
            rotation.push(_this.brainObject.rotation.z);
            return rotation;
        });
        this.input.regSetRotationCallback(function (rotation) {
            if ((rotation) && (rotation.length == 3)) {
                _this.brainObject.rotation.set(rotation[0], rotation[1], rotation[2]);
                _this.colaObject.rotation.set(rotation[0], rotation[1], rotation[2]);
            }
        });
    };
    Brain3DApp.prototype.setBrainModelObject = function (modelObject) {
        this.brainModelOrigin = modelObject;
        this.setBrainMode(this.brainSurfaceMode);
    };
<<<<<<< HEAD
    Brain3DApp.prototype.saveBrainRotation = function () {
        this.saveFileObj.surfaceSettings.rotation = this.brainObject.quaternion.clone();
    };
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
    Brain3DApp.prototype.setBrainMode = function (mode) {
        this.brainSurfaceMode = mode;
        var model = this.brainModelOrigin;
        this.surfaceUniformList = [];
        var uniformList = this.surfaceUniformList;
        /*
        var normalShader = {
            vertexShader: [

                "uniform float mode;",
                "varying vec3 vNormal;",
                "varying vec3 vPosition;" ,

                THREE.ShaderChunk["morphtarget_pars_vertex"],

                "void main() {",
                    "vPosition = position;",
                    "vNormal = normalize( normalMatrix * normal );",

                    THREE.ShaderChunk["morphtarget_vertex"],
                    THREE.ShaderChunk["default_vertex"],

                "}"

            ].join("\n"),

            fragmentShader: [
                "uniform float mode;",
                "uniform float opacity;",
                "varying vec3 vNormal;",
                "varying vec3 vPosition;" +

                "void main() {",
                    "if (vPosition.x * mode >= 0.0){",
                        "vec3 color = vec3(0.9, 0.9, 0.9);",
                        "float dotProduct = dot( normalize(vNormal), normalize(vec3(0,0,1)));",
                        "gl_FragColor = vec4( color * dotProduct, opacity );",
                    "}else{",
                        "discard;",
                    "}",
                "}"

            ].join("\n")

        };
        */
        // Remove the old mesh and add the new one (we don't need a restart)
        this.brainObject.remove(this.brainSurface);
        var clonedObject = new THREE.Object3D();
        var boundingSphereObject = new THREE.Object3D();
        var surfaceMaterial = new THREE.MeshLambertMaterial({
            color: 0xcccccc,
            transparent: true,
            opacity: 0.5,
            //depthWrite: true,
            //depthTest: false,
            //side: THREE.FrontSide
            depthWrite: true,
            depthTest: true,
            side: THREE.FrontSide
        });
        if (model) {
            // Default mode: full brain model 
            if (mode == 0) {
                // Clone the mesh - we can't share it between different canvases without cloning it
                model.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        /*
                        this.uniforms = {
                            opacity: { type: "f", value: 0.5 },
                            mode: { type: 'f', value: 0.0 }
                        };
                        uniformList.push(this.uniforms);
    
                        clonedObject.add(new THREE.Mesh(child.geometry.clone(), new THREE.ShaderMaterial(<any>{
                            uniforms: this.uniforms,
                            vertexShader: normalShader.vertexShader,
                            fragmentShader: normalShader.fragmentShader,
                            transparent: true
                        })));
                        */
                        //clonedObject.add(new THREE.Mesh(child.geometry.clone(), surfaceMaterial));
                        var mesh = new THREE.Mesh(child.geometry.clone(), surfaceMaterial);
                        mesh.renderOrder = RENDER_ORDER_BRAIN;
                        clonedObject.add(mesh);
                        child.geometry.computeBoundingSphere();
                        var boundingSphere = child.geometry.boundingSphere;
                        var sphereMaterial = child.material.clone();
                        sphereMaterial.visible = false;
                        var sphereGeometry = new THREE.SphereGeometry(boundingSphere.radius + 10, 10, 10);
                        var sphereObject = new THREE.Mesh(sphereGeometry, sphereMaterial);
                        sphereObject.position.copy(boundingSphere.center);
                        boundingSphereObject.add(sphereObject);
                    }
                });
                // Medial View
            }
            else if (mode === 1) {
                // Clone the mesh - we can't share it between different canvases without cloning it
                model.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        /*
                        this.leftUniforms = {
                            opacity: { type: "f", value: 0.5 },
                            mode: { type: 'f', value: -1.0 }
                        };
    
                        this.rightUniforms = {
                            opacity: { type: "f", value: 0.5 },
                            mode: { type: 'f', value: 1.0 }
                        };
    
                        uniformList.push(this.leftUniforms);
                        uniformList.push(this.rightUniforms);
    
                        // left brain
                        var leftBrain = new THREE.Mesh(child.geometry.clone(), new THREE.ShaderMaterial(<any>{
                            uniforms: this.leftUniforms,
                            vertexShader: normalShader.vertexShader,
                            fragmentShader: normalShader.fragmentShader,
                            transparent: true
                        }));
                        leftBrain.renderDepth = 2;
                        var rightBrain = new THREE.Mesh(child.geometry.clone(), new THREE.ShaderMaterial(<any>{
                            uniforms: this.rightUniforms,
                            vertexShader: normalShader.vertexShader,
                            fragmentShader: normalShader.fragmentShader,
                            transparent: true
                        }));
                        rightBrain.renderDepth = 2;
                        */
                        // Need to edit geometries to "slice" them in half
                        // Each face is represented by a group 9 values (3 vertices * 3 dimensions). Move to other side if any face touches the right side (i.e. x > 0).
                        var attribute = child.geometry.getAttribute("position");
<<<<<<< HEAD
                        var oldPositions = Array.prototype.slice.call(attribute.array);
                        var leftPositions = [];
                        var rightPositions = [];
                        var FACE_CHUNK = 9;
                        var VERT_CHUNK = 3;
                        for (var faceIDX = 0; faceIDX < oldPositions.length; faceIDX += FACE_CHUNK) {
                            if (oldPositions[faceIDX] > 0 || oldPositions[faceIDX + 3] > 0 || oldPositions[faceIDX + 6] > 0) {
                                rightPositions.push(oldPositions[faceIDX], oldPositions[faceIDX + 1], oldPositions[faceIDX + 2], oldPositions[faceIDX + 3], oldPositions[faceIDX + 4], oldPositions[faceIDX + 5], oldPositions[faceIDX + 6], oldPositions[faceIDX + 7], oldPositions[faceIDX + 8]);
                            }
                            else {
                                leftPositions.push(oldPositions[faceIDX], oldPositions[faceIDX + 1], oldPositions[faceIDX + 2], oldPositions[faceIDX + 3], oldPositions[faceIDX + 4], oldPositions[faceIDX + 5], oldPositions[faceIDX + 6], oldPositions[faceIDX + 7], oldPositions[faceIDX + 8]);
=======
                        var leftPositions = Array.prototype.slice.call(attribute.array);
                        var rightPositions = [];
                        var FACE_CHUNK = 9;
                        var VERT_CHUNK = 3;
                        var i = leftPositions.length - VERT_CHUNK; // Start from last x position
                        while (i -= VERT_CHUNK) {
                            if (leftPositions[i] > 0) {
                                // Move whole face to other geometry
                                var faceStart = Math.floor(i / FACE_CHUNK) * FACE_CHUNK;
                                rightPositions.push.apply(rightPositions, leftPositions.splice(faceStart, FACE_CHUNK));
                                i = faceStart;
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
                            }
                        }
                        var leftGeometry = new THREE.BufferGeometry;
                        leftGeometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array(leftPositions), VERT_CHUNK));
                        leftGeometry.computeVertexNormals();
                        leftGeometry.computeFaceNormals();
                        var leftBrain = new THREE.Mesh(leftGeometry, surfaceMaterial);
                        leftBrain.renderOrder = RENDER_ORDER_BRAIN;
                        var rightGeometry = new THREE.BufferGeometry;
                        rightGeometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array(rightPositions), VERT_CHUNK));
                        rightGeometry.computeVertexNormals();
                        rightGeometry.computeFaceNormals();
                        var rightBrain = new THREE.Mesh(rightGeometry, surfaceMaterial);
                        rightBrain.renderOrder = RENDER_ORDER_BRAIN;
                        var box = new THREE.Box3()['setFromObject'](model);
                        leftBrain.rotation.z = 3.14 / 2;
                        rightBrain.rotation.z = -3.14 / 2;
                        // center the brain along y axis
                        var mean = (box.max.z - box.min.z) / 2;
                        var offsetToHead = box.max.z - mean;
                        var offsetDistance = 10;
                        leftBrain.translateY(offsetToHead);
                        rightBrain.translateY(offsetToHead);
                        leftBrain.translateZ(-(box.max.z + offsetDistance));
                        rightBrain.translateZ(Math.abs(box.min.z) + offsetDistance);
                        clonedObject.add(leftBrain);
                        clonedObject.add(rightBrain);
                        child.geometry.computeBoundingSphere();
                        var boundingSphere = child.geometry.boundingSphere;
                        var material = child.material.clone();
                        material.visible = false;
                        var sphereGeometry = new THREE.SphereGeometry(boundingSphere.radius + 10, 10, 10);
                        var sphereObject = new THREE.Mesh(sphereGeometry, material);
                        sphereObject.position.copy(boundingSphere.center);
                        boundingSphereObject.add(sphereObject);
                    }
                });
            }
            else {
                console.log("ERROR: Wrong Brain Surface Mode");
                return;
            }
        }
        //clonedObject.renderOrder = RENDER_ORDER_BRAIN;
        this.brainSurface = clonedObject;
        this.brainObject.add(this.brainSurface);
        this.brainSurfaceBoundingSphere = boundingSphereObject;
        this.brainObject.add(this.brainSurfaceBoundingSphere);
        this.surfaceLoaded = true;
        // update Physio Graph if exists
        if (!this.dataSet)
            return;
        if (this.brainSurfaceMode === 0) {
            this.filteredAdjMatrix = this.dataSet.adjMatrixFromEdgeCount(Number(this.edgeCountSliderValue));
        }
        else {
            this.filteredAdjMatrix = this.dataSet.adjMatrixWithoutEdgesCrossHemisphere(Number(this.edgeCountSliderValue));
<<<<<<< HEAD
            // tried to see what it would look like if we included interhemispheric edges in the split mode
            // it wasnt nice
            //this.filteredAdjMatrix = this.dataSet.adjMatrixFromEdgeCount(Number(this.edgeCountSliderValue));
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        }
        this.physioGraph.findNodeConnectivity(this.filteredAdjMatrix, this.dissimilarityMatrix);
        this.physioGraph.setEdgeVisibilities(this.filteredAdjMatrix);
    };
    Brain3DApp.prototype.setSurfaceOpacity = function (opacity) {
        for (var _i = 0, _a = this.brainSurface.children; _i < _a.length; _i++) {
            var object = _a[_i];
            object.material.opacity = opacity;
            object.material.needsUpdate = true;
        }
    };
    Brain3DApp.prototype.setSurfaceColor = function (color) {
        for (var _i = 0, _a = this.brainSurface.children; _i < _a.length; _i++) {
            var object = _a[_i];
            object.material.color.set(color);
        }
    };
<<<<<<< HEAD
    Brain3DApp.prototype.setSurfaceRotation = function (quat) {
        if (this.brainObject) {
            this.brainObject.quaternion.set(quat._x, quat._y, quat._z, quat._w);
        }
        if (this.colaObject) {
            this.colaObject.quaternion.set(quat._x, quat._y, quat._z, quat._w);
        }
    };
    Brain3DApp.prototype.setBrainSurfacePosition = function (posFrac) {
        if (this.brainObject) {
            this.brainContainer.position.set(this.camera.left + posFrac.x * (this.camera.right - this.camera.left), this.camera.bottom + posFrac.y * (this.camera.top - this.camera.bottom), 0);
        }
    };
    Brain3DApp.prototype.setColaSurfacePosition = function (pos) {
        if (this.colaObject) {
            this.colaObject.position.set(pos.x, pos.y, pos.z);
        }
    };
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
    Brain3DApp.prototype.setEdgeTransitionColor = function (color) {
        if ((!this.physioGraph) || (!this.colaGraph))
            return;
        this.edgeTransitionColor = color;
        this.physioGraph.setEdgeColorConfig(this.colorMode, {
            edgeTransitionColor: this.edgeTransitionColor,
            useTransitionColor: this.useTransitionColor
        });
        this.colaGraph.setEdgeColorConfig(this.colorMode, {
            edgeTransitionColor: this.edgeTransitionColor,
            useTransitionColor: this.useTransitionColor
        });
        this.svgNeedsUpdate = true;
        this.needUpdate = true;
        if (this.circularGraph)
            this.circularGraph.circularLayoutEdgeColorModeOnChange(this.colorMode, {
                edgeTransitionColor: this.edgeTransitionColor,
                useTransitionColor: this.useTransitionColor
            });
    };
    Brain3DApp.prototype.setUseTransitionColor = function (useColor) {
        if ((!this.physioGraph) || (!this.colaGraph))
            return;
        this.useTransitionColor = useColor;
        this.physioGraph.setEdgeColorConfig(this.colorMode, {
            edgeTransitionColor: this.edgeTransitionColor,
            useTransitionColor: this.useTransitionColor
        });
        this.colaGraph.setEdgeColorConfig(this.colorMode, {
            edgeTransitionColor: this.edgeTransitionColor,
            useTransitionColor: this.useTransitionColor
        });
        this.svgNeedsUpdate = true;
        this.needUpdate = true;
        if (this.circularGraph)
            this.circularGraph.circularLayoutEdgeColorModeOnChange(this.colorMode, {
                edgeTransitionColor: this.edgeTransitionColor,
                useTransitionColor: this.useTransitionColor
            });
    };
    Brain3DApp.prototype.getDrawingCanvas = function () {
        if (this.renderer)
            return this.renderer.domElement;
    };
    Brain3DApp.prototype.save = function (app) {
        app.edgeCount = this.edgeCountSliderValue;
        app.brainSurfaceMode = this.brainSurfaceMode;
        app.showingTopologyNetwork = this.showingTopologyNetwork;
        app.networkType = this.networkType == undefined ? "" : this.networkType;
        if (this.circularGraph) {
            app.circularBundleAttribute = this.circularGraph.circularBundleAttribute;
            app.circularSortAttribute = this.circularGraph.circularSortAttribute;
            app.circularLabelAttribute = this.circularGraph.circularLabelAttribute;
            app.circularAttributeBars = this.circularGraph.attributeBars;
        }
        else {
            console.log("ERROR: circularGraph is NULL");
        }
        if (this.canvasGraph) {
            app.layout2d = this.canvasGraph.layout;
            app.bundle2d = this.canvasGraph.groupNodesBy;
            app.scale2d = this.canvasGraph.scale;
        }
        else {
            console.log("ERROR: canvasGraph is NULL");
        }
    };
    Brain3DApp.prototype.initEdgeCountSlider = function (app) {
        this.edgeCountSliderOnChange(app.edgeCount);
        $('#edge-count-slider-' + this.id)['bootstrapSlider']("setValue", parseInt(app.edgeCount));
    };
    Brain3DApp.prototype.initShowNetwork = function (app) {
<<<<<<< HEAD
        console.log("initShowNetwork()");
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        if (app.showingTopologyNetwork) {
            $("#select-network-type-".concat(this.id, "-").concat(app.networkType)).addClass("active");
            this.networkTypeOnChange(app.networkType);
            if (app.networkType == "circular") {
                $('#select-circular-layout-bundle-' + this.id).val(app.circularBundleAttribute);
                $('#select-circular-layout-sort-' + this.id).val(app.circularSortAttribute);
                $('#select-circular-label-' + this.id).val(app.circularLabelAttribute);
                $('#checkbox-circular-edge-gradient-' + this.id).prop('checked', app.circularEdgeGradient);
                if (app.circularAttributeBars && app.circularAttributeBars.length > 0) {
                    for (var bar in app.circularAttributeBars) {
                        this.circularGraph.addAttributeBar();
                    }
                    for (var barIndex in app.circularAttributeBars) {
                        $('#select-circular-layout-attribute-' + app.circularAttributeBars[barIndex].id + '-' + this.id).val(app.circularAttributeBars[barIndex].attribute);
                        $('#input-circular-layout-bar' + app.circularAttributeBars[barIndex].id + '-color').val(app.circularAttributeBars[barIndex].color.substring(1));
                        this.circularGraph.circularLayoutAttributeOnChange(app.circularAttributeBars[barIndex].id, app.circularAttributeBars[barIndex].attribute);
                        this.circularGraph.updateCircularBarColor(app.circularAttributeBars[barIndex].id, app.circularAttributeBars[barIndex].color);
                    }
                }
                this.circularGraph.circularBundleAttribute = app.circularBundleAttribute;
                this.circularGraph.circularSortAttribute = app.circularSortAttribute;
                this.circularGraph.circularLabelAttribute = app.circularLabelAttribute;
                this.circularGraph.updateAllAttributeBars();
            }
            else if (app.networkType == "2d") {
                $('#select-graph2d-layout-' + this.id).val(app.layout2d);
                $('#select-graph2d-group-' + this.id).val(app.bundle2d);
                $("#div-scale-slider-alt-" + this.id)['bootstrapSlider']("setValue", app.scale2d);
                this.canvasGraph.layout = app.layout2d;
                this.canvasGraph.groupNodesBy = app.bundle2d;
                this.canvasGraph.scale = app.scale2d;
                // Don't try to update if it hasn't had the initial layout generation run yet
                if (this.canvasGraph.nodes.length) {
                    this.canvasGraph.updateGraph();
                    this.canvasGraph.settingOnChange();
                }
            }
        }
        else {
            $("#select-network-type-".concat(this.id, "-none")).addClass("active");
        }
    };
    Brain3DApp.prototype.closeBrainAppOnClick = function () {
        this.jDiv.empty();
        if (this.id == 0) {
            this.jDiv.css({ backgroundColor: '#ffe5e5' });
        }
        else if (this.id == 1) {
            this.jDiv.css({ backgroundColor: '#d7e8ff' });
        }
        else if (this.id == 2) {
            this.jDiv.css({ backgroundColor: '#fcffb2' });
        }
        else if (this.id == 3) {
            this.jDiv.css({ backgroundColor: '#d2ffbd' });
        }
        this.deleted = true;
    };
    /* This function is linked with html codes and called when the new option is selected */
    Brain3DApp.prototype.networkTypeOnChange = function (type) {
        this.networkType = type;
        if (type === "circular" && this.circularGraph) {
            this.circularGraph.setupOptionMenuUI(); // add options button to the page
            this.svg.attr("visibility", "visible");
            $(this.graph2dContainer).hide();
<<<<<<< HEAD
            for (var bar in this.circularGraph.attributeBars) {
                this.circularGraph.addAttributeBarElements(this.circularGraph.attributeBars[bar]);
            }
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        }
        else {
            // hide options button
            $('#button-circular-layout-histogram-' + this.id).hide();
        }
        if (type === "2d" && this.canvasGraph) {
            this.canvasGraph.setupOptionMenuUI(); // add options button to the page
            this.svg.attr("visibility", "hidden");
            $(this.graph2dContainer).show();
        }
        else {
            // hide options button
            $('#button-graph2d-option-menu-' + this.id).hide();
            $(this.graph2dContainer).hide();
        }
        if (type === "none") {
            this.svg.attr("visibility", "hidden");
            $(this.graph2dContainer).hide();
            this.colaGraph.setVisible(false);
        }
        if (this.colaGraph && this.colaGraph.isVisible()) {
            this.showNetwork(true);
        }
        else {
            this.showNetwork(false);
        }
    };
    Brain3DApp.prototype.defaultOrientationsOnClick = function (orientation) {
        if (!orientation)
            return;
        //record display settting
        $('#display_settings_mode').val(orientation);
        switch (orientation) {
            case "top":
                this.brainObject.rotation.set(0, 0, 0);
                this.colaObject.rotation.set(0, 0, 0);
                break;
            case "bottom":
                this.brainObject.rotation.set(0, Math.PI, 0);
                this.colaObject.rotation.set(0, Math.PI, 0);
                break;
            case "left":
                this.brainObject.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
                this.colaObject.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
                break;
            case "right":
                this.brainObject.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
                this.colaObject.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
                break;
            case "front":
                this.brainObject.rotation.set(-Math.PI / 2, 0, Math.PI);
                this.colaObject.rotation.set(-Math.PI / 2, 0, Math.PI);
                break;
            case "back":
                this.brainObject.rotation.set(-Math.PI / 2, 0, 0);
                this.colaObject.rotation.set(-Math.PI / 2, 0, 0);
                break;
        }
    };
    Brain3DApp.prototype.graphViewSliderOnChange = function (value) {
        this.colaGraph.setNodePositionsLerp(this.physioGraph.nodePositions, this.colaCoords, value / 100);
    };
    Brain3DApp.prototype.edgeCountSliderOnChange = function (numEdges) {
        this.edgeCountSliderValue = numEdges;
        if (!this.dataSet.sortedSimilarities)
            return;
        var max = this.dataSet.sortedSimilarities.length;
        if (numEdges > max)
            numEdges = max;
        var $count = $('#count-' + this.id).get(0);
        if ($count)
            $count.textContent = numEdges;
        var percentile = numEdges * 100 / max;
        var $percentile = $('#percentile-' + this.id).get(0);
        if ($percentile)
            $percentile.textContent = percentile.toFixed(2);
        if (this.brainSurfaceMode === 0) {
            this.filteredAdjMatrix = this.dataSet.adjMatrixFromEdgeCount(numEdges);
        }
        else {
<<<<<<< HEAD
            //this.filteredAdjMatrix = this.dataSet.adjMatrixFromEdgeCount(numEdges);
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
            this.filteredAdjMatrix = this.dataSet.adjMatrixWithoutEdgesCrossHemisphere(numEdges);
        }
        if (this.physioGraph) {
            this.physioGraph.findNodeConnectivity(this.filteredAdjMatrix, this.dissimilarityMatrix);
            this.physioGraph.setEdgeVisibilities(this.filteredAdjMatrix);
        }
    };
    Brain3DApp.prototype.edgeThicknessByWeightOnChange = function (bool) {
        if ((!this.physioGraph) || (!this.colaGraph))
            return;
        this.weightEdges = bool;
        this.physioGraph.edgeThicknessByWeight = this.weightEdges;
        this.colaGraph.edgeThicknessByWeight = this.weightEdges;
        if (this.weightEdges) {
            $('#weight-edges-' + this.id).css('opacity', 1);
        }
        else {
            $('#weight-edges-' + this.id).css('opacity', 0.2);
        }
        this.svgNeedsUpdate = true;
    };
    Brain3DApp.prototype.edgeColorOnChange = function (colorMode, config) {
        if ((!this.physioGraph) || (!this.colaGraph))
            return;
        this.colorMode = colorMode;
        this.colorConfig = config;
        this.physioGraph.setEdgeColorConfig(this.colorMode, config);
        this.colaGraph.setEdgeColorConfig(this.colorMode, config);
        if (this.circularGraph)
            this.circularGraph.circularLayoutEdgeColorModeOnChange(colorMode, config);
        this.svgNeedsUpdate = true;
        this.needUpdate = true;
    };
    Brain3DApp.prototype.edgesBundlingOnChange = function () {
        if ((!this.physioGraph) || (!this.colaGraph)) {
            this.removeProcessingNotification();
            return;
        }
        this.bundlingEdges = !this.bundlingEdges;
        if (this.bundlingEdges) {
            $('#bundling-edges-' + this.id).css('opacity', 1);
        }
        else {
            $('#bundling-edges-' + this.id).css('opacity', 0.2);
            this.physioGraph.removeAllBundlingEdges();
            this.physioGraph.findNodeConnectivity(this.filteredAdjMatrix, this.dissimilarityMatrix);
            this.physioGraph.setEdgeVisibilities(this.filteredAdjMatrix);
        }
        this.removeProcessingNotification();
    };
    Brain3DApp.prototype.showProcessingNotification = function () {
        //$('body').css({ cursor: 'wait' });
        document.body.appendChild(this.jDivProcessingNotification);
        $('#div-processing-notification').empty(); // empty this.rightClickLabel
        this.jDivProcessingNotification.style.position = 'absolute';
        this.jDivProcessingNotification.style.left = '50%';
        this.jDivProcessingNotification.style.top = '50%';
        this.jDivProcessingNotification.style.padding = '5px';
        this.jDivProcessingNotification.style.borderRadius = '2px';
        this.jDivProcessingNotification.style.zIndex = '1';
        this.jDivProcessingNotification.style.backgroundColor = '#feeebd'; // the color of the control panel
        var text = document.createElement('div');
        text.innerHTML = "Processing...";
        this.jDivProcessingNotification.appendChild(text);
    };
    Brain3DApp.prototype.removeProcessingNotification = function () {
        if ($('#div-processing-notification').length > 0)
            document.body.removeChild(this.jDivProcessingNotification);
    };
    Brain3DApp.prototype.autoRotationOnChange = function (s) {
        this.autoRotation = !this.autoRotation;
        //record display settting
        $('#display_settings_rotation').val(String(this.autoRotation));
        this.mouse.dx = 0;
        this.mouse.dy = 0;
        // set default rotation
        if (this.autoRotation) {
            $('#anti-auto-rotation-' + this.id).css('opacity', 1);
            if (s == "anticlockwise") {
                this.mouse.dx = 1;
                this.mouse.dy = 0;
            }
        }
        else {
            $('#anti-auto-rotation-' + this.id).css('opacity', 0.2);
        }
    };
    Brain3DApp.prototype.allLabelsOnChange = function () {
        if ((!this.physioGraph) || (!this.colaGraph))
            return;
        this.allLabels = !this.allLabels;
        //record display settting
        $('#display_settings_labels').val(String(this.allLabels));
        this.physioGraph.allLabels = this.allLabels;
        this.colaGraph.allLabels = this.allLabels;
        if (this.allLabels) {
            $('#all-labels-' + this.id).css('opacity', 1);
            //this.physioGraph.showAllLabels(false, false);
            //this.colaGraph.showAllLabels(this.ignore3dControl, true);
            this.physioGraph.showAllLabels(false);
            this.colaGraph.showAllLabels(this.ignore3dControl);
        }
        else {
            $('#all-labels-' + this.id).css('opacity', 0.2);
            this.physioGraph.hideAllLabels();
            this.colaGraph.hideAllLabels();
        }
        this.svgNeedsUpdate = true;
    };
    Brain3DApp.prototype.showNetwork = function (switchNetworkType, callback) {
        var _this = this;
        if (!this.brainObject || !this.colaObject || !this.physioGraph || !this.colaGraph || !this.networkType || !this.dataSet.brainCoords.length || !this.dataSet.brainCoords[0].length)
            return;
        CommonUtilities.launchAlertMessage(CommonUtilities.alertType.INFO, "Generating new graph layout...");
        // Change the text of the button to "Topology"
        this.showingTopologyNetwork = true;
        if (this.bundlingEdges)
            this.edgesBundlingOnChange(); // turn off edge bundling
        // Wrap long-running changes in a short timeout so we don't block the UI
        window.setTimeout(function () {
            // Leave *showingCola* on permanently after first turn-on
            //this.showingCola = true;
            var edges = [];
            _this.colaGraph.filteredNodeIDs = _this.physioGraph.filteredNodeIDs;
            _this.colaGraph.findNodeConnectivity(_this.filteredAdjMatrix, _this.dissimilarityMatrix, edges);
            _this.colaGraph.setNodeVisibilities(); // Hide the nodes without neighbours
            _this.colaGraph.setEdgeVisibilities(_this.filteredAdjMatrix); // Hide the edges that have not been selected
            if (_this.allLabels) {
                _this.colaGraph.showAllLabels(_this.ignore3dControl);
            }
            //-------------------------------------------------------------------------------------------------------------
            // 3d cola graph
            var getSourceIndex = function (e) {
                return e.source;
            };
            var getTargetIndex = function (e) {
                return e.target;
            };
            var varType = _this.networkType;
            // Create the distance matrix that Cola needs
            var distanceMatrix = (new cola.shortestpaths.Calculator(_this.dataSet.info.nodeCount, edges, getSourceIndex, getTargetIndex, function (e) { return 1; })).DistanceMatrix();
            var D = cola.Descent.createSquareMatrix(_this.dataSet.info.nodeCount, function (i, j) {
                return distanceMatrix[i][j] * _this.colaLinkDistance;
            });
            var clonedPhysioCoords = _this.dataSet.brainCoords.map(function (dim) {
                return dim.map(function (element) {
                    return element;
                });
            });
            _this.descent = new cola.Descent(clonedPhysioCoords, D); // Create the solver
            var originColaCoords;
            if (switchNetworkType) {
                if (_this.colaCoords) {
                    originColaCoords = _this.colaCoords.map(function (array) {
                        return array.slice(0);
                    });
                }
            }
            else {
                originColaCoords = _this.dataSet.brainCoords.map(function (array) {
                    return array.slice(0);
                });
            }
            _this.colaCoords = _this.descent.x; // Hold a reference to the solver's coordinates
            // Relieve some of the initial stress
            for (var i_1 = 0; i_1 < 10; ++i_1) {
                _this.descent.reduceStress();
            }
            // Offset unconnected nodes
            var i = _this.colaGraph.nodeMeshes.length;
            while (i--) {
                var mesh = _this.colaGraph.nodeMeshes[i];
                if (!mesh.userData.hasVisibleEdges) {
                    _this.colaCoords[0][i] *= 0.6;
                    _this.colaCoords[1][i] *= 0.6;
                    _this.colaCoords[1][i] -= (_this.graphOffset * 0.7);
                    _this.colaCoords[2][i] *= 0.6;
                }
                else {
                    _this.colaCoords[1][i] += (_this.graphOffset * 0.4);
                }
            }
            // clear svg graphs
            if (_this.ignore3dControl) {
                // clear  circular
                _this.circularGraph.clear();
                _this.ignore3dControl = false;
            }
            //-------------------------------------------------------------------------------------------------------------
            // animation
            if (_this.networkType == 'circular') { // There's no animation for this ... 
                _this.ignore3dControl = true;
                _this.svgNeedsUpdate = true;
                _this.colaGraph.setVisible(false); // turn off 3D and 2D graph
                if ($('#select-circular-layout-bundle-' + _this.id).length <= 0)
                    return;
                if ($('#select-circular-layout-sort-' + _this.id).length <= 0)
                    return;
                // Update Cola Graph used in Circular Graph and then recreate it
                // update share data
                _this.circularGraph.circularEdgeColorMode = _this.colorMode;
                _this.circularGraph.circularEdgeDirectionMode = _this.directionMode;
                _this.circularGraph.setColaGraph(_this.physioGraph);
                _this.circularGraph.create();
            }
            else if (_this.networkType == '2d') {
                // Also not animated
                _this.ignore3dControl = true;
                _this.canvasGraph.updateGraph();
                _this.colaGraph.setVisible(false);
            }
            else if (_this.networkType == '3d') {
                // Set up a coroutine to do the animation
                var origin = new THREE.Vector3(_this.brainContainer.position.x, _this.brainContainer.position.y, _this.brainContainer.position.z);
                var target = new THREE.Vector3(_this.brainContainer.position.x + 2 * _this.graphOffset, _this.brainContainer.position.y, _this.brainContainer.position.z);
                _this.colaObjectAnimation(origin, target, originColaCoords, _this.colaCoords, switchNetworkType, true);
            }
            CommonUtilities.launchAlertMessage(CommonUtilities.alertType.INFO, "Graph layout done");
            if (callback)
                callback();
        }, 0);
    };
    Brain3DApp.prototype.cross = function (u, v) {
        if (!u || !v)
            return;
        var u1 = u[0];
        var u2 = u[1];
        var u3 = u[2];
        var v1 = v[0];
        var v2 = v[1];
        var v3 = v[2];
        var cross = [u2 * v3 - u3 * v2, u3 * v1 - u1 * v3, u1 * v2 - u2 * v1];
        return cross;
    };
    Brain3DApp.prototype.angle = function (u, v) {
        if (!u || !v)
            return;
        var costheta = numeric.dot(u, v) / (numeric.norm2(u) * numeric.norm2(v));
        var theta = Math.acos(costheta);
        return theta;
    };
    Brain3DApp.prototype.threeToSVGAnimation = function (transitionFinish) {
        this.colaGraph.setVisible(false);
        this.ignore3dControl = true;
        this.svgNeedsUpdate = true;
        this.transitionInProgress = false;
        // Enable the vertical slider
        $('#graph-view-slider-' + this.id).css({ visibility: 'visible' });
        $('#graph-view-slider-' + this.id).val('100');
        //$('#button-show-network-' + this.id).prop('disabled', false);
        $('#select-network-type-' + this.id + '-button').prop('disabled', false);
        $('#graph-view-slider-' + this.id).prop('disabled', false);
    };
    Brain3DApp.prototype.colaObjectAnimation = function (colaObjectOrigin, colaObjectTarget, nodeCoordOrigin, nodeCoordTarget, switchNetworkType, transitionFinish) {
        var _this = this;
        this.colaGraph.setVisible(true);
        // turn the opacity on again 
        this.colaGraph.setEdgeOpacity(1);
        var children = this.colaGraph.rootObject.children;
        for (var i = 0; i < children.length; i++) {
            children[i].material.opacity = 1;
        }
        this.transitionInProgress = true;
        //$('#button-show-network-' + this.id).prop('disabled', true);    
        $('#graph-view-slider-' + this.id).prop('disabled', true);
        if (switchNetworkType) {
            this.colaObject.position.copy(colaObjectTarget);
        }
        else {
            this.colaObject.position.copy(colaObjectOrigin);
        }
        setCoroutine({ currentTime: 0, endTime: this.modeLerpLength }, function (o, deltaTime) {
            o.currentTime += deltaTime;
            if (o.currentTime >= o.endTime) { // The animation has finished
                _this.colaObject.position.copy(colaObjectTarget);
                _this.colaGraph.setNodePositions(nodeCoordTarget);
                if (transitionFinish) {
                    _this.transitionInProgress = false;
                    _this.needUpdate = true;
                    // Enable the vertical slider
                    $('#graph-view-slider-' + _this.id).css({ visibility: 'visible' });
                    $('#graph-view-slider-' + _this.id).val('100');
                    //$('#button-show-network-' + this.id).prop('disabled', false);
                    $('#graph-view-slider-' + _this.id).prop('disabled', false);
                }
                return true;
            }
            else { // Update the animation
                var percentDone = o.currentTime / o.endTime;
                _this.needUpdate = true;
                _this.colaGraph.setNodePositionsLerp(nodeCoordOrigin, nodeCoordTarget, percentDone);
                if (switchNetworkType == false) {
                    var pos = colaObjectOrigin.clone().add(colaObjectTarget.clone().sub(colaObjectOrigin).multiplyScalar(percentDone));
                    _this.colaObject.position.set(pos.x, pos.y, pos.z);
                }
                return false;
            }
        });
    };
    Brain3DApp.prototype.svgZoom = function () {
        if (this.isControllingGraphOnly) {
            this.svgAllElements.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }
    };
    Brain3DApp.prototype.mouseOveredSetNodeID = function (id) {
        this.commonData.nodeIDUnderPointer[4] = id;
    };
    Brain3DApp.prototype.mouseOutedSetNodeID = function () {
        this.commonData.nodeIDUnderPointer[4] = -1;
    };
    Brain3DApp.prototype.createSVGLinearGradient = function (id, stops) {
        var svgNS = this.svg.namespaceURI;
        var grad = document.createElementNS(svgNS, 'linearGradient');
        grad.setAttribute('id', id);
        for (var i = 0; i < stops.length; i++) {
            var attrs = stops[i];
            var stop = document.createElementNS(svgNS, 'stop');
            for (var attr in attrs) {
                if (attrs.hasOwnProperty(attr))
                    stop.setAttribute(attr, attrs[attr]);
            }
            grad.appendChild(stop);
        }
        this.svgDefs.appendChild(grad);
    };
    Brain3DApp.prototype.createMarker = function () {
        var svgNS = this.svg.namespaceURI;
        var path = document.createElementNS(svgNS, 'path');
        path.setAttribute("d", "M 0,0 V 4 L6,2 Z");
        var marker = document.createElementNS(svgNS, 'marker');
        marker.setAttribute("id", "markerArrow");
        marker.setAttribute("markerWidth", "30");
        marker.setAttribute("markerHeight", "30");
        marker.setAttribute("refx", "2");
        marker.setAttribute("refy", "7");
        marker.setAttribute("orient", "auto");
        marker.appendChild(path);
        this.svgDefs.appendChild(marker);
    };
    Brain3DApp.prototype.isDeleted = function () {
        return this.deleted;
    };
    Brain3DApp.prototype.applyFilter = function (filteredIDs) {
        if (!this.dataSet || !this.dataSet.attributes)
            return;
        if (this.bundlingEdges)
            this.edgesBundlingOnChange(); // turn off edge bundling
        this.physioGraph.filteredNodeIDs = filteredIDs;
        this.physioGraph.setNodeVisibilities();
        this.physioGraph.findNodeConnectivity(this.filteredAdjMatrix, this.dissimilarityMatrix);
        this.physioGraph.setEdgeVisibilities(this.filteredAdjMatrix);
        this.showNetwork(false);
    };
    //////////////////////////////////////////////////
    /// Node Attributes //////////////////////////////
    //////////////////////////////////////////////////
    Brain3DApp.prototype.highlightSelectedNodes = function (filteredIDs) {
        if (!this.dataSet || !this.dataSet.attributes)
            return;
        this.physioGraph.highlightSelectedNodes(filteredIDs);
        this.colaGraph.highlightSelectedNodes(filteredIDs);
        //TODO: add highlight for other graphs
        this.svgNeedsUpdate = true;
    };
    Brain3DApp.prototype.setNodeDefaultSizeColor = function () {
        // set default node color and scale
        this.physioGraph.setDefaultNodeColor();
        this.colaGraph.setDefaultNodeColor();
        this.physioGraph.setDefaultNodeScale();
        this.colaGraph.setDefaultNodeScale();
        this.svgNeedsUpdate = true;
    };
    Brain3DApp.prototype.setNodeSize = function (scaleArray) {
        this.physioGraph.setNodesScale(scaleArray);
        this.colaGraph.setNodesScale(scaleArray);
        this.svgNeedsUpdate = true;
    };
    Brain3DApp.prototype.setANodeColor = function (nodeID, color) {
        var value = parseInt(color.replace("#", "0x"));
        this.physioGraph.setNodeColor(nodeID, value);
        this.colaGraph.setNodeColor(nodeID, value);
        this.svgNeedsUpdate = true;
    };
    Brain3DApp.prototype.setNodeColor = function (attribute, minColor, maxColor) {
        if (!attribute || !minColor || !maxColor) {
            //to avoid the freeze, accordingto current designed these errors should go to logs
            //throw "Invalid arguments for setNodeColor."
            CommonUtilities.launchAlertMessage(CommonUtilities.alertType.INFO, "Attributes are empty. Load a valid attributes file.");
            return;
        }
        if (!this.dataSet || !this.dataSet.attributes) {
            //to avoid the freeze, accordingto current designed these errors should go to logs
            //throw "Dataset is not loaded or does not contain attributes.";
            CommonUtilities.launchAlertMessage(CommonUtilities.alertType.ERROR, "Dataset is not loaded or does not contain attributes.");
            return;
        }
        var attrArray = this.dataSet.attributes.get(attribute);
        if (!attrArray) {
            //to avoid the freeze, accordingto current designed these errors should go to logs
            //throw "Attribute " + attribute + " does not exist.";
            CommonUtilities.launchAlertMessage(CommonUtilities.alertType.ERROR, "Invalid arguments for setNodeColor.");
            return;
        }
        var colorArray = this.getNodeColors(attribute, parseInt(minColor.replace("#", "0x")), parseInt(maxColor.replace("#", "0x")));
        if (!colorArray) {
            //to avoid the freeze, accordingto current designed these errors should go to logs
            //throw "Encountered error in generating color array.";
            CommonUtilities.launchAlertMessage(CommonUtilities.alertType.ERROR, "Encountered error in generating color array.");
            return;
        }
        // update graphs
        if (this.physioGraph)
            this.physioGraph.setNodesColor(colorArray);
        if (this.colaGraph)
            this.colaGraph.setNodesColor(colorArray);
        this.svgNeedsUpdate = true; // update to change node color
    };
    Brain3DApp.prototype.setNodeColorDiscrete = function (attribute, keyArray, colorArray) {
        if (!attribute)
            return;
        if (!this.dataSet || !this.dataSet.attributes)
            return;
        var attrArray = this.dataSet.attributes.get(attribute);
        if (!attrArray)
            return;
        var discreteColorValues = colorArray.map(function (colorString) { return parseInt(colorString.substring(1), 16); });
        var colorArrayNum = this.getNodeColorsDiscrete(attribute, keyArray, discreteColorValues);
        if (!colorArrayNum)
            return;
        if (this.physioGraph)
            this.physioGraph.setNodesColor(colorArrayNum);
        if (this.colaGraph)
            this.colaGraph.setNodesColor(colorArrayNum);
        this.svgNeedsUpdate = true;
    };
    //////////////////////////////////////////////////
    /// Edge Attributes //////////////////////////////
    //////////////////////////////////////////////////
    Brain3DApp.prototype.getCurrentEdgeWeightRange = function () {
        var range = {
            min: this.physioGraph.edgeMinWeight,
            max: this.physioGraph.edgeMaxWeight
        };
        return range;
    };
    Brain3DApp.prototype.setEdgeSize = function (size) {
        this.physioGraph.setEdgeScale(size);
        this.colaGraph.setEdgeScale(size);
        this.svgNeedsUpdate = true;
        this.needUpdate = true;
    };
    Brain3DApp.prototype.setEdgeThicknessByWeight = function (bool) {
        this.edgeThicknessByWeightOnChange(bool);
        this.needUpdate = true;
    };
    Brain3DApp.prototype.setEdgeColorByWeight = function (config) {
        var colorMode = "weight";
        this.edgeColorOnChange(colorMode, config);
        this.needUpdate = true;
    };
    Brain3DApp.prototype.setEdgeColorByNode = function () {
        var colorMode = "node";
        this.edgeColorOnChange(colorMode, {
            edgeTransitionColor: this.edgeTransitionColor,
            useTransitionColor: this.useTransitionColor
        });
        this.needUpdate = true;
    };
    Brain3DApp.prototype.setEdgeNoColor = function () {
        var colorMode = "none";
        this.edgeColorOnChange(colorMode);
        this.needUpdate = true;
    };
    Brain3DApp.prototype.setEdgeDirectionGradient = function () {
        if (this.physioGraph)
            this.physioGraph.setEdgeDirectionGradient();
        if (this.colaGraph)
            this.colaGraph.setEdgeDirectionGradient();
        if (this.circularGraph)
            this.circularGraph.update();
        this.needUpdate = true;
    };
<<<<<<< HEAD
    /* Called when the size of the view port is changed */
    /* action: 'resize', set the borders of the camera by the viewport and move 3d surfaces to be at the same proportional location */
    /* the remaining action values are for zooming in/out for a screenshot
    /* action: 'screenshotzoomstart', we are zooming in for a screenshot, account for changes in aspect ratio, save the original camera limits
    /* action: 'screenshotzoomend', restore the saved limits from 'screenshotzoomstart'
    /* If zooming is true, set the borders of the camera to zoom on the existing borders */
    Brain3DApp.prototype.resize = function (width, height, action) {
        if (this.canvasGraph) {
            if (this.canvasGraph.cy && (action == 'screenshotzoomstart' || action == 'resize')) {
                this.canvasGraphPanAndZoomBeforeScreenShotZoom = {
                    zoom: this.canvasGraph.cy.zoom(),
                    pan: this.canvasGraph.cy.pan(),
                    BBox: this.commonData.graph2DBoundingBox
                    //BBox: this.canvasGraph.cy.elements().renderedBoundingBox()
                };
                this.canvasGraphPanAndZoomBeforeScreenShotZoom.centre = {
                    x: this.canvasGraphPanAndZoomBeforeScreenShotZoom.BBox.x1 + this.canvasGraphPanAndZoomBeforeScreenShotZoom.BBox.w / 2,
                    y: this.canvasGraphPanAndZoomBeforeScreenShotZoom.BBox.y1 + this.canvasGraphPanAndZoomBeforeScreenShotZoom.BBox.h / 2
                };
            }
        }
        ;
        // Resize the renderer
        this.renderer.setSize(width, height - sliderSpace);
        // Resize the svg canvas
=======
    /* Called when the size of the view port is changed*/
    Brain3DApp.prototype.resize = function (width, height) {
        // Resize the renderer
        this.renderer.setSize(width, height - sliderSpace);
        this.currentViewWidth = width;
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        this.svg
            .attr("width", width)
            .attr("height", height - sliderSpace);
        // Calculate the aspect ratio
<<<<<<< HEAD
        //var aspect = width / (height - sliderSpace);
        //this.camera.aspect = aspect;
        //// Calculate the FOVs
        //var verticalFov = Math.atan(height / window.outerHeight); // Scale the vertical fov with the vertical height of the window (up to 45 degrees)
        //var horizontalFov = verticalFov * aspect;
        //this.defaultFov = verticalFov * 180 / Math.PI;
        //console.log(this.defaultFov * this.fovZoomRatio);
        //console.log({
        //    defaultFov: this.defaultFov,
        //    fovZoomRatio: this.fovZoomRatio
        //});
        //this.camera.fov = this.defaultFov * this.fovZoomRatio;
        //this.camera.updateProjectionMatrix();
        // get the proportions of the objects in the viewport
        var brainContainerPosition = new THREE.Vector3();
        var brainViewportProp = {
            xFrac: 0,
            yFrac: 0
        };
        var colaObjectPosition = new THREE.Vector3();
        var colaObjectViewportProp = {
            xFrac: 0,
            yFrac: 0
        };
        var brainBBox;
        if (this.brainContainer) {
            brainBBox = new THREE.Box3().setFromObject(this.brainContainer);
            this.brainContainer.getWorldPosition(brainContainerPosition);
            brainViewportProp = {
                xFrac: (brainContainerPosition.x - this.camera.left) / (this.camera.right - this.camera.left),
                yFrac: (brainContainerPosition.y - this.camera.bottom) / (this.camera.top - this.camera.bottom)
            };
        }
        //this.canvasGraph.cy.zoom()
        if (this.colaObject) {
            this.colaObject.getWorldPosition(colaObjectPosition);
            colaObjectViewportProp = {
                xFrac: (colaObjectPosition.x - this.camera.left) / (this.camera.right - this.camera.left),
                yFrac: (colaObjectPosition.y - this.camera.bottom) / (this.camera.top - this.camera.bottom)
            };
        }
        var brain2DScreenBox;
        if (this.brainSurface && this.camera) {
            brain2DScreenBox = CommonUtilities.computeScreenSpaceBoundingBox(this.brainSurface.children[0], this.camera);
            brain2DScreenBox.minNorm = brain2DScreenBox.min;
            brain2DScreenBox.maxNorm = brain2DScreenBox.max;
            brain2DScreenBox.min = {
                x: ((brain2DScreenBox.min.x + 1) / 2 * this.jDiv.width()),
                y: ((brain2DScreenBox.min.y + 1) / 2 * this.jDiv.height())
            };
            brain2DScreenBox.max = {
                x: ((brain2DScreenBox.max.x + 1) / 2) * this.jDiv.width(),
                y: ((brain2DScreenBox.max.y + 1) / 2) * this.jDiv.height()
            };
            brain2DScreenBox.w = brain2DScreenBox.max.x - brain2DScreenBox.min.x;
            brain2DScreenBox.h = brain2DScreenBox.max.y - brain2DScreenBox.min.y;
            brain2DScreenBox.centreX = brain2DScreenBox.min.x + brain2DScreenBox.w / 2;
            brain2DScreenBox.centreY = brain2DScreenBox.min.y + brain2DScreenBox.h / 2;
            brain2DScreenBox.aspect = brain2DScreenBox.w / brain2DScreenBox.h;
        }
        //if (this.canvasGraph) {
        //    if (this.canvasGraph.cy) {
        //        console.log(this.renderer.getSize());
        //        let BBox = this.canvasGraph.cy.elements().renderedBoundingBox();
        //        console.log(BBox);
        //        console.log(this.canvasGraph.cy.zoom());
        //        console.log(this.canvasGraph.cy.pan());
        //    }
        //}
        var oldCanvasAspectRatio = this.oldWidth / this.oldHeight;
        //var oldCameraAspectRatio = (this.camera.right - this.camera.left) / (this.camera.top - this.camera.bottom);
        var newCanvasAspectRatio = width / (height - sliderSpace);
        //var oldPixelHeight = (this.camera.top - this.camera.bottom) / this.oldHeight;
        //var oldPixelWidth = (this.camera.right - this.camera.left) / this.oldWidth;
        var canvasGraphPanAndZoomAtScreenShotZoom;
        switch (action) {
            case "resize":
            case "resizestart":
                if (this.brainContainer) {
                    this.camera.position.set(0, 0, brainBBox.max.z + 50);
                }
                else {
                    this.camera.position.set(0, 0, 200);
                }
                // move the circular graph with the change in viewport size
                if (this.circularGraph) {
                    var translation = this.circularGraph.d3Zoom.translate();
                    this.circularGraph.d3Zoom.translate([translation[0] / this.oldWidth * width, translation[1] / this.oldHeight * height]);
                    this.circularGraph.svgAllElements.attr("transform", "translate(" + translation[0] + "," + translation[1] + ")scale(" + this.d3Zoom.scale() * (width / this.oldWidth) + ")");
                }
                // set the camera borders according to the viewport size
                if (action == 'resizestart') {
                    this.camera.right = width / 8;
                    this.camera.top = (height - sliderSpace) / 8;
                    this.camera.bottom = -(height - sliderSpace) / 8;
                    this.camera.left = -width / 8;
                    this.originalCameraBox = {
                        right: this.camera.right,
                        left: this.camera.left,
                        bottom: this.camera.bottom,
                        top: this.camera.top
                    };
                }
                else {
                    this.camera.right = this.camera.left + (this.camera.right - this.camera.left) * width / this.oldWidth;
                    this.camera.top = this.camera.bottom + (this.camera.top - this.camera.bottom) * height / this.oldHeight;
                }
                this.originalCameraPosition = this.camera.position.clone();
                //console.log(this.originalCameraPosition);
                // update the positions of the 3d surface objects to be at the same proportions in the new viewport
                if (this.brainContainer) {
                    brainBBox = new THREE.Box3().setFromObject(this.brainContainer);
                    //let originalBrainContainerScale = this.brainContainer.scale;
                    var newBrainContainerPosition_1 = {
                        x: this.camera.left + (this.camera.right - this.camera.left) * brainViewportProp.xFrac,
                        y: this.camera.bottom + (this.camera.top - this.camera.bottom) * brainViewportProp.yFrac,
                        z: 0
                    };
                    //newBrainContainerPosition.x = this.camera.left;
                    //console.log('setting brain container');
                    this.brainContainer.position.set(newBrainContainerPosition_1.x, newBrainContainerPosition_1.y, newBrainContainerPosition_1.z);
                    //if (action == 'resize') {
                    //    this.brainContainer.scale.set(originalBrainContainerScale.x / (pixelWidth / oldPixelWidth),
                    //        originalBrainContainerScale.y / ((oldPixelHeight) / (pixelHeight)),
                    //        originalBrainContainerScale.z);
                    //}
                    //console.log(this.brainContainer.position);
                }
                //console.log(this.colaObject);
                if (this.colaObject) {
                    var colaBBox = new THREE.Box3().setFromObject(this.colaObject);
                    this.colaObject.position.set(this.camera.left + (this.camera.right - this.camera.left) * colaObjectViewportProp.xFrac, this.camera.bottom + (this.camera.top - this.camera.bottom) * colaObjectViewportProp.yFrac, 0);
                }
                if (this.canvasGraph) {
                    if (this.canvasGraph.cy) {
                        this.canvasGraph.cy.panBy({
                            x: width * this.canvasGraphPanAndZoomBeforeScreenShotZoom.centre.x / this.oldWidth - this.canvasGraphPanAndZoomBeforeScreenShotZoom.centre.x,
                            y: height * this.canvasGraphPanAndZoomBeforeScreenShotZoom.centre.y / this.oldHeight - this.canvasGraphPanAndZoomBeforeScreenShotZoom.centre.y
                        });
                    }
                }
                //console.log(this);
                //if (this.circularGraph) {
                //console.log(this.circularGraph);
                ////var curTransform = d3.zoomTransform(this.circularGraph.svg.node());
                //this.svgAllElements.attr
                //    console.log({
                //        width: width,
                //        this.oldWidth: this.oldWidth,
                //        height: height,
                //        this.oldHeight: this.oldHeight
                //    });
                //    this.circularGraph.d3Zoom.translateBy(
                //        this.circularGraph.svg,
                //        width - this.oldWidth,
                //        height - this.oldHeight
                //    );
                //this.svg.call(
                //    this.d3Zoom.transform,
                //    d3.zoomIdentity.translate(width, height).scale(1)
                //}
                //
                // 
                //
                // find the zoom required to fit the brain into the screen size
                this.saveFileObj.camera = {
                    left: this.camera.left,
                    right: this.camera.right,
                    top: this.camera.top,
                    bottom: this.camera.bottom
                };
                break;
            case "screenshotzoomstart":
                //if (this.canvasGraph) {
                //    if (this.canvasGraph.cy) {
                //        canvasGraphPanAndZoomAtScreenShotZoom = {
                //            zoom: this.canvasGraph.cy.zoom(),
                //            pan: this.canvasGraph.cy.pan(),
                //            BBox: this.canvasGraph.cy.elements().renderedBoundingBox()
                //        };
                //        //console.log(this.canvasGraphPanAndZoomBeforeScreenShotZoom.BBox);
                //    }
                //}
                this.cameraBeforeScreenshotZoom = {
                    left: this.camera.left,
                    right: this.camera.right,
                    top: this.camera.top,
                    bottom: this.camera.bottom,
                    zoom: this.camera.zoom
                };
                //console.log({
                //    oldCanvasAspectRatio: oldCanvasAspectRatio,
                //    newCanvasAspectRatio: newCanvasAspectRatio
                //});
                // move the centre of the object so that it is in the same place in the resized window
                //let brainObjectNewCentreInPixels = {
                //   x: brainViewportProp.xFrac * width,
                //   y: brainViewportProp.yFrac * (height - sliderSpace)
                //};
                //this.camera.left = 0;
                //this.camera.top = 0;
                //this.camera.right = width;
                //this.camera.bottom = -(height - sliderSpace); // + pixel spacing in world coordinates needed to put the object at the same proportions;
                //                brainObjectNewCentreInPixels
                //              var cameraYCentre = (this.camera.top + this.camera.bottom) / 2;
                //            this.camera.bottom = cameraYCentre - (cameraYCentre - this.camera.bottom) / (newCanvasAspectRatio / oldCanvasAspectRatio);
                //          this.camera.top = cameraYCentre + (this.camera.top - cameraYCentre) / (newCanvasAspectRatio / oldCanvasAspectRatio);
                //this.camera.left = -width / 8;
                //    let brainObjectCentreInPixels =
                //    let brainObjectCentreInCoords = {
                //        x: (this.camera.right - this.camera.left)  brain2DScreenBox.centreX,
                //    }
                //newBrain2DScreenBox.w = (brain2DScreenBox.max.x - brain2DScreenBox.min.x) ;
                //brain2DScreenBox.h = brain2DScreenBox.max.y - brain2DScreenBox.min.y;
                //brain2DScreenBox.centreX = brain2DScreenBox.min.x + brain2DScreenBox.w / 2;
                //brain2DScreenBox.centreY = brain2DScreenBox.min.y + brain2DScreenBox.h / 2;
                //brain2DScreenBox.aspect = brain2DScreenBox.w / brain2DScreenBox.h;
                //this.camera.right = width / 8;
                //this.camera.top = (height - sliderSpace) / 8;
                //this.camera.bottom = -(height - sliderSpace) / 8;
                //this.camera.left = -width / 8;
                // width needs to be
                // needs to be
                //this.camera.left = space for the object + buffer for unused
                //if (width < this.jDiv.width()) {
                //}
                //if (height < this.jDiv.height()) {
                //}
                //this.camera.left
                //brainViewportProp
                //this.brainContainer.position
                //brainViewportProp.xFrac
                //brainViewportProp.yFrac
                //brain2DScreenBox.centreX = brain2DScreenBox.min.x + brain2DScreenBox.w / 2;
                //brain2DScreenBox.centreY = brain2DScreenBox.min.y + brain2DScreenBox.h / 2;
                //this.camera.zoom = this.camera.zoom * (width / this.oldWidth);
                //this.camera.right = (this.camera.right - this.camera.left) * (width / this.oldWidth);
                //this.camera.bottom = (this.camera.top - this.camera.bottom) / this.camera.zoom * (width / this.oldWidth * height / this.oldHeight);
                if (newCanvasAspectRatio > oldCanvasAspectRatio) {
                    //    // new canvas is wider, need to expand the left and right borders of the camera
                    //    // multiply the distance between the left and right borders from the centre by
                    //    // the increase in the aspect ratio
                    var cameraXCentre = (this.camera.right + this.camera.left) / 2;
                    //this.camera.left = cameraXCentre - (cameraXCentre - this.camera.left) * (newCanvasAspectRatio / oldCanvasAspectRatio);
                    this.camera.right = cameraXCentre + (this.camera.right - cameraXCentre) * (newCanvasAspectRatio / oldCanvasAspectRatio);
                }
                else {
                    //    // new canvas is taller, need to expand the top and bottom borders of the camera
                    //    // divide the distance between the left and right borders from the centre by
                    //    // the increase in the aspect ratio
                    var cameraYCentre = (this.camera.top + this.camera.bottom) / 2;
                    this.camera.bottom = cameraYCentre - (cameraYCentre - this.camera.bottom) / (newCanvasAspectRatio / oldCanvasAspectRatio);
                    //this.camera.top = cameraYCentre + (this.camera.top - cameraYCentre) / (newCanvasAspectRatio / oldCanvasAspectRatio);
                }
                var newBrainContainerPosition = {
                    x: this.camera.left + (this.camera.right - this.camera.left) * brainViewportProp.xFrac,
                    y: this.camera.bottom + (this.camera.top - this.camera.bottom) * brainViewportProp.yFrac,
                    z: 0
                };
                //newBrainContainerPosition.x = this.camera.left;
                //this.brainContainer.position.set(newBrainContainerPosition.x, newBrainContainerPosition.y, newBrainContainerPosition.z);
                // resize so that the brain is in 
                //cy.zoom(cy.zoom() * ((container.offsetHeight * 0.75) / cyBBox.h));
                //cy.pan(this.canvasGraphPanAndZoomBeforeScreenShotZoom )
                if (this.brainContainer) {
                    this.brainContainer.position.set(this.camera.left + (this.camera.right - this.camera.left) * brainViewportProp.xFrac, this.camera.bottom + (this.camera.top - this.camera.bottom) * brainViewportProp.yFrac, 0);
                }
                if (this.colaObject) {
                    var colaBBox = new THREE.Box3().setFromObject(this.colaObject);
                    this.colaObject.position.set(this.camera.left + (this.camera.right - this.camera.left) * colaObjectViewportProp.xFrac, this.camera.bottom + (this.camera.top - this.camera.bottom) * colaObjectViewportProp.yFrac, 0);
                    this.colaObject.position.needsUpdate = true;
                }
                //this.colaObject.update();
                if (this.canvasGraph) {
                    if (this.canvasGraph.cy) {
                        canvasGraphPanAndZoomAtScreenShotZoom = {
                            zoom: this.canvasGraph.cy.zoom(),
                            pan: this.canvasGraph.cy.pan(),
                            BBox: this.canvasGraph.cy.elements().renderedBoundingBox()
                        };
                        //console.log(this.canvasGraphPanAndZoomBeforeScreenShotZoom.BBox);
                        canvasGraphPanAndZoomAtScreenShotZoom.centre = {
                            x: this.canvasGraphPanAndZoomBeforeScreenShotZoom.BBox.x1 + this.canvasGraphPanAndZoomBeforeScreenShotZoom.BBox.w / 2,
                            y: this.canvasGraphPanAndZoomBeforeScreenShotZoom.BBox.y1 + this.canvasGraphPanAndZoomBeforeScreenShotZoom.BBox.h / 2
                        };
                        var newCentre = {
                            x: canvasGraphPanAndZoomAtScreenShotZoom.centre.x / this.oldWidth * width,
                            y: canvasGraphPanAndZoomAtScreenShotZoom.centre.y / this.oldHeight * height
                        };
                        //console.log(this.canvasGraphPanAndZoomBeforeScreenShotZoom.BBox);
                        //console.log(this.canvasGraphPanAndZoomBeforeScreenShotZoom.centre);
                        //console.log({
                        //    x: this.canvasGraphPanAndZoomBeforeScreenShotZoom.centre.x / this.oldWidth * width - this.canvasGraphPanAndZoomBeforeScreenShotZoom.BBox.w / 2,
                        //    y: this.canvasGraphPanAndZoomBeforeScreenShotZoom.centre.y / this.oldHeight * (height - sliderSpace) - this.canvasGraphPanAndZoomBeforeScreenShotZoom.BBox.h / 2
                        //});
                        //this.canvasGraph.cy.pan({
                        //    x: this.canvasGraphPanAndZoomBeforeScreenShotZoom.centre.x / this.oldWidth * width - this.canvasGraphPanAndZoomBeforeScreenShotZoom.BBox.w / 2,
                        //    y: this.canvasGraphPanAndZoomBeforeScreenShotZoom.centre.y / this.oldHeight * (height - sliderSpace) - this.canvasGraphPanAndZoomBeforeScreenShotZoom.BBox.h / 2
                        //});
                        //console.log(width);
                        //console.log(this.oldWidth);
                        if (newCanvasAspectRatio > oldCanvasAspectRatio) {
                            //    // new canvas is wider, need to expand the left and right borders of the camera
                            //    // multiply the distance between the left and right borders from the centre by
                            //    // the increase in the aspect ratio
                            var cameraXCentre = (this.camera.right + this.camera.left) / 2;
                            //this.camera.left = cameraXCentre - (cameraXCentre - this.camera.left) * (newCanvasAspectRatio / oldCanvasAspectRatio);
                            this.camera.right = cameraXCentre + (this.camera.right - cameraXCentre) * (newCanvasAspectRatio / oldCanvasAspectRatio);
                        }
                        else {
                            //    // new canvas is taller, need to expand the top and bottom borders of the camera
                            //    // divide the distance between the left and right borders from the centre by
                            //    // the increase in the aspect ratio
                            var cameraYCentre = (this.camera.top + this.camera.bottom) / 2;
                            this.camera.bottom = cameraYCentre - (cameraYCentre - this.camera.bottom) / (newCanvasAspectRatio / oldCanvasAspectRatio);
                            //this.camera.top = cameraYCentre + (this.camera.top - cameraYCentre) / (newCanvasAspectRatio / oldCanvasAspectRatio);
                        }
                        this.canvasGraph.cy.zoom({
                            level: this.canvasGraph.cy.zoom() * (width / this.oldWidth),
                            renderedPosition: {
                                x: 0,
                                y: 0
                            }
                        });
                        var cyBBox = this.canvasGraph.cy.elements().renderedBoundingBox();
                        //console.log(cyBBox);
                        //console.log(width);
                        //console.log(height);
                        if (cyBBox.x2 > width) {
                            this.canvasGraph.cy.panBy({
                                x: width - cyBBox.x2,
                                y: 0
                            });
                        }
                        ;
                        if (cyBBox.y2 > height) {
                            this.canvasGraph.cy.panBy({
                                x: 0,
                                y: height - cyBBox.y2
                            });
                        }
                        ;
                        //let l = this.canvasGraph.cy.renderedExtent();
                        //console.log(this.canvasGraph.cy.renderedExtent());
                        //console.log(this.graph2dContainer);
                        //let t = this.renderer.getSize();
                        //console.log(t);
                        //this.canvasGraph.cy.invalidateSize();
                        //console.log(this.renderer);
                        console.log(this.graph2dContainer.container);
                        this.graph2dContainerWidthHeightBeforeResize = {
                            width: $(this.graph2dContainer).css("width"),
                            height: $(this.graph2dContainer).css("height")
                            //width: this.renderer.domElement.parentElement.width,
                            //height: this.renderer.domElement.parentElement.height
                        };
                        $(this.graph2dContainer).css({ width: width + "px", height: height + "px" });
                        //this.renderer.domElement.width = width;
                        //this.renderer.domElement.height = height;
                        //this.renderer.domElement.parentElement.width = width;
                        //this.renderer.domElement.parentElement.height = height;
                        this.canvasGraph.cy.resize();
                        //this.canvasGraph.cy.panBy({
                        //    x: -(canvasGraphPanAndZoomAtScreenShotZoom.centre.x - newCentre.x),
                        //    y: -(canvasGraphPanAndZoomAtScreenShotZoom.centre.y - newCentre.y)
                        //});
                        //console.log(this.canvasGraph.cy.zoom());
                        //console.log(this.canvasGraph.cy.pan());
                        //let BBox = this.canvasGraph.cy.elements().renderedBoundingBox();
                        //this.canvasGraph.cy.zoom(
                        //    {
                        //        level: this.canvasGraph.cy.zoom(),
                        //        renderedPosition: {
                        //            x: BBox.x1 + BBox.w / 2,
                        //            y: BBox.y1 + BBox.w / 2
                        //        }
                        //    });
                        //console.log()
                        //console.log(this.canvasGraph.cy.zoom());
                        //console.log(this.canvasGraph.cy.pan());
                    }
                }
                break;
            case "screenshotzoomend":
                this.camera.left = this.cameraBeforeScreenshotZoom.left;
                this.camera.right = this.cameraBeforeScreenshotZoom.right;
                this.camera.top = this.cameraBeforeScreenshotZoom.top;
                this.camera.bottom = this.cameraBeforeScreenshotZoom.bottom;
                this.camera.zoom = this.cameraBeforeScreenshotZoom.zoom;
                // restore the zoom of the 2d
                if (this.canvasGraph) {
                    if (this.canvasGraph.cy) {
                        this.canvasGraph.cy.pan(this.canvasGraphPanAndZoomBeforeScreenShotZoom.pan);
                        this.canvasGraph.cy.zoom(this.canvasGraphPanAndZoomBeforeScreenShotZoom.zoom);
                        $(this.graph2dContainer).css({
                            width: this.graph2dContainerWidthHeightBeforeResize.width,
                            height: this.graph2dContainerWidthHeightBeforeResize.height
                        });
                        this.canvasGraph.cy.resize();
                    }
                }
                if (this.brainContainer) {
                    var newBrainContainerPosition_2 = {
                        x: this.camera.left + (this.camera.right - this.camera.left) * brainViewportProp.xFrac,
                        y: this.camera.bottom + (this.camera.top - this.camera.bottom) * brainViewportProp.yFrac,
                        z: 0
                    };
                    //newBrainContainerPosition.x = this.camera.left;
                    this.brainContainer.position.set(newBrainContainerPosition_2.x, newBrainContainerPosition_2.y, newBrainContainerPosition_2.z);
                }
                break;
        }
        this.camera.updateProjectionMatrix();
        this.oldHeight = height;
        this.oldWidth = width;
        this.commonData.resizing = false;
=======
        var aspect = width / (height - sliderSpace);
        this.camera.aspect = aspect;
        // Calculate the FOVs
        var verticalFov = Math.atan(height / window.outerHeight); // Scale the vertical fov with the vertical height of the window (up to 45 degrees)
        var horizontalFov = verticalFov * aspect;
        this.defaultFov = verticalFov * 180 / Math.PI;
        this.camera.fov = this.defaultFov * this.fovZoomRatio;
        this.camera.updateProjectionMatrix();
        // Work out how far away the camera needs to be
        var distanceByH = (widthInCamera / 2) / Math.tan(horizontalFov / 2);
        var distanceByV = (heightInCamera / 2) / Math.tan(verticalFov / 2);
        // Select the maximum distance of the two
        this.camera.position.set(0, 0, Math.max(distanceByH, distanceByV));
        this.originalCameraPosition = this.camera.position.clone();
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
    };
    Brain3DApp.prototype.setDataSet = function (dataSet) {
        var _this = this;
        this.dataSet = dataSet;
        if (this.dataSet.sortedSimilarities) {
            // Update slider max value
            if (this.dataSet.sortedSimilarities.length < maxEdgesShowable) {
                $("#edge-count-slider-" + this.id)['bootstrapSlider']("setAttribute", "max", this.dataSet.sortedSimilarities.length);
            }
            else {
                $("#edge-count-slider-" + this.id)['bootstrapSlider']("setAttribute", "max", maxEdgesShowable);
            }
            // update Circular Dataset
            this.circularGraph.setDataSet(dataSet);
        }
        var sim = function () {
            _this.restart();
        };
        var att = function () {
            _this.restart(); // TODO: We're currently destroying the entire graph to switch out the node group information - we can do better than that
        };
        dataSet.regNotifySim(sim);
        dataSet.regNotifyAttributes(att);
        if (dataSet.simMatrix && dataSet.attributes && this.physioGraph) {
            this.restart();
            this.physioGraph.update();
        }
        else {
            console.log("Warning: attempted to set dataset before minimal data is available.");
        }
    };
    // Initialise or re-initialise the visualisation.
    Brain3DApp.prototype.restart = function () {
        if (!this.dataSet || !this.dataSet.verify()) {
            CommonUtilities.launchAlertMessage(CommonUtilities.alertType.WARNING, "Current dataset cannot be verified. Cannot create brain view.");
            return;
        }
        console.log("Restarted view: " + this.id);
        // Create the dissimilarity matrix from the similarity matrix (we need dissimilarity for Cola)
        for (var i = 0; i < this.dataSet.simMatrix.length; ++i) {
            this.dissimilarityMatrix.push(this.dataSet.simMatrix[i].map(function (sim) {
                //return 15 / (sim + 1); // Convert similarities to distances
                return 0.5 / (sim * sim);
            }));
        }
        // Set up the node colourings
        var nSettings = this.saveFileObj.nodeSettings;
        var colorAttribute = nSettings.nodeColorAttribute;
        var nodeColors;
        if (!this.dataSet.attributes.info[colorAttribute]) {
            nodeColors = this.getNodeColorsEmpty();
        }
        else if (this.dataSet.attributes.info[colorAttribute].isDiscrete) {
            var discreteColorValues = nSettings.nodeColorDiscrete.map(function (colorString) { return parseInt(colorString.substring(1), 16); });
            nodeColors = this.getNodeColorsDiscrete(colorAttribute, this.dataSet.attributes.info[colorAttribute].distinctValues, discreteColorValues);
        }
        else { // continuous
            nodeColors = this.getNodeColors(colorAttribute, nSettings.nodeColorContinuousMin, nSettings.nodeColorContinuousMax);
        }
        // Set up loop
        // Initialise Graph Objects
        this.circularGraph = new CircularGraph(this.id, this.jDiv, this.dataSet, this.svg, this.svgDefs, this.svgAllElements, this.d3Zoom, this.commonData, this.saveFileObj);
        // Set up the graphs
        var edgeMatrix = this.dataSet.adjMatrixFromEdgeCount(maxEdgesShowable); // Don't create more edges than we will ever be showing
        if (this.physioGraph)
            this.physioGraph.destroy();
        this.physioGraph = new Graph3D(this.brainObject, edgeMatrix, nodeColors, this.dataSet.simMatrix, this.dataSet.brainLabels, this.commonData, this.saveFileObj);
        if (this.brainSurfaceMode === 0) {
            this.physioGraph.setNodePositions(this.dataSet.brainCoords);
        }
        else if (this.brainSurfaceMode === 1) {
            var newCoords = this.computeMedialViewCoords();
            this.physioGraph.setNodePositions(newCoords);
        }
        else {
            console.log("ERROR: Wrong Brain Surface Mode");
        }
        edgeMatrix = this.dataSet.adjMatrixFromEdgeCount(maxEdgesShowable);
        if (this.colaGraph)
            this.colaGraph.destroy();
        this.colaGraph = new Graph3D(this.colaObject, edgeMatrix, nodeColors, this.dataSet.simMatrix, this.dataSet.brainLabels, this.commonData, this.saveFileObj);
        this.colaGraph.setVisible(false);
        this.canvasGraph = new Graph2D(this.id, this.jDiv, this.dataSet, this.graph2dContainer, this.commonData, this.saveFileObj, this.physioGraph, this.camera, this.edgeCountSliderValue);
        // Initialise the filtering
        if (this.brainSurfaceMode === 0) {
            this.filteredAdjMatrix = this.dataSet.adjMatrixFromEdgeCount(Number(this.edgeCountSliderValue));
        }
        else {
<<<<<<< HEAD
            //this.filteredAdjMatrix = this.dataSet.adjMatrixFromEdgeCount(Number(this.edgeCountSliderValue));
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
            this.filteredAdjMatrix = this.dataSet.adjMatrixWithoutEdgesCrossHemisphere(Number(this.edgeCountSliderValue));
        }
        this.physioGraph.findNodeConnectivity(this.filteredAdjMatrix, this.dissimilarityMatrix);
        this.physioGraph.setEdgeVisibilities(this.filteredAdjMatrix);
        this.physioGraph.setEdgeColorConfig(this.colorMode, this.colorConfig);
        this.colaGraph.findNodeConnectivity(this.filteredAdjMatrix, this.dissimilarityMatrix);
        this.colaGraph.setEdgeVisibilities(this.filteredAdjMatrix);
        this.colaGraph.setEdgeColorConfig(this.colorMode, this.colorConfig);
        this.edgeCountSliderOnChange(Number(this.edgeCountSliderValue));
        // Enable the slider
        $('#edge-count-slider-' + this.id)['bootstrapSlider']("setValue", this.edgeCountSliderValue);
        $("#edge-count-slider-" + this.id)['bootstrapSlider']("setAttribute", "max", maxEdgesShowable);
        //$('#button-show-network-' + this.id).prop('disabled', false);
        this.needUpdate = true;
        this.showNetwork(false);
        // this should set after setting the data set
        // load by saved file
        var displaySettings_labels = $('#display_settings_labels').val();
        if (displaySettings_labels != 'false') {
            this.allLabelsOnChange();
        }
    };
    Brain3DApp.prototype.computeMedialViewCoords = function () {
        var newCoords = [[], [], []];
        var zAxis = new THREE.Vector3(0, 0, 1);
        var box;
        if (this.brainModelOrigin) {
            box = new THREE.Box3()['setFromObject'](this.brainModelOrigin);
        }
        else {
            box = new THREE.Box3(new THREE.Vector3(-70, -100, -50), new THREE.Vector3(70, 70, 100));
        }
        var mean = (box.max.z - box.min.z) / 2;
        var offsetToHead = box.max.z - mean;
<<<<<<< HEAD
        var offsetDistance = 10;
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        for (var i = 0; i < this.dataSet.brainCoords[0].length; i++) {
            var coord = new THREE.Vector3(this.dataSet.brainCoords[0][i], this.dataSet.brainCoords[1][i], this.dataSet.brainCoords[2][i]);
            if (coord.x < 0) { // right
                coord.applyAxisAngle(zAxis, Math.PI / 2);
                coord.x = coord.x - offsetToHead;
<<<<<<< HEAD
                coord.z = coord.z - box.max.z - offsetDistance;
=======
                coord.z = coord.z - box.max.z;
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
            }
            else { // left
                coord.applyAxisAngle(zAxis, -Math.PI / 2);
                coord.x = coord.x + offsetToHead;
<<<<<<< HEAD
                coord.z = coord.z + Math.abs(box.min.z) + offsetDistance;
=======
                coord.z = coord.z + Math.abs(box.min.z);
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
            }
            newCoords[0].push(coord.x);
            newCoords[1].push(coord.y);
            newCoords[2].push(coord.z);
        }
        return newCoords;
    };
    Brain3DApp.prototype.getBoundingSphereUnderPointer = function (pointer) {
        var _this = this;
<<<<<<< HEAD
        if ((this.networkType == '2d') || (this.networkType == 'circular') || (this.networkType == '3d')) {
=======
        if ((this.networkType == '2d') || (this.networkType == 'circular')) {
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
            var raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(pointer, this.camera);
            var inBoundingSphere = !!(raycaster.intersectObject(this.brainSurfaceBoundingSphere, true).length);
            if (this.prevInBoundingSphere !== inBoundingSphere) {
                if (inBoundingSphere) {
                    this.isControllingGraphOnly = false;
                    this.svg.on(".zoom", null);
                    this.canvasGraph.setUserControl(false);
                }
                else {
                    this.isControllingGraphOnly = true;
                    var varSVGZoom = function () { _this.svgZoom(); };
                    var func = this.d3Zoom.on("zoom", varSVGZoom);
                    this.svg.call(func);
                    this.canvasGraph.setUserControl(true);
                }
            }
            this.prevInBoundingSphere = inBoundingSphere;
        }
        else {
            this.isControllingGraphOnly = false;
            this.svg.on(".zoom", null);
            if (this.canvasGraph)
                this.canvasGraph.setUserControl(true);
        }
    };
    Brain3DApp.prototype.update = function (deltaTime) {
        var _this = this;
        // Execute coroutines
        if ((this.physioGraph) && (this.colaGraph)) {
            // execute animation sequently
            if (coroutines.length > 0) {
                if (coroutines[0].func(coroutines[0], deltaTime))
                    coroutines.splice(0, 1);
            }
            // Check if pointer is over 3D Model
            var node = this.getNodeUnderPointer(this.input.localPointerPosition());
            var nodeIDUnderPointer = node ? node.userData.id : -1;
            this.getBoundingSphereUnderPointer(this.input.localPointerPosition());
            // Check if pointer is over 2D Model in all view
            for (var i = 0; i < this.commonData.nodeIDUnderPointer.length; i++) {
                if (this.commonData.nodeIDUnderPointer[i] != -1) {
                    nodeIDUnderPointer = this.commonData.nodeIDUnderPointer[i];
                    break;
                }
            }
            // If the pointer is pointing to any node in 2D or 3D graph
            if (this.selectedNodeID !== nodeIDUnderPointer) {
                if (nodeIDUnderPointer !== -1) {
                    // If we already have a node ID selected, deselect it
                    if (this.selectedNodeID >= 0) {
                        this.physioGraph.deselectNode(this.selectedNodeID);
                        this.colaGraph.deselectNode(this.selectedNodeID);
                    }
                    if (node) {
                        this.selectedNodeID = node.userData.id;
                    }
                    else {
                        this.selectedNodeID = nodeIDUnderPointer;
                    }
                    // Select the new node ID
                    this.physioGraph.selectNode(this.selectedNodeID, false);
                    this.colaGraph.selectNode(this.selectedNodeID, this.ignore3dControl);
                    var varNodeID = this.selectedNodeID;
                    if (this.networkType == "circular") {
                        var varMouseOveredCircularLayout = function (d) { _this.circularGraph.mouseOveredCircularLayout(d); };
                        this.svgAllElements.selectAll(".nodeCircular")
                            .each(function (d) {
                            if (varNodeID == d.id)
                                varMouseOveredCircularLayout(d);
                        });
                    }
                    else if (this.networkType == "2d") {
                        this.svgNeedsUpdate = true;
                    }
                }
                else {
                    if (this.selectedNodeID >= 0) {
                        this.physioGraph.deselectNode(this.selectedNodeID);
                        this.colaGraph.deselectNode(this.selectedNodeID);
                        var varNodeID = this.selectedNodeID;
                        if (this.networkType == "circular") {
                            var varMouseOutedCircularLayout = function (d) { _this.circularGraph.mouseOutedCircularLayout(d); };
                            this.svgAllElements.selectAll(".nodeCircular")
                                .each(function (d) {
                                if (varNodeID == d.id)
                                    varMouseOutedCircularLayout(d);
                            });
                        }
                        else if (this.networkType == "2d") {
                            this.svgNeedsUpdate = true;
                        }
                        this.selectedNodeID = -1;
                    }
                }
<<<<<<< HEAD
                this.needUpdate = true;
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
            }
            if (this.needUpdate || this.isAnimationOn) {
                this.physioGraph.update();
                this.colaGraph.update();
                this.needUpdate = false;
            }
            if (this.colaGraph.isVisible()) {
                //TODO: This is very slow, for minimal impact - look at using regular 3D layout, e.g.:
                //  http://marvl.infotech.monash.edu/webcola/examples/3dtree.html
                //  http://marvl.infotech.monash.edu/webcola/examples/3dlayout.js
                this.descent.rungeKutta(); // Do an iteration of the solver
            }
            this.scene.updateMatrixWorld();
            if (this.ignore3dControl && this.svgNeedsUpdate) {
                if (this.networkType == '2d') {
                    if (this.canvasGraph) {
                        this.canvasGraph.settingOnChange();
                        this.canvasGraph.updateInteractive();
                    }
                }
                else if (this.networkType == 'circular') {
                    if (this.circularGraph) {
                        this.circularGraph.setColaGraph(this.physioGraph);
                        this.circularGraph.update();
                    }
                }
                this.svgNeedsUpdate = false;
            }
        }
        if (this.autoRotation) {
            var pixelAngleRatio = 50;
            var quatX = new THREE.Quaternion();
            var axisX = new THREE.Vector3(0, 1, 0);
            quatX.setFromAxisAngle(axisX, this.mouse.dx / pixelAngleRatio); // axis must be normalised, angle in radians
            this.brainObject.quaternion.multiplyQuaternions(quatX, this.brainObject.quaternion);
            this.colaObject.quaternion.multiplyQuaternions(quatX, this.colaObject.quaternion);
            var quatY = new THREE.Quaternion();
            var axisY = new THREE.Vector3(1, 0, 0);
            quatY.setFromAxisAngle(axisY, this.mouse.dy / pixelAngleRatio); // axis must be normalised, angle in radians
            this.brainObject.quaternion.multiplyQuaternions(quatY, this.brainObject.quaternion);
            this.colaObject.quaternion.multiplyQuaternions(quatY, this.colaObject.quaternion);
        }
        this.draw(); // Draw the graph
    };
    Brain3DApp.prototype.draw = function () {
        this.renderer.render(this.scene, this.camera);
    };
    return Brain3DApp;
}());
/* Functions can be pushed to the coroutines array to be executed as if they are
 * occuring in parallel with the program execution.
 */
var coroutines = new Array();
function setCoroutine(data, func) {
    data.func = func;
    coroutines.push(data);
}
//# sourceMappingURL=brain3d.js.map