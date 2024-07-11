<script context='module'>
  import SectionsManager, { sections } from '@/modules/sections.js'
  import { settings } from '@/modules/settings.js'
  import { anilistClient, currentSeason, currentYear } from '@/modules/anilist.js'

  const bannerData = anilistClient.search({ method: 'Search', sort: 'POPULARITY_DESC', perPage: 15, onList: false, season: currentSeason, year: currentYear, status_not: 'NOT_YET_RELEASED' })

  const manager = new SectionsManager()

  const mappedSections = {}

  for (const section of sections) {
    mappedSections[section.title] = section
  }

  for (const sectionTitle of settings.value.homeSections) manager.add(mappedSections[sectionTitle])

  if (anilistClient.userID?.viewer?.data?.Viewer) {
    const userSections = ['Continue Watching', 'Sequels You Missed', 'Your List', 'Completed List', 'Paused List', 'Dropped List', 'Currently Watching List']

    anilistClient.userLists.subscribe(value => {
      if (!value) return
      for (const section of manager.sections) {
        // remove preview value, to force UI to re-request data, which updates it once in viewport
        if (userSections.includes(section.title)) section.preview.value = section.load(1, 15)
      }
    })
  }
</script>

<script>
  import Section from './Section.svelte'
  import Banner from '@/components/banner/Banner.svelte'
  import smoothScroll from '@/modules/scroll.js'
</script>

<div class='h-full w-full overflow-y-scroll root overflow-x-hidden' use:smoothScroll>
  <Banner data={bannerData} />
  <div class='d-flex flex-column h-full w-full'>
    {#each manager.sections as section, i (i)}
      {#if !section.hide}
        <Section bind:opts={section} />
      {/if}
    {/each}
  </div>
</div>
