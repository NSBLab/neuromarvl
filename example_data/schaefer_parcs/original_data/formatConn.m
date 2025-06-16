function formatConn(nNodes, nNet)
%%% To run all: 
%   for ii = 100:100:900; for jj = [7,17]; tic; formatConn(ii,jj); toc; end; end; 
%%% Bash code to fix carriage returns; 
% for ii in `ls ./*/labels.txt` ; do sed -i 's/\r$//g' $ii ; done


%% Connectome and Mask
w = full(load('./connectome.mat', 'conn32k').('conn32k')); 
lm = readmatrix('./fsLR_32k_cortex-lh_mask.txt'); 
rm = readmatrix('./fsLR_32k_cortex-rh_mask.txt');
m = [lm; rm]; 

%% ROIs
p = cifti_read(sprintf('./Schaefer2018_%dParcels_%dNetworks_order.dlabel.nii',nNodes,nNet)).cdata; 
pm = p(logical(m)); 

%% Parcellate
out = parcellate2(w, pm); 

%% Save
writematrix(out, ...
    sprintf('../Schaefer2018_%dParcels_%dNetworks/mat.txt',nNodes,nNet), 'Delimiter', ' ');


end 


function out = parcellate2(data, rois)
data = full(data); 
tmp = parcellate1(data,  rois); 
out = parcellate1(tmp.', rois); 
end

function out = parcellate1(data, rois)
% more stable than splitapply - which can struggle with large data
out = nan(max(rois), width(data)); 
for ii = 1:max(rois)
out(ii,:) = mean(data(rois==ii,:),1); 
end
end


