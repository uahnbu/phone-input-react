import { useEffect, useRef, useState } from 'react'

const SPACE = String.fromCharCode(0x2002)

export default function() {
  const input = useRef()
  const [prevCaretPos, setPrevCaretPos] = useState(0)

  const handleKeyPress = e => {
    const keyCode = e.key.charCodeAt(0)
    const isNumber =  keyCode >= 48 && keyCode <= 57
    const hasValidLength = e.target.value.length <= 13
    !(isNumber && hasValidLength) && e.preventDefault()
  }

  const handleBeforeInput = e => {
    const { selectionStart: start, selectionEnd } = e.target
    setPrevCaretPos(start === selectionEnd ? start : -1)
  }

  const handleInput = e => {
    let caretPos = e.target.selectionEnd
    let digits = e.target.value.replace(/\D/g, '')
    if (!digits.length) return e.target.value = ''

    // Jump over special character (.
    if (prevCaretPos === 0 && caretPos === 1) ++caretPos
    // Skip deleting backward special character (.
    if (prevCaretPos === 1 && caretPos === 0) ++caretPos
    // Skip deleting forward special character (.
    if (prevCaretPos === 0 && caretPos === 0) {
      digits = digits.slice(1)
      ++caretPos
    }

    // Skip deleting special characters ) and \s.
    if (prevCaretPos === 3 && caretPos === 4) caretPos = 6

    // Jump over special character \s.
    if ([5, 6].includes(caretPos) && caretPos - prevCaretPos === 1) {
      caretPos = 7
    }

    if ([4, 5].includes(caretPos)) {
      // Skip deleting backward special characters ) and \s.
      if (caretPos < prevCaretPos) {
        digits = digits.slice(0, 2) + digits.slice(3)
        caretPos = 3
      }
      // Skip deleting forward special characters ) and \s.
      if (caretPos === prevCaretPos) {
        digits = digits.slice(0, 3) + digits.slice(4)
        caretPos = 6
      }
    }

    // Skip deleting forward special character -.
    if (prevCaretPos === 9 && caretPos === 9) {
      digits = digits.slice(0, 6) + digits.slice(7)
    }
    // Skip deleting backward special character -.
    if (prevCaretPos === 10 && caretPos === 9) {
      digits = digits.slice(0, 5) + digits.slice(6)
      caretPos = 8
    }
    // Jump over special character -.
    if (caretPos === 10 && prevCaretPos < caretPos) ++caretPos
    
    const areaCode = digits.slice(0, 3).padEnd(3, SPACE)
    const prefix = digits.slice(3, 6)
    const suffix = digits.slice(6, 10)
    const link = digits.length < 7 ? '' : '-'
    e.target.value = `(${areaCode}) ${prefix}${link}${suffix}`
    setCaretPosition(e.target, caretPos)
  }

  useEffect(() => {
    if (!input.current) return
    input.current.addEventListener('keypress', handleKeyPress)
    input.current.addEventListener('beforeinput', handleBeforeInput)
    return function cleanup() {
      if (!input.current) return
      input.current.removeEventListener('keypress', handleKeyPress)
      input.current.removeEventListener('beforeinput', handleBeforeInput)
    }
  })

  return (
    <input
      type="tel"
      id="phone"
      placeholder="mobile number"
      onInput={handleInput}
      ref={input}
    />
  )
}

/**
 * Set caret position in the input element.
 * @param {HTMLInputElement} element Input element.
 * @param {number} caretPos The new caret position.
 */
function setCaretPosition(element, caretPos) {
  element.setSelectionRange(caretPos, caretPos)
}