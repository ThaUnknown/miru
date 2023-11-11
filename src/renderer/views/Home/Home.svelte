<script context='module'>
  import SectionsManager, { sections } from '@/modules/sections.js'
  import { settings } from '@/modules/settings.js'
  import { alRequest, currentSeason, currentYear, userLists } from '@/modules/anilist.js'

  const bannerData = alRequest({ method: 'Search', sort: 'POPULARITY_DESC', perPage: 1, onList: false, season: currentSeason, year: currentYear })

  const manager = new SectionsManager()

  const mappedSections = {}

  for (const section of sections) {
    mappedSections[section.title] = section
  }

  for (const sectionTitle of settings.value.homeSections) manager.add(mappedSections[sectionTitle])

  const userSections = ['Continue Watching', 'Sequels You Missed', 'Your List', 'Completed List', 'Paused List', 'Dropped List', 'Currently Watching List']

  userLists.subscribe(() => {
    for (const section of manager.sections) {
      // remove preview value, to force UI to re-request data, which updates it once in viewport
      if (userSections.includes(section.title)) section.preview.value = undefined
    }
  })
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
