<script lang='ts'>
  import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table'
  import { addSortBy } from 'svelte-headless-table/plugins'

  import Columnheader from '../columnheader.svelte'

  import { CountryCell, FlagsCell, IpCell, ProgressCell, SpeedCell } from './cells'

  import * as Table from '$lib/components/ui/table'
  import { server } from '$lib/modules/torrent'
  import { cn, eta, fastPrettyBytes } from '$lib/utils'

  const table = createTable(server.peers, {
    sort: addSortBy({ toggleOrder: ['asc', 'desc'] })
  })

  const columns = table.createColumns([
    table.column({
      accessor: 'ip',
      header: 'IP Address',
      id: 'ip',
      cell: ({ value, row }) => {
        // @ts-expect-error bad typedefs
        return createRender(IpCell, { ip: value, seeder: row.original.seeder })
      }
    }),
    table.column({
      accessor: 'client',
      header: 'Client',
      id: 'client',
      // TODO: this needs to be its own component
      cell: ({ value }) => value.slice(0, 21)
    }),
    table.column({
      accessor: 'progress',
      header: 'Progress',
      id: 'progress',
      cell: ({ value }) => createRender(ProgressCell, { value })
    }),
    table.column({
      accessor: row => row.speed.down,
      header: 'Download',
      id: 'down',
      cell: ({ value }) => createRender(SpeedCell, { value, type: 'download' })
    }),
    table.column({
      accessor: row => row.speed.up,
      header: 'Upload',
      id: 'up',
      cell: ({ value }) => createRender(SpeedCell, { value, type: 'upload' })
    }),
    table.column({
      accessor: row => row.size.downloaded,
      header: 'Downloaded',
      id: 'downloaded',
      cell: ({ value }) => fastPrettyBytes(value)
    }),
    table.column({
      accessor: row => row.size.uploaded,
      header: 'Uploaded',
      id: 'uploaded',
      cell: ({ value }) => fastPrettyBytes(value)
    }),
    table.column({
      accessor: 'time',
      header: 'Time',
      id: 'time',
      cell: ({ value }) => eta(value)
    }),
    table.column({
      accessor: 'ip',
      header: 'Country',
      id: 'country',
      cell: ({ value }) => createRender(CountryCell, { value })
    }),
    table.column({
      accessor: 'flags',
      header: 'Flags',
      id: 'flags',
      cell: ({ value }) => createRender(FlagsCell, { value })
    })
  ])

  const tableModel = table.createViewModel(columns)

  const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = tableModel
</script>

<div class='rounded-md border max-w-screen-xl h-full overflow-clip contain-strict'>
  <Table.Root {...$tableAttrs} class='max-h-full'>
    <Table.Header class='px-5'>
      {#each $headerRows as headerRow, i (i)}
        <Subscribe rowAttrs={headerRow.attrs()}>
          <Table.Row class='sticky top-0 bg-black z-[2]'>
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe
                attrs={cell.attrs()}
                props={cell.props()}
                let:attrs
                let:props>
                <Table.Head {...attrs} class={cn('px-0 first:pl-2 h-12 last:pr-2', cell.id === 'progress' && 'w-full')}>
                  {#if cell.id !== 'flags'}
                    <Columnheader {props}>
                      <Render of={cell.render()} />
                    </Columnheader>
                  {:else}
                    <div class='text-sm px-4'>
                      <Render of={cell.render()} />
                    </div>
                  {/if}
                </Table.Head>
              </Subscribe>
            {/each}
          </Table.Row>
        </Subscribe>
      {/each}
    </Table.Header>
    <Table.Body {...$tableBodyAttrs} class='max-h-full overflow-y-scroll'>
      {#if $pageRows.length}
        {#each $pageRows as row (row.id)}
          <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
            <Table.Row {...rowAttrs} class='h-12'>
              {#each row.cells as cell (cell.id)}
                <Subscribe attrs={cell.attrs()} let:attrs>
                  <Table.Cell {...attrs} class={cn('px-4 h-14 first:pl-6 last:pr-6 text-nowrap', cell.id === 'time' && 'text-muted-foreground')}>
                    <Render of={cell.render()} />
                  </Table.Cell>
                </Subscribe>
              {/each}
            </Table.Row>
          </Subscribe>
        {/each}
      {:else}
        <Table.Row>
          <Table.Cell colspan={columns.length} class='h-40 text-center'>
            No peers connected yet.
          </Table.Cell>
        </Table.Row>
      {/if}
    </Table.Body>
  </Table.Root>
</div>
