<script lang='ts'>
  import { lookup } from '$lib/modules/geoip'
  import { codeToEmoji } from '$lib/utils'

  export let value: string
</script>

<div class='flex gap-x-2'>
  {#await lookup(value) then location}
    <div class='font-twemoji text-xl leading-none content-center line-clamp-1'>
      {codeToEmoji(location.country)}
    </div>
    <div class='text-muted-foreground'>
      {location.country}
    </div>
  {/await}
</div>
