interface RenderItem {
  index: number
  run: () => void
  promise: Promise<string>
}

export default class Thumbnailer {
  video = document.createElement('video')
  canvas = new OffscreenCanvas(0, 0)
  ctx = this.canvas.getContext('2d')!
  thumbnails: string[] = []
  size = 800
  interval = 10
  currentTask: RenderItem | undefined
  nextTask: RenderItem | undefined
  src

  constructor (src?: string) {
    this.video.preload = 'none'
    this.video.playbackRate = 0
    this.video.muted = true
    this.video.crossOrigin = 'anonymous'
    if (src) {
      this.video.src = this.src = src
      this.video.load()
    }
  }

  setVideo (currentVideo: HTMLVideoElement) {
    currentVideo.addEventListener('timeupdate', () => {
      const index = Math.floor(currentVideo.currentTime / this.interval)
      const thumbnail = this.thumbnails[index]
      if (!thumbnail) this._paintThumbnail(currentVideo, index)
    })
  }

  _createTask (index: number): RenderItem {
    const { promise, resolve } = Promise.withResolvers<string>()

    const run = () => {
      this.video.requestVideoFrameCallback((_now, meta) => {
        resolve(this._paintThumbnail(this.video, index, meta.width, meta.height))
        this.video.currentTime = 0
        this.currentTask = undefined
        if (this.nextTask) {
          this.currentTask = this.nextTask
          this.nextTask = undefined
          this.currentTask.run()
        }
      })
      this.video.currentTime = index * this.interval
    }

    return { index, run, promise }
  }

  // get a task or create one to create a thumbnail
  // don't touch currently running task, overwrite next task
  _createThumbnail (index: number) {
    if (!this.currentTask) {
      this.currentTask = this._createTask(index)
      this.currentTask.run()
      return this.currentTask.promise
    }

    if (index === this.currentTask.index) return this.currentTask.promise

    if (!this.nextTask) {
      this.nextTask = this._createTask(index)
      return this.nextTask.promise
    }

    if (index === this.nextTask.index) return this.nextTask.promise

    this.nextTask = this._createTask(index)
    return this.nextTask.promise
  }

  // generate and store the thumbnail
  async _paintThumbnail (video: HTMLVideoElement, index: number, width = video.videoWidth, height = video.videoHeight) {
    this.canvas.width = this.size
    this.canvas.height = height / width * this.size
    this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height)
    this.thumbnails[index] = URL.createObjectURL(await this.canvas.convertToBlob({ type: 'image/webp', quality: 0.6 }))
    return this.thumbnails[index]
  }

  async getThumbnail (index: number): Promise<string> {
    const thumbnail = this.thumbnails[index]
    if (thumbnail) return thumbnail

    return await this._createThumbnail(index)
  }

  updateSource (src?: string) {
    if (src === this.src || !src) return
    for (const thumbnail of this.thumbnails) URL.revokeObjectURL(thumbnail)
    this.thumbnails = []
    this.currentTask = undefined
    this.nextTask = undefined
    this.video.src = this.src = src
    this.video.load()
  }

  destroy () {
    this.video.remove()
    this.thumbnails = []
  }
}
