import React from 'react';
import { PanelShell, PanelSection, PanelField, PanelEmptyState, PanelImageGrid, PanelAccordion } from './panel';

export const FLOInfoPanel = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PanelShell title="Properties">
          <PanelSection>
            <PanelField label="LOD" value={<span>2</span>} icon="box" />
            <PanelField label="Scale" value={<span>1.0</span>} icon="diamond" />
          </PanelSection>
        </PanelShell>
        <PanelShell title="Sub Assets (Active)">
          <PanelSection>
            <PanelField label="Items" value={<span>Head, Body, Tail</span>} icon="layers3" />
          </PanelSection>
        </PanelShell>
        <PanelShell title="No / Multiple Selection">
          <div className="grid grid-cols-2 gap-2">
            <PanelEmptyState variant="none" />
            <PanelEmptyState variant="multiple" />
          </div>
        </PanelShell>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PanelShell title="FLO Panel Details">
          <PanelSection title="Details">
            <PanelField label="Updated" value={<span>Dec 6, 2024</span>} icon="calendar-event-fill" />
            <PanelField label="Keywords" value={<span>rig, sims</span>} icon="tag-fill" />
          </PanelSection>
        </PanelShell>
        <PanelShell title="Image Card Source Images">
          <PanelSection>
            <PanelImageGrid items={Array.from({length:12}).map((_,i)=>({src:`https://picsum.photos/seed/flo${i}/200/200`}))} />
          </PanelSection>
        </PanelShell>
      </div>
      <PanelShell title="Version Items with Components">
        <PanelSection>
          <PanelAccordion title="Action 1" defaultOpen>
            <div>Left aligned content with actions…</div>
          </PanelAccordion>
          <PanelAccordion title="Action 2">
            <div>Another item…</div>
          </PanelAccordion>
        </PanelSection>
      </PanelShell>
    </div>
  );
};

export default FLOInfoPanel;
