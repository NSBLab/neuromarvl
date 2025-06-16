function formatData(nNodes, nNet)
%%% Bash code to fix carriage returns; 
% for ii in `ls ./*/labels.txt` ; do sed -i 's/\r$//g' $ii ; done


%% Surface and parcellation

[a,b] = read_vtk('fsLR_32k_midthickness-lh.vtk'); 
[vl, fl] = deal(a', b'); 
[a,b] = read_vtk('fsLR_32k_midthickness-rh.vtk'); 
[vr, fr] = deal(a', b'); 
clear a b

p = cifti_read(sprintf('Schaefer2018_%dParcels_%dNetworks_order.dlabel.nii',nNodes,nNet)).cdata; 
pl = p(1:end/2); 
pr = denumber(p(end/2+1:end))-1;


%% Coordinates
cl = []; 
for ii = 1:nNodes/2
    [a,b] = trimExcludedRois(vl,fl,pl==ii);
    try
        cl(ii,:) = a(meshFrechet(a,b),:); 
    catch
        cl(ii,:) = mean(a,1); 
    end
end

cr = []; 
for ii = 1:nNodes/2
    [a,b] = trimExcludedRois(vr,fr,pr==ii);
    try
        cr(ii,:) = a(meshFrechet(a,b),:); 
    catch
        cr(ii,:) = mean(a,1); 
    end 
end
clear a b


%% Node Names

nodename = readcell(sprintf('Schaefer2018_%dParcels_%dNetworks_order_info.txt',nNodes,nNet));
nodename = nodename(1:2:end); 
nodename = regexprep(nodename, '^.*Networks_', ''); 


%% Network Name and ID

netname = readcell(sprintf('Schaefer2018_%dParcels_%dNetworks_order_info.txt',nNodes,nNet));
netname = netname(1:2:end); 

netname = regexprep(netname, '^.*Networks_.?H_', ''); 
netname = regexprep(netname, '_.*', ''); 

[~,~,netid] = unique(netname, 'sorted'); 


%% Plot
figure; 
plotBrain(vl, fl, pl, netid(1:end/2)); 
hold on; 
scat3(cl,50,'r','filled'); 

plotBrain(vr, fr, pr, netid(end/2+1:end)); 
scat3(cr,50,'r','filled'); 

colormap(lines(nNet)); 
colorbar; 


%% Save
writetable(table([cl(:,1);cr(:,1)], [cl(:,2);cr(:,2)], [cl(:,3);cr(:,3)], 'VariableNames', {'x', 'y', 'z'}), ...
    sprintf('./Schaefer2018_%dParcels_%dNetworks/coords.txt',nNodes,nNet), 'Delimiter', ' ');

writetable(table(netid, netid+(1:nNodes>=nNodes/2)'*nNet, 'VariableNames', {'Network_ID', 'Network_ID_LR'}), ...
    sprintf('./Schaefer2018_%dParcels_%dNetworks/attributes.txt',nNodes,nNet), 'Delimiter', ' ');

writecell(nodename, ...
    sprintf('./Schaefer2018_%dParcels_%dNetworks/labels.txt',nNodes,nNet), 'Delimiter', ' ');

writematrix(randsym(nNodes, 0.175, nNodes), ...
    sprintf('./Schaefer2018_%dParcels_%dNetworks/randmat.txt',nNodes,nNet), 'Delimiter', ' ');

end
