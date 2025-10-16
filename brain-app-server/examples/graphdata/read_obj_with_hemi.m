function [V, F, FHemi] = read_obj_with_hemi(FileName)

FID = fopen(FileName, 'r');

A = textscan(FID, '%c%f%f%f%c', Inf, 'CollectOutput', true);

V = A{2}(A{1} == 'v', :);
F = A{2}(A{1} == 'f', :);
FHemi = A{3}(A{1} == 'f', :);
fclose(FID);
