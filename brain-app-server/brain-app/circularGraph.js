var CircularGraph = /** @class */ (function () {
    function CircularGraph(id, jDiv, dataSet, svg, svgDefs, svgGroup, d3Zoom, commonData, saveObj) {
        // Circular Only data
        this.nodes = [];
        this.links = [];
        // Node
        this.isDisplayAllNode = false;
        // Bar
        this.BAR_MAX_HEIGHT = 8; // Bar-height = Rectangle width
        this.BAR_WIDTH_RATIO = 40;
        this.attributeBars = [];
        this.numBars = 0;
        this.numBarsActive = 0;
        this.circularBarColorChange = false;
        this.circularBarWidthChange = false;
        this.CIRCULAR_LINK_HILIGHT_COLOR = "#d62728";
        this.CIRCULAR_LINK_DEFAULT_COLOR = "#3498db";
        this.circularMouseDownEventListenerAdded = false;
        this.id = id;
        this.jDiv = jDiv;
        this.dataSet = dataSet;
        this.svg = svg;
        this.svgDefs = svgDefs;
        this.svgAllElements = svgGroup;
        this.d3Zoom = d3Zoom;
        this.commonData = commonData;
        this.saveObj = saveObj;
        this.circularBundleAttribute = "none";
        this.circularSortAttribute = "none";
        this.circularLabelAttribute = "label";
    }
    CircularGraph.prototype.setDataSet = function (dataSet) {
        this.dataSet = dataSet;
    };
    CircularGraph.prototype.setColaGraph = function (colaGraph) {
        this.colaGraph = colaGraph;
    };
    CircularGraph.prototype.clear = function () {
        var nodeBundle = this.svgAllElements.selectAll(".nodeCircular").data(new Array());
        var linkBundle = this.svgAllElements.selectAll(".linkCircular").data(new Array());
        var nodeDotBundle = this.svgAllElements.selectAll(".nodeDotCircular").data(new Array());
        // Loop through and clear all existing bar.
        var allBars = this.svgAllElements.selectAll(".rectCircular[barID]").data(new Array());
        allBars.exit().remove();
<<<<<<< HEAD
        this.svgAllElements.selectAll(".rectLegend").data(new Array()).exit().remove();
        this.svgAllElements.selectAll(".textLegend").data(new Array()).exit().remove();
        // Loop through and clear all existing bar.
        for (var barIndex in this.attributeBars) {
            var b = this.attributeBars[barIndex];
            var bar = this.svgAllElements.selectAll(".rect" + b.id + "Circular").data(new Array());
            bar.exit().remove();
        }
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        //for (var barIndex in this.attributeBars) {
        //    var b = this.attributeBars[barIndex];
        //    var bar = this.svgAllElements.selectAll(".rect" + b.id + "Circular").data(new Array());
        //    bar.exit().remove();
        //}
        nodeDotBundle.exit().remove();
        nodeBundle.exit().remove();
        linkBundle.exit().remove();
    };
    // Define UI components of the settings 
    CircularGraph.prototype.setupOptionMenuUI = function () {
<<<<<<< HEAD
        var _this = this;
=======
        var _this_1 = this;
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        // Remove existing html elements
        this.circularDotCSSClass = ".network-type-appended-element-" + this.id;
        this.circularCSSClass = "network-type-appended-element-" + this.id;
        $("label").remove(this.circularDotCSSClass);
        $("select").remove(this.circularDotCSSClass);
        $("button").remove(this.circularDotCSSClass);
        $("div").remove(this.circularDotCSSClass);
        // Default Setting
        this.circularEdgeColorMode = "none";
        this.circularEdgeDirectionMode = "none";
        // Function variables response to changes in settings
<<<<<<< HEAD
        var varCircularLayoutLabelOnChange = function (s) { _this.circularLayoutLabelOnChange(s); };
        var varCircularLayoutAttributeOneOnChange = function (barID, s) { _this.circularLayoutAttributeOnChange(barID, s); };
        var varCircularLayoutSortOnChange = function (s) { _this.circularLayoutSortOnChange(s); };
        var varCircularLayoutBundleOnChange = function (s) { _this.circularLayoutBundleOnChange(s); };
        var varCircularLayoutHistogramButtonOnClick = function () { _this.circularLayoutHistogramButtonOnClick(); };
        var varCircularAddMoreButtonOnClick = function () { _this.addAttributeBar(); };
        var varCircularDisplayAllNodeOnCheck = function (isChecked) {
            _this.isDisplayAllNode = isChecked;
            _this.clear();
            _this.create();
=======
        var varCircularLayoutLabelOnChange = function (s) { _this_1.circularLayoutLabelOnChange(s); };
        var varCircularLayoutAttributeOneOnChange = function (barID, s) { _this_1.circularLayoutAttributeOnChange(barID, s); };
        var varCircularLayoutSortOnChange = function (s) { _this_1.circularLayoutSortOnChange(s); };
        var varCircularLayoutBundleOnChange = function (s) { _this_1.circularLayoutBundleOnChange(s); };
        var varCircularLayoutHistogramButtonOnClick = function () { _this_1.circularLayoutHistogramButtonOnClick(); };
        var varCircularAddMoreButtonOnClick = function () { _this_1.addAttributeBar(); };
        var varCircularDisplayAllNodeOnCheck = function (isChecked) {
            _this_1.isDisplayAllNode = isChecked;
            _this_1.clear();
            _this_1.create();
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        };
        // Setting Options
        // option button
        var $button = $('<button id="button-circular-layout-histogram-' + this.id + '" class="' + this.circularCSSClass + ' btn  btn-sm btn-primary" ' +
            'data-toggle="tooltip" data-placement="right" title="Configure circular layout">Options</button>');
        if ($("#checkbox-tips").is(":checked"))
            $button.tooltip({ container: 'body', trigger: 'hover' });
        $button.css({ 'position': 'relative', 'margin-left': '5px', 'font-size': '12px', 'z-index': 500 });
        this.jDiv.find("#div-graph-controls").append($button);
        $button.click(function () { varCircularLayoutHistogramButtonOnClick(); });
        //------------------------------------------------------------------------
        // menu
        this.jDiv.append($('<div id="div-circular-layout-menu-' + this.id + '" class=' + this.circularCSSClass + '></div>')
            .css({
            'display': 'none',
            'background-color': '#feeebd',
            'position': 'absolute',
            'padding': '8px',
            'border-radius': '5px'
        }));
        //------------------------------------------------------------------------
        // menu - display all
        $('#div-circular-layout-menu-' + this.id).append($('<input type="checkbox" id="checkbox-circular-layout-display-all-' + this.id + '" class=' + this.circularCSSClass + '>')
            .css({ 'width': '20px' })
            .on("change", function () { varCircularDisplayAllNodeOnCheck($(this).is(":checked")); }));
        var $spanDisplayAll = $('<span data-toggle="tooltip" data-placement="top" '
            + 'title="Toggle exclusion of nodes that are disconnected for the current filter and edge count">Display all nodes</span>');
        $('#div-circular-layout-menu-' + this.id).append($spanDisplayAll);
        if ($("#checkbox-tips").is(":checked"))
            $spanDisplayAll.tooltip({ container: 'body', trigger: 'hover' });
        //------------------------------------------------------------------------
        // menu - bundle
        var $divBundle = $('<div id="div-circular-bundle-' + this.id + '" data-toggle="tooltip" data-placement="left" title="Group nodes by value of given attribute">Bundle </div>');
        $('#div-circular-layout-menu-' + this.id).append($divBundle);
        if ($("#checkbox-tips").is(":checked"))
            $divBundle.tooltip({ container: 'body', trigger: 'hover' });
        $divBundle.append($('<select id="select-circular-layout-bundle-' + this.id + '" class=' + this.circularCSSClass + '></select>')
            .css({ 'margin-left': '5px', 'margin-bottom': '5px', 'font-size': '12px', 'width': '80px', 'background-color': '#feeebd' })
            .on("change", function () { varCircularLayoutBundleOnChange($(this).val()); }));
        $('#select-circular-layout-bundle-' + this.id).empty();
        var option = document.createElement('option');
        option.text = 'none';
        option.value = 'none';
        $('#select-circular-layout-bundle-' + this.id).append(option);
        for (var i = 0; i < this.dataSet.attributes.columnNames.length; ++i) {
            var columnName = this.dataSet.attributes.columnNames[i];
            $('#select-circular-layout-bundle-' + this.id).append('<option value = "' + columnName + '">' + columnName + '</option>');
        }
        $('#select-circular-layout-bundle-' + this.id).val(this.circularBundleAttribute);
        //------------------------------------------------------------------------
        // menu - sort
        var $divSort = $('<div id="div-circular-sort-' + this.id + '" data-toggle="tooltip" data-placement="left" title="Sort nodes within group by attribute value">Sort </div>');
        $('#div-circular-layout-menu-' + this.id).append($divSort);
        if ($("#checkbox-tips").is(":checked"))
            $divSort.tooltip({ container: 'body', trigger: 'hover' });
        $divSort.append($('<select id="select-circular-layout-sort-' + this.id + '" class=' + this.circularCSSClass + '></select>')
            .css({ 'margin-left': '5px', 'margin-bottom': '5px', 'font-size': '12px', 'width': '80px', 'background-color': '#feeebd' })
            .on("change", function () { varCircularLayoutSortOnChange($(this).val()); }));
        $('#select-circular-layout-sort-' + this.id).empty();
        var option = document.createElement('option');
        option.text = 'none';
        option.value = 'none';
        $('#select-circular-layout-sort-' + this.id).append(option);
        for (var i = 0; i < this.dataSet.attributes.columnNames.length; ++i) {
            var columnName = this.dataSet.attributes.columnNames[i];
            $('#select-circular-layout-sort-' + this.id).append('<option value = "' + columnName + '">' + columnName + '</option>');
        }
        $('#select-circular-layout-sort-' + this.id).val(this.circularSortAttribute);
        //------------------------------------------------------------------------
        // menu - label
        var $divLabel = $('<div id="div-circular-label-' + this.id + '" data-toggle="tooltip" data-placement="left" title="Specify attribute for node label">Label </div>');
        $('#div-circular-layout-menu-' + this.id).append($divLabel);
        if ($("#checkbox-tips").is(":checked"))
            $divLabel.tooltip({ container: 'body', trigger: 'hover' });
        $divLabel.append($('<select id="select-circular-label-' + this.id + '" class=' + this.circularCSSClass + '></select>')
            .css({ 'margin-left': '5px', 'margin-bottom': '5px', 'font-size': '12px', 'width': '80px', 'background-color': '#feeebd' })
            .on("change", function () { varCircularLayoutLabelOnChange($(this).val()); }));
        $('#select-circular-label-' + this.id).empty();
        // If Label exists use it as default 
        var option;
        option = document.createElement('option');
        option.text = 'None';
        option.value = 'none';
        $('#select-circular-label-' + this.id).append(option);
        if (this.dataSet.brainLabels) {
            option = document.createElement('option');
            option.text = 'Label';
            option.value = 'label';
            $('#select-circular-label-' + this.id).append(option);
        }
        option = document.createElement('option');
        option.text = 'ID';
        option.value = 'id';
        $('#select-circular-label-' + this.id).append(option);
        for (var i = 0; i < this.dataSet.attributes.columnNames.length; ++i) {
            var columnName = this.dataSet.attributes.columnNames[i];
            $('#select-circular-label-' + this.id).append('<option value = "' + columnName + '">' + columnName + '</option>');
        }
        $('#select-circular-label-' + this.id).val(this.circularLabelAttribute);
        //------------------------------------------------------------------------
        // menu - histogram
        var $divHisto = $('<div data-toggle="tooltip" data-placement="left" title="Apply histogram bars for node attributes">Histogram</div>');
        $('#div-circular-layout-menu-' + this.id).append($divHisto);
        if ($("#checkbox-tips").is(":checked"))
            $divHisto.tooltip({ container: 'body', trigger: 'hover' });
        $('#div-circular-layout-menu-' + this.id).append($('<button id="button-circular-add-bar-' + this.id + '" class=' + this.circularCSSClass + '>Add more</button>')
            .css({ 'margin-left': '5px', 'font-size': '12px' })
            .click(function () { varCircularAddMoreButtonOnClick(); }));
        //---
        var varClass = this.circularCSSClass;
        if (this.circularMouseDownEventListenerAdded == false) {
            this.circularMouseDownEventListenerAdded = true;
            document.addEventListener('mouseup', function (event) {
<<<<<<< HEAD
                var menu = document.getElementById("div-circular-layout-menu-" + _this.id);
                if ((!$(event.target).hasClass(varClass))
                    && !$.contains(menu, (event.target))
                    && !_this.circularBarColorChange) {
                    $('#div-circular-layout-menu-' + _this.id).hide();
                }
                _this.circularBarColorChange = false;
=======
                var menu = document.getElementById("div-circular-layout-menu-" + _this_1.id);
                if ((!$(event.target).hasClass(varClass))
                    && !$.contains(menu, (event.target))
                    && !_this_1.circularBarColorChange) {
                    $('#div-circular-layout-menu-' + _this_1.id).hide();
                }
                _this_1.circularBarColorChange = false;
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
            }, false);
        }
        // Help modal
        $('#div-circular-layout-menu-' + this.id).append('<a href="#" style="display: block; text-align: right"><span class="badge" data-toggle="modal" data-target="#modal-help-circular">?</span></a>');
    };
    CircularGraph.prototype.toggleDirectionArrow = function (isShown) {
        if (isShown) {
            this.svgAllElements.selectAll(".linkCircular")
                .style("marker-mid", "url(#arrowhead-circular)");
        }
        else {
            this.svgAllElements.selectAll(".linkCircular")
                .style("marker-mid", "none");
        }
    };
    CircularGraph.prototype.create = function () {
        if (!this.colaGraph) {
            console.log("ERROR: colaGraph is NULL");
            return;
        }
        this.checkIfAttributesMatchOptionMenu();
        // Get all values
        var attrLabel = $('#select-circular-label-' + this.id).val();
        var attrBundle = $('#select-circular-layout-bundle-' + this.id).val();
        var attrSort = $('#select-circular-layout-sort-' + this.id).val();
        this.generateCircularData(attrBundle);
        this.createCircularGraph(attrSort, attrBundle);
        this.circularLayoutLabelOnChange(attrLabel);
        this.updateAllAttributeBars();
    };
    CircularGraph.prototype.update = function () {
        if (!this.colaGraph || !this.svgNodeBundleArray) {
            return;
        }
        var attrSort = $('#select-circular-layout-sort-' + this.id).val();
        var attrBundle = $('#select-circular-layout-bundle-' + this.id).val();
        var attributes = this.dataSet.attributes;
        var edgeSettings = this.saveObj.edgeSettings;
        var nodeSettings = this.saveObj.nodeSettings;
        //------------------------------------------------------------------------------------------------
        // Update Nodes and edges data
        // update color of the nodes
        for (var nodeIndex in this.svgNodeBundleArray) {
            var node = this.svgNodeBundleArray[nodeIndex];
            node.color = this.colaGraph.nodeMeshes[node.id].material.color.getHexString();
        }
        // update edges data
        if (this.circularEdgeColorMode !== "node") {
            for (var i = 0; i < this.colaGraph.edgeList.length; i++) {
                var edge = this.colaGraph.edgeList[i];
                // If edge is visible
                if (edge.visible) {
                    // for every node in the array
                    for (var j = 0; j < this.svgNodeBundleArray.length; j++) {
                        if (this.edgeColorConfig && this.edgeColorConfig.useTransitionColor && (edge.uniforms.startColor !== edge.uniforms.endColor)) {
                            this.svgNodeBundleArray[j].linkColors[edge.targetNode.userData.id] = this.edgeColorConfig.useTransitionColor;
                            this.svgNodeBundleArray[j].linkColors[edge.sourceNode.userData.id] = this.edgeColorConfig.useTransitionColor;
                        }
                        else {
                            // If this node is the source of the link
                            if (this.svgNodeBundleArray[j].id == edge.sourceNode.userData.id) {
                                this.svgNodeBundleArray[j].linkColors[edge.targetNode.userData.id] = edge.color;
                            }
                            // If this node is the Target of the link
                            if (this.svgNodeBundleArray[j].id == edge.targetNode.userData.id) {
                                this.svgNodeBundleArray[j].linkColors[edge.sourceNode.userData.id] = edge.color;
                            }
                        }
                    }
                }
            }
        }
        //------------------------------------------------------------------------------------------------
        // Generate updated data
        var nodeJson = JSON.parse(JSON.stringify(this.svgNodeBundleArray)); // Is this really happening?
        var bundle = d3.layout.bundle();
        var diameter = 800, radius = diameter / 2, innerRadius = radius - 120;
        // Node pie chart
        var pie = d3.layout.pie();
        var dot = d3.svg.arc()
            .innerRadius(0)
            .outerRadius(5);
        var cluster;
        cluster = d3.layout.cluster()
            .size([360, innerRadius])
            .sort(null)
            .value(function (d) { return d.size; });
        var tree = packages.root(nodeJson);
        // Tree may have a false root. Remove it.
        if (tree.children.length === 1)
            tree = tree.children[0];
        var groups = tree.children;
        if (attrSort !== "none") {
            if (attrBundle !== "none") {
                for (var i = 0; i < groups.length; i++) {
                    groups[i].children.sort(function (a, b) {
                        return a[attrSort][0] - b[attrSort][0];
                    });
                }
            }
            else {
                for (var i = 0; i < groups.length; i++) {
                    groups.sort(function (a, b) {
                        return a[attrSort][0] - b[attrSort][0];
                    });
                }
            }
        }
        if (attrBundle !== "none") {
            groups.sort(function (a, b) { return a.children[0].bundleSort[attrBundle] - b.children[0].bundleSort[attrBundle]; });
        }
        this.nodes = cluster.nodes(tree);
        if (attrBundle !== "none") {
            // Offset nodes bundled by multivalue attributes into concentric rings
            var offset = radius / 16;
            var i_1 = this.nodes.length;
            while (i_1--) {
                var n = this.nodes[i_1];
                if (!n.bundleHeight)
                    continue;
                n.y -= offset * n.bundleHeight[attrBundle];
            }
        }
        this.links = packages.imports(this.nodes);
        //-------------------------------------------------------------------------------------------
        // update UI
        var links = this.links;
        var edgeColorMode = this.circularEdgeColorMode;
        var edgeColorConfig = this.edgeColorConfig;
        var edgeDirectionMode = this.circularEdgeDirectionMode;
        var varSvg = this.svg[0];
        var varNS = varSvg[0].namespaceURI;
        var varDefs = this.svgDefs;
        // use normal color updating style
        var bundledLinks = bundle(links);
        if (bundledLinks.length > 0) {
            this.svgAllElements.selectAll(".linkCircular")
                .data(function () {
                if (bundledLinks[0][0].bundleByAttribute == "none") {
                    for (var i = 0; i < bundledLinks.length; i++) {
                        bundledLinks[i][1].y = 70;
                    }
                }
                return bundledLinks;
            })
                .each(function (d) { d.source = d[0], d.target = d[d.length - 1]; })
                .style("stroke-opacity", 1);
        }
        this.svgAllElements.selectAll(".linkCircular")
            .style("stroke", function (l) {
            var id = 'gradient_' + l.source.id + '_' + l.target.id;
            var sourceOpacity = 1, targetOpacity = 1;
            if (edgeDirectionMode !== "opacity" && edgeDirectionMode !== "gradient" && edgeColorMode != "node") {
                return l.color = l.source.linkColors[l.target.id];
            }
            else if (l.source.color === l.target.color && edgeDirectionMode !== "opacity" && edgeDirectionMode !== "gradient" && edgeColorMode === "node") {
                return l.color = "#" + l.source.color;
            }
            if (edgeDirectionMode === "gradient") {
                var sourceColor = (String)(edgeSettings.directionStartColor);
                var targetColor = (String)(edgeSettings.directionEndColor);
            }
            else if (edgeColorMode === "node") {
                var sourceColor;
                var targetColor;
                if (edgeColorConfig && edgeColorConfig.useTransitionColor && (l.source.color !== l.target.color)) {
                    sourceColor = String(edgeColorConfig.edgeTransitionColor);
                    targetColor = String(edgeColorConfig.edgeTransitionColor);
                }
                else {
                    sourceColor = String(l.source.color);
                    targetColor = String(l.target.color);
                }
            }
            else {
                var sourceColor = String(l.source.linkColors[l.target.id]);
                var targetColor = String(l.source.linkColors[l.target.id]);
            }
            if (edgeDirectionMode === "opacity") {
                sourceOpacity = 0;
                targetOpacity = 1;
            }
            var sourceColorRGBA = CommonUtilities.hexToRgb(sourceColor, sourceOpacity).toString();
            var targetColorRGBA = CommonUtilities.hexToRgb(targetColor, targetOpacity).toString();
            var stops = [
                { offset: '0%', 'stop-color': sourceColorRGBA },
                { offset: '100%', 'stop-color': targetColorRGBA }
            ];
            // Calculate Gradient Direction
            var start = this.getPointAtLength(0);
            var end = this.getPointAtLength(this.getTotalLength());
            var box = this.getBBox();
            var x1 = ((start.x - box.x) / box.width) * 100 + "%";
            var x2 = ((end.x - box.x) / box.width) * 100 + "%";
            var y1 = ((start.y - box.y) / box.height) * 100 + "%";
            var y2 = ((end.y - box.y) / box.height) * 100 + "%";
            if ($("#" + id)[0])
                $("#" + id)[0]["remove"]();
            var grad = document.createElementNS(varNS, 'linearGradient');
            grad.setAttribute('id', id);
            grad.setAttribute('x1', x1);
            grad.setAttribute('x2', x2);
            grad.setAttribute('y1', y1);
            grad.setAttribute('y2', y2);
            for (var i = 0; i < stops.length; i++) {
                var attrs = stops[i];
                var stop = document.createElementNS(varNS, 'stop');
                for (var attr in attrs) {
                    if (attrs.hasOwnProperty(attr))
                        stop.setAttribute(attr, attrs[attr]);
                }
                grad.appendChild(stop);
            }
            varDefs.appendChild(grad);
            var gID = 'url(#' + id + ')';
            l['gradientID'] = gID;
            l.color = gID;
            return l.color;
        });
        this.toggleDirectionArrow(edgeDirectionMode === "arrow");
        // Add Nodes' id to Circular Graph
        this.svgAllElements.selectAll(".nodeCircular")
            .data(this.nodes.filter(function (n) { return !n.children; }));
        // Add Nodes' id to Circular Graph
        this.svgAllElements.selectAll(".nodeDotCircular")
            .data(this.nodes.filter(function (n) { return !n.children; }))
            .each(function (chartData, i) {
            //TODO: Color conversion is already done elsewhere. Pass it to the graph so it doesn't need to be repeated for every node
            var colorAttr = nodeSettings.nodeColorAttribute;
            var attrArray = attributes.get(colorAttr);
            var group = d3.select(this);
            group.selectAll("path").remove();
            if (!attributes.info[colorAttr]) {
                group.selectAll(".path")
                    .data(pie([1]))
                    .enter().append('path')
                    .attr("fill", function (d, i) { return "#d3d3d3"; })
                    .attr("d", dot);
                return;
            }
            if (nodeSettings.nodeColorMode === "discrete") {
                var distincts = attributes.info[colorAttr].distinctValues;
                var colorMap = d3.scale.ordinal().domain(distincts).range(nodeSettings.nodeColorDiscrete);
            }
            else {
                var columnIndex = attributes.columnNames.indexOf(colorAttr);
                var min = attributes.getMin(columnIndex);
                var max = attributes.getMax(columnIndex);
                var minColor = nodeSettings.nodeColorContinuousMin;
                var maxColor = nodeSettings.nodeColorContinuousMax;
                var colorMap = d3.scale.linear().domain([min, max]).range([minColor, maxColor]);
            }
            if (attributes.info[colorAttr].numElements === 1) {
                var color = chartData[colorAttr].map(function (val) {
                    return colorMap(val).replace("0x", "#");
                });
            }
            else {
                var color = chartData[colorAttr].map(function (val, i) {
                    return colorMap(i).replace("0x", "#");
                });
            }
            group.selectAll(".path")
                .data(function () {
                var tmp = chartData[colorAttr].map(function (val) { return val; });
                if (tmp.length === 1 && tmp[0] === 0) {
                    return pie([1]);
                }
                else {
                    return pie(tmp);
                }
            }).enter().append('path')
                .attr("fill", function (d, i) { return color[i]; })
                .style("stroke-width", 0)
                .attr("d", dot);
        });
        this.attributeBars.forEach(function (bar) {
            this.svgAllElements.selectAll('.rectCircular[barID="' + bar.id + '"]')
                .data(this.nodes.filter(function (n) { return !n.children; }));
        }, this);
<<<<<<< HEAD
        this.updateAllAttributeBars();
        this.createHistogramBars();
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
    };
    /**
     * Checks, if the select-option items (e.g. bundle) in the
     * graph options menu still match the given dataSet.
     * If not, recreate it to avoid later issues when
     * items are still in the menu but not in the dataSet
     */
    CircularGraph.prototype.checkIfAttributesMatchOptionMenu = function () {
        var menuSelectoptions = $('#select-circular-layout-bundle-' + this.id).children();
        var dataColumnNames = this.dataSet.attributes.columnNames;
        // substract the 'none' option, which is not in the dataSet
        if (menuSelectoptions.length - 1 != dataColumnNames.length) {
            this.setupOptionMenuUI();
            return;
        }
        // do bidirectional comparison
        // we expect no double entries, or this won't work
        var map = {};
        for (var _i = 0, menuSelectoptions_1 = menuSelectoptions; _i < menuSelectoptions_1.length; _i++) {
            var option = menuSelectoptions_1[_i];
            map[option.getAttribute('value')] = '';
        }
        delete map['none'];
        for (var _a = 0, dataColumnNames_1 = dataColumnNames; _a < dataColumnNames_1.length; _a++) {
            var column = dataColumnNames_1[_a];
            if (map[column] == undefined) {
                this.setupOptionMenuUI();
                break;
            }
        }
    };
    // Generate data array for the graph 
    CircularGraph.prototype.generateCircularData = function (bundleByAttribute) {
        if (!this.colaGraph) {
            console.log("ERROR: colaGraph is NULL");
            return;
        }
        this.svgNodeBundleArray = [];
        var children = this.colaGraph.nodeMeshes; // TODO: Need to be replaced with other objects!!
        var attributes = this.dataSet.attributes;
        var brainLabels = this.dataSet.brainLabels;
        // Loop through all nodes of the Cola Graph
        for (var i = 0; i < children.length; i++) {
            var d = children[i].userData;
            if (!this.isDisplayAllNode && !d.hasVisibleEdges)
                continue;
            // Create new empty node
            var nodeObject = new Object();
            nodeObject["id"] = d.id;
            if (brainLabels) {
                nodeObject["label"] = brainLabels[d.id];
            }
            nodeObject["bundleSort"] = {};
            nodeObject["bundleHeight"] = {};
            var _loop_1 = function () {
                colname = attributes.columnNames[j];
                value = attributes.get(colname)[d.id];
                nodeObject[colname] = value;
                // add a special property for module id
                if (colname == 'module_id') {
                    nodeObject['moduleID'] = attributes.get(colname)[d.id];
                }
                //  Get domain of the attributes (assume all positive numbers in the array)
                columnIndex = attributes.columnNames.indexOf(colname);
                min = attributes.getMin(columnIndex);
                max = attributes.getMax(columnIndex);
                // Scale value to between 0.05 to 1 
                attrMap = d3.scale.linear().domain([min, max]).range([0.05, 1]);
                scalevalue = attrMap(Math.max.apply(Math, value));
                nodeObject['scale_' + colname] = scalevalue;
                //TODO: this grouping algorithm could be used in all other graph types
                if (attributes.info[colname].isDiscrete) { // if the attribute is discrete
                    // If the attribute is discrete then grouping is clear for simple values, but for multivalue attributes we get the position of the largest value
                    // value can be null due to data mismatch
                    if (value != null) {
                        if (value.length > 1) {
                            //Using heaviest position:
                            //nodeObject['bundle_group_' + colname] = value.indexOf(Math.max(...value));
                            // Using base-max numeration (e.g. if max is 7, use octal encoding):
                            var groupValue = 0;
                            var i_2 = value.length;
                            while (i_2--) {
                                groupValue += (value[i_2] * Math.pow(max + 1, i_2));
                            }
                            // Add a bundle sorting value using sum of weighted vectors from module positions on circle
                            var rev_1 = 2 * Math.PI;
                            var sortValuePos = value.reduce(function (sum, d, i) {
                                var theta = rev_1 * i / value.length;
                                return {
                                    x: sum.x + Math.sin(theta) * d,
                                    y: sum.y + Math.cos(theta) * d
                                };
                            }, { x: 0, y: 0 });
                            var sortValue = Math.atan2(sortValuePos.x, sortValuePos.y);
                            // Map sortValue from -PI..PI to integers in range 0..attributes.numRecords
                            sortValue = Math.floor((sortValue < 0 ? sortValue + rev_1 : sortValue) / rev_1 * attributes.numRecords);
                            nodeObject['bundle_group_' + colname] = groupValue;
                            nodeObject['bundleSort'][colname] = sortValue;
                            // Concentric offset is just the number of significant values
                            nodeObject['bundleHeight'][colname] = value.reduce(function (acc, d) { return d > 0 ? acc + 1 : acc; }, 0);
                        }
                        else {
                            nodeObject['bundle_group_' + colname] = value[0];
                            nodeObject['bundleSort'][colname] = value[0];
                            nodeObject['bundleHeight'][colname] = 1;
                        }
                    }
                }
                else { // if the attribute is continuous
                    // Scale to group attributes 
                    bundleGroupMap = d3.scale.linear().domain([min, max]).range([0, 9.99]); // use 9.99 instead of 10 to avoid a group of a single element (that has the max attribute value)
                    bundleGroup = bundleGroupMap(Math.max.apply(Math, value)); // group
                    bundleGroup = Math.floor(bundleGroup);
                    nodeObject['bundle_group_' + colname] = bundleGroup;
                    nodeObject['bundleSort'][colname] = bundleGroup;
                    nodeObject['bundleHeight'][colname] = 1;
                }
            };
            var colname, value, columnIndex, min, max, attrMap, scalevalue, bundleGroupMap, bundleGroup;
            // for every attributes
            for (var j = 0; j < attributes.columnNames.length; j++) {
                _loop_1();
            }
            nodeObject["bundleByAttribute"] = bundleByAttribute;
            if (bundleByAttribute == "none") {
                nodeObject["name"] = "root." + d.id;
            }
            else {
                nodeObject["name"] = "root." + bundleByAttribute + nodeObject['bundle_group_' + bundleByAttribute] + "." + d.id;
            }
            nodeObject["color"] = this.colaGraph.nodeMeshes[d.id].material.color.getHexString();
            // Declare variables 
            nodeObject["imports"] = [];
            nodeObject["linkColors"] = [];
            nodeObject["barWidths"] = []; // used to calculate the position of the label for each bar
            this.svgNodeBundleArray.push(nodeObject);
        }
        // sort Node objects according the bundled attribute values
        if (bundleByAttribute !== "none") {
            this.svgNodeBundleArray.sort(function (a, b) {
                return Math.max(a[bundleByAttribute][0]) - Math.max(b[bundleByAttribute][0]);
            });
        }
        // loop through all edges of the Cola Graph
        for (var i = 0; i < this.colaGraph.edgeList.length; i++) {
            var edge = this.colaGraph.edgeList[i];
            // If edge is visible
            if (edge.visible) {
                // for every node in the array
                for (var j = 0; j < this.svgNodeBundleArray.length; j++) {
                    // If this node is the source of the link
                    if (this.svgNodeBundleArray[j].id == edge.sourceNode.userData.id) {
                        var moduleID = -1;
                        var bundleGroupID = -1;
                        // for every node in the array again (to find the target node of this link)
                        for (var k = 0; k < this.svgNodeBundleArray.length; k++) {
                            if (this.svgNodeBundleArray[k].id == edge.targetNode.userData.id) {
                                if (bundleByAttribute == "none") {
                                    moduleID = this.svgNodeBundleArray[k].moduleID;
                                    var nodeName = "root." + edge.targetNode.userData.id;
                                }
                                else {
                                    bundleGroupID = this.svgNodeBundleArray[k]['bundle_group_' + bundleByAttribute];
                                    var nodeName = "root." + bundleByAttribute + bundleGroupID + "." + edge.targetNode.userData.id;
                                }
                                this.svgNodeBundleArray[j].imports.push(nodeName); // add target nodes to this node
                                this.svgNodeBundleArray[j].linkColors[edge.targetNode.userData.id] = edge.color;
                                break;
                            }
                        }
                    }
                }
            }
        }
    };
    CircularGraph.prototype.createCircularGraph = function (sortByAttribute, bundleByAttribute) {
<<<<<<< HEAD
        var _this = this;
=======
        var _this_1 = this;
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        // Based on http://bl.ocks.org/mbostock/1044242
        if (this.svgNodeBundleArray.length == 0)
            return;
        var attributes = this.dataSet.attributes;
        var edgeSettings = this.saveObj.edgeSettings;
        var nodeSettings = this.saveObj.nodeSettings;
        var nodeJson = JSON.parse(JSON.stringify(this.svgNodeBundleArray));
        var width = 250 + this.jDiv.width() / 2;
        var height = (this.jDiv.height() - sliderSpace) / 2;
        var diameter = 800, radius = diameter / 2, innerRadius = radius - 120;
        var cluster = d3.layout.cluster()
            .size([360, innerRadius])
            .sort(null) // Using built-in D3 sort destroy the order of the cluster => need to be investigated
            .value(function (d) { return d.size; });
        var bundle = d3.layout.bundle();
        // Node pie chart
        var pie = d3.layout.pie();
        var dot = d3.svg.arc()
            .innerRadius(0)
            .outerRadius(5);
        // Link path
        var line = d3.svg.line.radial()
            .interpolate("bundle")
            .tension(.8)
            .radius(function (d) {
            return d.y;
        })
            .angle(function (d) { return d.x / 180 * Math.PI; });
        this.svgAllElements.attr("transform", "translate(" + width + "," + height + ")");
        // Only set if not already moved
        // If user moved the circular graph to another position and zoom level, keep it when reloading
<<<<<<< HEAD
        var translation = this.d3Zoom.translate();
        if (translation[0] == 0 && translation[1] == 0) {
            this.d3Zoom.scale(1);
            this.d3Zoom.translate([width, height]);
        }
        translation = this.d3Zoom.translate();
        // force the transform onto svgAllElements
        this.svgAllElements.attr("transform", "translate(" + translation[0] + "," + translation[1] + ")scale(" + this.d3Zoom.scale() + ")");
        // An alternative solutions to sorting the children while keeping
        // the order of the clusters
=======
        if (this.d3Zoom.translate().reduce(function (a, b) { return a + b; }) == 0) {
            this.d3Zoom.scale(1);
            this.d3Zoom.translate([width, height]);
        }
        // An alternative solutions to sorting the children while keeping
        // the order of the clusters
        //console.log(nodeJson);
        //console.log(packages);
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        var tree = packages.root(nodeJson);
        //console.log(tree);
        // Tree may have a false root. Remove it.
        if (tree.children.length === 1)
            tree = tree.children[0];
        var groups = tree.children;
        if (sortByAttribute !== "none") {
            // If  bundle is none, the children are not put into groups
            if (bundleByAttribute !== "none") {
                for (var i = 0; i < groups.length; i++) {
                    groups[i].children.sort(function (a, b) {
                        return Math.max(a[sortByAttribute][0]) - Math.max(b[sortByAttribute][0]);
                    });
                }
            }
            else {
                for (var i = 0; i < groups.length; i++) {
                    groups.sort(function (a, b) {
                        return Math.max(a[sortByAttribute][0]) - Math.max(b[sortByAttribute][0]);
                    });
                }
            }
        }
        if (bundleByAttribute !== "none") {
            groups.sort(function (a, b) { return a.children[0].bundleSort[bundleByAttribute] - b.children[0].bundleSort[bundleByAttribute]; });
        }
        this.nodes = cluster.nodes(tree);
        if (bundleByAttribute !== "none") {
            // Offset nodes bundled by multivalue attributes into concentric rings
            var offset = radius / 16;
            var i_3 = this.nodes.length;
            while (i_3--) {
                var n = this.nodes[i_3];
                if (!n.bundleHeight)
                    continue;
                n.y -= offset * n.bundleHeight[bundleByAttribute];
            }
        }
        this.links = packages.imports(this.nodes);
<<<<<<< HEAD
        var varMouseOveredSetNodeID = function (id) { _this.mouseOveredSetNodeID(id); };
        var varMouseOutedSetNodeID = function () { _this.mouseOutedSetNodeID(); };
        var varMouseOveredCircularLayout = function (d) { _this.mouseOveredCircularLayout(d); };
        var varMouseOutedCircularLayout = function (d) { _this.mouseOutedCircularLayout(d); };
=======
        var varMouseOveredSetNodeID = function (id) { _this_1.mouseOveredSetNodeID(id); };
        var varMouseOutedSetNodeID = function () { _this_1.mouseOutedSetNodeID(); };
        var varMouseOveredCircularLayout = function (d) { _this_1.mouseOveredCircularLayout(d); };
        var varMouseOutedCircularLayout = function (d) { _this_1.mouseOutedCircularLayout(d); };
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        ////////////////////////////////////////////////////////////////////////////
        ///////////// Adding Elements to SVG to create Cicular Graph ///////////////
        ////////////////////////////////////////////////////////////////////////////
        // Add Links to Circular Graph
        var links = this.links;
        var edgeColorMode = this.circularEdgeColorMode;
        var edgeColorConfig = this.edgeColorConfig;
        var edgeDirectionMode = this.circularEdgeDirectionMode;
        var varSvg = this.svg[0];
        var varNS = varSvg[0].namespaceURI;
        var varDefs = this.svgDefs;
        var bundledLinks = bundle(links);
        //console.log(bundledLinks);
        //console.log(this.svgAllElements.selectAll(".linkCircular"));
        if (bundledLinks.length > 0) {
            this.svgAllElements.selectAll(".linkCircular")
                .data(function () {
                if (bundledLinks[0][0].bundleByAttribute == "none") {
                    for (var i = 0; i < bundledLinks.length; i++) {
                        bundledLinks[i][1].y = 70;
                    }
                }
                return bundledLinks;
            })
                .enter()
                .append("path") // Appending Element
                .each(function (d) { d.source = d[0], d.target = d[d.length - 1]; })
                .attr("class", "linkCircular")
                .attr("d", function (d) {
                return line(d);
            })
                .style("stroke-opacity", 1)
                .style("stroke", function (l) {
                var id = 'gradient_' + l.source.id + '_' + l.target.id;
                var sourceOpacity = 1, targetOpacity = 1;
                if (edgeDirectionMode !== "opacity" && edgeDirectionMode !== "gradient" && edgeColorMode != "node") {
                    return l.color = l.source.linkColors[l.target.id];
                }
                else if (l.source.color === l.target.color && edgeDirectionMode !== "opacity" && edgeDirectionMode !== "gradient" && edgeColorMode === "node") {
                    return l.color = "#" + l.source.color;
                }
                if (edgeDirectionMode === "gradient") {
                    var sourceColor = (String)(edgeSettings.directionStartColor);
                    var targetColor = (String)(edgeSettings.directionEndColor);
                }
                else if (edgeColorMode === "node") {
                    var sourceColor;
                    var targetColor;
                    if (edgeColorConfig && edgeColorConfig.useTransitionColor && (l.source.color !== l.target.color)) {
                        sourceColor = String(edgeColorConfig.edgeTransitionColor);
                        targetColor = String(edgeColorConfig.edgeTransitionColor);
                    }
                    else {
                        sourceColor = String(l.source.color);
                        targetColor = String(l.target.color);
                    }
                }
                else {
                    var sourceColor = String(l.source.linkColors[l.target.id]);
                    var targetColor = String(l.source.linkColors[l.target.id]);
                }
                if (edgeDirectionMode === "opacity") {
                    sourceOpacity = 0;
                    targetOpacity = 1;
                }
                var sourceColorRGBA = CommonUtilities.hexToRgb(sourceColor, sourceOpacity).toString();
                var targetColorRGBA = CommonUtilities.hexToRgb(targetColor, targetOpacity).toString();
                var stops = [
                    { offset: '0%', 'stop-color': sourceColorRGBA },
                    { offset: '100%', 'stop-color': targetColorRGBA }
                ];
                // Calculate Gradient Direction
                var start = this.getPointAtLength(0);
                var end = this.getPointAtLength(this.getTotalLength());
                var box = this.getBBox();
                var x1 = ((start.x - box.x) / box.width) * 100 + "%";
                var x2 = ((end.x - box.x) / box.width) * 100 + "%";
                var y1 = ((start.y - box.y) / box.height) * 100 + "%";
                var y2 = ((end.y - box.y) / box.height) * 100 + "%";
                if ($("#" + id)[0])
                    $("#" + id)[0]["remove"]();
                var grad = document.createElementNS(varNS, 'linearGradient');
                grad.setAttribute('id', id);
                grad.setAttribute('x1', x1);
                grad.setAttribute('x2', x2);
                grad.setAttribute('y1', y1);
                grad.setAttribute('y2', y2);
                for (var i = 0; i < stops.length; i++) {
                    var attrs = stops[i];
                    var stop = document.createElementNS(varNS, 'stop');
                    for (var attr in attrs) {
                        if (attrs.hasOwnProperty(attr))
                            stop.setAttribute(attr, attrs[attr]);
                    }
                    grad.appendChild(stop);
                }
                varDefs.appendChild(grad);
                var gID = 'url(#' + id + ')';
                l['gradientID'] = gID;
                l.color = gID;
                return l.color;
            });
        }
        // Add Nodes' id to Circular Graph
        this.svgAllElements.selectAll(".nodeCircular")
            .data(this.nodes.filter(function (n) {
            return !n.children;
        }))
            .enter()
            .append("text") // Appending Element
            .attr("class", "nodeCircular")
            .attr("dy", ".31em")
            .attr("transform", function (d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 16) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
            .style("text-anchor", function (d) { return d.x < 180 ? "start" : "end"; })
            .text(function (d) { return d.key; })
            .on("mouseover", function (d) { varMouseOveredCircularLayout(d); varMouseOveredSetNodeID(d.id); })
            .on("mouseout", function (d) { varMouseOutedCircularLayout(d); varMouseOutedSetNodeID(); });
        //console.log(this.svgAllElements.selectAll(".nodeCircular"));
        // Add Nodes' id to Circular Graph
        this.svgAllElements.selectAll(".nodeDotCircular")
            .data(this.nodes.filter(function (n) { return !n.children; }))
            .enter()
            .append("g") // Appending Element
            .attr("class", "nodeDotCircular")
            .attr("transform", function (d) {
            return "rotate(" + (d.x - 90) + ")translate(" + (d.y) + ",0)" + (d.x < 180 ? "" : "rotate(180)");
        })
            .on("mouseover", function (d) { varMouseOveredCircularLayout(d); varMouseOveredSetNodeID(d.id); })
            .on("mouseout", function (d) { varMouseOutedCircularLayout(d); varMouseOutedSetNodeID(); })
            .each(function (chartData, i) {
            var colorAttr = nodeSettings.nodeColorAttribute;
            var attrArray = attributes.get(colorAttr);
            var group = d3.select(this);
            group.selectAll("path").remove();
            if (!attributes.info[colorAttr]) {
                group.selectAll(".path")
                    .data(pie([1]))
                    .enter().append('path')
                    .attr("fill", function (d, i) { return "#d3d3d3"; })
                    .attr("d", dot);
                return;
            }
            else {
                if (nodeSettings.nodeColorMode === "discrete") {
                    var distincts = attributes.info[colorAttr].distinctValues;
                    var colorMap = d3.scale.ordinal().domain(distincts).range(nodeSettings.nodeColorDiscrete);
                }
                else {
                    var columnIndex = attributes.columnNames.indexOf(colorAttr);
                    var min = attributes.getMin(columnIndex);
                    var max = attributes.getMax(columnIndex);
                    var minColor = nodeSettings.nodeColorContinuousMin;
                    var maxColor = nodeSettings.nodeColorContinuousMax;
                    var colorMap = d3.scale.linear().domain([min, max]).range([minColor, maxColor]);
                }
                if (attributes.info[colorAttr].numElements === 1) {
                    var color = chartData[colorAttr].map(function (val) {
                        return colorMap(val).replace("0x", "#");
                    });
                }
                else {
                    var color = chartData[colorAttr].map(function (val, i) {
                        return colorMap(i).replace("0x", "#");
                    });
                }
                group.selectAll(".path")
                    .data(function () {
                    var tmp = chartData[colorAttr].map(function (val) { return val; });
                    if (tmp.length === 1 && tmp[0] === 0) {
                        return pie([1]);
                    }
                    else {
                        return pie(tmp);
                    }
                })
                    .enter().append('path')
                    .attr("fill", function (d, i) {
                    return color[i];
                })
                    .style("stroke-width", 0)
                    .attr("d", dot);
            }
        });
        this.attributeBars.forEach(function (bar) {
<<<<<<< HEAD
            console.log(bar);
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
            this.svgAllElements.selectAll(".rectCircular[barID='" + bar.id + "']")
                .data(this.nodes.filter(function (n) { return !n.children; }))
                .enter()
                .append("rect")
                .attr("class", "rectCircular")
                .attr("barID", bar.id)
                .on("mouseover", function (d) { varMouseOveredCircularLayout(d); varMouseOveredSetNodeID(d.id); })
                .on("mouseout", function (d) { varMouseOutedCircularLayout(d); varMouseOutedSetNodeID(); });
        }, this);
<<<<<<< HEAD
        this.createHistogramBars();
        d3.select(window.frameElement).style("height", diameter + "px");
    };
    CircularGraph.prototype.createHistogramBars = function () {
        this.svgAllElements.selectAll(".rectLegend").data(new Array()).exit().remove();
        this.svgAllElements.selectAll(".textLegend").data(new Array()).exit().remove();
        var legendHeight = 25;
        var count = 0;
        //console.log(this.attributeBars);
        //this.svgAllElements.selectAll(".textLegend")
        //    .data(this.attributeBars)
        //    .enter()
        //    .append("text")
        //    .attr("class", 'textLegend')
        //    .attr("x", 400)
        //    .attr("y", count * legendHeight)
        //    .text("Hello");
        this.attributeBars.forEach(function (bar) {
            if (bar.attribute !== 'none') {
                this.svgAllElements.selectAll(".rectLegend[barID='" + bar.id + "']")
                    .data([bar])
                    .enter()
                    .append("rect")
                    .attr("class", 'rectLegend')
                    .attr("x", 400)
                    .attr("barID", function (d) { return d.id; })
                    .attr("y", count * legendHeight)
                    .attr("width", legendHeight)
                    .attr("height", legendHeight)
                    .style("fill", function (d) { return d.color; });
                this.svgAllElements.selectAll(".textLegend[barID='" + bar.id + "']")
                    .data([bar])
                    .enter()
                    .append("text")
                    .attr("class", 'textLegend')
                    .attr("x", 400)
                    .attr("dx", legendHeight * 5 / 4)
                    .attr("barID", function (d) { return d.id; })
                    .attr("y", legendHeight / 2 + count * legendHeight + 5)
                    .text(function (d) { return d.attribute; });
                count++;
            }
        }, this);
    };
    CircularGraph.prototype.addAttributeBar = function () {
        var _this = this;
        var varMouseOveredSetNodeID = function (id) { _this.mouseOveredSetNodeID(id); };
        var varMouseOutedSetNodeID = function () { _this.mouseOutedSetNodeID(); };
        var varMouseOveredCircularLayout = function (d) { _this.mouseOveredCircularLayout(d); };
        var varMouseOutedCircularLayout = function (d) { _this.mouseOutedCircularLayout(d); };
=======
        d3.select(window.frameElement).style("height", diameter + "px");
    };
    CircularGraph.prototype.addAttributeBar = function () {
        var _this_1 = this;
        var varMouseOveredSetNodeID = function (id) { _this_1.mouseOveredSetNodeID(id); };
        var varMouseOutedSetNodeID = function () { _this_1.mouseOutedSetNodeID(); };
        var varMouseOveredCircularLayout = function (d) { _this_1.mouseOveredCircularLayout(d); };
        var varMouseOutedCircularLayout = function (d) { _this_1.mouseOutedCircularLayout(d); };
        var varCircularLayoutAttributeOnChange = function (barID, val) { _this_1.circularLayoutAttributeOnChange(barID, val); };
        var varUpdateCircularBarColor = function (barID, color) { _this_1.updateCircularBarColor(barID, color); };
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        var id = this.attributeBars.length;
        var bar = {
            id: id,
            color: "#bdc3c7", // default color
            attribute: "none", // default attribute
            isGradientOn: false
        };
        this.attributeBars.push(bar);
        this.numBars += 1;
        //console.log(bar);
        // Add New Bar to Circular Graph
        this.svgAllElements.selectAll(".rectCircular[barID='" + bar.id + "']")
            .data(this.nodes.filter(function (n) {
            return !n.children;
        }))
            .enter().append("rect")
            .attr("class", "rectCircular")
            .attr("barID", bar.id)
            .on("mouseover", function (d) { varMouseOveredCircularLayout(d); varMouseOveredSetNodeID(d.id); })
            .on("mouseout", function (d) { varMouseOutedCircularLayout(d); varMouseOutedSetNodeID(); });
<<<<<<< HEAD
        // need to clear the bars and create them again
        this.createHistogramBars();
        this.addAttributeBarElements(bar);
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        // Rearange the menu layout
        //var l = $('#button-circular-layout-histogram-' + this.id).position().left + 5;
        //var t = $('#button-circular-layout-histogram-' + this.id).position().top - $('#div-circular-layout-menu-' + this.id).height() - 15;
        //$('#div-circular-layout-menu-' + this.id).zIndex(1000);
        //$('#div-circular-layout-menu-' + this.id).css({ left: l, top: t, height: 'auto' });
        //------------------------------------------------------------------------------------------------------------
        // Add control options for new bar
<<<<<<< HEAD
    };
    CircularGraph.prototype.addAttributeBarElements = function (bar) {
        var _this = this;
        var varCircularLayoutAttributeOnChange = function (barID, val) { _this.circularLayoutAttributeOnChange(barID, val); };
        var varUpdateCircularBarColor = function (barID, color) { _this.updateCircularBarColor(barID, color); };
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        $('#div-circular-layout-menu-' + this.id).append('<div id="div-circular-bar' + bar.id + '-' + this.id + '"></div>');
        $('#div-circular-bar' + bar.id + '-' + this.id).append($('<select id="select-circular-layout-attribute-' + bar.id + '-' + this.id + '" class=' + this.circularCSSClass + '></select>')
            .css({ 'margin-left': '5px', 'font-size': '12px', 'width': '80px', 'background-color': '#feeebd' })
            .on("change", function () {
            varCircularLayoutAttributeOnChange(bar.id, $(this).val());
        }));
        $('#div-circular-bar' + bar.id + '-' + this.id)
            .append($("\n                <div id=\"input-circular-layout-bar".concat(bar.id, "-color\" class=\"").concat(this.circularCSSClass, " input-group colorpicker-component\" style=\"width: 12em\" >\n                    <input type=\"text\" value=\"bdc3c7\" class=\"form-control\"/>\n                    <span class=\"input-group-addon\"><i></i></span>\n                </div>\n                ")));
        var $pickerDiv = $("#input-circular-layout-bar".concat(bar.id, "-color"));
        var customClass = "custom-picker-".concat(bar.id, "-").concat(this.id);
        $pickerDiv.colorpicker({
            format: "hex",
<<<<<<< HEAD
            color: bar.color,
            customClass: customClass
        });
        $pickerDiv.on("changeColor", function (e) {
            if (!$pickerDiv.data('isFromReset')) {
                varUpdateCircularBarColor(bar.id, e.color.toHex());
            }
            else {
                $pickerDiv.removeData('isFromReset');
            }
        });
=======
            customClass: customClass
        });
        $pickerDiv.on("changeColor", function (e) { return varUpdateCircularBarColor(bar.id, e.color.toHex()); });
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        $pickerDiv.on("showPicker", function (e) {
            // May need to adjust if it overflows the window
            var $pickerPalette = $("." + customClass);
            $pickerPalette.removeClass("clip-to-bottom");
            if ($pickerPalette.outerHeight() + $pickerPalette.offset().top > window.innerHeight)
                $pickerPalette.addClass("clip-to-bottom");
        });
        $('#select-circular-layout-attribute-' + bar.id + '-' + this.id).empty();
        var option = document.createElement('option');
        option.text = 'none';
        option.value = 'none';
        $('#select-circular-layout-attribute-' + bar.id + '-' + this.id).append(option);
        for (var i = 0; i < this.dataSet.attributes.columnNames.length; ++i) {
            var columnName = this.dataSet.attributes.columnNames[i];
            $('#select-circular-layout-attribute-' + bar.id + '-' + this.id).append('<option value = "' + columnName + '">' + columnName + '</option>');
        }
<<<<<<< HEAD
        $('#select-circular-layout-attribute-' + bar.id + '-' + this.id).find("option[value=\"" + bar.attribute + "\"]").prop("selected", true);
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
    };
    // Differences between update and set circular bar color
    CircularGraph.prototype.updateCircularBarColor = function (barID, color) {
        this.circularBarColorChange = true;
        // update bar object
        var bar = this.attributeBars[barID];
        bar.color = color;
        var gScale = 100;
        var r, g, b;
        var txt;
        var rgbtext;
        var delta;
<<<<<<< HEAD
=======
        console.log(color);
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        if (bar.isGradientOn) {
            var attr = $('#select-circular-layout-attribute-' + bar.id + '-' + this.id).val();
            // Change all color of the first bar
            this.svgAllElements.selectAll(".rectCircular[barID='" + bar.id + "']")
                .style("fill", function (d) {
                delta = gScale * (1 - d["scale_" + attr]);
                rgbtext = rgbtext.replace("#", "");
                delta = Math.floor(delta);
                r = parseInt(rgbtext.substr(0, 2), 16),
                    g = parseInt(rgbtext.substr(2, 2), 16),
                    b = parseInt(rgbtext.substr(4, 2), 16),
                    r += delta;
                if (r > 255)
                    r = 255;
                if (r < 0)
                    r = 0;
                g += delta;
                if (g > 255)
                    g = 255;
                if (g < 0)
                    g = 0;
                b += delta;
                if (b > 255)
                    b = 255;
                if (b < 0)
                    b = 0;
                txt = b.toString(16);
                if (txt.length < 2)
                    txt = "0" + txt;
                txt = g.toString(16) + txt;
                if (txt.length < 4)
                    txt = "0" + txt;
                txt = r.toString(16) + txt;
                if (txt.length < 6)
                    txt = "0" + txt;
                return "#" + txt;
            });
        }
        else {
            this.svgAllElements.selectAll(".rectCircular[barID='" + bar.id + "']")
<<<<<<< HEAD
                .style("fill", bar.color);
        }
        this.createHistogramBars();
        //console.trace();
        //console.log(`#input-circular-layout-bar${bar.id}-color`);
        // set the color of the colorpicker
        var pickerDiv = document.getElementById("input-circular-layout-bar".concat(bar.id, "-color"));
        //console.log(pickerDiv);
        $(pickerDiv).data('isFromReset', true).colorpicker("setValue", bar.color);
=======
                .style("fill", color);
        }
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
    };
    ////////////////////////////////////////////////////////////////
    ///////// Change in Graph Settings /////////////////////////////
    ////////////////////////////////////////////////////////////////
    CircularGraph.prototype.updateAllAttributeBars = function () {
        var height = this.BAR_MAX_HEIGHT / this.numBarsActive;
        var count = 0;
        var BAR_MAX_HEIGHT = this.BAR_MAX_HEIGHT;
<<<<<<< HEAD
        //console.log("updateAllAttributeBars");
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        this.attributeBars.forEach(function (bar) {
            // check if the bar is active
            if (bar.attribute !== "none") {
                this.svgAllElements.selectAll(".rectCircular[barID='" + bar.id + "']")
                    // Change bar location
                    .attr("transform", function (d) {
                    return "rotate(" + (d.x - 90) + ")" +
                        "translate(" + (d.y + 4) + ",  " + ((height * count) - BAR_MAX_HEIGHT / 2) + ")" + (d.x < 180 ? "" : "");
                    // Change bar height
                }).attr("height", function (d) {
                    return height;
                }).attr("width", function (d) {
                    var barWidth = 40 * d["scale_" + bar.attribute];
                    d.barWidths[bar.id] = barWidth;
                    return barWidth;
                });
                this.updateCircularBarColor(bar.id, bar.color);
                count++;
            }
<<<<<<< HEAD
            else {
                this.svgAllElements.selectAll(".rectCircular[barID='" + bar.id + "']")
                    .attr("width", function (d) {
                    d.barWidths[bar.id] = 0;
                    return 0;
                });
            }
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        }, this);
        // move the label
        this.svgAllElements.selectAll(".nodeCircular")
            .attr("transform", function (d) {
            var maxSize = 0;
            for (var widthSize in d.barWidths) {
                if (maxSize < d.barWidths[widthSize]) {
                    maxSize = d.barWidths[widthSize];
                }
            }
            return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 16 + maxSize) + ",0)" + (d.x < 180 ? "" : "rotate(180)");
        });
    };
    // Change on Attribute of bar
    CircularGraph.prototype.circularLayoutAttributeOnChange = function (barID, attr) {
        var curBar = this.attributeBars[barID];
        var height = this.BAR_MAX_HEIGHT / this.numBarsActive;
        var BAR_MAX_HEIGHT = this.BAR_MAX_HEIGHT;
        // update number of active bar
        if (curBar.attribute == "none" && attr !== "none") {
            this.numBarsActive++;
            this.circularBarWidthChange = true;
        }
        else if (curBar.attribute !== "none" && attr == "none") {
            this.numBarsActive--;
            this.circularBarWidthChange = true;
        }
        // update bar attribute
        curBar.attribute = attr;
        // Update all active bar width 
        var count = 0;
        if (this.circularBarWidthChange) {
            height = this.BAR_MAX_HEIGHT / this.numBarsActive;
            this.attributeBars.forEach(function (bar) {
                // check if the bar is active
                if (bar.attribute !== "none") {
                    this.svgAllElements.selectAll(".rectCircular[barID='" + bar.id + "']")
                        // Change bar location
                        .attr("transform", function (d) {
                        return "rotate(" + (d.x - 90) + ")" +
                            "translate(" + (d.y + 4) + ",  " + ((height * count) - BAR_MAX_HEIGHT / 2) + ")" + (d.x < 180 ? "" : "");
                        // Change bar height
                    }).attr("height", function (d) {
                        return height;
                    });
                    count++;
                }
            }, this);
        }
        // update bar width (height) value
        if (curBar.attribute !== "none") {
            this.svgAllElements.selectAll(".rectCircular[barID='" + curBar.id + "']")
                .attr("width", function (d) {
                var barWidth = 40 * d["scale_" + attr];
                d.barWidths[curBar.id] = barWidth;
                return barWidth;
            });
        }
        else {
            this.svgAllElements.selectAll(".rectCircular[barID='" + curBar.id + "']")
                .attr("width", function (d) {
                d.barWidths[curBar.id] = 0;
                return 0;
            });
        }
        // Update the bar color base on the value in the object
        this.updateCircularBarColor(curBar.id, curBar.color);
        // move the label
        this.svgAllElements.selectAll(".nodeCircular")
            .attr("transform", function (d) {
            var maxSize = 0;
            for (var widthSize in d.barWidths) {
                if (maxSize < d.barWidths[widthSize]) {
                    maxSize = d.barWidths[widthSize];
                }
            }
            return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 16 + maxSize) + ",0)" + (d.x < 180 ? "" : "rotate(180)");
        });
    };
    CircularGraph.prototype.circularLayoutSortOnChange = function (attr) {
        this.circularSortAttribute = $('#select-circular-layout-sort-' + this.id).val();
        this.clear();
        this.create(); // recreate the graph
        //this.showNetwork(true); // Is there another way to update the graph without calling this function
    };
    CircularGraph.prototype.circularLayoutBundleOnChange = function (attr) {
        this.circularBundleAttribute = $('#select-circular-layout-bundle-' + this.id).val();
        this.clear();
        this.create(); // recreate the graph
    };
    CircularGraph.prototype.circularLayoutLabelOnChange = function (attr) {
        this.circularLabelAttribute = attr;
        if (attr == "none") {
            this.svgAllElements.selectAll(".nodeCircular")
                .style("display", "none");
        }
        else {
            this.svgAllElements.selectAll(".nodeCircular")
                .style("display", "block");
            if (attr == "label") {
                this.svgAllElements.selectAll(".nodeCircular")
                    .text(function (d) {
                    return d.label;
                });
            }
            else if (attr == "id") {
                this.svgAllElements.selectAll(".nodeCircular")
                    .text(function (d) { return d.key; });
            }
            else {
                this.svgAllElements.selectAll(".nodeCircular")
                    .text(function (d) { return d[attr]; });
            }
        }
    };
    CircularGraph.prototype.circularLayoutEdgeColorModeOnChange = function (mode, config) {
        this.circularEdgeColorMode = mode;
        this.edgeColorConfig = config;
        this.update();
    };
    CircularGraph.prototype.circularLayoutEdgeDirectionModeOnChange = function (directionMode) {
        if (this.circularEdgeDirectionMode === directionMode)
            return;
        // remove old direction mode
        if (this.circularEdgeDirectionMode === "arrow") {
            this.toggleDirectionArrow(false);
        }
        else if (this.circularEdgeDirectionMode === "ansimation") {
            // ignore
        }
        else if (this.circularEdgeDirectionMode === "opacity") {
            // ignore (handled by update method)
        }
        // Apply new direction mode
        if (directionMode === "arrow") {
            this.toggleDirectionArrow(true);
        }
        else if (directionMode === "animation") {
            // ignore
        }
        else if (directionMode === "opacity") {
            // ignore (handled by update method)
        }
        this.circularEdgeDirectionMode = directionMode;
        this.update();
    };
    ////////////////////////////////////////////////////////////////
    ///////// Mouse Interaction ////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    CircularGraph.prototype.mouseOveredSetNodeID = function (id) {
        this.commonData.nodeIDUnderPointer[4] = id;
    };
    CircularGraph.prototype.mouseOutedSetNodeID = function () {
        this.commonData.nodeIDUnderPointer[4] = -1;
    };
    // Handle click on the Options
    CircularGraph.prototype.circularLayoutHistogramButtonOnClick = function () {
        var l = $('#button-circular-layout-histogram-' + this.id).position().left + 5;
        //var t = $('#button-circular-layout-histogram-' + this.id).position().top - $('#div-circular-layout-menu-' + this.id).height() - 15;
        var b = $('#button-circular-layout-histogram-' + this.id).outerHeight();
        this.attributeBars.forEach(function (bar) {
            if ($('#span-circular-layout-bar' + bar.id + '-color-picker').length > 0) {
                // saved in the object for future saving feature
                bar.colorPicker = $('#span-circular-layout-bar' + bar.id + '-color-picker').detach();
            }
        });
        $('#div-circular-layout-menu-' + this.id).zIndex(1000);
        $('#div-circular-layout-menu-' + this.id).css({ left: l, bottom: b, height: 'auto' });
        $('#div-circular-layout-menu-' + this.id).fadeToggle('fast');
    };
    // When the mouse hovers the node's label
    CircularGraph.prototype.mouseOveredCircularLayout = function (d) {
        var selectedID = this.commonData.selectedNode;
<<<<<<< HEAD
=======
        console.log(selectedID);
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        var _this = this;
        // Reseting All nodes source and target
        this.svgAllElements.selectAll(".nodeCircular")
            .each(function (n) { n.target = n.source = false; }); // For every node in the graph
        var varEdgeColorMode = _this.circularEdgeColorMode;
        this.svgAllElements.selectAll(".linkCircular")
            .style("stroke-width", function (l) {
            // if the link is associated with the selected node in anyway (source or target)
            if (l.target === d) {
                l.target.source = true;
                l.source.target = true;
            }
            if (l.source === d) {
                l.source.source = true;
                l.target.target = true;
            }
            if (l.source.id === selectedID) {
                l.source.source = true;
                l.target.target = true;
            }
            if (l.target.id === selectedID) {
                l.source.source = true;
                l.target.target = true;
            }
            // Reassign line width to all links base on the given information
            if (l.target === d || l.source === d || l.source.id === selectedID || l.target.id === selectedID) {
                return "3px";
            }
            else {
                return "1px";
            }
        })
            .style("stroke-opacity", function (l) {
            if (l.target === d || l.source === d || l.source.id === selectedID || l.target.id === selectedID) {
                return 1;
            }
            else {
                return 0.2;
            }
        });
        this.svgAllElements.selectAll(".nodeCircular")
            .style("font-weight", function (n) {
            if ((n.target || n.source)) { // if the node has any direct relation to the selected node
                return "bolder";
            }
            else {
                return "normal";
            }
        })
            .style("font-size", function (n) {
            if (n.source) {
                return "17px";
            }
            else if (n.target) {
                return "13px";
            }
            else {
                return "11px";
            }
        })
            .style("opacity", function (n) {
            if (n.target || n.source) {
                return 1;
            }
            else {
                return 0.2;
            }
        })
            .style("display", function (n) {
            if (_this.circularLabelAttribute == 'none') {
                if ((n.target || n.source)) { // if the node has any direct relation to the selected node
                    return "block";
                }
                else {
                    return "none";
                }
            }
            else {
                return "block";
            }
        });
        this.svgAllElements.selectAll(".nodeDotCircular")
            .style("opacity", function (n) {
            if (n.target || n.source) {
                return 1;
            }
            else {
                return 0.2;
            }
        });
        ;
        this.attributeBars.forEach(function (bar) {
            if (bar.attribute !== "none") {
                this.svgAllElements.selectAll(".rectCircular[barID='" + bar.id + "']")
                    .style("opacity", function (n) {
                    if (n.target || n.source) {
                        return 1;
                    }
                    else {
                        return 0.2;
                    }
                });
            }
        }, this);
    };
    CircularGraph.prototype.mouseOutedCircularLayout = function (d) {
        var selectedID = this.commonData.selectedNode;
        var _this = this;
        if (selectedID == -1) {
            this.svgAllElements.selectAll(".linkCircular")
                .style("stroke-width", "1px")
                .style("stroke-opacity", 1);
            this.svgAllElements.selectAll(".nodeCircular")
                .style("font-weight", "normal")
                .style("font-size", "11px")
                .style("opacity", 1)
                .style("display", function (n) {
                if (_this.circularLabelAttribute == 'none') {
                    return "none";
                }
                else {
                    return "block";
                }
            });
            this.svgAllElements.selectAll(".nodeDotCircular")
                .style("opacity", 1);
            this.attributeBars.forEach(function (bar) {
                // check if the bar is active
                if (bar.attribute !== "none") {
                    this.svgAllElements.selectAll(".rectCircular[barID='" + bar.id + "']")
                        .style("opacity", 1);
                }
            }, this);
        }
        else {
            // Reseting All nodes source and target
            this.svgAllElements.selectAll(".nodeCircular")
                .each(function (n) { n.target = n.source = false; }); // For every node in the graph
            var varEdgeColorMode = this.circularEdgeColorMode;
            this.svgAllElements.selectAll(".linkCircular")
                .style("stroke-width", function (l) {
                // if the link is associated with the selected node in anyway (source or target)
                if (l.source.id === selectedID) {
                    l.source.source = true;
                    l.target.target = true;
                }
                if (l.target.id === selectedID) {
                    l.source.source = true;
                    l.target.target = true;
                }
                // Reassign line width to all links base on the given information
                if (l.source.id == selectedID || l.target.id == selectedID) {
                    return "3px";
                }
                else {
                    return "1px";
                }
            })
                .style("stroke-opacity", function (l) {
                if (l.source.id == selectedID || l.target.id == selectedID) {
                    return 1;
                }
                else {
                    return 0.2;
                }
            });
            this.svgAllElements.selectAll(".nodeCircular")
                .style("font-weight", function (n) {
                if ((n.target || n.source)) { // if the node has any direct relation to the selected node
                    return "bolder";
                }
                else {
                    return "normal";
                }
            })
                .style("font-size", function (n) {
                if (n.source) {
                    return "17px";
                }
                else if (n.target) {
                    return "13px";
                }
                else {
                    return "11px";
                }
            })
                .style("opacity", function (n) {
                if (n.target || n.source) {
                    return 1;
                }
                else {
                    return 0.2;
                }
            });
            ;
            this.svgAllElements.selectAll(".nodeDotCircular")
                .style("opacity", function (n) {
                if (n.target || n.source) {
                    return 1;
                }
                else {
                    return 0.2;
                }
            });
            ;
            this.attributeBars.forEach(function (bar) {
                // check if the bar is active
                if (bar.attribute !== "none") {
                    this.svgAllElements.selectAll(".rectCircular[barID='" + bar.id + "']")
                        .style("opacity", function (n) {
                        if (n.target || n.source) {
                            return 1;
                        }
                        else {
                            return 0.2;
                        }
                    });
                }
            }, this);
        }
    };
    return CircularGraph;
}());
//# sourceMappingURL=circularGraph.js.map