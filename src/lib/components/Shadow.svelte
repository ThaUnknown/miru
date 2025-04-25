<script lang='ts'>
  import dompurify from 'dompurify'
  export let html = ''
  let root: ShadowRoot | undefined

  const style = new CSSStyleSheet()

  style.replaceSync(/* css */`
  p {
    margin-block-start: .5em;
    margin-block-end: .5em;
  }
  img {
    max-width: 100%;
    -webkit-user-drag: none;
  }`)

  function shadow (node: HTMLDivElement, html: string) {
    root ??= node.attachShadow({ mode: 'closed' })
    root.adoptedStyleSheets = [style]
    root.innerHTML = dompurify.sanitize(html)
  }

  let className: string | undefined | null
  export { className as class }
</script>

<div use:shadow={html} class={className} />
