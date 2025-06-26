import { writable } from 'simple-store-svelte'
import { get } from 'svelte/store'

import type Subtitles from './subtitles'
import type VideoDeband from 'video-deband'

import native from '$lib/modules/native'
import { settings } from '$lib/modules/settings'

export default class PictureInPicture {
  element = writable<HTMLVideoElement | null>(null)

  video: HTMLVideoElement | null = null
  subtitles: Subtitles | null = null
  deband: VideoDeband | null = null

  ctrl = new AbortController()

  constructor () {
    this._attachListeners(document.documentElement, false)

    window.addEventListener('visibilitychange', () => {
      if (get(settings).playerAutoPiP) this.pip(document.visibilityState !== 'visible' && !this.video?.paused)
    }, { signal: this.ctrl.signal })
  }

  _setElements (video: HTMLVideoElement, subtitles?: Subtitles, deband?: VideoDeband) {
    this.video = video
    this.subtitles = subtitles ?? null
    this.deband = deband ?? null
  }

  _attachListeners <T extends HTMLElement> (element: T, once = true): T {
    element.addEventListener('enterpictureinpicture', () => {
      this.element.set(document.pictureInPictureElement as HTMLVideoElement | null)
    }, { signal: this.ctrl.signal, once })
    element.addEventListener('leavepictureinpicture', () => {
      this.element.set(null)
      native.focus()
    }, { signal: this.ctrl.signal, once })
    return element
  }

  pip (enable = !this.element.value) {
    enable ? this._on() : this._off()
  }

  _off () {
    if (this.element.value) document.exitPictureInPicture()
  }

  async _on () {
    if (this.element.value) return
    if (!this.video) return
    if (!this.subtitles?.renderer) {
      if (!this.deband) return await this.video.requestPictureInPicture()
      return await this._attachListeners(await this.deband.getVideo()).requestPictureInPicture()
    }

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return

    const video = this._attachListeners(document.createElement('video'))
    video.srcObject = canvas.captureStream()
    video.muted = true
    video.play()

    const ctrl = new AbortController()

    let loop: number
    canvas.width = this.video.videoWidth
    canvas.height = this.video.videoHeight
    this.subtitles.renderer.resize(this.video.videoWidth, this.video.videoHeight)
    const renderFrame = (noskip?: number) => {
      if (noskip) this.video!.paused ? video.pause() : video.play()
      context.drawImage(this.deband?.canvas ?? this.video!, 0, 0)
      // @ts-expect-error internal call on canvas
      if (canvas.width && canvas.height && this.subtitles.renderer?._canvas) context.drawImage(this.subtitles.renderer._canvas, 0, 0, canvas.width, canvas.height)
      loop = this.video!.requestVideoFrameCallback(renderFrame)
    }
    ctrl.signal.addEventListener('abort', () => {
      this.subtitles?.renderer?.resize()
      this.video!.cancelVideoFrameCallback(loop)
      canvas.remove()
      video.remove()
    })

    this.ctrl.signal.addEventListener('abort', () => ctrl.abort(), { signal: ctrl.signal })
    video.addEventListener('leavepictureinpicture', () => ctrl.abort(), { signal: ctrl.signal })

    try {
      setTimeout(renderFrame, 10)
      await video.play()
      if (this.video.paused) video.pause()
      const window = await video.requestPictureInPicture()
      window.addEventListener('resize', () => {
        const { width, height } = window
        if (isNaN(width) || isNaN(height)) return
        if (!isFinite(width) || !isFinite(height)) return
        this.subtitles?.renderer?.resize(width, height)
      }, { signal: ctrl.signal })
    } catch (err) {
      const e = err as Error
      console.warn('Failed To Burn In Subtitles ' + e.stack)
      ctrl.abort()
    }
  }

  destroy () {
    this._off()
    this.ctrl.abort()
    this.element.set(null)
  }
}
