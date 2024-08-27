<script>
  /** @type {import("d:/Webdevelopment/miru/common/modules/al").Viewer | {}} */
  export let user = {}

  /** @type {string[]} */
  export let messages = []

  /** @type {Date} */
  export let time

  /** @type {'incoming' | 'outgoing'} */
  export let type = 'incoming'
  const incoming = type === 'incoming'
</script>

<div class='message d-flex flex-row mt-15' class:flex-row={incoming} class:flex-row-reverse={!incoming}>
  <img src={user?.avatar?.medium || 'https://s4.anilist.co/file/anilistcdn/user/avatar/large/default.png'} alt='ProfilePicture' class='w-50 h-50 rounded-circle p-5 mt-auto' />
  <div class='d-flex flex-column px-10 align-items-start flex-auto' class:align-items-start={incoming} class:align-items-end={!incoming}>
    <div class='pb-5 d-flex flex-row align-items-center px-5'>
      <div class='font-weight-bold font-size-18 line-height-normal'>
        {user?.name || 'Anonymous'}
      </div>
      <div class='text-muted pl-10 font-size-12 line-height-normal'>
        {time.toLocaleTimeString()}
      </div>
    </div>
    {#each messages as message}
      <div class='bg-dark-light py-10 px-15 rounded-top rounded-right mb-5 select-all pre-wrap' style='max-width: calc(100% - 10rem)'
        class:bg-dark-light={incoming} class:bg-accent={!incoming}
        class:rounded-right={incoming} class:rounded-left={!incoming}>
        {message}
      </div>
    {/each}
  </div>
</div>

<style>
  .message {
    --base-border-radius: 1.3rem;
  }
  .bg-accent {
    background-color: var(--accent-color);
  }
  .flex-auto {
    flex: auto;
  }
</style>
