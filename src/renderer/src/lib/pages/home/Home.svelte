<script>
  import Search from './Search.svelte'
  import Section from './Section.svelte'
  // TODO: add AL account detection for hiding
  const sections = [
    {
      title: 'Continue Watching',
      click: () => {},
      cards: new Promise(() => {}),
      hide: true
    },
    {
      title: 'New Releases',
      click: () => {},
      cards: new Promise(() => {})
    },
    {
      title: 'Your List',
      click: () => {},
      cards: new Promise(() => {}),
      hide: true
    },
    {
      title: 'Trending Now',
      click: () => {},
      cards: new Promise(() => {})
    },
    {
      title: 'Romance',
      click: () => {},
      cards: new Promise(() => {})
    },
    {
      title: 'Action',
      click: () => {},
      cards: new Promise(() => {})
    }
  ]
</script>

<div class="d-flex h-full flex-column overflow-y-scroll root">
  <div class="h-full py-10">
    <Search />
    <div>
      {#each sections as opts (opts.title)}
        {#if !opts.hide}
          <Section {opts} />
        {/if}
      {/each}
    </div>
  </div>
</div>

<style>
  .root {
    animation: 0.3s ease 0s 1 load-in;
  }
  @keyframes load-in {
    from {
      bottom: -1.2rem;
      transform: scale(0.95);
    }

    to {
      bottom: 0;
      transform: scale(1);
    }
  }
</style>
