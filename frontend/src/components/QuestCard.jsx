import { Star, Trophy, Coins, BookOpen, Play, CheckCircle, Lock } from 'lucide-react'
import QuestActionButton from './QuestActionButton';

const QuestCard = ({ quest, onStartQuest}) => {
  const getQuestIcon = (type) => {
    switch (type) {
      case "video":
        return <Play className="w-5 h-5" />;
      case "tutorial":
        return <BookOpen className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case "locked":
        return <Lock className="w-6 h-6 text-gray-500" />;
      default:
        return <Star className="w-6 h-6 text-blue-400" />;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Basics: "from-blue-500 to-cyan-500",
      ICP: "from-purple-500 to-pink-500",
      "AI Agents": "from-green-500 to-teal-500",
      DeFi: "from-yellow-500 to-orange-500",
      Development: "from-red-500 to-pink-500",
      Economics: "from-indigo-500 to-purple-500",
      Advanced: "from-gray-500 to-slate-600",
    };
    return colors[category] || "from-blue-500 to-cyan-500";
  };

  const handleClick = () => {
    if (quest.status === "available") {
      onStartQuest(quest);
    }
  };

  return (
    <div
      className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 cursor-pointer transform hover:scale-105 ${
        quest.status === "completed"
          ? "border-green-400 shadow-lg shadow-green-400/25"
          : quest.status === "available"
          ? "border-white/20 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/25"
          : "border-gray-600 opacity-60"
      }`}
      onClick={handleClick}
    >
      {/* Quest Status Badge */}
      <div className="absolute top-4 right-4">
        {getStatusIcon(quest.status)}
      </div>

      {/* Category Badge */}
      <div
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-gradient-to-r ${getCategoryColor(
          quest.category
        )}`}
      >
        {quest.category}
      </div>

      {/* Quest Content */}
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-2 text-white">{quest.title}</h3>
        <p className="text-sm opacity-75 mb-3">{quest.description}</p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 opacity-75">
            {getQuestIcon(quest.type)}
            <span>{quest.duration}</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-400 font-semibold">
            <Coins className="w-4 h-4" />
            <span>+{quest.reward}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <QuestActionButton status={quest.status} />
    </div>
  );
};

export default QuestCard;
