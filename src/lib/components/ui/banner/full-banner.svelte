<script lang='ts'>
  import { desc, duration, format, season, title, type Media } from '$lib/modules/anilist'
  import { click } from '$lib/modules/navigate'
  import { onDestroy } from 'svelte'
  import { BookmarkButton, FavoriteButton, PlayButton } from '../button'
  import { bannerSrc } from './banner-image.svelte'
  import { of } from '$lib/modules/auth'
  export let mediaList: Array<Media | null>

  function shuffle <T extends unknown[]> (array: T): T {
    let currentIndex = array.length
    let randomIndex

    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex--);

      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }

    return array
  }

  function shuffleAndFilter (media: Array<Media | null>) {
    return shuffle(media).filter(media => media?.bannerImage ?? media?.trailer?.id).slice(0, 5) as Media[]
  }

  const shuffled = shuffleAndFilter(mediaList)

  // TODO: this assertion is incorrect!
  let current = shuffled[0]!

  const initial = bannerSrc.value

  $: bannerSrc.value = current

  onDestroy(() => {
    bannerSrc.value = initial
  })

  function currentIndex () {
    return shuffled.indexOf(current)
  }

  function schedule (index: number) {
    return setTimeout(() => {
      current = shuffled[index % shuffled.length]
      timeout = schedule(index + 1)
    }, 15000)
  }

  let timeout = schedule(currentIndex() + 1)

  function setCurrent (media: Media) {
    if (current === media) return
    clearTimeout(timeout)
    current = media
    timeout = schedule(currentIndex() + 1)
  }
</script>

<div class='pl-5 pb-5 justify-end flex flex-col h-full max-w-full'>
  {#key current}
    <div class='text-white font-black text-4xl line-clamp-2 w-[800px] max-w-full leading-tight fade-in'>
      {title(current)}
    </div>
    <div class='details text-white capitalize pt-3 pb-2 flex w-[600px] max-w-full text-xs fade-in'>
      <span class='text-nowrap flex items-center'>
        {format(current)}
      </span>
      <span class='text-nowrap flex items-center'>
        {of(current) ?? duration(current) ?? 'N/A'}
      </span>
      <span class='text-nowrap flex items-center'>
        {season(current)}
      </span>
    </div>
    <div class='text-muted-foreground line-clamp-2 w-[600px] max-w-full text-sm fade-in'>
      {desc(current)}
    </div>
    <div class='details text-white text-capitalize py-3 flex w-[600px] max-w-full text-xs fade-in'>
      {#each current.genres ?? [] as genre (genre)}
        <span class='text-nowrap flex items-center'>
          {genre}
        </span>
      {/each}
    </div>
    <div class='flex flex-row pb-2 w-[230px] max-w-full'>
      <PlayButton media={current} class='grow' />
      <FavoriteButton media={current} class='ml-2' />
      <BookmarkButton media={current} class='ml-2' />
    </div>
  {/key}
  <div class='flex'>
    {#each shuffled as media (media.id)}
      {@const active = current === media}
      <div class='pt-2 pb-1' class:cursor-pointer={!active} use:click={() => setCurrent(media)}>
        <div class='bg-neutral-800 mr-2 progress-badge overflow-clip rounded' class:active style='height: 4px;' style:width={active ? '3rem' : '1.5rem'}>
          <div class='progress-content h-full transform-gpu w-full' class:bg-white={active} />
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .progress-badge {
    transition: width .7s ease;
  }
  .progress-badge.active .progress-content {
    animation: fill 15s linear;
  }

  @keyframes fill {
    from {
      transform: translate3d(-100%, var(--tw-translate-y), 0);
    }
    to {
      transform: translate3d(0%, var(--tw-translate-y), 0);
    }
  }
  .details span + span::before {
    content: '•';
    padding: 0 .5rem;
    font-size: .6rem;
    align-self: center;
    white-space: normal;
    color: #737373 !important;
  }
  .fade-in {
    animation: fadeIn ease .8s;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
