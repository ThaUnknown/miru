<script>
  import { click } from '@/modules/click.js'
  import { sections } from '@/modules/sections.js'
  import { SUPPORTS } from '@/modules/support.js'
  import { ArrowDown, ArrowDownUp, ArrowUp, Trash2 } from 'lucide-svelte'

  const allowedHomeSections = sections.map(({ title }) => title)
  export let homeSections

  let mouseYCoordinate = null // pointer y coordinate within client
  let distanceTopGrabbedVsPointer = null

  let draggingItem = null
  let draggingItemIndex = null

  let hoveredItemIndex = null

  $: {
    if (draggingItemIndex != null && hoveredItemIndex != null && draggingItemIndex !== hoveredItemIndex) {
      swapItem(draggingItemIndex, hoveredItemIndex)

      draggingItemIndex = hoveredItemIndex
    }
  }

  function swapItem (a, b) {
    b = Math.min(homeSections.length - 1, Math.max(0, b))
    ;[homeSections[a], homeSections[b]] = [homeSections[b], homeSections[a]]
  }
</script>

{#if mouseYCoordinate}
  <div
    class='input-group mb-10 ghost w-full'
    style='top: {mouseYCoordinate + distanceTopGrabbedVsPointer}px;'>
    <div class='input-group-prepend'>
      <span class='input-group-text d-flex align-items-center px-5'><ArrowDownUp size='1.8rem' /></span>
    </div>
    <select class='form-control' value={draggingItem}>
      {#each allowedHomeSections as section}
        <option>{section}</option>
      {/each}
    </select>
    <div class='input-group-append'>
      <button type='button' class='btn btn-danger btn-square input-group-append px-5 d-flex align-items-center'><Trash2 size='1.8rem' /></button>
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
    {#if !SUPPORTS.isAndroid}
      <div class='input-group-prepend grab'>
        <span class='input-group-text d-flex align-items-center px-5'><ArrowDownUp size='1.8rem' /></span>
      </div>
    {:else}
      <div class='input-group-prepend'>
        <button use:click={() => swapItem(index, index - 1)} class='input-group-text d-flex align-items-center px-5 pointer'><ArrowUp size='1.8rem' /></button>
      </div>
      <div class='input-group-prepend'>
        <button use:click={() => swapItem(index, index + 1)} class='input-group-text d-flex align-items-center px-5 pointer'><ArrowDown size='1.8rem' /></button>
      </div>
    {/if}
    <select class='form-control bg-dark w-300 mw-full' bind:value={homeSections[index]}>
      {#each allowedHomeSections as section}
        <option>{section}</option>
      {/each}
    </select>
    <div class='input-group-append'>
      <button type='button' use:click={() => { homeSections.splice(index, 1); homeSections = homeSections }} class='btn btn-danger btn-square input-group-append px-5 d-flex align-items-center'><Trash2 size='1.8rem' /></button>
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
