import React from 'react';
import { PanelShell, PanelEmptyState, PanelSection, PanelField, PanelIconGrid } from './panel';

export const GlobalPanelExamples = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <PanelShell title="No Items Selected" actions={[{ key: 'close', icon: 'clear-input' }, { key: 'settings', icon: 'gear-fill' }, { key: 'menu', icon: 'three-dots-vertical' }] }>
        <PanelEmptyState variant="none" />
      </PanelShell>
      <PanelShell title="Multiple Items Selected" actions={[{ key: 'close', icon: 'clear-input' }, { key: 'settings', icon: 'gear-fill' }, { key: 'menu', icon: 'three-dots-vertical' }] }>
        <PanelEmptyState variant="multiple" />
      </PanelShell>

      <PanelShell title="Panel Icons">
        <PanelSection>
          <PanelIconGrid
            icons={[
              { label: 'Version', icon: 'tag-fill' },
              { label: 'Geometry', icon: 'geometry' },
              { label: 'Bbox Radius', icon: 'diamond' },
              { label: 'Version Notes', icon: 'file-earmark-text-fill' },
              { label: 'Created by', icon: 'person-circle' },
              { label: 'Last Modified', icon: 'calendar-event-fill' },
              { label: 'Show', icon: 'image' },
              { label: 'Asset Location', icon: 'folder-fill' },
              { label: 'Sequences', icon: 'sliders2' },
              { label: 'Maya Tag', icon: 'lasso-modeling' as any },
              { label: 'Library Path', icon: 'link-45deg' },
              { label: 'Tags', icon: 'tag-fill' },
            ]}
          />
        </PanelSection>
      </PanelShell>
    </div>
  );
};

export default GlobalPanelExamples;

