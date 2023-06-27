import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event';
import PhoneInput from '../src/components/Phone-input'
import { describe, it } from 'vitest';

describe('PhoneInput', () => {
  const SP = String.fromCharCode(0x2002)
  const test1 = [
    [`(0${SP}${SP}) `,  2],
    [`(01${SP}) `    ,  3],
    ['(012) '        ,  6],
    ['(012) 3'       ,  7],
    ['(012) 34'      ,  8],
    ['(012) 345'     ,  9],
    ['(012) 345-6'   , 11],
    ['(012) 345-67'  , 12],
    ['(012) 345-678' , 13],
    ['(012) 345-6789', 14],
    ['(012) 345-6789', 14]
  ]

  it('forward filling', async () => {
    render(<PhoneInput />);
    const target = screen.getByRole('textbox')
    target.focus()
    for (let i = 0; i < test1.length; ++i) {
      const [after, caretAfter] = test1[i];
      await userEvent.keyboard('' + i)
      expect(target.value).toBe(after)
      expect(target.selectionStart).toBe(caretAfter)
    }
  })

  const test2 = [
    ['(123) 456-789', 0, '(234) 567-89', 1],
    ['(123) 456-789', 2, '(134) 567-89', 2],
    ['(123) 456-789', 3, '(124) 567-89', 3],
    ['(123) 456-789', 4, '(123) 567-89', 6],
    ['(123) 456-789', 5, '(123) 567-89', 6],
    ['(123) 456-789', 7, '(123) 467-89', 7],
    ['(123) 456-789', 9, '(123) 456-89', 9]
  ]

  runTest('forward deleting', test2, '[delete]')

  const test3 = [
    ['(123) 456-789',  1, '(123) 456-789', 1],
    ['(123) 456-789',  3, '(134) 567-89', 2],
    ['(123) 456-789',  5, '(124) 567-89', 3],
    ['(123) 456-789',  6, '(124) 567-89', 3],
    ['(123) 456-789',  7, '(123) 567-89', 6],
    ['(123) 456-789',  8, '(123) 467-89', 7],
    ['(123) 456-789', 10, '(123) 457-89', 8]
  ]

  runTest('backward deleting', test3, '[backspace]')

  const test4 = [
    [`(1${SP}${SP}) `, 0, `(91${SP}) `  ,  2],
    [`(1${SP}${SP}) `, 1, `(91${SP}) `  ,  2],
    ['(123) '        , 2, '(192) 3'     ,  3],
    ['(123) '        , 4, '(123) 9'     ,  7],
    ['(123) '        , 5, '(123) 9'     ,  7],
    ['(123) 456-7'   , 8, '(123) 459-67',  9],
    ['(123) 456-7'   , 9, '(123) 456-97', 11]
  ]

  runTest('replace filling', test4, '9')

  const test5 = [
    '(345) 678-9',
    '(456) 789',
    '(145) 678-9',
    '(124) 567-89',
    '(123) 567-89',
    '(123) 678-9',
    '(123) 789',
    '(123) 478-9',
    '(123) 458-9',
    '(123) 456-9'
  ]

  it('multiple deleting', async () => {
    render(<PhoneInput />)
    const target = screen.getByRole('textbox')
    for (let i = 0; i < test5.length; ++i) {
      target.value = '(123) 456-789'
      const pointer = { target, offset: i, keys: '[MouseLeft>]' }
      await userEvent.pointer([pointer, { offset: i + 3 }])
      await userEvent.keyboard('[backspace]')
      expect(target.value).toBe(test5[i])
    }
  })
})

/**
 * @typedef TestSet
 * @type {Array}
 * @property {string} before Input value before keypress.
 * @property {number} offset Caret position before keypress.
 * @property {string} after Input value after keypress.
 * @property {number} caretAfter Caret position after keypress.
 */

/**
 * Create and run a test set.
 * @param {string} title Name of the test.
 * @param {TestSet} testSet Array of test cases.
 * @param {string} key Key to simulate user press.
 */
function runTest(title, testSet, key) {
  it(title, async () => {
    render(<PhoneInput />)
    const target = screen.getByRole('textbox')
    for (const [before, offset, after, caretAfter] of testSet) {
      target.value = before
      await userEvent.pointer({ target, offset, keys: '[MouseLeft]' })
      await userEvent.keyboard(key)
      expect(target.value).toBe(after)
      expect(target.selectionStart).toBe(caretAfter)
    }
  })
}