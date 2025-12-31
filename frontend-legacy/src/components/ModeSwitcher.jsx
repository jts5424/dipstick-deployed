import './ModeSwitcher.css'

function ModeSwitcher({ activeMode, onModeChange }) {
  return (
    <div className="mode-switcher">
      <button
        className={`mode-tab ${activeMode === 'prototype' ? 'active' : ''}`}
        onClick={() => onModeChange('prototype')}
      >
        Prototype
      </button>
      <button
        className={`mode-tab ${activeMode === 'dev' ? 'active' : ''}`}
        onClick={() => onModeChange('dev')}
      >
        Dev (Admin)
      </button>
    </div>
  )
}

export default ModeSwitcher


