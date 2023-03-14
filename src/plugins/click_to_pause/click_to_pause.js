//Copyright 2014 Globo.com Player authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { Events, Playback, Styler, UICorePlugin } from '@clappr/core'

import clickToPauseHTML from './public/click-to-pause.html'
import clickToPauseStyles from './public/click-to-pause.scss'

import playIcon from '../../icons/01-play.svg'
import pauseIcon from '../../icons/02-pause.svg'

export default class ClickToPausePlugin extends UICorePlugin {
  get name() { return 'click_to_pause' }
  get supportedVersion() { return { min: CLAPPR_CORE_VERSION } }
  get config() { return this.container.options.clickToPauseConfig || {} }
  get container() { return this.core && this.core.activeContainer }
  get template() { return clickToPauseHTML }
  get attributes() {
    return {
      class: 'player-click-to-pause'
    }
  }

  bindEvents() {
    this.listenTo(this.core, Events.CORE_ACTIVE_CONTAINER_CHANGED, this.onContainerChange)
  }

  onContainerChange() {
    this.render()
    this.listenTo(this.container, Events.CONTAINER_SETTINGSUPDATE, this.settingsUpdate)
    this.listenTo(this.container, Events.CONTAINER_CLICK, this.onClick)
    this.listenTo(this.container, Events.CONTAINER_TAP, this.onTouch)
    this.listenTo(this.container, Events.CONTAINER_MEDIACONTROL_HIDE, this.hideIcon)
    this.listenTo(this.container, Events.CONTAINER_MEDIACONTROL_SHOW, this.showIcon)
    this.listenTo(this.container, Events.CONTAINER_PAUSE, this.showIcon)
    this.listenTo(this.container, Events.CONTAINER_PLAY, this.showIcon)
  }

  showIcon() {
    if (!this.pausable()) return
    if (!this.core.mediaControl.isVisible()) return

    if (this.container.isPlaying()) {
      this.$iconWrapper.data('pause', '')
      this.$iconWrapper.data('play', null)
    } else {
      this.$iconWrapper.data('play', '')
      this.$iconWrapper.data('pause', null)
    }
  }

  hideIcon() {
    if (!this.container.isPlaying()) return
    this.$iconWrapper.data('pause', null)
    this.$iconWrapper.data('play', null)
  }

  onClick() {
    if (!this.pausable()) return
    this.core.mediaControl.show()
    const onClickPayload = this.config.onClickPayload

    if (this.container.isPlaying())
      this.container.pause(onClickPayload)
    else
      this.container.play(onClickPayload)

  }

  onTouch() {
    if (this.core.mediaControl.isVisible())
      this.container.trigger(Events.CONTAINER_CLICK)
    else
      this.core.mediaControl.show()

  }

  pausable() {
    return (this.container.getPlaybackType() !== Playback.LIVE || this.container.isDvrEnabled())
  }

  settingsUpdate() {
    const pointerEnabled = this.pausable()

    if (pointerEnabled === this.pointerEnabled) return

    if (pointerEnabled) this.container.$el.addClass('pointer-enabled')
    else this.container.$el.removeClass('pointer-enabled')

    this.pointerEnabled = pointerEnabled
  }

  render() {
    if (!this.container) return
    this.$el.html(this.template)
    const style = Styler.getStyleFor(clickToPauseStyles)

    this.$iconWrapper = this.$el.find('.icon-wrapper')
    this.$playButton = this.$el.find('.play-button')
    this.$playButton.append(playIcon)
    this.$pauseButton = this.$el.find('.pause-button')
    this.$pauseButton.append(pauseIcon)

    this.$el.append(style)
    this.container.$el.append(this.$el)
  }
}
