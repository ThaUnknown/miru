<script lang='ts' context='module'>
  import { COMMITS_URL } from '$lib'
  import { Separator } from '$lib/components/ui/separator'

  const changeLog = (async () => {
    const res = await fetch(COMMITS_URL)
    const json = await res.json() as Array<{ sha: string, commit: { message: string, author: { date: string } } }>
    return json.map(({ sha, commit }) => ({ sha, date: commit.author.date, body: commit.message }))
  })()
</script>

<div class='w-full lg:max-w-4xl'>
  <div class='h-60 grid-cols-12 grid px-4 sm:px-0 items-center'>
    <div class='sm:col-span-3 col-span-full hidden sm:flex' />
    <div class='sm:col-span-9 col-span-full d-flex justify-content-center flex-column'>
      <div class='font-bold text-4xl mb-3'>Changelog</div>
      <div class='text-muted-foreground text-sm'>New updates and improvements to Hayase.</div>
    </div>
  </div>
  {#await changeLog}
    {#each Array(5) as _, i (i)}
      <Separator class='my-6' />
      <div class='grid-cols-12 grid py-4 px-4 sm:px-0 relative'>
        <div class='sm:col-span-3 col-span-full order-last sm:order-first'>
          <div class='bg-primary/5 animate-pulse rounded h-2 w-28' />
        </div>
        <div class='sm:col-span-9 col-span-full text-muted-foreground text-xs'>
          <div class='bg-primary/5 animate-pulse rounded h-4 w-48' />
          <div class='mt-3 bg-primary/5 animate-pulse rounded h-2 w-32' />
          <div class='mt-2 bg-primary/5 animate-pulse rounded h-2 w-28' />
        </div>
      </div>
    {/each}
  {:then changelog}
    {#each changelog as { sha, date, body } (sha)}
      <Separator class='my-6' />
      <div class='grid-cols-12 grid py-4 px-4 sm:px-0 relative' tabindex='0' role='button'>
        <div class='sm:col-span-3 col-span-full order-last sm:order-first'>
          <div class='sticky top-0 pt-3 text-xs'>
            {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        <div class='sm:col-span-9 col-span-full whitespace-pre-wrap text-muted-foreground text-md'>
          <div class='font-bold text-white text-lg mb-3'>{sha.slice(0, 6)}</div>{body.replaceAll('- ', '').trim()}
        </div>
      </div>
    {/each}
  {:catch e}
    <div class='h-60 px-4 sm:px-0 items-center'>
      <div class='col-span-full d-flex justify-content-center flex-column'>
        <div class='font-bold text-2xl mb-3'>Failed to load changelog</div>
        <div class='text-muted-foreground whitespace-pre-wrap text-xs'>{e.stack}</div>
      </div>
    </div>
  {/await}
</div>
