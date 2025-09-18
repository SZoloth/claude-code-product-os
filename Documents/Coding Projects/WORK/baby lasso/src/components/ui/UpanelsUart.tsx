import React from 'react';
import { PanelShell, PanelSection, PanelField } from './panel';

export const ArtInfoPanel = () => {
  return (
    <PanelShell title="Art Panel Details" actions={[{ key: 'close', icon: 'clear-input' }, { key: 'settings', icon: 'gear-fill' }, { key: 'menu', icon: 'three-dots-vertical' }] }>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <PanelSection title="Details">
            <PanelField label="Latest Version" value={<span>3</span>} icon="tag-fill" />
            <PanelField label="Created By" value={<span>Matt Paulson</span>} icon="person-circle" />
            <PanelField label="Last Modified" value={<span>Dec 4, 2019</span>} icon="calendar-event-fill" />
          </PanelSection>
          <PanelSection title="Legal Details">
            <PanelField label="Show" value={<span>Dragon Movie</span>} icon="bank2" />
            <PanelField label="Character" value={<span>Donkey</span>} icon="user" />
            <PanelField label="Assembly" value={<span>Character Assembly</span>} icon="layers3" />
          </PanelSection>
        </div>
        <div>
          <PanelSection title="Library Path">
            <PanelField label="Path" value={<code className="text-xs">/studio/assets/characters/donkey</code>} icon="link-45deg" />
          </PanelSection>
          <PanelSection title="Tags">
            <PanelField label="Tags" value={<span>hero, quad, art</span>} icon="tag-fill" />
          </PanelSection>
        </div>
      </div>
    </PanelShell>
  );
};

export default ArtInfoPanel;

