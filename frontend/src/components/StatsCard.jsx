

const StatsCard = ({ icon: Icon, value, label, color}) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
      <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm opacity-75">{label}</div>
    </div>
  );
};

export default StatsCard;
