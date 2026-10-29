import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'shine inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-white shadow-lg shadow-brand/25 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand/30 hover:-translate-y-0.5',
        gold: 'bg-gold text-white shadow-lg shadow-gold/30 hover:bg-gold-600 hover:-translate-y-0.5',
        outline: 'border border-brand/25 bg-white/60 text-brand backdrop-blur hover:border-brand hover:bg-brand hover:text-white',
        outlineLight: 'border border-white/30 bg-white/5 text-white backdrop-blur hover:bg-white hover:text-brand-900',
        white: 'bg-white text-brand-900 shadow-lg hover:bg-gold-50 hover:-translate-y-0.5',
        ghost: 'text-current hover:bg-current/5'
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm',
        lg: 'h-13 px-8 text-base'
      }
    },
    defaultVariants: { variant: 'primary', size: 'md' }
  }
);

export function Button({ className, variant, size, as: Comp = 'button', ...props }) {
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
