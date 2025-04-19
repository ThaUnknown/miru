<script lang='ts'>
  import * as Table from '$lib/components/ui/table'
  import { dragScroll } from '$lib/modules/navigate'
  import { server } from '$lib/modules/torrent'
  import { fastPrettyBits, fastPrettyBytes, eta as _eta } from '$lib/utils'

  const list = server.list
</script>

<div class='flex flex-col items-center w-full h-full overflow-y-auto px-5 my-10' use:dragScroll>
  <Table.Root>
    <Table.Header>
      <Table.Row class='[&>*]:p-4 [&>*]:font-bold'>
        <Table.Head>Name</Table.Head>
        <Table.Head class='w-[100px]'>Progress</Table.Head>
        <Table.Head class='w-[100px]'>Size</Table.Head>
        <Table.Head class='w-[100px]'>Done</Table.Head>
        <Table.Head class='w-[110px]'>Download</Table.Head>
        <Table.Head class='w-[110px]'>Upload</Table.Head>
        <Table.Head class='w-[110px]'>ETA</Table.Head>
        <Table.Head class='w-[100px]'>Seeders</Table.Head>
        <Table.Head class='w-[100px]'>Leechers</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each $list as { name, progress, size, down, up, eta, seeders, leechers, peers }, i (i)}
        <Table.Row class='[&>*]:p-4'>
          <Table.Cell>{name ?? '?'}</Table.Cell>
          <Table.Cell>{(progress * 100).toFixed(1)}%</Table.Cell>
          <Table.Cell>{fastPrettyBytes(size)}</Table.Cell>
          <Table.Cell>{fastPrettyBytes(size * progress)}</Table.Cell>
          <Table.Cell>{fastPrettyBits(down * 8)}/s</Table.Cell>
          <Table.Cell>{fastPrettyBits(up * 8)}/s</Table.Cell>
          <Table.Cell>{_eta(new Date(Date.now() + eta)) ?? 'Done'}</Table.Cell>
          <Table.Cell>{seeders}<span class='text-muted-foreground'>/{peers}</span></Table.Cell>
          <Table.Cell>{leechers}<span class='text-muted-foreground'>/{peers}</span></Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
