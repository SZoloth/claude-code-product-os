import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Select, type SelectOption } from './select';
import { SegmentedControl } from './segmented-control';
import { Input } from './input';
import { Modal } from './modal';
import { Icon } from '@/lib/icons';

export type FieldType = 'text' | 'number' | 'select' | 'date';

export interface FilterField {
  id: string;
  label: string;
  type: FieldType;
  options?: SelectOption[]; // for select type
}

export type LogicalOp = 'AND' | 'OR';

export interface FilterRule {
  id: string;
  fieldId: string;
  operator: string;
  value?: string;
  enabled?: boolean;
}

export interface RuleGroup {
  id: string;
  op: LogicalOp;
  items: Array<{ type: 'rule'; rule: FilterRule } | { type: 'group'; group: RuleGroup }>;
}

// Helpers
const newId = () => Math.random().toString(36).slice(2, 9);

const defaultOperators: Record<FieldType, SelectOption[]> = {
  text: [
    { label: 'contains', value: 'contains' },
    { label: 'equals', value: 'eq' },
    { label: 'starts with', value: 'starts' },
    { label: 'ends with', value: 'ends' },
    { label: 'not contains', value: 'not_contains' },
  ],
  number: [
    { label: '=', value: 'eq' },
    { label: '≠', value: 'neq' },
    { label: '>', value: 'gt' },
    { label: '≥', value: 'gte' },
    { label: '<', value: 'lt' },
    { label: '≤', value: 'lte' },
  ],
  select: [
    { label: 'is', value: 'eq' },
    { label: 'is not', value: 'neq' },
  ],
  date: [
    { label: 'on', value: 'on' },
    { label: 'before', value: 'before' },
    { label: 'after', value: 'after' },
  ],
};

export const FilterRuleRow = ({
  rule,
  fields,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  rule: FilterRule;
  fields: FilterField[];
  onChange: (r: FilterRule) => void;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) => {
  const field = fields.find((f) => f.id === rule.fieldId) || fields[0];
  const ops = defaultOperators[field.type];
  return (
    <div className="flex items-center gap-2 rounded-sm border bg-background p-2">
      <input
        type="checkbox"
        checked={rule.enabled ?? true}
        onChange={(e) => onChange({ ...rule, enabled: e.target.checked })}
        className="h-3 w-3"
        aria-label="Enable rule"
      />
      <Select
        value={rule.fieldId}
        onChange={(v) => onChange({ ...rule, fieldId: v })}
        options={fields.map((f) => ({ label: f.label, value: f.id }))}
        size="sm"
      />
      <Select
        value={rule.operator}
        onChange={(v) => onChange({ ...rule, operator: v })}
        options={ops}
        size="sm"
      />
      {field.type === 'select' ? (
        <Select
          value={rule.value}
          onChange={(v) => onChange({ ...rule, value: v })}
          options={field.options || []}
          size="sm"
        />
      ) : field.type === 'date' ? (
        <input
          type="date"
          className="h-8 rounded-sm border bg-background px-2 text-xs"
          value={rule.value || ''}
          onChange={(e) => onChange({ ...rule, value: e.target.value })}
        />
      ) : (
        <Input
          value={rule.value || ''}
          onChange={(e) => onChange({ ...rule, value: e.target.value })}
          className="h-8 text-xs"
        />
      )}
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMoveUp} aria-label="Move up">
          <Icon name="caret-up-fill" size="sm" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMoveDown} aria-label="Move down">
          <Icon name="caret-down-fill" size="sm" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRemove} aria-label="Remove">
          <Icon name="clear-input" size="sm" />
        </Button>
      </div>
    </div>
  );
};

export const RuleGroupCard = ({
  group,
  fields,
  onChange,
  depth = 0,
}: {
  group: RuleGroup;
  fields: FilterField[];
  onChange: (g: RuleGroup) => void;
  depth?: number;
}) => {
  const updateItem = (idx: number, item: RuleGroup['items'][number]) => {
    const next = [...group.items];
    next[idx] = item;
    onChange({ ...group, items: next });
  };
  const removeItem = (idx: number) => {
    const next = [...group.items];
    next.splice(idx, 1);
    onChange({ ...group, items: next });
  };
  const move = (idx: number, delta: number) => {
    const next = [...group.items];
    const newIdx = Math.max(0, Math.min(next.length - 1, idx + delta));
    if (newIdx === idx) return;
    const [it] = next.splice(idx, 1);
    next.splice(newIdx, 0, it);
    onChange({ ...group, items: next });
  };
  const addRule = () => {
    const field = fields[0];
    const rule: FilterRule = { id: newId(), fieldId: field.id, operator: defaultOperators[field.type][0].value, value: '', enabled: true };
    onChange({ ...group, items: [...group.items, { type: 'rule', rule }] });
  };
  const addGroup = () => {
    const sub: RuleGroup = { id: newId(), op: 'AND', items: [] };
    onChange({ ...group, items: [...group.items, { type: 'group', group: sub }] });
  };

  return (
    <div className={cn('space-y-2 rounded-md border p-3', depth > 0 && 'bg-secondary/20') }>
      <div className="flex items-center justify-between">
        <SegmentedControl
          segments={[{ label: 'AND', value: 'AND' }, { label: 'OR', value: 'OR' }] as any}
          value={group.op as any}
          onChange={(v:any) => onChange({ ...group, op: v })}
        />
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 px-2" onClick={addRule}><Icon name="plus" size="sm" />Add rule</Button>
          <Button size="sm" variant="outline" className="h-8 px-2" onClick={addGroup}><Icon name="plus" size="sm" />Add group</Button>
        </div>
      </div>
      <div className="space-y-2">
        {group.items.map((item, idx) => (
          item.type === 'rule' ? (
            <FilterRuleRow
              key={item.rule.id}
              rule={item.rule}
              fields={fields}
              onChange={(r) => updateItem(idx, { type: 'rule', rule: r })}
              onRemove={() => removeItem(idx)}
              onMoveUp={() => move(idx, -1)}
              onMoveDown={() => move(idx, 1)}
            />
          ) : (
            <RuleGroupCard key={item.group.id} group={item.group} fields={fields} onChange={(g) => updateItem(idx, { type: 'group', group: g })} depth={depth + 1} />
          )
        ))}
      </div>
    </div>
  );
};

export interface FilterBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: FilterField[];
  value: RuleGroup;
  onChange: (g: RuleGroup) => void;
  onApply?: () => void;
}

export const FilterBuilderDialog = ({ open, onOpenChange, fields, value, onChange, onApply }: FilterBuilderDialogProps) => {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Advanced Filters Builder"
      footer={(
        <div className="flex w-full items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onApply}>Apply</Button>
        </div>
      )}
    >
      <RuleGroupCard group={value} fields={fields} onChange={onChange} />
    </Modal>
  );
};

export default FilterBuilderDialog;
