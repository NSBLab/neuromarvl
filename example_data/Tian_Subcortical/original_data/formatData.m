function formatData(scale)

%% Import data
% scale = 1;
filename = sprintf('Tian_Subcortex_S%d_3T.nii', scale);

a = niftiread(filename);
s = nifti2surface(filename, 1, 5);

nNodes = max(a, [], 'all');


%% Surface
simplePatchToObj(s, ...
    sprintf('./Tian_Subcortical_S%d/surface.obj', scale));


%% Coords
coords = [];
for ii = 1:nNodes
    currV = a==ii;
    adj = sqrt(volume2adjacency(currV, 26));
    g = graph(adj);
    d = distances(g);
    [~,idx] = min(sum(d)); % equivalent to median (minimises L1-norm)

    currXyz = vol2xyz(currV,currV);
    coords(ii,:) = currXyz(idx,:); %#ok<AGROW>
end

coords = affineVerts(coords, niftiinfo(filename).Transform.T, 1);
% figure; patchvfc(s.vertices, s.faces); hold on; scat3(coords, 50, 'r', 'filled'); axis image;


%%  Matrix
mat = randsym(nNodes, 0.175, nNodes);
mat = tril(mat,-1);
mat(logical(mat)) = randn(nnz(mat),1);
mat = mat + mat';


%% Labels
nodename = readcell(sprintf("Tian_Subcortex_S%d_3T_label.txt", scale));


%% Attributes
vol = arrayfun(@(x) nnz(a==x), (1:nNodes)');
str = sum(mat,2);
deg = sum(logical(mat),2);
hemi = 1+cellfun(@isempty, (regexp(nodename, '-rh$')));

attr = table(vol, str, deg, hemi, ...
    'VariableNames', {'Volume', 'Strength', 'Degree', 'Hemisphere'});


%% Plot
figure;
nexttile; plotVolume(a); axis tight;
nexttile; plotBrain(s.vertices, s.faces, s.cdata); view(3);
nexttile; patchvfc(s.vertices, s.faces); axis image; view(3); hold on; scat3(coords,50,'r','filled');
nexttile; imagesc(mat); axis image; colorbar;


%% Save
writetable(table(coords(:,1), coords(:,2), coords(:,3), 'VariableNames', {'x', 'y', 'z'}), ...
    sprintf('./Tian_Subcortical_S%d/coords.txt',scale), 'Delimiter', ' ');

writetable(attr, ...
    sprintf('./Tian_Subcortical_S%d/attributes.txt',scale), 'Delimiter', ' ');

writecell(nodename, ...
    sprintf('./Tian_Subcortical_S%d/labels.txt',scale), 'Delimiter', ' ');

writematrix(mat, ...
    sprintf('./Tian_Subcortical_S%d/randmat.txt',scale), 'Delimiter', ' ');


end

