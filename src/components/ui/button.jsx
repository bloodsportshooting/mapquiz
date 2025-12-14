import React from 'react';
import clsx from 'clsx';

const baseClasses =
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  default:
    'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600 dark:bg-blue-500 dark:hover:bg-blue-400',
  outline:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
  ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800',
};

const sizes = {
  default: 'h-10 px-4 py-2',
  icon: 'h-10 w-10',
  lg: 'h-12 px-6 text-base',
};

export const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
    const classes = clsx(
      baseClasses,
      variants[variant] || variants.default,
      sizes[size] || sizes.default,
      className
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref,
        className: clsx(children.props.className, classes),
        ...props,
      });
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

