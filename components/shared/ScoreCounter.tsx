
import React, { useState, useRef, useEffect } from 'react';

interface Team {
  id: number;
  name: string;
  score: number;
}

const ScoreCounter: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: 'Team 1', score: 0 },
    { id: 2, name: 'Team 2', score: 0 },
  ]);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [editingTeamName, setEditingTeamName] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTeamId !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTeamId]);

  const handleIncrement = (teamId: number) => {
    setTeams(prevTeams =>
      prevTeams.map(team =>
        team.id === teamId ? { ...team, score: team.score + 1 } : team
      )
    );
  };

  const handleDecrement = (teamId: number) => {
    setTeams(prevTeams =>
      prevTeams.map(team =>
        team.id === teamId ? { ...team, score: Math.max(0, team.score - 1) } : team
      )
    );
  };

  const handleResetScores = () => {
    setTeams(prevTeams => prevTeams.map(team => ({ ...team, score: 0 })));
  };

  const handleAddTeam = () => {
    setTeams(prevTeams => {
      const newTeamId = prevTeams.length > 0 ? Math.max(...prevTeams.map(t => t.id)) + 1 : 1;
      return [...prevTeams, { id: newTeamId, name: `Team ${newTeamId}`, score: 0 }];
    });
  };

  const handleTeamNameClick = (team: Team) => {
    setEditingTeamId(team.id);
    setEditingTeamName(team.name);
  };

  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTeamName(e.target.value);
  };

  const handleTeamNameSave = (teamId: number) => {
    if (editingTeamName.trim() === '') {
        // Optionally revert to old name or a default if name is empty
        const originalTeam = teams.find(t => t.id === teamId);
        if (originalTeam) setEditingTeamName(originalTeam.name);
        else setEditingTeamName(`Team ${teamId}`); // Fallback
    }
    setTeams(prevTeams =>
      prevTeams.map(team =>
        team.id === teamId ? { ...team, name: editingTeamName.trim() || `Team ${teamId}` } : team
      )
    );
    setEditingTeamId(null);
  };

  const handleTeamNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, teamId: number) => {
    if (e.key === 'Enter') {
      handleTeamNameSave(teamId);
    } else if (e.key === 'Escape') {
      setEditingTeamId(null); // Revert to display mode without saving
    }
  };


  return (
    <div className="flex flex-col items-center space-y-4 p-3 rounded-lg w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full text-center">
        {teams.map(team => (
          <div key={team.id} className="p-3 border border-brandNeutral-200 rounded-lg bg-white shadow">
            {editingTeamId === team.id ? (
              <input
                ref={inputRef}
                type="text"
                value={editingTeamName}
                onChange={handleTeamNameChange}
                onBlur={() => handleTeamNameSave(team.id)}
                onKeyDown={(e) => handleTeamNameKeyDown(e, team.id)}
                className="text-sm font-medium text-brandTextPrimary mb-1 w-full text-center border-b-2 border-brandPrimary-500 focus:outline-none"
              />
            ) : (
              <h4
                onClick={() => handleTeamNameClick(team)}
                className="text-sm font-medium text-brandTextSecondary mb-1 cursor-pointer hover:text-brandPrimary-600"
                title="Click to edit team name"
              >
                {team.name}
              </h4>
            )}
            <p className={`text-3xl font-bold ${team.id % 2 === 1 ? 'text-brandPrimary-600' : 'text-brandAccent-500'}`} aria-live="polite">
              {team.score}
            </p>
            <div className="flex justify-center space-x-1 mt-1.5">
              <button
                onClick={() => handleIncrement(team.id)}
                className="px-2 py-0.5 bg-brandPrimary-500 text-white text-xs rounded hover:bg-brandPrimary-600 w-6 h-6 flex items-center justify-center"
                aria-label={`Increase ${team.name} score`}
              >
                +
              </button>
              <button
                onClick={() => handleDecrement(team.id)}
                className="px-2 py-0.5 bg-brandFunctionalRed text-white text-xs rounded hover:bg-red-700 w-6 h-6 flex items-center justify-center"
                aria-label={`Decrease ${team.name} score`}
              >
                -
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex space-x-2 w-full mt-2">
        <button
            onClick={handleAddTeam}
            className="flex-1 px-4 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-colors"
        >
            Add Team
        </button>
        <button
            onClick={handleResetScores}
            className="flex-1 px-4 py-1.5 bg-brandNeutral-200 text-brandTextPrimary text-sm font-semibold rounded-md hover:bg-brandNeutral-300 focus:outline-none focus:ring-2 focus:ring-brandNeutral-400 focus:ring-opacity-75 transition-colors"
        >
            Reset All Scores
        </button>
      </div>
    </div>
  );
};

export default ScoreCounter;
