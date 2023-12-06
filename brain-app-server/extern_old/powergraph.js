var cola;
(function (cola) {
    var powergraph;
    (function (powergraph) {
        var PowerEdge = /** @class */ (function () {
            function PowerEdge(source, target) {
                this.source = source;
                this.target = target;
            }
            return PowerEdge;
        }());
        powergraph.PowerEdge = PowerEdge;
        var Configuration = /** @class */ (function () {
            function Configuration(n, edges, linkAccessor) {
                var _this = this;
                this.linkAccessor = linkAccessor;
                this.modules = new Array(n);
                this.roots = new Array(n);
                for (var i = 0; i < n; ++i) {
                    this.roots[i] = this.modules[i] = new Module(i, {}, {}, {});
                }
                this.R = edges.length;
                edges.forEach(function (e) {
                    var s = _this.modules[linkAccessor.getSourceIndex(e)], t = _this.modules[linkAccessor.getTargetIndex(e)];
                    s.outgoing[t.id] = t;
                    t.incoming[s.id] = s;
                });
            }
            Configuration.prototype.merge = function (a, b) {
                var inInt = intersection(a.incoming, b.incoming), outInt = intersection(a.outgoing, b.outgoing);
                var children = {};
                children[a.id] = a;
                children[b.id] = b;
                var m = new Module(this.modules.length, outInt, inInt, children);
                this.modules.push(m);
                var update = function (s, i, o) {
                    for (var v in s) {
                        var n = s[v];
                        n[i][m.id] = m;
                        delete n[i][a.id];
                        delete n[i][b.id];
                        delete a[o][v];
                        delete b[o][v];
                    }
                };
                update(outInt, "incoming", "outgoing");
                update(inInt, "outgoing", "incoming");
                this.R -= Object.keys(inInt).length + Object.keys(outInt).length;
                delete this.roots[a.id];
                delete this.roots[b.id];
                this.roots[m.id] = m;
                return m;
            };
            Configuration.prototype.rootMerges = function () {
                var rs = Object.keys(this.roots);
                var n = rs.length;
                var merges = new Array(n * (n - 1));
                var ctr = 0;
                for (var i = 0, i_ = n - 1; i < i_; ++i) {
                    for (var j = i + 1; j < n; ++j) {
                        var a = this.roots[rs[i]], b = this.roots[rs[j]];
                        merges[ctr++] = { nEdges: this.nEdges(a, b), a: a, b: b };
                    }
                }
                return merges;
            };
            Configuration.prototype.greedyMerge = function () {
                var ms = this.rootMerges().sort(function (a, b) { return a.nEdges - b.nEdges; });
                var m = ms[0];
                if (m.nEdges >= this.R)
                    return false;
                this.merge(m.a, m.b);
                return true;
            };
            Configuration.prototype.nEdges = function (a, b) {
                return this.R - intersectionCount(a.outgoing, b.outgoing) - intersectionCount(a.incoming, b.incoming);
            };
            Configuration.prototype.getGroupHierarchy = function (retargetedEdges) {
                var _this = this;
                var groups = [];
                var root = {};
                toGroups(this.roots, root, groups);
                var es = this.allEdges();
                es.forEach(function (e) {
                    var a = _this.modules[e.source];
                    var b = _this.modules[e.target];
                    retargetedEdges.push(new PowerEdge(typeof a.gid === "undefined" ? e.source : groups[a.gid], typeof b.gid === "undefined" ? e.target : groups[b.gid]));
                });
                return groups;
            };
            Configuration.prototype.allEdges = function () {
                var es = [];
                Configuration.getEdges(this.roots, es);
                return es;
            };
            Configuration.getEdges = function (modules, es) {
                for (var i in modules) {
                    var m = modules[i];
                    m.getEdges(es);
                    Configuration.getEdges(m.children, es);
                }
            };
            return Configuration;
        }());
        powergraph.Configuration = Configuration;
        function toGroups(modules, group, groups) {
            for (var i in modules) {
                var m = modules[i];
                if (m.isLeaf()) {
                    if (!group.leaves)
                        group.leaves = [];
                    group.leaves.push(m.id);
                }
                else {
                    var g = group;
                    m.gid = groups.length;
                    if (!m.isIsland()) {
                        g = { id: m.gid };
                        if (!group.groups)
                            group.groups = [];
                        group.groups.push(m.gid);
                        groups.push(g);
                    }
                    toGroups(m.children, g, groups);
                }
            }
        }
        var Module = /** @class */ (function () {
            function Module(id, outgoing, incoming, children) {
                this.id = id;
                this.outgoing = outgoing;
                this.incoming = incoming;
                this.children = children;
            }
            Module.prototype.getEdges = function (es) {
                for (var o in this.outgoing) {
                    es.push({ source: this.id, target: this.outgoing[o].id });
                }
            };
            Module.prototype.isLeaf = function () {
                return Object.keys(this.children).length == 0;
            };
            Module.prototype.isIsland = function () {
                return Object.keys(this.outgoing).length == 0 && Object.keys(this.incoming).length == 0;
            };
            return Module;
        }());
        powergraph.Module = Module;
        function intersection(m, n) {
            var i = {};
            for (var v in m)
                if (v in n)
                    i[v] = m[v];
            return i;
        }
        function intersectionCount(m, n) {
            return Object.keys(intersection(m, n)).length;
        }
        function getGroups(nodes, links, la) {
            var n = nodes.length, c = new powergraph.Configuration(n, links, la);
            while (c.greedyMerge())
                ;
            var powerEdges = [];
            var g = c.getGroupHierarchy(powerEdges);
            powerEdges.forEach(function (e) {
                var f = function (end) {
                    var g = e[end];
                    if (typeof g == "number")
                        e[end] = nodes[g];
                };
                f("source");
                f("target");
            });
            return { groups: g, powerEdges: powerEdges };
        }
        powergraph.getGroups = getGroups;
    })(powergraph = cola.powergraph || (cola.powergraph = {}));
})(cola || (cola = {}));
//# sourceMappingURL=powergraph.js.map