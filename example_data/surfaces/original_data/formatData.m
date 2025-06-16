%% Convert original giftis (one hemisphere) to obj's
d = dir('*.gii'); 

for ii = 1:length(d)
    [~, name] = fileparts(d(ii).name); 
    g = gifti(d(ii).name);
    simplePatchToObj(g, append(name, '.obj'));
end


%% Combine hemispheres into 1 surface
d = dir('*hemi-L*.gii'); 

for ii = 1:length(d)
    nameL = d(ii).name; 
    nameR = regexprep(nameL, "hemi-L", "hemi-R"); 

    gL = gifti(nameL); 
    gR = gifti(nameR); 

    gB = joinPatches(gL.vertices, gL.faces, gR.vertices, gR.faces); 

    [~,outname] = fileparts(nameL); 
    outname = regexprep(outname, "hemi-L", "hemi-B"); 
    simplePatchToObj(gB, append(outname, '.obj'));
end


