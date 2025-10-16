clear;

[LInflatedV, LInflatedF] = read_obj('tpl-fsLR_den-32k_hemi-L_inflated.surf.obj');
[RInflatedV, RInflatedF] = read_obj('tpl-fsLR_den-32k_hemi-R_inflated.surf.obj');

[LMidV, LMidF] = read_obj('tpl-fsLR_den-32k_hemi-L_midthickness.surf.obj');
[RMidV, RMidF] = read_obj('tpl-fsLR_den-32k_hemi-R_midthickness.surf.obj');

clf;
%patch('Vertices', LInflatedV, 'Faces', LInflatedF, 'FaceColor', 'r');
%patch('Vertices', LMidV, 'Faces', LMidF, 'FaceColor', 'g');

axis equal;

[~, MidRInflatedZ] = procrustes(RMidV, RInflatedV);
[~, MidLInflatedZ] = procrustes(LMidV, LInflatedV);
patch('Vertices', LMidV, 'Faces', LMidF, 'FaceColor', 'r');
patch('Vertices', MidLInflatedZ, 'Faces', LInflatedF, 'FaceColor', 'g');

save_obj('tpl-fsLR_den-32k_hemi-L_inflatedscaled.surf.obj', MidLInflatedZ, LInflatedF);
save_obj('tpl-fsLR_den-32k_hemi-R_inflatedscaled.surf.obj', MidRInflatedZ, RInflatedF);