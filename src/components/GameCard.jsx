import PropTypes from 'prop-types'

export function GameCard({ game, onClick }) {
  return (
    <div
      className="game-card group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl">{game.icon}</span>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-hub-accent/20 text-hub-accent">
          {game.difficulty}
        </span>
      </div>
      <h3 className="text-lg font-bold mb-1 group-hover:text-hub-accent transition-colors text-hub-text">
        {game.name}
      </h3>
      <p className="text-sm text-hub-textSecondary mb-3">{game.description}</p>
      <div className="flex items-center gap-2 text-xs text-hub-textSecondary/80">
        <span>{game.type}</span>
        <span>•</span>
        <span>{game.playTime}</span>
      </div>
    </div>
  )
}

GameCard.propTypes = {
  game: PropTypes.shape({
    icon: PropTypes.string.isRequired,
    difficulty: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    playTime: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
}