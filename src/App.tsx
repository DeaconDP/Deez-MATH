import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { DepthProvider } from './hooks/useDepth'
import { Home } from './pages/Home'
import { BreakthroughList } from './pages/BreakthroughList'
import { BreakthroughDetail } from './pages/BreakthroughDetail'
import { Applications } from './pages/Applications'

export default function App() {
  return (
    <DepthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="breakthroughs" element={<BreakthroughList />} />
            <Route path="breakthroughs/:id" element={<BreakthroughDetail />} />
            <Route path="applications" element={<Applications />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DepthProvider>
  )
}
