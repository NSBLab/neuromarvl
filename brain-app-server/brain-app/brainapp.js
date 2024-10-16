/// <reference path="../extern/three.d.ts"/>
/// <reference path="../extern/jquery.d.ts"/>
/// <reference path="../extern/jqueryui.d.ts"/>
var TYPE_COORD = "coordinates";
var TYPE_MATRIX = "matrix";
var TYPE_ATTR = "attributes";
var TYPE_LABEL = "labels";
// The names of the views are referenced quite often
var TL_VIEW = '#view-top-left';
var TR_VIEW = '#view-top-right';
var BL_VIEW = '#view-bottom-left';
var BR_VIEW = '#view-bottom-right';
var Loop = /** @class */ (function () {
    function Loop(loopable, limit) {
        var _this = this;
        this.loopable = loopable;
        this.frameTimeLimit = limit;
        this.timeOfLastFrame = new Date().getTime();
        var mainLoop = function () {
            var currentTime = new Date().getTime();
            var deltaTime = (currentTime - _this.timeOfLastFrame) / 1000;
            _this.timeOfLastFrame = currentTime;
            // Limit the maximum time step
            if (deltaTime > _this.frameTimeLimit)
                _this.loopable.update(_this.frameTimeLimit);
            else
                _this.loopable.update(deltaTime);
            requestAnimationFrame(mainLoop);
        };
        requestAnimationFrame(mainLoop);
    }
    return Loop;
}());
// Create the object that the input target manager will use to update the pointer position when we're using the Leap
var PointerImageImpl = /** @class */ (function () {
    function PointerImageImpl() {
    }
    PointerImageImpl.prototype.updatePosition = function (position) {
        $('#leap-pointer').offset({ left: position.x - 6, top: position.y - 6 });
    };
    PointerImageImpl.prototype.show = function () {
        $('#leap-pointer').show();
    };
    PointerImageImpl.prototype.hide = function () {
        $('#leap-pointer').hide();
    };
    return PointerImageImpl;
}());
var NeuroMarvl = /** @class */ (function () {
    function NeuroMarvl() {
        var _this = this;
        this.referenceDataSet = new DataSet();
        this.commonData = new CommonData();
        this.saveFileObj = new SaveFile({});
        this.pointerImage = new PointerImageImpl;
        this.viewWidth = 0;
        this.viewHeight = 0;
        this.pinWidth = 0;
        this.pinHeight = 0;
        // reference to the export-dialog OK button callback handler
        // The dialog is also used for the batch download, using another callback
        // To not loose original reference, we save it in a variable
        this.exportCallbackFunction = null;
        /*
            Functions to create a solid starting state and all UI elements available
        */
        this.initUI = function () {
            // Initialise the view sizes and pin location
            _this.viewWidth = $('#outer-view-panel').width();
            _this.viewHeight = $('#outer-view-panel').height();
            _this.pinWidth = $('#pin').width();
            _this.pinHeight = $('#pin').height();
            // Data set icons are visible when the page loads - reset them immediately
            // Load notification
            _this.divLoadingNotification = document.createElement('div');
            _this.divLoadingNotification.id = 'div-loading-notification';
            /*
                Set up jQuery UI layout objects
            */
            if ($("#checkbox-tips").is(":checked")) {
                $("[data-toggle='tooltip']").tooltip({ container: 'body', trigger: 'hover' });
            }
            else {
                $("[data-toggle='tooltip']").tooltip("destroy");
            }
            /*
                Upload files buttons
            */
            $('#button-select-coords').click(function () { return $("#select-coords").click(); });
            $('#select-coords').on('change', function () {
                // Change the button name according to the file name
                var file = $('#select-coords').get(0).files[0];
                document.getElementById("button-select-coords-filename").innerHTML = file.name;
                _this.changeFileStatus("coords-status", "changed");
                // parse and upload coordinate file
                _this.uploadCoords();
            });
            $('#button-select-matrices-batching').click(function () {
                $("#select-matrices-batching").click();
            });
            $("#select-matrices-batching").on('change', function () {
                var numFiles = $('#select-matrices-batching').get(0).files.length;
                document.getElementById("button-select-matrices-batching").innerHTML = numFiles + " files loaded";
                _this.changeFileStatus("matrices-batching-status", "uploaded");
            });
            $('#button-select-attrs-batching').click(function () {
                $("#select-attrs-batching").click();
            });
            $("#select-attrs-batching").on('change', function () {
                var numFiles = $('#select-attrs-batching').get(0).files.length;
                document.getElementById("button-select-attrs-batching").innerHTML = numFiles + " files loaded";
                _this.changeFileStatus("attrs-batching-status", "uploaded");
            });
            $('#btn-start-batching').click(function () {
                var matrixFiles = $('#select-matrices-batching').get(0).files;
                var attrFiles = $('#select-attrs-batching').get(0).files;
                if (matrixFiles.length > 0 && attrFiles.length > 0 && matrixFiles.length === attrFiles.length) {
                    // Showing modal 
                    $("#alertModal")["modal"]({
                        backdrop: "static"
                    });
                    // Reset modal content
                    document.getElementById("alertModalTitle").innerHTML = "Batching in progress";
                    document.getElementById("alertModalMessage").innerHTML = "Processing " + (i + 1) + " in " + numberOfFiles + " pairs.";
                    // Start batching
                    var status = 0.0;
                    var attributes = $('#select-attrs-batching').get(0).files;
                    var matrices = $('#select-matrices-batching').get(0).files;
                    var numberOfFiles = attributes.length;
                    var i = 0;
                    // use the export dialog to also save the batch export
                    var savecallback_1 = _this.exportCallbackFunction;
                    $('#button-export-submit').button().unbind('click');
                    var appref_1 = _this;
                    var savePrevFilename = $('#select-export-filename').val();
                    var batchExportCallback = function () {
                        $("#exportModal")["modal"]('toggle');
                        $('#button-export-submit').button().unbind('click');
                        $('#button-export-submit').button().click(savecallback_1);
                        var filename = $('#select-export-filename').val();
                        if (filename.length == 0)
                            filename = null;
                        var viewport = $('#select-export-viewport').val();
                        var type = $('#select-export-type').val();
                        var strresolution = $('#select-export-resolution').val();
                        strresolution = strresolution.split('x');
                        var resolution = {
                            x: parseInt(strresolution[0]),
                            y: parseInt(strresolution[1])
                        };
                        appref_1.batchProcess(i, numberOfFiles, attributes, matrices, filename, type, resolution);
                        $('#select-export-filename').val(savePrevFilename);
                    };
                    $('#button-export-submit').button().click(batchExportCallback);
                    $("#exportModal")["modal"]();
                }
                else {
                    if (matrixFiles.length == 0 || attrFiles.length == 0)
                        confirm("Please add at least 2 connectivity matrix and 2 Node attribute files");
                    else {
                        confirm("Please load the same number of connectivity matrix and attribute files");
                    }
                    CommonUtilities.launchAlertMessage(CommonUtilities.alertType.ERROR, "No files given or number of Files do not match.");
                }
            });
            $('#pin').css({ left: _this.viewWidth - _this.pinWidth, top: _this.viewHeight - _this.pinHeight });
            _this.setViewCrossroads(_this.viewWidth - _this.pinWidth, _this.viewHeight - _this.pinHeight);
            // Set up the pin behaviour
            $('#pin').draggable({ containment: '#outer-view-panel' }).on('drag', function (event) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                var ui = args[0];
                var x = ui.position.left;
                var y = ui.position.top;
                _this.setViewCrossroads(x, y);
            });
            $("#div-surface-opacity-slider")['bootstrapSlider']({
                formatter: function (value) { return 'Current value: ' + value; }
            });
            $("#div-surface-opacity-slider")['bootstrapSlider']().on('slide', _this.setSurfaceOpacity);
            $("#div-edge-size-slider")['bootstrapSlider']({
                formatter: function (value) { return 'Current value: ' + value; }
            });
            $("#div-edge-size-slider")['bootstrapSlider']().on('slide', _this.setEdgeSize);
            $('#input-select-model').button();
            $('#select-coords').button();
            $('#select-matrix').button();
            $('#select-attrs').button();
            $('#select-labels').button();
            $("#overlay-close").click(_this.toggleSplashPage);
            $("#control-panel-bottom-close").click(_this.toggleSplashPage);
            // Create color pickers
            $("#input-node-color").colorpicker({ format: "hex" });
            $("#input-surface-color").colorpicker({ format: "hex" });
            $("#input-min-color").colorpicker({ format: "hex" });
            $("#input-max-color").colorpicker({ format: "hex" });
            $("#input-edge-start-color").colorpicker({ format: "hex" });
            $("#input-edge-end-color").colorpicker({ format: "hex" });
            $("#input-edge-discretized-0-color").colorpicker({ format: "hex" });
            $("#input-edge-discretized-1-color").colorpicker({ format: "hex" });
            $("#input-edge-discretized-2-color").colorpicker({ format: "hex" });
            $("#input-edge-discretized-3-color").colorpicker({ format: "hex" });
            $("#input-edge-discretized-4-color").colorpicker({ format: "hex" });
            $("#input-edge-min-color").colorpicker({ format: "hex" });
            $("#input-edge-max-color").colorpicker({ format: "hex" });
            $("#input-edge-color").colorpicker({ format: "hex" });
            $("#input-context-menu-node-color").colorpicker({ format: "hex" });
            $("#input-edge-transitional-color").colorpicker({ format: "hex" });
        };
        this.start = function () {
            _this.initUI();
            var query = window.location.search.substring(1);
            var commonInit = function () {
                _this.initDataDependantUI();
                _this.initListeners();
            };
            var callbackNoSave = function () {
                _this.createBrainView(TL_VIEW, $('#select-brain3d-model').val(), commonInit, "empty");
                _this.toggleSplashPage();
            };
            // check of URL parameters
            if (query && query.length > 0) {
                _this.showLoadingNotification();
                var p = query.split("=");
                if (p.length < 2)
                    return false;
                var json;
                // Only let source be from "save_examples" (if specified by "example") or default to "save".
                var source_1 = p[0]; // "save" or "example"
                $.post("brain-app/getapp.aspx", {
                    filename: p[1],
                    source: source_1
                }, function (data, status) {
                    console.log("Data fetch from ".concat(p[0], " location got configuration with length ").concat(data.length, " and \"").concat(status, "\" status"));
                    if (status.toLowerCase() == "success") {
                        // Ensure that data is not empty
                        if (!data || !data.length)
                            return;
                        _this.saveFileObj = new SaveFile(jQuery.parseJSON(data));
                        for (var _i = 0, _a = _this.saveFileObj.saveApps; _i < _a.length; _i++) {
                            var app = _a[_i];
                            if (app.surfaceModel && (app.surfaceModel.length > 0)) {
                                _this.createBrainView(app.view, app.surfaceModel, commonInit, source_1, app.brainSurfaceMode);
                                //to fix the model is not loading after save
                                $('#select-brain3d-model').val(app.surfaceModel);
                            }
                        }
                        // record display settings                        
                        _this.recordDisplaySettings();
                    }
                    else {
                        alert("Loading is: " + status + "\nData: " + data);
                        callbackNoSave();
                    }
                });
            }
            else {
                callbackNoSave();
            }
        };
        /*
            Functions to work with app state
        */
        this.initApp = function (id) {
            // init edge count
            var savedApp = _this.saveFileObj.saveApps[id];
            if (savedApp.surfaceModel) {
                _this.applicationsInstances[id].initEdgeCountSlider(savedApp);
            }
            // init cross filter
            if (_this.saveFileObj.filteredRecords && (_this.saveFileObj.filteredRecords.length > 0)) {
                _this.referenceDataSet.attributes.filteredRecords = _this.saveFileObj.filteredRecords.slice(0);
                _this.applyFilterButtonOnClick();
            }
            // set newly created saveFileObj to Brain3D object
            _this.applicationsInstances[id].saveFileObj = _this.saveFileObj;
            // make sure the app has required graphs created
            _this.applicationsInstances[id].restart();
            // init show network
            if (savedApp.surfaceModel) {
                _this.applicationsInstances[id].initShowNetwork(savedApp);
            }
            _this.removeLoadingNotification();
        };
        this.initDataDependantUI = function () {
            // init the node size and color given the current UI. The UI needs to be redesigned.
            if (_this.saveFileObj.nodeSettings.nodeSizeOrColor && (_this.saveFileObj.nodeSettings.nodeSizeOrColor.length > 0)) {
                if (_this.saveFileObj.nodeSettings.nodeSizeOrColor == "node-size") {
<<<<<<< HEAD
                    _this.initNodeSize();
                    //this.initNodeColor();
                }
                else if (_this.saveFileObj.nodeSettings.nodeSizeOrColor == "node-color") {
                    //this.initNodeSize();
=======
                    _this.initNodeColor();
                    _this.initNodeSize();
                }
                else if (_this.saveFileObj.nodeSettings.nodeSizeOrColor == "node-color") {
                    _this.initNodeSize();
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
                    _this.initNodeColor();
                }
            }
            // init edge size and color.
            if (_this.saveFileObj.edgeSettings) {
                _this.initEdgeSizeAndColor();
            }
            // init Surface Setting
            if (_this.saveFileObj.surfaceSettings) {
                _this.initSurfaceSettings();
            }
            _this.selectView(TL_VIEW);
        };
        this.batchProcess = function (i, numberOfFiles, attributes, matrices, filename, filetype, resolution) {
            if (filename === void 0) { filename = null; }
            if (filetype === void 0) { filetype = "svg"; }
            if (resolution === void 0) { resolution = { x: 1920, y: 1080 }; }
            document.getElementById("alertModalMessage").innerHTML = "Started load of " + numberOfFiles + " file pairs...";
            var gotAttributes = false;
            var gotMatrix = false;
            var onLoaded = function (i, numberOfFiles, attributes, matrices) {
                if (!gotAttributes || !gotMatrix)
                    return;
                // Load the new dataset to the app (always use the first viewport - top left);
                _this.setDataset(TL_VIEW);
                var appref = _this;
                var fnExportFunctionAndContinue = function () {
                    // Capture and download the visualisation
                    // callback is called, as soon as svg has been downloaded
                    appref.exportSVG(0, filetype, resolution, filename + '_' + (i + 1), function () {
                        // update status
                        i++;
                        var percentage = (i / numberOfFiles) * 100;
                        $("#progressBar").css({
                            "width": percentage + "%"
                        });
                        document.getElementById("alertModalMessage").innerHTML = "Processing " + (i + 1) + " in " + numberOfFiles + " pairs.";
                        if (i < numberOfFiles) {
                            setTimeout(function () {
                                appref.batchProcess(i, numberOfFiles, attributes, matrices, filename, filetype, resolution);
                            }, 0);
                        }
                        else {
                            $("#alertModal")["modal"]('hide');
                        }
                    });
                };
                // refresh the visualisation with current settings and new data
                if (_this.applicationsInstances[0].networkType != undefined) {
                    _this.applicationsInstances[0].showNetwork(false, function () {
                        _this.setNodeSizeOrColor();
                        _this.setEdgeColor();
<<<<<<< HEAD
                        _this.setEdgeSize();
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
                        _this.applicationsInstances[0].update(0);
                        fnExportFunctionAndContinue();
                    });
                }
                else {
<<<<<<< HEAD
                    _this.setNodeSizeOrColor();
                    _this.setEdgeColor();
                    _this.setEdgeSize();
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
                    _this.applicationsInstances[0].update(0);
                    fnExportFunctionAndContinue();
                }
            };
            // Load pair of files into dataset
            _this.loadAttributes(attributes[i], _this.referenceDataSet, function () {
                gotAttributes = true;
                onLoaded(i, numberOfFiles, attributes, matrices);
            });
            _this.loadSimilarityMatrix(matrices[i], _this.referenceDataSet, function () {
                gotMatrix = true;
                onLoaded(i, numberOfFiles, attributes, matrices);
            });
        };
        this.uploadCoords = function () {
            var file = $('#select-coords').get(0).files[0];
            if (file) {
                // 1. upload the file to server
                _this.uploadTextFile(file, TYPE_COORD);
                // 2. also load data locally
                _this.loadCoordinates(file);
                // 3. update file status
                _this.changeFileStatus("coords-status", "uploaded");
            }
        };
        this.uploadMatrix = function () {
            var file = $('#select-matrix').get(0).files[0];
            if (file) {
                // 1. upload the file to server
                _this.uploadTextFile(file, TYPE_MATRIX);
                // 2. also load data locally
                _this.loadSimilarityMatrix(file, _this.referenceDataSet);
                // 3. update file status
                _this.changeFileStatus("matrix-status", "uploaded");
            }
        };
        this.uploadAttr = function () {
            var file = $('#select-attrs').get(0).files[0];
            if (file) {
                // 1. upload the file to server
                _this.uploadTextFile(file, TYPE_ATTR);
                // 2. also load data locally
                //loadAttributes(file, dataSet);
                var reader = new FileReader();
                reader.onload = function () {
                    _this.parseAttributes(reader.result, _this.referenceDataSet);
                    _this.referenceDataSet.notifyAttributes();
                    // 3. update file status
                    $('#attrs-status').removeClass('status-changed');
                    $('#attrs-status').removeClass('glyphicon-info-sign');
                    $('#attrs-status').addClass('status-updated');
                    $('#attrs-status').addClass('glyphicon-ok-sign');
                    document.getElementById("attrs-status").title = "Uploaded Succesfully";
                    $("#attrs-status").tooltip('fixTitle');
                    _this.setupAttributeTab();
                };
                reader.readAsText(file);
            }
        };
        this.uploadLabels = function () {
            var file = $('#select-labels').get(0).files[0];
            if (file) {
                // 1. upload the file to server
                _this.uploadTextFile(file, TYPE_LABEL);
                // 2. also load data locally
                _this.loadLabels(file);
                // 3. update file status
                _this.changeFileStatus("labels-status", "uploaded");
            }
        };
        this.toggleSplashPage = function () {
            var splashPage = $('#splashPage');
            if (splashPage.hasClass("open")) {
                splashPage.removeClass("open");
                splashPage.addClass("close");
                setTimeout(function () { return splashPage.removeClass("close"); }, 500);
            }
            else {
                splashPage.addClass("open");
            }
        };
        this.uploadTextFile = function (file, fileType) {
            var reader = new FileReader();
            reader.onload = function () {
                $.post("brain-app/upload.aspx", {
                    fileText: reader.result,
                    fileName: file.name,
                    type: fileType
                }, function (data, status) {
                    if (status.toLowerCase() == "success") {
                        if (fileType == TYPE_COORD) {
                            _this.saveFileObj.serverFileNameCoord = data;
                        }
                        else if (fileType == TYPE_MATRIX) {
                            _this.saveFileObj.serverFileNameMatrix = data;
                        }
                        else if (fileType == TYPE_ATTR) {
                            _this.saveFileObj.serverFileNameAttr = data;
                        }
                        else if (fileType == TYPE_LABEL) {
                            _this.saveFileObj.serverFileNameLabel = data;
                        }
                    }
                    else {
                        //alert("Loading is: " + status + "\nData: " + data);
                    }
                });
            };
            reader.readAsText(file);
        };
        this.loadExampleData = function (func) {
            var status = {
                coordLoaded: false,
                matrixLoaded: false,
                attrLoaded: false,
                labelLoaded: false
            };
            CommonUtilities.launchAlertMessage(CommonUtilities.alertType.INFO, "Loading default data...");
            var callback = function () {
                if (status.coordLoaded && status.matrixLoaded && status.attrLoaded && status.labelLoaded) {
                    CommonUtilities.launchAlertMessage(CommonUtilities.alertType.SUCCESS, "Default data loaded");
                    _this.commonData.notifyCoords();
                    _this.referenceDataSet.notifyAttributes();
                    _this.commonData.notifyLabels();
                    func();
                }
            };
            $.get('brain-app/data/coords.txt', function (text) {
                _this.parseCoordinates(text);
                //$('#shared-coords').css({ color: 'green' });
                $('#label-coords')
                    .text("default data")
                    .css({ color: 'green' });
                status.coordLoaded = true;
                // change status
                document.getElementById("button-select-coords-filename").innerHTML = "coords.txt";
                _this.changeFileStatus("coords-status", "uploaded");
                callback();
            });
            $.get('brain-app/data/mat1.txt', function (text) {
                _this.parseSimilarityMatrix(text, _this.referenceDataSet);
                //$('#d1-mat').css({ color: 'green' });
                $('#label-similarity-matrix')
                    .text("default data")
                    .css({ color: 'green' });
                status.matrixLoaded = true;
                // change status
                document.getElementById("button-select-matrix-filename").innerHTML = "mat1.txt";
                _this.changeFileStatus("matrix-status", "uploaded");
                callback();
            });
            $.get('brain-app/data/attributes1.txt', function (text) {
                _this.parseAttributes(text, _this.referenceDataSet);
                //$('#d1-att').css({ color: 'green' });
                $('#label-attributes')
                    .text("default data")
                    .css({ color: 'green' });
                _this.setupAttributeTab();
                status.attrLoaded = true;
                // change status
                document.getElementById("button-select-attrs-filename").innerHTML = "attributes1.txt";
                _this.changeFileStatus("attrs-status", "uploaded");
                callback();
            });
            $.get('brain-app/data/labels.txt', function (text) {
                _this.parseLabels(text);
                //$('#shared-labels').css({ color: 'green' });
                $('#label-labels')
                    .text("default data")
                    .css({ color: 'green' });
                status.labelLoaded = true;
                // change status
                document.getElementById("button-select-labels-filename").innerHTML = "labels.txt";
                _this.changeFileStatus("labels-status", "uploaded");
                callback();
            });
        };
        this.changeFileStatus = function (file, status) {
            $('#' + file).removeClass('status-changed');
            $('#' + file).removeClass('glyphicon-info-sign');
            $('#' + file).removeClass('status-updated');
            $('#' + file).removeClass('glyphicon-ok-sign');
            if (status === "changed") {
                $('#' + file).addClass('status-changed');
                $('#' + file).addClass('glyphicon-info-sign');
                document.getElementById(file).title = "File is not uploaded";
            }
            else {
                $('#' + file).addClass('status-updated');
                $('#' + file).addClass('glyphicon-ok-sign');
                document.getElementById(file).title = "Uploaded Succesfully";
            }
            $('#' + file).tooltip('fixTitle');
        };
        this.loadUploadedData = function (saveObj, func, source) {
            var status = {
                coordLoaded: false,
                matrixLoaded: false,
                attrLoaded: false,
                labelLoaded: (saveObj.serverFileNameLabel) ? false : true
            };
            var sourceLocation = (source === "example") ? "save_examples" : "save";
            var callback = function () {
                if (status.coordLoaded && status.matrixLoaded && status.attrLoaded && status.labelLoaded) {
                    _this.commonData.notifyCoords();
                    _this.referenceDataSet.notifyAttributes();
                    _this.commonData.notifyLabels();
                    func();
                }
            };
            $.get('brain-app/' + sourceLocation + '/' + saveObj.serverFileNameCoord, function (text) {
                _this.parseCoordinates(text);
                $('#label-coords')
                    .text("Pre-uploaded data")
                    .css({ color: 'green' });
                status.coordLoaded = true;
                // change status
                document.getElementById("button-select-coords-filename").innerHTML = saveObj.serverFileNameCoord;
                _this.changeFileStatus("coords-status", "uploaded");
                callback();
            });
            $.get('brain-app/' + sourceLocation + '/' + saveObj.serverFileNameMatrix, function (text) {
                _this.parseSimilarityMatrix(text, _this.referenceDataSet);
                $('#label-similarity-matrix')
                    .text("Pre-uploaded data")
                    .css({ color: 'green' });
                status.matrixLoaded = true;
                // change status
                document.getElementById("button-select-matrix-filename").innerHTML = saveObj.serverFileNameMatrix;
                _this.changeFileStatus("matrix-status", "uploaded");
                callback();
            });
            $.get('brain-app/' + sourceLocation + '/' + saveObj.serverFileNameAttr, function (text) {
                _this.parseAttributes(text, _this.referenceDataSet);
                //$('#d1-att').css({ color: 'green' });
                $('#label-attributes')
                    .text("Pre-uploaded data")
                    .css({ color: 'green' });
                _this.setupAttributeTab();
                status.attrLoaded = true;
                // change status
                document.getElementById("button-select-attrs-filename").innerHTML = saveObj.serverFileNameAttr;
                _this.changeFileStatus("attrs-status", "uploaded");
                callback();
            });
            // Check if Label file is uploaded
            if (saveObj.serverFileNameLabel) {
                $.get('brain-app/' + sourceLocation + '/' + saveObj.serverFileNameLabel, function (text) {
                    _this.parseLabels(text);
                    //$('#shared-labels').css({ color: 'green' });
                    $('#label-labels')
                        .text("Pre-uploaded data")
                        .css({ color: 'green' });
                    status.labelLoaded = true;
                    // change status
                    document.getElementById("button-select-labels-filename").innerHTML = saveObj.serverFileNameLabel;
                    _this.changeFileStatus("labels-status", "uploaded");
                    callback();
                });
            }
            else {
                status.labelLoaded = true;
                callback();
            }
            $('#load-example-data').button().prop("disabled", "disabled");
        };
        this.setupAttributeNodeControls = function () {
            var sizeOrColor = $('#select-node-size-color').val();
            var attribute = $('#select-attribute').val();
            if (sizeOrColor == "node-size") {
                _this.setupNodeSizeRangeSlider(attribute);
            }
            if (sizeOrColor == "node-color") {
                if (_this.referenceDataSet.attributes.info[attribute].isDiscrete) {
                    $('#div-node-color-mode').show();
                    $('#checkbox-node-color-continuous').prop('checked', false);
                    _this.setupColorPickerDiscrete(attribute);
                }
                else {
                    $('#div-node-color-mode').hide();
                    _this.setupColorPicker();
                }
            }
            _this.setNodeSizeOrColor();
        };
        this.setupAttributeTab = function () {
            if (_this.referenceDataSet && _this.referenceDataSet.attributes) {
                var $selectAttribute = $('#select-attribute');
                var oldAttributeValue = $selectAttribute.val();
                var gotOldValue = false;
                $selectAttribute.empty();
                for (var i = 0; i < _this.referenceDataSet.attributes.columnNames.length; ++i) {
                    var columnName = _this.referenceDataSet.attributes.columnNames[i];
                    $selectAttribute.append('<option value = "' + columnName + '">' + columnName + '</option>');
                    if (columnName === oldAttributeValue)
                        gotOldValue = true;
                }
                if (gotOldValue)
                    $selectAttribute.val(oldAttributeValue);
                $('#div-set-node-scale').show();
                _this.setupAttributeNodeControls();
                _this.setupCrossFilter(_this.referenceDataSet.attributes);
            }
        };
        this.applyFilterButtonOnClick = function () {
            if (!_this.referenceDataSet.attributes.filteredRecords) {
                $('#button-apply-filter').button("disable");
                return;
            }
            var fRecords = _this.referenceDataSet.attributes.filteredRecords;
            var idArray = new Array();
            for (var i = 0; i < fRecords.length; ++i) {
                var id = fRecords[i]["index"];
                idArray.push(id);
            }
            _this.applicationsInstances.forEach(function (app) {
                app.applyFilter(idArray);
                app.needUpdate = true;
            });
            _this.saveFileObj.filteredRecords = _this.referenceDataSet.attributes.filteredRecords;
        };
        this.setSelectEdgeKeyBackgroundColor = function (color) {
            if (color.length === 6)
                color = "#" + color;
            var keySelection = document.getElementById('select-edge-key');
            keySelection.options[keySelection.selectedIndex].style.backgroundColor = color;
        };
        this.setSelectNodeKeyBackgroundColor = function (color) {
            if (color.length === 6)
                color = "#" + color;
            var keySelection = document.getElementById('select-node-key');
            keySelection.options[keySelection.selectedIndex].style.backgroundColor = color;
        };
        this.setDefaultEdgeDiscretizedValues = function () {
            //Assume data is shared across app
            var range = _this.applicationsInstances[0].getCurrentEdgeWeightRange();
            var numCategory = Number($('#select-edge-color-number-discretized-category').val());
            var step = (range.max - range.min) / numCategory;
            $('#input-edge-discretized-' + 0 + '-from').val(range.min.toString());
            $('#input-edge-discretized-' + (numCategory - 1) + '-to').val(range.max.toString());
            for (var i = 0; i < numCategory - 1; i++) {
                $('#input-edge-discretized-' + (i + 1) + '-from').val((range.min + step * (i + 1)).toString());
                $('#input-edge-discretized-' + i + '-to').val((range.min + step * (i + 1)).toString());
            }
        };
        this.setEdgeDirectionGradient = function () {
            _this.saveFileObj.edgeSettings.directionStartColor = $('#input-edge-start-color').colorpicker("getValue");
            _this.saveFileObj.edgeSettings.directionEndColor = $('#input-edge-end-color').colorpicker("getValue");
            if (_this.applicationsInstances[0])
                _this.applicationsInstances[0].setEdgeDirectionGradient();
            if (_this.applicationsInstances[1])
                _this.applicationsInstances[1].setEdgeDirectionGradient();
            if (_this.applicationsInstances[2])
                _this.applicationsInstances[2].setEdgeDirectionGradient();
            if (_this.applicationsInstances[3])
                _this.applicationsInstances[3].setEdgeDirectionGradient();
        };
        this.setEdgeColorByWeight = function () {
            var config = {};
            if (_this.commonData.edgeWeightColorMode === "continuous-discretized") {
                var numCategory = Number($('#select-edge-color-number-discretized-category').val());
                var domainArray = [];
                var colorArray = [];
                var from = Number($('#input-edge-discretized-' + 0 + '-from').val());
                domainArray[domainArray.length] = from;
                for (var i = 0; i < numCategory; i++) {
                    var to = Number($('#input-edge-discretized-' + i + '-to').val());
                    domainArray[domainArray.length] = to;
                    colorArray[colorArray.length] = $('#input-edge-discretized-' + i + '-color').colorpicker("getValue");
                }
                // save updated settings 
                _this.saveFileObj.edgeSettings.colorBy = "weight";
                _this.saveFileObj.edgeSettings.weight.type = "continuous-discretized";
                _this.saveFileObj.edgeSettings.weight.discretizedSetting.numCategory = numCategory;
                _this.saveFileObj.edgeSettings.weight.discretizedSetting.domainArray = domainArray;
                _this.saveFileObj.edgeSettings.weight.discretizedSetting.colorArray = colorArray;
                // set config
                config["type"] = "continuous-discretized";
                config["domainArray"] = domainArray;
                config["colorArray"] = colorArray;
            }
            else if (_this.commonData.edgeWeightColorMode === "continuous-normal") {
                var minColor = $('#input-edge-min-color').colorpicker("getValue");
                var maxColor = $('#input-edge-max-color').colorpicker("getValue");
                // save updated settings
                _this.saveFileObj.edgeSettings.colorBy = "weight";
                _this.saveFileObj.edgeSettings.weight.type = "continuous-normal";
                _this.saveFileObj.edgeSettings.weight.continuousSetting.minColor = minColor;
                _this.saveFileObj.edgeSettings.weight.continuousSetting.maxColor = maxColor;
                // set config
                config["type"] = "continuous-normal";
                config["minColor"] = minColor;
                config["maxColor"] = maxColor;
            }
            else if (_this.commonData.edgeWeightColorMode === "discrete") {
                var valueArray = [];
                var colorArray = [];
                var keySelection = document.getElementById('select-edge-key');
                for (var i = 0; i < keySelection.length; i++) {
                    var key = keySelection.options[i].value;
                    var color = keySelection.options[i].style.backgroundColor;
                    var hex = _this.colorToHex(color);
                    valueArray.push(key);
                    colorArray.push(hex);
                }
                // save updated settings
                _this.saveFileObj.edgeSettings.colorBy = "weight";
                _this.saveFileObj.edgeSettings.weight.type = "discrete";
                _this.saveFileObj.edgeSettings.weight.discretizedSetting.domainArray = domainArray;
                _this.saveFileObj.edgeSettings.weight.discretizedSetting.colorArray = colorArray;
                // set config
                config["type"] = "discrete";
                config["valueArray"] = valueArray;
                config["colorArray"] = colorArray;
            }
            else {
                console.log("Nothing is visible");
            }
            if (_this.applicationsInstances[0])
                _this.applicationsInstances[0].setEdgeColorByWeight(config);
            if (_this.applicationsInstances[1])
                _this.applicationsInstances[1].setEdgeColorByWeight(config);
            if (_this.applicationsInstances[2])
                _this.applicationsInstances[2].setEdgeColorByWeight(config);
            if (_this.applicationsInstances[3])
                _this.applicationsInstances[3].setEdgeColorByWeight(config);
        };
        this.setEdgeColorByNode = function () {
            // save edge color setting
            _this.saveFileObj.edgeSettings.colorBy = "node";
            if (_this.applicationsInstances[0])
                _this.applicationsInstances[0].setEdgeColorByNode();
            if (_this.applicationsInstances[1])
                _this.applicationsInstances[1].setEdgeColorByNode();
            if (_this.applicationsInstances[2])
                _this.applicationsInstances[2].setEdgeColorByNode();
            if (_this.applicationsInstances[3])
                _this.applicationsInstances[3].setEdgeColorByNode();
        };
        this.setEdgeNoColor = function () {
            // save edge color setting 
            _this.saveFileObj.edgeSettings.colorBy = "none";
            if (_this.applicationsInstances[0])
                _this.applicationsInstances[0].setEdgeNoColor();
            if (_this.applicationsInstances[1])
                _this.applicationsInstances[1].setEdgeNoColor();
            if (_this.applicationsInstances[2])
                _this.applicationsInstances[2].setEdgeNoColor();
            if (_this.applicationsInstances[3])
                _this.applicationsInstances[3].setEdgeNoColor();
        };
        this.selectView = function (view) {
            _this.input.setActiveTarget(_this.viewToId(view));
            $(TL_VIEW).css({ borderColor: 'white', zIndex: 0 });
            $(TR_VIEW).css({ borderColor: 'white', zIndex: 0 });
            $(BL_VIEW).css({ borderColor: 'white', zIndex: 0 });
            $(BR_VIEW).css({ borderColor: 'white', zIndex: 0 });
            $(view).css({ borderColor: 'black', zIndex: 1 });
        };
        this.setNodeSizeOrColor = function () {
            var sizeOrColor = $('#select-node-size-color').val();
            var attribute = $('#select-attribute').val();
            if (!sizeOrColor || !attribute)
                return;
            if (sizeOrColor == "node-size") {
                var scaleArray = _this.getNodeScaleArray(attribute);
                if (!scaleArray)
                    return;
                var minScale = Math.min.apply(Math, scaleArray);
                var maxScale = Math.max.apply(Math, scaleArray);
                // Rescale the node based on the the size bar max and min values
                var values = $("#div-node-size-slider")['bootstrapSlider']().data('bootstrapSlider').getValue();
                var scaleMap = d3.scale.linear().domain([minScale, maxScale]).range([values[0], values[1]]);
                var newScaleArray = scaleArray.map(function (value) { return scaleMap(value); });
                if (_this.applicationsInstances[0])
                    _this.applicationsInstances[0].setNodeSize(newScaleArray);
                if (_this.applicationsInstances[1])
                    _this.applicationsInstances[1].setNodeSize(newScaleArray);
                if (_this.applicationsInstances[2])
                    _this.applicationsInstances[2].setNodeSize(newScaleArray);
                if (_this.applicationsInstances[3])
                    _this.applicationsInstances[3].setNodeSize(newScaleArray);
                _this.saveFileObj.nodeSettings.nodeSizeMin = values[0];
                _this.saveFileObj.nodeSettings.nodeSizeMax = values[1];
                _this.saveFileObj.nodeSettings.nodeSizeAttribute = attribute;
            }
            else if (sizeOrColor == "node-color") {
                var nodeColorMode = $('#checkbox-node-color-continuous').is(":checked");
                //this can be null due to data mismatch
                if ((_this.referenceDataSet.attributes.info[attribute] != null) && (_this.referenceDataSet.attributes.info[attribute].isDiscrete && !nodeColorMode)) {
                    var keyArray = [];
                    var colorArray = [];
                    var keySelection = document.getElementById('select-node-key');
                    for (var i = 0; i < keySelection.length; i++) {
                        //var key = keySelection.options[i].value;
                        var key = parseInt(keySelection.options[i].value);
                        var color = keySelection.options[i].style.backgroundColor;
                        var hex = _this.colorToHex(color);
                        keyArray.push(key);
                        colorArray.push(hex);
                    }
                    _this.saveFileObj.nodeSettings.nodeColorMode = "discrete";
                    _this.saveFileObj.nodeSettings.nodeColorDiscrete = colorArray.slice(0);
                    if (_this.applicationsInstances[0])
                        _this.applicationsInstances[0].setNodeColorDiscrete(attribute, keyArray, colorArray);
                    if (_this.applicationsInstances[1])
                        _this.applicationsInstances[1].setNodeColorDiscrete(attribute, keyArray, colorArray);
                    if (_this.applicationsInstances[2])
                        _this.applicationsInstances[2].setNodeColorDiscrete(attribute, keyArray, colorArray);
                    if (_this.applicationsInstances[3])
                        _this.applicationsInstances[3].setNodeColorDiscrete(attribute, keyArray, colorArray);
                }
                else {
                    var minColor = $('#input-min-color').colorpicker("getValue");
                    var maxColor = $('#input-max-color').colorpicker("getValue");
                    if (_this.applicationsInstances[0])
                        _this.applicationsInstances[0].setNodeColor(attribute, minColor, maxColor);
                    if (_this.applicationsInstances[1])
                        _this.applicationsInstances[1].setNodeColor(attribute, minColor, maxColor);
                    if (_this.applicationsInstances[2])
                        _this.applicationsInstances[2].setNodeColor(attribute, minColor, maxColor);
                    if (_this.applicationsInstances[3])
                        _this.applicationsInstances[3].setNodeColor(attribute, minColor, maxColor);
                    _this.saveFileObj.nodeSettings.nodeColorMode = "continuous";
                    _this.saveFileObj.nodeSettings.nodeColorContinuousMin = minColor;
                    _this.saveFileObj.nodeSettings.nodeColorContinuousMax = maxColor;
                }
                _this.saveFileObj.nodeSettings.nodeColorAttribute = attribute;
                // Edge will also need updating if they are set to "node"
                if (_this.commonData.edgeColorMode === "node") {
                    _this.setEdgeColorByNode();
                }
            }
            else if (sizeOrColor == "node-default") {
                if (_this.applicationsInstances[0])
                    _this.applicationsInstances[0].setNodeDefaultSizeColor();
                if (_this.applicationsInstances[1])
                    _this.applicationsInstances[1].setNodeDefaultSizeColor();
                if (_this.applicationsInstances[2])
                    _this.applicationsInstances[2].setNodeDefaultSizeColor();
                if (_this.applicationsInstances[3])
                    _this.applicationsInstances[3].setNodeDefaultSizeColor();
                // Edge will also need updating if they are set to "node"
                if (_this.commonData.edgeColorMode === "node") {
                    _this.setEdgeColorByNode();
                }
            }
            _this.saveFileObj.nodeSettings.nodeSizeOrColor = sizeOrColor;
        };
        this.unique = function (sourceArray) {
            var arr = [];
            for (var i = 0; i < sourceArray.length; i++) {
                if (arr.indexOf(sourceArray[i]) == -1) {
                    arr.push(sourceArray[i]);
                }
            }
            return arr;
        };
        this.selectNodeSizeColorOnChange = function () {
            var value = $('#select-node-size-color').val();
            var attribute = $('#select-attribute').val();
            if (value == "node-default") {
                $('#select-attribute').prop("disabled", "disabled");
                $('#div-node-size').hide();
                $('#div-node-color-pickers').hide();
                $('#div-node-color-pickers-discrete').hide();
            }
            else if (value == "node-size") {
                $('#select-attribute').prop('disabled', false);
                $('#div-node-color-mode').hide();
                _this.setupNodeSizeRangeSlider(attribute);
            }
            else if (value == "node-color") {
                $('#select-attribute').prop('disabled', false);
                if (_this.referenceDataSet.attributes.info[attribute].isDiscrete) {
                    $('#div-node-color-mode').show();
                    _this.setupColorPickerDiscrete(attribute);
                }
                else {
                    $('#div-node-color-mode').hide();
                    _this.setupColorPicker();
                }
            }
            _this.setNodeSizeOrColor();
        };
        this.loadSettings = function () {
            if (!(_this.referenceDataSet && _this.referenceDataSet.attributes && _this.referenceDataSet.brainCoords && _this.referenceDataSet.simMatrix)) {
                CommonUtilities.launchAlertMessage(CommonUtilities.alertType.ERROR, "Dataset is required!");
                return;
            }
            var file = $('#input-select-load-file').get(0).files[0];
            var reader = new FileReader();
            reader.onload = function () {
                // Try new JSON settings file,
                // If not present, fall back to old YAML style
                try {
                    var jsonsettings = JSON.parse(reader.result);
                    _this.saveFileObj = new SaveFile(jsonsettings);
                }
                catch (exception) {
                    _this.saveFileObj = new SaveFile({});
                    _this.saveFileObj.fromYaml(reader.result.toLowerCase());
                }
                for (var i = 0; i < 4; i++) {
                    if (!jQuery.isEmptyObject(_this.saveFileObj.saveApps[i])
                        && _this.saveFileObj.saveApps[i].surfaceModel.length > 0) {
                        _this.initApp(i);
                        _this.initDataDependantUI();
                    }
                }
            };
            reader.readAsText(file);
        };
        this.saveSettings = function (filename) {
            //$('file-save-dialog').dialog("open");
            if (typeof filename !== 'string')
                filename = "brain-model-settings.txt";
            else if (filename.split('.').length == 1) { // check if a file extension was given
                filename = filename + '.txt';
            }
            var body = document.body;
            //Save all the applicationsInstances
            for (var i = 0; i < 4; i++) {
                var saveAppObject = _this.saveFileObj.saveApps[i];
                if (_this.applicationsInstances[i])
                    _this.applicationsInstances[i].save(saveAppObject);
            }
            /*
            var configText = this.saveFileObj.toYaml();
    
            var url = window["URL"].createObjectURL(new Blob([configText], { "type": "text\/xml" }));
            */
            var configText = JSON.stringify(_this.saveFileObj); //.toYaml();
            var url = window["URL"].createObjectURL(new Blob([configText], { "type": "application\/json" }));
            var a = document.createElement("a");
            body.appendChild(a);
            a.setAttribute("download", filename);
            a.setAttribute("href", url);
            a.style["display"] = "none";
            a.click();
            setTimeout(function () { return window["URL"].revokeObjectURL(url); }, 10);
        };
        this.exportSVG = function (viewport, fileType, resolution, filename, callback) {
            if (callback === void 0) { callback = null; }
            var documents = [window.document], SVGSources = [];
            // loop through all active app
            if (!_this.applicationsInstances[viewport])
                return;
            var styles = _this.getStyles(document);
            var canvas = _this.applicationsInstances[viewport].getDrawingCanvas();
            var origWidth = canvas.width;
            var origHeight = canvas.height;
<<<<<<< HEAD
            _this.applicationsInstances[viewport].resize(resolution.x, resolution.x / origWidth * origHeight, 'screenshotzoomstart');
=======
            _this.applicationsInstances[viewport].resize(resolution.x, resolution.y);
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
            var prevsvgtransform = _this.applicationsInstances[viewport].svgAllElements.attr("transform");
            if (prevsvgtransform != null) {
                var zoom = resolution.x / origWidth;
                var tx = 0;
                var ty = 0;
                var scale = 1;
                var str = prevsvgtransform.split('translate(')[1];
                str = str.split(')')[0];
                str = str.split(',');
                tx = parseFloat(str[0]) * zoom;
                ty = parseFloat(str[1]) * zoom;
                if (prevsvgtransform.indexOf('scale') > 0) {
                    var str_1 = prevsvgtransform.split('scale(')[1];
                    str_1 = str_1.split(')')[0];
                    scale = parseFloat(str_1);
                }
                scale *= zoom;
                var newtransform = 'translate(' + tx + ',' + ty + ')scale(' + scale + ')';
                _this.applicationsInstances[viewport].svgAllElements.attr("transform", newtransform);
            }
            // we need to let the browser render into the new sized canvas
            requestAnimationFrame(function () {
                var newSource = _this.getSource(viewport, styles);
                // Export all svg Graph on the page
                if (fileType === "svg") {
                    _this.downloadSVG(newSource, filename);
                }
                else if (fileType === "image") {
                    _this.downloadSVGImage(newSource, filename);
                }
                requestAnimationFrame(function () {
<<<<<<< HEAD
                    _this.applicationsInstances[viewport].resize(_this.applicationsInstances[viewport].jDiv.width(), _this.applicationsInstances[viewport].jDiv.height(), 'screenshotzoomend');
=======
                    _this.applicationsInstances[viewport].resize(_this.applicationsInstances[viewport].jDiv.width(), _this.applicationsInstances[viewport].jDiv.height());
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
                    if (prevsvgtransform != null)
                        _this.applicationsInstances[viewport].svgAllElements.attr("transform", prevsvgtransform);
                    if (callback)
                        callback();
                });
            });
        };
        this.getSource = function (id, styles) {
            var svgInfo = {};
            var svg;
            var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
            var prefix = {
                xmlns: "http://www.w3.org/2000/xmlns/",
                xlink: "http://www.w3.org/1999/xlink",
                svg: "http://www.w3.org/2000/svg"
            };
            var canvas = _this.applicationsInstances[id].getDrawingCanvas();
            var svgGraph = document.getElementById("svgGraph" + id);
            if (svgGraph.getAttribute("visibility") === "hidden") {
                // Not meant to be seen, use a new blank svg
                svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute('width', canvas.width);
                svg.setAttribute('height', canvas.height);
                svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
            }
            else {
                // Use as basis for combined svg
                svg = (document.getElementById("svgGraph" + id).cloneNode(true));
            }
            svg.setAttribute("version", "1.1");
            // insert 3D brain image
            // Remove old image if exists
            var oldImage = document.getElementById('brain3D' + id);
            if (oldImage)
                oldImage.parentNode.removeChild(oldImage);
            // 3D canvas
            var image = document.createElement("image");
            svg.insertBefore(image, svg.firstChild);
            image.setAttribute('y', '0');
            image.setAttribute('x', '0');
            image.setAttribute('id', 'brain3D' + id);
            image.setAttribute('xlink:href', canvas.toDataURL());
            image.setAttribute('width', canvas.width);
            image.setAttribute('height', canvas.height);
            image.removeAttribute('xmlns');
            // 2D canvas
            var canvas2d = $("#div-graph-".concat(id, " div.graph2dContainer canvas[data-id='layer2-node']")).get(0);
            if (canvas2d && (canvas2d.getAttribute("visibility") !== "hidden") && _this.applicationsInstances[0].canvasGraph.cy) {
                var image2d = document.createElement("image");
                var cy = _this.applicationsInstances[0].canvasGraph.cy;
                svg.insertBefore(image2d, svg.firstChild);
                image2d.setAttribute('crossOrigin', 'anonymous');
                image2d.setAttribute('y', '0');
                image2d.setAttribute('x', '0');
                image2d.setAttribute('id', 'brain2D' + id);
                image2d.setAttribute('xlink:href', _this.applicationsInstances[0].canvasGraph.cy.png({
                    full: false
                }));
                image2d.setAttribute('width', cy._private.sizeCache.width);
                image2d.setAttribute('height', cy._private.sizeCache.height);
                image2d.removeAttribute('xmlns');
                if (cy._private.sizeCache.width > svg.getAttribute('width')) {
                    svg.setAttribute('width', cy._private.sizeCache.width);
                    svg.setAttribute('height', cy._private.sizeCache.height);
                }
            }
            // insert defs
            var defsEl = document.createElement("defs");
            svg.insertBefore(defsEl, svg.firstChild); //TODO   .insert("defs", ":first-child")
            defsEl.setAttribute("class", "svg-crowbar");
            // insert styles to defs
            var styleEl = document.createElement("style");
            defsEl.appendChild(styleEl);
            styleEl.setAttribute("type", "text/css");
            // removing attributes so they aren't doubled up
            svg.removeAttribute("xmlns");
            svg.removeAttribute("xlink");
            // These are needed for the svg
            if (!svg.hasAttributeNS(prefix.xmlns, "xmlns:xlink")) {
                svg.setAttributeNS(prefix.xmlns, "xmlns:xlink", prefix.xlink);
            }
            var source = (new XMLSerializer()).serializeToString(svg).replace('</style>', '<![CDATA[' + styles + ']]></style>')
                .replace(/xmlns\=\"http\:\/\/www\.w3\.org\/1999\/xhtml\"/g, '');
            // Convert RGBA to RGB (for old Illustartor)
            source = source.replace(/rgba\((.+?)\, (.+?)\, (.+?)\,.+?\)/g, function (rgbaText) {
                var vals = /rgba\((.+?)\, (.+?)\, (.+?)\,.+?\)/i.exec(rgbaText);
                return "rgb(" + vals[1] + "," + vals[2] + "," + vals[3] + ")";
            });
            svgInfo = {
                id: svg.getAttribute("id"),
                childElementCount: svg.childElementCount,
                source: [doctype + source]
            };
            return svgInfo;
        };
        this.downloadSVG = function (source, filename) {
            if (filename == null)
                filename = window.document.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
            var body = document.body;
            var url = window["URL"].createObjectURL(new Blob(source.source, { "type": "text\/xml" }));
            var a = document.createElement("a");
            body.appendChild(a);
            a.setAttribute("class", "svg-crowbar");
            a.setAttribute("download", filename + ".svg");
            a.setAttribute("href", url);
            a.style["display"] = "none";
            a.click();
            setTimeout(function () { return window["URL"].revokeObjectURL(url); }, 10);
        };
        this.downloadSVGImage = function (source, filename) {
            if (filename == null)
                filename = window.document.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
            // Adapted from https://bl.ocks.org/biovisualize/8187844
            var image = new Image();
            var svgBlob = new Blob(source.source, { type: "image/svg+xml;charset=utf-8" });
            var canvas = document.createElement('canvas');
            image.onload = function () {
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                var context = canvas.getContext('2d');
                context.fillStyle = "#ffffff";
                context.fillRect(0, 0, image.width, image.height);
                context.drawImage(image, 0, 0);
                // Visual Studio complains about wrong method signature
                canvas.toBlob(function (blob) {
                    var objUrl = URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    a.setAttribute("download", filename + ".png");
                    a.setAttribute("href", objUrl);
                    a.click();
                    setTimeout(function () { window["URL"].revokeObjectURL(objUrl), 10; });
                    setTimeout(function () { window["URL"].revokeObjectURL(image.src); }, 10);
                });
            };
            image.src = URL.createObjectURL(svgBlob);
        };
        this.getStyles = function (doc) {
            var styles = "", styleSheets = doc.styleSheets;
            if (styleSheets) {
                for (var i = 0; i < styleSheets.length; i++) {
                    processStyleSheet(styleSheets[i]);
                }
            }
            function processStyleSheet(ss) {
                if (ss.cssRules) {
                    for (var i = 0; i < ss.cssRules.length; i++) {
                        var rule = ss.cssRules[i];
                        if (rule.type === 3) {
                            // Import Rule
                            processStyleSheet(rule.styleSheet);
                        }
                        else {
                            // hack for illustrator crashing on descendent selectors
                            if (rule.selectorText) {
                                if (rule.selectorText.indexOf(">") === -1) {
                                    styles += "\n" + rule.cssText;
                                }
                            }
                        }
                    }
                }
            }
            return styles;
        };
        this.colorToHex = function (color) {
            if (color.substr(0, 1) === '#') {
                return color;
            }
            var digits = /rgb\((\d+), (\d+), (\d+)\)/.exec(color);
            var red = parseInt(digits[1]);
            var green = parseInt(digits[2]);
            var blue = parseInt(digits[3]);
            var hexRed = red.toString(16);
            var hexGreen = green.toString(16);
            var hexBlue = blue.toString(16);
            if (hexRed.length == 1)
                hexRed = "0" + hexRed;
            if (hexGreen.length == 1)
                hexGreen = "0" + hexGreen;
            if (hexBlue.length == 1)
                hexBlue = "0" + hexBlue;
            return '#' + hexRed + hexGreen + hexBlue;
        };
        this.getNodeScaleArray = function (attribute) {
            var attrArray = _this.referenceDataSet.attributes.get(attribute);
            var columnIndex = _this.referenceDataSet.attributes.columnNames.indexOf(attribute);
            // assume all positive numbers in the array
            var min = _this.referenceDataSet.attributes.getMin(columnIndex);
            var max = _this.referenceDataSet.attributes.getMax(columnIndex);
            var scaleArray;
            var scaleFactor = 1;
            //this can be null due to data mismatch
            if (attrArray != null) {
                scaleArray = attrArray.map(function (value) { return scaleFactor * value[0]; });
            }
            return scaleArray;
        };
        this.setupNodeSizeRangeSlider = function (attribute) {
            $('#div-node-color-pickers').hide();
            $('#div-node-color-pickers-discrete').hide();
            $("#div-node-size").show();
            var scaleArray = _this.getNodeScaleArray(attribute);
            if (!scaleArray)
                return;
            var minScale = _this.saveFileObj.nodeSettings.nodeSizeMin || Math.min.apply(Math, scaleArray);
            var maxScale = _this.saveFileObj.nodeSettings.nodeSizeMax || Math.max.apply(Math, scaleArray);
            var slider = $("#div-node-size-slider")['bootstrapSlider']({
                range: true,
                min: 0.1,
                max: 10,
                step: 0.1,
                value: [minScale, maxScale]
            });
            slider.on("slide", function () {
                var values = $("#div-node-size-slider")['bootstrapSlider']().data('bootstrapSlider').getValue();
                $("#label_node_size_range").text(values[0] + " - " + values[1]);
                _this.setNodeSizeOrColor();
            });
            $("#label_node_size_range").text(minScale + " - " + maxScale);
        };
        this.setupColorPicker = function () {
            $('#div-node-size').hide();
            $('#div-node-color-pickers-discrete').hide();
            $('#div-node-color-pickers').show();
        };
        this.setupColorPickerDiscrete = function (attribute) {
            $('#div-node-size').hide();
            $('#div-node-color-pickers').hide();
            $('#div-node-color-pickers-discrete').show();
            var attrArray = _this.referenceDataSet.attributes.get(attribute);
            var uniqueKeys = _this.referenceDataSet.attributes.info[attribute].distinctValues;
            var d3ColorSelector = d3.scale.category20();
            var uniqueColors = uniqueKeys.map(function (group) { return d3ColorSelector(group); });
            $('#select-node-key').empty();
            for (var i = 0; i < uniqueKeys.length; i++) {
                var option = document.createElement('option');
                option.text = uniqueKeys[i];
                option.value = uniqueKeys[i];
                option.style.backgroundColor = uniqueColors[i];
                $('#select-node-key').append(option);
            }
            $("#input-node-color").colorpicker("setValue", uniqueColors[0]);
        };
        // Find which view is currently located under the mouse
        this.getViewUnderMouse = function (x, y) {
            var $view = $(TL_VIEW);
            var innerViewLeft = $view.offset().left;
            if (x < innerViewLeft)
                return "";
            x -= innerViewLeft;
            if (y < $view.height()) {
                if (x < $view.width()) {
                    return TL_VIEW;
                }
                else {
                    return TR_VIEW;
                }
            }
            else {
                if (x < $view.width()) {
                    return BL_VIEW;
                }
                else {
                    return BR_VIEW;
                }
            }
        };
        this.getActiveTargetUnderMouse = function (x, y) {
            var view = _this.getViewUnderMouse(x, y);
            return _this.viewToId(view);
        };
        this.setNodeColorInContextMenu = function (color) {
            if (color.length === 6)
                color = "#" + color;
            if (_this.applicationsInstances[_this.input.activeTarget]) {
                if ((_this.input.rightClickLabelAppended) && (_this.input.selectedNodeID >= 0)) {
                    _this.applicationsInstances[_this.input.activeTarget].setANodeColor(_this.input.selectedNodeID, color);
                    _this.input.contextMenuColorChanged = true;
                }
            }
        };
        this.highlightSelectedNodes = function () {
            if (!_this.referenceDataSet || !_this.referenceDataSet.attributes)
                return;
            if (_this.referenceDataSet.attributes.filteredRecordsHighlightChanged) {
                _this.referenceDataSet.attributes.filteredRecordsHighlightChanged = false;
                if (!_this.referenceDataSet.attributes.filteredRecords)
                    return;
                var fRecords = _this.referenceDataSet.attributes.filteredRecords;
                var idArray = new Array();
                // if all the nodes have been selected, cancel the highlight
                if (fRecords.length < _this.referenceDataSet.attributes.numRecords) {
                    for (var i = 0; i < fRecords.length; ++i) {
                        var id = fRecords[i]["index"];
                        idArray.push(id);
                    }
                }
                _this.applicationsInstances.forEach(function (app) {
                    app.highlightSelectedNodes(idArray);
                    app.needUpdate = true;
                });
            }
        };
        this.setBrainMode = function (brainMode, view) {
            switch (view) {
                case TL_VIEW:
                    _this.applicationsInstances[0].brainSurfaceMode = brainMode;
                    break;
                case TR_VIEW:
                    _this.applicationsInstances[1].brainSurfaceMode = brainMode;
                    break;
                case BL_VIEW:
                    _this.applicationsInstances[2].brainSurfaceMode = brainMode;
                    break;
                case BR_VIEW:
                    _this.applicationsInstances[3].brainSurfaceMode = brainMode;
                    break;
            }
        };
        this.viewToId = function (view) {
            switch (view) {
                case TL_VIEW: return 0;
                case TR_VIEW: return 1;
                case BL_VIEW: return 2;
                case BR_VIEW: return 3;
                default: return -1;
            }
        };
        this.setBrainModel = function (view, model) {
            var id = _this.viewToId(view);
            _this.loadBrainModel(model, function (object) {
                _this.applicationsInstances[id].setBrainModelObject(object);
            });
        };
        this.createBrainView = function (viewType, model, finalCallback, source, brainSurfaceMode) {
            // source is "example", "empty", or "save" (default)
            // each view name has a dedicated Id
            var viewTypeId = _this.viewToId(viewType);
            _this.loadBrainModel(model, function (object) {
                $(viewType).empty();
                /**
                 * Local function top create new instance of the brainapp
                 */
                var makeBrain = function () {
                    _this.applicationsInstances[viewTypeId] = new Brain3DApp({
                        id: viewTypeId,
                        jDiv: $(viewType),
                        brainModelOrigin: object,
                        brainSurfaceMode: brainSurfaceMode
                    }, _this.commonData, _this.input.newTarget(viewTypeId), _this.saveFileObj);
                    // TODO: CHECK if following line is really not necessary
                    // TODOL it's actually been called in the setDataset method
                    //this.applicationsInstances[viewTypeId].setDataSet(this.referenceDataSet);
                    _this.setDataset(viewType);
                    _this.initApp(viewTypeId);
                    if (finalCallback)
                        finalCallback();
                };
                var save = _this.saveFileObj.saveApps[viewTypeId] = (_this.saveFileObj && _this.saveFileObj.saveApps[viewTypeId]) || new SaveApp({}); // create a new instance (if an old instance exists)
                save.surfaceModel = model;
                save.view = viewType;
                $('#button-save-app').button({ disabled: false });
                // Load dataset into the webapp
                if (source === "empty") {
                    makeBrain();
                    CommonUtilities.launchAlertMessage(CommonUtilities.alertType.SUCCESS, "Empty dataset is loaded.");
                }
                else if (_this.saveFileObj.useExampleData()) {
                    _this.loadExampleData(function () {
                        makeBrain();
                        CommonUtilities.launchAlertMessage(CommonUtilities.alertType.SUCCESS, "Default example dataset is loaded.");
                    });
                }
                else {
                    _this.loadUploadedData(_this.saveFileObj, function () {
                        makeBrain();
                        CommonUtilities.launchAlertMessage(CommonUtilities.alertType.SUCCESS, "Uploaded dataset is loaded.");
                    }, source);
                }
            });
        };
        this.setDataset = function (view) {
            var id = _this.viewToId(view);
            if (!_this.referenceDataSet) {
                // Get a dataset from the default example
                _this.loadExampleData(function () { return _this.applicationsInstances[id].setDataSet(_this.referenceDataSet); });
            }
            else {
                _this.applicationsInstances[id].setDataSet(_this.referenceDataSet);
            }
        };
        this.setEdgeDirection = function () {
            var value = $('#select-edge-direction').val();
            _this.saveFileObj.edgeSettings.directionMode = value;
            if (value === "gradient") {
                $("#div-edge-gradient-color-pickers").show();
            }
            else {
                $("#div-edge-gradient-color-pickers").hide();
            }
            if (_this.applicationsInstances[0])
                _this.applicationsInstances[0].setEdgeDirection(value);
            if (_this.applicationsInstances[1])
                _this.applicationsInstances[1].setEdgeDirection(value);
            if (_this.applicationsInstances[2])
                _this.applicationsInstances[2].setEdgeDirection(value);
            if (_this.applicationsInstances[3])
                _this.applicationsInstances[3].setEdgeDirection(value);
        };
        this.setEdgeColor = function () {
            var value = $('#select-edge-color').val();
            if (value === "none") {
                _this.setEdgeNoColor();
                _this.commonData.edgeColorMode = "none";
                $("#div-edge-color-pickers").hide();
                $("#div-edge-color-by-node-picker").hide();
            }
            else if (value === "weight") {
                _this.commonData.edgeColorMode = "weight";
                $("#div-edge-color-pickers").show();
                $("#div-edge-color-by-node-picker").hide();
                // check if discrete for all applicationsInstances
                CommonUtilities.launchAlertMessage(CommonUtilities.alertType.WARNING, "Current version of application assumes all view port shares the same dataset");
                if (_this.referenceDataSet.info.edgeWeight.type === "continuous" || _this.commonData.edgeForceContinuous) {
                    if (_this.referenceDataSet.info.edgeWeight.type === "continuous") {
                        $("#checkbox-edge-color-force-continuous").hide();
                    }
                    $("#div-edge-color-continuous").show();
                    $("#div-edge-color-discrete").hide();
                    if ($("#checkbox-edge-color-discretized").is(":checked")) {
                        _this.commonData.edgeWeightColorMode = "continuous-discretized";
                        _this.setDefaultEdgeDiscretizedValues();
                        $("#div-edge-color-continuous-discretized").show();
                        $("#div-edge-color-continuous-normal").hide();
                        var numCategory = Number($('#select-edge-color-number-discretized-category').val());
                        for (var i = 0; i < 5; i++) {
                            if (i < numCategory) {
                                $('#div-edge-discretized-' + i).show();
                            }
                            else {
                                $('#div-edge-discretized-' + i).hide();
                            }
                        }
                    }
                    else {
                        _this.commonData.edgeWeightColorMode = "continuous-normal";
                        $("#div-edge-color-continuous-discretized").hide();
                        $("#div-edge-color-continuous-normal").show();
                    }
                }
                else if (_this.referenceDataSet.info.edgeWeight.type === "discrete") {
                    // Enable force continuous checkbox
                    $("#checkbox-edge-color-force-continuous").show();
                    _this.commonData.edgeWeightColorMode = "discrete";
                    $("#div-edge-color-continuous").hide();
                    $("#div-edge-color-discrete").show();
                    var distinctValues = _this.referenceDataSet.info.edgeWeight.distincts;
                    distinctValues.sort(function (a, b) { return a - b; });
                    var d3ColorSelector = d3.scale.category20();
                    var distinctColors = distinctValues.map(function (group) { return d3ColorSelector(group); });
                    $('#select-edge-key').empty();
                    for (var i = 0; i < distinctValues.length; i++) {
                        var option = document.createElement('option');
                        option.text = distinctValues[i];
                        option.value = distinctValues[i];
                        option.style.backgroundColor = distinctColors[i];
                        if (i == 0) {
                            var color = option.style.backgroundColor;
                            var hex = _this.colorToHex(color);
                            document.getElementById('input-edge-color').color.fromString(hex.substring(1));
                        }
                        $('#select-edge-key').append(option);
                    }
                }
                _this.setEdgeColorByWeight();
            }
            else if (value === "node") {
                _this.commonData.edgeColorMode = "node";
                _this.setEdgeColorByNode();
                $("#div-edge-color-pickers").hide();
                $("#div-edge-color-by-node-picker").show();
            }
        };
        this.setSurfaceOpacity = function () {
            var opacity = $("#div-surface-opacity-slider")['bootstrapSlider']().data('bootstrapSlider').getValue();
            _this.saveFileObj.surfaceSettings.opacity = opacity;
            for (var _i = 0, _a = _this.applicationsInstances; _i < _a.length; _i++) {
                var curAppInstance = _a[_i];
                if (curAppInstance != null)
                    curAppInstance.setSurfaceOpacity(opacity);
            }
            /*
            if (this.applicationsInstances[0]) this.applicationsInstances[0].setSurfaceOpacity(opacity);
            if (this.applicationsInstances[1]) this.applicationsInstances[1].setSurfaceOpacity(opacity);
            if (this.applicationsInstances[2]) this.applicationsInstances[2].setSurfaceOpacity(opacity);
            if (this.applicationsInstances[3]) this.applicationsInstances[3].setSurfaceOpacity(opacity);
            */
        };
        this.setEdgeSize = function () {
            var edgeSize = $("#div-edge-size-slider")['bootstrapSlider']().data('bootstrapSlider').getValue();
            _this.saveFileObj.edgeSettings.size = edgeSize;
            for (var _i = 0, _a = _this.applicationsInstances; _i < _a.length; _i++) {
                var curAppInstance = _a[_i];
                if (curAppInstance != null)
                    curAppInstance.setEdgeSize(edgeSize);
            }
            /*
            if (this.applicationsInstances[0]) this.applicationsInstances[0].setEdgeSize(edgeSize);
            if (this.applicationsInstances[1]) this.applicationsInstances[1].setEdgeSize(edgeSize);
            if (this.applicationsInstances[2]) this.applicationsInstances[2].setEdgeSize(edgeSize);
            if (this.applicationsInstances[3]) this.applicationsInstances[3].setEdgeSize(edgeSize);
            */
        };
        this.setEdgeThicknessByWeight = function () {
            var isThicknessByWeight = $('#checkbox-thickness-by-weight').is(":checked");
            _this.saveFileObj.edgeSettings.thicknessByWeight = isThicknessByWeight;
            for (var _i = 0, _a = _this.applicationsInstances; _i < _a.length; _i++) {
                var curAppInstance = _a[_i];
                if (curAppInstance != null)
                    curAppInstance.setEdgeThicknessByWeight(isThicknessByWeight);
            }
        };
        // Resizes the views such that the crossroads is located at (x, y) on the screen
        this.setViewCrossroads = function (x, y) {
            var viewWidth = $('#view-panel').width();
            var viewHeight = $('#view-panel').height();
            var lw = x - 1;
            var rw = viewWidth - x - 1;
            var th = y - 1;
            var bh = viewHeight - y - 1;
            $(TL_VIEW).css({ width: lw, height: th });
            $(TR_VIEW).css({ width: rw, height: th });
            $(BL_VIEW).css({ width: lw, height: bh });
            $(BR_VIEW).css({ width: rw, height: bh });
            // Make callbacks to the application windows
            if (_this.applicationsInstances[0])
<<<<<<< HEAD
                _this.applicationsInstances[0].resize(lw, th, 'resize');
            if (_this.applicationsInstances[1])
                _this.applicationsInstances[1].resize(rw, th, 'resize');
            if (_this.applicationsInstances[2])
                _this.applicationsInstances[2].resize(lw, bh, 'resize');
            if (_this.applicationsInstances[3])
                _this.applicationsInstances[3].resize(rw, bh, 'resize');
=======
                _this.applicationsInstances[0].resize(lw, th);
            if (_this.applicationsInstances[1])
                _this.applicationsInstances[1].resize(rw, th);
            if (_this.applicationsInstances[2])
                _this.applicationsInstances[2].resize(lw, bh);
            if (_this.applicationsInstances[3])
                _this.applicationsInstances[3].resize(rw, bh);
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        };
        // Load the physiological coordinates of each node in the brain
        this.loadCoordinates = function (file) {
            var reader = new FileReader();
            reader.onload = function () {
                _this.parseCoordinates(reader.result);
                _this.commonData.notifyCoords();
            };
            reader.readAsText(file);
        };
        this.parseCoordinates = function (text) {
            // For some reason the text file uses a carriage return to separate coordinates (ARGGgggh!!!!)
            //var lines = text.split(String.fromCharCode(13));
            var lines = text.replace(/\t|\,/g, ' ').trim().split(/\r\n|\r|\n/g).map(function (s) { return s.trim(); });
            // check the last line:
            var lastline = lines[lines.length - 1].trim();
            if (lastline.length == 0) {
                lines.splice(lines.length - 1, 1); // remove last line
            }
            // Check if first line contains labels
            var firstWords = lines[0].split(' ');
            if (isNaN(Number(firstWords[0])) || isNaN(Number(firstWords[1])) || isNaN(Number(firstWords[2]))) {
                console.log("In Coordinate File: detect labels in the first line");
                lines.shift(); // remove if the first line is just labels
            }
            var len = lines.length;
            _this.referenceDataSet.brainCoords = [Array(len), Array(len), Array(len)];
            _this.referenceDataSet.info.nodeCount = len;
            for (var i = 0; i < len; ++i) {
                var words = lines[i].split(' ');
                // Translate the coords into Cola's format
                _this.referenceDataSet.brainCoords[0][i] = parseFloat(words[0]);
                _this.referenceDataSet.brainCoords[1][i] = parseFloat(words[1]);
                _this.referenceDataSet.brainCoords[2][i] = parseFloat(words[2]);
            }
            //this.commonData.notifyCoords();
        };
        // Load the labels
        this.loadLabels = function (file) {
            var reader = new FileReader();
            reader.onload = function () {
                _this.parseLabels(reader.result);
                _this.commonData.notifyLabels();
            };
            reader.readAsText(file);
        };
        this.parseLabels = function (text) {
<<<<<<< HEAD
            _this.referenceDataSet.brainLabels = text.replace(/\t|\n|\r/g, ' ').trim().split(/\s+/).map(function (s) { return s.trim(); });
            //this.commonData.notifyLabels();
        };
        this.initSurfaceSettings = function () {
            if (_this.saveFileObj.surfaceSettings.color) {
                $("#input-surface-color").colorpicker("setValue", _this.saveFileObj.surfaceSettings.color);
                _this.setBrainSurfaceColor(_this.saveFileObj.surfaceSettings.color);
            }
=======
            _this.referenceDataSet.brainLabels = text.replace(/\t|\n|\r/g, ' ').trim().split(' ').map(function (s) { return s.trim(); });
            //this.commonData.notifyLabels();
        };
        this.initSurfaceSettings = function () {
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
            if (_this.saveFileObj.surfaceSettings.opacity) {
                $("#div-surface-opacity-slider")['bootstrapSlider']().data('bootstrapSlider').setValue(_this.saveFileObj.surfaceSettings.opacity);
                _this.setSurfaceOpacity();
            }
<<<<<<< HEAD
            if (_this.saveFileObj.surfaceSettings.rotation) {
                _this.setBrainSurfaceRotation(_this.saveFileObj.surfaceSettings.rotation);
            }
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        };
        /**
            inits the UI elements found in 'Edge Attributes' tab with values from the saveFileObject
            and triggers the drawing processes depending on those attributes
        */
        this.initEdgeSizeAndColor = function () {
            //
            // Go through the order as UI elements appear in tab
            //
            // Edge size
            if (_this.saveFileObj.edgeSettings.size != null) {
                var slider = $("#div-edge-size-slider");
                var bootstrapslider = slider['bootstrapSlider']();
                var edgeSizeSliderData = $("#div-edge-size-slider")['bootstrapSlider']().data('bootstrapSlider');
                edgeSizeSliderData.setValue(_this.saveFileObj.edgeSettings.size);
                _this.setEdgeSize();
            }
            // Edge thickness by weight
            if (_this.saveFileObj.edgeSettings.thicknessByWeight != null) {
                var checkbox = $('#checkbox-thickness-by-weight');
                checkbox.prop('checked', _this.saveFileObj.edgeSettings.thicknessByWeight);
                _this.setEdgeThicknessByWeight();
            }
            // Set Edge Direction and Gradient Colors
            if (_this.saveFileObj.edgeSettings.directionMode != null) {
                var listedgedir = $('#select-edge-direction');
                listedgedir.val(_this.saveFileObj.edgeSettings.directionMode);
                if (_this.saveFileObj.edgeSettings.directionStartColor != null) {
                    $('#input-edge-start-color').colorpicker("setValue", _this.saveFileObj.edgeSettings.directionStartColor);
                    $('#input-edge-end-color').colorpicker("setValue", _this.saveFileObj.edgeSettings.directionEndColor);
                }
                // this will call edge-direction method in app-instance 
                // and that will also 
                // * set the gradient colors if present
                // * make the colorchooser visible
                _this.setEdgeDirection();
            }
            if (_this.saveFileObj.edgeSettings.colorBy === "none") {
                $('#select-edge-color').val("none");
                _this.setEdgeColor();
            }
            else if (_this.saveFileObj.edgeSettings.colorBy === "node") {
                $('#select-edge-color').val("node");
                _this.setEdgeColor();
            }
            else if (_this.saveFileObj.edgeSettings.colorBy === "weight") {
                $('#select-edge-color').val("weight");
                if (_this.saveFileObj.edgeSettings.weight.type === "continuous-discretized") {
                    $('#checkbox-edge-color-discretized').prop('checked', true);
                }
                // make all corresponding elements visible
                if (_this.saveFileObj.edgeSettings.weight.type === "discrete") {
                    var setting = _this.saveFileObj.edgeSettings.weight.discreteSetting;
                    var keySelection = document.getElementById('select-edge-key');
                    for (var i = 0; i < setting.valueArray; i++) {
                        keySelection.options[i].style.backgroundColor = setting.colorArray[i];
                    }
                }
                else if (_this.saveFileObj.edgeSettings.weight.type === "continuous-normal") {
                    var setting = _this.saveFileObj.edgeSettings.weight.continuousSetting;
                    $('#input-edge-min-color').colorpicker("setValue", setting.minColor);
                    $('#input-edge-max-color').colorpicker("setValue", setting.maxColor);
                }
                else if (_this.saveFileObj.edgeSettings.weight.type === "continuous-discretized") {
                    var setting = _this.saveFileObj.edgeSettings.weight.discretizedSetting;
                    $('#select-edge-color-number-discretized-category').val(setting.numCategory);
                    for (var i = 0; i < 5; i++) {
                        if (i < setting.numCategory) {
                            $('#div-edge-discretized-' + i).show();
                        }
                        else {
                            $('#div-edge-discretized-' + i).hide();
                        }
                    }
                    $('#input-edge-discretized-' + 0 + '-from').val(setting.domainArray[0]);
                    $('#input-edge-discretized-' + (setting.numCategory - 1) + '-to')
                        .val(setting.domainArray[setting.domainArray.length - 1]);
                    for (var i = 0; i < setting.numCategory - 1; i++) {
                        var value = setting.domainArray[i + 1];
                        $('#input-edge-discretized-' + (i + 1) + '-from').val(value);
                        $('#input-edge-discretized-' + i + '-to').val(value);
                    }
                    for (var i = 0; i < setting.numCategory; i++) {
                        $('#input-edge-discretized-' + i + '-color').colorpicker("setValue", setting.colorArray[i]);
                    }
                }
                else {
                    throw "Load Data: Wrong data type setting for weight";
                }
                _this.setEdgeColor();
            }
            // Set inter-cluster edge coloring
            if (_this.saveFileObj.edgeSettings.edgeColorByNodeTransition != null) {
                if (_this.saveFileObj.edgeSettings.edgeColorByNodeTransitionColor) {
                    $("#input-edge-transitional-color").colorpicker("setValue", _this.saveFileObj.edgeSettings.edgeColorByNodeTransitionColor);
                    _this.setEdgeTransitionColor(_this.saveFileObj.edgeSettings.edgeColorByNodeTransitionColor);
                }
                var checkbox = $('#checkbox-color-transitional-edges');
                checkbox.prop('checked', _this.saveFileObj.edgeSettings.edgeColorByNodeTransition);
                _this.setUseTransitionColor(_this.saveFileObj.edgeSettings.edgeColorByNodeTransition);
            }
        };
        this.initNodeSize = function () {
            if (_this.saveFileObj.nodeSettings.nodeSizeAttribute) {
                $('#select-node-size-color').val("node-size");
                $('#select-attribute').val(_this.saveFileObj.nodeSettings.nodeSizeAttribute);
                $("#div-node-size-slider")['bootstrapSlider']().data('bootstrapSlider').setValue([_this.saveFileObj.nodeSettings.nodeSizeMin, _this.saveFileObj.nodeSettings.nodeSizeMax]);
                $("#label_node_size_range").text(_this.saveFileObj.nodeSettings.nodeSizeMin + " - " + _this.saveFileObj.nodeSettings.nodeSizeMax);
                _this.selectNodeSizeColorOnChange();
            }
        };
        this.initNodeColor = function () {
            if (_this.saveFileObj.nodeSettings.nodeColorAttribute) {
                $('#select-node-size-color').val("node-color");
                $('#select-attribute').val(_this.saveFileObj.nodeSettings.nodeColorAttribute);
                if (_this.referenceDataSet.attributes.info[_this.saveFileObj.nodeSettings.nodeColorAttribute].isDiscrete) {
                    var keySelection = document.getElementById('select-node-key');
                    for (var i = 0; i < keySelection.length; i++) {
                        keySelection.options[i].style.backgroundColor = _this.saveFileObj.nodeSettings.nodeColorDiscrete[i];
                    }
                    $("#input-node-color").colorpicker("setValue", _this.saveFileObj.nodeSettings.nodeColorDiscrete[0]);
                }
                else {
                    // Due to callback triggered when setting color, we need to temprarily save the values
                    // or they get reset with the standard value from the color picker
                    var tmpMin = _this.saveFileObj.nodeSettings.nodeColorContinuousMin;
                    var tmpMax = _this.saveFileObj.nodeSettings.nodeColorContinuousMax;
                    $("#input-min-color").colorpicker("setValue", tmpMin);
                    $("#input-max-color").colorpicker("setValue", tmpMax);
                    _this.saveFileObj.nodeSettings.nodeColorContinuousMin = tmpMin;
                    _this.saveFileObj.nodeSettings.nodeColorContinuousMax = tmpMax;
                }
                _this.selectNodeSizeColorOnChange();
            }
        };
        this.showLoadingNotification = function () {
            //$('body').css({ cursor: 'wait' });
            document.body.appendChild(_this.divLoadingNotification);
            $('#div-loading-notification').empty(); // empty this.rightClickLabel
            _this.divLoadingNotification.style.position = 'absolute';
            _this.divLoadingNotification.style.left = '50%';
            _this.divLoadingNotification.style.top = '50%';
            _this.divLoadingNotification.style.padding = '5px';
            _this.divLoadingNotification.style.borderRadius = '2px';
            _this.divLoadingNotification.style.zIndex = '1';
            _this.divLoadingNotification.style.backgroundColor = '#feeebd'; // the color of the control panel
            var text = document.createElement('div');
            text.innerHTML = "Loading...";
            _this.divLoadingNotification.appendChild(text);
        };
        this.removeLoadingNotification = function () {
            if ($('#div-loading-notification').length > 0)
                document.body.removeChild(_this.divLoadingNotification);
        };
        // Load the brain surface (hardcoded - it is not simple to load geometry from the local machine, but this has not been deeply explored yet).
        // NOTE: The loaded model cannot be used in more than one WebGL context (scene) at a time - the geometry and materials must be .cloned() into
        // new THREE.Mesh() objects by the application wishing to use the model.
        this.loadBrainModel = function (model, callback) {
            var file = (model === 'ch2') && 'BrainMesh_Ch2withCerebellum.obj'
<<<<<<< HEAD
                || (model === 'ch2nocerebellum') && 'BrainMesh_Ch2.obj'
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
                || (model === 'icbm') && 'BrainMesh_ICBM152.obj';
            if (!file) {
                callback();
                return;
            }
            _this.loader.load('examples/graphdata/' + file, function (object) {
                if (!object) {
                    CommonUtilities.launchAlertMessage(CommonUtilities.alertType.ERROR, "Failed to load brain surface.");
                    return;
                }
                callback(object);
            });
        };
<<<<<<< HEAD
        this.setBrainSurfaceRotation = function (quat) {
            if (_this.applicationsInstances[0])
                _this.applicationsInstances[0].setSurfaceRotation(quat);
            if (_this.applicationsInstances[1])
                _this.applicationsInstances[1].setSurfaceRotation(quat);
            if (_this.applicationsInstances[2])
                _this.applicationsInstances[2].setSurfaceRotation(quat);
            if (_this.applicationsInstances[3])
                _this.applicationsInstances[3].setSurfaceRotation(quat);
        };
=======
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        this.setBrainSurfaceColor = function (color) {
            _this.saveFileObj.surfaceSettings.color = color;
            if (_this.applicationsInstances[0])
                _this.applicationsInstances[0].setSurfaceColor(color);
            if (_this.applicationsInstances[1])
                _this.applicationsInstances[1].setSurfaceColor(color);
            if (_this.applicationsInstances[2])
                _this.applicationsInstances[2].setSurfaceColor(color);
            if (_this.applicationsInstances[3])
                _this.applicationsInstances[3].setSurfaceColor(color);
        };
        this.setEdgeTransitionColor = function (color) {
            _this.saveFileObj.edgeSettings.edgeColorByNodeTransitionColor = color;
            if (_this.applicationsInstances[0])
                _this.applicationsInstances[0].setEdgeTransitionColor(color);
            if (_this.applicationsInstances[1])
                _this.applicationsInstances[1].setEdgeTransitionColor(color);
            if (_this.applicationsInstances[2])
                _this.applicationsInstances[2].setEdgeTransitionColor(color);
            if (_this.applicationsInstances[3])
                _this.applicationsInstances[3].setEdgeTransitionColor(color);
        };
        this.setUseTransitionColor = function (useColor) {
            _this.saveFileObj.edgeSettings.edgeColorByNodeTransition = useColor;
            if (_this.applicationsInstances[0])
                _this.applicationsInstances[0].setUseTransitionColor(useColor);
            if (_this.applicationsInstances[1])
                _this.applicationsInstances[1].setUseTransitionColor(useColor);
            if (_this.applicationsInstances[2])
                _this.applicationsInstances[2].setUseTransitionColor(useColor);
            if (_this.applicationsInstances[3])
                _this.applicationsInstances[3].setUseTransitionColor(useColor);
        };
        // Load the similarity matrix for the specified dataSet
        //TODO: Move into DataSet class
        this.loadSimilarityMatrix = function (file, dataSet, callback) {
            var reader = new FileReader();
            reader.onload = function () {
                _this.parseSimilarityMatrix(reader.result, dataSet);
                if (callback)
                    callback();
            };
            reader.readAsText(file);
        };
        this.parseSimilarityMatrix = function (text, dataSet) {
            //TODO: Move into DataSet class
            var lines = text.replace(/\t|\,/g, ' ').trim().split(/\r\n|\r|\n/g).map(function (s) { return s.trim(); });
            var simMatrix = [];
            lines.forEach(function (line, i) {
                if (line.length > 0) {
                    simMatrix.push(line.split(' ').map(parseFloat));
                }
            });
            // Normalise values to range 0...1, files can have very different value ranges
<<<<<<< HEAD
            //let max = simMatrix[0][0];
            //let min = simMatrix[0][0];
            //let i = simMatrix.length;
            //while (i--) {
            //    let j = simMatrix[i].length;
            //    while (j--) {
            //        let weight = simMatrix[i][j];
            //        max = Math.max(max, weight);
            //        min = Math.min(min, weight);
            //    }
            //}
            //let scale = d3.scale.linear().domain([min, max]).range([0, 1]);
            //simMatrix = simMatrix.map(row => row.map(scale));
=======
            var max = simMatrix[0][0];
            var min = simMatrix[0][0];
            var i = simMatrix.length;
            while (i--) {
                var j = simMatrix[i].length;
                while (j--) {
                    var weight = simMatrix[i][j];
                    max = Math.max(max, weight);
                    min = Math.min(min, weight);
                }
            }
            var scale = d3.scale.linear().domain([min, max]).range([0, 1]);
            simMatrix = simMatrix.map(function (row) { return row.map(scale); });
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
            dataSet.setSimMatrix(simMatrix);
        };
        // Load the attributes for the specified dataSet
        //TODO: Move into DataSet class
        this.loadAttributes = function (file, dataSet, callback) {
            var reader = new FileReader();
            reader.onload = function () {
                _this.parseAttributes(reader.result, dataSet);
                dataSet.notifyAttributes();
                if (callback)
                    callback();
            };
            reader.readAsText(file);
        };
        this.parseAttributes = function (text, dataSet) {
            //TODO: Move into DataSet class
            var newAttributes = new Attributes(text);
            dataSet.attributes = newAttributes;
            //dataSet.notifyAttributes();
        };
        this.setupCrossFilter = function (attrs) {
            if (!attrs)
                return;
            // put attributes into an object array; round the attribute values for grouping in crossfilter
            var objectArray = new Array();
            for (var i = 0; i < attrs.numRecords; ++i) {
                // create an object for each record:
                var object = new Object();
                object["index"] = i;
                for (var j = 0; j < attrs.columnNames.length; ++j) {
                    //object[attrs.columnNames[j]] = attrs.getValue(attrs.columnNames[j], i);
                    var attrValue;
                    if (j == 1) {
                        attrValue = attrs.getValue(j, i)[0];
                    }
                    else if (j == 3) {
                        attrValue = attrs.getValue(j, i)[0];
                        attrValue = Math.round(attrValue / 20) * 20;
                    }
                    else {
                        attrValue = attrs.getValue(j, i)[0];
                        attrValue = parseFloat(attrValue.toFixed(2));
                    }
                    object[attrs.columnNames[j]] = attrValue;
                }
                objectArray.push(object);
            }
            // convert the object array to json format
            var json = JSON.parse(JSON.stringify(objectArray));
            // create crossfilter
            var cfilter = crossfilter(json);
            var totalReadings = cfilter.size();
            var all = cfilter.groupAll();
            var dimArray = new Array();
            // create a data count widget
            // once created data count widget will automatically update the text content of the following elements under the parent element.
            // ".total-count" - total number of records
            // ".filter-count" - number of records matched by the current filters
            dc.dataCount(".dc-data-count")
                .dimension(cfilter)
                .group(all);
            // create the charts 
            // listener
            var filtered = function () {
                _this.referenceDataSet.attributes.filteredRecords = dimArray[0].top(Number.POSITIVE_INFINITY);
                _this.referenceDataSet.attributes.filteredRecordsHighlightChanged = true;
                $('#button-apply-filter').button("enable");
            };
            for (var j = 0; j < attrs.columnNames.length; ++j) {
                $('#barCharts').append('<div id="barChart' + j + '"></div>');
                var chart = dc.barChart("#barChart" + j);
                var columnName = attrs.columnNames[j];
                var minValue = attrs.getMin(j);
                var maxValue = attrs.getMax(j);
                var offset = (maxValue - minValue) * 0.1;
                var dim = cfilter.dimension(function (d) { return d[columnName]; });
                dimArray.push(dim);
                var group = dim.group().reduceCount(function (d) { return d[columnName]; });
                chart
                    .gap(5)
                    .width(270)
                    .height(150)
                    .dimension(dim)
                    .group(group)
                    .x(d3.scale.linear().domain([minValue - offset, maxValue + offset]))
                    .xAxisLabel(columnName)
                    .xUnits(function () { return 25; }) //TODO: this could be smarter
                    .centerBar(true)
                    .on("filtered", filtered)
                    .xAxis().ticks(6);
            }
            // keep track of total readings
            d3.select("#total").text(totalReadings);
            $('#button-apply-filter').button("disable");
            // render all charts
            dc.renderAll();
        };
        /*
            Functions to set up interaction, when everything else is ready
        */
        this.initListeners = function () {
            $(document).keyup(function (e) {
                if (e.keyCode == 27)
                    _this.toggleSplashPage(); // esc
            });
            // Color pickers
            $("#input-node-color").on("changeColor", function (e) {
                _this.setSelectNodeKeyBackgroundColor(e.color.toHex());
                _this.setNodeSizeOrColor();
            });
            $("#input-surface-color").on("changeColor", function (e) { return _this.setBrainSurfaceColor(e.color.toHex()); });
            $("#input-min-color").on("changeColor", function (e) { return _this.setNodeSizeOrColor(); });
            $("#input-max-color").on("changeColor", function (e) { return _this.setNodeSizeOrColor(); });
            $("#input-edge-start-color").on("changeColor", function (e) { return _this.setEdgeDirectionGradient(); });
            $("#input-edge-end-color").on("changeColor", function (e) { return _this.setEdgeDirectionGradient(); });
            $("#input-edge-discretized-0-color").on("changeColor", function (e) { return _this.setEdgeColorByWeight(); });
            $("#input-edge-discretized-1-color").on("changeColor", function (e) { return _this.setEdgeColorByWeight(); });
            $("#input-edge-discretized-2-color").on("changeColor", function (e) { return _this.setEdgeColorByWeight(); });
            $("#input-edge-discretized-3-color").on("changeColor", function (e) { return _this.setEdgeColorByWeight(); });
            $("#input-edge-discretized-4-color").on("changeColor", function (e) { return _this.setEdgeColorByWeight(); });
            $("#input-edge-min-color").on("changeColor", function (e) { return _this.setEdgeColorByWeight(); });
            $("#input-edge-max-color").on("changeColor", function (e) { return _this.setEdgeColorByWeight(); });
            $("#input-edge-color").on("changeColor", function (e) {
                _this.setSelectEdgeKeyBackgroundColor(e.color.toHex());
                _this.setEdgeColorByWeight();
            });
            $("#input-context-menu-node-color").on("changeColor", function (e) { return _this.setNodeColorInContextMenu(e.color.toHex()); });
            $("#input-edge-transitional-color").on("changeColor", function (e) { return _this.setEdgeTransitionColor(e.color.toHex()); });
            $('#button-select-matrix').click(function () { return $("#select-matrix").click(); });
            $('#select-matrix').on('change', function () {
                // Change the button name according to the file name
                var file = $('#select-matrix').get(0).files[0];
                //document.getElementById("button-select-matrix").innerHTML = file.name;
                document.getElementById("button-select-matrix-filename").innerHTML = file.name;
                // update file status to changed
                _this.changeFileStatus("matrix-status", "changed");
                // Parse and upload attribute file
                _this.uploadMatrix();
            });
            $('#button-select-attrs').click(function () { return $("#select-attrs").click(); });
            $('#select-attrs').on('change', function () {
                // Change the button name according to the file name
                var file = $('#select-attrs').get(0).files[0];
                //document.getElementById("button-select-attrs").innerHTML = file.name;
                document.getElementById("button-select-attrs-filename").innerHTML = file.name;
                // update file status to changed
                _this.changeFileStatus("attrs-status", "changed");
                // Parse and upload attribute file
                _this.uploadAttr();
            });
            $('#button-select-labels').click(function () { return $("#select-labels").click(); });
            $('#select-labels').on('change', function () {
                // Change the button name according to the file name
                var file = $('#select-labels').get(0).files[0];
                //document.getElementById("button-select-labels").innerHTML = file.name;
                document.getElementById("button-select-labels-filename").innerHTML = file.name;
                // update file status to changed
                _this.changeFileStatus("labels-status", "changed");
                // Parse and upload labels
                _this.uploadLabels();
            });
            $('#button-load-settings').button().click(function () { return $("#input-select-load-file").click(); });
            $('#input-select-load-file').on('change', _this.loadSettings);
            $('#button-save-settings').button().click(function () {
                // set default file name
                $('#file-save-name').val("brain-model-settings.txt");
                var me = _this;
                var dialog = $('#file-save-dialog');
                var configsavebutton = $('#button-save-settings');
                dialog.dialog({
                    position: {
                        my: "bottom",
                        at: "top",
                        of: configsavebutton
                    },
                    buttons: {
                        OK: function () {
                            var filename = $('#file-save-name').val();
                            $(this).dialog('close');
                            me.saveSettings(filename);
                        }
                    }
                });
            });
            $('#button-export-svg').button().click(function () { return $("#exportModal")["modal"](); });
            // set default export callback function
            // others can use the export dialog as well, but have to save this callback first
            var appref = _this;
            _this.exportCallbackFunction = function () {
                var filename = $('#select-export-filename').val();
                if (filename.length == 0)
                    filename = null;
                var viewport = $('#select-export-viewport').val();
                var type = $('#select-export-type').val();
                var strresolution = $('#select-export-resolution').val();
                strresolution = strresolution.split('x');
                var resolution = {
                    x: parseInt(strresolution[0]),
                    y: parseInt(strresolution[1])
                };
                appref.exportSVG(parseInt(viewport), type, resolution, filename);
            };
            $('#button-export-submit').button().click(_this.exportCallbackFunction);
            $('#button-save-app').button().click(function () {
                //Save all the applicationsInstances
                for (var i = 0; i < 4; i++) {
                    var app = _this.saveFileObj.saveApps[i];
                    //added to fix surfaceModel not saving issue
                    if (app && app.surfaceModel)
                        app.surfaceModel = $('#select-brain3d-model').val();
                    if (_this.applicationsInstances[i])
                        _this.applicationsInstances[i].save(app);
                }
                //reload display settings
                _this.reloadDisplay();
                var saveJson = JSON.stringify(_this.saveFileObj);
                $.post("brain-app/saveapp.aspx", {
                    save: saveJson
                }, function (data, status) {
                    if (status.toLowerCase() == "success") {
                        var url = document.URL.split('?')[0];
                        prompt("The project is saved. Use the following URL to restore the project:", url + "?save=" + data);
                    }
                    else {
                        alert("save: " + status);
                    }
                });
            });
            $('[data-toggle="btns"] .btn').on('click', function () {
                var $this = $(this);
                $this.parent().find('.active').removeClass('active');
                $this.addClass('active');
            });
            $('#button-upload-model').button().click(function () {
                CommonUtilities.launchAlertMessage(CommonUtilities.alertType.WARNING, "Uploading the brain model...");
                var file = $('#input-select-model').get(0).files[0];
                if (file) {
                    var reader = new FileReader();
                    reader.onload = function () {
                        var brainModel = _this.loader.parse(reader.result);
                        _this.applicationsInstances[0].setBrainModelObject(brainModel);
                        CommonUtilities.launchAlertMessage(CommonUtilities.alertType.SUCCESS, "New brain model uploaded");
                    };
                    reader.onerror = function () {
                        var message = "Failed to upload model " + file;
                        CommonUtilities.launchAlertMessage(CommonUtilities.alertType.ERROR, message);
                        console.log(message);
                    };
                    reader.readAsText(file);
                }
            });
            $('#load-example-data').button().click(function () { return _this.loadExampleData(function () { return _this.applicationsInstances.forEach(function (app) { return app.setDataSet(_this.referenceDataSet); }); }); });
            $('#button-apply-filter').button().click(_this.applyFilterButtonOnClick);
            $('#button-apply-filter').button("disable");
            $('#button-set-node-size-color').button().click(_this.setNodeSizeOrColor);
            $('#select-node-size-color').on('change', _this.selectNodeSizeColorOnChange);
            $("#checkbox-node-color-continuous").on("change", function () {
                var attribute = $('#select-attribute').val();
                var nodeColorMode = $('#checkbox-node-color-continuous').is(":checked");
                if (!nodeColorMode && _this.referenceDataSet.attributes.info[attribute].isDiscrete) {
                    _this.setupColorPickerDiscrete(attribute);
                }
                else {
                    _this.setupColorPicker();
                }
                _this.setNodeSizeOrColor();
            });
            $("#checkbox-color-transitional-edges").on("change", function () {
                var useTransitionColor = $('#checkbox-color-transitional-edges').is(":checked");
                _this.setUseTransitionColor(useTransitionColor);
            });
            $('#select-attribute').on('change', _this.setupAttributeNodeControls);
            $('#select-node-key').on('change', function () {
                var key = $('#select-node-key').val();
                var keySelection = document.getElementById('select-node-key');
                for (var i = 0; i < keySelection.length; i++) {
                    if (keySelection.options[i].value == key) {
                        var color = keySelection.options[i].style.backgroundColor;
                        var hex = _this.colorToHex(color);
                        $("#input-node-color").colorpicker("setValue", hex);
                        break;
                    }
                }
            });
            $('#select-edge-key').on('change', function () {
                var key = $('#select-edge-key').val();
                var keySelection = document.getElementById('select-edge-key');
                // find the coressponding key and retrieve color data
                for (var i = 0; i < keySelection.length; i++) {
                    if (keySelection.options[i].value == key) {
                        var color = keySelection.options[i].style.backgroundColor;
                        var hex = _this.colorToHex(color);
                        $('#input-edge-color').colorpicker("setValue", hex);
                        break;
                    }
                }
            });
            _this.input.regMouseLocationCallback(_this.getActiveTargetUnderMouse);
            _this.input.regMouseUpCallback(_this.highlightSelectedNodes);
            // Set up selectability of view spaces
            $(TL_VIEW).click(function () { return _this.selectView(TL_VIEW); });
            $(TR_VIEW).click(function () { return _this.selectView(TR_VIEW); });
            $(BL_VIEW).click(function () { return _this.selectView(BL_VIEW); });
            $(BR_VIEW).click(function () { return _this.selectView(BR_VIEW); });
            //TODO: Bring this back with multi-view
            /*
            $('#checkbox_yoking_view').on('change', () => {
                if ($('#checkbox_yoking_view').is(":checked")) {
                    this.input.yokingView = true;
                }
                else {
                    this.input.yokingView = false;
                }
            });
            */
            $('#checkbox-thickness-by-weight').on('change', _this.setEdgeThicknessByWeight);
            $('#checkbox-edge-color-force-continuous').on('change', function () {
                if ($("#checkbox-edge-color-force-continuous").is(":checked")) {
                    _this.commonData.edgeForceContinuous = true;
                }
                else {
                    _this.commonData.edgeForceContinuous = false;
                }
                _this.setEdgeColor();
            });
            $('#checkbox-edge-color-discretized').on('change', function () {
                if ($("#checkbox-edge-color-discretized").is(":checked")) {
                    _this.setDefaultEdgeDiscretizedValues();
                    $("#div-edge-color-continuous-discretized").show();
                    $("#div-edge-color-continuous-normal").hide();
                    _this.commonData.edgeWeightColorMode = "continuous-discretized";
                    var numCategory = Number($('#select-edge-color-number-discretized-category').val());
                    for (var i = 0; i < 5; i++) {
                        if (i < numCategory) {
                            $('#div-edge-discretized-' + i).show();
                        }
                        else {
                            $('#div-edge-discretized-' + i).hide();
                        }
                    }
                }
                else {
                    $("#div-edge-color-continuous-discretized").hide();
                    $("#div-edge-color-continuous-normal").show();
                    _this.commonData.edgeWeightColorMode = "continuous-normal";
                }
                _this.setEdgeColorByWeight();
            });
            $('#select-edge-direction').on('change', _this.setEdgeDirection);
            $('#select-edge-color').on('change', function () {
                _this.setEdgeColor();
            });
            $('#select-brain3d-model').on('change', function () {
                var model = $('#select-brain3d-model').val();
                if (model === "upload") {
                    $("#div-upload-brain-model").show();
                }
                else {
                    $("#div-upload-brain-model").hide();
                    var model = $('#select-brain3d-model').val();
                    _this.setBrainModel(TL_VIEW, model);
                }
            });
            $('#select-edge-color-number-discretized-category').on('change', function () {
                var numCategory = Number($('#select-edge-color-number-discretized-category').val());
                _this.setDefaultEdgeDiscretizedValues();
                for (var i = 0; i < 5; i++) {
                    if (i < numCategory) {
                        $('#div-edge-discretized-' + i).show();
                    }
                    else {
                        $('#div-edge-discretized-' + i).hide();
                    }
                }
                _this.setEdgeColorByWeight();
            });
            $('#input-edge-discretized-' + 0 + '-from').on('change keyup paste', _this.setEdgeColorByWeight);
            $('#input-edge-discretized-' + 4 + '-to').on('change keyup paste', _this.setEdgeColorByWeight);
            $('#input-edge-discretized-1-from').on('change keyup paste', function () {
                var val = $('#input-edge-discretized-1-from').val();
                $('#input-edge-discretized-0-to').val(val);
                _this.setEdgeColorByWeight();
            });
            $('#input-edge-discretized-2-from').on('change keyup paste', function () {
                var val = $('#input-edge-discretized-2-from').val();
                $('#input-edge-discretized-1-to').val(val);
                _this.setEdgeColorByWeight();
            });
            $('#input-edge-discretized-3-from').on('change keyup paste', function () {
                var val = $('#input-edge-discretized-3-from').val();
                $('#input-edge-discretized-2-to').val(val);
                _this.setEdgeColorByWeight();
            });
            $('#input-edge-discretized-4-from').on('change keyup paste', function () {
                var val = $('#input-edge-discretized-4-from').val();
                $('#input-edge-discretized-3-to').val(val);
                _this.setEdgeColorByWeight();
            });
            $('#input-edge-discretized-0-to').on('change keyup paste', function () {
                var val = $('#input-edge-discretized-0-to').val();
                $('#input-edge-discretized-1-from').val(val);
                _this.setEdgeColorByWeight();
            });
            $('#input-edge-discretized-1-to').on('change keyup paste', function () {
                var val = $('#input-edge-discretized-1-to').val();
                $('#input-edge-discretized-2-from').val(val);
                _this.setEdgeColorByWeight();
            });
            $('#input-edge-discretized-2-to').on('change keyup paste', function () {
                var val = $('#input-edge-discretized-2-to').val();
                $('#input-edge-discretized-3-from').val(val);
                _this.setEdgeColorByWeight();
            });
            $('#input-edge-discretized-3-to').on('change keyup paste', function () {
                var val = $('#input-edge-discretized-3-to').val();
                $('#input-edge-discretized-4-from').val(val);
                _this.setEdgeColorByWeight();
            });
            window.addEventListener('resize', function () {
                var newViewWidth = $('#outer-view-panel').width();
                var newViewHeight = $('#outer-view-panel').height();
                var xScale = newViewWidth / _this.viewWidth;
                var yScale = newViewHeight / _this.viewHeight;
                var pinPos = $('#pin').position();
                var newPinX = pinPos.left * xScale;
                var newPinY = pinPos.top * yScale;
                $('#pin').css({ left: newPinX, top: newPinY });
                _this.setViewCrossroads(newPinX, newPinY);
                _this.viewWidth = newViewWidth;
                _this.viewHeight = newViewHeight;
            }, false);
            //set colour after initialise from file----------------------------------------------
            var color = $("#input-surface-color :input").val();
            _this.saveFileObj.surfaceSettings.color = color;
            if (_this.applicationsInstances[0])
                _this.applicationsInstances[0].setSurfaceColor(color);
            if (_this.applicationsInstances[1])
                _this.applicationsInstances[1].setSurfaceColor(color);
            if (_this.applicationsInstances[2])
                _this.applicationsInstances[2].setSurfaceColor(color);
            if (_this.applicationsInstances[3])
                _this.applicationsInstances[3].setSurfaceColor(color);
            //-----------------------------------------------------------------------------------
        };
        this.brainSurfaceColor = "0xe3e3e3";
        // Set up OBJ loading
        var manager = new THREE.LoadingManager();
        this.loader = new THREE.OBJLoader(manager);
        this.applicationsInstances = Array();
        // Set up the class that will manage which view should be receiving input
        this.input = new InputTargetManager([TL_VIEW, TR_VIEW, BL_VIEW, BR_VIEW], this.pointerImage);
        this.input.setActiveTarget(0);
    }
    NeuroMarvl.prototype.recordDisplaySettings = function () {
        // surfaceSettings.color                        
        var col = this.saveFileObj.surfaceSettings.color;
<<<<<<< HEAD
        $("#input-surface-color").val(col);
=======
        $("#input-surface-color :input").val(col);
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
        //set Display Mode
        $('#display_settings_mode').val(this.saveFileObj.displaySettings.mode);
        $('#display_settings_labels').val(this.saveFileObj.displaySettings.labels);
        $('#display_settings_split').val(this.saveFileObj.displaySettings.split);
        $('#display_settings_rotation').val(this.saveFileObj.displaySettings.rotation);
    };
    //reload the display settings
    NeuroMarvl.prototype.reloadDisplay = function () {
        this.saveFileObj.displaySettings.mode = $('#display_settings_mode').val();
        this.saveFileObj.displaySettings.labels = $('#display_settings_labels').val();
        this.saveFileObj.displaySettings.split = $('#display_settings_split').val();
        this.saveFileObj.displaySettings.rotation = $('#display_settings_rotation').val();
    };
    return NeuroMarvl;
}());
//////////////////////////////////////////////////////////////////
///                  On Default                                 //
//////////////////////////////////////////////////////////////////
<<<<<<< HEAD
var neuroMarvl;
function defaultFunction() {
    neuroMarvl = new NeuroMarvl();
=======
function defaultFunction() {
    var neuroMarvl = new NeuroMarvl();
>>>>>>> d2c0c4a93bc9257fcb4df0dd36767a98f8c8a07a
    neuroMarvl.start();
}
//# sourceMappingURL=brainapp.js.map