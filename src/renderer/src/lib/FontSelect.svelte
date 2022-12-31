<script context='module'>
  import { writable } from 'simple-store-svelte'

  const fonts = writable({})
  let availableFonts = null
  async function loadFonts () {
    const _fonts = {}
    if (availableFonts) return
    const styleSheet = new CSSStyleSheet()
    try {
      availableFonts = await queryLocalFonts()
      for (const metadata of availableFonts) {
        if (!_fonts[metadata.family]) {
          _fonts[metadata.family] = []
        }
        _fonts[metadata.family].push(metadata)
      }
    } catch (err) {
      console.warn(err.name, err.message)
    }
    for (const fontFamily of Object.keys(_fonts)) {
      _fonts[fontFamily] = _fonts[fontFamily]
        .map(font => {
          // Replace font variation name "Arial" with "Arial Regular".
          const variationName = font.fullName
            .replace(fontFamily, '')
            .replaceAll('-', '')
            .trim()
          font.variationName = variationName || 'Regular'
          return font
        })
        .sort((a, b) => {
          // "Regular" always comes first, else use alphabetic order.
          if (a.variationName === 'Regular') {
            return -1
          } else if (b.variationName === 'Regular') {
            return 1
          } else if (a.variationName < b.variationName) {
            return -1
          } else if (a.variationName > b.variationName) {
            return 1
          }
          return 0
        })
      for (const font of _fonts[fontFamily]) {
        styleSheet.insertRule(`@font-face { font-family: '${font.postscriptName}'; src: local('${font.postscriptName}'), local('${font.fullName}'); }`)
      }
    }

    document.adoptedStyleSheets = [
      styleSheet,
      ...document.adoptedStyleSheets
    ]
    fonts.value = _fonts
  }
</script>

<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  function fontChange ({ target }) {
    const value = target.value
    const font = availableFonts.find(({ postscriptName }) => postscriptName === value)
    dispatch('change', font)
  }
  export let value
  loadFonts()
</script>

<!-- eslint-disable-next-line svelte/valid-compile -->
<select on:click|once={loadFonts} on:change={fontChange} {...$$restProps} style='font-family: {value}' bind:value>
  {#each Object.entries($fonts) as [fontName, fonts]}
    <optgroup label={fontName} style='font-family: {fontName}'>
      {#each fonts as fontData}
        <option style='font-family: {fontData.postscriptName}' value={fontData.postscriptName}>{fontData.fullName}</option>
      {/each}
    </optgroup>
  {/each}
</select>
