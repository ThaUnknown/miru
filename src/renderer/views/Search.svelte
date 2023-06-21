<script context='module'>
  import { writable } from 'simple-store-svelte'

  export const search = writable(null)
</script>

<script>
  import Search from '../components/Search.svelte'
</script>

{#if $search}
  <Search />
{/if}
