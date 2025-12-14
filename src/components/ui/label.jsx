import React from 'react';
import clsx from 'clsx';

export const Label = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={clsx('text-sm font-medium text-slate-700 dark:text-slate-200', className)}
      {...props}
    />
  );
});

Label.displayName = 'Label';

