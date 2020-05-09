(async () => {
  const params = new URL(location).searchParams
  if (params.get('principal-demo')) {
    const link = document.head.appendChild(document.createElement('link'))
    link.href = new URL('./dialogue.css', import.meta.url)
    link.rel = 'stylesheet'

    const link2 = document.head.appendChild(document.createElement('link'))
    link2.href = new URL('./principal-demo.css', import.meta.url)
    link2.rel = 'stylesheet'

    const [{ Dialogue }, json] = await Promise.all([
      import('./dialogue.js'),
      fetch(new URL('./principal-demo.json', import.meta.url))
        .then(r => r.json())
    ])

    const demo = new Dialogue({
      measureHeight: false,
      wrapperClass: 'principal-demo'
    })
      .addTo(document.body)
      .setThumbnail(new URL('../../characters/sprites/images/munkler/sprite.png', import.meta.url), '#d1efea')

    await demo.start(json)

    demo.removeFromParent()
  }
})()
