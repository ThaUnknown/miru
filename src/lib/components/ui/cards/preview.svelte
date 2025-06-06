<script lang='ts'>
  import { BookmarkButton, FavoriteButton, PlayButton } from '../button/extra'
  import { Banner } from '../img'
  import Load from '../img/load.svelte'

  import YoutubeIframe from './YoutubeIframe.svelte'
  import Videoframe from './videoframe.svelte'

  import { desc, duration, format, season, title, type Media } from '$lib/modules/anilist'
  import { of } from '$lib/modules/auth'
  import { cn, type TraceAnime } from '$lib/utils'

  export let media: Media

  export let trace: TraceAnime | undefined = undefined

  let hideFrame: boolean | null = null
  function hide (e: CustomEvent<boolean>) {
    hideFrame = e.detail
  }
</script>

<div class='!absolute w-[17.5rem] h-80 left-1/2 right-1/2 top-0 bottom-0 m-auto bg-neutral-950 z-30 rounded cursor-pointer absolute-container'>
  <div class='h-[45%] banner relative bg-black rounded-t'>
    {#if trace}
      <Load src={trace.image} alt={media.title?.english} class={cn('object-cover w-full h-full blur-2xl saturate-200 absolute -z-10', hideFrame === false && 'hidden')} />
      <Load src={trace.image} alt={media.title?.english} class='object-cover w-full h-full rounded-t' />
      <Videoframe src={trace.video} on:hide={hide} />
    {:else}
      <Banner {media} class={cn('object-cover w-full h-full blur-2xl saturate-200 absolute -z-10', hideFrame === false && 'hidden')} />
      <Banner {media} class='object-cover w-full h-full rounded-t' />
      {#if media.trailer?.id && !hideFrame}
        <YoutubeIframe id={media.trailer.id} on:hide={hide} />
      {/if}
    {/if}
  </div>
  <div class='w-full px-4 bg-neutral-950'>
    <div class='text-lg font-bold truncate inline-block w-full text-white' title={title(media)}>
      {title(media)}
    </div>
    <div class='flex flex-row pt-1'>
      <PlayButton {media} class='grow' />
      <FavoriteButton {media} class='ml-2' />
      <BookmarkButton {media} class='ml-2' />
    </div>
    <div class='details text-white capitalize pt-3 pb-2 flex text-[11px] overflow-clip text-ellipsis text-nowrap'>
      <span class='text-nowrap flex items-center'>
        {format(media)}
      </span>
      <span class='text-nowrap flex items-center'>
        {of(media) ?? duration(media) ?? 'N/A' }
      </span>
      <span class='text-nowrap flex items-center'>
        {season(media)}
      </span>
      {#if media.averageScore}
        <span class='text-nowrap flex items-center text-ellipsis'>
          {media.averageScore}%
        </span>
      {/if}
    </div>
    <div class='w-full h-full overflow-clip text-[.7rem] text-muted-foreground line-clamp-4'>
      {desc(media)}
    </div>
  </div>
</div>

<style>
  .banner::after {
    content: '';
    position: absolute;
    left: 0 ; bottom: 0;
    /* when clicking, translate fucks up the position, and video might leak down 1 or 2 pixels, stickig under the gradient, look bad */
    margin-bottom: -2px;
    width: 100%; height: 100% ;
    background: linear-gradient(180deg, #0000 0%, #0a0a0a00 80%, #0a0a0ae3 95%, #0a0a0a 100%);
  }
  .absolute-container {
    animation: 0.3s ease 0s 1 load-in;
    transform: translate3d(-50%, 0, 0) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(1) scaleY(1);
    opacity: 1;
  }
  @keyframes load-in {
    from {
      opacity: 0;
      transform: translate3d(-50%, 1.2rem, 0) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(0.95) scaleY(0.95);
    }
  }
</style>
