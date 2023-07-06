<script>
  import { getContext } from 'svelte'
  import { alID } from '@/modules/anilist.js'
  import { media } from '../views/Player/MediaHandler.svelte'
  import { platformMap } from '../views/Settings.svelte'
  import { addToast } from './Toasts.svelte'
  import { wrapEnter } from '@/modules/util.js'
  const view = getContext('view')
  export let page
  const links = [
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
      text: 'Login With AniList',
      css: 'mt-auto'
    },
    {
      click: () => {
        page = 'home'
      },
      page: 'home',
      icon: 'home',
      text: 'Home'
    },
    {
      click: () => {
        page = 'search'
      },
      page: 'search',
      icon: 'search',
      text: 'Search'
    },
    // {
    //   click: () => {
    //     page = 'home'
    //   },
    //   icon: 'schedule',
    //   text: 'Schedule'
    // },
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
      page: 'watchtogether',
      icon: 'groups',
      text: 'Watch Together'
    },
    {
      click: () => {
        window.IPC.emit('open', 'https://github.com/sponsors/ThaUnknown/')
      },
      icon: 'favorite',
      text: 'Support This App',
      css: 'mt-auto donate'
    },
    {
      click: () => {
        page = 'settings'
      },
      page: 'settings',
      icon: 'settings',
      text: 'Settings'
    }
  ]
  if (alID) {
    alID.then(result => {
      if (result?.data?.Viewer) {
        links[0].image = result.data.Viewer.avatar.medium
        links[0].text = 'Logout'
      }
    })
  }
</script>

<div class='sidebar z-30'>
  <div class='sidebar-menu h-full d-flex flex-column justify-content-center align-items-center m-0 pb-5' class:animate={page !== 'player'}>
    {#each links as { click, icon, text, image, css, page: _page }, i (i)}
      <div
        class='sidebar-link sidebar-link-with-icon pointer overflow-hidden {css}'
        tabindex='0'
        role='button'
        on:click={click}
        on:keydown={wrapEnter(click)}>
        <span class='text-nowrap d-flex align-items-center w-full h-full'>
          {#if image}
            <span class='material-symbols-outlined rounded' class:filled={page === _page}>
              <img src={image} class='h-30' alt='logo' />
            </span>
            <span class='text ml-20'>{text}</span>
          {:else}
            <span class='material-symbols-outlined rounded' class:filled={page === _page}>{icon}</span>
            <span class='text ml-20'>{text}</span>
          {/if}
        </span>
      </div>
    {/each}
  </div>
</div>

<style>
  @keyframes glow {
    from {
      text-shadow: 0 0 2rem #fa68b6;
    }
    to {
      text-shadow: 0 0 1rem #fa68b6;
    }
  }
  .animate .donate .material-symbols-outlined {
    animation: glow 1s ease-in-out infinite alternate;
  }
  .donate:hover .material-symbols-outlined {
    background: #fff;
    color: #fa68b6 !important;
  }
  .donate .material-symbols-outlined {
    font-variation-settings: 'FILL' 1;
    color: #fa68b6;
    text-shadow: 0 0 1rem #fa68b6;
  }
  .sidebar-menu {
    padding-top: 10rem;
  }
  .text {
    opacity: 1;
    transition: opacity 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .sidebar-link > span {
    color: #fff;
    border-radius: 0.3rem;
  }

  .material-symbols-outlined {
    color: #fff;
    transition: background .8s cubic-bezier(0.25, 0.8, 0.25, 1), color .8s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .sidebar-link:hover > span > *:nth-child(1) {
    background: #fff;
    color: var(--dark-color);
  }

  .sidebar-link {
    width: 100%;
    font-size: 1.4rem;
    padding: 0.75rem 1.5rem;
    height: 5.5rem;
  }

  .material-symbols-outlined {
    font-size: 2.2rem;
    min-width: 4rem;
    width: 4rem;
    height: 4rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .sidebar-link img {
    font-size: 2.2rem;
    width: 3rem;
    height: 3rem;
    margin: 0.5rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  img {
    margin-right: var(--sidebar-brand-image-margin-right);
  }

  .sidebar {
    transition: width .8s cubic-bezier(0.25, 0.8, 0.25, 1), left .8s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
    will-change: width;
    background: linear-gradient(90deg, #17191D 15.62%, rgba(23, 25, 29, 0.92) 36.46%, rgba(23, 25, 29, 0.619632) 70.83%, rgba(23, 25, 29, 0) 100%);
    backdrop-filter: blur(2px);
  }
  .sidebar:hover {
    width: 63rem
  }
</style>
