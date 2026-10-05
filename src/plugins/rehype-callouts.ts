import type { Element, Root, Text } from 'hast'
import { visit } from 'unist-util-visit'

// Preserve Obsidian callout content, including inline formatting and nested blocks.
export default function rehypeCallouts() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'blockquote') return
      const paragraphIndex = node.children.findIndex(
        (child) => child.type === 'element' && child.tagName === 'p'
      )
      const paragraph = node.children[paragraphIndex] as Element | undefined
      const first = paragraph?.children[0] as Text | undefined
      if (first?.type !== 'text') return
      const match = first.value.match(/^\[!([\w-]+)\]([+-])?[ \t]*([^\n]*)(?:\n|$)/)
      if (!match) return
      const [, type, fold, title] = match
      const titleChildren: Element['children'] = [{ type: 'text', value: title || type }]
      const remainder = first.value.slice(match[0].length)
      // A formatted title may have more inline nodes before its first newline.
      const rest = paragraph!.children.slice(1)
      if (!remainder && !first.value.includes('\n')) {
        while (rest.length) {
          const child = rest.shift()!
          if (child.type === 'text' && child.value.includes('\n')) {
            const [tail, ...body] = child.value.split('\n')
            if (tail) titleChildren.push({ type: 'text', value: tail })
            if (body.join('\n')) rest.unshift({ type: 'text', value: body.join('\n') })
            break
          }
          titleChildren.push(child)
        }
      }
      paragraph!.children = [
        ...(remainder ? [{ type: 'text' as const, value: remainder }] : []),
        ...rest
      ]
      if (!paragraph!.children.length) node.children.splice(paragraphIndex, 1)
      node.tagName = fold ? 'details' : 'aside'
      node.properties = {
        className: ['note-callout'],
        dataCallout: type.toLowerCase(),
        ...(fold === '+' ? { open: true } : {})
      }
      node.children.unshift({
        type: 'element',
        tagName: fold ? 'summary' : 'div',
        properties: { className: ['callout-title'] },
        children: titleChildren
      })
    })
  }
}
