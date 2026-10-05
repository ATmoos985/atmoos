function setupReaderSidebars() {
  const desktop = window.matchMedia('(min-width: 1101px)')
  document.querySelectorAll<HTMLDetailsElement>('[data-reader-sidebar]').forEach((panel) => {
    if (panel.dataset.ready) return
    panel.dataset.ready = 'true'
    const summary = panel.querySelector('summary')!
    const key = () =>
      `atmoos-reader-${panel.dataset.readerSidebar}-${desktop.matches ? 'desktop' : 'mobile'}`
    const updateLabel = () => {
      const label = `${panel.open ? '收起' : '展开'}${panel.dataset.label}`
      summary.setAttribute('aria-label', label)
      summary.title = label
    }
    const restore = () => {
      let state: string | null = null
      try {
        state = sessionStorage.getItem(key())
      } catch {
        /* Storage is optional. */
      }
      panel.open = state === null ? desktop.matches : state === 'open'
      updateLabel()
    }
    restore()
    panel.addEventListener('toggle', () => {
      updateLabel()
      try {
        sessionStorage.setItem(key(), panel.open ? 'open' : 'closed')
      } catch {
        /* Native disclosure still works. */
      }
    })
    desktop.addEventListener('change', restore)
  })

  const contents = document.querySelector<HTMLElement>('.contents-sidebar')
  if (!contents || contents.dataset.ready) return
  contents.dataset.ready = 'true'
  // A heading may be inside a folded Obsidian callout. Open its ancestors before jumping.
  const revealHeading = () => {
    let id: string
    try {
      id = decodeURIComponent(window.location.hash.slice(1))
    } catch {
      return
    }
    const heading = document.getElementById(id)
    if (!heading) return
    let parent = heading.parentElement
    let revealed = false
    while (parent) {
      if (parent instanceof HTMLDetailsElement && !parent.open) {
        parent.open = true
        revealed = true
      }
      parent = parent.parentElement
    }
    if (revealed) heading.scrollIntoView({ block: 'start' })
    contents.querySelectorAll('a').forEach((link) => {
      if (link.hash === window.location.hash) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
  }
  contents.addEventListener('click', (event) => {
    if ((event.target as Element).closest('a')) requestAnimationFrame(revealHeading)
  })
  window.addEventListener('hashchange', revealHeading)
  revealHeading()
}

setupReaderSidebars()
document.addEventListener('astro:page-load', setupReaderSidebars)
