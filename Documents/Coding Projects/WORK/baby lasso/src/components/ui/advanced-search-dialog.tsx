import React from 'react';
import { Modal } from './modal';
import { Button } from './button';
import { FacetMultiSelect, type FacetOption } from './facet-multi-select';
import { DateRangeFacet, type DateRangeValue } from './date-range-facet';
import { NumberRangeFacet, type NumberRangeValue } from './number-range-facet';
import { KeyValueList, type KeyValueItem } from './key-value-list';
import { SegmentedControl } from './segmented-control';
import { cn } from '@/lib/utils';

export interface AdvancedSearchState {
  fileTypes: string[];
  dateCreated: DateRangeValue;
  jobContainer: KeyValueItem[];
  imageSize?: NumberRangeValue;
  matchMode?: 'any' | 'all';
}

export interface AdvancedSearchDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: AdvancedSearchState;
  onChange: (state: AdvancedSearchState) => void;
  onApply?: () => void;
  onClear?: () => void;
}

const defaultFileTypeOptions: FacetOption[] = [
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
  { label: '3D Model', value: 'model' },
  { label: 'Texture', value: 'texture' },
  { label: 'Audio', value: 'audio' },
];

export const AdvancedSearchDialog = ({ open, onOpenChange, state, onChange, onApply, onClear, className }: AdvancedSearchDialogProps) => {
  const setFileTypes = (values: string[]) => onChange({ ...state, fileTypes: values });
  const setDate = (value: DateRangeValue) => onChange({ ...state, dateCreated: value });
  const setJobContainer = (items: KeyValueItem[]) => onChange({ ...state, jobContainer: items });
  const setImageSize = (value: NumberRangeValue) => onChange({ ...state, imageSize: value });
  const setMatchMode = (mode: 'any' | 'all') => onChange({ ...state, matchMode: mode });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Advanced Filters"
      className={className}
      footer={(
        <div className="flex w-full items-center justify-between">
          <Button variant="ghost" onClick={onClear}>Clear</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={onApply}>Apply</Button>
          </div>
        </div>
      )}
    >
      <div className={cn('grid gap-6 sm:grid-cols-2')}>
        <FacetMultiSelect label="File Type" options={defaultFileTypeOptions} values={state.fileTypes} onChange={setFileTypes} />
        <DateRangeFacet label="Date Created" value={state.dateCreated} onChange={setDate} />
        <NumberRangeFacet label="Image Size (px)" value={state.imageSize || {}} onChange={setImageSize} />

        <div className="sm:col-span-2">
          <KeyValueList label="Job Container" items={state.jobContainer} onChange={setJobContainer} />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <div className="text-[11px] text-muted-foreground">Match</div>
          <SegmentedControl
            segments={[
              { label: 'Match Any', value: 'any' },
              { label: 'Match All', value: 'all' },
            ] as const}
            value={(state.matchMode || 'any') as 'any' | 'all'}
            onChange={(v) => setMatchMode(v as 'any' | 'all')}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AdvancedSearchDialog;
