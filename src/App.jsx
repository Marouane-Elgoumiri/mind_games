import { GameProvider } from './context/GameProvider'
import { GameHub } from './components/GameHub'

function App() {
  return (
    <GameProvider>
      <GameHub />
    </GameProvider>
  )
}

export default App