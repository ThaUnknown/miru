<script lang='ts'>
  import { onMount, tick } from 'svelte'

  import type { MediaInfo } from '$lib/components/ui/player/util'

  import { bannerSrc, hideBanner } from '$lib/components/ui/banner'
  import { Player } from '$lib/components/ui/player'
  import { banner, client, title } from '$lib/modules/anilist'
  import { IDMedia } from '$lib/modules/anilist/queries'

  onMount(async () => {
    await tick()
    hideBanner.value = true
  })

  const mediaInfo: PromiseLike<MediaInfo> = client.client.query(IDMedia, { id: 176642 }, { requestPolicy: 'cache-first' }).then(v => {
    const media = v.data!.Media!
    bannerSrc.value = media

    return {
      url: '/Ameku.webm',
      episode: 6,
      media,
      forced: false,
      session: {
        title: title(media),
        description: 'Episode 6 - Fierce Blazing Finale',
        image: banner(media) ?? ''
      }
    }
  })

</script>

<div class='px-3 w-full h-full py-10 gap-4 flex justify-center items-center'>
  {#await mediaInfo then mediaInfo}
    <div class='w-full h-full content-center text-webkit-center'>
      <Player {mediaInfo} />
    </div>
  {/await}
</div>

<style>
  .text-webkit-center {
    text-align: -webkit-center;
  }
</style>
