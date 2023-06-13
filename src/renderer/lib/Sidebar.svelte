<script>
  import { getContext } from 'svelte'
  import { alID } from '@/modules/anilist.js'
  import { media } from './Player/MediaHandler.svelte'
  import { platformMap } from './Settings.svelte'
  import { addToast } from './Toasts.svelte'
  import { wrapEnter } from '@/modules/util.js'
  const sidebar = getContext('sidebar')
  const view = getContext('view')
  const trailer = getContext('trailer')
  const gallery = getContext('gallery')
  export let page
  const links = [
    {
      click: () => {
        $sidebar = !$sidebar
      },
      image: 'logo_cut.png',
      icon: 'menu',
      text: 'Open Menu'
    },
    {
      click: () => {
        page = 'home'
        $gallery = null
        $view = null
        $trailer = null
      },
      icon: 'home',
      text: 'Home Page'
    },
    {
      click: () => {
        page = 'home'
        $gallery = 'schedule'
      },
      icon: 'schedule',
      text: 'Airing Schedule'
    },
    {
      click: () => {
        if ($media) $view = $media.media
      },
      icon: 'queue_music',
      text: 'Now Playing'
    },
    {
      click: () => {
        page = 'watchtogether'
      },
      icon: 'groups',
      text: 'Watch Together'
    },
    {
      click: () => {
        page = 'settings'
      },
      icon: 'tune',
      text: 'Settings'
    },
    {
      click: () => {
        if (alID) {
          localStorage.removeItem('ALtoken')
          location.hash = ''
          location.reload()
        } else {
          window.IPC.emit('open', 'https://anilist.co/api/v2/oauth/authorize?client_id=4254&response_type=token') // Change redirect_url to miru://auth
          if (platformMap[window.version.platform] === 'Linux') {
            addToast({
              text: "If your linux distribution doesn't support custom protocol handlers, you can simply paste the full URL into the app.",
              title: 'Support Notification',
              type: 'secondary',
              duration: '300000'
            })
          }
        }
      },
      icon: 'login',
      text: 'Login With AniList'
    }
  ]
  if (alID) {
    alID.then(result => {
      if (result?.data?.Viewer) {
        links[links.length - 1].image = result.data.Viewer.avatar.medium
        links[links.length - 1].text = result.data.Viewer.name + '\nLogout'
      }
    })
  }
</script>

<div class='sidebar shadow-lg'>
  <div class='sidebar-menu h-full d-flex flex-column m-0 pb-5'>
    {#each links as { click, icon, text, image }, i (i)}
      <div
        class='sidebar-link sidebar-link-with-icon pointer'
        class:brand={i === 0}
        data-toggle='tooltip'
        data-placement='right'
        data-title={text}
        tabindex='0'
        role='button'
        on:click={click}
        on:keydown={wrapEnter(click)}
        class:mt-auto={i === links.length - 2}>
        <span class='text-nowrap d-flex align-items-center' class:justify-content-between={i === 0}>
          {#if image}
            {#if i === 0}
              <img src={image} alt='logo' class='text' />
              <span class='material-icons menu'>{icon}</span>
            {:else}
              <img src={image} alt='logo' />
              <span class='text'>{text}</span>
              <span class='material-icons menu text'>{icon}</span>
            {/if}
          {:else}
            <span class='material-icons'>{icon}</span>
            <span class='text'>{text}</span>
          {/if}
        </span>
      </div>
    {/each}
  </div>
</div>

<style>
  /* sidebar */
  :root {
    --sidebar-minimised: 7rem;
    --sidebar-width: 22rem;
  }

  .text {
    opacity: 1;
    transition: opacity 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
    margin-left: 1rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }
  .text:not(.material-icons) {
    font-weight: bold;
  }

  .sidebar-link > span {
    transition: background 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), color 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    color: #fff;
    border-radius: 0.3rem;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .sidebar-link:not(.brand):hover > span {
    background: #fff;
    color: var(--dark-color);
  }

  .sidebar-link {
    width: 100%;
    font-size: 1.4rem;
    padding: 0.75rem 1.5rem;
    height: 5.5rem;
  }

  .material-icons {
    font-size: 2.2rem;
    min-width: 4rem;
    width: 4rem;
    height: 4rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .sidebar-link:not(.brand) img {
    font-size: 2.2rem;
    width: 3rem;
    height: 3rem;
    margin: 0.5rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .menu {
    right: 1.5rem;
    position: absolute;
  }

  img {
    height: 3rem;
    margin-right: var(--sidebar-brand-image-margin-right);
  }

  .brand {
    height: 8rem;
  }

  .sidebar {
    transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
    will-change: width;
    overflow: visible;
    visibility: visible !important;
    top: var(--navbar-height);
    height: calc(100% - var(--navbar-height))
  }
  :global(.nav-hidden) > .sidebar {
    left: calc(-1 * var(--sidebar-width)) !important;
  }
  .sidebar-link::before {
    white-space: pre !important;
  }

  .page-wrapper:not(.with-sidebar[data-sidebar-hidden]) .sidebar [data-toggle='tooltip']::before {
    display: none;
  }

  [data-toggle='tooltip']:not([data-target-breakpoint])::before,
  [data-toggle='tooltip']:not([data-target-breakpoint])::before {
    visibility: visible !important;
    pointer-events: none;
    background: #fff;
    color: #000;
    transition: opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), top 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    top: 0;
    opacity: 0;
    font-weight: bold;
    box-shadow: var(--dm-shadow) !important;
  }

  [data-toggle='tooltip']:not([data-target-breakpoint]):hover::before {
    opacity: 1;
    top: 50%;
  }
</style>
