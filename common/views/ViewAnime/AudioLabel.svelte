<script>
    import { onMount } from 'svelte'
    import { settings } from '@/modules/settings.js'
    import { malDubs } from '@/modules/animedubs.js'
    import { writable } from 'svelte/store'
    import { matchPhrase } from "@/modules/util.js"
    import { Mic, MicOff, Captions, TriangleAlert } from 'lucide-svelte'

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
        <div class='position-absolute top-0 left-0 ml-10 mt-10 d-flex align-items-center justify-content-center'>
        <div class='w-auto h-auto z-10 text-white d-flex align-items-center justify-content-center {$isDubbed ? "dubbed" : $isPartial ? "incomplete" : "subbed"}'>
            {#if $isDubbed}
                <Mic size='2.5rem' />
            {:else if $isPartial}
                <MicOff size='2.5rem' />
            {:else}
                <Captions size='2.5rem' />
            {/if}
        </div>
        {#if media.isAdult}
            <div class='ml-5 w-auto h-auto z-10 text-white d-flex align-items-center justify-content-center adult'>
                <TriangleAlert size='2.5rem' />
            </div>
        {/if}
        </div>
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
         <div class='position-relative d-flex align-items-center justify-content-center mt-5'>
             <div class='position-relative d-flex align-items-center justify-content-center'>
                 <div class='font-size-24 label ml-20 z-10 adult'>
                     <TriangleAlert size='2.5rem' />
                 </div>
                 <span class='ml-5 mb-5'>Rated 18+</span>
             </div>
             <div class='position-relative d-flex align-items-center justify-content-center'>
                 <div class='font-size-24 label ml-20 z-10 subbed'>
                     <Captions size='2.5rem' />
                 </div>
                 <span class='ml-5 mb-5'>Sub Only</span>
             </div>
             <div class='position-relative d-flex align-items-center justify-content-center'>
                 <div class='font-size-24 label ml-20 z-10 incomplete'>
                     <MicOff size='2.5rem' />
                 </div>
                 <span class='ml-5 mb-5'>Partial Dub</span>
             </div>
             <div class='position-relative d-flex align-items-center justify-content-center'>
                 <div class='font-size-24 label ml-20 z-10 dubbed'>
                     <Mic size='2.5rem' />
                 </div>
                 <span class='ml-5 mb-5 mr-10'>Dub</span>
              </div>
          </div>
     </div>
 {/if}

 <style>
     .label {
         top: .625rem;
     }
     .adult {
         color: rgb(215, 6, 10) !important;
         filter: drop-shadow(0 0 .4rem rgba(0, 0, 0, 1)) drop-shadow(0 0 .4rem rgba(0, 0, 0, 1));
     }
     .dubbed {
         color: rgb(255, 214, 0) !important;
         filter: drop-shadow(0 0 .4rem rgba(0, 0, 0, 1)) drop-shadow(0 0 .4rem rgba(0, 0, 0, 1));
     }
     .subbed {
         color: rgb(137, 39, 255) !important;
         filter: drop-shadow(0 0 .4rem rgba(0, 0, 0, 1)) drop-shadow(0 0 .4rem rgba(0, 0, 0, 1));
     }
     .incomplete {
         color: rgb(255, 94, 0) !important;
         filter: drop-shadow(0 0 .4rem rgba(0, 0, 0, 1)) drop-shadow(0 0 .4rem rgba(0, 0, 0, 1));
     }
 </style>
