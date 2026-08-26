import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    circle?: boolean;
    variant?: 'sidebar' | 'icon' | 'ghost' | 'primary';
    size?: 'sm' | 'md' | 'xs';
    icon?: React.ReactNode;
    active?: boolean;
    children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    circle = false,
    variant = 'sidebar',
    size = 'md',
    icon,
    active = false,
    className = '',
    children,
    ...props
}) => {
    const baseClasses =
        'flex items-center cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

    const roundedClass = circle ? 'rounded-full' : (variant === 'primary' ? 'rounded-xl' : 'rounded-lg');

    const variantClasses = {
        sidebar: `w-full justify-start gap-2.5 text-left text-sm text-slate-900 dark:text-slate-200 ${active
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
            : 'bg-transparent hover:bg-slate-200/80 dark:hover:bg-slate-800'
            }`,

        icon: `justify-center ${active
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
            : 'bg-transparent hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`,
        ghost: `justify-center text-sm ${active
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
            : 'bg-transparent hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`,
        primary:
            'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold justify-center shadow-xs',
    };

    const sizeClasses = {
        sm: variant === 'icon' ? 'p-2.5' : 'p-2.5 text-xs gap-1.5',
        md: variant === 'icon' ? 'p-2' : 'px-3 py-2 text-sm',
        xs: variant === 'icon' ? 'p-1.5' : 'p-4',
    };

    return (
        <button
            className={`${baseClasses} ${roundedClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {icon && <span className="shrink-0 flex items-center justify-center">{icon}</span>}
            {children}
        </button>
    );
};

export default Button;
