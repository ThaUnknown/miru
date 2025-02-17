<script lang='ts'>
  import { bannerSrc, hideBanner } from '$lib/components/ui/banner'
  import { Player } from '$lib/components/ui/player'
  import type { MediaInfo } from '$lib/components/ui/player/util'
  import { banner, client, title } from '$lib/modules/anilist'
  import { IDMedia } from '$lib/modules/anilist/queries'
  import { onMount, tick } from 'svelte'

  onMount(async () => {
    await tick()
    hideBanner.value = true
  })

  const mediaInfo: PromiseLike<MediaInfo> = client.client.query(IDMedia, { id: 176642 }, { requestPolicy: 'cache-first' }).then(v => {
    const media = v.data!.Media!
    bannerSrc.value = media

    return {
      url: '/video.mkv',
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

<div class='px-3 w-full h-full py-12 gap-4 content-center text-webkit-center'>
  {#await mediaInfo then mediaInfo}
    <Player {mediaInfo} />
  {/await}
  <!-- <div class='w-60 shrink-0'>
    Episode list
  </div> -->
</div>

<style>
  .text-webkit-center {
    text-align: -webkit-center;
  }
</style>
