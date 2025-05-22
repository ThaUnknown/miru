<script lang='ts'>
  import Combobox, { fromobj } from './combobox.svelte'

  export let value: string
  export let items: Record<string, string>
  export let onSelected: (item: string) => void = () => undefined
</script>

<Combobox onSelect={item => { value = item.value; onSelected(item.value) }} {...fromobj(items, value)} {...$$restProps} />
