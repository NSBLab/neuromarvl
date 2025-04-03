%% Surface
a = getSet(687527670, 100);

%%% Generate surface for each structure
% figuremax;
s = {};
for ii = 1:12 
    
    V = a.mask==ii; 
    v = vol2xyz(V,V); 
    F = cuboidDelaunay(+V); 
    tr = triangulation(F,v); 
    f = freeBoundary(tr); 

    s{ii} = struct('Vertices', v, 'Faces', f); 
    % nexttile; patchvfc(v,f); 

end

%%% Combine and output
v = s{1}.Vertices; 
f = s{1}.Faces; 
for ii = 2:12
    [v,f] = joinPatches(v, f, s{ii}.Vertices, s{ii}.Faces); 
end
simplePatchToObj(struct('vertices', v, 'faces', f), '../mouse/tpl-wholebrain.obj'); 


%% Coords
c = readmatrix('./coords.csv'); 
c2 = rotateVolumetric(c, 'pir' ,'ras') + [0 140 80];
t = table(c2(:,1), c2(:,2), c2(:,3), 'VariableNames', {'x', 'y', 'z'}); 
writetable(t, '../coords.txt', 'Delimiter', ' '); 


%% Labels
temp = readcell('./acronyms.csv'); 
writecell(temp, '../labels.txt'); 


%% Matrix
temp = readmatrix("./conn.csv"); 
writematrix(temp, '../mat.txt', 'Delimiter', ' '); 


%% Attr
str = sum(temp,2); 
deg = sum(logical(temp),2); 
hemi = (c2(:,1) < 57)+1; 

t = table(hemi, str, deg, 'VariableNames', {'Hemisphere', 'Strength', 'Degree'}); 
writetable(t, '../attr.txt', 'Delimiter', ' '); 

