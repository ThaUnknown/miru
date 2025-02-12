<script lang='ts'>
  import { cn } from '$lib/utils'
  import type { HTMLAttributes } from 'svelte/elements'
  import { tv, type VariantProps } from 'tailwind-variants'

  const dotvariants = tv({
    base: 'inline-flex w-[0.55rem] h-[0.55rem] me-1 bg-blue-600 rounded-full',
    variants: {
      variant: {
        CURRENT: 'bg-[rgb(61,180,242)]',
        PLANNING: 'bg-[rgb(247,154,99)]',
        COMPLETED: 'bg-[rgb(123,213,85)]',
        PAUSED: 'bg-[rgb(250,122,122)]',
        REPEATING: 'bg-[#3baeea]',
        DROPPED: 'bg-[rgb(232,93,117)]'
      }
    },
    defaultVariants: {
      variant: 'CURRENT'
    }
  })

  export let variant: VariantProps<typeof dotvariants>['variant'] = 'CURRENT'

  type $$Props = HTMLAttributes<HTMLSpanElement> & { variant: VariantProps<typeof dotvariants>['variant']}

  let className: $$Props['class'] = ''
  export { className as class }
</script>

<span class={cn(dotvariants({ variant }), className)} />
