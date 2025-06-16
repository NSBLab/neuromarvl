A complete dataset requires 4 files. They can have any name, and minimal examples are provided here as a starting point.

The 'coordinates.txt' file contains the spatial coordinates of the nodes. For the default surfaces supplied with the software, the coordinates should be in MNI space. For user-uploaded surfaces, the coordinates should match the coordinate system of the surface. The coordinates should be formatted as N rows and 3 columns, where N is the number of nodes. Each row is a different region, and the columns represent the xyz coordinates.

The 'labels.txt' file is optional, and contains the names of these nodes. Should contain N rows with a string or number representing the node label.

The 'matrix.txt' file contain the matrix of measured similarities (in activity) between these nodes for each data set. Should be an NxN matrix.

The 'attributes.txt' files contain attributes for each node in each data set. Should be an NxM matrix where M is the number of attributes. The first row can optionally contain strings representing attribute names, in which case there are N+1 rows.