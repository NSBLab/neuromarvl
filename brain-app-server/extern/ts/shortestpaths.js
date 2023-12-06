///<reference path="pqueue.ts"/>
/**
 * @module shortestpaths
 */
var cola;
(function (cola) {
    var shortestpaths;
    (function (shortestpaths) {
        class Neighbour {
            constructor(id, distance) {
                this.id = id;
                this.distance = distance;
            }
        }
        class Node {
            constructor(id) {
                this.id = id;
                this.neighbours = [];
            }
        }
        /**
         * calculates all-pairs shortest paths or shortest paths from a single node
         * @class Calculator
         * @constructor
         * @param n {number} number of nodes
         * @param es {Edge[]} array of edges
         */
        class Calculator {
            constructor(n, es, getSourceIndex, getTargetIndex, getLength) {
                this.n = n;
                this.es = es;
                this.neighbours = new Array(this.n);
                var i = this.n;
                while (i--)
                    this.neighbours[i] = new Node(i);
                i = this.es.length;
                while (i--) {
                    var e = this.es[i];
                    var u = getSourceIndex(e), v = getTargetIndex(e);
                    var d = getLength(e);
                    this.neighbours[u].neighbours.push(new Neighbour(v, d));
                    this.neighbours[v].neighbours.push(new Neighbour(u, d));
                }
            }
            /**
             * compute shortest paths for graph over n nodes with edges an array of source/target pairs
             * edges may optionally have a length attribute.  1 is the default.
             * Uses Johnson's algorithm.
             *
             * @method DistanceMatrix
             * @return the distance matrix
             */
            DistanceMatrix() {
                var D = new Array(this.n);
                for (var i = 0; i < this.n; ++i) {
                    D[i] = this.dijkstraNeighbours(i);
                }
                return D;
            }
            /**
             * get shortest paths from a specified start node
             * @method DistancesFromNode
             * @param start node index
             * @return array of path lengths
             */
            DistancesFromNode(start) {
                return this.dijkstraNeighbours(start);
            }
            PathFromNodeToNode(start, end) {
                return this.dijkstraNeighbours(start, end);
            }
            dijkstraNeighbours(start, dest = -1) {
                var q = new PriorityQueue((a, b) => a.d <= b.d), i = this.neighbours.length, d = new Array(i);
                while (i--) {
                    var node = this.neighbours[i];
                    node.d = i === start ? 0 : Number.POSITIVE_INFINITY;
                    node.q = q.push(node);
                }
                while (!q.empty()) {
                    // console.log(q.toString(function (u) { return u.id + "=" + (u.d === Number.POSITIVE_INFINITY ? "\u221E" : u.d.toFixed(2) )}));
                    var u = q.pop();
                    d[u.id] = u.d;
                    if (u.id === dest) {
                        var path = [];
                        var v = u;
                        while (typeof v.prev !== 'undefined') {
                            path.push(v.prev.id);
                            v = v.prev;
                        }
                        return path;
                    }
                    i = u.neighbours.length;
                    while (i--) {
                        var neighbour = u.neighbours[i];
                        var v = this.neighbours[neighbour.id];
                        var t = u.d + neighbour.distance;
                        if (u.d !== Number.MAX_VALUE && v.d > t) {
                            v.d = t;
                            v.prev = u;
                            q.reduceKey(v.q, v, (e, q) => e.q = q);
                        }
                    }
                }
                return d;
            }
        }
        shortestpaths.Calculator = Calculator;
    })(shortestpaths = cola.shortestpaths || (cola.shortestpaths = {}));
})(cola || (cola = {}));
//# sourceMappingURL=shortestpaths.js.map