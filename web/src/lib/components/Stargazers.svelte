<script>
  /**
   * @type {Promise<any>}
   */
  export let stargazers

  function * chunks (arr, n) {
    for (let i = 0; i < arr.length; i += n) {
      yield arr.slice(i, i + n)
    }
  }
</script>

<div class='d-flex flex-column w-full align-items-center pb-20'>
  <div class='stargazers overflow-hidden position-relative w-full'>
    <div class='overlay-gradient position-absolute top-0 left-0 w-full h-full z-10' />
    {#await stargazers}
      Loading...
    {:then stargazers}
      {#each [...chunks(stargazers, 25)] as stargazerRow}
        <div class='text-nowrap'>
          {#each stargazerRow as { htmlUrl, avatarUrl, login }}
            <a href={htmlUrl} class='d-inline-flex p-10 text-reset zoom' target='_blank'>
              <div class='bg-dark py-15 px-20 rounded font-weight-bold d-flex align-items-center'>
                <img src={avatarUrl} alt='avatar' class='rounded-circle mr-10' loading='lazy' />
                {login}
              </div>
            </a>
          {/each}
        </div>
      {/each}
    {/await}
  </div>
</div>

<style>
  .overlay-gradient {
    background: linear-gradient(90deg, rgba(16,17,19,1) 0%, rgba(16,17,19,0) 25%, rgba(16,17,19,0) 75%, rgba(16,17,19,1) 100%);
    pointer-events: none;
  }
  .stargazers {
    max-width: 205rem;
  }

  img {
    width: 3rem;
    height: 3rem;
  }

  .text-nowrap {
    animation: animateRow1 200s linear infinite;
    width: -moz-max-content;
    width: max-content;
  }

  @keyframes animateRow1 {
    0% {
      transform: translate(0)
    }

    to {
      transform: translate(calc(-50%))
    }
  }

  .text-nowrap:nth-child(even) {
    animation-direction: reverse;
  }

  .zoom {
    transition: transform 0.3s ease;
  }
  .zoom:hover {
    transform: scale(1.1);
  }
</style>
