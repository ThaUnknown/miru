<script>
    import { onMount } from 'svelte'
    import { settings } from '@/modules/settings.js'
    import { malDubs } from '@/modules/animedubs.js'
    import { writable } from 'svelte/store'
    import { matchPhrase } from "@/modules/util.js"

    /** @type {import('@/modules/al.d.ts').Media} */
    export let media = null
    export let data = null

    export let banner = false
    export let viewAnime = false
    export let example = false
    export let episode = false
    let isDubbed = writable(false)
    let isPartial = writable(false)

    function setLabel() {
        const dubLists = malDubs.dubLists.value
        if (media?.idMal && dubLists?.dubbed) {
            const episodeOrMedia = !episode || (matchPhrase(data.parseObject?.language, 'English', 3) || matchPhrase(data.parseObject?.file_name, ['Multi Audio', 'Dual Audio', 'English Audio'], 3))
            isDubbed.set(episodeOrMedia && dubLists.dubbed.includes(media.idMal))
            isPartial.set(episodeOrMedia && dubLists.incomplete.includes(media.idMal))
        }
    }

    onMount(() => {
        if (!example) {
            setLabel()
        }
    })
</script>

{#if !banner && !viewAnime && !example}
    {#if settings.value.cardAudio}
        <span class='material-symbols-outlined pl-10 pt-10 position-absolute top-0 left-0 filled font-weight-medium z-10 {$isDubbed ? "dubbed" : $isPartial ? "incomplete" : "subbed"}' title={$isDubbed ? "English Dubbed" : $isPartial ? "English Dub was not completed" : "Subtitles Only"}>
            {$isDubbed ? 'mic' : $isPartial ? 'mic_off' : 'closed_caption'}
        </span>
        {#if media.isAdult}
         <span class='material-symbols-outlined pt-10 position-absolute top-0 left-0 filled font-weight-medium z-10 adult'>
            18_up_rating
         </span>
        {/if}
    {/if}
 {:else if !viewAnime && !example}
     {$isDubbed ? 'Dub' : $isPartial ? 'Partial Dub' : 'Sub'}
 {:else if viewAnime}
     <span class='material-symbols-outlined mx-10 font-size-24'>
         {$isDubbed ? 'mic' : $isPartial ? 'mic_off' : 'closed_caption'}
     </span>
     <span class='mr-20'>
         {$isDubbed ? 'Dub' : $isPartial ? 'Partial Dub' : 'Sub'}
     </span>
 {:else}
     <div>
         <span class='material-symbols-outlined filled font-size-24 label ml-20 position-relative z-10 adult'>18_up_rating</span>
         <span class='position-relative ml-2'>Rated 18+</span>
         <span class='material-symbols-outlined filled font-size-24 label ml-20 position-relative z-10 subbed'>closed_caption</span>
         <span class='position-relative ml-2'>Sub Only</span>
         <span class='material-symbols-outlined filled font-size-24 label ml-20 position-relative z-10 incomplete'>mic_off</span>
         <span class='position-relative ml-2'>Partial Dub</span>
         <span class='material-symbols-outlined filled font-size-24 label ml-20 position-relative z-10 dubbed'>mic</span>
         <span class='position-relative ml-2'>Dub</span>
     </div>
 {/if}

 <style>
     .label {
         top: 0.625rem;
     }
     .adult {
         color: rgba(215, 6, 10);
         padding-left: 3.6rem;
         text-shadow: black 0 0 1rem;
     }
     .dubbed {
         color: rgb(255, 214, 0);
         text-shadow: black 0 0 .5rem;
     }
     .subbed {
         color: rgb(137, 39, 255);
         text-shadow: black 0 0 .5rem;
     }
     .incomplete {
         color: rgb(255, 94, 0);
         text-shadow: black 0 0 .5rem;
     }
 </style>
