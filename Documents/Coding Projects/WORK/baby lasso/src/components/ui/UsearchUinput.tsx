import React from 'react';
import { cn } from '@/lib/utils';
import { Input, type InputProps } from './input';
import { Icon } from '@/lib/icons';

export interface SearchInputProps extends Omit<InputProps, 'onSubmit'> {
  onClear?: () => void;
  onSubmit?: (value: string) => void;
}

export const SearchInput = ({ className, value, onChange, onClear, onSubmit, placeholder = 'Search…', ...props }: SearchInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmit?.(String((e.target as HTMLInputElement).value));
    }
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-muted-foreground">
        <Icon name="search" size="sm" />
      </div>
      <Input
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pl-8 pr-8"
        {...props}
      />
      {value && String(value).length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 flex items-center pr-2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <Icon name="clear-input" size="sm" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;

