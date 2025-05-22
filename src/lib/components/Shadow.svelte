<script lang='ts'>
  import dompurify from 'dompurify'
  import { marked } from 'marked'

  marked.setOptions({
    gfm: true,
    breaks: true,
    pedantic: false
  })

  export let html = ''
  let root: ShadowRoot | undefined

  const style = new CSSStyleSheet()

  style.replaceSync(/* css */`
  p {
    margin-block-start: .5em;
    margin-block-end: .5em;
  }
  img, video {
    max-width: 100%;
    -webkit-user-drag: none;
  }`)

  function sanitize (html: string) {
    return dompurify.sanitize(html, { ALLOWED_TAGS: ['a', 'b', 'blockquote', 'br', 'center', 'del', 'div', 'em', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 'code', 'span', 'strike', 'strong', 'ul'], ALLOWED_ATTR: ['align', 'height', 'href', 'src', 'target', 'width', 'rel'] })
  }

  // i mean holy shit anilist, could you have made it any harder on yourself
  function shadow (node: HTMLDivElement, html: string) {
    root ??= node.attachShadow({ mode: 'closed' })
    root.adoptedStyleSheets = [style]
    // eslint-disable-next-line no-useless-escape
    html = html.replace(/(http)(:([\/|.|\w|\s|-])*\.(?:jpg|.jpeg|gif|png|mp4|webm))/gi, '$1s$2')
      .replace(/img\s?(\d+%?)?\s?\((.[\S]+)\)/gi, "<img width='$1' src='$2'>")
      .replace(/(^|>| )@([A-Za-z0-9]+)/gm, "$1<a href='#'>@$2</a>")
      .replace(/youtube\s?\([^]*?([-_0-9A-Za-z]{10,15})[^]*?\)/gi, 'youtube ($1)')
      // eslint-disable-next-line no-useless-escape
      .replace(/webm\s?\(h?([A-Za-z0-9-._~:\/?#\[\]@!$&()*+,;=%]+)\)/gi, 'webmv(`$1`)')
      .replace(/~{3}([^]*?)~{3}/gm, '+++$1+++')
      .replace(/~!([^]*?)!~/gm, '<div rel="spoiler">$1</div>')
    html = sanitize(marked.parse(html, { async: false }))
      .replace(/\+{3}([^]*?)\+{3}/gm, '<center>$1</center>')
      // t = t.replace(/<div rel="spoiler">([\s\S]*?)<\/div>/gm, "<p><span onclick='showSpoiler(this)' class='markdown-spoiler'><i class='hide-spoiler el-icon-circle-close' onclick='hideSpoiler(this)'></i><span>$1</span></span></p>")
    // t = t.replace(/youtube\s?\(([-_0-9A-Za-z]{10,15})\)/gi, "<span class='youtube' id='$1' style='width: 500px; height: 200px; max-width: 100%;'><span class='play'></span></span>")
    // eslint-disable-next-line no-useless-escape
      .replace(/webmv\s?\(<code>([A-Za-z0-9-._~:\/?#\[\]@!$&()*+,;=%]+)<\/code>\)/gi, "<video muted loop controls><source src='h$1' type='video/webm'>Your browser does not support the video tag.</video>")
    // t = t.replace(/(?:<a href="https?:\/\/anilist.co\/(anime|manga)\/)([0-9]+).*?>(?:https?:\/\/anilist.co\/(?:anime|manga)\/[0-9]+).*?<\/a>/gm, '<span class="media-embed" data-media-type="$1" data-media-id="$2"></span>')

    root.innerHTML = html
  }

  let className: string | undefined | null
  export { className as class }
</script>

<div use:shadow={html} class={className} />
