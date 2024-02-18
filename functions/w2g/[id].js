// this is a bit scuffed, but these are cf pages redirect functions

/** @type {PagesFunction} */
export function onRequest ({ params }) {
  try {
    const id = params.id
    const html = /* html */`
<!DOCTYPE html>
<html style=background:#000>
  <head>
    <meta http-equiv=refresh content="5; url=https://miru.watch">
    <meta property="og:title" content="Watch Together">
    <meta property="og:description" content="Stream anime torrents, real-time with no waiting for downloads">
    <meta property="og:site_name" content="Miru">
    <meta property="og:image" content=https://miru.watch/app_original.png>
    <meta property="og:url" content=miru://w2g/${id}>
    <meta data-vmid="twitter:card" name="twitter:card" content="summary_large_image">
    <meta name="theme-color" content="#17191C">
  </head>
  <body>
    <iframe src=miru://w2g/${id} style=border:none></iframe>Redirecting...
  </body>
</html>`

    return new Response(html, {
      headers: {
        'content-type': 'text/html;charset=UTF-8'
      }
    })
  } catch (e) {
    return Response.redirect('https://miru.watch/')
  }
}
