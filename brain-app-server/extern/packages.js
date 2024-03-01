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
    // This is the version for the D3 V7 hierarchy data structure
    edgesD3V7: function (nodes) {
        var mapNamesToNodes = {};
        var returnArray = [];

        // Compute a map from name to node.
        nodes.forEach(function (d) {
            mapNamesToNodes[d.data.name] = d;
        });

        // For each import, construct a link from the source to target node.
        nodes.forEach(function (d) {
            if (d.data.imports) d.data.imports.forEach(function (i, j) {

                returnArray.push({ source: mapNamesToNodes[d.data.name], target: mapNamesToNodes[i] });
                
                //returnArray.push({
                //    source: {
                //        data: mapNamesToNodes[d.data.name].data,
                //        x: mapNamesToNodes[d.data.name].x,
                //        y: mapNamesToNodes[d.data.name].y,
                //        parent: mapNamesToNodes[d.data.name].parent
                //    },
                //    target: {
                //        data: mapNamesToNodes[i].data,
                //        x: mapNamesToNodes[i].x,
                //        y: mapNamesToNodes[i].y,
                //        parent: mapNamesToNodes[i].parent
                //    }
                //});
            });
        });
        return returnArray;
    }

  };
})();
