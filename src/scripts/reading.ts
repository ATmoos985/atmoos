function setupReading() {
  const status = document.querySelector<HTMLElement>('[data-reader-status]')
  document.querySelectorAll<HTMLButtonElement>('.astro-code button.copy').forEach((button) => {
    if (button.dataset.ready) return
    button.dataset.ready = 'true'
    button.hidden = false
    button.addEventListener('click', async () => {
      button.disabled = true
      try {
        await navigator.clipboard.writeText(button.dataset.code ?? '')
        button.textContent = '已复制'
        if (status) status.textContent = '代码已复制到剪贴板。'
      } catch {
        button.textContent = '复制失败'
        if (status) status.textContent = '无法访问剪贴板，请选中代码后手动复制。'
      } finally {
        window.setTimeout(() => {
          button.textContent = '复制'
          button.disabled = false
        }, 2000)
      }
    })
  })

  document.querySelectorAll<HTMLButtonElement>('.collapse-toggle').forEach((button) => {
    if (button.dataset.ready) return
    button.dataset.ready = 'true'
    button.hidden = false
    const block = button.closest('.astro-code')
    block?.classList.add('collapsed')
    button.setAttribute('aria-expanded', 'false')
    button.addEventListener('click', () => {
      const collapsed = block?.classList.toggle('collapsed') ?? false
      button.setAttribute('aria-expanded', String(!collapsed))
      button.textContent = collapsed ? '展开全部代码' : '收起代码'
    })
  })

  // Wide tables and code can be scrolled with the keyboard as well as touch.
  document
    .querySelectorAll<HTMLElement>('.article-prose table, .article-prose pre, .katex-display')
    .forEach((element) => {
      element.tabIndex = 0
    })

  const dialog = document.querySelector<HTMLDialogElement>('.image-dialog')
  const preview = dialog?.querySelector<HTMLElement>('.image-preview')
  if (!dialog || !preview || dialog.dataset.ready) return
  dialog.dataset.ready = 'true'
  let trigger: HTMLImageElement | undefined
  const close = () => dialog.close()
  dialog.querySelector('button')?.addEventListener('click', close)
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close()
  })
  dialog.addEventListener('close', () => {
    preview.replaceChildren()
    document.documentElement.classList.remove('image-preview-open')
    trigger?.focus({ preventScroll: true })
  })

  document
    .querySelectorAll<HTMLImageElement>('.article-prose img, .article-hero')
    .forEach((image) => {
      if (image.closest('a')) return
      image.tabIndex = 0
      image.setAttribute('role', 'button')
      image.setAttribute('aria-haspopup', 'dialog')
      image.setAttribute('aria-label', `查看大图：${image.alt || '文章图片'}`)
      image.classList.add('can-zoom')
      const open = () => {
        trigger = image
        const fullImage = document.createElement('img')
        fullImage.src = image.currentSrc || image.src
        fullImage.alt = image.alt
        // SVGs may have only a viewBox; give the dialog a concrete image width.
        fullImage.style.width = `${Math.max(
          image.naturalWidth,
          image.width,
          Number(image.getAttribute('width')) || 0
        )}px`
        preview.replaceChildren(fullImage)
        if (image.alt) {
          const caption = document.createElement('p')
          caption.textContent = image.alt
          preview.append(caption)
        }
        dialog.showModal()
        document.documentElement.classList.add('image-preview-open')
      }
      image.addEventListener('click', open)
      image.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          open()
        }
      })
    })
}

setupReading()
document.addEventListener('astro:page-load', setupReading)
