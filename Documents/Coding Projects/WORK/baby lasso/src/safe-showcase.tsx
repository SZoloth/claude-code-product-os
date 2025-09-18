import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { AssetGridInterfaceFixed } from './components/ui/asset-grid-interface-fixed';

export const SafeShowcase: React.FC = () => {
  const [currentView, setCurrentView] = useState<'basic' | 'asset-grid'>('basic');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <div className="border-b bg-muted/40 p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Baby Lasso Design System</h1>
          <div className="flex gap-2">
            <Button 
              variant={currentView === 'basic' ? 'default' : 'outline'}
              onClick={() => setCurrentView('basic')}
              size="sm"
            >
              Basic Components
            </Button>
            <Button 
              variant={currentView === 'asset-grid' ? 'default' : 'outline'}
              onClick={() => setCurrentView('asset-grid')}
              size="sm"
            >
              Asset Grid Interface
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {currentView === 'basic' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Components Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button>Primary Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                </div>
                <div className="flex gap-2">
                  <Badge>Default Badge</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Error</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  ✅ If you can see this, the basic components are working without hook violations!
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'asset-grid' && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Asset Grid Interface (Fixed Version)
            </div>
            <AssetGridInterfaceFixed />
          </div>
        )}
      </div>
    </div>
  );
};

export default SafeShowcase;