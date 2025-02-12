<script lang='ts'>
  import { Button } from '$lib/components/ui/button'
  import { Settings, Trash } from 'lucide-svelte'
</script>

<div class='bg-neutral-950 px-5 py-4 rounded-md flex flex-row space-x-3 justify-between w-[500px] max-w-full'>
  <div class='flex flex-col space-y-3'>
    <div class='flex flex-row space-x-3'>
      <img src='https://releases.moe/favicon.png' alt='ico' class='size-12 rounded-md bg-neutral-900' />
      <div class='flex flex-col'>
        <div class='text-lg font-bold'>
          Seadex
        </div>
        <div class='text-sm text-muted-foreground'>
          seadex
        </div>
      </div>
    </div>
    <div class='flex-wrap w-full justify-start gap-2 flex text-neutral-300 text-sm'>
      <div class='rounded px-3 py-0.5 font-bold bg-neutral-900 leading-snug'>
        v0.0.1
      </div>
      <div class='rounded px-3 py-0.5 font-bold bg-neutral-900 leading-snug'>
        Torrent
      </div>
      <div class='rounded px-3 py-0.5 font-bold bg-neutral-900 leading-snug'>
        High Accuracy
      </div>
      <div class='rounded px-3 py-0.5 font-bold bg-neutral-900 leading-snug'>
        2.0 Ratio
      </div>
    </div>
  </div>
  <div class='flex flex-col space-y-2'>
    <Button variant='ghost' size='icon-sm'><Settings size={18} /></Button>
    <Button variant='ghost' size='icon-sm'><Trash size={18} /></Button>
  </div>
</div>
