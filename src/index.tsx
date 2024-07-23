import React from 'react'
import { useEffect, useMemo, useState } from 'react'

// Styles
import './index.css'

// Types
import { type PostItPropsType } from './types/types'

// Constants
import { ACTIONS_NAMES, ACTION_BUTTON_CLASS, ACTION_FIXED_CLASS, BENT_CORNER_CLASS, DEFAULT_PLACEHOLDER, INITIAL_HEIGHT_INPUT, INITIAL_WIDTH_INPUT, LATER_HEIGHT_INPUT, LATER_WIDTH_INPUT, LENGTH_LETTER_MODIFIER, PINNED_CLASS, POST_IT_ACTIONS_CLASS, POST_IT_ACTIONS_HOVER_CLASS, POST_IT_CLASS_NAME, POST_IT_DEFAULT_CLASS, POST_IT_TEXT_CLASS } from './constants/constants'

// Components
import IconAction from './components/icon-action'

export default function PostIt({ id, position, text = '', className = POST_IT_DEFAULT_CLASS, fill = 'yellow', color = 'black', opacity = 1, rounded = 0, hidden = false, font = [], postItListState, styleBentCorner, stylePinned, customPlaceholder = [], customDefaultText = '', action = ACTIONS_NAMES.none, actionFixed = false, disableEditPostIt = false, disableDeletePostIt = false, disableDragPostIt = false }: PostItPropsType): JSX.Element {
  const [postItList, setPostItList] = postItListState ?? [[], () => { }]
  const [currentText, setCurrentText] = useState(text ?? customDefaultText)
  const [sizes, setSizes] = useState({ width: INITIAL_WIDTH_INPUT, height: INITIAL_HEIGHT_INPUT })
  const [selectedId, setSelectedId] = useState('')
  const [startOffset, setStartOffset] = useState({ x: 0, y: 0 })
  const [lastAttributesPostIt, setLastAttributesPostIt] = useState({ text: '', width: 0, height: 0 })
  const [postItModes, setPostItModes] = useState({ isEditing: false, isDragging: false, isBlocked: false })
  const [currentAction, setCurrentAction] = useState<keyof typeof ACTIONS_NAMES>(action as keyof typeof ACTIONS_NAMES)
  const [currentPosition, setCurrentPosition] = useState(position ?? { x: 0, y: 0 })

  const defaultAction = useMemo(() => {
    if (ACTIONS_NAMES[action as keyof typeof ACTIONS_NAMES] === undefined && !Array.isArray(action)) return ACTIONS_NAMES.none
    else return action
  }, []) as string

  const randomPlaceholder = useMemo(() => {
    return Array.isArray(customPlaceholder) && customPlaceholder.length > 0
      ? customPlaceholder[Math.floor(Math.random() * customPlaceholder.length)]
      : typeof customPlaceholder === 'string' ? customPlaceholder : DEFAULT_PLACEHOLDER
  }, []) as string

  const [actionElement, actionFunction, actionClass, actionStyle] = useMemo(() => {
    if (!Array.isArray(action)) return [null, null, null, null]
    return [...action]
  }, [])

  const [fontSize, fontWeight, fontFamily] = useMemo(() => {
    if (!Array.isArray(font)) return ['', '', '']
    let [fontSize, fontWeight, fontFamily] = font as [string | number, string | number, string]
    if (typeof fontSize !== 'string') fontSize = ''
    if (typeof fontWeight !== 'string' && typeof fontWeight !== 'number') fontWeight = ''
    if (typeof fontFamily !== 'string') fontFamily = ''
    return [fontSize, fontWeight, fontFamily]
  }, [])

  useEffect(() => {
    const exitDraggingMode = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || selectedId == '') return
      setPostItModes({ ...postItModes, isDragging: false })
    }
    window.addEventListener('keydown', exitDraggingMode)
    return () => window.removeEventListener('keydown', exitDraggingMode)
  }, [postItList])

  const handleDoubleClick = (): void => {
    if (disableEditPostIt) return
    setPostItModes({ ...postItModes, isEditing: true })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    const target = e.target as HTMLDivElement
    if (!target.classList.contains(POST_IT_CLASS_NAME)) return
    const rect = target.getBoundingClientRect()
    const currentId = target.id
    setStartOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    if (e.ctrlKey) {
      if (disableDeletePostIt) return
      if (postItList.length === 0) {
        target.remove()
        return
      }
      const newPostItList = postItList.filter((postIt) => postIt.id !== currentId)
      setPostItList(newPostItList)
      setSelectedId('')
      return
    }
    if (disableDragPostIt) return
    setSelectedId(currentId)
    setPostItModes({ ...postItModes, isDragging: true })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (disableDragPostIt) return
    if (!postItModes.isDragging) return
    const x = e.clientX - startOffset.x
    const y = e.clientY - startOffset.y
    if (postItList.length === 0) {
      setCurrentPosition({ x, y })
      return
    }
    const newPostItList = postItList.map((postIt) => {
      if (postIt.id !== selectedId) return postIt
      return { ...postIt, position: { x, y } }
    })
    setPostItList(newPostItList)
  }

  const handleMouseUp = (): void => {
    if (disableDragPostIt) return
    setSelectedId('')
    setPostItModes({ ...postItModes, isDragging: false })
  }

  const handleType = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const currentLength = e.target.value.length
    if (currentLength > 200) return
    if (currentLength === 0) setSizes({ width: INITIAL_WIDTH_INPUT, height: INITIAL_HEIGHT_INPUT })
    else if (currentLength === 1) setSizes({ width: LATER_WIDTH_INPUT, height: INITIAL_HEIGHT_INPUT })

    if (currentLength > currentText.length) {
      currentLength % 10 === 0 && currentLength !== 0 && currentLength < LENGTH_LETTER_MODIFIER && setSizes({ ...sizes, width: sizes.width + LATER_WIDTH_INPUT })
      currentLength % LENGTH_LETTER_MODIFIER === 0 && setSizes({ ...sizes, height: sizes.height + LATER_HEIGHT_INPUT })
    } else {
      if ((currentLength + 1) % 10 === 0 && (currentLength + 1) !== 0 && (currentLength + 1) < LENGTH_LETTER_MODIFIER) setSizes({ ...sizes, width: sizes.width - LATER_WIDTH_INPUT })
      else if ((currentLength + 1) % LENGTH_LETTER_MODIFIER === 0) setSizes({ ...sizes, height: sizes.height - LATER_HEIGHT_INPUT })
    }
    setCurrentText(e.target.value)
  }

  const handleKeyTextArea = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    const target = e.target as HTMLTextAreaElement
    const newText = target.value
    const currentId = target.id
    let newPostItList
    if (e.key === 'Enter') {
      if (newText.trim() === '') return
      newPostItList = postItList.map((postIt) => {
        if (postIt.id !== currentId) return postIt
        return { ...postIt, text: newText }
      })
      setPostItList(newPostItList)
      setPostItModes({ ...postItModes, isEditing: false })
      setLastAttributesPostIt({ text: newText, width: sizes.width, height: sizes.height })
    }
    if (e.key === 'Escape') {
      if (lastAttributesPostIt.text !== '') {
        newPostItList = postItList.map((postIt) => {
          if (postIt.id !== currentId) return postIt
          return { ...postIt, text: lastAttributesPostIt.text }
        })
        setPostItModes({ ...postItModes, isEditing: false })
      } else {
        newPostItList = postItList.filter((postIt) => postIt.id !== currentId)
      }
      setPostItList(newPostItList)
      setCurrentText(lastAttributesPostIt.text)
      setSizes({ width: lastAttributesPostIt.width, height: lastAttributesPostIt.height })
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>): void => {
    const target = e.target as HTMLTextAreaElement
    const textLength = target.value.length
    target.setSelectionRange(textLength, textLength)
  }

  const handleAction = (e: React.MouseEvent<HTMLButtonElement>): void => {
    if (action === ACTIONS_NAMES.copy) {
      const target = e.target as HTMLButtonElement
      const text = target.closest(`.${POST_IT_CLASS_NAME}`)?.querySelector(`.${POST_IT_TEXT_CLASS}`)?.textContent as string
      navigator.clipboard.writeText(text)
      setCurrentAction(ACTIONS_NAMES.copied)
      setTimeout(() => setCurrentAction(ACTIONS_NAMES.copy), 2000)
    }
    else if (action === ACTIONS_NAMES.delete) {
      const target = e.target as HTMLButtonElement
      const postItTarget = target.closest(`.${POST_IT_CLASS_NAME}`)
      if (postItList.length === 0) {
        postItTarget?.remove()
        return
      }
      const currentId = postItTarget?.id as string
      const newPostItList = postItList.filter((postIt) => postIt.id !== currentId)
      setPostItList(newPostItList)
      setSelectedId('')
    } else if (action === ACTIONS_NAMES.block) {
      setPostItModes({ ...postItModes, isBlocked: !postItModes.isBlocked })
      setCurrentAction(postItModes.isBlocked ? ACTIONS_NAMES.block : ACTIONS_NAMES.blocked)
    }
  }

  return (
    <>
      {
        text &&
          !postItModes.isEditing
          ? <div onDoubleClick={handleDoubleClick} onMouseDown={!postItModes.isBlocked ? handleMouseDown : () => { }} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} id={id}
            className={`${POST_IT_CLASS_NAME} ${className}${postItModes.isDragging ? ' is-dragging ' : ''}${styleBentCorner ? ` ${BENT_CORNER_CLASS}` : ''}${stylePinned ? ` ${PINNED_CLASS}` : ''}${ACTIONS_NAMES[action as keyof typeof ACTIONS_NAMES] && defaultAction !== ACTIONS_NAMES.none ? ` ${POST_IT_ACTIONS_CLASS}` : ''}${!actionFixed && actionClass == null ? ` ${POST_IT_ACTIONS_HOVER_CLASS}` : ''}`}
            style={{ position: 'absolute', top: postItList.length > 0 ? position.y : currentPosition.y, left: postItList.length > 0 ? position.x : currentPosition.x, backgroundColor: fill, color, opacity: opacity !== 1 ? opacity : '', borderRadius: rounded > 0 ? rounded : '', display: hidden ? 'none' : '', fontSize, fontWeight, fontFamily }}>
            <span className={POST_IT_TEXT_CLASS}>{currentText}</span>
            {
              defaultAction !== ACTIONS_NAMES.none &&
              <button className={`${actionClass != null ? actionClass : ACTION_BUTTON_CLASS}${actionFixed ? ` ${ACTION_FIXED_CLASS}` : ''}`} onClick={actionFunction ?? handleAction} style={actionStyle ?? { background: fill }}>
                {
                  actionElement
                    ? actionElement
                    : <IconAction action={currentAction} />
                }
              </button>
            }
          </div>
          : <textarea onChange={handleType} onFocus={handleFocus} onKeyDown={handleKeyTextArea} id={id}
            className={`${POST_IT_CLASS_NAME} ${className} ${postItModes.isDragging ? ' is-dragging' : ''}`}
            style={{ position: 'absolute', top: postItList.length > 0 ? position.y : currentPosition.y, left: postItList.length > 0 ? position.x : currentPosition.x, backgroundColor: fill, color, borderRadius: rounded > 0 ? rounded : '', width: `${sizes.width}px`, height: `${sizes.height}px` }} placeholder={randomPlaceholder} value={currentText} autoFocus />
      }
    </>
  )
}