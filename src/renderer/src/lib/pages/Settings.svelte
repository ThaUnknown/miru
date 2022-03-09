<script context="module">
  const searchParams = new URLSearchParams(location.href)
  if (searchParams.get('access_token')) {
    localStorage.setItem('ALtoken', searchParams.get('access_token'))
  }
  export const alToken = localStorage.getItem('ALtoken') || null
</script>
