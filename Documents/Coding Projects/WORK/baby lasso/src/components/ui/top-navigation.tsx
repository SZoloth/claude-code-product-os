import React from 'react';
import { Button, Input, Typography, Icon } from '@/components/ui';
import { Search, Filter, Menu, Settings, Bug } from 'lucide-react';

const TopNavigation: React.FC = () => {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
            <Menu className="h-5 w-5 text-slate-600" />
          </Button>
          <Button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-modeling-start to-primary-modeling-end px-4 py-2 text-sm font-semibold text-white shadow-sm">
            <Icon name="lasso-modeling" className="h-5 w-5" />
            <Typography variant="h6" className="tracking-widest text-white">
              MODELING
            </Typography>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
            <Bug className="h-5 w-5 text-slate-600" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
            <Settings className="h-5 w-5 text-slate-600" />
          </Button>
          <Button variant="ghost" size="icon" className="ml-2 rounded-full hover:bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=64&q=80"
              alt="User avatar"
              className="h-7 w-7 rounded-full object-cover"
            />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-md border-slate-200">
            All Shows
            <Icon name="caret-down-fill" className="ml-2" size="sm" />
          </Button>
          <Button variant="outline" size="sm" className="rounded-md border-slate-200">
            All Asset Types
            <Icon name="caret-down-fill" className="ml-2" size="sm" />
          </Button>
        </div>
        <div className="flex flex-1 items-center gap-2 lg:justify-end">
          <div className="relative w-full max-w-lg">
            <Input
              placeholder="Search Artwork, Artist names, Tags"
              className="w-full rounded-md border-slate-200 pl-10 pr-4"
            />
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          </div>
          <Button variant="outline" size="sm" className="hidden rounded-md border-slate-200 lg:flex">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button variant="outline" size="sm" className="rounded-md border-slate-200">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;