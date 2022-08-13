const P2PT = require('p2pt')

class P2PWorker extends P2PT {
  constructor (...args) {
    super(...args)

    onmessage = this.handleMessage.bind(this)
    this.start()
  }

  dispatch (type, data) {
    postMessage({ type, data })
  }

  handleMessage ({ data }) {
    switch (data.type) {
      case 'current': {
        break
      }
      case 'torrent': {
        break
      }
    }
  }
}

let client = null

onmessage = ({ data }) => {
  if (!client && data.type === 'settings') client = new P2PWorker(data.data)
  if (data.type === 'destroy') client?.predestroy()
}
