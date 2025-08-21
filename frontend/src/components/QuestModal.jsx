const QuestModal = ({ quest, onComplete, onCancel }) => {
  if (!quest) return null; 

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 max-w-md w-full">
        <h3 className="text-2xl font-bold mb-4 text-center">Quest Active!</h3>
        <p className="text-center mb-6">
          Learning resource opened in new tab. Complete the quest to earn{" "}
          <span className="text-yellow-400 font-bold">
            {quest.reward} tokens
          </span>
          !
        </p>
        <div className="flex gap-4">
          <button
            onClick={onComplete}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Complete Quest
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestModal;
