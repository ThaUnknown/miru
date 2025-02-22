<script lang='ts'>
  import { Bell, Clapperboard, Maximize2, Share2 } from 'lucide-svelte'
  import { onDestroy } from 'svelte'
  import type { PageData } from './$types'

  import * as Dialog from '$lib/components/ui/dialog'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import * as Avatar from '$lib/components/ui/avatar'
  import { bannerSrc, hideBanner } from '$lib/components/ui/banner'
  import { PlayButton, Button, BookmarkButton, FavoriteButton } from '$lib/components/ui/button'
  import { dragScroll } from '$lib/modules/navigate'

  import { cover, desc, duration, format, relation, season, status, title } from '$lib/modules/anilist'
  import { authAggregator, of } from '$lib/modules/auth'
  import native from '$lib/modules/native'
  import { cn } from '$lib/utils'
  import EntryEditor from './EntryEditor.svelte'
  import EpisodesList from '$lib/components/EpisodesList.svelte'
  import MyAnimeList from '$lib/components/icons/MyAnimeList.svelte'
  import Anilist from '$lib/components/icons/Anilist.svelte'
  import { Load } from '$lib/components/ui/img'

  export let data: PageData

  const oldBanner = bannerSrc.value
  $: bannerSrc.value = data.anime.value.Media
  hideBanner.value = false
  onDestroy(() => {
    bannerSrc.value = oldBanner
  })

  $: anime = data.anime

  $: media = $anime.Media!

  $: relations = media.relations?.edges?.filter(edge => edge?.node?.type === 'ANIME')

  function share () {
    native.share({
      title: `Watch on Hayase - ${media.title?.romaji ?? ''}`,
      text: desc(media),
      url: `https://hayas.ee/anime/${media.id}`
    })
  }

  let showRelations = false

  function showMore () {
    showRelations = !showRelations
  }

  function handleScroll (e: Event) {
    const target = e.target as HTMLDivElement
    hideBanner.value = target.scrollTop > 100
  }

  const hasAuth = authAggregator.hasAuth

  $: mediaID = media.id
  $: following = $hasAuth ? authAggregator.following(mediaID) : undefined

  $: eps = data.eps
</script>

<div class='w-full items-center flex flex-col h-full overflow-y-auto overflow-x-hidden' use:dragScroll on:scroll={handleScroll}>
  <div class='gap-6 w-full pt-4 md:pt-48 flex flex-col items-center justify-center max-w-[1600px] px-3 xl:px-14'>
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
          <h1 class='font-extrabold text-2xl md:text-4xl line-clamp-2 text-white'>{title(media)}</h1>
          <h2 class='line-clamp-1 text-sm md:text-lg font-light text-muted-foreground'>{media.title?.romaji ?? ''}</h2>
          <div class='flex-wrap w-full justify-start md:pt-1 gap-4 hidden md:flex'>
            <div class='rounded px-3 font-bold' style:background={media.coverImage?.color ?? '#27272a'}>
              <div class='text-transparent bg-clip-text text-contrast bg-inherit'>
                {of(media) ?? duration(media) ?? 'N/A'}
              </div>
            </div>
            <div class='rounded px-3 font-bold' style:background={media.coverImage?.color ?? '#27272a'}>
              <div class='text-transparent bg-clip-text text-contrast bg-inherit'>
                {format(media)}
              </div>
            </div>
            {#if media.averageScore}
              <div class='rounded px-3 font-bold' style:background={media.coverImage?.color ?? '#27272a'}>
                <div class='text-transparent bg-clip-text text-contrast bg-inherit'>
                  {media.averageScore}%
                </div>
              </div>
            {/if}
            <div class='rounded px-3 font-bold' style:background={media.coverImage?.color ?? '#27272a'}>
              <div class='text-transparent bg-clip-text text-contrast bg-inherit'>
                {status(media)}
              </div>
            </div>
          </div>
          <div class='md:block hidden relative pb-6 md:pt-2 md:pb-0'>
            <div class='line-clamp-4 md:text-start text-center text-xs md:text-md leading-2 font-light antialiased whitespace-pre-wrap text-muted-foreground'>{desc(media)}</div>
          </div>
        </div>
      </div>
    </div>
    <div class='flex gap-2 items-center justify-center md:justify-start w-full lex-wrap'>
      <div class='flex md:mr-3 w-full min-[380px]:w-[180px]'>
        <PlayButton size='default' {media} class={cn($hasAuth && 'rounded-r-none', 'w-full')} />
        {#if $hasAuth}
          <EntryEditor {media} />
        {/if}
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
        {#if following && $following?.data?.Page?.mediaList}
          {#each $following.data.Page.mediaList.filter(e => e?.user?.id !== authAggregator.id()) as followerEntry, i (followerEntry?.user?.id ?? i)}
            <Tooltip.Root>
              <Tooltip.Trigger class='inline-block size-8 cursor-default'>
                <Avatar.Root class='inline-block ring-4 ring-black size-8 bg-black'>
                  <Avatar.Image src={followerEntry?.user?.avatar?.medium ?? ''} alt={followerEntry?.user?.name ?? 'N/A'} />
                  <Avatar.Fallback>{followerEntry?.user?.name ?? 'N/A'}</Avatar.Fallback>
                </Avatar.Root>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p class='font-extrabold'>{followerEntry?.user?.name}</p>
                <p class='capitalize'>{followerEntry?.status?.toLowerCase()}</p>
              </Tooltip.Content>
            </Tooltip.Root>
          {/each}
        {/if}
      </div>
    </div>
    {#if relations?.length}
      <div class='w-full'>
        <div class='flex justify-between items-center'>
          <div class='text-[20px] md:text-2xl font-bold'>Relations</div>
          {#if relations.length > 3}
            <Button variant='ghost' class='text-muted-foreground font-bold text-sm' on:click={showMore}>{showRelations ? 'Show Less' : 'Show More'}</Button>
          {/if}
        </div>
        <div class='md:w-full flex gap-5 overflow-x-scroll md:overflow-x-visible md:grid md:grid-cols-3 justify-items-center py-3' use:dragScroll>
          {#each showRelations ? relations : relations.slice(0, 3) as rel (rel?.node?.id)}
            {@const media = rel?.node}
            {#if media}
              <a class='select:scale-[1.02] select:shadow-lg scale-100 transition-all duration-200 shrink-0 ease-out focus-visible:ring-ring focus-visible:ring-1 rounded-md w-96 md:w-full h-[126px] bg-neutral-950 text-secondary-foreground select:bg-neutral-900 flex' style:-webkit-user-drag='none' href='/app/anime/{media.id}'>
                <div class='w-[90px] bg-image rounded-l-md shrink-0'>
                  <Load src={media.coverImage?.medium} class='object-cover h-full w-full shrink-0 rounded-l-md' />
                </div>
                <div class='h-full grid px-3 items-center'>
                  <div class='text-theme font-bold capitalize'>{relation(rel.relationType)}</div>
                  <div class='line-clamp-2'>{media.title?.userPreferred ?? 'N/A'}</div>
                  <div class='font-thin'>{format(media)}</div>
                </div>
              </a>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
    <div class='w-full'>
      <div class='flex justify-between items-center'>
        <div class='text-[20px] md:text-2xl font-bold'>Episodes</div>
      </div>
      {#key mediaID}
        <EpisodesList {media} {eps} />
      {/key}
    </div>
  </div>
</div>
