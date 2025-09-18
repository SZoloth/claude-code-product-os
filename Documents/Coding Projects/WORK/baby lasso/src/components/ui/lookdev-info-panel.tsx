import React from 'react';
import { PanelShell, PanelSection, PanelField, PanelAccordion, PanelImageGrid } from './panel';

export const LookDevInfoPanel = () => {
  return (
    <PanelShell title="LookDev Panel" actions={[{ key: 'close', icon: 'clear-input' }, { key: 'settings', icon: 'gear-fill' }] }>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PanelSection title="Look Source Accordions">
          <PanelAccordion title="HDRIs" defaultOpen right={<span>4</span>}>
            <PanelImageGrid items={Array.from({length:4}).map((_,i)=>({src:`https://picsum.photos/seed/hdri${i}/200/200`}))} />
          </PanelAccordion>
          <PanelAccordion title="Textures" right={<span>12</span>}>
            <div className="text-xs">Diffuse, Normal, Roughness…</div>
          </PanelAccordion>
        </PanelSection>
        <PanelSection title="Source File (Active)">
          <PanelField label="Scene" value={<code className="text-xs">/scenes/lookdev/dragon/lookdev_v003.ma</code>} icon="link-45deg" />
          <PanelField label="Renderer" value={<span>Arnold</span>} icon="diamond" />
        </PanelSection>
      </div>
    </PanelShell>
  );
};

export default LookDevInfoPanel;
