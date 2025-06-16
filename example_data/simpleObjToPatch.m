function outputSurface = simpleObjToPatch(filename)
%SIMPLEOBJTOPATCH Reads simple .obj file and converts to struct
%   Inputs:       filename: filename of simple .obj file to be read
%   Outputs: outputSurface: struct with faces and vertices subfields

C = readcell(filename, 'FileType', 'text');

vertLocs = cell2mat(C(:,1)) == 'v';
vertices = cell2mat(C(vertLocs, 2:end));

faceLocs = cell2mat(C(:,1)) == 'f';
faces = cell2mat(C(faceLocs, 2:end));

outputSurface = struct('vertices', vertices, 'faces', faces);

end