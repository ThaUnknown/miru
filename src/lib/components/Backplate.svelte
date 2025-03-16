<script lang='ts' context='module'>
  import { sleep } from '$lib/utils'

  let isSpinning = false
  const html = document.body

  globalThis.start = () => {
    if (!isSpinning) {
      isSpinning = true
      html.classList.add('fly')
      setTimeout(() => {
        html.classList.remove('fly')
        html.classList.add('spin')
      }, 800)
    }
  }

  globalThis.reset = async () => {
    for (const child of html.children) {
      const computedStyle = getComputedStyle(child).transform
      child.style.transform = computedStyle
    }
    html.classList.remove('spin')
    html.classList.add('show-backplate')
    await sleep(10)
    for (const child of html.children) {
      child.style.transform = ''
    }
    isSpinning = false
    await sleep(790)
    html.classList.remove('show-backplate')
  }
// TODO: finish :^)
// TODO: marqquee animation might not be performant
</script>

<div class='absolute w-full h-full overflow-hidden flip backface-hidden backplate bg-black flex-col justify-center pointer-events-none hidden'>
  {#each Array.from({ length: 5 }) as _, i (i)}
    <div class='flex flex-row w-full font-molot font-bold -rotate-12' style:padding-left='{(4 - i) * 600 - 1000}px'>
      {#each Array.from({ length: 3 }) as _, i (i)}
        <div class='animate-marquee mt-32 leading-[0.8]'>
          <div class='text-[24rem] bg-striped !bg-clip-text text-transparent animate-marquee-bg tracking-wide'>
            HAYASE.06&nbsp;
          </div>
          <div class='flex pl-1'>
            <div class='bg-striped-muted rounded py-2 px-3 mt-1 mb-[2.5px] mr-2 ml-1 text-black animate-marquee-bg flex items-center leading-[0.9]'>
              TORRENTING<br />MADE<br />SIMPLE
            </div>
            <div class='text-[5.44rem] bg-striped-muted !bg-clip-text text-transparent animate-marquee-bg tracking-wider'>
              MAGNET://SIMPLICITY TOPS EVERYTHING
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/each}
</div>
