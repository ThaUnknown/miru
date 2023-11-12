import 'browser-event-target-emitter'

export default new class extends EventTarget {
  constructor () {
    super()
    window.on('drop', this.handleTransfer.bind(this))
    window.on('paste', this.handleTransfer.bind(this))
    window.on('dragover', e => e.preventDefault())
  }

  async handleTransfer ({ dataTransfer, clipboardData }) {
    const promises = [...(dataTransfer || clipboardData).items].map(item => {
      const type = item.type
      return new Promise(resolve => item.kind === 'string' ? item.getAsString(text => resolve({ text, type })) : resolve(item.getAsFile()))
    })

    const items = await Promise.all(promises)

    const files = []
    const text = []
    for (const item of items) {
      if (item instanceof Blob) {
        files.push(item)
      } else {
        text.push(item)
      }
    }
    if (files.length) this.emit('files', files)
    if (text.length) this.emit('text', text)
  }
}()
