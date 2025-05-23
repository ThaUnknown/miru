<script lang='ts'>
  import FileImage from 'lucide-svelte/icons/file-image'
  import Trash from 'lucide-svelte/icons/trash'
  import X from 'lucide-svelte/icons/x'
  import { onDestroy, tick } from 'svelte'
  import MagnifyingGlass from 'svelte-radix/MagnifyingGlass.svelte'
  import { toast } from 'svelte-sonner'

  import { genres, years, seasons, formats, status, sort, onlist } from './values'

  import type { Search } from '$lib/modules/anilist/queries'
  import type { VariablesOf } from 'gql.tada'

  import { replaceState } from '$app/navigation'
  import { page } from '$app/stores'
  import { badgeVariants } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { QueryCard } from '$lib/components/ui/cards'
  import { ComboBox } from '$lib/components/ui/combobox'
  import { Input, type FormInputEvent } from '$lib/components/ui/input'
  import { client } from '$lib/modules/anilist'
  import { click, dragScroll } from '$lib/modules/navigate'
  import { cn, debounce, sleep, traceAnime } from '$lib/utils'

  // util

  interface format {
    value: string
    label: string
  }

  function empty (obj: typeof search) {
    return !Object.values(obj).reduce((acc, val) => acc + (val?.length ?? 0), 0)
  }

  function list (obj: typeof search): string[] {
    return Object.values(obj).flatMap(val => {
      if (Array.isArray(val)) {
        if (typeof val[0] === 'number') return 'IDs'
        return val.map(v => (v as format).label)
      }
      return val
    }).filter(a => a) as string[]
  }

  function remove (label: string) {
    if (label === 'IDs') {
      search.ids = undefined
      return
    }
    Object.entries(search).forEach(([key, value]) => {
      const nk = key as keyof typeof search
      if (Array.isArray(value)) {
        search[nk] = value.filter(v => (v as format).label !== label) as format[] & string & Array<number | null> & boolean
      } else if (value === label) {
        search[nk] = '' as format[] & string & Array<number | null> & boolean
      }
    })
  }

  function filterEmpty (obj: typeof search): Partial<typeof search> {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => {
      if (typeof v === 'boolean') return true
      return v?.length
    }))
  }

  function variablesToSearch (variables?: VariablesOf<typeof Search>) {
    if (!variables) return
    return {
      ids: variables.ids,
      name: variables.search ?? '',
      onList: onlist.filter(s => s.value === (variables.onList?.toString() ?? 'null')) as format[],
      genres: genres.filter(g => (variables.genre ?? []).includes(g.value)) as format[],
      years: years.filter(y => y.value === ('' + (variables.seasonYear ?? ''))) as format[],
      seasons: seasons.filter(s => s.value === (variables.season ?? '')) as format[],
      // @ts-expect-error fuck you
      formats: formats.filter(f => (variables.format ?? []).includes(f.value)) as format[],
      // @ts-expect-error fuck you
      status: status.filter(s => (variables.status ?? '').includes(s.value)) as format[],
      sort: sort.filter(s => s.value === (variables.sort?.[0] ?? '')) as format[]
    }
  }

  // state
  let search = variablesToSearch($page.state.search) ?? {
    name: '',
    genres: [] as format[],
    years: [] as format[],
    seasons: [] as format[],
    formats: [] as format[],
    status: [] as format[],
    sort: [] as format[],
    ids: undefined,
    onList: [] as format[]
  }

  let pageNumber = 1
  let inputText = ''

  function clear () {
    search = {
      name: '',
      genres: [],
      years: [],
      seasons: [],
      formats: [],
      status: [],
      sort: [],
      ids: undefined,
      onList: []
    }
    inputText = ''
    pageNumber = 1
    for (const unsub of mediaSubscriptions) {
      unsub()
    }
    mediaSubscriptions = []
  }

  let media: Array<ReturnType<typeof client.search>> = []

  let mediaSubscriptions: Array<() => void> = []

  onDestroy(clear)

  // handlers

  function searchChanged (s: typeof search) {
    const filter = filterEmpty(s)

    pageNumber = 1
    media = [searchQuery(filter, 1)]
  }

  function searchQuery (filter: Partial<typeof search>, page: number) {
    const search = {
      page,
      ids: filter.ids,
      search: filter.name,
      onList: filter.onList?.[0]?.value === 'true' ? true : filter.onList?.[0]?.value === 'false' ? false : undefined,
      genre: filter.genres?.map(g => g.value),
      seasonYear: filter.years?.length ? parseInt(filter.years[0]!.value) : undefined,
      season: filter.seasons?.[0]!.value as 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' | undefined,
      format: filter.formats?.map(f => f.value) as Array<'MUSIC' | 'MANGA' | 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'NOVEL' | 'ONE_SHOT'>,
      status: filter.status?.map(s => s.value) as Array<'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS' | null>,
      sort: [filter.sort?.[0]?.value ?? 'SEARCH_MATCH'] as Array<'TITLE_ROMAJI_DESC' | 'ID' | 'START_DATE_DESC' | 'SCORE_DESC' | 'POPULARITY_DESC' | 'TRENDING_DESC' | 'UPDATED_AT_DESC' | 'ID_DESC' | 'TITLE_ROMAJI' | 'TITLE_ENGLISH' | 'TITLE_ENGLISH_DESC' | null>
    }

    tick().then(() => replaceState('', { search }))

    const query = client.search(search)

    mediaSubscriptions.push(query.subscribe(() => {}))
    return query
  }

  const updateText = debounce((e: FormInputEvent) => {
    inputText = (e.target as HTMLInputElement).value
    search.name = inputText
  }, 200)

  $: searchChanged(search)

  // TODO: selects should turn into modals on mobile! like anilist

  $: lastestQuery = media[media.length - 1]
  $: hasNextPage = $lastestQuery?.data?.Page?.pageInfo?.hasNextPage

  async function imagePicker (e: Event) {
    const target = e.target as HTMLInputElement
    const { files } = target
    if (files?.[0]) {
      const promise = traceAnime(files[0])
      toast.promise(promise, {
        description: 'You can also paste an URL to an image.',
        loading: 'Looking up anime for image...',
        success: 'Found anime for image!',
        error: 'Couldn\'t find anime for specified image! Try to remove black bars, or use a more detailed image.'
      })
      target.value = ''

      try {
        const res = await promise

        clear()
        search.ids = [...new Set(res.map(r => r.anilist))]
      // TODO: sort by similarity, finish
      } catch (e) {
        console.error(e)
      }
    }
  }

  function infiniteScroll (div: HTMLDivElement) {
    const ctrl = new AbortController()
    let ticking = false
    div.addEventListener('scrollend', async () => {
      if (!ticking && hasNextPage) {
        const scrollTop = div.scrollTop
        const scrollable = div.scrollHeight - div.clientHeight
        const remaining = scrollable - scrollTop
        if (remaining < 800) {
          pageNumber = pageNumber + 1
          media = [...media, searchQuery(filterEmpty(search), pageNumber)]
          ticking = true
          await sleep(100)
          ticking = false
        }
      }
    }, { signal: ctrl.signal })

    return {
      destroy () {
        ctrl.abort()
      }
    }
  }

  const viewer = client.viewer
</script>

<div class='flex flex-col h-full overflow-y-auto overflow-x-clip -ml-14 pl-14 z-20 min-w-0 grow pointer-events-none' use:dragScroll use:infiniteScroll>
  <div class='sticky top-0 z-20 px-2 sm:px-10 pointer-events-auto shrink-0 overflow-clip bg-black'>
    <div class='flex flex-wrap pt-5'>
      <div class='grid items-center min-w-40 flex-1 md:basis-auto md:w-1/4 p-2'>
        <div class='text-xl font-bold mb-1 ml-1'>
          Title
        </div>
        <div class='flex items-center scale-parent relative'>
          <Input
            class='pl-9 border-0 bg-background select:bg-accent select:text-accent-foreground shadow-sm no-scale placeholder:opacity-50 capitalize'
            placeholder='Any'
            on:input={updateText}
            bind:value={inputText} />
          <MagnifyingGlass class='h-4 w-4 shrink-0 opacity-50 absolute left-3 text-muted-foreground z-10 pointer-events-none' />
        </div>
      </div>
      <div class='grid items-center min-w-40 flex-1 md:basis-auto md:w-1/4 p-2'>
        <div class='text-xl font-bold mb-1 ml-1'>
          Genre
        </div>
        <ComboBox items={genres} multiple={true} bind:value={search.genres} class='w-full' />
      </div>
      <div class='grid items-center min-w-40 flex-1 md:basis-auto md:w-1/4 p-2'>
        <div class='text-xl font-bold mb-1 ml-1'>
          Year
        </div>
        <ComboBox items={years} bind:value={search.years} class='w-full' />
      </div>
      <div class='grid items-center min-w-40 flex-1 md:basis-auto md:w-1/4 p-2'>
        <div class='text-xl font-bold mb-1 ml-1'>
          Season
        </div>
        <ComboBox items={seasons} bind:value={search.seasons} class='w-full' />
      </div>
      <div class='grid items-center p-2 min-w-40 flex-1'>
        <div class='text-xl font-bold mb-1 ml-1'>
          Format
        </div>
        <ComboBox items={formats} multiple={true} bind:value={search.formats} class='w-full' />
      </div>
      <div class='grid items-center p-2 min-w-40 flex-1'>
        <div class='text-xl font-bold mb-1 ml-1'>
          Status
        </div>
        <ComboBox items={status} multiple={true} bind:value={search.status} class='w-full' />
      </div>
      <div class='grid items-center p-2 min-w-40 flex-1'>
        <div class='text-xl font-bold mb-1 ml-1'>
          Sort
        </div>
        <ComboBox items={sort} bind:value={search.sort} class='w-full' placeholder='Accuracy' />
      </div>
      {#if $viewer?.viewer?.id}
        <div class='grid items-center p-2 min-w-36 flex-1'>
          <div class='text-xl font-bold mb-1 ml-1 text-nowrap'>
            My List
          </div>
          <ComboBox items={onlist} bind:value={search.onList} class='w-full' placeholder='List' />
        </div>
      {/if}
      <div class='w-auto p-2 gap-4 grid grid-cols-2 items-end'>
        <Button variant='outline' size='icon' class='border-0'>
          <label for='search-image' class='contents'>
            <FileImage class='h-4 w-full cursor-pointer' />
          </label>
          <input type='file' class='hidden' id='search-image' accept='image/*' on:input|preventDefault|stopPropagation={imagePicker} />
        </Button>
        <Button variant='outline' size='icon' on:click={clear} class='border-0'>
          <Trash class={cn('h-4 w-4', empty(search) ? 'text-muted-foreground opacity-50' : 'text-blue-400')} />
        </Button>
      </div>
    </div>
    <div class='flex flex-row flex-wrap mt-2 min-h-11 pb-3 px-1'>
      {#each list(search) as item (item)}
        <button class={cn(badgeVariants(), 'mx-1.5 my-1 group capitalize text-nowrap')} use:click={() => remove(item)}>
          {item}
          <X class='hidden group-select:block group-focus-visible:block ml-2' size={12} />
        </button>
      {/each}
    </div>
  </div>
  <div class='flex flex-wrap md:px-7 justify-center pointer-events-auto'>
    {#each media as query, i (i)}
      <QueryCard {query} />
    {/each}
  </div>
</div>
