export interface PrimitiveProps
  extends React.DetailedHTMLProps<
    React.AllHTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  $?: keyof JSX.IntrinsicElements
}

// from https://github.com/microsoft/TypeScript/issues/15449#issuecomment-385959396
declare global {
  namespace JSX {
    interface IntrinsicElements {
      grid: PrimitiveProps
      flex: PrimitiveProps
      row: PrimitiveProps
      column: PrimitiveProps

      frame: PrimitiveProps
      paper: PrimitiveProps
      space: PrimitiveProps
      txt: PrimitiveProps
    }
  }
}
