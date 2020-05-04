(() => {
  const params = new URL(location).searchParams
  if (params.get('principal-demo')) {
    document.head.appendChild(document.createElement('script')).src = '../sean/principal-demo.js'
    const link = document.head.appendChild(document.createElement('link'))
    link.href = '../sean/principal-demo.css'
    link.rel = 'stylesheet'
  }
})()
