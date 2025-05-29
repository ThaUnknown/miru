<script lang='ts'>
  import type { Media } from '$lib/modules/anilist'

  import { themes } from '$lib/modules/animethemes'

  export let media: Media

  const themesRes = themes(media.id)
// https://api.animethemes.moe/anime/?fields[audio]=id,basename,link,size&fields[video]=id,basename,link,tags&filter[external_id]=113717&filter[has]=resources&filter[site]=AniList&include=animethemes.animethemeentries.videos,animethemes.animethemeentries.videos.audio,animethemes.song,animethemes.song.artists
// https://animethemes.moe/anime/momentary_lily
// https://animethemes.moe/anime/ousama_ranking
</script>

{#await themesRes}
  Loading

{:then themes}
  {#if themes?.anime?.[0]?.animethemes?.length}
    {#each themes.anime[0].animethemes as theme (theme.id)}
      {theme.type}
    {/each}
  {/if}
{/await}
<div class='bg-neutral-950 rounded-md px-7 py-4 gap-4 flex flex-col text-xs'>
  <div class='flex h-8 items-center'>
    <div class='w-12'>
      OP
    </div>
    <div class='text-base font-bold'>
      Oishi Survivor <span class='text-xs text-muted-foreground font-medium'>by</span> HANABIE
    </div>
  </div>
  <div class='flex h-8 items-center text-muted-foreground'>
    <div class='w-12'>
      v1
    </div>
    <div>
      Episodes 1-2
    </div>
  </div>
  <div class='flex h-8 items-center text-muted-foreground'>
    <div class='w-12'>
      v2
    </div>
    <div>
      Episodes 3-13
    </div>
  </div>
</div>
