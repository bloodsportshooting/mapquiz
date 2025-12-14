import React from 'react';
import clsx from 'clsx';

export const Card = ({ className, ...props }) => (
  <div
    className={clsx('rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }) => (
  <div className={clsx('px-6 py-4 border-b border-slate-100 dark:border-slate-800', className)} {...props} />
);

export const CardTitle = ({ className, ...props }) => (
  <h3 className={clsx('text-lg font-semibold text-slate-800 dark:text-slate-100', className)} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={clsx('px-6 py-4', className)} {...props} />
);

