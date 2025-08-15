

const QuestActionButton = ({ status }) => {
  if (status === "available") {
    return (
      <button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200">
        Start Quest
      </button>
    );
  }

  if (status === "completed") {
    return (
      <div className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl text-center">
        ✓ Completed
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-600 text-gray-300 font-semibold py-2 px-4 rounded-xl text-center">
      🔒 Locked
    </div>
  );
};

export default QuestActionButton;
