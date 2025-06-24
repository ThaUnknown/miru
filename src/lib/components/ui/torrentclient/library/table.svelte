<script lang='ts'>
  import { writable } from 'svelte/store'
  import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table'
  import { addSortBy } from 'svelte-headless-table/plugins'

  import Columnheader from '../columnheader.svelte'

  import { NameCell, StatusCell } from './cells'

  import * as Table from '$lib/components/ui/table'
  import { cn, fastPrettyBytes } from '$lib/utils'

  interface LibraryEntry {
    series: string
    episode: string
    name: string
    files: number
    size: number
    completed: boolean
    downloaded: number
  }

  const data = writable<LibraryEntry[]>([])

  const table = createTable(data, {
    sort: addSortBy({ toggleOrder: ['asc', 'desc'] })
  })

  const columns = table.createColumns([
    table.column({ accessor: 'series', header: 'Series', id: 'series' }),
    table.column({ accessor: 'episode', header: 'Episode', id: 'episode' }),
    table.column({
      accessor: 'name',
      header: 'Torrent Name',
      id: 'name',
      cell: ({ value }) => createRender(NameCell, { value })
    }),
    table.column({ accessor: 'files', header: 'Files', id: 'files' }),
    table.column({
      accessor: 'size',
      header: 'Size',
      id: 'size',
      cell: ({ value }) => fastPrettyBytes(value)
    }),
    table.column({
      accessor: 'completed',
      header: 'Status',
      id: 'completed',
      cell: ({ value }) => createRender(StatusCell, { value })
    }),
    table.column({
      accessor: 'downloaded',
      header: 'Downloaded',
      id: 'downloaded',
      cell: ({ value }) => new Date(value).toLocaleDateString()
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
                <Table.Head {...attrs} class={cn('px-0 first:pl-2 h-12 last:pr-2', cell.id === 'name' && 'w-full')}>
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
                  <Table.Cell {...attrs} class={cn('px-4 h-14 first:pl-6 last:pr-6 text-nowrap', (cell.id === 'downloaded' || cell.id === 'episode') && 'text-muted-foreground')}>
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
            No torrents downloaded yet.
          </Table.Cell>
        </Table.Row>
      {/if}
    </Table.Body>
  </Table.Root>
</div>
