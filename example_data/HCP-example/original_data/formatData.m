%% Coords
s = simpleObjToPatch('tpl-fsLR_den-32k_hemi-B_midthickness.surf.obj'); 
r = unmask( [gifti('tpl-fsLR_den-32k_hemi-L_desc-nomedialwall_dparc.label.gii').cdata; ...
    gifti('tpl-fsLR_den-32k_hemi-R_desc-nomedialwall_dparc.label.gii').cdata]   ,...
    gifti('tpl-fsLR_den-32k_hemi-B_desc-mmpmasked_dparc.label.gii').cdata, 0); 

coords = [];
for ii = 1:360
    [v,f] = trimExcludedRois(s.vertices, s.faces, r==ii); 
    coords(ii,:) = v(meshFrechet(v,f),:); %#ok<SAGROW>
end

coords = table(coords(:,1), coords(:,2), coords(:,3), 'VariableNames',{'x','y','z'}); 

%% Attributes
mat = readmatrix('mat.txt');
str = sum(mat,2); 

netid = splitapply(@mode, ...
    gifti('tpl-fsLR_den-32k_hemi-B_desc-canetmasked_dparc.label.gii').cdata, ...
    gifti('tpl-fsLR_den-32k_hemi-B_desc-mmpmasked_dparc.label.gii').cdata );

attr = table(netid, str, 'VariableNames', {'Network_ID', 'Strength'});


%% Plot
figure; 
nexttile; plotBrain(s.vertices, s.faces, r); axis image; 
hold on; scat3(coords, 50, 'r', 'filled'); 

nexttile; plotBrain(s.vertices, s.faces, r, netid, 'colorbarOn', 1, 'colormap', lines(12)); 

%% Save
writetable(coords, '../coords.txt', 'Delimiter', ' '); 
writetable(attr, '../attr.txt', 'Delimiter', ' '); 

