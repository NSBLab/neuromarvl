%% Rename Diedrichsen files
d = dir('fs_LR*.gii');
for ii = 1:length(d)
    hemi =          regexp(d(ii).name, '32k\.([LR])\.[^\.]+\.surf\.gii', 'tokens'); 
    surfacetype =   regexp(d(ii).name, '32k\.[LR]\.([^\.])+\.surf\.gii', 'tokens'); 
    newname = sprintf('tpl-fsLR_den-32k_hemi-%s_%s.surf.gii', hemi{1}{1}, surfacetype{1}{1}); 
    movefile(d(ii).name, newname);
end

%% gifti to obj
d = dir('*.gii'); 
for ii = 1:length(d)
    [~, name] = fileparts(d(ii).name); 
    g = gifti(d(ii).name);
    simplePatchToObj(g, append('..', filesep, name, '.obj'));
end
