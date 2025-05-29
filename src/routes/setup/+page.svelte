<script lang='ts'>
  import { WEB_URL } from '$lib'
  import Logo from '$lib/components/icons/Logo.svelte'
  import { Button } from '$lib/components/ui/button'
  import { Checkbox } from '$lib/components/ui/checkbox'
  import { Label } from '$lib/components/ui/label'
  import native from '$lib/modules/native'
  import { click, dragScroll } from '$lib/modules/navigate'

  let checked = false
</script>

<div class='space-y-3 lg:max-w-4xl h-full overflow-y-auto w-full py-8 flex flex-col items-center justify-center' use:dragScroll>
  <Logo class='w-52 h-52 object-contain mb-14 shrink-0' />
  <div class='font-bold text-5xl relative'>
    Welcome to Hayase
    <div class='animate-[hearbeat_1.5s_ease-in-out_infinite_alternate] absolute text-lg text-theme -right-20 -top-2 rotate-12'>Previously known as Miru!</div>
  </div>
  <div class='text-muted-foreground pt-3'>Let's set up your perfect streaming environment.</div>
  <div class='flex items-center space-x-2 pt-12 pb-3'>
    <Checkbox id='terms' bind:checked />
    <Label for='terms' class='text-md font-medium leading-none text-muted-foreground'>
      I agree to the <a use:click={() => native.openURL(`${WEB_URL}/terms`)} class='text-primary underline'>Terms of Service</a> and <a use:click={() => native.openURL(`${WEB_URL}/privacy`)} class='text-primary underline'>Privacy Policy</a>
    </Label>
  </div>
  <Button class='text-lg font-bold shrink-0' disabled={!checked} size='lg' href={checked ? './storage' : undefined}>Start Setup</Button>
</div>
