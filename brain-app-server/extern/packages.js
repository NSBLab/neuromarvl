(function() {
  packages = {

    // Lazily construct the package hierarchy from class names.
    root: function(classes) {
      var map = {};

      function find(name, data) {
        var node = map[name], i;
        if (!node) {
          node = map[name] = data || {name: name, children: []};
          if (name.length) {
            node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
            node.parent.children.push(node);
            node.key = name.substring(i + 1);
          }
        }
        return node;
      }
      //console.log(classes);
      classes.forEach(function(d) {
        find(d.name, d);
      });

      return map[""];
    },

    // Return a list of imports for the given array of nodes.
    imports: function(nodes) {
      var map = {},
          imports = [];

      // Compute a map from name to node.
      nodes.forEach(function(d) {
        map[d.name] = d;
      });

      // For each import, construct a link from the source to target node.
      nodes.forEach(function(d) {
        if (d.imports) d.imports.forEach(function(i) {
          imports.push({source: map[d.name], target: map[i]});
        });
      });

      return imports;
    },

      // Return a list of imports for the given array of nodes.
      // For a list of graph nodes, each has a field .name and .imports
      // The .name field is the id of the node and the .imports field is a list of neighbours
      // This returns a list of objects, where each object contains .source and .target names for each edge defined by the .imports in the nodes
      // Added capabilities to do nested nodes
    // This is the version for the D3 V7 hierarchy data structure
    edgesD3V7: function (nodes) {
        var mapNamesToNodes = {};
        var returnArray = [];

        // Compute a map from name to node.
        nodes.eachAfter(function (d) {
            // only add a node that doesnt have children
            if (!d.children) {
                mapNamesToNodes[d.data.name] = d;
            }
        });

        // For each import (neighbour), construct a link from the source to target node.
        nodes.eachAfter(function (d) {
            // only consider leaves without children
            if (!d.children) {
                if (d.data.imports) d.data.imports.forEach(function (i, j) {
                    returnArray.push({ source: mapNamesToNodes[d.data.name], target: mapNamesToNodes[i] });
                })

            }
        });
        return returnArray;
    },

      // given a nodes structure (output of d3.cluster), which could be multilevel,
      // the nodes themselves will be the leaves of the final level of the tree
      // so, no clustering
      // root
      //    node[0]
      //    node[1]
      //    node[2]
      //    node[3]
      //    ...
      // with clustering
      // root
      //    cluster[0]
      //         node[0]
      //         node[1]
      //         ...
      //    cluster[1]
      //         node[2]
      //         node[3]
      //         ...
      //    ...
      // for either structure, this function returns a list of all the nodes
      nodesListFromNodesCluster: function (nodesCluster) {
          let nodesFlat = [];
          nodesCluster.eachAfter(function (d) {
              if (!d.children) {
                  nodesFlat.push(d);
              }
          });
          return nodesFlat;
    }
  };
})();
