import { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import UserStats from "./components/UserStats";
import QuestGrid from "./components/QuestGrid";
import QuestModal from "./components/QuestModal";
import StarField from "./components/StarField";

function App() {
  const [userStats, setUserStats] = useState({
    tokens: 0,
    questsCompleted: 0,
    currentLevel: 1,
    experience: 0,
  });

  const [quests, setQuests] = useState([
    {
      id: 1,
      title: "Introduction to Web3",
      description:
        "Learn the fundamentals of blockchain and decentralized systems",
      type: "article",
      duration: "5 min read",
      reward: 10,
      status: "available",
      url: "https://ethereum.org/en/web3/",
      category: "Basics",
    },
    {
      id: 2,
      title: "What is Internet Computer Protocol?",
      description:
        "Discover the revolutionary blockchain that runs at web speed",
      type: "video",
      duration: "8 min watch",
      reward: 15,
      status: "locked",
      url: "https://internetcomputer.org/",
      category: "ICP",
      prerequisite: 1,
    },
    {
      id: 3,
      title: "Understanding Canisters",
      description: "Deep dive into ICP's smart contract architecture",
      type: "article",
      duration: "7 min read",
      reward: 20,
      status: "locked",
      url: "https://internetcomputer.org/docs/current/concepts/canisters-code",
      category: "ICP",
      prerequisite: 2,
    },
    {
      id: 4,
      title: "Fetch.ai Agent Framework",
      description: "Learn how to build autonomous AI agents",
      type: "video",
      duration: "12 min watch",
      reward: 25,
      status: "locked",
      url: "https://docs.fetch.ai/",
      category: "AI Agents",
      prerequisite: 1,
    },
    {
      id: 5,
      title: "DeFi Fundamentals",
      description: "Explore decentralized finance concepts and applications",
      type: "article",
      duration: "10 min read",
      reward: 30,
      status: "locked",
      url: "https://ethereum.org/en/defi/",
      category: "DeFi",
      prerequisite: 3,
    },
    {
      id: 6,
      title: "Building Your First Canister",
      description: "Hands-on tutorial for creating ICP smart contracts",
      type: "tutorial",
      duration: "20 min",
      reward: 50,
      status: "locked",
      url: "https://internetcomputer.org/docs/current/tutorials/developer-journey/",
      category: "Development",
      prerequisite: 3,
    },
    {
      id: 7,
      title: "AI Agent Economics",
      description: "Understanding token economics in agent-based systems",
      type: "article",
      duration: "6 min read",
      reward: 35,
      status: "locked",
      url: "https://docs.fetch.ai/concepts/agent-economics/",
      category: "Economics",
      prerequisite: 4,
    },
    {
      id: 8,
      title: "Advanced ICP Development",
      description: "Master advanced concepts for ICP application development",
      type: "video",
      duration: "15 min watch",
      reward: 60,
      status: "locked",
      url: "https://internetcomputer.org/docs/current/developer-docs/",
      category: "Advanced",
      prerequisite: 6,
    },
  ]);

  const [selectedQuest, setSelectedQuest] = useState(null);
  const [activeTimer, setActiveTimer] = useState(null);

  useEffect(() => {
    setQuests((prevQuests) =>
      prevQuests.map((quest) => {
        if (quest.prerequisite) {
          const prerequisiteQuest = prevQuests.find(
            (q) => q.id === quest.prerequisite
          );
          if (prerequisiteQuest && prerequisiteQuest.status === "completed") {
            return {
              ...quest,
              status: quest.status === "locked" ? "available" : quest.status,
            };
          }
        }
        return quest;
      })
    );
  }, [userStats.questsCompleted]);

  const startQuest = (quest) => {
    if (quest.status !== "available") return;

    setSelectedQuest(quest);
    // Simulate opening the learning resource
    window.open(quest.url, "_blank");

    // Start timer for quest completion
    const timer = setTimeout(() => {
      completeQuest(quest.id);
    }, 10000); // 10 seconds for demo purposes

    setActiveTimer(timer);
  };

  const completeQuest = (questId) => {
    if (activeTimer) {
      clearTimeout(activeTimer);
      setActiveTimer(null);
    }

    setQuests((prevQuests) =>
      prevQuests.map((quest) =>
        quest.id === questId ? { ...quest, status: "completed" } : quest
      )
    );

    const completedQuest = quests.find((q) => q.id === questId);
    if (completedQuest) {
      setUserStats((prev) => ({
        ...prev,
        tokens: prev.tokens + completedQuest.reward,
        questsCompleted: prev.questsCompleted + 1,
        experience: prev.experience + completedQuest.reward * 2,
        currentLevel:
          Math.floor((prev.experience + completedQuest.reward * 2) / 100) + 1,
      }));
    }

    setSelectedQuest(null);
  };

  const handleQuestComplete = () => {
    if (selectedQuest) {
      completeQuest(selectedQuest.id);
    }
  };

  const handleQuestCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer);
      setActiveTimer(null);
    }
    setSelectedQuest(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      <StarField />

      <div className="relative z-10 container mx-auto px-6 py-8">
        <Header />
        <UserStats stats={userStats} />
        <QuestGrid quests={quests} onStartQuest={startQuest} />

        <QuestModal
          quest={selectedQuest}
          onComplete={handleQuestComplete}
          onCancel={handleQuestCancel}
        />
      </div>
    </div>
  );
}

export default App;
