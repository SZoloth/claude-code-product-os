import React from 'react';
import { PanelShell, PanelSection, PanelField, PanelEmptyState, PanelAccordion } from './panel';

export const CFXInfoPanel = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PanelShell title="Default">
          <PanelSection title="Preview">
            <PanelEmptyState variant="none" />
          </PanelSection>
        </PanelShell>
        <PanelShell title="Image Hover">
          <PanelSection title="Preview">
            <PanelEmptyState variant="multiple" />
          </PanelSection>
        </PanelShell>
        <PanelShell title="Versions">
          <PanelSection>
            <PanelField label="Version 3" value={<span>Reduced size by 20% and improved proportions</span>} icon="file-earmark-text-fill" />
            <PanelField label="Version 2" value={<span>Minor changes to color</span>} icon="file-earmark-text-fill" />
            <PanelField label="Version 1" value={<span>Character proportions were adjusted</span>} icon="file-earmark-text-fill" />
          </PanelSection>
        </PanelShell>
      </div>
      <PanelShell title="CFX Panel Details">
        <PanelSection title="Details">
          <PanelField label="Latest Version" value={<span>3</span>} icon="tag-fill" />
          <PanelField label="Library Path" value={<code className="text-xs">/assets/cfx/nun_dress</code>} icon="link-45deg" />
          <PanelField label="Tags" value={<span>smile, quad</span>} icon="tag-fill" />
        </PanelSection>
      </PanelShell>
      <PanelShell title="History Accordions">
        <PanelSection>
          <PanelAccordion title="Collapsed (default)">
            <div>11/04/2024 11:11 AM — Initial ingestion</div>
          </PanelAccordion>
          <PanelAccordion title="Expanded" defaultOpen>
            <div className="space-y-1">
              <div>12/01/2024 — Version 3: reduce size, better proportions</div>
              <div>11/21/2024 — Version 2: color tweaks</div>
            </div>
          </PanelAccordion>
        </PanelSection>
      </PanelShell>
    </div>
  );
};

export default CFXInfoPanel;
