<script lang='ts'>
  import ArrowDown from 'svelte-radix/ArrowDown.svelte'
  import ArrowUp from 'svelte-radix/ArrowUp.svelte'

  import { Button } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { cn } from '$lib/utils'

  let className: string | undefined | null = ''
  export { className as class }
  export let props: {
    sort: {
      order: 'desc' | 'asc' | undefined
      toggle: (_: Event) => void
      clear: () => void
      disabled: boolean
    }
  }

  function handleAscSort (e: Event) {
    if (props.sort.order === 'asc') {
      return
    }
    props.sort.toggle(e)
  }

  function handleDescSort (e: Event) {
    if (props.sort.order === 'desc') {
      return
    }
    if (props.sort.order === undefined) {
      // We can only toggle, so we toggle from undefined to 'asc' first
      props.sort.toggle(e)
    }
    props.sort.toggle(e) // Then we toggle from 'asc' to 'desc'
  }
</script>

{#if !props.sort.disabled}
  <div class={cn('flex items-center', className)}>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild let:builder>
        <Button
          variant='ghost'
          builders={[builder]}
          class='h-8 data-[state=open]:bg-accent text-sm px-4 w-full justify-start'
          size='sm'>
          <slot />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align='start' sameWidth={true}>
        <DropdownMenu.Item on:click={handleAscSort} class='cursor-pointer'>
          <ArrowUp class='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
          Asc
        </DropdownMenu.Item>
        <DropdownMenu.Item on:click={handleDescSort} class='cursor-pointer'>
          <ArrowDown class='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
          Desc
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
{:else}
  <slot />
{/if}
