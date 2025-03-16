<script lang='ts'>
  import { Button } from '$lib/components/ui/button'
  import { Checkbox } from '$lib/components/ui/checkbox'
  import { Label } from '$lib/components/ui/label'

  let checked = false
</script>

<img src='/logo_cropped.png' class='w-52 h-52 object-contain' alt='logo' />
<div class='font-bold text-5xl'>Welcome to Hayase</div>
<div class='text-muted-foreground pt-6'>Let's set up your perfect streaming enviorment.</div>
<div class='flex items-center space-x-2 pt-12'>
  <Checkbox id='terms' bind:checked />
  <Label for='terms' class='text-md font-medium leading-none text-muted-foreground'>
    I agree to the <a href='/terms' class='text-primary underline'>Terms of Service</a> and <a href='/privacy' class='text-primary underline'>Privacy Policy</a>
  </Label>
</div>
<Button class='mt-8 text-lg font-bold' disabled={!checked} size='lg' href={checked ? './storage' : undefined}>Start Setup</Button>
