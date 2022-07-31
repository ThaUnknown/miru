<script>
import { handleCode } from './WatchTogether.svelte'
export let state
export let peer
export let cancel

let values = []
let code = ''

peer.pc.addEventListener('signalingstatechange', () => {
  console.log(peer.pc.signalingState)
  if (peer.pc.signalingState === 'have-remote-offer') {
    value = null
    index = index + 1
  }
})

peer.signalingPort.onmessage = ({ data }) => {
  // console.log(data)
  const { description, candidate } = typeof data === 'string' ? JSON.parse(data) : data
  if (description) {
    if (description.type === 'answer') values = []
    values.push(description.sdp)
  } else if (candidate) {
    if (candidate.candidate.includes('srflx')) values.push(candidate.candidate)
  }
  if (values.length > 1) {
    code = btoa(JSON.stringify(values))
  }
}
$: value = (step?.mode === 'copy' && code) || null

function handleInput ({ target }) {
  handleCode(target.value)
  value = null
}

function copyData () {
  navigator.clipboard.writeText(`<miru://w2g/${state === 'host' ? 'invite' : 'join'}/${value}>`)
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

<div class='h-full d-flex flex-column justify-content-center mb-20 pb-20 root container'>
  {#if step && (value || step.mode === 'paste')}
    <h1 class='font-weight-bold'>
      {step.title}
    </h1>
    <p class='font-size-18 mt-0'>
      {step.description}
    </p>
    <textarea disabled={step.mode === 'copy'} on:input={handleInput} bind:value class='form-control h-300 w-full mb-15' />
    {#if step.mode === 'copy' && value}
      <button class='btn btn-primary mt-5' type='button' on:click={copyData} disabled={!value}>Copy</button>
    {/if}
  {:else}
    <h1 class='font-weight-bold'>Connecting...</h1>
  {/if}
  <button class='btn btn-danger mt-5' type='button' on:click={cancel}>Cancel</button>
</div>
