<script>
  import { alRequest } from '@/modules/anilist.js'
  export let search = {}
  export let media = null
  let searchTimeout = null

  function processMedia(res) {
    return res.data.Page.media.map(media => {
      return { media }
    })
  }
  function searchClear() {
    search = {
      format: '',
      genre: '',
      season: '',
      sort: '',
      status: ''
    }
    media = null
  }
  $: input(search)
  function input() {
    if (!searchTimeout) {
      if (Object.values(search).filter(v => v).length) media = new Promise(() => {})
    } else {
      clearTimeout(searchTimeout)
    }
    searchTimeout = setTimeout(() => {
      handleSearch()
      searchTimeout = null
    }, 500)
  }
  export async function handleSearch(page) {
    const defaults = {
      method: 'Search',
      page: page || 1
    }
    const opts = {}
    Object.assign(opts, defaults)
    for (const [key, value] of Object.entries(search)) {
      if (value) opts[key] = value
    }
    if (Object.keys(defaults).length !== Object.keys(opts).length) {
      media = alRequest(opts).then(res => {
        return processMedia(res)
      })
    } else {
      media = null
    }
  }
</script>

<div class="container-fluid row p-20">
  <div class="col-lg col-4 p-10 d-flex flex-column justify-content-end">
    <div class="pb-10 font-size-24 font-weight-semi-bold d-flex">
      <div class="material-icons mr-10 font-size-30">title</div>
      Title
    </div>
    <div class="input-group shadow-lg">
      <div class="input-group-prepend">
        <span class="input-group-text d-flex material-icons bg-dark pr-0 font-size-18">search</span>
      </div>
      <input
        type="search"
        class="form-control bg-dark border-left-0 shadow-none text-capitalize"
        autocomplete="off"
        bind:value={search.search}
        data-option="search"
        placeholder="Any" />
    </div>
  </div>
  <div class="col-lg col-4 p-10 d-flex flex-column justify-content-end">
    <div class="pb-10 font-size-24 font-weight-semi-bold d-flex">
      <div class="material-icons mr-10 font-size-30">theater_comedy</div>
      Genre
    </div>
    <select class="form-control bg-dark shadow-lg" required bind:value={search.genre}>
      <option value selected disabled hidden>Any</option>
      <option value="action">Action</option>
      <option value="adventure">Adventure</option>
      <option value="comedy">Comedy</option>
      <option value="drama">Drama</option>
      <option value="ecchi">Ecchi</option>
      <option value="fantasy">Fantasy</option>
      <option value="horror">Horror</option>
      <option value="mahou shoujo">Mahou Shoujo</option>
      <option value="mecha">Mecha</option>
      <option value="music">Music</option>
      <option value="mystery">Mystery</option>
      <option value="psychological">Psychological</option>
      <option value="romance">Romance</option>
      <option value="sci-fi">Sci-Fi</option>
      <option value="slice of life">Slice of Life</option>
      <option value="sports">Sports</option>
      <option value="supernatural">Supernatural</option>
      <option value="thriller">Thriller</option>
    </select>
  </div>
  <div class="col-lg col-4 p-10 d-flex flex-column justify-content-end">
    <div class="pb-10 font-size-24 font-weight-semi-bold d-flex">
      <div class="material-icons mr-10 font-size-30">spa</div>
      Season
    </div>
    <div class="input-group shadow-lg">
      <select class="form-control bg-dark shadow-none border-right-dark" required bind:value={search.season}>
        <option value selected disabled hidden>Any</option>
        <option value="WINTER">Winter</option>
        <option value="SPRING">Spring</option>
        <option value="SUMMER">Summer</option>
        <option value="FALL">Fall</option>
      </select>
      <input type="number" placeholder="Any" min="1940" max="2100" class="form-control bg-dark shadow-none" bind:value={search.year} />
    </div>
  </div>
  <div class="col p-10 d-flex flex-column justify-content-end">
    <div class="pb-10 font-size-24 font-weight-semi-bold d-flex">
      <div class="material-icons mr-10 font-size-30">monitor</div>
      Format
    </div>
    <select class="form-control bg-dark shadow-lg" required bind:value={search.format}>
      <option value selected disabled hidden>Any</option>
      <option value="TV">TV Show</option>
      <option value="MOVIE">Movie</option>
      <option value="TV_SHORT">TV Short</option>
      <option value="OVA">OVA</option>
      <option value="ONA">ONA</option>
    </select>
  </div>
  <div class="col p-10 d-flex flex-column justify-content-end">
    <div class="pb-10 font-size-24 font-weight-semi-bold d-flex">
      <div class="material-icons mr-10 font-size-30">live_tv</div>
      Status
    </div>
    <select class="form-control bg-dark shadow-lg" required bind:value={search.status}>
      <option value selected disabled hidden>Any</option>
      <option value="RELEASING">Airing</option>
      <option value="FINISHED">Finished</option>
      <option value="NOT_YET_RELEASED">Not Yet Aired</option>
      <option value="CANCELLED">Cancelled</option>
    </select>
  </div>
  <div class="col p-10 d-flex flex-column justify-content-end">
    <div class="pb-10 font-size-24 font-weight-semi-bold d-flex">
      <div class="material-icons mr-10 font-size-30">sort</div>
      Sort
    </div>
    <select class="form-control bg-dark shadow-lg" required bind:value={search.sort}>
      <option value selected disabled hidden>Name</option>
      <option value="START_DATE_DESC">Release Date</option>
      <option value="SCORE_DESC">Score</option>
      <option value="POPULARITY_DESC">Popularity</option>
      <option value="TRENDING_DESC">Trending</option>
    </select>
  </div>
  <div class="col-auto p-10 d-flex">
    <button class="btn bg-dark material-icons font-size-18 px-5 align-self-end shadow-lg border-0" type="button" on:click={searchClear} class:text-primary={!!media}>delete</button>
  </div>
</div>

<style>
  .container-fluid > div > :nth-child(2),
  .container-fluid button {
    transition: transform 0.2s ease;
    will-change: transform;
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
  input:invalid {
    box-shadow: 0 0 0 0.2rem var(--danger-color) !important;
  }
  select.form-control:invalid {
    color: var(--dm-input-placeholder-text-color);
  }
</style>
