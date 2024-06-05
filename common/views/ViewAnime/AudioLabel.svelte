<script>
    import { onMount } from 'svelte'
    import { settings } from '@/modules/settings.js'
    import { loadDubs, dubInfo } from '@/modules/audiolabel.js'
    import { writable } from 'svelte/store';

    /** @type {import('@/modules/al.d.ts').Media} */
    export let media = null

    export let banner = false
    export let viewAnime = false
    export let example = false

    let isDubbed = writable(false)
    let isPartial = writable(false)

    function setLabel() {
        if (media != null && dubInfo.value) {
            isDubbed.set(dubInfo.value.dubbed.includes(media.idMal))
            isPartial.set(dubInfo.value.incomplete.includes(media.idMal))
        }
    }

    onMount(() => {
        if (!example) {
            loadDubs();
            setLabel()
            window.addEventListener('audio-label', setLabel);
        }
    })
</script>

{#if !banner && !viewAnime && !example && settings.value.cardAudio}
    <span class='material-symbols-outlined font-size-24 label position-absolute {$isDubbed ? 'dubbed' : $isPartial ? 'incomplete' : 'subbed'}'>
        {$isDubbed ? 'mic' : $isPartial ? 'mic_off' : 'closed_caption'}
    </span>
{:else if !viewAnime && !example}
    {$isDubbed ? 'Dub' : $isPartial ? 'Partial Dub' : 'Sub'}
{:else if !example}
    <span class='material-symbols-outlined mx-10 font-size-24'>
        {$isDubbed ? 'mic' : $isPartial ? 'mic_off' : 'closed_caption'}
    </span>
    <span class='mr-20'>
        {$isDubbed ? 'Dub' : $isPartial ? 'Partial Dub' : 'Sub'}
    </span>
{:else}
    <div>
        <span class='material-symbols-outlined font-size-24 label ml-20 position-relative subbed'>closed_caption</span>
        <span class='position-relative ml-2'>Sub Only</span>
        <span class='material-symbols-outlined font-size-24 label ml-20 position-relative incomplete'>mic_off</span>
        <span class='position-relative ml-2'>Partial Dub</span>
        <span class='material-symbols-outlined font-size-24 label ml-20 position-relative dubbed'>mic</span>
        <span class='position-relative ml-2'>Dub</span>
    </div>
{/if}

<style>
    .label {
        padding: 0.4rem 0.2rem;
        border-radius: 0.8rem;
        top: 0.625rem;
        right: 0.625rem;
        z-index: 1;
    }
    .dubbed {
        background-color: rgba(121, 97, 9, 0.7);
    }
    .subbed {
        background-color: rgba(76, 41, 124, 0.7);
    }
    .incomplete {
        background-color: rgba(221, 100, 25, 0.7);
    }
</style>
