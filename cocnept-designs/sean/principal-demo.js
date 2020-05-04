function pause (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function bindMethods (instance, methods) {
  for (const methodName of methods) {
    instance[methodName] = instance[methodName].bind(instance)
  }
}

class PrincipalDemo {
  constructor () {
    bindMethods(this, [
      '_onKeyDown'
    ])

    this._initElems()
  }

  _initElems () {
    const thumbnail = document.createElement('img')
    thumbnail.className = 'demo-thumbnail'

    const spoken = document.createElement('span')
    spoken.className = 'demo-spoken'

    const toSpeak = document.createElement('span')
    toSpeak.className = 'demo-to-speak'

    const ok = document.createElement('button')
    ok.className = 'demo-ok'
    ok.textContent = 'OK'

    const dialogue = document.createElement('p')
    dialogue.className = 'demo-dialogue'
    dialogue.appendChild(spoken)
    dialogue.appendChild(toSpeak)
    dialogue.appendChild(ok)

    const wrapper = document.createElement('div')
    wrapper.className = 'demo-wrapper'
    wrapper.appendChild(thumbnail)
    wrapper.appendChild(dialogue)

    this.elems = {
      thumbnail,
      spoken,
      toSpeak,
      dialogue,
      ok,
      wrapper
    }
  }

  setThumbnail (url, colour) {
    this.elems.thumbnail.src = url
    if (colour !== undefined) {
      this.elems.thumbnail.style.backgroundColor = colour
    }
    return this
  }

  addTo (parent) {
    parent.appendChild(this.elems.wrapper)
    return this
  }

  removeFromParent () {
    this.elems.wrapper.remove()
    return this
  }

  async _animateSpeak (text, delay = 20) {
    const { spoken, toSpeak } = this.elems
    for (let i = 0; i < text.length; i++) {
      if (this.skipDialog) break

      spoken.textContent = text.slice(0, i)
      toSpeak.textContent = text.slice(i)
      await pause(delay)
    }
    spoken.textContent = text
    toSpeak.textContent = ''
  }

  _onKeyDown (e) {
    if (e.key === 'Enter') {
      this.skipDialog = true
    }
  }

  async start (dialogueData) {
    const {
      dialogue: dialogueText,
      ok
    } = this.elems

    document.addEventListener('keydown', this._onKeyDown)

    for (const { say, select } of dialogueData) {
      ok.classList.add('demo-hide')

      this.skipDialog = false
      await this._animateSpeak(say + '\n')

      ok.classList.remove('demo-hide')
      ok.focus()
      // TODO: await ok click
      await pause(1000)
    }

    document.removeEventListener('keydown', this._onKeyDown)

    return this
  }
}
