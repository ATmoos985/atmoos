async function renderDiagrams() {
  const blocks = [...document.querySelectorAll<HTMLElement>('.article-prose .astro-code')].filter(
    (block) =>
      block.querySelector('.language')?.textContent?.toLowerCase() === 'mermaid' ||
      block.querySelector('code.language-mermaid')
  )
  if (!blocks.length) return
  const { default: mermaid } = await import('mermaid')
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'neutral',
    fontFamily: 'system-ui, sans-serif'
  })
  for (const [index, block] of blocks.entries()) {
    if (block.dataset.diagramReady) continue
    block.dataset.diagramReady = 'true'
    const source = block.querySelector('code')?.textContent ?? ''
    try {
      const { svg } = await mermaid.render(`note-diagram-${index}`, source)
      const figure = document.createElement('figure')
      figure.className = 'note-diagram'
      figure.setAttribute('aria-label', '笔记流程图')
      figure.innerHTML = svg
      block.before(figure)
      const details = document.createElement('details')
      details.className = 'diagram-source'
      const summary = document.createElement('summary')
      summary.textContent = '查看流程图源码'
      block.before(details)
      details.append(summary, block)
    } catch {
      // Keep the full, readable source if a diagram cannot render.
      const message = document.createElement('p')
      message.textContent = '流程图暂时无法显示，下面保留了完整源码。'
      block.before(message)
    }
  }
}
void renderDiagrams()
document.addEventListener('astro:page-load', () => void renderDiagrams())
