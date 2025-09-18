import React from 'react';
import {
  // Utility icons
  Square,
  CheckSquare,
  Circle,
  CheckCircle,
  X,
  Info,
  RotateCcw,
  MoreHorizontal,
  MoreVertical,
  Copy,
  Files,
  ExternalLink,
  ArrowDown,
  ArrowUp,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Bell,
  Home,
  Folder as FolderIcon,
  Users,
  Star,
  Hash,
  Eye,
  Edit,
  Download,
  Trash2,
  // Table functions
  Grid3X3,
  AlignJustify,
  Table,
  // User
  User,
  Users,
  // Collections
  Folder,
  FolderOpen,
  Pin,
  PinOff,
  Unlink,
  Lock,
  // Panel
  Image,
  Tag,
  Building2,
  Palette,
  FolderClosed,
  Diamond,
  Plus,
  Minus,
  Settings,
  Link,
  FileText,
  // Search/Filters
  Search,
  Sliders,
  Filter,
  Calendar,
  // Maya specific
  Upload,
  GitCompare,
  RefreshCw,
  Upload as UploadIcon,
  Clock3,
  Box,
  Layers3,
  // Navigation
  Maximize2,
  type LucideIcon
} from 'lucide-react';

// Icon size variants
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const iconSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4', 
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

// Custom department brand icons (using text for now, could be replaced with custom SVGs)
const DepartmentIcon = ({ department, size = 'md', className = '' }: { 
  department: 'ART' | 'MODELING' | 'LOOKDEV' | 'GROOM', 
  size?: IconSize,
  className?: string 
}) => {
  const sizeClass = iconSizes[size];
  const colors = {
    ART: 'text-art-primary',
    MODELING: 'text-modeling-primary', 
    LOOKDEV: 'text-lookdev-primary',
    GROOM: 'text-groom-primary'
  };
  
  return (
    <div className={`${sizeClass} ${colors[department]} ${className} flex items-center justify-center font-bold text-xs border rounded`}>
      {department.charAt(0)}
    </div>
  );
};

// Icon library mapping from design reference
export const iconLibrary = {
  // Utility
  'checkbox-unselected': Square,
  'checkbox-selected': CheckSquare,
  'circle-checkbox-unselected': Circle,
  'circle-checkbox-selected': CheckCircle,
  'clear-input': X,
  'info-circle-fill': Info,
  'info-details-panel': Info,
  'arrow-clockwise': RotateCcw,
  'three-dots': MoreHorizontal,
  'three-dots-vertical': MoreVertical,
  'copy': Copy,
  'copy-filled': Files,
  'box-arrow-up-right': ExternalLink,
  'arrow-down-short': ArrowDown,
  'arrow-up-short': ArrowUp,
  'card-right-square-fill': ChevronRight,
  'card-left-square-fill': ChevronLeft,

  // Branding
  'lasso-art': (props: any) => <DepartmentIcon department="ART" {...props} />,
  'lasso-modeling': (props: any) => <DepartmentIcon department="MODELING" {...props} />,
  'lasso-lookdev': (props: any) => <DepartmentIcon department="LOOKDEV" {...props} />,
  'lasso-groom': (props: any) => <DepartmentIcon department="GROOM" {...props} />,

  // Table Functions
  'image-grid': Grid3X3,
  'horizontal-grid': AlignJustify,
  'table': Table,

  // User
  'person-circle': User,
  'user': Users,

  // Collections
  'my-collections': Folder,
  'public-collections': FolderOpen,  
  'pin-pinned': Pin,
  'unpin': PinOff,
  'private': Lock,
  'home': Home,
  'bell': Bell,
  'users': Users,
  'star': Star,
  'hash': Hash,
  'folder': FolderIcon,

  // CTA Icons
  'workcam': (props: any) => <div className={`${iconSizes[props.size || 'md']} ${props.className || ''} flex items-center justify-center border rounded`}>📹</div>,
  'time-of-day': (props: any) => <div className={`${iconSizes[props.size || 'md']} ${props.className || ''} flex items-center justify-center border rounded`}>🕐</div>,

  // Panel
  'image': Image,
  'tag-fill': Tag,
  'bank2': Building2,
  'palette2': Palette,
  'textures': Image,
  'folder-fill': FolderClosed,
  'diamond-fill': Diamond,
  'diamond': Diamond,
  'expand': Plus,
  'plus': Plus,
  'collapse': Minus,
  'gear-fill': Settings,
  'link-45deg': Link,
  'file-earmark-text-fill': FileText,

  // Search/Filters
  'search': Search,
  'sliders2': Sliders,
  'filter': Filter,
  'calendar-event-fill': Calendar,

  // Image Cards (directional carets)
  'caret-right-fill': ChevronRight,
  'caret-left-fill': ChevronLeft,
  'caret-up-fill': ChevronUp,
  'caret-down-fill': ChevronDown,
  'arrow-fullscreen': Maximize2,
  'eye': Eye,
  'edit': Edit,
  'download': Download,
  'trash': Trash2,

  // Maya
  'import': Upload,
  'upload': UploadIcon,
  'match': GitCompare,
  'replace': RefreshCw,
  'geometry': Box,
  'insert-into-maya-instance': Layers3,
  'clock': Clock3,
} as const;

// Icon component with consistent sizing and styling
interface IconProps {
  name: keyof typeof iconLibrary;
  size?: IconSize;
  className?: string;
}

export const Icon = ({ name, size = 'md', className = '' }: IconProps) => {
  const IconComponent = iconLibrary[name];
  const sizeClass = iconSizes[size];
  
  if (typeof IconComponent === 'function' && IconComponent.name === 'DepartmentIcon') {
    return <IconComponent size={size} className={className} />;
  }
  
  if (React.isValidElement(IconComponent)) {
    return React.cloneElement(IconComponent as React.ReactElement, {
      className: `${sizeClass} ${className}`,
      size: undefined, // Remove size prop to avoid conflicts
    });
  }
  
  const LucideIconComponent = IconComponent as LucideIcon;
  return <LucideIconComponent className={`${sizeClass} ${className}`} />;
};

// Utility function to get department icon colors
export const getDepartmentIconColor = (department: 'art' | 'modeling' | 'lookdev' | 'groom') => {
  const colors = {
    art: 'text-art-primary',
    modeling: 'text-modeling-primary',
    lookdev: 'text-lookdev-primary', 
    groom: 'text-groom-primary'
  };
  return colors[department];
};

// Export icon categories for organized usage
export const iconCategories = {
  utility: [
    'checkbox-unselected', 'checkbox-selected', 'circle-checkbox-unselected', 
    'circle-checkbox-selected', 'clear-input', 'info-circle-fill', 'info-details-panel',
    'arrow-clockwise', 'three-dots', 'three-dots-vertical', 'copy', 'copy-filled',
    'box-arrow-up-right', 'arrow-down-short', 'arrow-up-short'
  ],
  branding: ['lasso-art', 'lasso-modeling', 'lasso-lookdev', 'lasso-groom'],
  table: ['image-grid', 'horizontal-grid', 'table'],
  user: ['person-circle', 'user'],
  collections: ['my-collections', 'public-collections', 'pin-pinned', 'unpin', 'private'],
  cta: ['workcam', 'time-of-day'],
  panel: [
    'image', 'tag-fill', 'bank2', 'palette2', 'textures', 'folder-fill', 
    'diamond-fill', 'diamond', 'expand', 'collapse', 'gear-fill', 'link-45deg', 
    'file-earmark-text-fill'
  ],
  search: ['search', 'sliders2', 'filter', 'calendar-event-fill'],
  navigation: ['caret-right-fill', 'caret-left-fill', 'caret-up-fill', 'caret-down-fill', 'arrow-fullscreen'],
  maya: ['import', 'match', 'replace', 'geometry', 'insert-into-maya-instance']
} as const;
