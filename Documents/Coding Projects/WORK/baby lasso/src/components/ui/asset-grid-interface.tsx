import React, { useState } from 'react';
import {
  Button,
  Typography,
  SelectionToolbar,
  cn
} from '@/components/ui';
import { Search, MoreHorizontal, Home, Users, Settings, HelpCircle } from 'lucide-react';

// Sample asset data matching the interface
const sampleAssets = [
  { id: '1', name: 'Shrek', type: 'character', thumbnail: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop' },
  { id: '2', name: 'Kitty 1', type: 'character', thumbnail: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=150&h=150&fit=crop' },
  { id: '3', name: 'Kitty 2', type: 'character', thumbnail: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=150&h=150&fit=crop' },
  { id: '4', name: 'Man 1', type: 'character', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop' },
  { id: '5', name: 'Cow 1', type: 'character', thumbnail: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=150&h=150&fit=crop' },
  { id: '6', name: 'Man 2', type: 'character', thumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop' },
  { id: '7', name: 'Scene 1', type: 'environment', thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=150&h=150&fit=crop' },
  { id: '8', name: 'Scene 2', type: 'environment', thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop' },
  { id: '9', name: 'Scene 3', type: 'environment', thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop' },
];

// Repeat the assets to create multiple rows as shown in the interface
const expandedAssets = Array.from({ length: 6 }).flatMap((_, rowIndex) => 
  sampleAssets.map((asset, colIndex) => ({
    ...asset,
    id: `${asset.id}-row${rowIndex}`,
    name: asset.name === 'Shrek' && rowIndex === 0 && colIndex === 0 ? 'Shrek' : asset.name
  }))
);

interface AssetGridInterfaceProps {
  className?: string;
}

export const AssetGridInterface: React.FC<AssetGridInterfaceProps> = ({ className }) => {
  const [selectedAssets, setSelectedAssets] = useState<string[]>(['1-row0']); // Shrek is pre-selected
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(expandedAssets[0]); // Shrek details shown

  const handleAssetSelect = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleAssetClick = (asset: typeof expandedAssets[0]) => {
    setSelectedAsset(asset);
    if (!selectedAssets.includes(asset.id)) {
      setSelectedAssets([asset.id]);
    }
  };

  return (
    <div className={cn("min-h-screen bg-black text-white flex flex-col", className)}>
      {/* Top Navigation */}
      <div className="bg-modeling-background-dark border-b border-modeling-stroke-medium px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left section - Department badge and navigation */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-modeling-primary rounded flex items-center justify-center">
                <span className="text-xs font-bold text-black">M</span>
              </div>
              <span className="text-modeling-primary font-semibold">MODELING</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Home className="w-4 h-4" />
              <Users className="w-4 h-4" />
              <Settings className="w-4 h-4" />
            </div>
          </div>

          {/* Right section - User and help */}
          <div className="flex items-center gap-4">
            <HelpCircle className="w-4 h-4 text-gray-400" />
            <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-modeling-background-dark border-b border-modeling-stroke-medium px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Filters dropdown */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-white border-gray-600">
              All Shows <span className="ml-1">▼</span>
            </Button>
            <Button variant="outline" size="sm" className="text-white border-gray-600">
              All Asset Types <span className="ml-1">▼</span>
            </Button>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Artwork, Artist names, Tags"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-modeling-primary"
              />
            </div>
          </div>

          {/* Search and Filters buttons */}
          <Button variant="outline" size="sm" className="text-white border-gray-600">
            Search
          </Button>
          <Button variant="outline" size="sm" className="text-white border-gray-600">
            Filters
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Asset Grid */}
        <div className="flex-1 flex flex-col">
          {/* Selection Toolbar */}
          <div className="bg-modeling-background-dark border-b border-modeling-stroke-medium px-4 py-2">
            <SelectionToolbar
              itemCount={29981}
              selectedCount={selectedAssets.length}
              filters={["1 Selected", "Select Session", "Full Resolution", "Geo"]}
              rightIcons={["image-grid", "table", "info-details-panel", "copy"]}
              sortLabel="Name"
              onAction={(action) => console.log('Toolbar action:', action)}
            />
          </div>

          {/* Asset Grid */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="grid grid-cols-9 gap-3">
              {expandedAssets.map((asset) => (
                <div
                  key={asset.id}
                  className={cn(
                    "relative group cursor-pointer",
                    selectedAssets.includes(asset.id) && "ring-2 ring-modeling-primary"
                  )}
                  onClick={() => handleAssetClick(asset)}
                >
                  {/* Asset Card */}
                  <div className="bg-gray-800 rounded-lg overflow-hidden">
                    {/* Thumbnail */}
                    <div className="aspect-square relative">
                      <img
                        src={asset.thumbnail}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Selection checkbox */}
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={selectedAssets.includes(asset.id)}
                          onChange={() => handleAssetSelect(asset.id)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-modeling-primary focus:ring-modeling-primary"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                    </div>
                    
                    {/* Asset Name */}
                    <div className="p-2 text-center">
                      <Typography variant="caption" className="text-gray-300 truncate">
                        {asset.name}
                      </Typography>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Asset Details Panel */}
        <div className="w-80 bg-modeling-background-dark border-l border-modeling-stroke-medium flex flex-col">
          {/* Panel Header */}
          <div className="p-4 border-b border-modeling-stroke-medium">
            <div className="flex items-center justify-between">
              <Typography variant="body" className="text-white font-semibold">
                shrek default
              </Typography>
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </div>
            
            {/* Tabs */}
            <div className="flex gap-4 mt-3 text-sm">
              <button className="text-modeling-primary border-b-2 border-modeling-primary pb-1">
                Properties
              </button>
              <button className="text-gray-400 pb-1">
                Versions
              </button>
              <button className="text-gray-400 pb-1">
                Subasssets
              </button>
            </div>
          </div>

          {/* Asset Preview */}
          <div className="p-4 border-b border-modeling-stroke-medium">
            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden mb-3">
              <img
                src={selectedAsset?.thumbnail}
                alt={selectedAsset?.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Asset Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📄</span>
                <span className="text-white">3 (latest version)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">👁️</span>
                <span className="text-white">12,300 views</span>
                <span className="text-gray-400">•</span>
                <span className="text-white">10,302 faces</span>
                <span className="text-gray-400">•</span>
                <span className="text-white">20 parts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📁</span>
                <span className="text-white">5 (5.0 2m 50.0 26.200 bbox</span>
              </div>
              <div className="text-gray-400 text-xs">
                Reduced the size by 20% to fit better. Adjusted the color to make more vibrant.
              </div>
              <div className="text-gray-400 text-xs">
                Feb 13, 2017, 5:00 PM • 🏆 Mae! Position
              </div>
            </div>
          </div>

          {/* Additional Properties */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">📁</span>
              <span className="text-white">Shrek 4</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">🏷️</span>
              <span className="text-white">shrek (200x200 .jpg(?) .exr)</span>
            </div>
            <div className="text-gray-400 text-xs">
              /production/film/laidback/film/char/shrek4/notes
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto p-4 border-t border-modeling-stroke-medium">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-white border-gray-600">
                📤 Smile 📁
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-white border-gray-600">
                📤 Quad 📁
              </Button>
              <Button variant="outline" size="sm" className="px-3 text-white border-gray-600">
                ➕ Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetGridInterface;