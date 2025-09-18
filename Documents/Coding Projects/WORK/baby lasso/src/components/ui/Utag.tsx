import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/lib/icons';
import { Button } from './button';
import { Modal } from './modal';
import { Input } from './input';

export interface TagItem { id: string; label: string; color?: string }

export const TagBadge = ({ tag, onRemove, className }: { tag: TagItem; onRemove?: () => void; className?: string }) => (
  <span className={cn('inline-flex items-center gap-1 rounded-sm border bg-background px-2 py-0.5 text-xs', className)}>
    <span>{tag.label}</span>
    {onRemove && (
      <button className="text-muted-foreground hover:text-foreground" aria-label={`Remove ${tag.label}`} onClick={onRemove}>
        <Icon name="clear-input" size="sm" />
      </button>
    )}
  </span>
);

export interface TagInputProps extends React.HTMLAttributes<HTMLDivElement> {
  value: TagItem[];
  onChange: (tags: TagItem[]) => void;
  suggestions?: TagItem[];
  placeholder?: string;
}

export const TagInput = ({ value, onChange, suggestions = [], placeholder = 'Add tag…', className }: TagInputProps) => {
  const [text, setText] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const filtered = suggestions.filter((s) => s.label.toLowerCase().includes(text.toLowerCase()) && !value.some(v => v.id === s.id)).slice(0, 8);

  const add = (label: string) => {
    const tag: TagItem = { id: label.toLowerCase().replace(/\s+/g, '-'), label };
    onChange([...value, tag]);
    setText('');
    setOpen(false);
  };

  const remove = (id: string) => onChange(value.filter((t) => t.id !== id));

  return (
    <div className={cn('rounded-md border bg-secondary/30 p-2', className)}>
      <div className="flex flex-wrap items-center gap-2">
        {value.map((t) => (
          <TagBadge key={t.id} tag={t} onRemove={() => remove(t.id)} />
        ))}
        <input
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          value={text}
          onChange={(e) => { setText(e.target.value); setOpen(true); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && text.trim()) { e.preventDefault(); add(text.trim()); }
            if (e.key === 'Backspace' && !text && value.length) { remove(value[value.length - 1].id); }
          }}
          placeholder={placeholder}
        />
      </div>
      {open && text && (
        <div className="mt-2 rounded-md border bg-background p-1 shadow-md">
          {filtered.length === 0 && (
            <button className="w-full rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground" onClick={() => add(text)}>
              Create “{text}”
            </button>
          )}
          {filtered.map((s) => (
            <button key={s.id} className="w-full rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground" onClick={() => add(s.label)}>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export interface TagOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (tag: TagItem) => void;
}

export const TagOverlay = ({ open, onOpenChange, onAdd }: TagOverlayProps) => {
  const [label, setLabel] = React.useState('');
  const handle = () => { if (!label.trim()) return; onAdd({ id: label.toLowerCase().replace(/\s+/g, '-'), label }); setLabel(''); onOpenChange(false); };
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Add Tag" footer={(<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={handle}>Add Tag</Button></div>)}>
      <div className="space-y-2">
        <div className="text-[11px] text-muted-foreground">Tag Label</div>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., hero, prop, env" />
      </div>
    </Modal>
  );
};

export default TagBadge;

