import { useState, useEffect } from "react";
import "./App.css";

// ICP and DFINITY imports
import { AuthClient } from "@dfinity/auth-client";

// Try to import the generated declarations
let learnsphere;
try {
  // Try the standard path first
  const declarations = await import("./declarations");
  learnsphere = declarations.learnsphere;
  console.log("✅ Using generated declarations");
} catch (error) {
  console.warn("❌ Could not import declarations:", error);
  // We'll handle this with manual setup below
}

// Your existing components
import Header from "./components/Header";
import UserStats from "./components/UserStats";
import QuestGrid from "./components/QuestGrid";
import QuestModal from "./components/QuestModal";
import StarField from "./components/StarField";
import ChatAssistant from "./components/ChatAssistant";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [actor, setActor] = useState(null);
  const [principal, setPrincipal] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [quests, setQuests] = useState([]);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const initAuth = async () => {
    try {
      console.log("🔐 Initializing authentication...");
      const authClient = await AuthClient.create();
      
      if (await authClient.isAuthenticated()) {
        console.log("✅ User already authenticated");
        await handleAuthenticated(authClient);
      } else {
        console.log("ℹ️ User not authenticated");
      }
    } catch (err) {
      console.error("❌ Auth initialization failed:", err);
      setError("Failed to initialize authentication: " + err.message);
    }
    setIsLoading(false);
  };

  const handleAuthenticated = async (authClient) => {
    try {
      console.log("🔗 Handling authentication...");
      const identity = authClient.getIdentity();
      const userPrincipal = identity.getPrincipal().toString();

      console.log("👤 User Principal:", userPrincipal);

      // Try to use the generated backend first
      if (learnsphere) {
        console.log("✅ Using generated backend actor");
        setActor(learnsphere);
      } else {
        console.log("⚠️ Generated backend not available, using manual setup");
        // Manual actor creation as fallback
        const { Actor, HttpAgent } = await import("@dfinity/agent");
        
        const agent = new HttpAgent({
          host: "http://127.0.0.1:4943",
          identity,
        });
        
        // Fetch root key for local development
        await agent.fetchRootKey();
        
        // Create actor manually with correct canister ID
        const canisterId = "uxrrr-q7777-77774-qaaaq-cai"; // Update this with your actual canister ID
        
        // Manual IDL factory
        const idlFactory = ({ IDL }) => {
          const Quest = IDL.Record({
            id: IDL.Nat,
            title: IDL.Text,
            description: IDL.Text,
            link: IDL.Text,
            rewardAmount: IDL.Nat,
            prerequisite: IDL.Opt(IDL.Nat),
          });
          
          const UserStats = IDL.Record({
            tokens: IDL.Nat,
            questsCompleted: IDL.Vec(IDL.Nat),
            experience: IDL.Nat,
          });

          return IDL.Service({
            greet: IDL.Func([IDL.Text], [IDL.Text], ["query"]),
            getAllQuests: IDL.Func([], [IDL.Vec(Quest)], ["query"]),
            getAllQuestsWithStatus: IDL.Func([], [IDL.Vec(IDL.Tuple(Quest, IDL.Text))], []),
            getUserStats: IDL.Func([], [UserStats], []),
            getNextQuest: IDL.Func([], [IDL.Opt(Quest)], []),
            completeQuest: IDL.Func([IDL.Nat], [IDL.Text], []),
            getQuestCount: IDL.Func([], [IDL.Nat], ["query"]),
            getQuestById: IDL.Func([IDL.Nat], [IDL.Opt(Quest)], ["query"]),
          });
        };

        const manualActor = Actor.createActor(idlFactory, {
          agent,
          canisterId,
        });
        
        setActor(manualActor);
      }

      setIsAuthenticated(true);
      setPrincipal(userPrincipal);
      
      console.log("📊 Loading data from canister...");
      // Load data with a small delay to ensure actor is ready
      setTimeout(() => loadData(learnsphere || manualActor), 100);
      
    } catch (err) {
      console.error("❌ Authentication handling failed:", err);
      setError("Failed to create actor: " + err.message);
    }
  };

  const handleLogin = async () => {
    try {
      console.log("🚀 Starting login process...");
      const authClient = await AuthClient.create();
      
      await authClient.login({
        identityProvider: "https://identity.ic0.app",
        onSuccess: () => {
          console.log("✅ Login successful");
          handleAuthenticated(authClient);
        },
        onError: (error) => {
          console.error("❌ Login error:", error);
          setError("Login failed: " + error);
        }
      });
    } catch (err) {
      console.error("❌ Login failed:", err);
      setError("Login failed: " + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      const authClient = await AuthClient.create();
      await authClient.logout();
      setIsAuthenticated(false);
      setActor(null);
      setPrincipal("");
      setQuests([]);
      setUserStats(null);
      console.log("👋 Logged out successfully");
    } catch (err) {
      console.error("❌ Logout failed:", err);
    }
  };

  const loadData = async (backendActor) => {
    if (!backendActor) {
      console.error("❌ No actor provided to loadData");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("🧪 Testing canister connection...");
      const greetResult = await backendActor.greet("Frontend");
      console.log("✅ Greet result:", greetResult);

      console.log("📊 Fetching user stats...");
      const statsResult = await backendActor.getUserStats();
      console.log("✅ Raw stats result:", statsResult);
      
      const formattedStats = {
        tokens: Number(statsResult.tokens),
        questsCompleted: statsResult.questsCompleted.length,
        experience: Number(statsResult.experience),
        currentLevel: Math.floor(Number(statsResult.experience) / 100) + 1,
      };
      setUserStats(formattedStats);
      console.log("📈 Formatted stats:", formattedStats);

      console.log("🎯 Fetching quests with status...");
      const questsWithStatus = await backendActor.getAllQuestsWithStatus();
      console.log("✅ Raw quests with status:", questsWithStatus);
      
      const formattedQuests = questsWithStatus.map(([quest, status]) => ({
        ...quest,
        id: Number(quest.id),
        reward: Number(quest.rewardAmount),
        status: status,
      }));
      
      setQuests(formattedQuests);
      console.log("📝 Formatted quests:", formattedQuests);
      
    } catch (err) {
      console.error("❌ Failed to load data:", err);
      console.error("Error details:", err);
      setError("Failed to load data: " + err.message);
    }
    
    setIsLoading(false);
  };

  const handleQuestComplete = async () => {
    if (!actor || !selectedQuest) return;

    setIsCompleting(true);
    try {
      console.log("✅ Completing quest:", selectedQuest.id);
      const result = await actor.completeQuest(BigInt(selectedQuest.id));
      console.log("🎉 Quest complete result:", result);
      
      // Reload data to reflect changes
      await loadData(actor);
    } catch (error) {
      console.error("❌ Failed to complete quest:", error);
      setError("Failed to complete quest: " + error.message);
    }
    
    setIsCompleting(false);
    setSelectedQuest(null);
  };

  const startQuest = (quest) => {
    if (quest.status !== "available") return;
    console.log("🎯 Starting quest:", quest);
    setSelectedQuest(quest);
    window.open(quest.link, "_blank");
  };

  const handleQuestCancel = () => setSelectedQuest(null);

  useEffect(() => {
    initAuth();
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div>Loading LearnSphere...</div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 mb-4">❌ {error}</div>
          <button 
            onClick={() => {
              setError(null);
              setIsLoading(true);
              initAuth();
            }} 
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      <StarField />

      <div className="relative z-10 container mx-auto px-6 py-8">
        {isAuthenticated ? (
          <>
            <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-lg text-xs">
              <p title={principal} className="truncate max-w-[150px]">{principal}</p>
              <button onClick={handleLogout} className="text-red-400">Logout</button>
            </div>
            <Header />
            {userStats && <UserStats stats={userStats} />}
            <QuestGrid quests={quests} onStartQuest={startQuest} />
          </>
        ) : (
          <div className="text-center pt-20">
            <Header />
            <button onClick={handleLogin} className="mt-8 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold py-3 px-8 rounded-xl text-lg">
              Login with Internet Identity
            </button>
          </div>
        )}

        <QuestModal
          quest={selectedQuest}
          onComplete={handleQuestComplete}
          onCancel={handleQuestCancel}
          isCompleting={isCompleting}
        />
      </div>
      <ChatAssistant />
    </div>
  );
}

export default App;