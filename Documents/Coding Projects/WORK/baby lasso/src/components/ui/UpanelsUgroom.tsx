import React from 'react';
import { PanelShell, PanelSection, PanelField, VariantLabel, PanelImageGrid, PanelAccordion, CopyField } from './panel';

export const GroomInfoPanel = () => {
  return (
    <PanelShell title="Groom Panel">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PanelSection title="Groom Panel Details">
          <PanelField label="Shell" value={<span>hair_dubes.mm</span>} icon="file-earmark-text-fill" />
          <PanelField label="Source Model" value={<span>skin_1.2mm</span>} icon="box" />
          <PanelField label="Working Data" value={<span>g_working_data</span>} icon="folder" />
          <PanelField label="Final Hair" value={<span>hair_char</span>} icon="diamond" />
          <PanelField label="Library Path" value={<CopyField value={'/assets/groom/hair_dubes'} />} icon="link-45deg" />
        </PanelSection>
        <PanelSection title="Variant Labels">
          <div className="flex flex-wrap gap-2">
            {['bun','long','curly','side bangs','alt','hero'].map((l) => (
              <VariantLabel key={l} label={l} />
            ))}
          </div>
        </PanelSection>
        <PanelSection title="Image Cards">
          <PanelImageGrid items={Array.from({length:9}).map((_,i)=>({ title:`head_${(i%3)}`, src:`https://picsum.photos/seed/groom${i}/200/200`}))} />
        </PanelSection>
        <PanelSection title="History">
          <PanelAccordion title="Collapsed">
            <div>11/04/2024, 11:11 AM — Initial ingestion</div>
          </PanelAccordion>
          <PanelAccordion title="Expanded" defaultOpen>
            <div className="space-y-1">
              <div>12/19/2024, 3:32 PM — Fix scalp weight</div>
              <div>12/18/2024, 9:10 AM — Ingest meshes</div>
              <div>12/17/2024, 9:55 PM — Groom update</div>
            </div>
          </PanelAccordion>
        </PanelSection>
      </div>
    </PanelShell>
  );
};

export default GroomInfoPanel;
