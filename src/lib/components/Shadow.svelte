<script lang='ts'>
  import dompurify from 'dompurify'
  export let html = ''
  let root: ShadowRoot | undefined

  function shadow (node: HTMLDivElement, html: string) {
    root ??= node.attachShadow({ mode: 'closed' })
    root.innerHTML = dompurify.sanitize(html)
  }

  let className: string | undefined | null
  export { className as class }
</script>

<div use:shadow={html} class={className} />
