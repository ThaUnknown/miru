<script lang='ts' context='module'>
  interface value {
    value: string
    label: string
  }

  export function fromobj (object: Record<string, string>, key: string): { items: value[], value: value[] } {
    return {
      items: Object.entries(object).map(([value, label]) => ({ value, label })),
      value: [{ value: '' + key, label: object[key]! }]
    }
  }
</script>

<script lang='ts'>
  import X from 'lucide-svelte/icons/x'
  import { tick } from 'svelte'
  import CaretSort from 'svelte-radix/CaretSort.svelte'
  import Check from 'svelte-radix/Check.svelte'

  import { Button } from '$lib/components/ui/button'
  import * as Command from '$lib/components/ui/command'
  import * as Popover from '$lib/components/ui/popover'
  import { intputType } from '$lib/modules/navigate'
  import { cn } from '$lib/utils.js'

  export let items: readonly value[] = []

  export let placeholder = 'Any'

  let open = false
  export let value: value[] = []

  export let multiple = false

  $: selectedValue = value.map(({ label }) => label).join(', ') || placeholder

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger (triggerId: string) {
    open = false
    tick().then(() => {
      document.getElementById(triggerId)?.focus()
    })
  }

  export let onSelect: (value: value) => void = () => undefined

  function handleSelect (selected: value, triggerId: string) {
    onSelect(selected)
    if (!multiple) {
      value = [selected]
      closeAndFocusTrigger(triggerId)
      return
    }
    if (value.includes(selected)) {
      value = value.filter(item => item !== selected)
    } else {
      value = [...value, selected]
    }
  }

  let className = ''
  export { className as class }
</script>

<Popover.Root bind:open let:ids portal='#root'>
  <Popover.Trigger asChild let:builder>
    <Button
      builders={[builder]}
      variant='outline'
      role='combobox'
      aria-expanded={open}
      class={cn('justify-between border-0 min-w-0', className)}>
      <div class='w-full text-ellipsis overflow-hidden text-left' class:text-muted-foreground={!value.length} class:opacity-50={!value.length}>
        {#key value}
          {selectedValue}
        {/key}
      </div>
      <CaretSort class='ml-2 h-4 w-4 shrink-0 opacity-50' />
    </Button>
  </Popover.Trigger>
  <Popover.Content class={cn('p-0 border-0 z-[1000]')} sameWidth={true}>
    <Command.Root>
      <Command.Input {placeholder} class='h-9 placeholder:opacity-50' />
      <Command.Empty>No results found.</Command.Empty>
      {#if $intputType === 'dpad'}
        <Command.Group class='shrink-0' alwaysRender={true}>
          <Command.Item
            alwaysRender={true}
            class='cursor-pointer'
            onSelect={() => {
              closeAndFocusTrigger(ids.trigger)
            }}
            value='close'>
            <X class='mr-2 h-4 w-4' />
            Close
          </Command.Item>
        </Command.Group>
        <Command.Separator />
      {/if}
      <Command.Group class='overflow-y-auto'>
        {#each items as item (item.value)}
          <Command.Item
            class={cn('cursor-pointer', !multiple && 'flex-row-reverse justify-between')}
            value={item.value}
            onSelect={() => {
              handleSelect(item, ids.trigger)
            }}>
            <div
              class={cn(
                'flex h-4 w-4 items-center justify-center rounded-sm border-primary',
                multiple ? 'border mr-2' : 'ml-2',
                value.find(({ value }) => value === item.value)
                  ? 'bg-primary text-primary-foreground'
                  : 'opacity-50 [&_svg]:invisible'
              )}>
              <Check className={cn('h-4 w-4')} />
            </div>
            {item.label}
          </Command.Item>
        {/each}
      </Command.Group>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
