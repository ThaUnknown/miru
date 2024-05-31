<script context='module'>
  const badgeKeys = ['title', 'search', 'genre', 'tag', 'season', 'year', 'format', 'status', 'sort', 'hideMyAnime', 'hideStatus']
  const badgeDisplayNames = { title: 'List:', search: 'Title:', genre: 'Genre:', tag: 'Tag:', season: 'Season:', year: 'Year:', format: 'Format:', status: 'Status:', sort: 'Sort:', hideMyAnime: 'Hide My Anime'}
  const sortOptions = { START_DATE_DESC: 'Release Date', SCORE_DESC: 'Score', POPULARITY_DESC: 'Popularity', TRENDING_DESC: 'Trending', UPDATED_TIME_DESC: 'Last Updated', STARTED_ON_DESC: 'Started On', FINISHED_ON_DESC: 'Finished On', PROGRESS_DESC: 'Your Progress', USER_SCORE_DESC: 'Your Score' }

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

  export let search
  let searchTextInput = {
    title: null,
    genre: null,
    tag: null
  }
  let form

  const tagList = [
    'Boys\' Love',
    'Demons',
    'Yuri',
    'Food',
    'Isekai',
    'Iyashikei',
    'Josei',
    'Magic',
    'Martial Arts',
    'Military',
    'Parody',
    'Female Harem',
    'Male Harem',
    'Mixed Gender Harem',
    'Parody',
    'School',
    'Seinen',
    'Shoujo',
    'Shounen',
    'Space',
    'Super Power',
    'Vampire',
    'Kids'
  ]

  const genreList = [
    'Action',
    'Adventure',
    'Comedy',
    'Drama',
    'Ecchi',
    'Fantasy',
    'Horror',
    'Mahou Shoujo',
    'Mecha',
    'Music',
    'Mystery',
    'Psychological',
    'Romance',
    'Sci-Fi',
    'Slice of Life',
    'Sports',
    'Supernatural',
    'Thriller'
  ]

  $: sanitisedSearch = Object.entries(searchCleanup(search)).flatMap(
    ([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((item) => ({ key, value: item }))
      } else {
        return [{ key, value }]
      }
    }
  )

  function searchClear() {
    search = {
      title: '',
      search: '',
      genre: '',
      tag: '',
      season: '',
      year: null,
      format: '',
      status: '',
      sort: '',
      hideMyAnime: false,
      hideStatus: ''
    }
    searchTextInput.title.focus()
    form.dispatchEvent(new Event('input', { bubbles: true }))
    $page = 'search'
  }

  function getSortDisplayName(value) {
    return sortOptions[value] || value
  }

  function getBadgeDisplayName(key) {
    return badgeDisplayNames[key] || ''
  }

  function removeBadge(badge) {
    if (badge.key === 'title') {
      delete search.load
      delete search.disableHide
      delete search.userList
      delete search.continueWatching
      delete search.completedList
      search.sort = ''
    } else if (badge.key === 'genre' || badge.key === 'tag') {
      delete search.title
    } else if (badge.key === 'hideMyAnime') {
      delete search.hideStatus
    } 
    if (Array.isArray(search[badge.key])) {
      search[badge.key] = search[badge.key].filter(
        (item) => item !== badge.value
      )
      if (search[badge.key].length === 0) {
        search[badge.key] = ''
      }
    } else {
      search[badge.key] = ''
    }
    form.dispatchEvent(new Event('input', { bubbles: true }))
  }

  function toggleHideMyAnime() {
    search.hideMyAnime = !search.hideMyAnime
    search.hideStatus = search.hideMyAnime ? ['CURRENT', 'PLANNING', 'COMPLETED', 'DROPPED', 'PAUSED', 'REPEATING'] : ''
    form.dispatchEvent(new Event('input', { bubbles: true }))
  }

  function filterList(event, type) {
    const list = type === 'tag' ? tagList : genreList
    const searchKey = type === 'tag' ? 'tag' : 'genre'
    const selectedValue = event.target.value
    if (list.includes(selectedValue) && (!search[searchKey] || !search[searchKey].includes(selectedValue))) {
      search[searchKey] = search[searchKey] ? [...search[searchKey], selectedValue] : [selectedValue]
      searchTextInput[searchKey] = null
    }
  }

  function handleFile({ target }) {
    const { files } = target
    if (files?.[0]) {
      toast.promise(traceAnime(files[0]), {
        description: 'You can also paste an URL to an image.',
        loading: 'Looking up anime for image...',
        success: 'Found anime for image!',
        error:
          'Couldn\'t find anime for specified image! Try to remove black bars, or use a more detailed image.'
      })
      target.value = null
    }
  }

  function changeCardMode(type) {
    $settings.cards = type
    form.dispatchEvent(new Event('input', { bubbles: true }))
  }
</script>

<form class='container-fluid py-20 px-50 bg-dark pb-0 position-sticky top-0 search-container z-40' on:input bind:this={form}>
  <div class='row'>
    <div class='col-lg col-4 p-10 d-flex flex-column justify-content-end'>
      <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
        <div class='material-symbols-outlined mr-10 font-size-30'>title</div>
        Title
      </div>
      <div class='input-group'>
        <div class='input-group-prepend'>
          <span class='input-group-text d-flex material-symbols-outlined bg-dark-light pr-0 font-size-18'>search</span>
        </div>
        <input
          bind:this={searchTextInput.title}
          type='search'
          class='form-control bg-dark-light border-left-0 text-capitalize'
          autocomplete='off'
          bind:value={search.search}
          data-option='search'
          disabled={search.disableSearch}
          placeholder='Any'/>
      </div>
    </div>
    <div class='col-lg col-4 p-10 d-flex flex-column justify-content-end'>
      <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
        <div class='material-symbols-outlined mr-10 font-size-30'>theater_comedy</div>
        Genres
      </div>
      <div class='input-group'>
        <input
          type='search'
          class='form-control bg-dark-light border-left-0 text-capitalize'
          autocomplete='off'
          bind:value={searchTextInput.genre}
          on:change={(event) => filterList(event, 'genre')}
          data-option='search'
          disabled={search.disableSearch}
          placeholder='Any'
          list='search-genre'/>
      </div>
      <datalist id='search-genre'>
        {#each genreList as genre}
          <option>{genre}</option>
        {/each}
      </datalist>
    </div>
    <div class='col-lg col-4 p-10 d-flex flex-column justify-content-end'>
      <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
        <div class='material-symbols-outlined mr-10 font-size-30'>tag</div>
        Tags
      </div>
      <div class='input-group'>
        <input
          type='search'
          class='form-control bg-dark-light border-left-0 text-capitalize'
          autocomplete='off'
          bind:value={searchTextInput.tag}
          on:change={(event) => filterList(event, 'tag')}
          data-option='search'
          disabled={search.disableSearch}
          placeholder='Any'
          list='search-tag'/>
      </div>
      <datalist id='search-tag'>
        {#each tagList as tag}
          <option>{tag}</option>
        {/each}
      </datalist>
    </div>
    <div class='col-lg col-4 p-10 d-flex flex-column justify-content-end'>
      <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
        <div class='material-symbols-outlined mr-10 font-size-30'>spa</div>
        Season
      </div>
      <div class='input-group'>
        <select class='form-control bg-dark-light border-right-dark' required bind:value={search.season} disabled={search.disableSearch}>
          <option value selected disabled hidden>Any</option>
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
        <div class='material-symbols-outlined mr-10 font-size-30'>monitor</div>
        Format
      </div>
      <div class='input-group'>
        <select class='form-control bg-dark-light' required bind:value={search.format} disabled={search.disableSearch}>
          <option value selected disabled hidden>Any</option>
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
        <div class='material-symbols-outlined mr-10 font-size-30'>live_tv</div>
        Status
      </div>
      <div class='input-group'>
        <select class='form-control bg-dark-light' required bind:value={search.status} disabled={search.disableSearch}>
          <option value selected disabled hidden>Any</option>
          <option value='RELEASING'>Releasing</option>
          <option value='FINISHED'>Finished</option>
          <option value='NOT_YET_RELEASED'>Not Yet Released</option>
          <option value='CANCELLED'>Cancelled</option>
        </select>
      </div>
    </div>
    <div class='col p-10 d-flex flex-column justify-content-end'>
      <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
        <div class='material-symbols-outlined mr-10 font-size-30'>sort</div>
        Sort
      </div>
      <div class='input-group'>
        <select class='form-control bg-dark-light' required bind:value={search.sort} disabled={search.disableSearch}>
          <option value selected disabled hidden>Any</option>
          <option value='START_DATE_DESC'>Release Date</option>
          <option value='SCORE_DESC'>Score</option>
          <option value='POPULARITY_DESC'>Popularity</option>
          <option value='TRENDING_DESC'>Trending</option>
          {#if search.userList}
          <option value='UPDATED_TIME_DESC'>Last Updated</option>
          <option value='STARTED_ON_DESC'>Started On</option>
          {#if search.completedList}
            <option value='FINISHED_ON_DESC'>Finished On</option>
            <option value='USER_SCORE_DESC'>Your Score</option>
          {:else}
            <option value='PROGRESS_DESC'>Your Progress</option>
          {/if}
        {/if}
        </select>
      </div>
    </div>
    <div class='col-auto p-10 d-flex'>
      <div class='align-self-end'>
        <button
          class='btn btn-square bg-dark-light material-symbols-outlined font-size-18 px-5 align-self-end border-0'
          type='button'
          use:click={toggleHideMyAnime}
          disabled={search.disableHide}
          class:text-primary={search.hideMyAnime}>
          <label for='hide-my-anime' class='pointer mb-0'> tune </label>
        </button>
      </div>
    </div>
    <input type='file' class='d-none' id='search-image' accept='image/*' on:input|preventDefault|stopPropagation={handleFile} />
    <div class='col-auto p-10 d-flex'>
      <div class='align-self-end'>
        <button class='btn btn-square bg-dark-light material-symbols-outlined font-size-18 px-5 align-self-end border-0' type='button'>
          <label for='search-image' class='pointer mb-0'>
            image
          </label>
        </button>
      </div>
    </div>
    <div class='col-auto p-10 d-flex'>
      <div class='align-self-end'>
        <button class='btn btn-square bg-dark-light material-symbols-outlined font-size-18 px-5 align-self-end border-0' type='button' use:click={searchClear} disabled={sanitisedSearch.length <= 0} class:text-danger={!!sanitisedSearch?.length || search.disableSearch || search.clearNext}>
          {!!sanitisedSearch?.length || search.disableSearch || search.clearNext ? 'filter_alt_off' : 'filter_alt'}
        </button>
      </div>
    </div>
  </div>
  <div class='w-full px-10 pt-10 h-50 d-flex flex-colum align-items-center'>
    <form>
      <div role="button" tabindex="0">
        {#if sanitisedSearch?.length}
          <span
            class='material-symbols-outlined font-size-24 mr-20 filled text-dark-light'
            >sell</span>
          {#each badgeKeys as key}
            {#each sanitisedSearch as badge}
              {#if badge.key === key}
                {#if badge.key !== 'hideStatus' && (search.userList || badge.key !== 'title') }
                  <span class='badge bg-light border-0 py-5 px-10 text-capitalize mr-20 text-white text-nowrap'>
                    {badge.key === 'sort' ? 'Sort: ' : getBadgeDisplayName(badge.key)} {badge.key === 'sort' ? getSortDisplayName(badge.value) : (badge.key !== 'hideMyAnime' ? ('' + badge.value).replace(/_/g, ' ').toLowerCase() : '')}
                    <button on:click={() => removeBadge(badge)} class='pointer bg-transparent border-0 text-white font-size-12 position-relative ml-10'>x</button>
                  </span>
                {/if}
              {/if}
            {/each}
          {/each}
        {/if}
      </div>
    </form>
    <span class='material-symbols-outlined font-size-24 mr-10 filled ml-auto text-dark-light pointer' class:text-muted={$settings.cards === 'small'} use:click={() => changeCardMode('small')}>grid_on</span>
    <span class='material-symbols-outlined font-size-24 filled text-dark-light pointer' class:text-muted={$settings.cards === 'full'} use:click={() => changeCardMode('full')}>grid_view</span>
  </div>
</form>

<style>
  .text-dark-light {
    color: var(--gray-color-light);
  }
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
