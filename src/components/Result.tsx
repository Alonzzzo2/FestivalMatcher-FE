import { FestivalMatchResponse } from '../types';
import ScoreCard from './ScoreCard';

interface ResultProps {
  festival: FestivalMatchResponse | null;
  onReset: () => void;
  mode: 'liked' | 'playlist';
}

export default function Result({ festival, onReset, mode }: ResultProps) {
  if (!festival) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <ScoreCard
          festival={festival}
          onVisitClashFinder={() => window.open(festival.url, '_blank')}
          mode={mode}
        />
      </div>

      <button
        onClick={onReset}
        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded transition duration-200"
      >
        ← Try Another Festival
      </button>
    </div>
  )
}
