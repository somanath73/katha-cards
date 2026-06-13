import { useState } from 'react'
import Landing from './components/Landing'
import Deck from './components/Deck'
import { useProgress } from './hooks/useProgress'

export default function App() {
  const [category, setCategory] = useState(null)
  const progress = useProgress()

  return (
    <div className="app">
      <div className="bg-stars" aria-hidden="true" />
      {category ? (
        <Deck category={category} progress={progress} onBack={() => setCategory(null)} />
      ) : (
        <Landing onEnter={setCategory} />
      )}
    </div>
  )
}
