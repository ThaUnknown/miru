<script>
  export let promise
</script>

{#await promise then data}
  {#if !data}
    <div class='p-20 d-flex align-items-center justify-content-center w-full' style='height:35rem;'>
      <div>
        <h1 class='mb-5 text-white font-weight-bold text-center'>
          Ooops!
        </h1>
        <div class='font-size-20 text-center text-muted'>
          Looks like there's nothing here.
        </div>
      </div>
    </div>
  {/if}
{:catch error}
  <div class='p-20 d-flex align-items-center justify-content-center w-full' style='height:35rem;'>
    <div>
      <h1 class='mb-5 text-white font-weight-bold text-center'>
        Ooops!
      </h1>
      <div class='font-size-20 text-center text-muted'>
        Looks like something went wrong!.
      </div>
      <div class='font-size-20 text-center text-muted'>
        {error.message}
      </div>
    </div>
  </div>
{/await}
