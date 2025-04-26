<script lang='ts'>
  import { Button } from '../button'
  import { Textarea } from '../textarea'

  import * as Drawer from '$lib/components/ui/drawer'
  import { client } from '$lib/modules/anilist'

  export let isLocked = false

  const viewer = client.viewer

  export let threadId: number | undefined = undefined
  export let parentCommentId: number | undefined = undefined
  export let rootCommentId: number | undefined = undefined
  export let id: number | undefined = undefined

  export let value = ''

  const placeholder = 'Write a comment on AniList \n\nDO NOT ASK FOR HELP HERE!\n\nAsking questions such as "why isnt X playing" or "why cant i find any torrents" !__WILL GET YOU BANNED__!\n\nTHIS IS A 3RD PARTY FORUM!'

  function comment () {
    client.comment({ threadId, id, parentCommentId, comment: value, rootCommentId })
  }
</script>

<Drawer.Root portal='html'>
  <Drawer.Trigger asChild let:builder>
    <Button size='icon-sm' variant='ghost' class='mr-1' disabled={isLocked || !$viewer?.viewer} builders={[builder]}>
      <slot />
    </Button>
  </Drawer.Trigger>
  <Drawer.Content tabindex={null} class='px-20 py-10 gap-4'>
    <Textarea class='form-control w-full shrink-0 min-h-56 bg-dark' {placeholder} bind:value />
    <div class='flex gap-2 justify-end'>
      <Drawer.Close asChild let:builder>
        <Button variant='secondary' builders={[builder]}>
          Close
        </Button>
      </Drawer.Close>
      <Drawer.Close asChild let:builder>
        <Button builders={[builder]} on:click={comment}>
          Send
        </Button>
      </Drawer.Close>
    </div>
  </Drawer.Content>
</Drawer.Root>
