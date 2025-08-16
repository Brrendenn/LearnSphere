import QuestCard from "./QuestCard";


const QuestGrid = ({ quests, onStartQuest}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {quests.map((quest) => (
        <QuestCard key={quest.id} quest={quest} onStartQuest={onStartQuest} />
      ))}
    </div>
  );
};

export default QuestGrid;
