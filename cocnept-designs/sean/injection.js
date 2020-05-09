(async () => {
  const params = new URL(location).searchParams
  if (params.get('principal-demo')) {
    const link = document.head.appendChild(document.createElement('link'))
    link.href = new URL('./principal-demo.css', import.meta.url)
    link.rel = 'stylesheet'

    const [{ PrincipalDemo }, json] = await Promise.all([
      import('./principal-demo.js'),
      fetch(new URL('./principal-demo.json', import.meta.url))
        .then(r => r.json())
    ])

    const demo = await new PrincipalDemo()
      .addTo(document.body)
      .setThumbnail(new URL('../../characters/sprites/images/munkler/sprite.png', import.meta.url), '#d1efea')
      .start(json)

    demo.removeFromParent()
  }
})()
