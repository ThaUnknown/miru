<script lang='ts'>
  export let currentPage = 1
  export let count = 0
  export let perPage = 15
  export let siblingCount = 1

  let pages: Array<{
    page: number
    type: string
  }> = []

  $: {
    const edgeSize = 4 * siblingCount
    const totalPages = Math.ceil(count / perPage)
    const startPage = Math.max(1, totalPages - currentPage < edgeSize ? totalPages - edgeSize : currentPage - siblingCount)
    const endPage = Math.min(totalPages, currentPage < edgeSize ? 1 + edgeSize : currentPage + siblingCount)
    const paginationItems = []

    if (startPage > 1) {
      paginationItems.push({ page: 1, type: 'page' })
      if (startPage > 2) {
        paginationItems.push({ page: startPage - 1, type: 'ellipsis' })
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationItems.push({ page: i, type: 'page' })
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationItems.push({ page: endPage + 1, type: 'ellipsis' })
      }
      paginationItems.push({ page: totalPages, type: 'page' })
    }

    pages = paginationItems
  }

  $: range = {
    start: (currentPage - 1) * perPage,
    end: Math.min(currentPage * perPage, count)
  }

  $: hasNext = currentPage < Math.ceil(count / perPage)
  $: hasPrev = currentPage > 1

  function setPage (page: number) {
    currentPage = Math.min(Math.max(1, page), Math.ceil(count / perPage))
  }
</script>

<slot {pages} {range} {hasNext} {hasPrev} {setPage} />
