import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";

persistent actor LearnSphere {

    public type Quest = {
        id: Nat;
        title: Text;
        description: Text;
        link: Text;
        rewardAmount: Nat;
        prerequisite: ?Nat;
        category: Text; 
    };
    
    public type UserStats = {
        tokens: Nat;
        questsCompleted: [Nat];
        experience: Nat;
    };


    private stable var questsArray : [Quest] = [
        { id = 1; title = "What is a Canister?"; description = "Read the introductory article on ICP smart contracts."; link = "https://internetcomputer.org/docs/current/concepts/canisters"; rewardAmount = 100; prerequisite = null; category = "ICP"; },
        { id = 2; title = "Introduction to Fetch.ai"; description = "Watch the official intro video to uAgents."; link = "https://fetch.ai/getting-started/"; rewardAmount = 100; prerequisite = null; category = "AI Agents"; },
        { id = 3; title = "Building Your First dApp"; description = "Follow the developer journey tutorials."; link = "https://internetcomputer.org/docs/current/developer-docs/getting-started/developer-journey"; rewardAmount = 150; prerequisite = ?1; category = "Development"; },
        { id = 4; title = "Agent Framework Concepts"; description = "Learn how Fetch.ai agents work."; link = "https://docs.fetch.ai/concepts/agent-framework/"; rewardAmount = 150; prerequisite = ?2; category = "AI Agents"; },
        { id = 5; title = "Understanding Principals"; description = "Learn about identity on the IC."; link = "https://internetcomputer.org/docs/current/concepts/principals-and-identity"; rewardAmount = 200; prerequisite = ?3; category = "ICP"; },
        { id = 6; title = "Agent-Based DeFi"; description = "Explore how agents are used in finance."; link = "https://docs.fetch.ai/concepts/agent-based-finance/"; rewardAmount = 250; prerequisite = ?4; category = "DeFi"; },
        { id = 7; title = "What is Web3?"; description = "Get a high-level overview of the next evolution of the internet."; link = "https://www.web3.university/"; rewardAmount = 100; prerequisite = null; category = "Web3"; },
        { id = 8; title = "Crypto Fundamentals"; description = "Learn the basics of what cryptocurrency is and how it works."; link = "https://www.nerdwallet.com/article/investing/cryptocurrency"; rewardAmount = 120; prerequisite = ?7; category = "Web3"; },
        { id = 9; title = "Proof-of-Work vs. Proof-of-Stake"; description = "Understand the two major consensus mechanisms that power blockchains."; link = "https://www.mckinsey.com/featured-insights/mckinsey-explainers/what-is-proof-of-stake"; rewardAmount = 150; prerequisite = ?8; category = "Web3"; },
        { id = 10; title = "Introduction to DeFi"; description = "Discover how decentralized finance is changing the world of financial services."; link = "https://www.investopedia.com/decentralized-finance-defi-5113835"; rewardAmount = 150; prerequisite = ?8; category = "DeFi"; },
        { id = 11; title = "What are NFTs?"; description = "Learn about Non-Fungible Tokens and their role in digital ownership."; link = "https://www.iberdrola.com/innovation/nft-token-non-fungible"; rewardAmount = 130; prerequisite = ?8; category = "Web3"; },
        { id = 12; title = "The Motoko Playground"; description = "Get hands-on! Write and deploy your first canister directly in the browser."; link = "https://m7sm4-2iaaa-aaaab-qabra-cai.raw.ic0.app/"; rewardAmount = 300; prerequisite = ?5; category = "Development"; }
    ];

    private stable var userStatsEntries : [(Principal, UserStats)] = [];
    private transient var userStats = HashMap.HashMap<Principal, UserStats>(10, Principal.equal, Principal.hash);

    system func preupgrade() {
        userStatsEntries := Iter.toArray(userStats.entries());
    };

    system func postupgrade() {
        userStats := HashMap.fromIter<Principal, UserStats>(userStatsEntries.vals(), userStatsEntries.size(), Principal.equal, Principal.hash);
        userStatsEntries := [];
    };

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
    
    private func arrayContains(arr: [Nat], item: Nat) : Bool {
        Array.find<Nat>(arr, func(x: Nat) : Bool { x == item }) != null
    };
    

    public query func greet(name : Text) : async Text {
        Debug.print("greet called with: " # name);
        "Hello, " # name # "! LearnSphere canister is working!"
    };

    public shared(msg) func getUserStats() : async UserStats {
        let caller = msg.caller;
        Debug.print("getUserStats called by: " # Principal.toText(caller));
        getOrCreateUser(caller)
    };

    public query func getAllQuests() : async [Quest] {
        Debug.print("getAllQuests called - returning " # debug_show(Array.size(questsArray)) # " quests");
        questsArray
    };

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

    public shared(msg) func getNextQuest() : async ?Quest {
        let caller = msg.caller;
        let stats = getOrCreateUser(caller);
        Debug.print("getNextQuest called by: " # Principal.toText(caller));

        Array.find<Quest>(questsArray, func(quest: Quest) : Bool {
            if (arrayContains(stats.questsCompleted, quest.id)) {
                return false;
            };
            
            switch (quest.prerequisite) {
                case (null) { true }; 
                case (?prereqId) {
                    arrayContains(stats.questsCompleted, prereqId)
                };
            }
        })
    };

    public shared(msg) func completeQuest(questId: Nat) : async Text {
        let caller = msg.caller;
        var stats = getOrCreateUser(caller);
        Debug.print("completeQuest called by: " # Principal.toText(caller) # " for quest: " # debug_show(questId));

        let maybeQuest = Array.find<Quest>(questsArray, func(q: Quest) : Bool { q.id == questId });
        
        switch(maybeQuest) {
            case (null) { 
                Debug.print("Quest not found: " # debug_show(questId));
                "Error: Quest not found."
            };
            case (?quest) {

                if (arrayContains(stats.questsCompleted, quest.id)) {
                    Debug.print("Quest already completed: " # debug_show(questId));
                    return "Error: Quest already completed.";
                };


                switch (quest.prerequisite) {
                    case (null) { /* No prerequisite */ };
                    case (?prereqId) {
                        if (not arrayContains(stats.questsCompleted, prereqId)) {
                            Debug.print("Prerequisite not met for quest: " # debug_show(questId));
                            return "Error: Prerequisite quest not completed.";
                        };
                    };
                };

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

    public query func getQuestCount() : async Nat {
        let count = Array.size(questsArray);
        Debug.print("getQuestCount called - returning: " # debug_show(count));
        count
    };

    public query func getQuestById(questId: Nat) : async ?Quest {
        Debug.print("getQuestById called with ID: " # debug_show(questId));
        Array.find<Quest>(questsArray, func(q: Quest) : Bool { q.id == questId })
    };
}
