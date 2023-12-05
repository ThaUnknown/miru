<script>
  /** @type {import('./$types').PageData} */
  export let data
</script>

<div class='container'>
  <div class='content'>
    <div class='h-vh-half row px-20 px-sm-0'>
      <div class='col-sm-3 d-none d-sm-flex' />
      <div class='col-sm-6 d-flex justify-content-center flex-column'>
        <h1 class='font-weight-bold text-white title'>Changelog</h1>
        <div class='font-size-18 text-muted'>New updates and improvements to Miru.</div>
      </div>
    </div>
    {#await data.releases}
      {#each Array(5) as _}
        <hr class='my-20' />
        <div class='row py-20 px-20 px-sm-0'>
          <div class='col-sm-3 my-20 order-last order-sm-first '>
            <div class='skeloader rounded w-100 h-10 bg-very-dark'>
              <div class='skeleloader-swipe' />
            </div>
          </div>
          <div class='col-sm-9'>
            <div class='skeloader rounded w-150 h-25 bg-very-dark mb-10'>
              <div class='skeleloader-swipe' />
            </div>
            <div class='skeloader rounded w-250 h-10 bg-very-dark mt-20'>
              <div class='skeleloader-swipe' />
            </div>
            <div class='skeloader rounded w-200 h-10 bg-very-dark mt-15'>
              <div class='skeleloader-swipe' />
            </div>
          </div>
        </div>
      {/each}
    {:then changelog}
      {#each changelog as { version, date, body }}
        <hr class='my-20' />
        <div class='row py-20 px-20 px-sm-0 position-relative'>
          <div class='col-sm-3 order-last order-sm-first text-white'>
            <div class='position-sticky pt-20'>
              {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div class='col-sm-9 pre-wrap text-muted'>
            <h2 class='mt-0 font-weight-bold text-white'>{version}</h2>{body.replaceAll('- ', '')}</div>
        </div>
      {/each}
    {:catch}
      {#each Array(5) as _}
        <hr class='my-20' />
        <div class='row py-20 px-20 px-sm-0'>
          <div class='col-sm-3 my-20 order-last order-sm-first '>
            <div class='skeloader rounded w-100 h-10 bg-very-dark'>
              <div class='skeleloader-swipe' />
            </div>
          </div>
          <div class='col-sm-9'>
            <div class='skeloader rounded w-150 h-25 bg-very-dark mb-10'>
              <div class='skeleloader-swipe' />
            </div>
            <div class='skeloader rounded w-250 h-10 bg-very-dark mt-20'>
              <div class='skeleloader-swipe' />
            </div>
            <div class='skeloader rounded w-200 h-10 bg-very-dark mt-15'>
              <div class='skeleloader-swipe' />
            </div>
          </div>
        </div>
      {/each}
    {/await}
  </div>
</div>

<style>
  .title {
    font-size: 5rem
  }
  .position-sticky {
    top: var(--navbar-height)
  }
</style>
