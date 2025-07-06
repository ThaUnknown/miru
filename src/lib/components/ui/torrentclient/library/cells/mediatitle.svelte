<script lang='ts'>
  import { client } from '$lib/modules/anilist'

  export let value: number
</script>

{#await client.single(value)}
  ?
{:then query}
  {query.data?.Media?.title?.userPreferred ?? '?'}
{:catch}
  ?
{/await}
