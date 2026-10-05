import LZString from 'lz-string'

const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

// The imported scenes contain rectangles, straight arrows and text only.
// Refuse unsupported elements so a later import never silently loses diagram content.
export function excalidrawSvg(markdown, title) {
  const match = markdown.match(/```(compressed-json|json)\s*([\s\S]*?)```/)
  if (!match) throw new Error(`Missing scene: ${title}`)
  const scene = JSON.parse(
    match[1] === 'json' ? match[2] : LZString.decompressFromBase64(match[2].replace(/\s/g, ''))
  )
  const elements = scene.elements.filter((element) => !element.isDeleted)
  for (const element of elements) {
    if (
      !['rectangle', 'arrow', 'text'].includes(element.type) ||
      element.angle ||
      (element.type === 'arrow' &&
        (element.startArrowhead || ![null, 'arrow'].includes(element.endArrowhead)))
    )
      throw new Error(`Unsupported diagram element: ${element.type} in ${title}`)
  }
  const left = Math.min(...elements.map((e) => e.x)) - 24
  const top = Math.min(...elements.map((e) => e.y)) - 24
  const width = Math.max(...elements.map((e) => e.x + e.width)) - left + 24
  const height = Math.max(...elements.map((e) => e.y + e.height)) - top + 24
  const shapes = elements
    .map((e, index) => {
      const stroke = escape(e.strokeColor)
      const common = `stroke="${stroke}" stroke-width="${e.strokeWidth}" opacity="${e.opacity / 100}"${e.strokeStyle === 'dashed' ? ' stroke-dasharray="8 6"' : ''}`
      if (e.type === 'rectangle')
        return `<rect x="${e.x}" y="${e.y}" width="${e.width}" height="${e.height}" rx="${e.roundness ? 10 : 0}" fill="${escape(e.backgroundColor)}" ${common}/>`
      if (e.type === 'arrow') {
        const points = e.points.map(([x, y]) => `${e.x + x},${e.y + y}`).join(' ')
        const marker = e.endArrowhead ? `marker-end="url(#arrow-${index})"` : ''
        return `<defs><marker id="arrow-${index}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="${stroke}" stroke-width="1.5"/></marker></defs><polyline points="${points}" fill="none" ${common} ${marker}/>`
      }
      const align = e.textAlign === 'center' ? 'middle' : e.textAlign === 'right' ? 'end' : 'start'
      const x = e.x + (align === 'middle' ? e.width / 2 : align === 'end' ? e.width : 0)
      const lines = e.text
        .split('\n')
        .map(
          (line, lineIndex) =>
            `<tspan x="${x}" y="${e.y + e.fontSize + lineIndex * e.fontSize * (e.lineHeight ?? 1.25)}">${escape(line)}</tspan>`
        )
        .join('')
      return `<text fill="${stroke}" opacity="${e.opacity / 100}" font-size="${e.fontSize}" text-anchor="${align}" font-family="system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif">${lines}</text>`
    })
    .join('\n')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(width)}" height="${Math.ceil(height)}" viewBox="${left} ${top} ${width} ${height}" role="img" aria-labelledby="title"><title id="title">${escape(title)}</title>\n${shapes}\n</svg>\n`
}
