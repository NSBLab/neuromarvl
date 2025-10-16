function [V, F] = save_obj(FileName, V, F)

FID = fopen(FileName, 'w');

fprintf(FID, 'v %f %f %f\n', V'); % Write vertex data to the file
fprintf(FID, 'f %d %d %d\n', F'); % Write face data to the file
fclose(FID); % Close the file after writing