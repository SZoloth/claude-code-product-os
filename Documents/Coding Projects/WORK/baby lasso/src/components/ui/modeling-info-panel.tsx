import React from 'react';
import { PanelShell, PanelSection, PanelField, PanelEmptyState, PanelAccordion, PanelImageGrid } from './panel';

export const ModelingInfoPanel = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PanelShell title="Properties (Active)">
          <PanelSection title="Model Details">
            <PanelField label="Version" value={<span>v3</span>} icon="tag-fill" />
            <PanelField label="LOD" value={<span>2</span>} icon="box" />
            <PanelField label="Scale" value={<span>1.0</span>} icon="diamond" />
          </PanelSection>
        </PanelShell>
        <PanelShell title="Sub Assets">
          <PanelSection>
            <PanelField label="Parts" value={<span>Head, Body, Eyes</span>} icon="layers3" />
          </PanelSection>
        </PanelShell>
        <PanelShell title="Versions">
          <PanelSection>
            <PanelField label="Latest" value={<span>Notes on the latest version change</span>} icon="file-earmark-text-fill" />
          </PanelSection>
        </PanelShell>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PanelShell title="No Items Selected">
          <PanelEmptyState variant="none" />
        </PanelShell>
        <PanelShell title="Multiple Items Selected">
          <PanelEmptyState variant="multiple" />
        </PanelShell>
      </div>
      <PanelShell title="Modeling Panel Details">
        <PanelSection title="Details">
          <PanelField label="Location" value={<code className="text-xs">/assets/dragon/modeling</code>} icon="link-45deg" />
          <PanelField label="Keywords" value={<span>character, modeling</span>} icon="tag-fill" />
        </PanelSection>
      </PanelShell>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PanelShell title="Image Over Source Image">
          <PanelSection>
            <PanelImageGrid items={Array.from({length:10}).map((_,i)=>({src:`https://picsum.photos/seed/modeling${i}/200/200`}))} />
          </PanelSection>
        </PanelShell>
        <PanelShell title="Version Items">
          <PanelSection>
            <PanelAccordion title="Version 3" defaultOpen>
              <div>Notes about v3 changes…</div>
            </PanelAccordion>
            <PanelAccordion title="Version 2">
              <div>Minor changes to topology…</div>
            </PanelAccordion>
          </PanelSection>
        </PanelShell>
      </div>
    </div>
  );
};

export default ModelingInfoPanel;
