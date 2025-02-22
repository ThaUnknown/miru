<script lang='ts'>
  import { PencilLine } from 'lucide-svelte'

  import * as Dialog from '$lib/components/ui/dialog'
  import * as Select from '$lib/components/ui/select'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'

  import { dragScroll } from '$lib/modules/navigate'

  import { cover, title, type Media } from '$lib/modules/anilist'
  import { list, progress as _progress, score as _score, repeat as _repeat, authAggregator, lists } from '$lib/modules/auth'

  export let media: Media

  const STATUS_LABELS = {
    CURRENT: 'Watching',
    PLANNING: 'Plan to Watch',
    COMPLETED: 'Completed',
    PAUSED: 'Paused',
    DROPPED: 'Dropped',
    REPEATING: 'Re-Watching'
  }

  let status = { value: list(media) ?? 'CURRENT', label: STATUS_LABELS[list(media) ?? 'CURRENT'] }
  let score = { value: Number(_score(media) ?? 0), label: '' + (_score(media) ?? 0) }

  let progress = _progress(media) ?? 0
  let repeat = _repeat(media) ?? 0

  function deleteEntry () {
    if (!media.mediaListEntry) return
    authAggregator.delete(media.mediaListEntry.id)
  }

  function saveEntry () {
    authAggregator.entry({ id: media.id, score: Number(score.value) * 10, repeat: Number(repeat), progress: Number(progress), status: status.value, lists: lists(media)?.filter(({ enabled }) => enabled).map(({ name }) => name) })
  }
</script>

<Dialog.Root portal='#root'>
  <Dialog.Trigger let:builder asChild>
    <Button size='icon' class='rounded-l-none bg-primary/85 select:bg-primary/75 shrink-0' builders={[builder]}>
      <PencilLine class='size-4' />
    </Button>
  </Dialog.Trigger>
  <Dialog.Content class='flex justify-center max-h-[80%] p-0'>
    <div class='flex flex-col md:flex-row w-full overflow-y-auto' use:dragScroll>
      <div class='relative w-full h-[120px] md:w-[260px] md:h-[400px] shrink-0'>
        <img alt='images' loading='lazy' decoding='async' class='object-cover w-full h-full' style:background={media.coverImage?.color ?? '#000'} src={cover(media)} />
      </div>
      <form class='flex flex-col w-full rounded-r-lg h-full'>
        <div class='pt-4 px-5 w-full'>
          <h3 class='text-xl leading-6 font-semibold z-30 text-white sm:line-clamp-1 line-clamp-2'>{title(media)}</h3>
        </div>
        <div class='px-5 py-3 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full'>
          <div class='mt-1 flex flex-col'>
            <div class='font-bold text-muted-foreground text-sm mb-2'>Status</div>
            <Select.Root bind:selected={status}>
              <Select.Trigger>
                <Select.Value placeholder='Status' />
              </Select.Trigger>
              <Select.Content sameWidth={true}>
                <Select.Item value='CURRENT'>Watching</Select.Item>
                <Select.Item value='PLANNING'>Plan to Watch</Select.Item>
                <Select.Item value='COMPLETED'>Completed</Select.Item>
                <Select.Item value='PAUSED'>Paused</Select.Item>
                <Select.Item value='DROPPED'>Dropped</Select.Item>
                <Select.Item value='REPEATING'>Re-Watching</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
          <div class='mt-1 flex flex-col'>
            <div class='font-bold text-muted-foreground text-sm mb-2'>Score</div>
            <Select.Root bind:selected={score}>
              <Select.Trigger>
                <Select.Value placeholder='Score' />
              </Select.Trigger>
              <Select.Content sameWidth={true}>
                <Select.Item value='0' />
                <Select.Item value='1' />
                <Select.Item value='2' />
                <Select.Item value='3' />
                <Select.Item value='4' />
                <Select.Item value='5' />
                <Select.Item value='6' />
                <Select.Item value='7' />
                <Select.Item value='8' />
                <Select.Item value='9' />
                <Select.Item value='10' />
              </Select.Content>
            </Select.Root>
          </div>
          <div class='mt-1 flex flex-col'>
            <div class='font-bold text-muted-foreground text-sm mb-2'>Progress</div>
            <Input type='number' inputmode='numeric' pattern='[0-9]*.?[0-9]*' min='0' max='Infinity' bind:value={progress} />
          </div>
          <div class='mt-1 flex flex-col'>
            <div class='font-bold text-muted-foreground text-sm mb-2'>Rewatched Times</div>
            <Input type='number' inputmode='numeric' pattern='[0-9]*.?[0-9]*' min='0' max='Infinity' bind:value={repeat} />
          </div>
        </div>
        <div class='px-4 py-3 gap-3 mt-auto flex flex-col sm:flex-row-reverse sm:px-6'>
          <Dialog.Close let:builder asChild>
            <Button on:click={saveEntry} builders={[builder]}>Save Changes</Button>
            <Button variant='secondary' builders={[builder]}>Cancel</Button>
            <Button variant='destructive' on:click={deleteEntry} builders={[builder]}>Delete</Button>
          </Dialog.Close>
        </div>
      </form>
    </div>
  </Dialog.Content>
</Dialog.Root>
