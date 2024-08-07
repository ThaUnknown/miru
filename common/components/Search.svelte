<script context='module'>
  const badgeKeys = ['title', 'search', 'genre', 'tag', 'season', 'year', 'format', 'status', 'sort', 'hideSubs', 'hideMyAnime', 'hideStatus']
  const badgeDisplayNames = { title: 'recent_actors', search: 'title', genre: 'theater_comedy', tag: 'tag', season: 'calendar_month', year: 'spa', format: 'monitor', status: 'live_tv', sort: 'sort', hideMyAnime: 'tune', hideSubs: 'mic' }
  const sortOptions = { START_DATE_DESC: 'Release Date', SCORE_DESC: 'Score', POPULARITY_DESC: 'Popularity', TRENDING_DESC: 'Trending', UPDATED_TIME_DESC: 'Last Updated', STARTED_ON_DESC: 'Started On', FINISHED_ON_DESC: 'Finished On', PROGRESS_DESC: 'Your Progress', USER_SCORE_DESC: 'Your Score' }

  export function searchCleanup (search, badge) {
    return Object.fromEntries(Object.entries(search).map((entry) => {
      return (!badge || badgeKeys.includes(entry[0])) && entry
    }).filter(a => a?.[1]))
  }
</script>

<script>
  import { traceAnime } from '@/modules/anime.js'
  import { settings } from '@/modules/settings.js'
  import { click } from '@/modules/click.js'
  import { page } from '@/App.svelte'
  import { toast } from 'svelte-sonner'
  import Helper from '@/modules/helper.js'

  export let search
  let searchTextInput = {
    title: null,
    genre: null,
    tag: null
  }
  let form

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

  const tagList = [
    'Chuunibyou',
    'Demons',
    'Food',
    'Heterosexual',
    'Isekai',
    'Iyashikei',
    'Josei',
    'Magic',
    'Yuri',
    'Love Triangle',
    'Female Harem',
    'Male Harem',
    'Mixed Gender Harem',
    'Arranged Marriage',
    'Marriage',
    'Martial Arts',
    'Military',
    'Nudity',
    'Parody',
    'Reincarnation',
    'Satire',
    'School',
    'Seinen',
    'Shoujo',
    'Shounen',
    'Slavery',
    'Space',
    'Super Power',
    'Superhero',
    'Teens\' Love',
    'Unrequited Love',
    'Vampire',
    'Kids',
    'Gender Bending',
    'Body Swapping',
    'Boys\' Love',
    'Cute Boys Doing Cute Things',
    'Cute Girls Doing Cute Things',
    'Acting',
    'Afterlife',
    'Age Gap',
    'Age Regression',
    'Aliens',
    'Alternate Universe',
    'Amnesia',
    'Angels',
    'Anti-Hero',
    'Archery',
    'Artificial Intelligence',
    'Assassins',
    'Asexual',
    'Augmented Reality',
    'Band',
    'Bar',
    'Battle Royale',
    'Board Game',
    'Boarding School',
    'Bullying',
    'Calligraphy',
    'CGI',
    'Classic Literature',
    'College',
    'Cosplay',
    'Crime',
    'Crossdressing',
    'Cult',
    'Dancing',
    'Death Game',
    'Desert',
    'Disability',
    'Drawing',
    'Dragons',
    'Dungeon',
    'Elf',
    'Espionage',
    'Fairy',
    'Femboy',
    'Female Protagonist',
    'Fashion',
    'Foreign',
    'Full CGI',
    'Fugitive',
    'Gambling',
    'Ghost',
    'Gods',
    'Goblin',
    'Guns',
    'Gyaru',
    'Hikikomori',
    'Historical',
    'Homeless',
    'Idol',
    'Inn',
    'Kaiju',
    'Konbini',
    'Kuudere',
    'Language Barrier',
    'Makeup',
    'Maids',
    'Male Protagonist',
    'Matriarchy',
    'Matchmaking',
    'Mermaid',
    'Monster Boy',
    'Monster Girl',
    'Natural Disaster',
    'Necromancy',
    'Ninja',
    'Nun',
    'Office',
    'Office Lady',
    'Omegaverse',
    'Orphan',
    'Outdoor',
    'Photography',
    'Pirates',
    'Polyamorous',
    'Post-Apocalyptic',
    'Primarily Adult Cast',
    'Primarily Female Cast',
    'Primarily Male Cast',
    'Primarily Teen Cast',
    'Prison',
    'Rakugo',
    'Restaurant',
    'Robots',
    'Rural',
    'Samurai',
    'School Club',
    'Shapeshifting',
    'Shrine Maiden',
    'Skeleton',
    'Slapstick',
    'Snowscape',
    'Space',
    'Spearplay',
    'Succubus',
    'Surreal Comedy',
    'Survival',
    'Swordplay',
    'Teacher',
    'Time Loop',
    'Time Manipulation',
    'Time Skip',
    'Transgender',
    'Tsundere',
    'Twins',
    'Urban',
    'Urban Fantasy',
    'Video Games',
    'Villainess',
    'Virtual World',
    'VTuber',
    'War',
    'Werewolf',
    'Witch',
    'Work',
    'Writing',
    'Wuxia',
    'Yakuza',
    'Yandere',
    'Youkai',
    'Zombie'
  ]
  let filteredTags = []

  $: {
    const searchInput = (searchTextInput.tag ? searchTextInput.tag.toLowerCase() : null)
    filteredTags = tagList.filter(tag =>
            (!search.tag || !search.tag.includes(tag)) && (!searchInput ||
            tag.toLowerCase().includes(searchInput))
    ).slice(0, 20)
  }

  $: sanitisedSearch = Object.entries(searchCleanup(search, true)).flatMap(
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
      hideSubs: false,
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
      if (Helper.isUserSort(search)) {
        search.sort = ''
      }
    } else if ((badge.key === 'genre' || badge.key === 'tag') && !search.userList) {
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
    search.hideStatus = search.hideMyAnime ? ['CURRENT', 'COMPLETED', 'DROPPED', 'PAUSED', 'REPEATING'] : ''
    form.dispatchEvent(new Event('input', { bubbles: true }))
  }

  function toggleSubs() {
    search.hideSubs = !search.hideSubs
    form.dispatchEvent(new Event('input', { bubbles: true }))
  }

  function filterTags(event, type) {
    const list = type === 'tag' ? tagList : genreList
    const searchKey = type === 'tag' ? 'tag' : 'genre'
    const inputValue = event.target.value
    let bestMatch = list.find(item => item.toLowerCase() === inputValue.toLowerCase())
    if (!bestMatch) {
      bestMatch = list.find(item => item.toLowerCase().startsWith(inputValue.toLowerCase()))
    }
    if (bestMatch && (!search[searchKey] || !search[searchKey].includes(bestMatch))) {
      search[searchKey] = search[searchKey] ? [...search[searchKey], bestMatch] : [bestMatch]
      searchTextInput[searchKey] = null
      form.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  function clearTags() { // cannot specify genre and tag filtering with user specific sorting options when using alternative authentication.
    if (!Helper.isAniAuth() && Helper.isUserSort(search)) {
      search.genre = ''
      search.tag = ''
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

<form class='container-fluid py-20 px-md-50 px-20 bg-dark pb-0 position-sticky top-0 search-container z-40' on:input bind:this={form}>
  <div class='row'>
    <div class='col-lg col-4 p-10 d-flex flex-column justify-content-end'>
      <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
        <div class='material-symbols-outlined mr-10 font-size-30'>title</div>
        <div>Title</div>
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
        <div>Genres</div>
      </div>
      <div class='input-group'>
        <input
          id='genre'
          type='search'
          title={(!Helper.isAniAuth() && Helper.isUserSort(search)) ? 'Cannot use with sort: ' + sortOptions[search.sort] : ''}
          class='form-control bg-dark-light border-left-0 text-capitalize'
          autocomplete='off'
          bind:value={searchTextInput.genre}
          on:change={(event) => filterTags(event, 'genre')}
          data-option='search'
          disabled={search.disableSearch || (!Helper.isAniAuth() && Helper.isUserSort(search))}
          placeholder='Any'
          list='search-genre'/>
      </div>
      <datalist id='search-genre'>
        {#each genreList as genre}
          {#if !search.genre || !search.genre.includes(genre) }
            <option>{genre}</option>
          {/if}
        {/each}
      </datalist>
    </div>
    <div class='col-lg col-4 p-10 d-flex flex-column justify-content-end'>
      <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
        <div class='material-symbols-outlined mr-10 font-size-30'>tag</div>
        <div>Tags</div>
      </div>
      <div class='input-group'>
        <input
          id='tag'
          type='search'
          title={(!Helper.isAniAuth() && Helper.isUserSort(search)) ? 'Cannot use with sort: ' + sortOptions[search.sort] : ''}
          class='form-control bg-dark-light border-left-0 text-capitalize'
          autocomplete='off'
          bind:value={searchTextInput.tag}
          on:change={(event) => filterTags(event, 'tag')}
          data-option='search'
          disabled={search.disableSearch || (!Helper.isAniAuth() && Helper.isUserSort(search))}
          placeholder='Any'
          list='search-tag'/>
      </div>
      <datalist id='search-tag'>
        {#each filteredTags as tag}
          <option>{tag}</option>
        {/each}
      </datalist>
    </div>
    <div class='col-lg col-4 p-10 d-flex flex-column justify-content-end'>
      <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
        <div class='material-symbols-outlined mr-10 font-size-30'>calendar_month</div>
        <div>Season</div>
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
        <div>Format</div>
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
        <div>Status</div>
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
        <div>Sort</div>
      </div>
      <div class='input-group'>
        <select class='form-control bg-dark-light' required bind:value={search.sort} on:change={clearTags} disabled={search.disableSearch}>
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
    {#if Helper.isAuthorized()}
    <div class='col-auto p-10 d-flex'>
      <div class='align-self-end'>
        <button
          class='btn btn-square bg-dark-light material-symbols-outlined font-size-18 px-5 align-self-end border-0'
          type='button'
          title='Hide My Anime'
          use:click={toggleHideMyAnime}
          disabled={search.disableHide || search.disableSearch}
          class:text-primary={search.hideMyAnime}>
          <label for='hide-my-anime' class='pointer mb-0'> tune </label>
        </button>
      </div>
    </div>
    {/if}
    <div class='col-auto p-10 d-flex'>
      <div class='align-self-end'>
        <button
          class='btn btn-square bg-dark-light material-symbols-outlined font-size-18 px-5 align-self-end border-0'
          type='button'
          title='Dubbed Audio'
          use:click={toggleSubs}
          disabled={search.disableSearch}
          class:text-primary={search.hideSubs}>
          <label for='hide-subs' class='pointer mb-0'> mic </label>
        </button>
      </div>
    </div>
    <input type='file' class='d-none' id='search-image' accept='image/*' on:input|preventDefault|stopPropagation={handleFile} />
    <div class='col-auto p-10 d-flex'>
      <div class='align-self-end'>
        <button class='btn btn-square bg-dark-light material-symbols-outlined font-size-18 px-5 align-self-end border-0' type='button' title='Image Search'>
          <label for='search-image' class='pointer mb-0'>
            image
          </label>
        </button>
      </div>
    </div>
    <div class='col-auto p-10 d-flex'>
      <div class='align-self-end'>
        <button class='btn btn-square bg-dark-light material-symbols-outlined font-size-18 px-5 align-self-end border-0' type='button' title='Clear Search' use:click={searchClear} disabled={sanitisedSearch.length <= 0} class:text-danger={!!sanitisedSearch?.length || search.disableSearch || search.clearNext}>
          {!!sanitisedSearch?.length || search.disableSearch || search.clearNext ? 'filter_alt_off' : 'filter_alt'}
        </button>
      </div>
    </div>
  </div>
  <div class='w-full px-10 pt-10 h-50 d-flex flex-colum align-items-center'>
    <form>
      <div role="button" tabindex="0">
        {#if sanitisedSearch?.length}
          {@const filteredBadges = sanitisedSearch.filter(badge => badge.key !== 'hideStatus' && (search.userList || badge.key !== 'title'))}
          <div class='d-flex flex-row align-items-center'>
            {#if filteredBadges.length > 0}
              <span class='material-symbols-outlined font-size-24 mr-20 filled text-dark-light'>sell</span>
            {/if}
          {#each badgeKeys as key}
            {@const matchingBadges = filteredBadges.filter(badge => badge.key === key)}
            {#each matchingBadges as badge}
              {#if badge.key === key && (badge.key !== 'hideStatus' && (search.userList || badge.key !== 'title')) }
                <div class='badge bg-light border-0 py-5 px-10 text-capitalize mr-20 text-white text-nowrap d-flex align-items-center'>
                  <div class='material-symbols-outlined font-size-18 mr-5'>{getBadgeDisplayName(badge.key)}</div>
                  <div class='font-size-12'>{badge.key === 'sort' ? getSortDisplayName(badge.value) : (badge.key === 'hideMyAnime' ? 'Hide My Anime' : badge.key === 'hideSubs' ? 'Dubbed' : ('' + badge.value).replace(/_/g, ' ').toLowerCase())}</div>
                  <button on:click={() => removeBadge(badge)} class='pointer bg-transparent border-0 text-white font-size-12 position-relative ml-10 pt-0' title='Remove Filter' type='button'>x</button>
                </div>
              {/if}
            {/each}
          {/each}
          </div>
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
