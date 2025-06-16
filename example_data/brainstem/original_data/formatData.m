%% Surfaces

d = dir2('2*.labels_thresholded_binary_0.35/*.nii.gz');

for ii = 1:length(d)

    s = nifti2surface(fullfile(d(ii).folder, d(ii).name), 1, 2);

    if ii == 1
        v = s.vertices; f = s.faces; r = ones(height(v),1);
    else
        [v,f,r] = joinPatches(v, f, r, ...
            s.vertices, s.faces, ones(height(s.vertices),1));
    end

end

figuremax; plotBrain(v,f,r,r); colorbar;

g = gifti(struct('vertices', v, 'faces', f , 'cdata', r));
save(g, 'tpl-brainstem.surf.gii');
writematrix(string({d(:).name}'), 'tpl-brainstem.label.txt'); 
simplePatchToObj(struct('vertices', v, 'faces', f), '../tpl-brainstem.obj');


%% Coords
t = readtable('region_info_Schaefer100.csv'); 
c = t(1:67,{'x','y','z'});

figure;
scat3(table2array(c), t{1:67,'nvoxels'}, 'r', 'filled');  
axis image; 

s = simpleObjToPatch('../tpl-brainstem.obj'); 
hold on; 
patchvfc(s.vertices, s.faces); 

writetable(c, '../coords.txt', 'Delimiter', ' ');


%% Labels
t = readtable('region_info_Schaefer100.csv'); 
writecell(t{1:67, 'labels'}, '../labels.txt');


%% Connectomes

% a = readNPY('brainstemfc_mean_corrcoeff_full_Schaefer400.npy');
% b = readNPY('brainstemfc_mean_corrcoeff_full_Schaefer100.npy');
% allclose(a(1:75,1:75) - b(1:75,1:75), 0)
% allclose(a(476:end,476:end) - b(176:end,176:end), 0)
% figure; imagescmg(b); clim([-1 1]); 

a = readNPY('brainstemfc_mean_corrcoeff_full_Schaefer100.npy');
a = a(1:67, 1:67);
writematrix(a, '../mat.txt', 'Delimiter', ' ');


%% Attributes

t = readtable('region_info_Schaefer100.csv'); 

str = sum(a,2);  
hemi = 1*strcmp(t{:,'hemisphere'}, 'R') + 2*strcmp(t{:,'hemisphere'}, 'M') + 3*strcmp(t{:,'hemisphere'}, 'L');

attr = table(hemi(1:67,:), t{1:67, 'nvoxels'}, t{1:67, 'tSNR'}, str, ...
    'VariableNames', {'Hemisphere', 'nVoxels', 'tSNR', 'Strength'}); 
writetable(attr, '../attr.txt', 'Delimiter', ' '); 




