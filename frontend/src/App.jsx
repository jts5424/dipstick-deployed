import { useState } from 'react'
import ModeSwitcher from './components/ModeSwitcher'
import PrototypeApp from './modes/Prototype/PrototypeApp'
import DevApp from './modes/Dev/DevApp'
import './App.css'

function App() {
  const [activeMode, setActiveMode] = useState('prototype')

  return (
    <div className="App">
      <ModeSwitcher activeMode={activeMode} onModeChange={setActiveMode} />
      {activeMode === 'prototype' ? <PrototypeApp /> : <DevApp />}
    </div>
  )
}

export default App

