import React, { useState, useEffect } from 'react'
import BranchSelector from './components/BranchSelector'
import WheelScreen from './components/WheelScreen'
import InventoryScreen from './components/InventoryScreen'
import { useWheelState } from './hooks/useWheelState'

function getRoute() {
  const path = window.location.pathname
  const hash = window.location.hash
  if (path === '/inventory' || hash === '#/inventory' || hash === '#inventory') return 'inventory'
  return 'wheel'
}

export default function App() {
  const [branch, setBranch] = useState(null)
  const [route, setRoute]   = useState(getRoute)

  useEffect(() => {
    const onChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onChange)
    window.addEventListener('popstate', onChange)
    return () => {
      window.removeEventListener('hashchange', onChange)
      window.removeEventListener('popstate', onChange)
    }
  }, [])

  const goInventory = () => {
    window.history.pushState(null, '', '#/inventory')
    setRoute('inventory')
  }

  const exitInventory = () => {
    window.history.pushState(null, '', '#/')
    setRoute('wheel')
  }

  const {
    state,
    pickWinner,
    claimReward,
    updateReward,
    resetBranch,
    importState,
  } = useWheelState()

  const actions = { pickWinner, claimReward, updateReward, resetBranch, importState }

  if (route === 'inventory') {
    return <InventoryScreen state={state} actions={actions} onExit={exitInventory} />
  }

  return branch
    ? <WheelScreen
        branch={branch}
        state={state}
        actions={actions}
        onBack={() => setBranch(null)}
      />
    : <BranchSelector onSelect={setBranch} onInventory={goInventory} />
}
