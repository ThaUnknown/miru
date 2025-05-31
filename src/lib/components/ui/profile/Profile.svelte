<script lang='ts'>
  import type { UserFrag } from '$lib/modules/anilist/queries'
  import type { ResultOf } from 'gql.tada'
  import type { HTMLAttributes } from 'svelte/elements'

  import Shadow from '$lib/components/Shadow.svelte'
  import * as Avatar from '$lib/components/ui/avatar'
  import * as Popover from '$lib/components/ui/popover'
  import { cn, since } from '$lib/utils'

  type $$Props = HTMLAttributes<HTMLImageElement> & {
    user: ResultOf<typeof UserFrag>
  }

  let className: $$Props['class'] = 'inline-block ring-4 ring-black size-8 bg-black group-focus-visible/profile:ring-neutral-100 !border-0'
  export { className as class }

  export let user: ResultOf<typeof UserFrag>

  $: name = user.name
  $: avatar = user.avatar?.medium ?? ''
  $: banner = user.bannerImage ?? ''
  $: bubble = user.donatorBadge
</script>

<div class='flex'>
  <Popover.Root>
    <Popover.Trigger class='flex group/profile'>
      <Avatar.Root class={cn('group-focus-visible/profile:border border-white', className)}>
        <Avatar.Image src={avatar} alt={name} />
        <Avatar.Fallback>{name}</Avatar.Fallback>
      </Avatar.Root>
    </Popover.Trigger>
    <Popover.Content class='p-1 m-3 rounded-md shadow root-bg border-none w-auto' style='--theme-base-color: {user.options?.profileColor ?? '#000'}'>
      <div class='w-[300px] rounded core-bg gap-2 flex flex-col pb-2'>
        <div class={cn('w-full h-[105px] relative p-3 flex items-end', !banner && 'bg-white/10')}>
          {#if banner}
            <img src={banner} alt='banner' class='absolute top-0 left-0 w-full h-full rounded-t opacity-50 pointer-events-none object-cover' />
          {/if}
          <Avatar.Root class='inline-block size-20'>
            <Avatar.Image src={avatar} alt={name} />
            <Avatar.Fallback>{name}</Avatar.Fallback>
          </Avatar.Root>
          <div class='min-w-0 flex flex-col pl-3 relative'>
            <div class='font-extrabold pb-0.5 text-2xl text-ellipsis overflow-clip pr-0.5'>
              {name}
            </div>
            <div class='details text-neutral-200 flex text-[11px]'>
              {#if user.isFollower}
                <span class='text-nowrap flex items-center'>Follows you</span>
              {/if}
              <span class='text-nowrap flex items-center'>Joined {since(new Date((user.createdAt ?? 0) * 1000))}</span>
            </div>
          </div>
          {#if bubble && bubble !== 'Donator'}
            <div class='-left-5 -top-11 absolute text-sm'>
              <div class='px-4 py-2 rounded-2xl bg-mix bubbles relative leading-tight'>
                <span class='text-contrast'>
                  {bubble}
                </span>
              </div>
            </div>
          {/if}
        </div>
        <Shadow html={user.about ?? 'No user description'} class='w-full max-h-[200px] text-sm py-2 px-4 overflow-y-auto overflow-x-clip' />
        <div class='details text-neutral-200 flex text-[11px] px-4'>
          <span class='text-nowrap flex items-center'>{user.statistics?.anime?.count ?? 0} anime</span>
          <span class='text-nowrap flex items-center'>{user.statistics?.anime?.episodesWatched ?? 0} episodes</span>
          <span class='text-nowrap flex items-center'>{since(new Date(Date.now() - (user.statistics?.anime?.minutesWatched ?? 0) * 60 * 1000)).replace('ago', 'watched')}</span>
        </div>
      </div>
    </Popover.Content>
  </Popover.Root>
</div>

<style>
  :global(.root-bg) {
    background: linear-gradient(var(--theme-base-color, #000), rgb(34, 33, 30))
  }
  .core-bg {
    background: color-mix(in oklab, #141414 30%, var(--theme-base-color, #000) 100%);
  }
  .bg-mix {
    background: color-mix(in oklab, #fff 100%, var(--theme-base-color, #000) 50%);
  }
  .bubbles::before {
    top: 42px;
    left: 10px;
    height: 20px;
    width: 20px;
    background: inherit;
    content: '';
    position: absolute;
    border-radius: 50%;
  }
  .bubbles::after {
    top: 70px;
    left: 20px;
    height: 10px;
    width: 10px;
    background: inherit;
    content: '';
    position: absolute;
    border-radius: 50%;
  }
</style>
