<script lang='ts'>
  import { WEB_URL } from '$lib'
  import Logo from '$lib/components/icons/Logo.svelte'
  import { Button } from '$lib/components/ui/button'
  import { Checkbox } from '$lib/components/ui/checkbox'
  import { Label } from '$lib/components/ui/label'
  import native from '$lib/modules/native'
  import { click } from '$lib/modules/navigate'

  let checked = false
</script>

<Logo class='w-52 h-52 object-contain mb-14' />
<div class='font-bold text-5xl'>Welcome to Hayase</div>
<div class='text-muted-foreground pt-6'>Let's set up your perfect streaming enviorment.</div>
<div class='flex items-center space-x-2 pt-12'>
  <Checkbox id='terms' bind:checked />
  <Label for='terms' class='text-md font-medium leading-none text-muted-foreground'>
    I agree to the <a use:click={() => native.openURL(`${WEB_URL}/terms`)} class='text-primary underline'>Terms of Service</a> and <a use:click={() => native.openURL(`${WEB_URL}/terms`)} class='text-primary underline'>Privacy Policy</a>
  </Label>
</div>
<Button class='mt-8 text-lg font-bold' disabled={!checked} size='lg' href={checked ? './storage' : undefined}>Start Setup</Button>
