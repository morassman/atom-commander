interface EtchElement<T extends string, P = any> {
  tag: T
  props: P
  children: any[]
  ambiguous: any[]
}

type EtchCreateElement<T extends string, P> = (props: P, ...children: any[]) => EtchElement<T, P>

interface EtchDOM {
  <T extends string, P>(tag: T, props: P, ...children: any[]): EtchElement<T, P>
  a: EtchCreateElement<'a', JSX.IntrinsicElements['a']>
  abbr: EtchCreateElement<'abbr', JSX.IntrinsicElements['abbr']>
  address: EtchCreateElement<'address', JSX.IntrinsicElements['address']>
  article: EtchCreateElement<'article', JSX.IntrinsicElements['article']>
  aside: EtchCreateElement<'aside', JSX.IntrinsicElements['aside']>
  audio: EtchCreateElement<'audio', JSX.IntrinsicElements['audio']>
  b: EtchCreateElement<'b', JSX.IntrinsicElements['b']>
  bdi: EtchCreateElement<'bdi', JSX.IntrinsicElements['bdi']>
  bdo: EtchCreateElement<'bdo', JSX.IntrinsicElements['bdo']>
  blockquote: EtchCreateElement<'blockquote', JSX.IntrinsicElements['blockquote']>
  body: EtchCreateElement<'body', JSX.IntrinsicElements['body']>
  button: EtchCreateElement<'button', JSX.IntrinsicElements['button']>
  canvas: EtchCreateElement<'canvas', JSX.IntrinsicElements['canvas']>
  caption: EtchCreateElement<'caption', JSX.IntrinsicElements['caption']>
  cite: EtchCreateElement<'cite', JSX.IntrinsicElements['cite']>
  code: EtchCreateElement<'code', JSX.IntrinsicElements['code']>
  colgroup: EtchCreateElement<'colgroup', JSX.IntrinsicElements['colgroup']>
  datalist: EtchCreateElement<'datalist', JSX.IntrinsicElements['datalist']>
  dd: EtchCreateElement<'dd', JSX.IntrinsicElements['dd']>
  del: EtchCreateElement<'del', JSX.IntrinsicElements['del']>
  details: EtchCreateElement<'details', JSX.IntrinsicElements['details']>
  dfn: EtchCreateElement<'dfn', JSX.IntrinsicElements['dfn']>
  dialog: EtchCreateElement<'dialog', JSX.IntrinsicElements['dialog']>
  div: EtchCreateElement<'div', JSX.IntrinsicElements['div']>
  dl: EtchCreateElement<'dl', JSX.IntrinsicElements['dl']>
  dt: EtchCreateElement<'dt', JSX.IntrinsicElements['dt']>
  em: EtchCreateElement<'em', JSX.IntrinsicElements['em']>
  fieldset: EtchCreateElement<'fieldset', JSX.IntrinsicElements['fieldset']>
  figcaption: EtchCreateElement<'figcaption', JSX.IntrinsicElements['figcaption']>
  figure: EtchCreateElement<'figure', JSX.IntrinsicElements['figure']>
  footer: EtchCreateElement<'footer', JSX.IntrinsicElements['footer']>
  form: EtchCreateElement<'form', JSX.IntrinsicElements['form']>
  h1: EtchCreateElement<'h1', JSX.IntrinsicElements['h1']>
  h2: EtchCreateElement<'h2', JSX.IntrinsicElements['h2']>
  h3: EtchCreateElement<'h3', JSX.IntrinsicElements['h3']>
  h4: EtchCreateElement<'h4', JSX.IntrinsicElements['h4']>
  h5: EtchCreateElement<'h5', JSX.IntrinsicElements['h5']>
  h6: EtchCreateElement<'h6', JSX.IntrinsicElements['h6']>
  head: EtchCreateElement<'head', JSX.IntrinsicElements['head']>
  header: EtchCreateElement<'header', JSX.IntrinsicElements['header']>
  html: EtchCreateElement<'html', JSX.IntrinsicElements['html']>
  i: EtchCreateElement<'i', JSX.IntrinsicElements['i']>
  iframe: EtchCreateElement<'iframe', JSX.IntrinsicElements['iframe']>
  ins: EtchCreateElement<'ins', JSX.IntrinsicElements['ins']>
  kbd: EtchCreateElement<'kbd', JSX.IntrinsicElements['kbd']>
  label: EtchCreateElement<'label', JSX.IntrinsicElements['label']>
  legend: EtchCreateElement<'legend', JSX.IntrinsicElements['legend']>
  li: EtchCreateElement<'li', JSX.IntrinsicElements['li']>
  main: EtchCreateElement<'main', JSX.IntrinsicElements['main']>
  map: EtchCreateElement<'map', JSX.IntrinsicElements['map']>
  mark: EtchCreateElement<'mark', JSX.IntrinsicElements['mark']>
  menu: EtchCreateElement<'menu', JSX.IntrinsicElements['menu']>
  meter: EtchCreateElement<'meter', JSX.IntrinsicElements['meter']>
  nav: EtchCreateElement<'nav', JSX.IntrinsicElements['nav']>
  noscript: EtchCreateElement<'noscript', JSX.IntrinsicElements['noscript']>
  object: EtchCreateElement<'object', JSX.IntrinsicElements['object']>
  ol: EtchCreateElement<'ol', JSX.IntrinsicElements['ol']>
  optgroup: EtchCreateElement<'optgroup', JSX.IntrinsicElements['optgroup']>
  option: EtchCreateElement<'option', JSX.IntrinsicElements['option']>
  output: EtchCreateElement<'output', JSX.IntrinsicElements['output']>
  p: EtchCreateElement<'p', JSX.IntrinsicElements['p']>
  pre: EtchCreateElement<'pre', JSX.IntrinsicElements['pre']>
  progress: EtchCreateElement<'progress', JSX.IntrinsicElements['progress']>
  q: EtchCreateElement<'q', JSX.IntrinsicElements['q']>
  rp: EtchCreateElement<'rp', JSX.IntrinsicElements['rp']>
  rt: EtchCreateElement<'rt', JSX.IntrinsicElements['rt']>
  ruby: EtchCreateElement<'ruby', JSX.IntrinsicElements['ruby']>
  s: EtchCreateElement<'s', JSX.IntrinsicElements['s']>
  samp: EtchCreateElement<'samp', JSX.IntrinsicElements['samp']>
  script: EtchCreateElement<'script', JSX.IntrinsicElements['script']>
  section: EtchCreateElement<'section', JSX.IntrinsicElements['section']>
  select: EtchCreateElement<'select', JSX.IntrinsicElements['select']>
  small: EtchCreateElement<'small', JSX.IntrinsicElements['small']>
  span: EtchCreateElement<'span', JSX.IntrinsicElements['span']>
  strong: EtchCreateElement<'strong', JSX.IntrinsicElements['strong']>
  style: EtchCreateElement<'style', JSX.IntrinsicElements['style']>
  sub: EtchCreateElement<'sub', JSX.IntrinsicElements['sub']>
  summary: EtchCreateElement<'summary', JSX.IntrinsicElements['summary']>
  sup: EtchCreateElement<'sup', JSX.IntrinsicElements['sup']>
  table: EtchCreateElement<'table', JSX.IntrinsicElements['table']>
  tbody: EtchCreateElement<'tbody', JSX.IntrinsicElements['tbody']>
  td: EtchCreateElement<'td', JSX.IntrinsicElements['td']>
  textarea: EtchCreateElement<'textarea', JSX.IntrinsicElements['textarea']>
  tfoot: EtchCreateElement<'tfoot', JSX.IntrinsicElements['tfoot']>
  th: EtchCreateElement<'th', JSX.IntrinsicElements['th']>
  thead: EtchCreateElement<'thead', JSX.IntrinsicElements['thead']>
  time: EtchCreateElement<'time', JSX.IntrinsicElements['time']>
  title: EtchCreateElement<'title', JSX.IntrinsicElements['title']>
  tr: EtchCreateElement<'tr', JSX.IntrinsicElements['tr']>
  u: EtchCreateElement<'u', JSX.IntrinsicElements['u']>
  ul: EtchCreateElement<'ul', JSX.IntrinsicElements['ul']>
  var: EtchCreateElement<'var', JSX.IntrinsicElements['var']>
  video: EtchCreateElement<'video', JSX.IntrinsicElements['video']>
  area: EtchCreateElement<'area', JSX.IntrinsicElements['area']>
  base: EtchCreateElement<'base', JSX.IntrinsicElements['base']>
  br: EtchCreateElement<'br', JSX.IntrinsicElements['br']>
  col: EtchCreateElement<'col', JSX.IntrinsicElements['col']>
  command: EtchCreateElement<'command', JSX.IntrinsicElements['command']>
  embed: EtchCreateElement<'embed', JSX.IntrinsicElements['embed']>
  hr: EtchCreateElement<'hr', JSX.IntrinsicElements['hr']>
  img: EtchCreateElement<'img', JSX.IntrinsicElements['img']>
  input: EtchCreateElement<'input', JSX.IntrinsicElements['input']>
  keygen: EtchCreateElement<'keygen', JSX.IntrinsicElements['keygen']>
  link: EtchCreateElement<'link', JSX.IntrinsicElements['link']>
  meta: EtchCreateElement<'meta', JSX.IntrinsicElements['meta']>
  param: EtchCreateElement<'param', JSX.IntrinsicElements['param']>
  source: EtchCreateElement<'source', JSX.IntrinsicElements['source']>
  track: EtchCreateElement<'track', JSX.IntrinsicElements['track']>
  wbr: EtchCreateElement<'wbr', JSX.IntrinsicElements['wbr']>
}

declare const dom: EtchDOM

export = dom

declare global {
  namespace JSX {
    interface Element extends EtchElement<any, any> { }
    interface IntrinsicElements {
      a: any
      abbr: any
      address: any
      article: any
      aside: any
      audio: any
      b: any
      bdi: any
      bdo: any
      blockquote: any
      body: any
      button: any
      canvas: any
      caption: any
      cite: any
      code: any
      colgroup: any
      datalist: any
      dd: any
      del: any
      details: any
      dfn: any
      dialog: any
      div: any
      dl: any
      dt: any
      em: any
      fieldset: any
      figcaption: any
      figure: any
      footer: any
      form: any
      h1: any
      h2: any
      h3: any
      h4: any
      h5: any
      h6: any
      head: any
      header: any
      html: any
      i: any
      iframe: any
      ins: any
      kbd: any
      label: any
      legend: any
      li: any
      main: any
      map: any
      mark: any
      menu: any
      meter: any
      nav: any
      noscript: any
      object: any
      ol: any
      optgroup: any
      option: any
      output: any
      p: any
      pre: any
      progress: any
      q: any
      rp: any
      rt: any
      ruby: any
      s: any
      samp: any
      script: any
      section: any
      select: any
      small: any
      span: any
      strong: any
      style: any
      sub: any
      summary: any
      sup: any
      table: any
      tbody: any
      td: any
      textarea: any
      tfoot: any
      th: any
      thead: any
      time: any
      title: any
      tr: any
      u: any
      ul: any
      var: any
      video: any
      area: any
      base: any
      br: any
      col: any
      command: any
      embed: any
      hr: any
      img: any
      input: any
      keygen: any
      link: any
      meta: any
      param: any
      source: any
      track: any
      wbr: any
    }
  }
}