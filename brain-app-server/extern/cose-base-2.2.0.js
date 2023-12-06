(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("layout-base"));
	else if(typeof define === 'function' && define.amd)
		define(["layout-base"], factory);
	else if(typeof exports === 'object')
		exports["coseBase"] = factory(require("layout-base"));
	else
		root["coseBase"] = factory(root["layoutBase"]);
})(this, (__WEBPACK_EXTERNAL_MODULE__730__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 10:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let coseBase = {};

coseBase.layoutBase = __webpack_require__(730);
coseBase.CoSEConstants = __webpack_require__(642);
coseBase.CoSEEdge = __webpack_require__(350);
coseBase.CoSEGraph = __webpack_require__(307);
coseBase.CoSEGraphManager = __webpack_require__(710);
coseBase.CoSELayout = __webpack_require__(949);
coseBase.CoSENode = __webpack_require__(355);
coseBase.ConstraintHandler = __webpack_require__(661);

module.exports = coseBase;




/***/ }),

/***/ 642:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var FDLayoutConstants = (__webpack_require__(730).FDLayoutConstants);

function CoSEConstants() {
}

//CoSEConstants inherits static props in FDLayoutConstants
for (var prop in FDLayoutConstants) {
  CoSEConstants[prop] = FDLayoutConstants[prop];
}

CoSEConstants.DEFAULT_USE_MULTI_LEVEL_SCALING = false;
CoSEConstants.DEFAULT_RADIAL_SEPARATION = FDLayoutConstants.DEFAULT_EDGE_LENGTH;
CoSEConstants.DEFAULT_COMPONENT_SEPERATION = 60;
CoSEConstants.TILE = true;
CoSEConstants.TILING_PADDING_VERTICAL = 10;
CoSEConstants.TILING_PADDING_HORIZONTAL = 10;
CoSEConstants.TRANSFORM_ON_CONSTRAINT_HANDLING = true;
CoSEConstants.ENFORCE_CONSTRAINTS = true;
CoSEConstants.APPLY_LAYOUT = true;
CoSEConstants.RELAX_MOVEMENT_ON_CONSTRAINTS = true;
CoSEConstants.TREE_REDUCTION_ON_INCREMENTAL = true;  // this should be set to false if there will be a constraint
// This constant is for differentiating whether actual layout algorithm that uses cose-base wants to apply only incremental layout or 
// an incremental layout on top of a randomized layout. If it is only incremental layout, then this constant should be true.
CoSEConstants.PURE_INCREMENTAL = CoSEConstants.DEFAULT_INCREMENTAL;

module.exports = CoSEConstants;


/***/ }),

/***/ 350:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var FDLayoutEdge = (__webpack_require__(730).FDLayoutEdge);

function CoSEEdge(source, target, vEdge) {
  FDLayoutEdge.call(this, source, target, vEdge);
}

CoSEEdge.prototype = Object.create(FDLayoutEdge.prototype);
for (var prop in FDLayoutEdge) {
  CoSEEdge[prop] = FDLayoutEdge[prop];
}

module.exports = CoSEEdge


/***/ }),

/***/ 307:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var LGraph = (__webpack_require__(730).LGraph);

function CoSEGraph(parent, graphMgr, vGraph) {
  LGraph.call(this, parent, graphMgr, vGraph);
}

CoSEGraph.prototype = Object.create(LGraph.prototype);
for (var prop in LGraph) {
  CoSEGraph[prop] = LGraph[prop];
}

module.exports = CoSEGraph;


/***/ }),

/***/ 710:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var LGraphManager = (__webpack_require__(730).LGraphManager);

function CoSEGraphManager(layout) {
  LGraphManager.call(this, layout);
}

CoSEGraphManager.prototype = Object.create(LGraphManager.prototype);
for (var prop in LGraphManager) {
  CoSEGraphManager[prop] = LGraphManager[prop];
}

module.exports = CoSEGraphManager;


/***/ }),

/***/ 949:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var FDLayout = (__webpack_require__(730).FDLayout);
var CoSEGraphManager = __webpack_require__(710);
var CoSEGraph = __webpack_require__(307);
var CoSENode = __webpack_require__(355);
var CoSEEdge = __webpack_require__(350);
var CoSEConstants = __webpack_require__(642);
var ConstraintHandler = __webpack_require__(661);
var FDLayoutConstants = (__webpack_require__(730).FDLayoutConstants);
var LayoutConstants = (__webpack_require__(730).LayoutConstants);
var Point = (__webpack_require__(730).Point);
var PointD = (__webpack_require__(730).PointD);
var DimensionD = (__webpack_require__(730).DimensionD);
var Layout = (__webpack_require__(730).Layout);
var Integer = (__webpack_require__(730).Integer);
var IGeometry = (__webpack_require__(730).IGeometry);
var LGraph = (__webpack_require__(730).LGraph);
var Transform = (__webpack_require__(730).Transform);
var LinkedList = (__webpack_require__(730).LinkedList);

function CoSELayout() {
  FDLayout.call(this);
  
  this.toBeTiled = {}; // Memorize if a node is to be tiled or is tiled
  this.constraints = {}; // keep layout constraints
}

CoSELayout.prototype = Object.create(FDLayout.prototype);

for (var prop in FDLayout) {
  CoSELayout[prop] = FDLayout[prop];
}

CoSELayout.prototype.newGraphManager = function () {
  var gm = new CoSEGraphManager(this);
  this.graphManager = gm;
  return gm;
};

CoSELayout.prototype.newGraph = function (vGraph) {
  return new CoSEGraph(null, this.graphManager, vGraph);
};

CoSELayout.prototype.newNode = function (vNode) {
  return new CoSENode(this.graphManager, vNode);
};

CoSELayout.prototype.newEdge = function (vEdge) {
  return new CoSEEdge(null, null, vEdge);
};

CoSELayout.prototype.initParameters = function () {
  FDLayout.prototype.initParameters.call(this, arguments);
  if (!this.isSubLayout) {
    if (CoSEConstants.DEFAULT_EDGE_LENGTH < 10)
    {
      this.idealEdgeLength = 10;
    }
    else
    {
      this.idealEdgeLength = CoSEConstants.DEFAULT_EDGE_LENGTH;
    }

    this.useSmartIdealEdgeLengthCalculation =
            CoSEConstants.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION;
    this.gravityConstant =
            FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH;
    this.compoundGravityConstant =
            FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH;
    this.gravityRangeFactor =
            FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR;
    this.compoundGravityRangeFactor =
            FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR;
    
    // variables for tree reduction support
    this.prunedNodesAll = [];
    this.growTreeIterations = 0;
    this.afterGrowthIterations = 0;
    this.isTreeGrowing = false;
    this.isGrowthFinished = false;    
  }
};

// This method is used to set CoSE related parameters used by spring embedder.
CoSELayout.prototype.initSpringEmbedder = function () {
  FDLayout.prototype.initSpringEmbedder.call(this);

  // variables for cooling
  this.coolingCycle = 0;
  this.maxCoolingCycle = this.maxIterations/FDLayoutConstants.CONVERGENCE_CHECK_PERIOD;
  this.finalTemperature = 0.04;
  this.coolingAdjuster = 1;  
};

CoSELayout.prototype.layout = function () {
  var createBendsAsNeeded = LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED;
  if (createBendsAsNeeded)
  {
    this.createBendpoints();
    this.graphManager.resetAllEdges();
  }

  this.level = 0;
  return this.classicLayout();
};

CoSELayout.prototype.classicLayout = function () {
  this.nodesWithGravity = this.calculateNodesToApplyGravitationTo();
  this.graphManager.setAllNodesToApplyGravitation(this.nodesWithGravity);
  this.calcNoOfChildrenForAllNodes();
  this.graphManager.calcLowestCommonAncestors();
  this.graphManager.calcInclusionTreeDepths();
  this.graphManager.getRoot().calcEstimatedSize();
  this.calcIdealEdgeLengths();
  
  if (!this.incremental)
  {
    var forest = this.getFlatForest();

    // The graph associated with this layout is flat and a forest
    if (forest.length > 0)
    {
      this.positionNodesRadially(forest);
    }
    // The graph associated with this layout is not flat or a forest
    else
    {
      // Reduce the trees when incremental mode is not enabled and graph is not a forest 
      this.reduceTrees();
      // Update nodes that gravity will be applied
      this.graphManager.resetAllNodesToApplyGravitation();
      var allNodes = new Set(this.getAllNodes());
      var intersection = this.nodesWithGravity.filter(x => allNodes.has(x));
      this.graphManager.setAllNodesToApplyGravitation(intersection);
      
      this.positionNodesRandomly();
    }
  }
  else {
    if(CoSEConstants.TREE_REDUCTION_ON_INCREMENTAL){
      // Reduce the trees in incremental mode if only this constant is set to true 
      this.reduceTrees();
      // Update nodes that gravity will be applied
      this.graphManager.resetAllNodesToApplyGravitation();
      var allNodes = new Set(this.getAllNodes());
      var intersection = this.nodesWithGravity.filter(x => allNodes.has(x));
      this.graphManager.setAllNodesToApplyGravitation(intersection);        
    }
  }

  if(Object.keys(this.constraints).length > 0){
    ConstraintHandler.handleConstraints(this);
    this.initConstraintVariables();
  }

  this.initSpringEmbedder();
  if (CoSEConstants.APPLY_LAYOUT) {
    this.runSpringEmbedder();
  }

  return true;
};

CoSELayout.prototype.tick = function() {
  this.totalIterations++;
  
  if (this.totalIterations === this.maxIterations && !this.isTreeGrowing && !this.isGrowthFinished) {
    if(this.prunedNodesAll.length > 0){
      this.isTreeGrowing = true;
    }
    else {
      return true;  
    }
  }
  
  if (this.totalIterations % FDLayoutConstants.CONVERGENCE_CHECK_PERIOD == 0  && !this.isTreeGrowing && !this.isGrowthFinished)
  {
    if (this.isConverged())
    {
      if(this.prunedNodesAll.length > 0){
        this.isTreeGrowing = true;
      }
      else {
        return true;  
      } 
    }
    
    this.coolingCycle++;

    if(this.layoutQuality == 0) {  
      // quality - "draft"
      this.coolingAdjuster = this.coolingCycle;
    }
    else if(this.layoutQuality == 1) { 
      // quality - "default"
      this.coolingAdjuster = this.coolingCycle / 3;
    }    

    // cooling schedule is based on http://www.btluke.com/simanf1.html -> cooling schedule 3
    this.coolingFactor = Math.max(this.initialCoolingFactor - Math.pow(this.coolingCycle, Math.log(100 * (this.initialCoolingFactor - this.finalTemperature)) / Math.log(this.maxCoolingCycle))/100 * this.coolingAdjuster, this.finalTemperature);
    this.animationPeriod = Math.ceil(this.initialAnimationPeriod * Math.sqrt(this.coolingFactor));
  }
  // Operations while tree is growing again 
  if(this.isTreeGrowing){
    if(this.growTreeIterations % 10 == 0){
      if(this.prunedNodesAll.length > 0) {
        this.graphManager.updateBounds();
        this.updateGrid();
        this.growTree(this.prunedNodesAll);
        // Update nodes that gravity will be applied
        this.graphManager.resetAllNodesToApplyGravitation();
        var allNodes = new Set(this.getAllNodes());
        var intersection = this.nodesWithGravity.filter(x => allNodes.has(x));
        this.graphManager.setAllNodesToApplyGravitation(intersection);
        
        this.graphManager.updateBounds();
        this.updateGrid();
        if(CoSEConstants.PURE_INCREMENTAL)
          this.coolingFactor = FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL / 2;
        else
          this.coolingFactor = FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL;
      }
      else {
        this.isTreeGrowing = false;  
        this.isGrowthFinished = true; 
      }
    }
    this.growTreeIterations++;
  }
  // Operations after growth is finished
  if(this.isGrowthFinished){
    if (this.isConverged())
    {
      return true;  
    }
    if(this.afterGrowthIterations % 10 == 0){
      this.graphManager.updateBounds();
      this.updateGrid(); 
    }
    if(CoSEConstants.PURE_INCREMENTAL)
      this.coolingFactor = FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL / 2 * ((100 - this.afterGrowthIterations) / 100);
    else
      this.coolingFactor = FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL * ((100 - this.afterGrowthIterations) / 100);
    this.afterGrowthIterations++;
  }
  
  var gridUpdateAllowed = !this.isTreeGrowing && !this.isGrowthFinished;
  var forceToNodeSurroundingUpdate = (this.growTreeIterations % 10 == 1 && this.isTreeGrowing) || (this.afterGrowthIterations % 10 == 1 && this.isGrowthFinished);
          
  this.totalDisplacement = 0;
  this.graphManager.updateBounds();
  this.calcSpringForces();
  this.calcRepulsionForces(gridUpdateAllowed, forceToNodeSurroundingUpdate);
  this.calcGravitationalForces();
  this.moveNodes();
  this.animate();
  
  return false; // Layout is not ended yet return false
};

CoSELayout.prototype.getPositionsData = function() {
  var allNodes = this.graphManager.getAllNodes();
  var pData = {};
  for (var i = 0; i < allNodes.length; i++) {
    var rect = allNodes[i].rect;
    var id = allNodes[i].id;
    pData[id] = {
      id: id,
      x: rect.getCenterX(),
      y: rect.getCenterY(),
      w: rect.width,
      h: rect.height
    };
  }
  
  return pData;
};

CoSELayout.prototype.runSpringEmbedder = function () {
  this.initialAnimationPeriod = 25;
  this.animationPeriod = this.initialAnimationPeriod;
  var layoutEnded = false;
  
  // If aminate option is 'during' signal that layout is supposed to start iterating
  if ( FDLayoutConstants.ANIMATE === 'during' ) {
    this.emit('layoutstarted');
  }
  else {
    // If aminate option is 'during' tick() function will be called on index.js
    while (!layoutEnded) {
      layoutEnded = this.tick();
    }

    this.graphManager.updateBounds();
  }
};

// overrides moveNodes method in FDLayout
CoSELayout.prototype.moveNodes = function () {
  var lNodes = this.getAllNodes();
  var node;

  // calculate displacement for each node 
  for (var i = 0; i < lNodes.length; i++)
  {
    node = lNodes[i];
    node.calculateDisplacement();
  }
  
  if(Object.keys(this.constraints).length > 0){
    this.updateDisplacements();
  }

  // move each node
  for (var i = 0; i < lNodes.length; i++)
  {
    node = lNodes[i];
    node.move();
  }  
};

// constraint related methods: initConstraintVariables and updateDisplacements

// initialize constraint related variables
CoSELayout.prototype.initConstraintVariables = function () {
  var self = this;
  this.idToNodeMap = new Map();
  this.fixedNodeSet = new Set();

  var allNodes = this.graphManager.getAllNodes();

  // fill idToNodeMap
  for(var i = 0; i < allNodes.length; i++) {
    var node = allNodes[i];
    this.idToNodeMap.set(node.id, node);
  }

  // calculate fixed node weight for given compound node
  var calculateCompoundWeight = function(compoundNode) {
    var nodes = compoundNode.getChild().getNodes();
    var node;
    var fixedNodeWeight = 0;
    for (var i = 0; i < nodes.length; i++) {
      node = nodes[i];
      if (node.getChild() == null) {
        if(self.fixedNodeSet.has(node.id)) {
          fixedNodeWeight += 100;
        }
      } else {
        fixedNodeWeight += calculateCompoundWeight(node);
      }
    }
    return fixedNodeWeight;
  };

  if (this.constraints.fixedNodeConstraint) {
    // fill fixedNodeSet
    this.constraints.fixedNodeConstraint.forEach(function (nodeData) {
      self.fixedNodeSet.add(nodeData.nodeId);
    });

    // assign fixed node weights to compounds if they contain fixed nodes
    var allNodes = this.graphManager.getAllNodes();
    var node;

    for (var i = 0; i < allNodes.length; i++) {
      node = allNodes[i];
      if (node.getChild() != null) {
        let fixedNodeWeight = calculateCompoundWeight(node);
        if (fixedNodeWeight > 0) {
          node.fixedNodeWeight = fixedNodeWeight;
        }
      }
    }
  }
  
  if(this.constraints.relativePlacementConstraint) {         
    var nodeToDummyForVerticalAlignment = new Map();
    var nodeToDummyForHorizontalAlignment = new Map();
    this.dummyToNodeForVerticalAlignment = new Map();
    this.dummyToNodeForHorizontalAlignment = new Map();     
    this.fixedNodesOnHorizontal = new Set();
    this.fixedNodesOnVertical = new Set();

    // fill maps and sets
    this.fixedNodeSet.forEach(function(nodeId){
      self.fixedNodesOnHorizontal.add(nodeId);
      self.fixedNodesOnVertical.add(nodeId);
    });
    
    if(this.constraints.alignmentConstraint) {
      if(this.constraints.alignmentConstraint.vertical) {
        var verticalAlignment = this.constraints.alignmentConstraint.vertical;
        for(var i = 0; i < verticalAlignment.length; i++) {
          this.dummyToNodeForVerticalAlignment.set("dummy" + i, []);
          verticalAlignment[i].forEach(function(nodeId){
            nodeToDummyForVerticalAlignment.set(nodeId, "dummy" + i);
            self.dummyToNodeForVerticalAlignment.get("dummy" + i).push(nodeId);
            if(self.fixedNodeSet.has(nodeId)) {
              self.fixedNodesOnHorizontal.add("dummy" + i);
            }
          });
        }
      }
      if(this.constraints.alignmentConstraint.horizontal){
        var horizontalAlignment = this.constraints.alignmentConstraint.horizontal;
        for(var i = 0; i < horizontalAlignment.length; i++){
          this.dummyToNodeForHorizontalAlignment.set("dummy" + i, []);
          horizontalAlignment[i].forEach(function(nodeId){
            nodeToDummyForHorizontalAlignment.set(nodeId, "dummy" + i);
            self.dummyToNodeForHorizontalAlignment.get("dummy" + i).push(nodeId);
            if(self.fixedNodeSet.has(nodeId)){
              self.fixedNodesOnVertical.add("dummy" + i);
            }              
          });
        }
      }        
    }
    
    if(CoSEConstants.RELAX_MOVEMENT_ON_CONSTRAINTS) {
      
      this.shuffle = function (array) {
        var j, x, i;
        for (i = array.length - 1; i >= (2 * array.length / 3); i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = array[i];
          array[i] = array[j];
          array[j] = x;
        }
        return array;
      };

      this.nodesInRelativeHorizontal = [];
      this.nodesInRelativeVertical = [];    
      this.nodeToRelativeConstraintMapHorizontal = new Map();
      this.nodeToRelativeConstraintMapVertical = new Map();
      this.nodeToTempPositionMapHorizontal = new Map();
      this.nodeToTempPositionMapVertical = new Map();

      // fill arrays and maps
      this.constraints.relativePlacementConstraint.forEach(function(constraint) {
        if(constraint.left) {
          let nodeIdLeft = nodeToDummyForVerticalAlignment.has(constraint.left) ? nodeToDummyForVerticalAlignment.get(constraint.left) : constraint.left;
          let nodeIdRight = nodeToDummyForVerticalAlignment.has(constraint.right) ? nodeToDummyForVerticalAlignment.get(constraint.right) : constraint.right;
          
          if(!self.nodesInRelativeHorizontal.includes(nodeIdLeft)) {
            self.nodesInRelativeHorizontal.push(nodeIdLeft);
            self.nodeToRelativeConstraintMapHorizontal.set(nodeIdLeft, []);            
            if(self.dummyToNodeForVerticalAlignment.has(nodeIdLeft)) {
              self.nodeToTempPositionMapHorizontal.set(nodeIdLeft, self.idToNodeMap.get(self.dummyToNodeForVerticalAlignment.get(nodeIdLeft)[0]).getCenterX());
            }
            else {
              self.nodeToTempPositionMapHorizontal.set(nodeIdLeft, self.idToNodeMap.get(nodeIdLeft).getCenterX());
            }
          }
          if(!self.nodesInRelativeHorizontal.includes(nodeIdRight)) {
            self.nodesInRelativeHorizontal.push(nodeIdRight);
            self.nodeToRelativeConstraintMapHorizontal.set(nodeIdRight, []);
            if(self.dummyToNodeForVerticalAlignment.has(nodeIdRight)) {
              self.nodeToTempPositionMapHorizontal.set(nodeIdRight, self.idToNodeMap.get(self.dummyToNodeForVerticalAlignment.get(nodeIdRight)[0]).getCenterX());
            }
            else {
              self.nodeToTempPositionMapHorizontal.set(nodeIdRight, self.idToNodeMap.get(nodeIdRight).getCenterX());
            }          
          }
          
          self.nodeToRelativeConstraintMapHorizontal.get(nodeIdLeft).push({right: nodeIdRight, gap: constraint.gap});
          self.nodeToRelativeConstraintMapHorizontal.get(nodeIdRight).push({left: nodeIdLeft, gap: constraint.gap});
        }
        else {
          let nodeIdTop = nodeToDummyForHorizontalAlignment.has(constraint.top) ? nodeToDummyForHorizontalAlignment.get(constraint.top) : constraint.top;
          let nodeIdBottom = nodeToDummyForHorizontalAlignment.has(constraint.bottom) ? nodeToDummyForHorizontalAlignment.get(constraint.bottom) : constraint.bottom;
          
          if(!self.nodesInRelativeVertical.includes(nodeIdTop)) {
            self.nodesInRelativeVertical.push(nodeIdTop);
            self.nodeToRelativeConstraintMapVertical.set(nodeIdTop, []);
            if(self.dummyToNodeForHorizontalAlignment.has(nodeIdTop)) {
              self.nodeToTempPositionMapVertical.set(nodeIdTop, self.idToNodeMap.get(self.dummyToNodeForHorizontalAlignment.get(nodeIdTop)[0]).getCenterY());
            }
            else {
              self.nodeToTempPositionMapVertical.set(nodeIdTop, self.idToNodeMap.get(nodeIdTop).getCenterY());
            }
          }
          if(!self.nodesInRelativeVertical.includes(nodeIdBottom)) {
            self.nodesInRelativeVertical.push(nodeIdBottom);
            self.nodeToRelativeConstraintMapVertical.set(nodeIdBottom, []);
            if(self.dummyToNodeForHorizontalAlignment.has(nodeIdBottom)) {
              self.nodeToTempPositionMapVertical.set(nodeIdBottom, self.idToNodeMap.get(self.dummyToNodeForHorizontalAlignment.get(nodeIdBottom)[0]).getCenterY());
            }
            else {
              self.nodeToTempPositionMapVertical.set(nodeIdBottom, self.idToNodeMap.get(nodeIdBottom).getCenterY());
            }          
          }          
          self.nodeToRelativeConstraintMapVertical.get(nodeIdTop).push({bottom: nodeIdBottom, gap: constraint.gap});
          self.nodeToRelativeConstraintMapVertical.get(nodeIdBottom).push({top: nodeIdTop, gap: constraint.gap});
        }
      });
    }
    else {
      var subGraphOnHorizontal = new Map(); // subgraph from vertical RP constraints
      var subGraphOnVertical = new Map(); // subgraph from vertical RP constraints

      // construct subgraphs from relative placement constraints 
      this.constraints.relativePlacementConstraint.forEach(function(constraint) {
        if(constraint.left) {
          var left = nodeToDummyForVerticalAlignment.has(constraint.left) ? nodeToDummyForVerticalAlignment.get(constraint.left) : constraint.left;
          var right = nodeToDummyForVerticalAlignment.has(constraint.right) ? nodeToDummyForVerticalAlignment.get(constraint.right) : constraint.right;
          if(subGraphOnHorizontal.has(left)) {
            subGraphOnHorizontal.get(left).push(right);
          }
          else {
            subGraphOnHorizontal.set(left, [right]); 
          }
          if(subGraphOnHorizontal.has(right)) {
            subGraphOnHorizontal.get(right).push(left);          
          }
          else {
            subGraphOnHorizontal.set(right, [left]);           
          }
        }
        else {
          var top = nodeToDummyForHorizontalAlignment.has(constraint.top) ? nodeToDummyForHorizontalAlignment.get(constraint.top) : constraint.top;
          var bottom = nodeToDummyForHorizontalAlignment.has(constraint.bottom) ? nodeToDummyForHorizontalAlignment.get(constraint.bottom) : constraint.bottom;        
          if(subGraphOnVertical.has(top)) {
            subGraphOnVertical.get(top).push(bottom);
          }
          else {
            subGraphOnVertical.set(top, [bottom]);          
          }        
          if(subGraphOnVertical.has(bottom)) {
            subGraphOnVertical.get(bottom).push(top);          
          }
          else {
            subGraphOnVertical.set(bottom, [top]);           
          }        
        }      
      });   

      // function to construct components from a given graph 
      // also returns an array that keeps whether each component contains fixed node
      var constructComponents = function(graph, fixedNodes){
        let components = [];
        let isFixed = [];
        let queue = new LinkedList();
        let visited = new Set();
        let count = 0;

        graph.forEach(function(value, key){
          if(!visited.has(key)){
            components[count] = [];
            isFixed[count] = false;
            let currentNode = key;
            queue.push(currentNode);
            visited.add(currentNode);
            components[count].push(currentNode);

            while(queue.length != 0){
              currentNode = queue.shift();
              if(fixedNodes.has(currentNode)) {
                isFixed[count] = true;
              }
              let neighbors = graph.get(currentNode);
              neighbors.forEach(function(neighbor){
                if(!visited.has(neighbor)){
                  queue.push(neighbor);
                  visited.add(neighbor);
                  components[count].push(neighbor);
                }
              });
            }
            count++;
          }
        });

        return { components: components, isFixed: isFixed };
      };

      var resultOnHorizontal = constructComponents(subGraphOnHorizontal, self.fixedNodesOnHorizontal);
      this.componentsOnHorizontal = resultOnHorizontal.components;
      this.fixedComponentsOnHorizontal = resultOnHorizontal.isFixed;
      var resultOnVertical = constructComponents(subGraphOnVertical, self.fixedNodesOnVertical);
      this.componentsOnVertical = resultOnVertical.components;
      this.fixedComponentsOnVertical = resultOnVertical.isFixed;   
    }
  }
};

// updates node displacements based on constraints
CoSELayout.prototype.updateDisplacements = function () {
  var self = this;
  if(this.constraints.fixedNodeConstraint){
    this.constraints.fixedNodeConstraint.forEach(function(nodeData){
      var fixedNode = self.idToNodeMap.get(nodeData.nodeId);
      fixedNode.displacementX = 0;
      fixedNode.displacementY = 0;
    });
  }

  if(this.constraints.alignmentConstraint){
    if(this.constraints.alignmentConstraint.vertical){
      var allVerticalAlignments = this.constraints.alignmentConstraint.vertical;
      for(var i = 0; i < allVerticalAlignments.length; i++){
        var totalDisplacementX = 0;
        for(var j = 0; j < allVerticalAlignments[i].length; j++){
          if(this.fixedNodeSet.has(allVerticalAlignments[i][j])){
            totalDisplacementX = 0;
            break;
          }
          totalDisplacementX += this.idToNodeMap.get(allVerticalAlignments[i][j]).displacementX;
        }
        var averageDisplacementX = totalDisplacementX / allVerticalAlignments[i].length;
        for(var j = 0; j < allVerticalAlignments[i].length; j++){
          this.idToNodeMap.get(allVerticalAlignments[i][j]).displacementX = averageDisplacementX;
        }
      }
    }
    if(this.constraints.alignmentConstraint.horizontal){
      var allHorizontalAlignments = this.constraints.alignmentConstraint.horizontal;
      for(var i = 0; i < allHorizontalAlignments.length; i++){
        var totalDisplacementY = 0;
        for(var j = 0; j < allHorizontalAlignments[i].length; j++){
          if(this.fixedNodeSet.has(allHorizontalAlignments[i][j])){
            totalDisplacementY = 0;
            break;
          }
          totalDisplacementY += this.idToNodeMap.get(allHorizontalAlignments[i][j]).displacementY;
        }
        var averageDisplacementY = totalDisplacementY / allHorizontalAlignments[i].length;
        for(var j = 0; j < allHorizontalAlignments[i].length; j++){
          this.idToNodeMap.get(allHorizontalAlignments[i][j]).displacementY = averageDisplacementY;
        }
      }
    }
  }
  
  if(this.constraints.relativePlacementConstraint){
    
    if(CoSEConstants.RELAX_MOVEMENT_ON_CONSTRAINTS) {
      // shuffle array to randomize node processing order
      if (this.totalIterations % 10 == 0) {
        this.shuffle(this.nodesInRelativeHorizontal);
        this.shuffle(this.nodesInRelativeVertical);
      }      
      
      this.nodesInRelativeHorizontal.forEach(function(nodeId) {
        if(!self.fixedNodesOnHorizontal.has(nodeId)) {
          var displacement = 0;
          if(self.dummyToNodeForVerticalAlignment.has(nodeId)) {
            displacement = self.idToNodeMap.get(self.dummyToNodeForVerticalAlignment.get(nodeId)[0]).displacementX;
          }
          else {
            displacement = self.idToNodeMap.get(nodeId).displacementX;
          }    
          self.nodeToRelativeConstraintMapHorizontal.get(nodeId).forEach(function(constraint) {
            if(constraint.right) {
              var diff = (self.nodeToTempPositionMapHorizontal.get(constraint.right) - self.nodeToTempPositionMapHorizontal.get(nodeId)) - displacement;
              if(diff < constraint.gap) {
                displacement -= constraint.gap - diff;
              }
            }
            else {
              var diff = (self.nodeToTempPositionMapHorizontal.get(nodeId) - self.nodeToTempPositionMapHorizontal.get(constraint.left)) + displacement;
              if(diff < constraint.gap) {
                displacement += constraint.gap - diff;
              }          
            }
          });
          self.nodeToTempPositionMapHorizontal.set(nodeId, self.nodeToTempPositionMapHorizontal.get(nodeId) + displacement);
          if(self.dummyToNodeForVerticalAlignment.has(nodeId)) {
            self.dummyToNodeForVerticalAlignment.get(nodeId).forEach(function(nodeId){
              self.idToNodeMap.get(nodeId).displacementX = displacement;
            });
          }
          else {
            self.idToNodeMap.get(nodeId).displacementX = displacement;
          }         
        }
      });

      this.nodesInRelativeVertical.forEach(function(nodeId) {
        if(!self.fixedNodesOnHorizontal.has(nodeId)) {
          var displacement = 0;
          if(self.dummyToNodeForHorizontalAlignment.has(nodeId)) {
            displacement = self.idToNodeMap.get(self.dummyToNodeForHorizontalAlignment.get(nodeId)[0]).displacementY;
          }
          else {
            displacement = self.idToNodeMap.get(nodeId).displacementY;
          }    
          self.nodeToRelativeConstraintMapVertical.get(nodeId).forEach(function(constraint) {
            if(constraint.bottom) {
              var diff = (self.nodeToTempPositionMapVertical.get(constraint.bottom) - self.nodeToTempPositionMapVertical.get(nodeId)) - displacement;
              if(diff < constraint.gap) {
                displacement -= constraint.gap - diff;
              }
            }
            else {
              var diff = (self.nodeToTempPositionMapVertical.get(nodeId) - self.nodeToTempPositionMapVertical.get(constraint.top)) + displacement;
              if(diff < constraint.gap) {
                displacement += constraint.gap - diff;
              }          
            }
          });
          self.nodeToTempPositionMapVertical.set(nodeId, self.nodeToTempPositionMapVertical.get(nodeId) + displacement);
          if(self.dummyToNodeForHorizontalAlignment.has(nodeId)) {
            self.dummyToNodeForHorizontalAlignment.get(nodeId).forEach(function(nodeId){
              self.idToNodeMap.get(nodeId).displacementY = displacement;
            });
          }
          else {
            self.idToNodeMap.get(nodeId).displacementY = displacement;
          }        
        }
      });    
    }
    else {
      for(var i = 0; i < this.componentsOnHorizontal.length; i++) {
        var component = this.componentsOnHorizontal[i];
        if(this.fixedComponentsOnHorizontal[i]) {
          for(var j = 0; j < component.length; j++){ 
            if(this.dummyToNodeForVerticalAlignment.has(component[j])) {
              this.dummyToNodeForVerticalAlignment.get(component[j]).forEach(function(nodeId){
                self.idToNodeMap.get(nodeId).displacementX = 0;
              });
            }
            else {
              this.idToNodeMap.get(component[j]).displacementX = 0;
            }            
          }
        }
        else {
          var sum = 0;
          var count = 0;
          for(var j = 0; j < component.length; j++){
            if(this.dummyToNodeForVerticalAlignment.has(component[j])) {
              var actualNodes = this.dummyToNodeForVerticalAlignment.get(component[j]);
              sum += actualNodes.length * this.idToNodeMap.get(actualNodes[0]).displacementX;
              count += actualNodes.length;
            }
            else {
              sum += this.idToNodeMap.get(component[j]).displacementX;
              count++;
            }
          }
          var averageDisplacement = sum / count;
          for(var j = 0; j < component.length; j++){ 
            if(this.dummyToNodeForVerticalAlignment.has(component[j])) {
              this.dummyToNodeForVerticalAlignment.get(component[j]).forEach(function(nodeId){
                self.idToNodeMap.get(nodeId).displacementX = averageDisplacement;
              });
            }
            else {
              this.idToNodeMap.get(component[j]).displacementX = averageDisplacement;
            }            
          }        
        }
      }

      for(var i = 0; i < this.componentsOnVertical.length; i++) {
        var component = this.componentsOnVertical[i];
        if(this.fixedComponentsOnVertical[i]) {
          for(var j = 0; j < component.length; j++){ 
            if(this.dummyToNodeForHorizontalAlignment.has(component[j])) {
              this.dummyToNodeForHorizontalAlignment.get(component[j]).forEach(function(nodeId){
                self.idToNodeMap.get(nodeId).displacementY = 0;
              });
            }
            else {
              this.idToNodeMap.get(component[j]).displacementY = 0;
            }            
          }
        }
        else {
          var sum = 0;
          var count = 0;
          for(var j = 0; j < component.length; j++){
            if(this.dummyToNodeForHorizontalAlignment.has(component[j])) {
              var actualNodes = this.dummyToNodeForHorizontalAlignment.get(component[j]);
              sum += actualNodes.length * this.idToNodeMap.get(actualNodes[0]).displacementY;
              count += actualNodes.length;
            }
            else {
              sum += this.idToNodeMap.get(component[j]).displacementY;
              count++;
            }
          }
          var averageDisplacement = sum / count;
          for(var j = 0; j < component.length; j++){ 
            if(this.dummyToNodeForHorizontalAlignment.has(component[j])) {
              this.dummyToNodeForHorizontalAlignment.get(component[j]).forEach(function(nodeId){
                self.idToNodeMap.get(nodeId).displacementY = averageDisplacement;
              });
            }
            else {
              this.idToNodeMap.get(component[j]).displacementY = averageDisplacement;
            }            
          }        
        }
      }
    }
  }
};

CoSELayout.prototype.calculateNodesToApplyGravitationTo = function () {
  var nodeList = [];
  var graph;

  var graphs = this.graphManager.getGraphs();
  var size = graphs.length;
  var i;
  for (i = 0; i < size; i++)
  {
    graph = graphs[i];

    graph.updateConnected();

    if (!graph.isConnected)
    {
      nodeList = nodeList.concat(graph.getNodes());
    }
  }

  return nodeList;
};

CoSELayout.prototype.createBendpoints = function () {
  var edges = [];
  edges = edges.concat(this.graphManager.getAllEdges());
  var visited = new Set();
  var i;
  for (i = 0; i < edges.length; i++)
  {
    var edge = edges[i];

    if (!visited.has(edge))
    {
      var source = edge.getSource();
      var target = edge.getTarget();

      if (source == target)
      {
        edge.getBendpoints().push(new PointD());
        edge.getBendpoints().push(new PointD());
        this.createDummyNodesForBendpoints(edge);
        visited.add(edge);
      }
      else
      {
        var edgeList = [];

        edgeList = edgeList.concat(source.getEdgeListToNode(target));
        edgeList = edgeList.concat(target.getEdgeListToNode(source));

        if (!visited.has(edgeList[0]))
        {
          if (edgeList.length > 1)
          {
            var k;
            for (k = 0; k < edgeList.length; k++)
            {
              var multiEdge = edgeList[k];
              multiEdge.getBendpoints().push(new PointD());
              this.createDummyNodesForBendpoints(multiEdge);
            }
          }
          edgeList.forEach(function(edge){
            visited.add(edge);
          });
        }
      }
    }

    if (visited.size == edges.length)
    {
      break;
    }
  }
};

CoSELayout.prototype.positionNodesRadially = function (forest) {
  // We tile the trees to a grid row by row; first tree starts at (0,0)
  var currentStartingPoint = new Point(0, 0);
  var numberOfColumns = Math.ceil(Math.sqrt(forest.length));
  var height = 0;
  var currentY = 0;
  var currentX = 0;
  var point = new PointD(0, 0);

  for (var i = 0; i < forest.length; i++)
  {
    if (i % numberOfColumns == 0)
    {
      // Start of a new row, make the x coordinate 0, increment the
      // y coordinate with the max height of the previous row
      currentX = 0;
      currentY = height;

      if (i != 0)
      {
        currentY += CoSEConstants.DEFAULT_COMPONENT_SEPERATION;
      }

      height = 0;
    }

    var tree = forest[i];

    // Find the center of the tree
    var centerNode = Layout.findCenterOfTree(tree);

    // Set the staring point of the next tree
    currentStartingPoint.x = currentX;
    currentStartingPoint.y = currentY;

    // Do a radial layout starting with the center
    point =
            CoSELayout.radialLayout(tree, centerNode, currentStartingPoint);

    if (point.y > height)
    {
      height = Math.floor(point.y);
    }

    currentX = Math.floor(point.x + CoSEConstants.DEFAULT_COMPONENT_SEPERATION);
  }

  this.transform(
          new PointD(LayoutConstants.WORLD_CENTER_X - point.x / 2,
                  LayoutConstants.WORLD_CENTER_Y - point.y / 2));
};

CoSELayout.radialLayout = function (tree, centerNode, startingPoint) {
  var radialSep = Math.max(this.maxDiagonalInTree(tree),
          CoSEConstants.DEFAULT_RADIAL_SEPARATION);
  CoSELayout.branchRadialLayout(centerNode, null, 0, 359, 0, radialSep);
  var bounds = LGraph.calculateBounds(tree);

  var transform = new Transform();
  transform.setDeviceOrgX(bounds.getMinX());
  transform.setDeviceOrgY(bounds.getMinY());
  transform.setWorldOrgX(startingPoint.x);
  transform.setWorldOrgY(startingPoint.y);

  for (var i = 0; i < tree.length; i++)
  {
    var node = tree[i];
    node.transform(transform);
  }

  var bottomRight =
          new PointD(bounds.getMaxX(), bounds.getMaxY());

  return transform.inverseTransformPoint(bottomRight);
};

CoSELayout.branchRadialLayout = function (node, parentOfNode, startAngle, endAngle, distance, radialSeparation) {
  // First, position this node by finding its angle.
  var halfInterval = ((endAngle - startAngle) + 1) / 2;

  if (halfInterval < 0)
  {
    halfInterval += 180;
  }

  var nodeAngle = (halfInterval + startAngle) % 360;
  var teta = (nodeAngle * IGeometry.TWO_PI) / 360;

  // Make polar to java cordinate conversion.
  var cos_teta = Math.cos(teta);
  var x_ = distance * Math.cos(teta);
  var y_ = distance * Math.sin(teta);

  node.setCenter(x_, y_);

  // Traverse all neighbors of this node and recursively call this
  // function.
  var neighborEdges = [];
  neighborEdges = neighborEdges.concat(node.getEdges());
  var childCount = neighborEdges.length;

  if (parentOfNode != null)
  {
    childCount--;
  }

  var branchCount = 0;

  var incEdgesCount = neighborEdges.length;
  var startIndex;

  var edges = node.getEdgesBetween(parentOfNode);

  // If there are multiple edges, prune them until there remains only one
  // edge.
  while (edges.length > 1)
  {
    //neighborEdges.remove(edges.remove(0));
    var temp = edges[0];
    edges.splice(0, 1);
    var index = neighborEdges.indexOf(temp);
    if (index >= 0) {
      neighborEdges.splice(index, 1);
    }
    incEdgesCount--;
    childCount--;
  }

  if (parentOfNode != null)
  {
    //assert edges.length == 1;
    startIndex = (neighborEdges.indexOf(edges[0]) + 1) % incEdgesCount;
  }
  else
  {
    startIndex = 0;
  }

  var stepAngle = Math.abs(endAngle - startAngle) / childCount;

  for (var i = startIndex;
          branchCount != childCount;
          i = (++i) % incEdgesCount)
  {
    var currentNeighbor =
            neighborEdges[i].getOtherEnd(node);

    // Don't back traverse to root node in current tree.
    if (currentNeighbor == parentOfNode)
    {
      continue;
    }

    var childStartAngle =
            (startAngle + branchCount * stepAngle) % 360;
    var childEndAngle = (childStartAngle + stepAngle) % 360;

    CoSELayout.branchRadialLayout(currentNeighbor,
            node,
            childStartAngle, childEndAngle,
            distance + radialSeparation, radialSeparation);

    branchCount++;
  }
};

CoSELayout.maxDiagonalInTree = function (tree) {
  var maxDiagonal = Integer.MIN_VALUE;

  for (var i = 0; i < tree.length; i++)
  {
    var node = tree[i];
    var diagonal = node.getDiagonal();

    if (diagonal > maxDiagonal)
    {
      maxDiagonal = diagonal;
    }
  }

  return maxDiagonal;
};

CoSELayout.prototype.calcRepulsionRange = function () {
  // formula is 2 x (level + 1) x idealEdgeLength
  return (2 * (this.level + 1) * this.idealEdgeLength);
};

// Tiling methods

// Group zero degree members whose parents are not to be tiled, create dummy parents where needed and fill memberGroups by their dummp parent id's
CoSELayout.prototype.groupZeroDegreeMembers = function () {
  var self = this;
  // array of [parent_id x oneDegreeNode_id]
  var tempMemberGroups = {}; // A temporary map of parent node and its zero degree members
  this.memberGroups = {}; // A map of dummy parent node and its zero degree members whose parents are not to be tiled
  this.idToDummyNode = {}; // A map of id to dummy node 
  
  var zeroDegree = []; // List of zero degree nodes whose parents are not to be tiled
  var allNodes = this.graphManager.getAllNodes();

  // Fill zero degree list
  for (var i = 0; i < allNodes.length; i++) {
    var node = allNodes[i];
    var parent = node.getParent();
    // If a node has zero degree and its parent is not to be tiled if exists add that node to zeroDegres list
    if (this.getNodeDegreeWithChildren(node) === 0 && ( parent.id == undefined || !this.getToBeTiled(parent) ) ) {
      zeroDegree.push(node);
    }
  }

  // Create a map of parent node and its zero degree members
  for (var i = 0; i < zeroDegree.length; i++)
  {
    var node = zeroDegree[i]; // Zero degree node itself
    var p_id = node.getParent().id; // Parent id

    if (typeof tempMemberGroups[p_id] === "undefined")
      tempMemberGroups[p_id] = [];

    tempMemberGroups[p_id] = tempMemberGroups[p_id].concat(node); // Push node to the list belongs to its parent in tempMemberGroups
  }

  // If there are at least two nodes at a level, create a dummy compound for them
  Object.keys(tempMemberGroups).forEach(function(p_id) {
    if (tempMemberGroups[p_id].length > 1) {
      var dummyCompoundId = "DummyCompound_" + p_id; // The id of dummy compound which will be created soon
      self.memberGroups[dummyCompoundId] = tempMemberGroups[p_id]; // Add dummy compound to memberGroups

      var parent = tempMemberGroups[p_id][0].getParent(); // The parent of zero degree nodes will be the parent of new dummy compound

      // Create a dummy compound with calculated id
      var dummyCompound = new CoSENode(self.graphManager);
      dummyCompound.id = dummyCompoundId;
      dummyCompound.paddingLeft = parent.paddingLeft || 0;
      dummyCompound.paddingRight = parent.paddingRight || 0;
      dummyCompound.paddingBottom = parent.paddingBottom || 0;
      dummyCompound.paddingTop = parent.paddingTop || 0;
      
      self.idToDummyNode[dummyCompoundId] = dummyCompound;
      
      var dummyParentGraph = self.getGraphManager().add(self.newGraph(), dummyCompound);
      var parentGraph = parent.getChild();

      // Add dummy compound to parent the graph
      parentGraph.add(dummyCompound);

      // For each zero degree node in this level remove it from its parent graph and add it to the graph of dummy parent
      for (var i = 0; i < tempMemberGroups[p_id].length; i++) {
        var node = tempMemberGroups[p_id][i];
        
        parentGraph.remove(node);
        dummyParentGraph.add(node);
      }
    }
  });
};

CoSELayout.prototype.clearCompounds = function () {
  var childGraphMap = {};
  var idToNode = {};

  // Get compound ordering by finding the inner one first
  this.performDFSOnCompounds();

  for (var i = 0; i < this.compoundOrder.length; i++) {
    
    idToNode[this.compoundOrder[i].id] = this.compoundOrder[i];
    childGraphMap[this.compoundOrder[i].id] = [].concat(this.compoundOrder[i].getChild().getNodes());

    // Remove children of compounds
    this.graphManager.remove(this.compoundOrder[i].getChild());
    this.compoundOrder[i].child = null;
  }
  
  this.graphManager.resetAllNodes();
  
  // Tile the removed children
  this.tileCompoundMembers(childGraphMap, idToNode);
};

CoSELayout.prototype.clearZeroDegreeMembers = function () {
  var self = this;
  var tiledZeroDegreePack = this.tiledZeroDegreePack = [];

  Object.keys(this.memberGroups).forEach(function(id) {
    var compoundNode = self.idToDummyNode[id]; // Get the dummy compound

    tiledZeroDegreePack[id] = self.tileNodes(self.memberGroups[id], compoundNode.paddingLeft + compoundNode.paddingRight);

    // Set the width and height of the dummy compound as calculated
    compoundNode.rect.width = tiledZeroDegreePack[id].width;
    compoundNode.rect.height = tiledZeroDegreePack[id].height;
    compoundNode.setCenter(tiledZeroDegreePack[id].centerX, tiledZeroDegreePack[id].centerY);

    // compound left and top margings for labels
    // when node labels are included, these values may be set to different values below and are used in tilingPostLayout,
    // otherwise they stay as zero
    compoundNode.labelMarginLeft = 0;
    compoundNode.labelMarginTop = 0;

    // Update compound bounds considering its label properties and set label margins for left and top
    if(CoSEConstants.NODE_DIMENSIONS_INCLUDE_LABELS){

      var width = compoundNode.rect.width;
      var height = compoundNode.rect.height;

      if(compoundNode.labelWidth){
        if(compoundNode.labelPosHorizontal == "left"){
          compoundNode.rect.x -= (compoundNode.labelWidth);
          compoundNode.setWidth(width + compoundNode.labelWidth);
          compoundNode.labelMarginLeft = compoundNode.labelWidth;
        }
        else if(compoundNode.labelPosHorizontal == "center" && compoundNode.labelWidth > width){
          compoundNode.rect.x -= (compoundNode.labelWidth - width) / 2;
          compoundNode.setWidth(compoundNode.labelWidth);
          compoundNode.labelMarginLeft = (compoundNode.labelWidth - width) / 2;
        }
        else if(compoundNode.labelPosHorizontal == "right"){
          compoundNode.setWidth(width + compoundNode.labelWidth);
        }
      }

      if(compoundNode.labelHeight){
        if(compoundNode.labelPosVertical == "top"){
          compoundNode.rect.y -= (compoundNode.labelHeight);
          compoundNode.setHeight(height + compoundNode.labelHeight);
          compoundNode.labelMarginTop = compoundNode.labelHeight;
        }
        else if(compoundNode.labelPosVertical == "center" && compoundNode.labelHeight > height){
          compoundNode.rect.y -= (compoundNode.labelHeight - height) / 2;
          compoundNode.setHeight(compoundNode.labelHeight);
          compoundNode.labelMarginTop = (compoundNode.labelHeight - height) / 2;
        }
        else if(compoundNode.labelPosVertical == "bottom"){
          compoundNode.setHeight(height + compoundNode.labelHeight);
        }
      }
    }
  });
};

CoSELayout.prototype.repopulateCompounds = function () {
  for (var i = this.compoundOrder.length - 1; i >= 0; i--) {
    var lCompoundNode = this.compoundOrder[i];
    var id = lCompoundNode.id;
    var horizontalMargin = lCompoundNode.paddingLeft;
    var verticalMargin = lCompoundNode.paddingTop;
    var labelMarginLeft = lCompoundNode.labelMarginLeft;
    var labelMarginTop = lCompoundNode.labelMarginTop;

    this.adjustLocations(this.tiledMemberPack[id], lCompoundNode.rect.x, lCompoundNode.rect.y, horizontalMargin, verticalMargin, labelMarginLeft, labelMarginTop);
  }
};

CoSELayout.prototype.repopulateZeroDegreeMembers = function () {
  var self = this;
  var tiledPack = this.tiledZeroDegreePack;
  
  Object.keys(tiledPack).forEach(function(id) {
    var compoundNode = self.idToDummyNode[id]; // Get the dummy compound by its id
    var horizontalMargin = compoundNode.paddingLeft;
    var verticalMargin = compoundNode.paddingTop;
    var labelMarginLeft = compoundNode.labelMarginLeft;
    var labelMarginTop = compoundNode.labelMarginTop;

    // Adjust the positions of nodes wrt its compound
    self.adjustLocations(tiledPack[id], compoundNode.rect.x, compoundNode.rect.y, horizontalMargin, verticalMargin, labelMarginLeft, labelMarginTop);
  });
};

CoSELayout.prototype.getToBeTiled = function (node) {
  var id = node.id;
  //firstly check the previous results
  if (this.toBeTiled[id] != null) {
    return this.toBeTiled[id];
  }

  //only compound nodes are to be tiled
  var childGraph = node.getChild();
  if (childGraph == null) {
    this.toBeTiled[id] = false;
    return false;
  }

  var children = childGraph.getNodes(); // Get the children nodes

  //a compound node is not to be tiled if all of its compound children are not to be tiled
  for (var i = 0; i < children.length; i++) {
    var theChild = children[i];

    if (this.getNodeDegree(theChild) > 0) {
      this.toBeTiled[id] = false;
      return false;
    }

    //pass the children not having the compound structure
    if (theChild.getChild() == null) {
      this.toBeTiled[theChild.id] = false;
      continue;
    }

    if (!this.getToBeTiled(theChild)) {
      this.toBeTiled[id] = false;
      return false;
    }
  }
  this.toBeTiled[id] = true;
  return true;
};

// Get degree of a node depending of its edges and independent of its children
CoSELayout.prototype.getNodeDegree = function (node) {
  var id = node.id;
  var edges = node.getEdges();
  var degree = 0;
  
  // For the edges connected
  for (var i = 0; i < edges.length; i++) {
    var edge = edges[i];
    if (edge.getSource().id !== edge.getTarget().id) {
      degree = degree + 1;
    }
  }
  return degree;
};

// Get degree of a node with its children
CoSELayout.prototype.getNodeDegreeWithChildren = function (node) {
  var degree = this.getNodeDegree(node);
  if (node.getChild() == null) {
    return degree;
  }
  var children = node.getChild().getNodes();
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    degree += this.getNodeDegreeWithChildren(child);
  }
  return degree;
};

CoSELayout.prototype.performDFSOnCompounds = function () {
  this.compoundOrder = [];
  this.fillCompexOrderByDFS(this.graphManager.getRoot().getNodes());
};

CoSELayout.prototype.fillCompexOrderByDFS = function (children) {
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    if (child.getChild() != null) {
      this.fillCompexOrderByDFS(child.getChild().getNodes());
    }
    if (this.getToBeTiled(child)) {
      this.compoundOrder.push(child);
    }
  }
};

/**
* This method places each zero degree member wrt given (x,y) coordinates (top left).
*/
CoSELayout.prototype.adjustLocations = function (organization, x, y, compoundHorizontalMargin, compoundVerticalMargin, compoundLabelMarginLeft, compoundLabelMarginTop) {
  x += compoundHorizontalMargin + compoundLabelMarginLeft;
  y += compoundVerticalMargin + compoundLabelMarginTop;

  var left = x;

  for (var i = 0; i < organization.rows.length; i++) {
    var row = organization.rows[i];
    x = left;
    var maxHeight = 0;

    for (var j = 0; j < row.length; j++) {
      var lnode = row[j];

      lnode.rect.x = x;// + lnode.rect.width / 2;
      lnode.rect.y = y;// + lnode.rect.height / 2;

      x += lnode.rect.width + organization.horizontalPadding;

      if (lnode.rect.height > maxHeight)
        maxHeight = lnode.rect.height;
    }

    y += maxHeight + organization.verticalPadding;
  }
};

CoSELayout.prototype.tileCompoundMembers = function (childGraphMap, idToNode) {
  var self = this;
  this.tiledMemberPack = [];

  Object.keys(childGraphMap).forEach(function(id) {
    // Get the compound node
    var compoundNode = idToNode[id];

    self.tiledMemberPack[id] = self.tileNodes(childGraphMap[id], compoundNode.paddingLeft + compoundNode.paddingRight);

    compoundNode.rect.width = self.tiledMemberPack[id].width;
    compoundNode.rect.height = self.tiledMemberPack[id].height;
    compoundNode.setCenter(self.tiledMemberPack[id].centerX, self.tiledMemberPack[id].centerY);

    // compound left and top margings for labels
    // when node labels are included, these values may be set to different values below and are used in tilingPostLayout,
    // otherwise they stay as zero
    compoundNode.labelMarginLeft = 0;
    compoundNode.labelMarginTop = 0;

    // Update compound bounds considering its label properties and set label margins for left and top
    if(CoSEConstants.NODE_DIMENSIONS_INCLUDE_LABELS){

      var width = compoundNode.rect.width;
      var height = compoundNode.rect.height;

      if(compoundNode.labelWidth){
        if(compoundNode.labelPosHorizontal == "left"){
          compoundNode.rect.x -= (compoundNode.labelWidth);
          compoundNode.setWidth(width + compoundNode.labelWidth);
          compoundNode.labelMarginLeft = compoundNode.labelWidth;
        }
        else if(compoundNode.labelPosHorizontal == "center" && compoundNode.labelWidth > width){
          compoundNode.rect.x -= (compoundNode.labelWidth - width) / 2;
          compoundNode.setWidth(compoundNode.labelWidth);
          compoundNode.labelMarginLeft = (compoundNode.labelWidth - width) / 2;
        }
        else if(compoundNode.labelPosHorizontal == "right"){
          compoundNode.setWidth(width + compoundNode.labelWidth);
        }
      }

      if(compoundNode.labelHeight){
        if(compoundNode.labelPosVertical == "top"){
          compoundNode.rect.y -= (compoundNode.labelHeight);
          compoundNode.setHeight(height + compoundNode.labelHeight);
          compoundNode.labelMarginTop = compoundNode.labelHeight;
        }
        else if(compoundNode.labelPosVertical == "center" && compoundNode.labelHeight > height){
          compoundNode.rect.y -= (compoundNode.labelHeight - height) / 2;
          compoundNode.setHeight(compoundNode.labelHeight);
          compoundNode.labelMarginTop = (compoundNode.labelHeight - height) / 2;
        }
        else if(compoundNode.labelPosVertical == "bottom"){
          compoundNode.setHeight(height + compoundNode.labelHeight);
        }
      }
    }
  });
};

CoSELayout.prototype.tileNodes = function (nodes, minWidth) {
  var horizontalOrg = this.tileNodesByFavoringDim(nodes, minWidth, true);
  var verticalOrg = this.tileNodesByFavoringDim(nodes, minWidth, false);

  var horizontalRatio = this.getOrgRatio(horizontalOrg);
  var verticalRatio = this.getOrgRatio(verticalOrg);
  var bestOrg;

  // the best ratio is the one that is closer to 1 since the ratios are already normalized
  // and the best organization is the one that has the best ratio
  if (verticalRatio < horizontalRatio) {
    bestOrg = verticalOrg;
  } else {
    bestOrg = horizontalOrg;
  }

  return bestOrg;
};

// get the width/height ratio of the organization that is normalized so that it will not be less than 1
CoSELayout.prototype.getOrgRatio = function (organization) {
  // get dimensions and calculate the initial ratio
  var width = organization.width;
  var height = organization.height;
  var ratio = width / height;

  // if the initial ratio is less then 1 then inverse it
  if (ratio < 1) {
    ratio = 1 / ratio;
  }

  // return the normalized ratio
  return ratio;
};

/*
 * Calculates the ideal width for the rows. This method assumes that
 * each node has the same sizes and calculates the ideal row width that
 * approximates a square shaped complex accordingly. However, since nodes would
 * have different sizes some rows would have different sizes and the resulting
 * shape would not be an exact square.
 */
CoSELayout.prototype.calcIdealRowWidth = function (members, favorHorizontalDim) {
  // To approximate a square shaped complex we need to make complex width equal to complex height.
  // To achieve this we need to solve the following equation system for hc:
  // (x + bx) * hc - bx = (y + by) * vc - by, hc * vc = n
  // where x is the avarage width of the nodes, y is the avarage height of nodes
  // bx and by are the buffer sizes in horizontal and vertical dimensions accordingly,
  // hc and vc are the number of rows in horizontal and vertical dimensions
  // n is number of members.

  var verticalPadding = CoSEConstants.TILING_PADDING_VERTICAL;
  var horizontalPadding = CoSEConstants.TILING_PADDING_HORIZONTAL;

  // number of members
  var membersSize = members.length;

  // sum of the width of all members
  var totalWidth = 0;

  // sum of the height of all members
  var totalHeight = 0;

  var maxWidth = 0;

  // traverse all members to calculate total width and total height and get the maximum members width
  members.forEach(function (node) {
    totalWidth += node.getWidth();
    totalHeight += node.getHeight();

    if (node.getWidth() > maxWidth) {
      maxWidth = node.getWidth();
    }
  });

  // average width of the members
  var averageWidth = totalWidth / membersSize;

  // average height of the members
  var averageHeight = totalHeight / membersSize;

  // solving the initial equation system for the hc yields the following second degree equation:
  // hc^2 * (x+bx) + hc * (by - bx) - n * (y + by) = 0

  // the delta value to solve the equation above for hc
  var delta = Math.pow(verticalPadding - horizontalPadding, 2) + 4 * (averageWidth + horizontalPadding) * (averageHeight + verticalPadding) * membersSize;

  // solve the equation using delta value to calculate the horizontal count
  // that represents the number of nodes in an ideal row
  var horizontalCountDouble = (horizontalPadding - verticalPadding + Math.sqrt(delta)) / (2 * (averageWidth + horizontalPadding));
  // round the calculated horizontal count up or down according to the favored dimension
  var horizontalCount;

  if (favorHorizontalDim) {
    horizontalCount = Math.ceil(horizontalCountDouble);
    // if horizontalCount count is not a float value then both of rounding to floor and ceil
    // will yield the same values. Instead of repeating the same calculation try going up
    // while favoring horizontal dimension in such cases
    if ( horizontalCount == horizontalCountDouble ) {
      horizontalCount++;
    }
  } else {
    horizontalCount = Math.floor(horizontalCountDouble);
  }

  // ideal width to be calculated
  var idealWidth = horizontalCount * (averageWidth + horizontalPadding) - horizontalPadding;

  // if max width is bigger than calculated ideal width reset ideal width to it
  if (maxWidth > idealWidth) {
    idealWidth = maxWidth;
  }

  // add the left-right margins to the ideal row width
  idealWidth += horizontalPadding * 2;

  // return the ideal row width1
  return idealWidth;
};

CoSELayout.prototype.tileNodesByFavoringDim = function (nodes, minWidth, favorHorizontalDim) {
  var verticalPadding = CoSEConstants.TILING_PADDING_VERTICAL;
  var horizontalPadding = CoSEConstants.TILING_PADDING_HORIZONTAL;
  var tilingCompareBy = CoSEConstants.TILING_COMPARE_BY;
  var organization = {
    rows: [],
    rowWidth: [],
    rowHeight: [],
    width: 0,
    height: minWidth, // assume minHeight equals to minWidth
    verticalPadding: verticalPadding,
    horizontalPadding: horizontalPadding,
    centerX: 0,
    centerY: 0
  };

  if (tilingCompareBy) {
    organization.idealRowWidth = this.calcIdealRowWidth(nodes, favorHorizontalDim);
  }

  var getNodeArea = function( n ) {
    return n.rect.width * n.rect.height;
  };

  var areaCompareFcn = function(n1, n2){
    return getNodeArea( n2 ) - getNodeArea( n1 );
  };

  // Sort the nodes in descending order of their areas
  nodes.sort(function (n1, n2) {
    var cmpBy = areaCompareFcn;
    if ( organization.idealRowWidth ) {
      cmpBy = tilingCompareBy;
      return cmpBy( n1.id, n2.id );
    }
    return cmpBy( n1, n2 );
  });

  // Create the organization -> calculate compound center
  var sumCenterX = 0;
  var sumCenterY = 0;
  for (var i = 0; i < nodes.length; i++) {
    var lNode = nodes[i];

    sumCenterX += lNode.getCenterX();
    sumCenterY += lNode.getCenterY();
  }

  organization.centerX = sumCenterX / nodes.length;
  organization.centerY = sumCenterY / nodes.length;

  // Create the organization -> tile members
  for (var i = 0; i < nodes.length; i++) {
    var lNode = nodes[i];
    
    if (organization.rows.length == 0) {
      this.insertNodeToRow(organization, lNode, 0, minWidth);
    }
    else if (this.canAddHorizontal(organization, lNode.rect.width, lNode.rect.height)) {
      var rowIndex = organization.rows.length - 1;
      if (!organization.idealRowWidth) {
        rowIndex = this.getShortestRowIndex(organization);
      }
      this.insertNodeToRow(organization, lNode, rowIndex, minWidth);
    }
    else {
      this.insertNodeToRow(organization, lNode, organization.rows.length, minWidth);
    }

    this.shiftToLastRow(organization);
  }

  return organization;
};

CoSELayout.prototype.insertNodeToRow = function (organization, node, rowIndex, minWidth) {
  var minCompoundSize = minWidth;

  // Add new row if needed
  if (rowIndex == organization.rows.length) {
    var secondDimension = [];

    organization.rows.push(secondDimension);
    organization.rowWidth.push(minCompoundSize);
    organization.rowHeight.push(0);
  }

  // Update row width
  var w = organization.rowWidth[rowIndex] + node.rect.width;

  if (organization.rows[rowIndex].length > 0) {
    w += organization.horizontalPadding;
  }

  organization.rowWidth[rowIndex] = w;
  // Update compound width
  if (organization.width < w) {
    organization.width = w;
  }

  // Update height
  var h = node.rect.height;
  if (rowIndex > 0)
    h += organization.verticalPadding;

  var extraHeight = 0;
  if (h > organization.rowHeight[rowIndex]) {
    extraHeight = organization.rowHeight[rowIndex];
    organization.rowHeight[rowIndex] = h;
    extraHeight = organization.rowHeight[rowIndex] - extraHeight;
  }

  organization.height += extraHeight;

  // Insert node
  organization.rows[rowIndex].push(node);
};

//Scans the rows of an organization and returns the one with the min width
CoSELayout.prototype.getShortestRowIndex = function (organization) {
  var r = -1;
  var min = Number.MAX_VALUE;

  for (var i = 0; i < organization.rows.length; i++) {
    if (organization.rowWidth[i] < min) {
      r = i;
      min = organization.rowWidth[i];
    }
  }
  return r;
};

//Scans the rows of an organization and returns the one with the max width
CoSELayout.prototype.getLongestRowIndex = function (organization) {
  var r = -1;
  var max = Number.MIN_VALUE;

  for (var i = 0; i < organization.rows.length; i++) {

    if (organization.rowWidth[i] > max) {
      r = i;
      max = organization.rowWidth[i];
    }
  }

  return r;
};

/**
* This method checks whether adding extra width to the organization violates
* the aspect ratio(1) or not.
*/
CoSELayout.prototype.canAddHorizontal = function (organization, extraWidth, extraHeight) {

  // if there is an ideal row width specified use it instead of checking the aspect ratio
  if (organization.idealRowWidth) {
    var lastRowIndex = organization.rows.length - 1;
    var lastRowWidth = organization.rowWidth[lastRowIndex];

    // check and return if ideal row width will be exceed if the node is added to the row
    return lastRowWidth + extraWidth + organization.horizontalPadding <= organization.idealRowWidth;
  }

  var sri = this.getShortestRowIndex(organization);

  if (sri < 0) {
    return true;
  }

  var min = organization.rowWidth[sri];

  if (min + organization.horizontalPadding + extraWidth <= organization.width)
    return true;

  var hDiff = 0;

  // Adding to an existing row
  if (organization.rowHeight[sri] < extraHeight) {
    if (sri > 0)
      hDiff = extraHeight + organization.verticalPadding - organization.rowHeight[sri];
  }

  var add_to_row_ratio;
  if (organization.width - min >= extraWidth + organization.horizontalPadding) {
    add_to_row_ratio = (organization.height + hDiff) / (min + extraWidth + organization.horizontalPadding);
  } else {
    add_to_row_ratio = (organization.height + hDiff) / organization.width;
  }

  // Adding a new row for this node
  hDiff = extraHeight + organization.verticalPadding;
  var add_new_row_ratio;
  if (organization.width < extraWidth) {
    add_new_row_ratio = (organization.height + hDiff) / extraWidth;
  } else {
    add_new_row_ratio = (organization.height + hDiff) / organization.width;
  }

  if (add_new_row_ratio < 1)
    add_new_row_ratio = 1 / add_new_row_ratio;

  if (add_to_row_ratio < 1)
    add_to_row_ratio = 1 / add_to_row_ratio;

  return add_to_row_ratio < add_new_row_ratio;
};

//If moving the last node from the longest row and adding it to the last
//row makes the bounding box smaller, do it.
CoSELayout.prototype.shiftToLastRow = function (organization) {
  var longest = this.getLongestRowIndex(organization);
  var last = organization.rowWidth.length - 1;
  var row = organization.rows[longest];
  var node = row[row.length - 1];

  var diff = node.width + organization.horizontalPadding;

  // Check if there is enough space on the last row
  if (organization.width - organization.rowWidth[last] > diff && longest != last) {
    // Remove the last element of the longest row
    row.splice(-1, 1);

    // Push it to the last row
    organization.rows[last].push(node);

    organization.rowWidth[longest] = organization.rowWidth[longest] - diff;
    organization.rowWidth[last] = organization.rowWidth[last] + diff;
    organization.width = organization.rowWidth[instance.getLongestRowIndex(organization)];

    // Update heights of the organization
    var maxHeight = Number.MIN_VALUE;
    for (var i = 0; i < row.length; i++) {
      if (row[i].height > maxHeight)
        maxHeight = row[i].height;
    }
    if (longest > 0)
      maxHeight += organization.verticalPadding;

    var prevTotal = organization.rowHeight[longest] + organization.rowHeight[last];

    organization.rowHeight[longest] = maxHeight;
    if (organization.rowHeight[last] < node.height + organization.verticalPadding)
      organization.rowHeight[last] = node.height + organization.verticalPadding;

    var finalTotal = organization.rowHeight[longest] + organization.rowHeight[last];
    organization.height += (finalTotal - prevTotal);

    this.shiftToLastRow(organization);
  }
};

CoSELayout.prototype.tilingPreLayout = function() {
  if (CoSEConstants.TILE) {
    // Find zero degree nodes and create a compound for each level
    this.groupZeroDegreeMembers();
    // Tile and clear children of each compound
    this.clearCompounds();
    // Separately tile and clear zero degree nodes for each level
    this.clearZeroDegreeMembers();
  }
};

CoSELayout.prototype.tilingPostLayout = function() {
  if (CoSEConstants.TILE) {
    this.repopulateZeroDegreeMembers();
    this.repopulateCompounds();
  }
};

// -----------------------------------------------------------------------------
// Section: Tree Reduction methods
// -----------------------------------------------------------------------------
// Reduce trees 
CoSELayout.prototype.reduceTrees = function ()
{
  var prunedNodesAll = [];
  var containsLeaf = true;
  var node;
  
  while(containsLeaf) {
    var allNodes = this.graphManager.getAllNodes();
    var prunedNodesInStepTemp = [];
    containsLeaf = false;
    
    for (var i = 0; i < allNodes.length; i++) {
      node = allNodes[i];
      if(node.getEdges().length == 1 && !node.getEdges()[0].isInterGraph && node.getChild() == null){
        if(CoSEConstants.PURE_INCREMENTAL) {
          var otherEnd = node.getEdges()[0].getOtherEnd(node);
          var relativePosition = new DimensionD(node.getCenterX() - otherEnd.getCenterX(), node.getCenterY() - otherEnd.getCenterY());
          prunedNodesInStepTemp.push([node, node.getEdges()[0], node.getOwner(), relativePosition]);
        }
        else {
          prunedNodesInStepTemp.push([node, node.getEdges()[0], node.getOwner()]);
        }
        containsLeaf = true;
      }  
    }
    if(containsLeaf == true){
      var prunedNodesInStep = [];
      for(var j = 0; j < prunedNodesInStepTemp.length; j++){
        if(prunedNodesInStepTemp[j][0].getEdges().length == 1){
          prunedNodesInStep.push(prunedNodesInStepTemp[j]);  
          prunedNodesInStepTemp[j][0].getOwner().remove(prunedNodesInStepTemp[j][0]);
        }
      }
      prunedNodesAll.push(prunedNodesInStep);
      this.graphManager.resetAllNodes();
      this.graphManager.resetAllEdges();
    }
  }
  this.prunedNodesAll = prunedNodesAll;
};

// Grow tree one step 
CoSELayout.prototype.growTree = function(prunedNodesAll)
{
  var lengthOfPrunedNodesInStep = prunedNodesAll.length; 
  var prunedNodesInStep = prunedNodesAll[lengthOfPrunedNodesInStep - 1];  

  var nodeData;  
  for(var i = 0; i < prunedNodesInStep.length; i++){
    nodeData = prunedNodesInStep[i];
    
    this.findPlaceforPrunedNode(nodeData);
    
    nodeData[2].add(nodeData[0]);
    nodeData[2].add(nodeData[1], nodeData[1].source, nodeData[1].target);
  }

  prunedNodesAll.splice(prunedNodesAll.length-1, 1);
  this.graphManager.resetAllNodes();
  this.graphManager.resetAllEdges();
};

// Find an appropriate position to replace pruned node, this method can be improved
CoSELayout.prototype.findPlaceforPrunedNode = function(nodeData){
  
  var gridForPrunedNode;  
  var nodeToConnect;
  var prunedNode = nodeData[0];
  if(prunedNode == nodeData[1].source){
    nodeToConnect = nodeData[1].target;
  }
  else {
    nodeToConnect = nodeData[1].source;  
  }
  
  if(CoSEConstants.PURE_INCREMENTAL) {
    prunedNode.setCenter(nodeToConnect.getCenterX() + nodeData[3].getWidth(),
                         nodeToConnect.getCenterY() + nodeData[3].getHeight());
  }
  else {
    var startGridX = nodeToConnect.startX;
    var finishGridX = nodeToConnect.finishX;
    var startGridY = nodeToConnect.startY;
    var finishGridY = nodeToConnect.finishY; 

    var upNodeCount = 0;
    var downNodeCount = 0;
    var rightNodeCount = 0;
    var leftNodeCount = 0;
    var controlRegions = [upNodeCount, rightNodeCount, downNodeCount, leftNodeCount]

    if(startGridY > 0){
      for(var i = startGridX; i <= finishGridX; i++ ){
        controlRegions[0] += (this.grid[i][startGridY - 1].length + this.grid[i][startGridY].length - 1);   
      }
    }
    if(finishGridX < this.grid.length - 1){
      for(var i = startGridY; i <= finishGridY; i++ ){
        controlRegions[1] += (this.grid[finishGridX + 1][i].length + this.grid[finishGridX][i].length - 1);   
      }
    }
    if(finishGridY < this.grid[0].length - 1){
      for(var i = startGridX; i <= finishGridX; i++ ){
        controlRegions[2] += (this.grid[i][finishGridY + 1].length + this.grid[i][finishGridY].length - 1);   
      }
    }
    if(startGridX > 0){
      for(var i = startGridY; i <= finishGridY; i++ ){
        controlRegions[3] += (this.grid[startGridX - 1][i].length + this.grid[startGridX][i].length - 1);   
      }
    }
    var min = Integer.MAX_VALUE;
    var minCount;
    var minIndex;
    for(var j = 0; j < controlRegions.length; j++){
      if(controlRegions[j] < min){
        min = controlRegions[j];
        minCount = 1;
        minIndex = j;
      }  
      else if(controlRegions[j] == min){
        minCount++;  
      }
    }

    if(minCount == 3 && min == 0){
      if(controlRegions[0] == 0 && controlRegions[1] == 0 && controlRegions[2] == 0){
        gridForPrunedNode = 1;    
      }
      else if(controlRegions[0] == 0 && controlRegions[1] == 0 && controlRegions[3] == 0){
        gridForPrunedNode = 0;  
      }
      else if(controlRegions[0] == 0 && controlRegions[2] == 0 && controlRegions[3] == 0){
        gridForPrunedNode = 3;  
      }
      else if(controlRegions[1] == 0 && controlRegions[2] == 0 && controlRegions[3] == 0){
        gridForPrunedNode = 2;  
      }
    }
    else if(minCount == 2 && min == 0){
      var random = Math.floor(Math.random() * 2);
      if(controlRegions[0] == 0 && controlRegions[1] == 0){;
        if(random == 0){
          gridForPrunedNode = 0;
        }
        else{
          gridForPrunedNode = 1;
        }
      }
      else if(controlRegions[0] == 0 && controlRegions[2] == 0){
        if(random == 0){
          gridForPrunedNode = 0;
        }
        else{
          gridForPrunedNode = 2;
        }
      }
      else if(controlRegions[0] == 0 && controlRegions[3] == 0){
        if(random == 0){
          gridForPrunedNode = 0;
        }
        else{
          gridForPrunedNode = 3;
        }
      }
      else if(controlRegions[1] == 0 && controlRegions[2] == 0){
        if(random == 0){
          gridForPrunedNode = 1;
        }
        else{
          gridForPrunedNode = 2;
        }
      }
      else if(controlRegions[1] == 0 && controlRegions[3] == 0){
        if(random == 0){
          gridForPrunedNode = 1;
        }
        else{
          gridForPrunedNode = 3;
        }
      }
      else {
        if(random == 0){
          gridForPrunedNode = 2;
        }
        else{
          gridForPrunedNode = 3;
        }
      }
    }
    else if(minCount == 4 && min == 0){
      var random = Math.floor(Math.random() * 4);
      gridForPrunedNode = random;  
    }
    else {
      gridForPrunedNode = minIndex;
    }

    if(gridForPrunedNode == 0) {
      prunedNode.setCenter(nodeToConnect.getCenterX(),
                           nodeToConnect.getCenterY() - nodeToConnect.getHeight()/2 - FDLayoutConstants.DEFAULT_EDGE_LENGTH - prunedNode.getHeight()/2);  
    }
    else if(gridForPrunedNode == 1) {
      prunedNode.setCenter(nodeToConnect.getCenterX() + nodeToConnect.getWidth()/2 + FDLayoutConstants.DEFAULT_EDGE_LENGTH + prunedNode.getWidth()/2,
                           nodeToConnect.getCenterY());  
    }
    else if(gridForPrunedNode == 2) {
      prunedNode.setCenter(nodeToConnect.getCenterX(),
                           nodeToConnect.getCenterY() + nodeToConnect.getHeight()/2 + FDLayoutConstants.DEFAULT_EDGE_LENGTH + prunedNode.getHeight()/2);  
    }
    else { 
      prunedNode.setCenter(nodeToConnect.getCenterX() - nodeToConnect.getWidth()/2 - FDLayoutConstants.DEFAULT_EDGE_LENGTH - prunedNode.getWidth()/2,
                           nodeToConnect.getCenterY());  
    }
  }
};

module.exports = CoSELayout;


/***/ }),

/***/ 355:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var FDLayoutNode = (__webpack_require__(730).FDLayoutNode);
var IMath = (__webpack_require__(730).IMath);

function CoSENode(gm, loc, size, vNode) {
  FDLayoutNode.call(this, gm, loc, size, vNode);
}

CoSENode.prototype = Object.create(FDLayoutNode.prototype);
for (var prop in FDLayoutNode) {
  CoSENode[prop] = FDLayoutNode[prop];
}

CoSENode.prototype.calculateDisplacement = function ()
{
  var layout = this.graphManager.getLayout();
  // this check is for compound nodes that contain fixed nodes
  if (this.getChild() != null && this.fixedNodeWeight) {
    this.displacementX += layout.coolingFactor *
            (this.springForceX + this.repulsionForceX + this.gravitationForceX) / this.fixedNodeWeight;
    this.displacementY += layout.coolingFactor *
            (this.springForceY + this.repulsionForceY + this.gravitationForceY) / this.fixedNodeWeight;
  }
  else {
    this.displacementX += layout.coolingFactor *
            (this.springForceX + this.repulsionForceX + this.gravitationForceX) / this.noOfChildren;
    this.displacementY += layout.coolingFactor *
            (this.springForceY + this.repulsionForceY + this.gravitationForceY) / this.noOfChildren;
  }

  if (Math.abs(this.displacementX) > layout.coolingFactor * layout.maxNodeDisplacement)
  {
    this.displacementX = layout.coolingFactor * layout.maxNodeDisplacement *
            IMath.sign(this.displacementX);
  }

  if (Math.abs(this.displacementY) > layout.coolingFactor * layout.maxNodeDisplacement)
  {
    this.displacementY = layout.coolingFactor * layout.maxNodeDisplacement *
            IMath.sign(this.displacementY);
  }
  
  // non-empty compound node, propogate movement to children as well
  if(this.child && this.child.getNodes().length > 0)
  {
    this.propogateDisplacementToChildren(this.displacementX,
            this.displacementY);
  }
 
};

CoSENode.prototype.propogateDisplacementToChildren = function (dX, dY)
{
  var nodes = this.getChild().getNodes();
  var node;
  for (var i = 0; i < nodes.length; i++)
  {
    node = nodes[i];
    if (node.getChild() == null)
    {
      node.displacementX += dX;
      node.displacementY += dY;      
    }
    else
    {
      node.propogateDisplacementToChildren(dX, dY);
    }
  }
};

CoSENode.prototype.move = function ()
{
  var layout = this.graphManager.getLayout();
  
  // a simple node or an empty compound node, move it
  if (this.child == null || this.child.getNodes().length == 0)
  {
    this.moveBy(this.displacementX, this.displacementY);

    layout.totalDisplacement += Math.abs(this.displacementX) + Math.abs(this.displacementY);
  }

  this.springForceX = 0;
  this.springForceY = 0;
  this.repulsionForceX = 0;
  this.repulsionForceY = 0;
  this.gravitationForceX = 0;
  this.gravitationForceY = 0;
  this.displacementX = 0;
  this.displacementY = 0;  
};

CoSENode.prototype.setPred1 = function (pred1)
{
  this.pred1 = pred1;
};

CoSENode.prototype.getPred1 = function ()
{
  return pred1;
};

CoSENode.prototype.getPred2 = function ()
{
  return pred2;
};

CoSENode.prototype.setNext = function (next)
{
  this.next = next;
};

CoSENode.prototype.getNext = function ()
{
  return next;
};

CoSENode.prototype.setProcessed = function (processed)
{
  this.processed = processed;
};

CoSENode.prototype.isProcessed = function ()
{
  return processed;
};

module.exports = CoSENode;


/***/ }),

/***/ 661:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var CoSEConstants = __webpack_require__(642);
var LinkedList = (__webpack_require__(730).LinkedList);
var Matrix = (__webpack_require__(730).Matrix);
var SVD = (__webpack_require__(730).SVD);

function ConstraintHandler() {
}

ConstraintHandler.handleConstraints = function (layout)
{
//  let layout = this.graphManager.getLayout();
  
  // get constraints from layout
  let constraints = {};
  constraints.fixedNodeConstraint = layout.constraints.fixedNodeConstraint;
  constraints.alignmentConstraint = layout.constraints.alignmentConstraint;
  constraints.relativePlacementConstraint = layout.constraints.relativePlacementConstraint;
  
  let idToNodeMap = new Map();
  let nodeIndexes = new Map();
  let xCoords = [];
  let yCoords = [];  
  
  let allNodes = layout.getAllNodes();
  let index = 0;
  // fill index map and coordinates
  for (let i = 0; i < allNodes.length; i++) {
    let node = allNodes[i];
    if (node.getChild() == null) {
      nodeIndexes.set(node.id, index++);
      xCoords.push(node.getCenterX());
      yCoords.push(node.getCenterY());
      idToNodeMap.set(node.id, node);
    }
  }
  
  // if there exists relative placement constraint without gap value, set it to default 
  if (constraints.relativePlacementConstraint) {
    constraints.relativePlacementConstraint.forEach(function(constraint) {
      if (!constraint.gap && constraint.gap != 0) {
        if (constraint.left) {
          constraint.gap = CoSEConstants.DEFAULT_EDGE_LENGTH + idToNodeMap.get(constraint.left).getWidth()/2 + idToNodeMap.get(constraint.right).getWidth()/2;
        }
        else {
          constraint.gap = CoSEConstants.DEFAULT_EDGE_LENGTH + idToNodeMap.get(constraint.top).getHeight()/2 + idToNodeMap.get(constraint.bottom).getHeight()/2;
        }
      }
    });
  }
  
  /* auxiliary functions */
 
  // calculate difference between two position objects
  let calculatePositionDiff = function(pos1, pos2) {
    return {x: pos1.x - pos2.x, y: pos1.y - pos2.y};
  };
  
  // calculate average position of the nodes
  let calculateAvgPosition = function(nodeIdSet) {
    let xPosSum = 0;
    let yPosSum = 0;    
    nodeIdSet.forEach(function(nodeId) {
      xPosSum += xCoords[nodeIndexes.get(nodeId)];
      yPosSum += yCoords[nodeIndexes.get(nodeId)];
    });
    
    return {x: xPosSum / nodeIdSet.size, y: yPosSum / nodeIdSet.size};
  };
  
  // find an appropriate positioning for the nodes in a given graph according to relative placement constraints
  // this function also takes the fixed nodes and alignment constraints into account
  // graph: dag to be evaluated, direction: "horizontal" or "vertical", 
  // fixedNodes: set of fixed nodes to consider during evaluation, dummyPositions: appropriate coordinates of the dummy nodes  
  let findAppropriatePositionForRelativePlacement = function(graph, direction, fixedNodes, dummyPositions, componentSources) {
    
    // find union of two sets
    function setUnion(setA, setB) {
      let union = new Set(setA);
      for (let elem of setB) {
          union.add(elem);
      }
      return union;
    }
    
    // find indegree count for each node
    let inDegrees = new Map();

    graph.forEach(function(value, key) {
      inDegrees.set(key, 0);
    });      
    graph.forEach(function(value, key) {
      value.forEach(function(adjacent) {
        inDegrees.set(adjacent.id, inDegrees.get(adjacent.id) + 1);  
      });       
    });

    let positionMap = new Map(); // keeps the position for each node
    let pastMap = new Map();  // keeps the predecessors(past) of a node
    let queue = new LinkedList();
    inDegrees.forEach(function(value, key) {
      if (value == 0) {
        queue.push(key);
        if (!fixedNodes) {
          if (direction == "horizontal") {
            positionMap.set(key, nodeIndexes.has(key) ? xCoords[nodeIndexes.get(key)] : dummyPositions.get(key));
          }
          else {
            positionMap.set(key, nodeIndexes.has(key) ? yCoords[nodeIndexes.get(key)] : dummyPositions.get(key));
          }
        }
      }
      else {
        positionMap.set(key, Number.NEGATIVE_INFINITY);       
      }
      if (fixedNodes) {
        pastMap.set(key, new Set([key]));
      }
    });
    
    // align sources of each component in enforcement phase
    if (fixedNodes) {
      componentSources.forEach(function(component) {
        let fixedIds = [];
        component.forEach(function(nodeId) {
          if (fixedNodes.has(nodeId)) {
            fixedIds.push(nodeId);
          }          
        });
        if (fixedIds.length > 0) {
          let position = 0;
          fixedIds.forEach(function(fixedId) {
            if (direction == "horizontal") {
              positionMap.set(fixedId, nodeIndexes.has(fixedId) ? xCoords[nodeIndexes.get(fixedId)] : dummyPositions.get(fixedId));
              position += positionMap.get(fixedId);
            }
            else {
              positionMap.set(fixedId, nodeIndexes.has(fixedId) ? yCoords[nodeIndexes.get(fixedId)] : dummyPositions.get(fixedId));
              position += positionMap.get(fixedId);
            }            
          });
          position = position / fixedIds.length;
          component.forEach(function(nodeId) {
            if (!fixedNodes.has(nodeId)) {
              positionMap.set(nodeId, position);
            }          
          });          
        }
        else {
          let position = 0;
          component.forEach(function(nodeId) {
            if (direction == "horizontal") {
              position += nodeIndexes.has(nodeId) ? xCoords[nodeIndexes.get(nodeId)] : dummyPositions.get(nodeId);
            }
            else {
              position += nodeIndexes.has(nodeId) ? yCoords[nodeIndexes.get(nodeId)] : dummyPositions.get(nodeId);
            }
          });
          position = position / component.length;
          component.forEach(function(nodeId) {
            positionMap.set(nodeId, position);     
          });
        }
      });
    }

    // calculate positions of the nodes
    while (queue.length != 0) {
      let currentNode = queue.shift();
      let neighbors = graph.get(currentNode);
      neighbors.forEach(function(neighbor) {
        if (positionMap.get(neighbor.id) < (positionMap.get(currentNode) + neighbor.gap)) {
          if (fixedNodes && fixedNodes.has(neighbor.id)) {
            let fixedPosition;
            if (direction == "horizontal") {
              fixedPosition = nodeIndexes.has(neighbor.id) ? xCoords[nodeIndexes.get(neighbor.id)] : dummyPositions.get(neighbor.id);
            }
            else {
              fixedPosition = nodeIndexes.has(neighbor.id) ? yCoords[nodeIndexes.get(neighbor.id)] : dummyPositions.get(neighbor.id);
            }
            positionMap.set(neighbor.id, fixedPosition); // TODO: may do unnecessary work
            if (fixedPosition < (positionMap.get(currentNode) + neighbor.gap)) {
              let diff = (positionMap.get(currentNode) + neighbor.gap) - fixedPosition;
              pastMap.get(currentNode).forEach(function(nodeId) {
                positionMap.set(nodeId, positionMap.get(nodeId) - diff);
              });
            }            
          }
          else {
            positionMap.set(neighbor.id, positionMap.get(currentNode) + neighbor.gap);
          }
        }
        inDegrees.set(neighbor.id, inDegrees.get(neighbor.id) - 1);
        if (inDegrees.get(neighbor.id) == 0) {
          queue.push(neighbor.id);
        }
        if (fixedNodes) {
          pastMap.set(neighbor.id, setUnion(pastMap.get(currentNode), pastMap.get(neighbor.id)));
        }
      });
    }

    // readjust position of the nodes after enforcement
    if (fixedNodes) {
      // find indegree count for each node
      let sinkNodes = new Set();

      graph.forEach(function(value, key) {
        if (value.length == 0) {
          sinkNodes.add(key);
        }
      });

      let components = [];
      pastMap.forEach(function(value, key) {
        if (sinkNodes.has(key)) {
          let isFixedComponent = false;
          for (let nodeId of value) {
            if (fixedNodes.has(nodeId)) {
              isFixedComponent = true;
            }
          }
          if (!isFixedComponent) {
            let isExist = false;
            let existAt;
            components.forEach(function(component, index) {
              if (component.has([...value][0])) {
                isExist = true;
                existAt = index;
              }
            });
            if (!isExist) {
              components.push(new Set(value));
            }
            else {
              value.forEach(function(ele) {
                components[existAt].add(ele);
              });              
            }
          }
        }
      });

      components.forEach(function(component, index) {
        let minBefore = Number.POSITIVE_INFINITY;
        let minAfter = Number.POSITIVE_INFINITY;
        let maxBefore = Number.NEGATIVE_INFINITY;
        let maxAfter = Number.NEGATIVE_INFINITY;

        for (let nodeId of component) {
          let posBefore;
          if (direction == "horizontal") {
            posBefore = nodeIndexes.has(nodeId) ? xCoords[nodeIndexes.get(nodeId)] : dummyPositions.get(nodeId);
          }
          else {
            posBefore = nodeIndexes.has(nodeId) ? yCoords[nodeIndexes.get(nodeId)] : dummyPositions.get(nodeId);
          }
          let posAfter = positionMap.get(nodeId);
          if (posBefore < minBefore) {
            minBefore = posBefore;
          }
          if (posBefore > maxBefore) {
            maxBefore = posBefore;
          }
          if (posAfter < minAfter) {
            minAfter = posAfter;
          }
          if (posAfter > maxAfter) {
            maxAfter = posAfter;
          }
        }
        let diff = (minBefore + maxBefore) / 2 - (minAfter + maxAfter) / 2;

        for (let nodeId of component) {
          positionMap.set(nodeId, positionMap.get(nodeId) + diff);
        }
      });
    }

    return positionMap;
  };
  
  // find transformation based on rel. placement constraints if there are both alignment and rel. placement constraints
  // or if there are only rel. placement contraints where the largest component isn't sufficiently large
  let applyReflectionForRelativePlacement = function (relativePlacementConstraints) {
    // variables to count votes
    let reflectOnY = 0, notReflectOnY = 0;
    let reflectOnX = 0, notReflectOnX = 0;

    relativePlacementConstraints.forEach(function(constraint) {
      if (constraint.left) {
        (xCoords[nodeIndexes.get(constraint.left)] - xCoords[nodeIndexes.get(constraint.right)] >= 0) ? reflectOnY++ : notReflectOnY++;
      }
      else {
        (yCoords[nodeIndexes.get(constraint.top)] - yCoords[nodeIndexes.get(constraint.bottom)] >= 0) ? reflectOnX++ : notReflectOnX++;
      }
    });

    if (reflectOnY > notReflectOnY && reflectOnX > notReflectOnX) {
      for (let i = 0; i < nodeIndexes.size; i++) {
        xCoords[i] = -1 * xCoords[i];
        yCoords[i] = -1 * yCoords[i];
      }
    }
    else if (reflectOnY > notReflectOnY) {
      for (let i = 0; i < nodeIndexes.size; i++) {
        xCoords[i] = -1 * xCoords[i];
      }
    }
    else if (reflectOnX > notReflectOnX) {
      for (let i = 0; i < nodeIndexes.size; i++) {
        yCoords[i] = -1 * yCoords[i];
      }
    }
  };
  
  // find weakly connected components in undirected graph
  let findComponents = function(graph) {
    // find weakly connected components in dag
    let components = [];
    let queue = new LinkedList();
    let visited = new Set();
    let count = 0;
    
    graph.forEach(function(value, key) {
      if (!visited.has(key)) {
        components[count] = [];
        let currentNode = key;
        queue.push(currentNode);
        visited.add(currentNode);
        components[count].push(currentNode);

        while (queue.length != 0) {
          currentNode = queue.shift();
          let neighbors = graph.get(currentNode);
          neighbors.forEach(function(neighbor) {
            if (!visited.has(neighbor.id)) {
              queue.push(neighbor.id);
              visited.add(neighbor.id);
              components[count].push(neighbor.id);
            }
          });
        }
        count++;
      }
    });
    return components;
  };
  
  // return undirected version of given dag
  let dagToUndirected = function(dag) {
    let undirected = new Map();
    
    dag.forEach(function(value, key) {
      undirected.set(key, []);
    });
    
    dag.forEach(function(value, key) {
      value.forEach(function(adjacent) {
        undirected.get(key).push(adjacent);
        undirected.get(adjacent.id).push({id: key, gap: adjacent.gap, direction: adjacent.direction});
      });
    });    
    
    return undirected;
  };
  
  // return reversed (directions inverted) version of given dag
  let dagToReversed = function(dag) {
    let reversed = new Map();
    
    dag.forEach(function(value, key) {
      reversed.set(key, []);
    });
    
    dag.forEach(function(value, key) {
      value.forEach(function(adjacent) {
        reversed.get(adjacent.id).push({id: key, gap: adjacent.gap, direction: adjacent.direction});
      });
    });    
    
    return reversed;
  };  
  
  /****  apply transformation to the initial draft layout to better align with constrained nodes ****/
  // solve the Orthogonal Procrustean Problem to rotate and/or reflect initial draft layout
  // here we follow the solution in Chapter 20.2 of Borg, I. & Groenen, P. (2005) Modern Multidimensional Scaling: Theory and Applications 
  
  /* construct source and target configurations */
  
  let targetMatrix = []; // A - target configuration
  let sourceMatrix = []; // B - source configuration 
  let standardTransformation = false; // false for no transformation, true for standart (Procrustes) transformation (rotation and/or reflection)
  let reflectionType = false; // false/true for reflection check, 'reflectOnX', 'reflectOnY' or 'reflectOnBoth' for reflection type if necessary
  let fixedNodes = new Set();
  let dag = new Map(); // adjacency list to keep directed acyclic graph (dag) that consists of relative placement constraints
  let dagUndirected = new Map(); // undirected version of the dag
  let components = []; // weakly connected components
  
  // fill fixedNodes collection to use later
  if (constraints.fixedNodeConstraint) {
    constraints.fixedNodeConstraint.forEach(function(nodeData) {
      fixedNodes.add(nodeData.nodeId);
    });
  }
  
  // construct dag from relative placement constraints 
  if (constraints.relativePlacementConstraint) {
    // construct both directed and undirected version of the dag
    constraints.relativePlacementConstraint.forEach(function(constraint) {
      if (constraint.left) {
        if (dag.has(constraint.left)) {
          dag.get(constraint.left).push({id: constraint.right, gap: constraint.gap, direction: "horizontal"});
        }
        else {
          dag.set(constraint.left, [{id: constraint.right, gap: constraint.gap, direction: "horizontal"}]); 
        }
        if (!dag.has(constraint.right)) {
          dag.set(constraint.right, []);         
        }
      }
      else {
        if (dag.has(constraint.top)) {
          dag.get(constraint.top).push({id: constraint.bottom, gap: constraint.gap, direction: "vertical"});
        }
        else {
          dag.set(constraint.top, [{id: constraint.bottom, gap: constraint.gap, direction: "vertical"}]);        
        }        
        if (!dag.has(constraint.bottom)) {
          dag.set(constraint.bottom, []);         
        }      
      }      
    });
    
    dagUndirected = dagToUndirected(dag);
    components = findComponents(dagUndirected);   
  }
  
  if (CoSEConstants.TRANSFORM_ON_CONSTRAINT_HANDLING) {
    // first check fixed node constraint
    if (constraints.fixedNodeConstraint && constraints.fixedNodeConstraint.length > 1) {
      constraints.fixedNodeConstraint.forEach(function(nodeData, i) {
        targetMatrix[i] = [nodeData.position.x, nodeData.position.y];
        sourceMatrix[i] = [xCoords[nodeIndexes.get(nodeData.nodeId)], yCoords[nodeIndexes.get(nodeData.nodeId)]];
      });
      standardTransformation = true;
    }
    else if (constraints.alignmentConstraint) {  // then check alignment constraint
      let count = 0;
      if (constraints.alignmentConstraint.vertical) {
        let verticalAlign = constraints.alignmentConstraint.vertical;
        for (let i = 0; i < verticalAlign.length; i++) {
          let alignmentSet = new Set();
          verticalAlign[i].forEach(function(nodeId) {
            alignmentSet.add(nodeId);
          });
          let intersection = new Set([...alignmentSet].filter(x => fixedNodes.has(x)));
          let xPos;
          if (intersection.size > 0)
            xPos = xCoords[nodeIndexes.get(intersection.values().next().value)];
          else
            xPos = calculateAvgPosition(alignmentSet).x;

          verticalAlign[i].forEach(function(nodeId) {
            targetMatrix[count] = [xPos, yCoords[nodeIndexes.get(nodeId)]];
            sourceMatrix[count] = [xCoords[nodeIndexes.get(nodeId)], yCoords[nodeIndexes.get(nodeId)]];
            count++;
          });
        }
        standardTransformation = true;
      }
      if (constraints.alignmentConstraint.horizontal) {
        let horizontalAlign = constraints.alignmentConstraint.horizontal;
        for (let i = 0; i < horizontalAlign.length; i++) {
          let alignmentSet = new Set();
          horizontalAlign[i].forEach(function(nodeId) {
            alignmentSet.add(nodeId);
          });
          let intersection = new Set([...alignmentSet].filter(x => fixedNodes.has(x)));
          let yPos;
          if (intersection.size > 0)
            yPos = xCoords[nodeIndexes.get(intersection.values().next().value)];
          else
            yPos = calculateAvgPosition(alignmentSet).y;

          horizontalAlign[i].forEach(function(nodeId) {
            targetMatrix[count] = [xCoords[nodeIndexes.get(nodeId)], yPos];
            sourceMatrix[count] = [xCoords[nodeIndexes.get(nodeId)], yCoords[nodeIndexes.get(nodeId)]];
            count++;
          });
        }
        standardTransformation = true;
      }
      if (constraints.relativePlacementConstraint) {
        reflectionType = true;
      }
    }
    else if (constraints.relativePlacementConstraint) {  // finally check relative placement constraint
      // find largest component in dag
      let largestComponentSize = 0;
      let largestComponentIndex = 0;
      for (let i = 0; i < components.length; i++) {
        if (components[i].length > largestComponentSize) {
          largestComponentSize = components[i].length;
          largestComponentIndex = i;
        }
      }
      // if largest component isn't dominant, then take the votes for reflection
      if (largestComponentSize < (dagUndirected.size / 2)) {
        applyReflectionForRelativePlacement(constraints.relativePlacementConstraint);
        standardTransformation = false;
        reflectionType = false;
      }
      else { // use largest component for transformation
        // construct horizontal and vertical subgraphs in the largest component
        let subGraphOnHorizontal = new Map();
        let subGraphOnVertical = new Map();
        let constraintsInlargestComponent = [];

        components[largestComponentIndex].forEach(function(nodeId) {
          dag.get(nodeId).forEach(function(adjacent) {
            if (adjacent.direction == "horizontal") {
              if (subGraphOnHorizontal.has(nodeId)) {
                subGraphOnHorizontal.get(nodeId).push(adjacent);
              }
              else {
                subGraphOnHorizontal.set(nodeId, [adjacent]);
              }
              if (!subGraphOnHorizontal.has(adjacent.id)) {
                subGraphOnHorizontal.set(adjacent.id, []);
              }
              constraintsInlargestComponent.push({left: nodeId, right: adjacent.id});
            }
            else {
              if (subGraphOnVertical.has(nodeId)) {
                subGraphOnVertical.get(nodeId).push(adjacent);
              }
              else {
                subGraphOnVertical.set(nodeId, [adjacent]);
              }
              if (!subGraphOnVertical.has(adjacent.id)) {
                subGraphOnVertical.set(adjacent.id, []);
              }
              constraintsInlargestComponent.push({top: nodeId, bottom: adjacent.id});
            }
          });
        });

        applyReflectionForRelativePlacement(constraintsInlargestComponent);
        reflectionType = false;

        // calculate appropriate positioning for subgraphs
        let positionMapHorizontal = findAppropriatePositionForRelativePlacement(subGraphOnHorizontal, "horizontal");
        let positionMapVertical = findAppropriatePositionForRelativePlacement(subGraphOnVertical, "vertical");

        // construct source and target configuration
        components[largestComponentIndex].forEach(function(nodeId, i) {
          sourceMatrix[i] = [xCoords[nodeIndexes.get(nodeId)], yCoords[nodeIndexes.get(nodeId)]];
          targetMatrix[i] = [];
          if (positionMapHorizontal.has(nodeId)) {
            targetMatrix[i][0] = positionMapHorizontal.get(nodeId);
          }
          else {
            targetMatrix[i][0] = xCoords[nodeIndexes.get(nodeId)];
          }
          if (positionMapVertical.has(nodeId)) {
            targetMatrix[i][1] = positionMapVertical.get(nodeId);
          }
          else {
            targetMatrix[i][1] = yCoords[nodeIndexes.get(nodeId)];
          }
        });

        standardTransformation = true;
      }
    }

    // if transformation is required, then calculate and apply transformation matrix
    if (standardTransformation) {
      /* calculate transformation matrix */
      let transformationMatrix;
      let targetMatrixTranspose = Matrix.transpose(targetMatrix);  // A'
      let sourceMatrixTranspose = Matrix.transpose(sourceMatrix);  // B'

      // centralize transpose matrices
      for (let i = 0; i < targetMatrixTranspose.length; i++) {
        targetMatrixTranspose[i] = Matrix.multGamma(targetMatrixTranspose[i]);
        sourceMatrixTranspose[i] = Matrix.multGamma(sourceMatrixTranspose[i]);
      }

      // do actual calculation for transformation matrix
      let tempMatrix = Matrix.multMat(targetMatrixTranspose, Matrix.transpose(sourceMatrixTranspose)); // tempMatrix = A'B
      let SVDResult = SVD.svd(tempMatrix); // SVD(A'B) = USV', svd function returns U, S and V 
      transformationMatrix = Matrix.multMat(SVDResult.V, Matrix.transpose(SVDResult.U)); // transformationMatrix = T = VU'

      /* apply found transformation matrix to obtain final draft layout */
      for (let i = 0; i < nodeIndexes.size; i++) {
        let temp1 = [xCoords[i], yCoords[i]];
        let temp2 = [transformationMatrix[0][0], transformationMatrix[1][0]];
        let temp3 = [transformationMatrix[0][1], transformationMatrix[1][1]];
        xCoords[i] = Matrix.dotProduct(temp1, temp2);
        yCoords[i] = Matrix.dotProduct(temp1, temp3);
      }

      // applied only both alignment and rel. placement constraints exist
      if (reflectionType) {
        applyReflectionForRelativePlacement(constraints.relativePlacementConstraint);
      }
    }
  }
  
  if (CoSEConstants.ENFORCE_CONSTRAINTS) {  
    /****  enforce constraints on the transformed draft layout ****/

    /* first enforce fixed node constraint */
    
    if (constraints.fixedNodeConstraint && constraints.fixedNodeConstraint.length > 0) { 
      let translationAmount = { x: 0, y: 0 };
      constraints.fixedNodeConstraint.forEach(function(nodeData, i) {
        let posInTheory = {x: xCoords[nodeIndexes.get(nodeData.nodeId)], y: yCoords[nodeIndexes.get(nodeData.nodeId)]};
        let posDesired = nodeData.position;
        let posDiff = calculatePositionDiff(posDesired, posInTheory);
        translationAmount.x += posDiff.x;
        translationAmount.y += posDiff.y;
      });
      translationAmount.x /= constraints.fixedNodeConstraint.length;
      translationAmount.y /= constraints.fixedNodeConstraint.length;

      xCoords.forEach(function(value, i) {
        xCoords[i] += translationAmount.x; 
      });

      yCoords.forEach(function(value, i) {
        yCoords[i] += translationAmount.y; 
      });

      constraints.fixedNodeConstraint.forEach(function(nodeData) {
        xCoords[nodeIndexes.get(nodeData.nodeId)] = nodeData.position.x;
        yCoords[nodeIndexes.get(nodeData.nodeId)] = nodeData.position.y;
      });
    }

    /* then enforce alignment constraint */

    if (constraints.alignmentConstraint) {
      if (constraints.alignmentConstraint.vertical) {
        let xAlign = constraints.alignmentConstraint.vertical;
        for (let i = 0; i < xAlign.length; i++) {
          let alignmentSet = new Set();
          xAlign[i].forEach(function(nodeId) {
            alignmentSet.add(nodeId);
          });
          let intersection = new Set([...alignmentSet].filter(x => fixedNodes.has(x)));
          let xPos;
          if (intersection.size > 0)
            xPos = xCoords[nodeIndexes.get(intersection.values().next().value)];
          else
            xPos = calculateAvgPosition(alignmentSet).x;
          
          alignmentSet.forEach(function(nodeId) {
            if (!fixedNodes.has(nodeId))
              xCoords[nodeIndexes.get(nodeId)] = xPos;            
          });
        }
      }
      if (constraints.alignmentConstraint.horizontal) {
        let yAlign = constraints.alignmentConstraint.horizontal;
        for (let i = 0; i < yAlign.length; i++) {
          let alignmentSet = new Set();
          yAlign[i].forEach(function(nodeId) {
            alignmentSet.add(nodeId);
          });
          let intersection = new Set([...alignmentSet].filter(x => fixedNodes.has(x)));
          let yPos;
          if (intersection.size > 0)
            yPos = yCoords[nodeIndexes.get(intersection.values().next().value)];
          else
            yPos = calculateAvgPosition(alignmentSet).y;

          alignmentSet.forEach(function(nodeId) {
            if (!fixedNodes.has(nodeId))
              yCoords[nodeIndexes.get(nodeId)] = yPos;            
          });
        }
      }    
    }
    
    /* finally enforce relative placement constraint */    

    if (constraints.relativePlacementConstraint) {
      let nodeToDummyForVerticalAlignment = new Map();
      let nodeToDummyForHorizontalAlignment = new Map();
      let dummyToNodeForVerticalAlignment = new Map();
      let dummyToNodeForHorizontalAlignment = new Map();      
      let dummyPositionsForVerticalAlignment = new Map();
      let dummyPositionsForHorizontalAlignment = new Map();
      let fixedNodesOnHorizontal = new Set();
      let fixedNodesOnVertical = new Set();
      
      // fill maps and sets      
      fixedNodes.forEach(function(nodeId) {
        fixedNodesOnHorizontal.add(nodeId);
        fixedNodesOnVertical.add(nodeId);
      });
      
      if (constraints.alignmentConstraint) {
        if (constraints.alignmentConstraint.vertical) {
          let verticalAlignment = constraints.alignmentConstraint.vertical;
          for (let i = 0; i < verticalAlignment.length; i++) {
            dummyToNodeForVerticalAlignment.set("dummy" + i, []);
            verticalAlignment[i].forEach(function(nodeId) {
              nodeToDummyForVerticalAlignment.set(nodeId, "dummy" + i);
              dummyToNodeForVerticalAlignment.get("dummy" + i).push(nodeId);
              if (fixedNodes.has(nodeId)) {
                fixedNodesOnHorizontal.add("dummy" + i);
              }
            });
            dummyPositionsForVerticalAlignment.set("dummy" + i, xCoords[nodeIndexes.get(verticalAlignment[i][0])]);
          }
        }
        if (constraints.alignmentConstraint.horizontal) {
          let horizontalAlignment = constraints.alignmentConstraint.horizontal;
          for (let i = 0; i < horizontalAlignment.length; i++) {
            dummyToNodeForHorizontalAlignment.set("dummy" + i, []);
            horizontalAlignment[i].forEach(function(nodeId) {
              nodeToDummyForHorizontalAlignment.set(nodeId, "dummy" + i);
              dummyToNodeForHorizontalAlignment.get("dummy" + i).push(nodeId);
              if (fixedNodes.has(nodeId)) {
                fixedNodesOnVertical.add("dummy" + i);
              }              
            });
            dummyPositionsForHorizontalAlignment.set("dummy" + i, yCoords[nodeIndexes.get(horizontalAlignment[i][0])]);
          }
        }        
      }
      
      // construct horizontal and vertical dags (subgraphs) from overall dag
      let dagOnHorizontal = new Map();
      let dagOnVertical = new Map();

      for (let nodeId of dag.keys()) {
        dag.get(nodeId).forEach(function(adjacent) {
          let sourceId;
          let targetNode;
          if (adjacent["direction"] == "horizontal") {
            sourceId = nodeToDummyForVerticalAlignment.get(nodeId) ? nodeToDummyForVerticalAlignment.get(nodeId) : nodeId;                        
            if (nodeToDummyForVerticalAlignment.get(adjacent.id)) {
              targetNode = {id: nodeToDummyForVerticalAlignment.get(adjacent.id), gap: adjacent.gap, direction: adjacent.direction};
            }
            else {
              targetNode = adjacent;
            }            
            if (dagOnHorizontal.has(sourceId)) {
              dagOnHorizontal.get(sourceId).push(targetNode);
            }
            else {
              dagOnHorizontal.set(sourceId, [targetNode]);
            }
            if (!dagOnHorizontal.has(targetNode.id)) {
              dagOnHorizontal.set(targetNode.id, []);
            }
          }
          else {
            sourceId = nodeToDummyForHorizontalAlignment.get(nodeId) ? nodeToDummyForHorizontalAlignment.get(nodeId) : nodeId;                        
            if (nodeToDummyForHorizontalAlignment.get(adjacent.id)) {
              targetNode = {id: nodeToDummyForHorizontalAlignment.get(adjacent.id), gap: adjacent.gap, direction: adjacent.direction};
            }
            else {
              targetNode = adjacent;
            }             
            if (dagOnVertical.has(sourceId)) {
              dagOnVertical.get(sourceId).push(targetNode);
            }
            else {
              dagOnVertical.set(sourceId, [targetNode]);
            }
            if (!dagOnVertical.has(targetNode.id)) {
              dagOnVertical.set(targetNode.id, []);
            }              
          }
        });
      }
      
      // find source nodes of each component in horizontal and vertical dags
      let undirectedOnHorizontal = dagToUndirected(dagOnHorizontal);
      let undirectedOnVertical = dagToUndirected(dagOnVertical);
      let componentsOnHorizontal = findComponents(undirectedOnHorizontal);
      let componentsOnVertical = findComponents(undirectedOnVertical);
      let reversedDagOnHorizontal = dagToReversed(dagOnHorizontal);
      let reversedDagOnVertical = dagToReversed(dagOnVertical);
      let componentSourcesOnHorizontal = [];
      let componentSourcesOnVertical = [];
      
      componentsOnHorizontal.forEach(function(component, index) {
        componentSourcesOnHorizontal[index] = [];
        component.forEach(function(nodeId) {
          if (reversedDagOnHorizontal.get(nodeId).length == 0) {
            componentSourcesOnHorizontal[index].push(nodeId);
          }
        });
      });
      
      componentsOnVertical.forEach(function(component, index) {
        componentSourcesOnVertical[index] = [];
        component.forEach(function(nodeId) {
          if (reversedDagOnVertical.get(nodeId).length == 0) {
            componentSourcesOnVertical[index].push(nodeId);
          }
        });
      });      
      
      // calculate appropriate positioning for subgraphs
      let positionMapHorizontal = findAppropriatePositionForRelativePlacement(dagOnHorizontal, "horizontal", fixedNodesOnHorizontal, dummyPositionsForVerticalAlignment, componentSourcesOnHorizontal);
      let positionMapVertical = findAppropriatePositionForRelativePlacement(dagOnVertical, "vertical", fixedNodesOnVertical, dummyPositionsForHorizontalAlignment, componentSourcesOnVertical);      

      // update positions of the nodes based on relative placement constraints
      for (let key of positionMapHorizontal.keys()) {
        if (dummyToNodeForVerticalAlignment.get(key)) {
          dummyToNodeForVerticalAlignment.get(key).forEach(function(nodeId) {
            xCoords[nodeIndexes.get(nodeId)] = positionMapHorizontal.get(key);
          });
        }
        else {
          xCoords[nodeIndexes.get(key)] = positionMapHorizontal.get(key);
        }        
      }
      for (let key of positionMapVertical.keys()) {
        if (dummyToNodeForHorizontalAlignment.get(key)) {
          dummyToNodeForHorizontalAlignment.get(key).forEach(function(nodeId) {
            yCoords[nodeIndexes.get(nodeId)] = positionMapVertical.get(key);
          });
        }
        else {
          yCoords[nodeIndexes.get(key)] = positionMapVertical.get(key);
        }        
      }      
    }    
  }  
  
  // assign new coordinates to nodes after constraint handling
  for (let i = 0; i < allNodes.length; i++) {
    let node = allNodes[i];
    if (node.getChild() == null) {
      node.setCenter(xCoords[nodeIndexes.get(node.id)], yCoords[nodeIndexes.get(node.id)]);
    }
  }  
};

module.exports = ConstraintHandler;

/***/ }),

/***/ 730:
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__730__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(10);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});