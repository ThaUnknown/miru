<script lang='ts'>
  import Bell from 'lucide-svelte/icons/bell'
  import Clapperboard from 'lucide-svelte/icons/clapperboard'
  import Maximize2 from 'lucide-svelte/icons/maximize-2'
  import Share2 from 'lucide-svelte/icons/share-2'
  import { onDestroy } from 'svelte'

  import EntryEditor from '../../../../lib/components/EntryEditor.svelte'

  import type { LayoutData } from './$types'

  import Anilist from '$lib/components/icons/Anilist.svelte'
  import MyAnimeList from '$lib/components/icons/MyAnimeList.svelte'
  import { bannerSrc, hideBanner } from '$lib/components/ui/banner'
  import { Button } from '$lib/components/ui/button'
  import { PlayButton, BookmarkButton, FavoriteButton } from '$lib/components/ui/button/extra'
  import * as Dialog from '$lib/components/ui/dialog'
  import { Load } from '$lib/components/ui/img'
  import { Profile } from '$lib/components/ui/profile'
  import { cover, desc, duration, format, season, status, title } from '$lib/modules/anilist'
  import { authAggregator, of } from '$lib/modules/auth'
  import native from '$lib/modules/native'
  import { dragScroll } from '$lib/modules/navigate'

  export let data: LayoutData

  const oldBanner = bannerSrc.value

  $: anime = data.anime

  $: media = $anime.Media!

  $: bannerSrc.value = media
  hideBanner.value = false
  onDestroy(() => {
    bannerSrc.value = oldBanner
  })

  function share () {
    native.share({
      title: `Watch on Hayase - ${media.title?.romaji ?? ''}`,
      text: desc(media),
      url: `https://hayas.ee/anime/${media.id}`
    })
  }

  function handleScroll (e: Event) {
    const target = e.target as HTMLDivElement
    hideBanner.value = target.scrollTop > 100
  }

  function getColorForRating (rating: number) {
    if (rating >= 75) return 'bg-green-700'
    if (rating >= 65) return 'bg-orange-400'
    return 'bg-red-400'
  }

  $: mediaId = media.id
  $: following = authAggregator.following(mediaId)
  $: followerEntries = $following?.data?.Page?.mediaList?.filter(e => e?.user?.id !== authAggregator.id()) ?? []
</script>

<div class='min-w-0 -ml-14 pl-14 grow items-center flex flex-col h-full overflow-y-auto z-10 pointer-events-none pb-10' use:dragScroll on:scroll={handleScroll}>
  <div class='gap-6 w-full pt-4 md:pt-32 flex flex-col items-center justify-center max-w-[1600px] px-3 xl:px-14 pointer-events-auto overflow-x-clip'>
    <div class='flex flex-col md:flex-row w-full items-center md:items-end gap-5 pt-12'>
      <Dialog.Root portal='#root'>
        <Dialog.Trigger class='shrink-0 w-[180px] h-[256px] rounded overflow-hidden relative group focus-visible:ring-1 focus-visible:ring-ring select:scale-[1.02] transition-transform duration-200'>
          <div class='absolute flex-center w-full h-full bg-black group-select:bg-opacity-50 bg-opacity-0 duration-300 text-white transition-all ease-out'>
            <Maximize2 class='size-10 scale-75 opacity-0 group-select:opacity-100 group-select:scale-100 duration-300 transition-all ease-out' />
          </div>
          <Load src={cover(media)} color={media.coverImage?.color} class='w-full h-full object-cover' />
        </Dialog.Trigger>
        <Dialog.Content class='flex justify-center'>
          <Load src={cover(media)} color={media.coverImage?.color} class='h-full object-cover rounded' />
        </Dialog.Content>
      </Dialog.Root>
      <div class='flex flex-col gap-4 items-center md:items-start justify-end w-full'>
        <div class='flex flex-col gap-1 text-center md:text-start w-full'>
          <h3 class='text-lg capitalize leading-none text-muted-foreground'>
            {season(media)}
          </h3>
          <h1 class='font-black text-2xl md:text-4xl line-clamp-2 text-white'>{title(media)}</h1>
          <h2 class='line-clamp-1 text-sm md:text-lg font-light text-muted-foreground'>{media.title?.romaji ?? ''}</h2>
          <div class='flex-wrap w-full justify-start md:pt-1 gap-4 hidden md:flex'>
            <div class='rounded px-3 font-bold' style:background={media.coverImage?.color ?? '#27272a'}>
              <div class='text-contrast'>
                {of(media) ?? duration(media) ?? 'N/A'}
              </div>
            </div>
            <div class='rounded px-3 font-bold' style:background={media.coverImage?.color ?? '#27272a'}>
              <div class='text-contrast'>
                {format(media)}
              </div>
            </div>
            <div class='rounded px-3 font-bold' style:background={media.coverImage?.color ?? '#27272a'}>
              <div class='text-contrast'>
                {status(media)}
              </div>
            </div>
            {#if media.averageScore}
              <div class='rounded px-3 font-bold {getColorForRating(media.averageScore)}'>
                <div class='text-contrast'>
                  {media.averageScore}%
                </div>
              </div>
            {/if}
          </div>
          <div class='md:block hidden relative pb-6 md:pt-2 md:pb-0'>
            <div class='line-clamp-4 md:text-start text-center text-xs md:text-md leading-2 font-light antialiased whitespace-pre-wrap text-muted-foreground'>{desc(media)}</div>
          </div>
        </div>
      </div>
    </div>
    <div class='flex gap-2 items-center md:justify-start md:self-start'>
      <div class='flex md:mr-3 w-full min-[380px]:w-[180px]'>
        <PlayButton size='default' {media} class='rounded-r-none w-full' />
        <EntryEditor {media} />
      </div>
      <FavoriteButton {media} variant='secondary' size='icon' class='min-[380px]:-order-1 md:order-none' />
      <BookmarkButton {media} variant='secondary' size='icon' class='min-[380px]:-order-2 md:order-none' />
      <Button size='icon' variant='secondary' on:click={share}>
        <Share2 class='size-4' />
      </Button>
      <Button size='icon' variant='secondary' class='hidden md:flex' on:click={() => native.openURL(`https://anilist.co/anime/${media.id}`)}>
        <Anilist class='size-4' />
      </Button>
      {#if media.idMal}
        <Button size='icon' variant='secondary' class='hidden md:flex' on:click={() => native.openURL(`https://myanimelist.net/anime/${media.idMal}`)}>
          <MyAnimeList class='size-4 flex-center' />
        </Button>
      {/if}
      {#if media.trailer?.id}
        <Dialog.Root portal='#root'>
          <Dialog.Trigger let:builder asChild>
            <Button size='icon' variant='secondary' class='hidden md:flex' builders={[builder]}>
              <Clapperboard class='size-4' />
            </Button>
          </Dialog.Trigger>
          <Dialog.Content class='flex justify-center max-h-[80%] h-full'>
            <iframe class='h-full max-w-full aspect-video max-h-full rounded' src={`https://www.youtube-nocookie.com/embed/${media.trailer.id}?autoplay=1`} frameborder='0' allow='autoplay' allowfullscreen title={media.title?.userPreferred ?? ''} />
          </Dialog.Content>
        </Dialog.Root>
      {/if}
      <Button size='icon' variant='secondary' disabled>
        <Bell class='size-4' />
      </Button>
      <div class='-space-x-1 md:ml-3 hidden md:flex'>
        {#each followerEntries as followerEntry, i (followerEntry?.user?.id ?? i)}
          {#if followerEntry?.user}
            <Profile user={followerEntry.user} />
          {/if}
        {/each}
      </div>
    </div>
    <slot />
  </div>
</div>
