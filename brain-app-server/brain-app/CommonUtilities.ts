
class CommonUtilities {
    static timeTracker = new Date().getMilliseconds();
    static alertType = {
        "ERROR": 2,
        "SUCCESS": 0,
        "WARNING": 1,
        "INFO": -1
    };
    static alertNumber = 0;
    static isDiscreteValues(values: number[], threshold?) {
        if (!threshold) threshold = 10;
        var flags = [], distincts = [], l = values.length;
        for (var i = 0; i < l; i++) {
            if (flags[values[i]]) continue;
            flags[values[i]] = true;
            distincts.push(values[i]);
            if (distincts.length > threshold) {
                return false;
            }
        }

        return true;
    }

    static isSymmetrical(matrix: number[][]) {
        if (matrix.length !== matrix[0].length) return false;
        for (var i = 0; i < matrix.length; i++) {
            for (var j = i + 1; j < matrix[0].length; j++) {
                if (matrix[i][j] !== matrix[j][i]) {
                    return false;
                }
            }
        }

        return true;
    }

    static cytoscapeToModelPosition = (cy, pos) => {
        const pan = cy.pan();
        const zoom = cy.zoom();
        return {
            x: (pos.x - pan.x) / zoom,
            y: (pos.y - pan.y) / zoom,
        };
    };

    // Convert a model position to a rendered position
    static cytoscapeToRenderedPosition = (cy, pos) => {
        const pan = cy.pan();
        const zoom = cy.zoom();
        return {
            x: pos.x * zoom + pan.x,
            y: pos.y * zoom + pan.y,
        };
    };


    // compute the bounding box of the brain
    static computeScreenSpaceBoundingBox(brainModelOrigin, camera) {
        
        var vertex = new THREE.Vector3();
        var min = new THREE.Vector3(1, 1, 1);
        var max = new THREE.Vector3(-1, -1, -1);
        brainModelOrigin.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                var attribute = <THREE.BufferAttribute>(<THREE.BufferGeometry>child.geometry).getAttribute("position")
                var oldPositions = Array.prototype.slice.call(attribute.array);
                const FACE_CHUNK = 9;
                const VERT_CHUNK = 3;
                for (var faceIDX = 0; faceIDX < oldPositions.length; faceIDX += FACE_CHUNK) {

                    var vertexWorldCoord = vertex.copy(new THREE.Vector3(oldPositions[faceIDX], oldPositions[faceIDX + 1], oldPositions[faceIDX + 2])).applyMatrix4(brainModelOrigin.matrixWorld);
                    var vertexScreenSpace = vertexWorldCoord.project(camera);
                    min.min(vertexScreenSpace);
                    max.max(vertexScreenSpace);

                    vertexWorldCoord = vertex.copy(new THREE.Vector3(oldPositions[faceIDX + 3], oldPositions[faceIDX + 4], oldPositions[faceIDX + 5])).applyMatrix4(brainModelOrigin.matrixWorld);
                    vertexScreenSpace = vertexWorldCoord.project(camera);
                    min.min(vertexScreenSpace);
                    max.max(vertexScreenSpace);

                    vertexWorldCoord = vertex.copy(new THREE.Vector3(oldPositions[faceIDX + 6], oldPositions[faceIDX + 7], oldPositions[faceIDX + 8])).applyMatrix4(brainModelOrigin.matrixWorld);
                    vertexScreenSpace = vertexWorldCoord.project(camera);
                    min.min(vertexScreenSpace);
                    max.max(vertexScreenSpace);
                }
            }
        })
        return new THREE.Box2(new THREE.Vector2(min.x, min.y), new THREE.Vector2(max.x, max.y));
        //return null;
    }

    static sign(value: number) {
        if (value < 0) {
            return -1;
        } else if (value > 0) {
            return 1;
        } else {
            return 0;
        }
    }
    static getDistinctValues(values: number[]) {
        var flags = [], distincts = [], l = values.length;
        for (var i = 0; i < l; i++) {
            if (flags[values[i]]) continue;
            flags[values[i]] = true;
            distincts.push(values[i]);
        }

        return distincts;
    }

    static matrixToArray(matrix: any[][], adjMatrix?: any[][]) {
        var array = [];
        if (adjMatrix) { // if adjMatrix exist => assume columns === rows
            var len = adjMatrix.length;
            for (var i = 0; i < len - 1; i++) {
                adjMatrix[i][i] = null;
                for (var j = i + 1; j < len; ++j) {
                    if (adjMatrix[i][j] === 1) {
                        array.push(matrix[i][j]);
                    } 
                }
            }

            return array;
        } else {
            console.log("WARNING: MatrixToArray has not been implemented logic without adjMatrix!");
            return null;
        }
    }

    static launchAlertMessage(alertType, alertMessage) {

        var alertID = "alert" + this.alertNumber;
        var alertIcon;
        var alertTypeString;
        this.alertNumber++;

        var alertTypeClass;
        if (alertType === this.alertType.SUCCESS) {
            alertTypeClass = "alert-success";
            alertIcon = "glyphicon-ok-sign";
            alertTypeString = "Success!";
        } else if (alertType === this.alertType.WARNING) {
            console.log("WARNING: " + alertMessage);
            alertTypeClass = "alert-warning";
            alertIcon = "glyphicon-info-sign";
            alertTypeString = "Warning!";
        } else if (alertType === this.alertType.ERROR) {
            console.log("ERROR: " + alertMessage);
            console.trace();
            alertTypeClass = "alert-danger";
            alertIcon = "glyphicon-remove-sign";
            alertTypeString = "Error!";
        } else if (alertType === this.alertType.INFO) {
            alertTypeClass = "alert-info";
            alertIcon = "glyphicon-ok-sign";
            alertTypeString = "Info";
        }

        var newAlert = $('<div id="' + alertID + '" class="alert ' + alertTypeClass + '" role="alert"></div>')
            .append($('<span class="glyphicon ' + alertIcon + '" aria-hidden="true"> ' + alertTypeString + '</span>'))
            .append('<p>' + alertMessage + '</p>');

        $("#divAlerts").append(newAlert);

        setTimeout(function () {
            newAlert['alert']('close');
        }, 5000);
    }

    static hexToRgb(hex, alpha: number) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        var toString = function () {
            if (this.alpha == undefined) {
                return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
            }
            if (this.alpha > 1) {
                this.alpha = 1;
            } else if (this.alpha < 0) {
                this.alpha = 0;
            }
            return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.alpha + ")";
        }
        if (alpha == undefined) {
            return result ? <any>{
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
                toString: toString
            } : null;
        }
        if (alpha > 1) {
            alpha = 1;
        } else if (alpha < 0) {
            alpha = 0;
        }
        return result ? <any>{
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
            alpha: alpha,
            toString: toString
        } : null;
    }

    static concatTwoDimensionalArray(array) {
        var newArray = [];
        //this can be null due to data mismatch
        if (array != null) {
            for (var i = 0; i < array.length; i++) {
                newArray = newArray.concat(array[i]);
            }
        }
        return newArray;
    }
}

