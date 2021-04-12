interface EtchElement<T extends string, P = any> {
  tag: T
  props: P
  children: any[]
  ambiguous: any[]
}

type EtchCreateElement<T extends string, P> = (props: P, ...children: any[]) => EtchElement<T, P>

interface EtchDOM {
  <T extends string, P>(tag: T, props: P, ...children: any[]): EtchElement<T, P>
  div: EtchCreateElement<'div', JSX.IntrinsicElements['div']>
  input: EtchCreateElement<'input', JSX.IntrinsicElements['input']>
  span: EtchCreateElement<'span', JSX.IntrinsicElements['span']>
  table: EtchCreateElement<'table', JSX.IntrinsicElements['table']>
  tbody: EtchCreateElement<'tbody', JSX.IntrinsicElements['tbody']>
  thead: EtchCreateElement<'thead', JSX.IntrinsicElements['thead']>
  th: EtchCreateElement<'th', JSX.IntrinsicElements['th']>
  tr: EtchCreateElement<'tr', JSX.IntrinsicElements['tr']>
  td: EtchCreateElement<'td', JSX.IntrinsicElements['td']>
}

declare const dom: EtchDOM

export = dom

declare global {
  namespace JSX {
    interface Element extends EtchElement<any, any> {}
    interface IntrinsicElements {
      div: any
      input: any
      span: any
      table: any
      tbody: any
      thead: any
      th: any
      tr: any
      td: any
    }
  }
}