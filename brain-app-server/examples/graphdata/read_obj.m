function [V, F] = read_obj(FileName)

FID = fopen(FileName, 'r');

A = textscan(FID, '%c%f%f%f', Inf, 'CollectOutput', true);

V = A{2}(A{1} == 'v', :);
F = A{2}(A{1} == 'f', :);
fclose(FID);
