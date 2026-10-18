import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Picker from './pages/Picker'
import Results from './pages/Results'
import ToolDetail from './pages/ToolDetail'
import Build from './pages/Build'
import LocalAI from './pages/LocalAI'
import Contribute from './pages/Contribute'
import About from './pages/About'
import NotFound from './pages/NotFound'

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/start" element={<Picker />} />
        <Route path="/results" element={<Results />} />
        <Route path="/tool/:id" element={<ToolDetail />} />
        <Route path="/build" element={<Build />} />
        <Route path="/local-ai" element={<LocalAI />} />
        <Route path="/contribute" element={<Contribute />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
