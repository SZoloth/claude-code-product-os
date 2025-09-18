import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { DepartmentButton } from './department-button';
import { DepartmentBadge } from './department-badge';
import { type Department } from '@/lib/department-themes';

interface ColorPaletteProps {
  department: Department;
  className?: string;
}

const departmentInfo = {
  art: {
    title: 'Art Department',
    description: 'Artwork and legal status indicators',
    primaryColor: '#FD02C2',
    statuses: [
      { key: 1, label: 'Status 1', color: '#7A9FFF' },
      { key: 2, label: 'Status 2', color: '#7ADFFF' },
      { key: 3, label: 'Status 3', color: '#B5CCFF' },
      { key: 4, label: 'Status 4', color: '#FF759A' },
      { key: 5, label: 'Status 5', color: '#FF8052' },
      { key: 6, label: 'Status 6', color: '#FFD50D' },
      { key: 7, label: 'Status 7', color: '#A4C212' },
      { key: 8, label: 'Status 8', color: '#C3F068' },
    ],
    legal: [
      { key: 1, label: 'Legal 1', color: '#F4CE2E' },
      { key: 2, label: 'Legal 2', color: '#FF759A' },
      { key: 3, label: 'Legal 3', color: '#A2A882' },
      { key: 4, label: 'Legal 4', color: '#531DAB' },
      { key: 5, label: 'Legal 5', color: '#880742' },
    ]
  },
  modeling: {
    title: 'Modeling Department',
    description: 'Maya statuses and modeling workflow',
    primaryColor: '#7A9FFF',
    statuses: [
      { key: 'orange', label: 'Status Orange', color: '#12DE07' },
      { key: 'red', label: 'Status Red', color: '#F18302' },
      { key: 'green', label: 'Status Green', color: '#E00007' },
    ]
  },
  lookdev: {
    title: 'LookDev Department', 
    description: 'Look development and variant indicators',
    primaryColor: '#A6FF7A',
    variants: [
      { key: 'purple', label: 'Variant Purple', color: '#500082' },
      { key: 'blue', label: 'Variant Blue', color: '#144097' },
    ]
  },
  groom: {
    title: 'Groom Department',
    description: 'Grooming and variant indicators',
    primaryColor: '#FF9B7A',
    variants: [
      { key: 'teal', label: 'Variant Teal', color: '#500082' },
      { key: 'blue', label: 'Variant Blue', color: '#144097' },
    ]
  }
};

export const ColorPalette = ({ department, className }: ColorPaletteProps) => {
  const info = departmentInfo[department];
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div 
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: info.primaryColor }}
          />
          {info.title}
        </CardTitle>
        <p className="text-muted-foreground text-sm">{info.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Primary Button */}
        <div>
          <h4 className="font-medium mb-3">Primary Actions</h4>
          <div className="flex gap-2">
            <DepartmentButton department={department}>
              Primary Button
            </DepartmentButton>
            <DepartmentButton department={department} variant={`${department}-secondary` as any}>
              Secondary
            </DepartmentButton>
          </div>
        </div>

        {/* Status Badges */}
        {info.statuses && (
          <div>
            <h4 className="font-medium mb-3">Status Indicators</h4>
            <div className="flex flex-wrap gap-2">
              {info.statuses.map((status) => (
                <DepartmentBadge
                  key={status.key}
                  department={department}
                  status={status.key}
                  statusType="status"
                >
                  {status.label}
                </DepartmentBadge>
              ))}
            </div>
          </div>
        )}

        {/* Legal Status Badges (Art only) */}
        {info.legal && (
          <div>
            <h4 className="font-medium mb-3">Legal Status</h4>
            <div className="flex flex-wrap gap-2">
              {info.legal.map((legal) => (
                <DepartmentBadge
                  key={legal.key}
                  department={department}
                  status={legal.key}
                  statusType="legal"
                >
                  {legal.label}
                </DepartmentBadge>
              ))}
            </div>
          </div>
        )}

        {/* Variant Badges (LookDev & Groom) */}
        {info.variants && (
          <div>
            <h4 className="font-medium mb-3">Variants</h4>
            <div className="flex flex-wrap gap-2">
              {info.variants.map((variant) => (
                <DepartmentBadge
                  key={variant.key}
                  department={department}
                  status={variant.key}
                  statusType="variant"
                >
                  {variant.label}
                </DepartmentBadge>
              ))}
            </div>
          </div>
        )}

        {/* Color Swatches */}
        <div>
          <h4 className="font-medium mb-3">Color Palette</h4>
          <div className="grid grid-cols-8 gap-2">
            {/* Primary Color */}
            <div className="space-y-1">
              <div 
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: info.primaryColor }}
                title={`Primary: ${info.primaryColor}`}
              />
              <div className="text-xs text-center">Primary</div>
            </div>

            {/* Status/Variant Colors */}
            {(info.statuses || info.variants || info.legal)?.slice(0, 7).map((item, index) => (
              <div key={index} className="space-y-1">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: item.color }}
                  title={`${item.label}: ${item.color}`}
                />
                <div className="text-xs text-center truncate">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Common Colors */}
        <div>
          <h4 className="font-medium mb-3">Common Colors</h4>
          <div className="grid grid-cols-8 gap-2">
            {[
              { label: 'White', color: '#FFFFFF' },
              { label: 'Light Gray', color: '#BBBBBB' },
              { label: 'Gray', color: '#999999' },
              { label: 'Dark Gray', color: '#4D4D4D' },
              { label: 'Black', color: '#000000' },
              { label: 'Active', color: '#64C9FF' },
              { label: 'Link', color: '#55ABD9' },
              { label: 'Link Alt', color: '#64C9FF' },
            ].map((color, index) => (
              <div key={index} className="space-y-1">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: color.color }}
                  title={`${color.label}: ${color.color}`}
                />
                <div className="text-xs text-center truncate">{color.label}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};