import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-on-primary shadow-sm hover:bg-primary-hover active:scale-[0.98]',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]',
        outline:
          'border-2 border-outline-variant bg-transparent text-on-surface hover:border-primary hover:bg-surface-container/50 active:scale-[0.98]',
        secondary:
          'bg-surface-container text-on-surface shadow-sm hover:bg-surface-container-high active:scale-[0.98]',
        ghost:
          'text-on-surface-variant hover:bg-surface-container hover:text-on-surface active:scale-[0.98]',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient: 'btn-gradient shadow-md hover:shadow-lg active:scale-[0.98]',
        glass: 'btn-glass active:scale-[0.98]',
        pill: 'rounded-full bg-primary text-on-primary shadow-sm hover:bg-primary-hover active:scale-[0.98]',
        pillOutline:
          'rounded-full border-2 border-primary bg-transparent text-primary hover:bg-primary-container/30 active:scale-[0.98]',
      },
      size: {
        default: 'h-11 rounded-xl px-5 py-2 text-label-large',
        sm: 'h-9 rounded-lg px-4 py-1.5 text-label-medium',
        lg: 'h-12 rounded-xl px-8 py-3 text-label-large',
        icon: 'h-11 w-11 rounded-xl',
        iconSm: 'h-9 w-9 rounded-lg',
        iconLg: 'h-12 w-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>
