'use client';

import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, fullWidth = false, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col space-y-1.5", fullWidth ? "w-full" : "")}>
        {label && (
          <label 
            htmlFor={props.id} 
            className="text-sm font-medium text-secondary-700 dark:text-secondary-300"
          >
            {label}
          </label>
        )}
        <textarea
          className={cn(
            "flex min-h-[80px] rounded-md border border-secondary-200 bg-white px-3 py-2 text-sm",
            "placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50 dark:border-secondary-800 dark:bg-secondary-900 dark:text-white !important",
            "text-container dark:text-white", // Add text-container class for consistent styling with stronger text color
            error ? "border-danger-500 focus:ring-danger-500" : "",
            fullWidth ? "w-full" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-danger-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
