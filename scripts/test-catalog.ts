import { getCatalog } from '../src/lib/catalog'

getCatalog()
  .then(({ products, categories, settings }) => {
    console.log(`📦 ${products.length} productos`)
    console.log(`🔥 ${products.filter((p) => p.isOffer).length} ofertas`)
    console.log('📁 Categorías:', categories)
    console.log('⚙️  Configuración:', settings)
    console.log('\nEjemplo con variantes:')
    console.log(JSON.stringify(products.find((p) => p.variants.length > 1), null, 2))
  })
  .catch((err) => console.error('❌', err.message))