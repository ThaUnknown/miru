<script lang='ts'>
  import HardDrive from 'lucide-svelte/icons/hard-drive'
  import Network from 'lucide-svelte/icons/network'
  import Puzzle from 'lucide-svelte/icons/puzzle'

  import { Badge } from '$lib/components/ui/badge'

  export let step = 0

  const STEP_PERCENTAGE = [85, 50, 15]
</script>

<div class='px-6 mt-14 w-full lg:max-w-4xl pb-5'>
  <div class='w-full relative flex justify-around'>
    <div class='absolute top-[19px] left-0 w-full h-[10px] rounded-[10px] bg-secondary shrink-0 overflow-clip'>
      <div class='bg-white w-full h-full transform-gpu' style:--tw-translate-x='-{STEP_PERCENTAGE[step]}%' />
    </div>
    <div class='w-20 flex flex-col items-center z-10 shrink-0'>
      <Badge class='w-12 h-12 rounded-[50%] flex justify-center' href='../storage/'><HardDrive /></Badge>
      <div class='mt-3 font-bold'>
        Storage
      </div>
    </div>
    <div class='w-20 flex flex-col items-center z-10 shrink-0 {step > 0 ? 'text-white' : 'text-muted-foreground'}'>
      <Badge variant={step > 0 ? 'default' : 'secondary'} class='w-12 h-12 rounded-[50%] flex justify-center {step > 0 ? 'text-black' : 'text-muted-foreground'}' href={step > 1 ? '../network/' : undefined}><Network /></Badge>
      <div class='mt-3 font-bold'>
        Network
      </div>
    </div>
    <div class='w-20 flex flex-col items-center z-10 shrink-0 {step > 1 ? 'text-white' : 'text-muted-foreground'}'>
      <Badge variant={step > 1 ? 'default' : 'secondary'} class='w-12 h-12 rounded-[50%] flex justify-center {step > 1 ? 'text-black' : 'text-muted-foreground'}'><Puzzle /></Badge>
      <div class='mt-3 font-bold'>
        Extensions
      </div>
    </div>
  </div>
</div>
