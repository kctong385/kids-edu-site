import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { subjects } from './subjects/registry'
import Header from './components/layout/Header'
import Home from './pages/Home'
import SubjectHub from './pages/SubjectHub'

function GameLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontSize: 32 }}>
      ⏳
    </div>
  )
}

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: 'system-ui, sans-serif' }}>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:subject" element={<SubjectHub />} />
        {subjects.flatMap(subject =>
          subject.topics.map(topic => {
            const GameComponent = lazy(topic.component)
            return (
              <Route
                key={topic.id}
                path={topic.path}
                element={
                  <Suspense fallback={<GameLoader />}>
                    <GameComponent />
                  </Suspense>
                }
              />
            )
          })
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
