import React, { useState } from 'react';
import { cn } from '../lib/utils';

interface OrgLogoProps {
  logoUrl?: string | null;
  orgName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const SIZE_MAP = { sm: 'h-5', md: 'h-6', lg: 'h-8' };
const INITIALS_SIZE = { sm: 'text-[10px] w-5 h-5', md: 'text-xs w-6 h-6', lg: 'text-sm w-8 h-8' };

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function OrgLogo({ logoUrl, orgName, className, size = 'md', isLoading = false }: OrgLogoProps) {
  const [failed, setFailed] = useState(false);

  if (isLoading) {
    return <div className={cn('rounded animate-pulse bg-white/10', INITIALS_SIZE[size], className)} />;
  }

  if (logoUrl && !failed) {
    return (
      <img
        src={logoUrl}
        alt={orgName}
        className={cn(SIZE_MAP[size], 'w-auto object-contain', className)}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className={cn(
      'rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0',
      INITIALS_SIZE[size],
      className
    )}>
      {getInitials(orgName) || '?'}
    </div>
  );
}
