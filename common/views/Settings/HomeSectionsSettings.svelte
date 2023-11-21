<script>
  import { click } from '@/modules/click.js'
  import { sections } from '@/modules/sections.js'

  const allowedHomeSections = sections.map(({ title }) => title)
  export let homeSections

  let mouseYCoordinate = null // pointer y coordinate within client
  let distanceTopGrabbedVsPointer = null

  let draggingItem = null
  let draggingItemIndex = null

  let hoveredItemIndex = null

  $: {
    if (draggingItemIndex != null && hoveredItemIndex != null && draggingItemIndex !== hoveredItemIndex) {
      [homeSections[draggingItemIndex], homeSections[hoveredItemIndex]] = [homeSections[hoveredItemIndex], homeSections[draggingItemIndex]]

      draggingItemIndex = hoveredItemIndex
    }
  }
</script>

{#if mouseYCoordinate}
  <div
    class='input-group mb-10 ghost w-full'
    style='top: {mouseYCoordinate + distanceTopGrabbedVsPointer}px;'>
    <div class='input-group-prepend'>
      <span class='input-group-text d-flex justify-content-center px-5 material-symbols-outlined font-size-20'>swap_vert</span>
    </div>
    <select class='form-control' value={draggingItem}>
      {#each allowedHomeSections as section}
        <option>{section}</option>
      {/each}
    </select>
    <div class='input-group-append'>
      <button type='button' class='btn btn-danger input-group-append px-5 material-symbols-outlined font-size-20'>delete</button>
    </div>
  </div>
{/if}
{#each homeSections as item, index}
  <div
    class='input-group mb-10'
    class:tp={draggingItem === item}
    draggable='true'
    role='menuitem'
    tabindex='0'
    on:dragstart={({ clientY, target }) => {
      mouseYCoordinate = clientY
      draggingItem = item
      draggingItemIndex = index
      distanceTopGrabbedVsPointer = target.offsetTop - clientY
    }}
    on:drag={e => { mouseYCoordinate = e.clientY }}
    on:dragover={() => { hoveredItemIndex = index }}
    on:dragend={() => {
      mouseYCoordinate = null
      draggingItem = null
      hoveredItemIndex = null
    }}>
    <div class='input-group-prepend grab'>
      <span class='input-group-text d-flex justify-content-center px-5 material-symbols-outlined font-size-20'>swap_vert</span>
    </div>
    <select class='form-control bg-dark w-300 mw-full' bind:value={homeSections[index]}>
      {#each allowedHomeSections as section}
        <option>{section}</option>
      {/each}
    </select>
    <div class='input-group-append'>
      <button type='button' use:click={() => { homeSections.splice(index, 1); homeSections = homeSections }} class='btn btn-danger input-group-append px-5 material-symbols-outlined font-size-20'>delete</button>
    </div>
  </div>
{/each}
<button type='button' use:click={() => { homeSections[homeSections.length] = 'Trending Now' }} class='btn btn-primary'>Add Section</button>

<style>
    .ghost {
      margin-bottom: 10px;
      pointer-events: none;
      z-index: 9999;
      position: absolute !important;
    }

    .tp {
      opacity: 0;
    }

    .grab{
      cursor: grab;
    }
</style>
