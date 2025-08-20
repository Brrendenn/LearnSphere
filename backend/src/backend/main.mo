import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";

persistent actor LearnSphere {

    // === DATA STRUCTURES ===

    public type Quest = {
        id: Nat;
        title: Text;
        description: Text;
        link: Text;
        rewardAmount: Nat;
        prerequisite: ?Nat; // Optional prerequisite quest ID
    };
    
    public type UserStats = {
        tokens: Nat;
        questsCompleted: [Nat];
        experience: Nat;
    };

    // Store all available quests - explicitly stable to avoid transient warnings
    private stable var questsArray : [Quest] = [
        // --- Existing Quests ---
        { id = 1; title = "What is a Canister?"; description = "Read the introductory article on ICP smart contracts."; link = "https://internetcomputer.org/docs/current/concepts/canisters"; rewardAmount = 100; prerequisite = null; },
        { id = 2; title = "Introduction to Fetch.ai"; description = "Watch the official intro video to uAgents."; link = "https://fetch.ai/getting-started/"; rewardAmount = 100; prerequisite = null; },
        { id = 3; title = "Building Your First dApp"; description = "Follow the developer journey tutorials."; link = "https://internetcomputer.org/docs/current/developer-docs/getting-started/developer-journey"; rewardAmount = 150; prerequisite = ?1; },
        { id = 4; title = "Agent Framework Concepts"; description = "Learn how Fetch.ai agents work."; link = "https://docs.fetch.ai/concepts/agent-framework/"; rewardAmount = 150; prerequisite = ?2; },
        { id = 5; title = "Understanding Principals"; description = "Learn about identity on the IC."; link = "https://internetcomputer.org/docs/current/concepts/principals-and-identity"; rewardAmount = 200; prerequisite = ?3; },
        { id = 6; title = "Agent-Based DeFi"; description = "Explore how agents are used in finance."; link = "https://docs.fetch.ai/concepts/agent-based-finance/"; rewardAmount = 250; prerequisite = ?4; },
        { id = 7; title = "What is Web3?"; description = "Get a high-level overview of the next evolution of the internet."; link = "https://www.web3.university/"; rewardAmount = 100; prerequisite = null; },
        { id = 8; title = "Crypto Fundamentals"; description = "Learn the basics of what cryptocurrency is and how it works."; link = "https://www.nerdwallet.com/article/investing/cryptocurrency"; rewardAmount = 120; prerequisite = ?7; },
        { id = 9; title = "Proof-of-Work vs. Proof-of-Stake"; description = "Understand the two major consensus mechanisms that power blockchains."; link = "https://www.mckinsey.com/featured-insights/mckinsey-explainers/what-is-proof-of-stake"; rewardAmount = 150; prerequisite = ?8; },
        { id = 10; title = "Introduction to DeFi"; description = "Discover how decentralized finance is changing the world of financial services."; link = "https://www.investopedia.com/decentralized-finance-defi-5113835"; rewardAmount = 150; prerequisite = ?8; },
        { id = 11; title = "What are NFTs?"; description = "Learn about Non-Fungible Tokens and their role in digital ownership."; link = "https://www.iberdrola.com/innovation/nft-token-non-fungible"; rewardAmount = 130; prerequisite = ?8; },
        { id = 12; title = "The Motoko Playground"; description = "Get hands-on! Write and deploy your first canister directly in the browser."; link = "https://m7sm4-2iaaa-aaaab-qabra-cai.raw.ic0.app/"; rewardAmount = 300; prerequisite = ?5; }
    ];

    // Store user data - use stable for persistence across upgrades
    private stable var userStatsEntries : [(Principal, UserStats)] = [];
    private transient var userStats = HashMap.HashMap<Principal, UserStats>(10, Principal.equal, Principal.hash);

    // System functions for upgrade persistence
    system func preupgrade() {
        userStatsEntries := Iter.toArray(userStats.entries());
    };

    system func postupgrade() {
        userStats := HashMap.fromIter<Principal, UserStats>(userStatsEntries.vals(), userStatsEntries.size(), Principal.equal, Principal.hash);
        userStatsEntries := [];
    };

    // Function to get or create a user's profile
    private func getOrCreateUser(caller: Principal) : UserStats {
        switch (userStats.get(caller)) {
            case (?stats) { stats };
            case (null) {
                let newStats : UserStats = { tokens = 0; questsCompleted = []; experience = 0; };
                userStats.put(caller, newStats);
                newStats
            };
        }
    };
    
    // Helper function to check if array contains element
    private func arrayContains(arr: [Nat], item: Nat) : Bool {
        Array.find<Nat>(arr, func(x: Nat) : Bool { x == item }) != null
    };
    
    // === PUBLIC FUNCTIONS (API) ===

    // Simple test function
    public query func greet(name : Text) : async Text {
        Debug.print("greet called with: " # name);
        "Hello, " # name # "! LearnSphere canister is working!"
    };

    // Get the caller's current stats
    public shared(msg) func getUserStats() : async UserStats {
        let caller = msg.caller;
        Debug.print("getUserStats called by: " # Principal.toText(caller));
        getOrCreateUser(caller)
    };

    // Get all quests (returning Quest objects, not strings)
    public query func getAllQuests() : async [Quest] {
        Debug.print("getAllQuests called - returning " # debug_show(Array.size(questsArray)) # " quests");
        questsArray
    };

    // Get all quests with status for a specific caller
    public shared(msg) func getAllQuestsWithStatus() : async [(Quest, Text)] {
        let caller = msg.caller;
        let stats = getOrCreateUser(caller);
        Debug.print("getAllQuestsWithStatus called by: " # Principal.toText(caller));
        
        Array.map<Quest, (Quest, Text)>(questsArray, func(quest: Quest) : (Quest, Text) {
            var status = "locked";
            
            if (arrayContains(stats.questsCompleted, quest.id)) {
                status := "completed";
            } else {
                switch (quest.prerequisite) {
                    case (null) { status := "available"; };
                    case (?prereqId) {
                        if (arrayContains(stats.questsCompleted, prereqId)) {
                            status := "available";
                        };
                    };
                };
            };
            
            (quest, status)
        })
    };

    // Get next available quest for the caller
    public shared(msg) func getNextQuest() : async ?Quest {
        let caller = msg.caller;
        let stats = getOrCreateUser(caller);
        Debug.print("getNextQuest called by: " # Principal.toText(caller));
        
        // Find the first available quest that's not completed
        Array.find<Quest>(questsArray, func(quest: Quest) : Bool {
            // Skip if already completed
            if (arrayContains(stats.questsCompleted, quest.id)) {
                return false;
            };
            
            // Check if prerequisite is met
            switch (quest.prerequisite) {
                case (null) { true }; // No prerequisite
                case (?prereqId) {
                    arrayContains(stats.questsCompleted, prereqId)
                };
            }
        })
    };

    // Complete a quest and get rewards
    public shared(msg) func completeQuest(questId: Nat) : async Text {
        let caller = msg.caller;
        var stats = getOrCreateUser(caller);
        Debug.print("completeQuest called by: " # Principal.toText(caller) # " for quest: " # debug_show(questId));

        // 1. Check if quest exists
        let maybeQuest = Array.find<Quest>(questsArray, func(q: Quest) : Bool { q.id == questId });
        
        switch(maybeQuest) {
            case (null) { 
                Debug.print("Quest not found: " # debug_show(questId));
                "Error: Quest not found."
            };
            case (?quest) {
                // 2. Check if quest is already completed
                if (arrayContains(stats.questsCompleted, quest.id)) {
                    Debug.print("Quest already completed: " # debug_show(questId));
                    return "Error: Quest already completed.";
                };

                // 3. Check prerequisites
                switch (quest.prerequisite) {
                    case (null) { /* No prerequisite */ };
                    case (?prereqId) {
                        if (not arrayContains(stats.questsCompleted, prereqId)) {
                            Debug.print("Prerequisite not met for quest: " # debug_show(questId));
                            return "Error: Prerequisite quest not completed.";
                        };
                    };
                };

                // 4. Update user stats
                let newCompleted = Array.append<Nat>(stats.questsCompleted, [quest.id]);
                let newStats : UserStats = {
                    tokens = stats.tokens + quest.rewardAmount;
                    questsCompleted = newCompleted;
                    experience = stats.experience + (quest.rewardAmount * 2);
                };
                
                userStats.put(caller, newStats);
                
                let result = "Success! Quest '" # quest.title # "' completed. Earned " # debug_show(quest.rewardAmount) # " tokens!";
                Debug.print("Quest completed successfully: " # result);
                result
            };
        };
    };

    // Get quest count
    public query func getQuestCount() : async Nat {
        let count = Array.size(questsArray);
        Debug.print("getQuestCount called - returning: " # debug_show(count));
        count
    };

    // Get a specific quest by ID
    public query func getQuestById(questId: Nat) : async ?Quest {
        Debug.print("getQuestById called with ID: " # debug_show(questId));
        Array.find<Quest>(questsArray, func(q: Quest) : Bool { q.id == questId })
    };
}
