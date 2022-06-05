<script context="module">
  import { writable } from 'svelte/store'
  const toasts = writable({})
  let index = 0
  export function addToast (opts) {
    // type, click, title, text
    toasts.update(toasts => {
      const i = ++index
      toasts[i] = opts
      setTimeout(() => {
        close(i)
      }, opts.duration || 10000)
      return toasts
    })
  }
  function close (index) {
    toasts.update(toasts => {
      if (toasts[index]) {
        delete toasts[index]
      }
      return toasts
    })
  }
</script>

<div class="sticky-alerts d-flex flex-column-reverse">
  {#each Object.entries($toasts) as [index, toast] (index)}
    <div class="alert alert-{toast.type} filled" class:pointer={toast.click} on:click={toast.click}>
      <button class="close" type="button" on:click={() => close(index)}><span aria-hidden="true">×</span></button>
      <h4 class="alert-heading">{toast.title}</h4>
      {@html toast.text}
    </div>
  {/each}
</div>

<style>
  .alert {
    display: block !important;
    animation: 0.3s ease 0s 1 fly-in;
    right: 0;
  }

  @keyframes fly-in {
    from {
      right: -50rem;
    }

    to {
      right: 0;
    }
  }
</style>
