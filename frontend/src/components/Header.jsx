const Header = () => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-12 bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="url(#gradient1)"/>
            <circle cx="8" cy="8" r="1" fill="white" opacity="0.8"/>
            <circle cx="16" cy="7" r="0.5" fill="white" opacity="0.6"/>
            <circle cx="14" cy="12" r="0.8" fill="white" opacity="0.7"/>
            <circle cx="9" cy="15" r="0.6" fill="white" opacity="0.5"/>
            <circle cx="18" cy="15" r="0.4" fill="white" opacity="0.4"/>
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee"/>
                <stop offset="50%" stopColor="#3b82f6"/>
                <stop offset="100%" stopColor="#a855f7"/>
              </linearGradient>
            </defs>
          </svg>
          Learn Sphere
        </h1>
        <p className="text-xl opacity-90">Learn to Earn - Your Web3 & ICP Journey Starts Here</p>
      </div>
    </div>
  );
};

export default Header;
