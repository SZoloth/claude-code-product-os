import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { AssetCard, AssetType, type Asset } from './asset-card';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  FolderOpen, 
  HardDrive, 
  Users, 
  Clock,
  Plus,
  Search,
  Filter
} from 'lucide-react';

interface DashboardProps {
  /** Whether to show loading state */
  loading?: boolean;
  /** Recent assets to display */
  recentAssets?: Asset[];
  /** Dashboard statistics */
  stats?: {
    totalAssets: number;
    collections: number;
    storageUsed: string;
    storageUsedPercentage: number;
    activeUsers?: number;
  };
  className?: string;
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
  avatar: string;
  type: 'upload' | 'comment' | 'collection' | 'approval';
}

export const Dashboard = ({ 
  loading = false, 
  recentAssets = [],
  stats = {
    totalAssets: 1243,
    collections: 32,
    storageUsed: '42.3 GB',
    storageUsedPercentage: 67,
    activeUsers: 24,
  },
  className
}: DashboardProps) => {
  // Sample activity data with types
  const recentActivities: ActivityItem[] = [
    { 
      id: '1', 
      user: 'Maya Rodriguez', 
      action: 'uploaded Dragon_Rig_v2.ma', 
      time: '2h ago', 
      avatar: 'MR',
      type: 'upload'
    },
    { 
      id: '2', 
      user: 'James Chen', 
      action: 'added to Forest Collection', 
      time: '4h ago', 
      avatar: 'JC',
      type: 'collection'
    },
    { 
      id: '3', 
      user: 'Sarah Kim', 
      action: 'commented on Castle_Exterior.blend', 
      time: '6h ago', 
      avatar: 'SK',
      type: 'comment'
    },
    { 
      id: '4', 
      user: 'Alex Thompson', 
      action: 'created new collection "Characters"', 
      time: '1d ago', 
      avatar: 'AT',
      type: 'collection'
    },
    { 
      id: '5', 
      user: 'Elena Vasquez', 
      action: 'approved Texture_Pack_v3.zip', 
      time: '2d ago', 
      avatar: 'EV',
      type: 'approval'
    },
  ];

  // Default recent assets
  const defaultRecentAssets: Asset[] = [
    {
      id: '1',
      name: 'Dragon Character',
      type: AssetType.CHARACTER,
      fileSize: 15728640,
      dateModified: '2024-01-15',
      thumbnailUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      tags: ['rigged', 'fantasy'],
    },
    {
      id: '2',
      name: 'Forest Environment',
      type: AssetType.ENVIRONMENT,
      fileSize: 25165824,
      dateModified: '2024-01-14',
      thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
      tags: ['nature', 'scene'],
    },
    {
      id: '3',
      name: 'Magic Sword',
      type: AssetType.PROP,
      fileSize: 8388608,
      dateModified: '2024-01-13',
      thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
      tags: ['weapon', 'fantasy'],
    },
    {
      id: '4',
      name: 'Stone Texture',
      type: AssetType.TEXTURE,
      fileSize: 4194304,
      dateModified: '2024-01-12',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      tags: ['material', '4k'],
    },
    {
      id: '5',
      name: 'Flight Animation',
      type: AssetType.ANIMATION,
      fileSize: 52428800,
      dateModified: '2024-01-11',
      tags: ['motion', 'flight'],
    },
    {
      id: '6',
      name: 'Castle Concept',
      type: AssetType.CONCEPT_ART,
      fileSize: 12582912,
      dateModified: '2024-01-10',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
      tags: ['concept', 'architecture'],
    },
  ];

  const displayAssets = recentAssets.length > 0 ? recentAssets : defaultRecentAssets;

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'upload':
        return <TrendingUp className="h-4 w-4" />;
      case 'collection':
        return <FolderOpen className="h-4 w-4" />;
      case 'comment':
        return <Users className="h-4 w-4" />;
      case 'approval':
        return <Badge className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your digital assets
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collections</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.collections}</div>
            <p className="text-xs text-muted-foreground">
              +3 new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.storageUsed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.storageUsedPercentage}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Online now
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Assets */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Assets</CardTitle>
                <CardDescription>
                  Your most recently modified assets
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayAssets.map((asset) => (
                  <AssetCard 
                    key={asset.id} 
                    asset={asset} 
                    compact 
                    showActions
                    className="h-fit"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Team activity from the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {activity.avatar}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{' '}
                        {activity.action}
                      </p>
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.type)}
                        <span className="text-xs text-muted-foreground">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};