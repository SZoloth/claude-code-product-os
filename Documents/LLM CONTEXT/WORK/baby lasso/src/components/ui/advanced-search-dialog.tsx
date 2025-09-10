import React from 'react';
import { Modal } from './modal';
import { Button } from './button';
import { FacetMultiSelect, type FacetOption } from './facet-multi-select';
import { DateRangeFacet, type DateRangeValue } from './date-range-facet';
import { KeyValueList, type KeyValueItem } from './key-value-list';
import { cn } from '@/lib/utils';

export interface AdvancedSearchState {
  fileTypes: string[];
  dateCreated: DateRangeValue;
  jobContainer: KeyValueItem[];
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

        <div className="sm:col-span-2">
          <KeyValueList label="Job Container" items={state.jobContainer} onChange={setJobContainer} />
        </div>
      </div>
    </Modal>
  );
};

export default AdvancedSearchDialog;

