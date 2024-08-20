export interface PostItPropsType {
  id: T
  position: { x: number, y: number }
  text: string
  className?: string
  fill?: string
  color?: string
  opacity?: number
  rounded?: number
  hidden?: boolean
  font?: [number | `${string}${'px' | 'em' | 'rem' | '%' | 'vh' | 'vw' | 'dvh' | 'dvw' | 'vmin' | 'vmax' | 'ch' | 'ex'}` | '', 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 'lighter' | 'normal' | 'bold' | 'bolder' | '', string] | '' | []
  postItListState?: [T[], React.Dispatch<React.SetStateAction<T[]>>]
  styleBentCorner?: boolean
  stylePinned?: boolean
  customPlaceholder?: string | string[]
  customDefaultText?: string
  action?: 'none' | 'copy' | 'delete' | 'block' | [JSX.Element, ((...args: T[]) => T), string | null, React.CSSProperties?]
  actionFixed?: boolean
  disableEditPostIt?: boolean
  disableDeletePostIt?: boolean
  disableDragPostIt?: boolean
}