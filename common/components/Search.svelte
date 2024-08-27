<script context='module'>
  const badgeKeys = ['search', 'genre', 'season', 'year', 'format', 'status', 'sort']

  export function searchCleanup (search) {
    return Object.fromEntries(Object.entries(search).map((entry) => {
      return badgeKeys.includes(entry[0]) && entry
    }).filter(a => a?.[1]))
  }
</script>

<script>
  import { traceAnime } from '@/modules/anime.js'
  import { settings } from '@/modules/settings.js'
  import { click } from '@/modules/click.js'
  import { page } from '@/App.svelte'
  import { toast } from 'svelte-sonner'
  import { MagnifyingGlass, Image } from 'svelte-radix'
  import { Type, Drama, Leaf, MonitorPlay, Tv, ArrowDownWideNarrow, Trash2, Tags, Grid3X3, Grid2X2 } from 'lucide-svelte'

  export let search
  let searchTextInput
  let form

  $: sanitisedSearch = Object.values(searchCleanup(search))

  function searchClear () {
    search = {
      search: '',
      genre: '',
      season: '',
      year: null,
      format: '',
      status: '',
      sort: ''
    }
    searchTextInput.focus()
    form.dispatchEvent(new Event('input', { bubbles: true }))
    $page = 'search'
  }

  function handleFile ({ target }) {
    const { files } = target
    if (files?.[0]) {
      toast.promise(traceAnime(files[0]), {
        description: 'You can also paste an URL to an image.',
        loading: 'Looking up anime for image...',
        success: 'Found anime for image!',
        error: 'Couldn\'t find anime for specified image! Try to remove black bars, or use a more detailed image.'
      })
      target.value = null
    }
  }
  function changeCardMode (type) {
    $settings.cards = type
    form.dispatchEvent(new Event('input', { bubbles: true }))
  }
</script>

<form class='container-fluid py-20 px-md-50 bg-dark pb-0 position-sticky top-0 search-container z-40' on:input bind:this={form}>
  <div class='row'>
    <div class='col-lg col-4 p-10 d-flex flex-column justify-content-end'>
      <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
        <Type class='mr-10' size='3rem' />
        Title
      </div>
      <div class='input-group'>
        <div class='input-group-prepend'>
          <MagnifyingGlass size='2.75rem' class='input-group-text bg-dark-light pr-0' />
        </div>
        <input
          bind:this={searchTextInput}
          type='search'
          class='form-control bg-dark-light border-left-0 text-capitalize'
          autocomplete='off'
          bind:value={search.search}
          data-option='search'
          disabled={search.disableSearch}
          placeholder='Any' />
      </div>
    </div>
    <div class='col-lg col-4 p-10 d-flex flex-column justify-content-end'>
      <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
        <Drama class='mr-10' size='3rem' />
        Genre
      </div>
      <div class='input-group'>
        <select class='form-control bg-dark-light' required bind:value={search.genre} disabled={search.disableSearch}>
          <option value selected>Any</option>
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
    </div>
    <div class='col-lg col-4 p-10 d-flex flex-column justify-content-end'>
      <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
        <Leaf class='mr-10' size='3rem' />
        Season
      </div>
      <div class='input-group'>
        <select class='form-control bg-dark-light border-right-dark' required bind:value={search.season} disabled={search.disableSearch}>
          <option value selected>Any</option>
          <option value='WINTER'>Winter</option>
          <option value='SPRING'>Spring</option>
          <option value='SUMMER'>Summer</option>
          <option value='FALL'>Fall</option>
        </select>
        <datalist id='search-year'>
          {#each Array(new Date().getFullYear() - 1940 + 2) as _, i}
            {@const year = new Date().getFullYear() + 2 - i}
            <option>{year}</option>
          {/each}
        </datalist>
        <input type='number' inputmode='numeric' pattern='[0-9]*' placeholder='Any' min='1940' max='2100' list='search-year' class='bg-dark-light form-control' disabled={search.disableSearch} bind:value={search.year} />
      </div>
    </div>
    <div class='col p-10 d-flex flex-column justify-content-end'>
      <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
        <Tv class='mr-10' size='3rem' />
        Format
      </div>
      <div class='input-group'>
        <select class='form-control bg-dark-light' required bind:value={search.format} disabled={search.disableSearch}>
          <option value selected>Any</option>
          <option value='TV'>TV Show</option>
          <option value='MOVIE'>Movie</option>
          <option value='TV_SHORT'>TV Short</option>
          <option value='OVA'>OVA</option>
          <option value='ONA'>ONA</option>
        </select>
      </div>
    </div>
    <div class='col p-10 d-flex flex-column justify-content-end'>
      <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
        <MonitorPlay class='mr-10' size='3rem' />
        Status
      </div>
      <div class='input-group'>
        <select class='form-control bg-dark-light' required bind:value={search.status} disabled={search.disableSearch}>
          <option value selected>Any</option>
          <option value='RELEASING'>Airing</option>
          <option value='FINISHED'>Finished</option>
          <option value='NOT_YET_RELEASED'>Not Yet Aired</option>
          <option value='CANCELLED'>Cancelled</option>
        </select>
      </div>
    </div>
    <div class='col p-10 d-flex flex-column justify-content-end'>
      <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
        <ArrowDownWideNarrow class='mr-10' size='3rem' />
        Sort
      </div>
      <div class='input-group'>
        <select class='form-control bg-dark-light' required bind:value={search.sort} disabled={search.disableSearch}>
          <option value selected>Name</option>
          <option value='START_DATE_DESC'>Release Date</option>
          <option value='SCORE_DESC'>Score</option>
          <option value='POPULARITY_DESC'>Popularity</option>
          <option value='TRENDING_DESC'>Trending</option>
          <option value='UPDATED_AT_DESC'>Updated Date</option>
        </select>
      </div>
    </div>
    <input type='file' class='d-none' id='search-image' accept='image/*' on:input|preventDefault|stopPropagation={handleFile} />
    <div class='col-auto p-10 d-flex'>
      <div class='align-self-end'>
        <button class='btn btn-square bg-dark-light px-5 align-self-end border-0' type='button'>
          <label for='search-image' class='pointer mb-0 d-flex align-items-center justify-content-center'>
            <Image size='1.625rem' />
          </label>
        </button>
      </div>
    </div>
    <div class='col-auto p-10 d-flex'>
      <div class='align-self-end'>
        <button class='btn btn-square bg-dark-light d-flex align-items-center justify-content-center px-5 align-self-end border-0' type='button' use:click={searchClear} class:text-primary={!!sanitisedSearch?.length || search.disableSearch || search.clearNext}>
          <Trash2 size='1.625rem' />
        </button>
      </div>
    </div>
  </div>
  <div class='w-full px-10 pt-10 h-50 d-flex flex-colum align-items-center'>
    {#if sanitisedSearch?.length}
      <Tags class='text-dark-light mr-20' size='3rem' />
      {#each sanitisedSearch as badge}
        <span class='badge bg-light border-0 py-5 px-10 text-capitalize mr-20 text-white text-nowrap'>{('' + badge).replace(/_/g, ' ').toLowerCase()}</span>
      {/each}
    {/if}
    <span class='mr-10 filled ml-auto text-dark-light pointer' class:text-muted={$settings.cards === 'small'} use:click={() => changeCardMode('small')}><Grid3X3 size='2.25rem' /></span>
    <span class='text-dark-light pointer' class:text-muted={$settings.cards === 'full'} use:click={() => changeCardMode('full')}><Grid2X2 size='2.25rem' /></span>
  </div>
</form>

<style>
  .input-group,
  .container-fluid button, .pointer {
    transition: scale 0.2s ease;
  }

  .input-group:hover, .pointer:hover {
    scale: 1.08;
  }

  .container-fluid button:hover {
    scale: 1.20;
  }
  input:not(:focus):invalid {
    box-shadow: 0 0 0 0.2rem var(--danger-color) !important;
  }
  select.form-control:invalid {
    color: var(--dm-input-placeholder-text-color);
  }
  .font-size-30 {
    font-size: 3rem !important;
  }
</style>
