(async () => {
  const params = new URL(location).searchParams
  if (params.get('principal-demo')) {
    const link = document.head.appendChild(document.createElement('link'))
    link.href = '../sean/principal-demo.css'
    link.rel = 'stylesheet'

    const [{ PrincipalDemo }, json] = await Promise.all([
      import('./principal-demo.js'),
      fetch('../sean/principal-demo.json')
        .then(r => r.json())
    ])

    const demo = await new PrincipalDemo()
      .addTo(document.body)
      .setThumbnail('../../characters/sprites/images/munkler/sprite.png', '#a8afae')
      .start(json)

    demo.removeFromParent()
  }
})()
