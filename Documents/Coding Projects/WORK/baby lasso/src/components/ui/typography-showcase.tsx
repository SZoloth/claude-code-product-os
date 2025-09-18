import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Typography, H1, H2, H3, H4, Text, TextLarge, TextSmall, Label, Caption, Code } from './typography';
import { typographyScale, typographyPresets } from '@/lib/typography';
import { cn } from '@/lib/utils';

interface TypographyShowcaseProps {
  className?: string;
}

// Import Open Sans font from Google Fonts
const OpenSansLink = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
    rel="stylesheet"
  />
);

export const TypographyShowcase = ({ className }: TypographyShowcaseProps) => {
  // Add Google Fonts link to document head
  React.useEffect(() => {
    const existingLink = document.querySelector('link[href*="Open+Sans"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className={cn("space-y-8", className)}>
      <div>
        <Typography variant="heading-1">Typography System</Typography>
        <Typography variant="body-large" color="muted" className="mt-2">
          Open Sans font family with comprehensive hierarchy for the Lasso application
        </Typography>
      </div>

      {/* Typography Scale */}
      <Card>
        <CardHeader>
          <CardTitle>Typography Scale</CardTitle>
          <Typography variant="body" color="muted">
            Complete type hierarchy with sizes, weights, and usage guidelines
          </Typography>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(typographyScale).map(([variant, info]) => (
            <div key={variant} className="border-b border-muted/20 pb-4 last:border-b-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <Typography 
                    variant={variant as any}
                    className="mb-2"
                  >
                    The quick brown fox jumps over the lazy dog
                  </Typography>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{variant}</Badge>
                    <span>{info.size}</span>
                    <span>{info.weight}</span>
                    <span>LH: {info.lineHeight}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground max-w-xs">
                  {info.usage}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Hierarchy Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Hierarchy in Practice</CardTitle>
          <Typography variant="body" color="muted">
            Real-world examples of typography hierarchy
          </Typography>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Page Layout Example */}
          <div className="space-y-4 p-6 bg-muted/20 rounded-lg">
            <Typography variant="display-1">
              Digital Asset Management
            </Typography>
            <Typography variant="body-large" color="muted">
              Streamline your creative workflow with powerful asset organization and collaboration tools
            </Typography>
            
            <div className="space-y-6 mt-8">
              <div>
                <Typography variant="heading-2" className="mb-3">
                  Recent Projects
                </Typography>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Typography variant="body">Dragon Character Model</Typography>
                    <Typography variant="caption" color="muted">2 hours ago</Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body">Forest Environment Pack</Typography>
                    <Typography variant="caption" color="muted">1 day ago</Typography>
                  </div>
                </div>
              </div>

              <div>
                <Typography variant="heading-3" className="mb-2">
                  Quick Stats
                </Typography>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="heading-2">1,243</Typography>
                    <Typography variant="label" color="muted">Total Assets</Typography>
                  </div>
                  <div>
                    <Typography variant="heading-2">32</Typography>
                    <Typography variant="label" color="muted">Collections</Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Variations */}
      <Card>
        <CardHeader>
          <CardTitle>Color Variations</CardTitle>
          <Typography variant="body" color="muted">
            Typography with different color treatments
          </Typography>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Typography variant="heading-4">Text Colors</Typography>
              <div className="space-y-2">
                <Typography variant="body" color="default">Default text color</Typography>
                <Typography variant="body" color="muted">Muted text color</Typography>
                <Typography variant="body" color="primary">Primary text color</Typography>
                <Typography variant="body" color="destructive">Destructive text color</Typography>
              </div>
            </div>
            
            <div className="space-y-3">
              <Typography variant="heading-4">Department Colors</Typography>
              <div className="space-y-2">
                <Typography variant="body" color="art-primary">Art Department</Typography>
                <Typography variant="body" color="modeling-primary">Modeling Department</Typography>
                <Typography variant="body" color="lookdev-primary">LookDev Department</Typography>
                <Typography variant="body" color="groom-primary">Groom Department</Typography>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Convenience Components */}
      <Card>
        <CardHeader>
          <CardTitle>Convenience Components</CardTitle>
          <Typography variant="body" color="muted">
            Pre-configured components for common use cases
          </Typography>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <H1>Heading 1 Component</H1>
            <H2>Heading 2 Component</H2>
            <H3>Heading 3 Component</H3>
            <H4>Heading 4 Component</H4>
          </div>
          
          <div className="space-y-2">
            <TextLarge>Large body text component for introductions and important content.</TextLarge>
            <Text>Default body text component for regular content and descriptions.</Text>
            <TextSmall>Small body text component for details and secondary information.</TextSmall>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <Label>Form Label</Label>
            <Caption>Caption text</Caption>
            <Code>inline code</Code>
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
            <code>{`import { Typography, H1, H2, Text, Label, Caption } from '@/components/ui';

// Using the main Typography component
<Typography variant="heading-1" color="primary">
  Main Title
</Typography>

// Using convenience components
<H1>Page Title</H1>
<H2>Section Title</H2>
<Text>Body paragraph text</Text>
<Label>Form field label</Label>
<Caption>Caption or help text</Caption>

// Custom semantic elements
<Typography variant="heading-2" as="div">
  Non-semantic heading
</Typography>

// With custom styling
<Typography 
  variant="body" 
  color="muted" 
  className="italic"
>
  Styled text
</Typography>`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};