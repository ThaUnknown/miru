<script>
    import { onMount } from 'svelte'
    import { settings } from '@/modules/settings.js'
    import { malDubs } from '@/modules/animedubs.js'
    import { writable } from 'svelte/store'
    import { matchPhrase } from "@/modules/util.js"
    import { Mic, MicOff, Captions, GraduationCap } from 'lucide-svelte'

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
        <div class='pl-10 pt-10 position-absolute top-0 left-0 filled font-weight-medium z-10 {$isDubbed ? "dubbed" : $isPartial ? "incomplete" : "subbed"}' title={$isDubbed ? "English Dubbed" : $isPartial ? "English Dub was not completed" : "Subtitles Only"}>
            {#if $isDubbed}
                <Mic size='3rem' />
            {:else if $isPartial}
                <MicOff size='3rem' />
            {:else}
                <Captions size='3rem' />
            {/if}
        </div>
        {#if media.isAdult}
             <div class='pt-10 position-absolute top-0 left-0 filled font-weight-medium z-10 adult'>
                <GraduationCap size='3rem' />
             </div>
        {/if}
    {/if}
 {:else if !viewAnime && !example}
     {$isDubbed ? 'Dub' : $isPartial ? 'Partial Dub' : 'Sub'}
 {:else if viewAnime}
    {#if $isDubbed}
        <Mic class='mx-10' size='2.2rem' />
    {:else if $isPartial}
        <MicOff class='mx-10' size='2.2rem' />
    {:else}
        <Captions class='mx-10' size='2.2rem' />
    {/if}
     <span class='mr-20'>
         {$isDubbed ? 'Dub' : $isPartial ? 'Partial Dub' : 'Sub'}
     </span>
 {:else}
     <div>
         <span class='font-size-24 label ml-20 position-relative z-10 adult'>
             <GraduationCap size='2.5rem' />
         </span>
         <span class='position-relative ml-2'>Rated 18+</span>
         <span class='font-size-24 label ml-20 position-relative z-10 subbed'>
             <Captions size='2.5rem' />
         </span>
         <span class='position-relative ml-2'>Sub Only</span>
         <span class='font-size-24 label ml-20 position-relative z-10 incomplete'>
             <MicOff size='2.5rem' />
         </span>
         <span class='position-relative ml-2'>Partial Dub</span>
         <span class='font-size-24 label ml-20 position-relative z-10 dubbed'>
             <Mic size='2.5rem' />
         </span>
         <span class='position-relative ml-2'>Dub</span>
     </div>
 {/if}

 <style>
     .label {
         top: 0.625rem;
     }
     .adult {
         color: rgba(215, 6, 10) !important;
         padding-left: 4.6rem;
         text-shadow: black 0 0 1rem;
     }
     .dubbed {
         color: rgb(255, 214, 0) !important;
         text-shadow: black 0 0 .5rem;
     }
     .subbed {
         color: rgb(137, 39, 255) !important;
         text-shadow: black 0 0 .5rem;
     }
     .incomplete {
         color: rgb(255, 94, 0) !important;
         text-shadow: black 0 0 .5rem;
     }
 </style>
