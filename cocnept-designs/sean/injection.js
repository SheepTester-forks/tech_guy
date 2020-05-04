(() => {
  const params = new URL(location).searchParams
  if (params.get('principal-demo')) {
    const script = document.head.appendChild(document.createElement('script'))
    script.src = '../sean/principal-demo.js'
    const link = document.head.appendChild(document.createElement('link'))
    link.href = '../sean/principal-demo.css'
    link.rel = 'stylesheet'

    script.addEventListener('load', e => {
      fetch('../sean/principal-demo.json')
        .then(r => r.json())
        .then(async json => {
          const demo = new PrincipalDemo()
            .addTo(document.body)
          await demo.start(json)
          demo.removeFromParent()
        })
    })
  }
})()
