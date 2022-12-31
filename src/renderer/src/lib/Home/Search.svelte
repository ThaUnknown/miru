<script>
  import { getContext } from 'svelte'
  import { traceAnime } from '@/modules/anime.js'

  export let search
  export let current
  export let media = null
  export let loadCurrent
  let searchTimeout = null
  let searchTextInput

  const view = getContext('view')

  $: !$view && searchTextInput?.focus()
  function searchClear () {
    search = {
      format: '',
      genre: '',
      season: '',
      sort: '',
      status: ''
    }
    current = null
    searchTextInput?.focus()
  }
  function input () {
    if (!searchTimeout) {
      if (Object.values(search).filter(v => v).length) media = [new Promise(() => {})]
    } else {
      clearTimeout(searchTimeout)
    }
    searchTimeout = setTimeout(() => {
      if (current === null) {
        if (Object.values(search).filter(v => v).length) current = 'search'
      } else {
        if (Object.values(search).filter(v => v).length) {
          loadCurrent(false)
        } else {
          current = null
        }
      }
      searchTimeout = null
    }, 500)
  }
  function handleFile ({ target }) {
    const { files } = target
    if (files?.[0]) {
      traceAnime(files[0], 'file')
      target.value = null
    }
  }
</script>

<div class='container-fluid row p-20' on:input={input}>
  <div class='col-lg col-4 p-10 d-flex flex-column justify-content-end'>
    <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
      <div class='material-icons mr-10 font-size-30'>title</div>
      Title
    </div>
    <div class='input-group shadow-lg'>
      <div class='input-group-prepend'>
        <span class='input-group-text d-flex material-icons bg-dark pr-0 font-size-18'>search</span>
      </div>
      <!-- svelte-ignore a11y-autofocus -->
      <input
        on:input={({ target }) => {
          queueMicrotask(() => {
            search.search = target.value
            input()
          })
        }}
        bind:this={searchTextInput}
        autofocus
        type='search'
        class='form-control bg-dark border-left-0 shadow-none text-capitalize'
        autocomplete='off'
        bind:value={search.search}
        data-option='search'
        placeholder='Any' />
    </div>
  </div>
  <div class='col-lg col-4 p-10 d-flex flex-column justify-content-end'>
    <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
      <div class='material-icons mr-10 font-size-30'>theater_comedy</div>
      Genre
    </div>
    <select class='form-control bg-dark shadow-lg' required bind:value={search.genre}>
      <option value selected disabled hidden>Any</option>
      <option value='Action'>Action</option>
      <option value='Adventure'>Adventure</option>
      <option value='Comedy'>Comedy</option>
      <option value='Drama'>Drama</option>
      <option value='Ecchi'>Ecchi</option>
      <option value='Fantasy'>Fantasy</option>
      <option value='Horror'>Horror</option>
      <option value='Mahou Shoujo'>Mahou Shoujo</option>
      <option value='Mecha'>Mecha</option>
      <option value='Music'>Music</option>
      <option value='Mystery'>Mystery</option>
      <option value='Psychological'>Psychological</option>
      <option value='Romance'>Romance</option>
      <option value='Sci-Fi'>Sci-Fi</option>
      <option value='Slice of Life'>Slice of Life</option>
      <option value='Sports'>Sports</option>
      <option value='Supernatural'>Supernatural</option>
      <option value='Thriller'>Thriller</option>
    </select>
  </div>
  <div class='col-lg col-4 p-10 d-flex flex-column justify-content-end'>
    <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
      <div class='material-icons mr-10 font-size-30'>spa</div>
      Season
    </div>
    <div class='input-group shadow-lg'>
      <select class='form-control bg-dark shadow-none border-right-dark' required bind:value={search.season}>
        <option value selected disabled hidden>Any</option>
        <option value='WINTER'>Winter</option>
        <option value='SPRING'>Spring</option>
        <option value='SUMMER'>Summer</option>
        <option value='FALL'>Fall</option>
      </select>
      <input type='number' placeholder='Any' min='1940' max='2100' list='search-year' class='form-control bg-dark shadow-none' bind:value={search.year} />
      <datalist id='search-year'>
        {#each Array(new Date().getFullYear() - 1940 + 2) as _, i}
          {@const year = new Date().getFullYear() + 2 - i}
          <option>{year}</option>
        {/each}
      </datalist>
    </div>
  </div>
  <div class='col p-10 d-flex flex-column justify-content-end'>
    <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
      <div class='material-icons mr-10 font-size-30'>monitor</div>
      Format
    </div>
    <select class='form-control bg-dark shadow-lg' required bind:value={search.format}>
      <option value selected disabled hidden>Any</option>
      <option value='TV'>TV Show</option>
      <option value='MOVIE'>Movie</option>
      <option value='TV_SHORT'>TV Short</option>
      <option value='OVA'>OVA</option>
      <option value='ONA'>ONA</option>
    </select>
  </div>
  <div class='col p-10 d-flex flex-column justify-content-end'>
    <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
      <div class='material-icons mr-10 font-size-30'>live_tv</div>
      Status
    </div>
    <select class='form-control bg-dark shadow-lg' required bind:value={search.status}>
      <option value selected disabled hidden>Any</option>
      <option value='RELEASING'>Airing</option>
      <option value='FINISHED'>Finished</option>
      <option value='NOT_YET_RELEASED'>Not Yet Aired</option>
      <option value='CANCELLED'>Cancelled</option>
    </select>
  </div>
  <div class='col p-10 d-flex flex-column justify-content-end'>
    <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
      <div class='material-icons mr-10 font-size-30'>sort</div>
      Sort
    </div>
    <select class='form-control bg-dark shadow-lg' required bind:value={search.sort}>
      <option value selected disabled hidden>Name</option>
      <option value='START_DATE_DESC'>Release Date</option>
      <option value='SCORE_DESC'>Score</option>
      <option value='POPULARITY_DESC'>Popularity</option>
      <option value='TRENDING_DESC'>Trending</option>
      <option value='UPDATED_TIME_DESC' disabled hidden>Updated Date</option>
    </select>
  </div>
  <input type='file' class='d-none' id='search-image' accept='image/*' on:input={handleFile} />
  <div class='col-auto p-10 d-flex'>
    <button class='btn bg-dark material-icons font-size-18 px-5 align-self-end shadow-lg border-0' type='button'>
      <label for='search-image' class='pointer'>
        image
      </label>
    </button>
  </div>
  <div class='col-auto p-10 d-flex'>
    <button class='btn bg-dark material-icons font-size-18 px-5 align-self-end shadow-lg border-0' type='button' on:click={searchClear} class:text-primary={!!current}>
      delete
    </button>
  </div>
</div>

<style>
  .container-fluid > div > :nth-child(2),
  .container-fluid button {
    transition: transform 0.2s ease;
  }

  .container-fluid > div > :nth-child(2):hover {
    transform: scale(1.05);
  }

  .container-fluid button:hover {
    transform: scale(1.15);
  }
  .bg-dark::-webkit-inner-spin-button {
    filter: invert(0.942);
  }
  :global(input:invalid) {
    box-shadow: 0 0 0 0.2rem var(--danger-color) !important;
  }
  select.form-control:invalid {
    color: var(--dm-input-placeholder-text-color);
  }
  .font-size-30 {
    font-size: 3rem !important;
  }
</style>
