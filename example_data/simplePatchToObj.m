function completed = simplePatchToObj(inputSurface, filename)
%SIMPLEPATCHTOOBJ Converts surface struct to .obj file
%   Inputs: inputSurface: struct with faces and vertices subfields
%               filename: filename of .obj file to be created
%   Outputs:   completed: status (from FCLOSE) indicating if export succesful

completed = -1; %#ok<NASGU> 
if nargin < 2
    filename = sprintf("simpleObj_%f.obj", now);
end

fileID = fopen(filename, 'w');
% fprintf writes down the columns, so use transpose
fprintf(fileID, 'v %f %f %f\n', inputSurface.vertices');
fprintf(fileID, 'f %d %d %d\n', inputSurface.faces');
completed = fclose(fileID);

end

