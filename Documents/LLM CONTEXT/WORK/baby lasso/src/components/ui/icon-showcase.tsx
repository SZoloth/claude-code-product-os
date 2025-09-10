import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Icon, iconCategories, type IconSize } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface IconShowcaseProps {
  className?: string;
  size?: IconSize;
}

const categoryInfo = {
  utility: {
    title: 'Utility Icons',
    description: 'Checkboxes, navigation, and common UI interactions',
    color: 'bg-blue-100 text-blue-800'
  },
  branding: {
    title: 'Department Branding',
    description: 'Lasso department identification icons',
    color: 'bg-purple-100 text-purple-800'
  },
  table: {
    title: 'Table Functions',
    description: 'Grid views and table layout controls',
    color: 'bg-green-100 text-green-800'
  },
  user: {
    title: 'User Icons',
    description: 'User and person representations',
    color: 'bg-yellow-100 text-yellow-800'
  },
  collections: {
    title: 'Collections',
    description: 'Collection management and organization',
    color: 'bg-indigo-100 text-indigo-800'
  },
  cta: {
    title: 'CTA Icons',
    description: 'Call-to-action and workflow icons',
    color: 'bg-pink-100 text-pink-800'
  },
  panel: {
    title: 'Panel Icons',
    description: 'Asset types, tools, and panel controls',
    color: 'bg-teal-100 text-teal-800'
  },
  search: {
    title: 'Search & Filters',
    description: 'Search, filtering, and discovery tools',
    color: 'bg-orange-100 text-orange-800'
  },
  navigation: {
    title: 'Navigation',
    description: 'Directional and navigation controls',
    color: 'bg-gray-100 text-gray-800'
  },
  maya: {
    title: 'Maya Integration',
    description: 'Maya-specific workflow and import tools',
    color: 'bg-red-100 text-red-800'
  }
};

export const IconShowcase = ({ className, size = 'md' }: IconShowcaseProps) => {
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-2xl font-bold mb-2">Icon Library</h2>
        <p className="text-muted-foreground">
          Icons used throughout the Lasso application, organized by category
        </p>
      </div>

      {Object.entries(iconCategories).map(([categoryKey, icons]) => {
        const category = categoryKey as keyof typeof iconCategories;
        const info = categoryInfo[category];
        
        return (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge className={info.color}>
                  {icons.length} icons
                </Badge>
                <div>
                  <CardTitle>{info.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {info.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                {icons.map((iconName) => (
                  <div 
                    key={iconName}
                    className="flex flex-col items-center space-y-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-muted/30">
                      <Icon 
                        name={iconName as keyof typeof iconCategories[typeof category]}
                        size={size} 
                        className="text-foreground"
                      />
                    </div>
                    <div className="text-xs text-center text-muted-foreground font-mono max-w-full">
                      <div className="truncate" title={iconName}>
                        {iconName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Size Variations */}
      <Card>
        <CardHeader>
          <CardTitle>Size Variations</CardTitle>
          <p className="text-sm text-muted-foreground">
            All icons support multiple sizes: xs, sm, md, lg, xl
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {(['xs', 'sm', 'md', 'lg', 'xl'] as IconSize[]).map((iconSize) => (
              <div key={iconSize} className="flex flex-col items-center space-y-2">
                <Icon name="search" size={iconSize} />
                <div className="text-xs text-muted-foreground font-mono">
                  {iconSize}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
            <code>{`import { Icon } from '@/lib/icons';

// Basic usage
<Icon name="search" />

// With custom size
<Icon name="lasso-art" size="lg" />

// With custom styling
<Icon name="filter" size="sm" className="text-primary" />

// Department branding
<Icon name="lasso-modeling" size="md" />
<Icon name="lasso-lookdev" size="md" />
<Icon name="lasso-groom" size="md" />`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};