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

<div class='position-relative'>
  <div class='col p-10 d-flex flex-column justify-content-end'>
    <div class='font-size-24 font-weight-semi-bold d-flex'>
      <div class='material-symbols-outlined mr-10 font-size-30'>list</div>
      Home Sections Order
    </div>
  </div>
  {#if mouseYCoordinate}
    <div
      class='input-group mb-10 form-control-lg ghost w-full'
      style='top: {mouseYCoordinate + distanceTopGrabbedVsPointer}px;'>
      <div class='input-group-prepend'>
        <span class='input-group-text w-100 justify-content-center'>Feed</span>
      </div>
      <select class='form-control form-control-lg' value={draggingItem}>
        {#each allowedHomeSections as section}
          <option>{section}</option>
        {/each}
      </select>
      <div class='input-group-append'>
        <button type='button' class='btn btn-danger btn-lg input-group-append'>Remove</button>
      </div>
    </div>
  {/if}
  {#each homeSections as item, index}
    <div
      class='input-group mb-10 form-control-lg'
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
        <span class='input-group-text w-100 justify-content-center'>Feed</span>
      </div>
      <select class='form-control form-control-lg' bind:value={homeSections[index]}>
        {#each allowedHomeSections as section}
          <option>{section}</option>
        {/each}
      </select>
      <div class='input-group-append'>
        <button type='button' use:click={() => { homeSections.splice(index, 1); homeSections = homeSections }} class='btn btn-danger btn-lg input-group-append'>Remove</button>
      </div>
    </div>
  {/each}
  <div class='input-group input-group-lg form-control-lg mb-10 w-500'>
    <button type='button' use:click={() => { homeSections[homeSections.length] = 'Trending Now' }} class='btn btn-lg btn-primary mb-10'>Add Section</button>
  </div>
</div>

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
