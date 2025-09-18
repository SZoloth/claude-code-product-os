import React from 'react';
import { cn } from '@/lib/utils';

export interface Avatar {
  src?: string;
  alt?: string;
  initials?: string;
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: Avatar[];
  size?: 'sm' | 'md' | 'lg';
  max?: number; // show +N overflow
}

const sizeMap = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

export const AvatarGroup = ({ avatars, size = 'md', max = 5, className, ...props }: AvatarGroupProps) => {
  const shown = avatars.slice(0, max);
  const extra = avatars.length - shown.length;
  return (
    <div className={cn('flex items-center', className)} {...props}>
      {shown.map((a, i) => (
        <div
          key={i}
          className={cn('relative -ml-2 first:ml-0 rounded-full ring-2 ring-background overflow-hidden bg-muted flex items-center justify-center', sizeMap[size])}
          title={a.alt}
        >
          {a.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.src} alt={a.alt || ''} className="h-full w-full object-cover" />
          ) : (
            <span>{a.initials || '??'}</span>
          )}
        </div>
      ))}
      {extra > 0 && (
        <div className={cn('relative -ml-2 rounded-full ring-2 ring-background bg-secondary/60 text-foreground/70 flex items-center justify-center', sizeMap[size])}>
          +{extra}
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;

