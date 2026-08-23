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
        'flex items-center cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed';

    const roundedClass = circle ? 'rounded-full' : (variant === 'primary' ? 'rounded-xl' : 'rounded-lg');

    const variantClasses = {
        sidebar: `w-full justify-start gap-2.5 text-left text-sm text-slate-900 ${active
            ? 'bg-slate-200'
            : 'bg-transparent hover:bg-slate-200/80'
            }`,

        icon: `justify-center ${active
            ? 'bg-slate-200 text-slate-900'
            : 'bg-transparent hover:bg-slate-200/80 text-slate-600 hover:text-slate-900'
            }`,
        ghost: `justify-center text-sm ${active
            ? 'bg-slate-200 text-slate-900'
            : 'bg-transparent hover:bg-slate-200/80 text-slate-700 hover:text-slate-900'
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
