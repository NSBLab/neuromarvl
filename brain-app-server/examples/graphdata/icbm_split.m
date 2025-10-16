clear;

% Prefix = 'BrainMesh_ch2_withhemi';
% disp([Prefix '.obj']);
% [VO, FO, FOHemi] = read_obj_with_hemi([Prefix '.obj']);
% 
% VOA = VO(FO(:, 1), :);
% VOB = VO(FO(:, 2), :);
% VOC = VO(FO(:, 3), :);
% FOCentroids = (VOA + VOB + VOC) / 3;

%keyboard;
Prefixes = {'BrainMesh_ICBM152', 'BrainMesh_ch2'};

for z = 1:length(Prefixes)
    Prefix = Prefixes{z};
    [V, F] = read_obj([Prefix '.obj']);
    clf;
    A = graph_adjacency(V, F);
    
    [L, numLabels] = adjacency_bwlabel(A, ones(size(V, 1), 1));
    
    %FF = {'l', 'r'};
    %FaceLabels = L(F(:, 1));
    % right hemi is 2
    
    %[~, ~, TreeRoot] = kdtree(FOCentroids, []);
    %[IDX, ~, TreeRoot] = kdtreeidx([], FC, TreeRoot);
    %keyboard;
    
    % right is positive x
    Centroids = zeros(1, numLabels);
    for k = 1:numLabels
        Centroids(k) = mean(V(L == k), 1);
    end

    [~, S] = sort(Centroids);

    HemiLabels = {'lh', 'rh'};

    for k = 1:numLabels
        ValidVertices = find(L == S(k));
        ValidFaces = all(ismember(F, ValidVertices), 2);
        [~, NewFaces] = ismember(F(ValidFaces, :), ValidVertices);
        FID = fopen([Prefix '_' HemiLabels{k} '.obj'], 'w');
        fprintf(FID, 'v %f %f %f\n', V(ValidVertices, :)');
        fprintf(FID, 'f %d %d %d\n', NewFaces');
        
        fclose(FID);
    end
    %C = double(FacesL);
    %#patch('Vertices', V, 'Faces', F, 'FaceColor', 'interp', 'FaceVertexCData', L, 'EdgeColor', 'none', 'FaceAlpha', 0.1);
    %#patch('Vertices', VO, 'Faces', FO, 'FaceColor', 'flat', 'FaceVertexCData', double(FOHemi == 'l'), 'EdgeColor', 'none', 'FaceAlpha', 0.1);
    %axis equal;
    %lighting gouraud;
    %light;
end

%keyboard;
% FID = fopen([Prefix '_withhemi.obj'], 'w');
% fprintf(FID, 'v %f %f %f\n', V');
% 
% for z = 1:size(F, 1)
%     fprintf(FID, 'f %d %d %d %c\n', F(z, :), FF{FaceLabels(z)});
% end
% fclose(FID);