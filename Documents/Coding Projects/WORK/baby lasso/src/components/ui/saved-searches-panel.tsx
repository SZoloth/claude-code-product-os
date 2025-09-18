import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Icon } from '@/lib/icons';

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
}

export interface SavedSearchesPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  searches: SavedSearch[];
  onSaveCurrent?: (name: string) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
}

export const SavedSearchesPanel = ({ searches, onSaveCurrent, onDelete, onSelect, ...props }: SavedSearchesPanelProps) => {
  const [newName, setNewName] = React.useState('');
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Saved Searches</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name this search" className="h-9" />
          <Button onClick={() => { onSaveCurrent?.(newName); setNewName(''); }}>Save</Button>
        </div>
        <div className="divide-y rounded-md border">
          {searches.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">No saved searches</div>
          )}
          {searches.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3">
              <button className="text-left" onClick={() => onSelect?.(s.id)}>
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground truncate max-w-md">{s.query}</div>
              </button>
              <Button variant="ghost" size="icon" onClick={() => onDelete?.(s.id)}>
                <Icon name="clear-input" size="sm" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedSearchesPanel;

