import React from 'react';
import {
  PanelShell,
  PanelSection,
  PanelField,
  PanelEmptyState,
  PanelAccordion,
  PanelImageGrid,
  VariantLabel,
  CopyField
} from './panel';

interface ShotCardData {
  id: string;
  code: string;
  artist: string;
  status: 'Blocking' | 'Layout' | 'Camera' | 'Review';
  description: string;
  thumbnail?: string;
  updated: string;
  duration: string;
}

const stageColors: Record<ShotCardData['status'], string> = {
  Blocking: 'bg-purple-500/20 text-purple-100',
  Layout: 'bg-blue-500/20 text-blue-100',
  Camera: 'bg-emerald-500/20 text-emerald-100',
  Review: 'bg-orange-500/25 text-orange-100'
};

const shotColumns: { id: string; title: string; shots: ShotCardData[] }[] = [
  {
    id: 'blocking',
    title: 'Blocking',
    shots: [
      {
        id: 'prv-010',
        code: 'PRV_010',
        artist: 'L. Kim',
        status: 'Blocking',
        description: 'Dragon touches down and settles on the forest floor.',
        thumbnail: 'https://picsum.photos/seed/prv010/320/180',
        updated: 'Mar 12',
        duration: '135f'
      },
      {
        id: 'prv-012',
        code: 'PRV_012',
        artist: 'J. Patel',
        status: 'Blocking',
        description: 'Secondary characters enter frame and take cover.',
        thumbnail: 'https://picsum.photos/seed/prv012/320/180',
        updated: 'Mar 11',
        duration: '98f'
      },
      {
        id: 'prv-014',
        code: 'PRV_014',
        artist: 'A. Gomez',
        status: 'Blocking',
        description: 'Wide establishing tilt down from clouds to village.',
        thumbnail: 'https://picsum.photos/seed/prv014/320/180',
        updated: 'Mar 10',
        duration: '152f'
      }
    ]
  },
  {
    id: 'layout',
    title: 'Layout',
    shots: [
      {
        id: 'prv-016',
        code: 'PRV_016',
        artist: 'E. Harper',
        status: 'Layout',
        description: 'Camera pan follows rider as dragon banks left.',
        thumbnail: 'https://picsum.photos/seed/prv016/320/180',
        updated: 'Mar 12',
        duration: '120f'
      },
      {
        id: 'prv-018',
        code: 'PRV_018',
        artist: 'E. Harper',
        status: 'Layout',
        description: 'Hero passes camera; background parallax block-in.',
        thumbnail: 'https://picsum.photos/seed/prv018/320/180',
        updated: 'Mar 11',
        duration: '140f'
      },
      {
        id: 'prv-020',
        code: 'PRV_020',
        artist: 'S. Ibarra',
        status: 'Layout',
        description: 'Reverse angle on hero reaction; queued for review.',
        thumbnail: 'https://picsum.photos/seed/prv020/320/180',
        updated: 'Mar 10',
        duration: '110f'
      }
    ]
  },
  {
    id: 'review',
    title: 'In Review',
    shots: [
      {
        id: 'prv-022',
        code: 'PRV_022',
        artist: 'M. Reyes',
        status: 'Review',
        description: 'Reaction shot push-in; notes on timing offset.',
        thumbnail: 'https://picsum.photos/seed/prv022/320/180',
        updated: 'Mar 09',
        duration: '96f'
      },
      {
        id: 'prv-024',
        code: 'PRV_024',
        artist: 'C. Ng',
        status: 'Camera',
        description: 'Dynamic fly-through blocking camera polish pass.',
        thumbnail: 'https://picsum.photos/seed/prv024/320/180',
        updated: 'Mar 08',
        duration: '180f'
      },
      {
        id: 'prv-026',
        code: 'PRV_026',
        artist: 'C. Ng',
        status: 'Review',
        description: 'Final beat match cut to flame burst, awaiting sign-off.',
        thumbnail: 'https://picsum.photos/seed/prv026/320/180',
        updated: 'Mar 07',
        duration: '102f'
      }
    ]
  }
];

const selectedShot = {
  code: 'PRV_018',
  sequence: 'Seq 010',
  duration: '140 frames',
  artist: 'E. Harper',
  status: 'Layout polish',
  path: '/projects/dragon/seq010/prv/prv_018',
  tags: ['dragon', 'hero', 'interior cave'],
  reviewers: [
    { id: 'art', label: 'Art Direction', color: 'bg-pink-500/20 text-pink-100' },
    { id: 'modeling', label: 'Env Support', color: 'bg-sky-500/20 text-sky-100' },
    { id: 'lookdev', label: 'Lighting Prep', color: 'bg-amber-500/20 text-amber-100' }
  ],
  notes: [
    { id: 1, author: 'Art Direction', note: 'Tighten hold on beat 32, give hero a half-beat glance.' },
    { id: 2, author: 'Director', note: 'Push camera 10cm closer at climax for scale.' }
  ],
  history: [
    'Mar 12 — Layout polish uploaded by E. Harper',
    'Mar 11 — Director review pass, action items logged',
    'Mar 09 — Initial layout approved for polish'
  ],
  checklist: [
    { label: 'Blocking', done: true },
    { label: 'Camera polish', done: true },
    { label: 'Director notes', done: false },
    { label: 'Publish for downstream', done: false }
  ],
  stills: Array.from({ length: 6 }).map((_, i) => ({
    src: `https://picsum.photos/seed/prv018-${i}/240/160`,
    title: `Frame ${i * 12 + 48}`
  }))
};

const PrevizShotCard = ({ shot }: { shot: ShotCardData }) => (
  <div className="rounded-md border bg-background p-2 shadow-sm">
    <div className="aspect-video w-full overflow-hidden rounded-sm bg-muted/40">
      {shot.thumbnail ? (
        <img src={shot.thumbnail} alt={shot.code} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No Preview</div>
      )}
    </div>
    <div className="mt-2 flex items-start justify-between gap-2">
      <div>
        <div className="text-xs font-semibold leading-tight">{shot.code}</div>
        <div className="text-[11px] text-muted-foreground leading-tight">{shot.artist}</div>
      </div>
      <VariantLabel label={shot.status} color={stageColors[shot.status]} />
    </div>
    <div className="mt-2 text-[11px] leading-snug text-muted-foreground">{shot.description}</div>
    <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
      <span>Updated {shot.updated}</span>
      <span>{shot.duration}</span>
    </div>
  </div>
);

export const PrevizInfoPanel = () => {
  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          {shotColumns.map((column) => (
            <PanelShell key={column.id} title={`${column.title} (${column.shots.length})`}>
              <PanelSection>
                <div className="space-y-3">
                  {column.shots.map((shot) => (
                    <PrevizShotCard key={shot.id} shot={shot} />
                  ))}
                </div>
              </PanelSection>
            </PanelShell>
          ))}
        </div>
        <PanelShell title="Incoming Shots" actions={[{ key: 'queue', icon: 'tray-arrow-up' }] }>
          <PanelSection>
            <PanelEmptyState className="h-32" variant="none" />
          </PanelSection>
        </PanelShell>
      </div>

      <div className="space-y-4">
        <PanelShell
          title={`Shot ${selectedShot.code}`}
          actions={[{ key: 'launch', icon: 'box-arrow-up-right', title: 'Open in viewer' }, { key: 'sync', icon: 'arrow-clockwise', title: 'Sync latest' }]}
        >
          <PanelSection title="Shot Overview">
            <PanelField label="Sequence" value={<span>{selectedShot.sequence}</span>} icon="list-ol" />
            <PanelField label="Duration" value={<span>{selectedShot.duration}</span>} icon="clock" />
            <PanelField label="Assigned" value={<span>{selectedShot.artist}</span>} icon="person-circle" />
            <PanelField label="Status" value={<span>{selectedShot.status}</span>} icon="badge-vr" />
            <PanelField label="Library Path" value={<CopyField value={selectedShot.path} />} icon="link-45deg" />
          </PanelSection>
          <PanelSection title="Reviewers">
            <div className="flex flex-wrap gap-2">
              {selectedShot.reviewers.map((r) => (
                <VariantLabel key={r.id} label={r.label} color={r.color} />
              ))}
            </div>
          </PanelSection>
          <PanelSection title="Tags">
            <div className="flex flex-wrap gap-2">
              {selectedShot.tags.map((tag) => (
                <VariantLabel key={tag} label={tag} />
              ))}
            </div>
          </PanelSection>
          <PanelSection title="Key Frames">
            <PanelImageGrid items={selectedShot.stills} />
          </PanelSection>
        </PanelShell>

        <PanelShell title="Notes & Activity">
          <PanelSection title="Director & Department Notes">
            <div className="space-y-2 text-[11px]">
              {selectedShot.notes.map((note) => (
                <div key={note.id} className="rounded-md border bg-muted/20 p-2">
                  <div className="mb-1 text-xs font-semibold">{note.author}</div>
                  <div className="text-muted-foreground leading-snug">{note.note}</div>
                </div>
              ))}
            </div>
          </PanelSection>
          <PanelSection title="Checklist">
            <div className="space-y-1.5 text-[11px]">
              {selectedShot.checklist.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-sm border bg-background px-2 py-1">
                  <span>{item.label}</span>
                  <VariantLabel label={item.done ? 'Done' : 'Pending'} color={item.done ? 'bg-emerald-500/20 text-emerald-100' : 'bg-secondary/60'} />
                </div>
              ))}
            </div>
          </PanelSection>
          <PanelSection title="History">
            <PanelAccordion title="Recent Updates" defaultOpen>
              <div className="space-y-1">
                {selectedShot.history.map((entry, idx) => (
                  <div key={idx}>{entry}</div>
                ))}
              </div>
            </PanelAccordion>
          </PanelSection>
        </PanelShell>
      </div>
    </div>
  );
};

export default PrevizInfoPanel;
