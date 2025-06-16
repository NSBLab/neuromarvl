%% Surface
s = nifti2surface('mask_200um.nii', 1); 
simplePatchToObj(s, '../tpl-wholebrain.obj'); 


%% Coords
ni = niftiinfo('mask_200um.nii'); 
c = readmatrix('coords.csv')/2; 
c2 = rotateVolumetric(c, 'pir' ,'ras') + [0 70 40];
c3 = affineVerts(c2, ni.Transform.T, 1); 
c3 = c3([end/2+1:end, 1:end/2],:);

t = table(c3(:,1), c3(:,2), c3(:,3), 'VariableNames', {'x', 'y', 'z'}); 
writetable(t, '../coords.txt', 'Delimiter', ' '); 


%% Labels
str = readcell('./acronyms.csv'); 
str = str([end/2+1:end, 1:end/2]);
str(1:end/2) = cellfun(@(x) ['rh_',x], str(1:end/2), 'Uni', 0); 
str(end/2+1:end) = cellfun(@(x) ['lh_',x], str(end/2+1:end), 'Uni', 0); 
writecell(str, '../labels.txt'); 


%% Matrix
mat = readmatrix("./conn.csv"); 
mat = mat([end/2+1:end, 1:end/2],[end/2+1:end, 1:end/2]); 
writematrix(mat, '../mat.txt', 'Delimiter', ' '); 


%% Attr
hemi = cellfun(@isempty, regexp((str), '^rh_*'))+1; 
str = sum(mat,2); 
deg = sum(logical(mat),2); 

t = table(hemi, str, deg, 'VariableNames', {'Hemisphere', 'Strength', 'Degree'}); 
writetable(t, '../attr.txt', 'Delimiter', ' '); 

