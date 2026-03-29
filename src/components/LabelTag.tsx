import React from 'react';
import { Icon } from '@iconify/react';
import type { TaskLabel } from '../store';

interface LabelTagProps {
  label: TaskLabel;
  size?: 'sm' | 'md' | 'lg';
  onRemove?: () => void;
}

export function LabelTag({ label, size = 'md', onRemove }: LabelTagProps) {
  const hex = label.color;

  const style: React.CSSProperties = {
    color: hex,
    backgroundColor: `${hex}15`,
    borderColor: `${hex}60`,
    boxShadow: `0 0 10px ${hex}25, inset 0 0 10px ${hex}08`,
  };

  const cls =
    size === 'sm'
      ? 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-medium'
      : size === 'lg'
      ? 'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-sm font-medium'
      : 'inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border text-xs font-medium';

  return (
    <span className={cls} style={style}>
      <Icon icon={label.iconName} className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      {label.title}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      )}
    </span>
  );
}
