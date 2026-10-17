import { useSearchParams } from 'react-router-dom'
import { getCategory } from '../lib/data'
import BuildKit from '../components/BuildKit'
import { PageHeader } from '../components/ui'

// Build kit for custom subscriptions that aren't in the catalog.
export default function Build() {
  const [params] = useSearchParams()
  const name = (params.get('name') || 'my subscription').slice(0, 80)
  const cat = getCategory(params.get('category') || 'other')

  return (
    <div>
      <PageHeader eyebrow="🛠 Build kit" title={`Build your own ${name} replacement`}>
        Tip: before pasting the prompt, add 3–5 features you actually use in {name} under "Must-have features". The more specific you are, the better the
        AI builds.
      </PageHeader>
      <BuildKit prompt={{ inspiredBy: name, categoryName: cat.name }} wireframe={cat.wireframe} />
    </div>
  )
}
