import React, { useState } from 'react'
import BranchSelector from './components/BranchSelector'
import WheelScreen from './components/WheelScreen'
import { useWheelState } from './hooks/useWheelState'

export default function App() {
  const [branch, setBranch] = useState(null)

  const {
    state,
    pickWinner,
    claimReward,
    updateReward,
    resetBranch,
    importState,
  } = useWheelState()

  const actions = { pickWinner, claimReward, updateReward, resetBranch, importState }

  return branch
    ? <WheelScreen
        branch={branch}
        state={state}
        actions={actions}
        onBack={() => setBranch(null)}
      />
    : <BranchSelector onSelect={setBranch} />
}
