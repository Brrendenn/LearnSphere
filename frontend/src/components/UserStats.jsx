import StatsCard from "./StatsCard";
import { Star, Trophy, Coins, BookOpen, Play, CheckCircle, Lock } from 'lucide-react'


const UserStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-4 gap-6 mb-12">
      <StatsCard
        icon={Coins}
        value={stats.tokens}
        label="Tokens Earned"
        color="text-yellow-400"
      />
      <StatsCard
        icon={Trophy}
        value={stats.questsCompleted}
        label="Quests Completed"
        color="text-blue-400"
      />
      <StatsCard
        icon={Star}
        value={stats.currentLevel}
        label="Current Level"
        color="text-purple-400"
      />
      <StatsCard
        icon={BookOpen}
        value={stats.experience}
        label="Experience Points"
        color="text-green-400"
      />
    </div>
  );
};

export default UserStats;
