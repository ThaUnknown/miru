<script>
  import { addToast } from '@/lib/Toasts.svelte'
  export let state
  export let peer
  export let cancel

  let values = []
  let code = ''
  let timeout = null

  function rej () {
    addToast({
      text: 'Could not establish connection, please try again.',
      title: 'Connection Timed Out',
      type: 'danger'
    })

    cancel()
  }

  peer.signalingPort.onmessage = ({ data }) => {
    console.log(data)
    const { description, candidate } = typeof data === 'string' ? JSON.parse(data) : data
    if (description) {
      if (description.type === 'answer') values = []
      values.push(description.sdp)
    } else if (candidate) {
      if (candidate.candidate.includes('srflx')) values.push(candidate.candidate)
    }
    if (values.length > 1) {
      code = btoa(JSON.stringify(values))
      clearTimeout(timeout)
    }
  }

  if (state === 'host') timeout = setTimeout(rej, 10000)

  $: value = (step?.mode === 'copy' && code) || null

  function handleInput ({ target }) {
    let val = null
    try {
      val = JSON.parse(atob(target.value))
    } catch (e) {
      addToast({
        text: 'The provided invite code was invalid, try copying it again?',
        title: 'Invalid Invite Code',
        type: 'danger'
      })
    }
    if (!val) return
    const [description, ...candidates] = val

    if (state === 'guest') timeout = setTimeout(rej, 10000)

    peer.signalingPort.postMessage({
      description: {
        type: state === 'host' ? 'answer' : 'offer',
        sdp: description
      }
    })
    for (const candidate of candidates) {
      peer.signalingPort.postMessage({
        candidate: {
          candidate,
          sdpMid: '0',
          sdpMLineIndex: 0
        }
      })
    }
    value = null
    index = index + 1
  }

  function copyData () {
    navigator.clipboard.writeText(value)
    index = index + 1
  }

  let index = 0

  const map = {
    guest: [
      {
        title: 'Paste Invite Code',
        description: 'Paste the one time invite code sent to you by the lobby host.',
        mode: 'paste'
      },
      {
        title: 'Copy Invite Confirmation',
        description: 'Send the host this code, which required to request a connection.',
        mode: 'copy'
      }
    ],
    host: [
      {
        title: 'Copy Invite Code',
        description: 'Copy the one time invite code, and send it to the person you wish to invite.',
        mode: 'copy'
      },
      {
        title: 'Paste Invite Confirmation',
        description: 'Paste the code sent to you by the user which wants to join your lobby.',
        mode: 'paste'
      }
    ]
  }

  $: step = map[state]?.[index]
</script>

<div class="h-full d-flex flex-column justify-content-center mb-20 pb-20 root container">
  {#if step && (value || step.mode === 'paste')}
    <h1 class="font-weight-bold">
      {step.title}
    </h1>
    <p class="font-size-18 mt-0">
      {step.description}
    </p>
    <textarea disabled={step.mode === 'copy'} on:input={handleInput} bind:value class="form-control h-300 w-full mb-15" />
    {#if step.mode === 'copy' && value}
      <button class="btn btn-primary mt-5" type="button" on:click={copyData} disabled={!value}>Copy</button>
    {/if}
  {:else}
    <h1 class="font-weight-bold">Connecting...</h1>
  {/if}
  <button class="btn btn-danger mt-5" type="button" on:click={cancel}>Cancel</button>
</div>
