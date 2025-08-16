from uagents import Agent, Context
import subprocess
import re
import asyncio

# Get the correct canister ID dynamically
def get_canister_id():
    try:
        # Try to get canister ID from dfx
        result = subprocess.run([
            "dfx", "canister", "id", "learnsphere", "--network", "local"
        ], capture_output=True, text=True, timeout=5)
        
        if result.returncode == 0:
            canister_id = result.stdout.strip()
            print(f"Found canister ID: {canister_id}")
            return canister_id
        else:
            print("Could not get canister ID automatically, using hardcoded value")
            return "uxrrr-q7777-77774-qaaaq-cai"
    except:
        print("Using hardcoded canister ID")
        return "uxrrr-q7777-77774-qaaaq-cai"

CANISTER_ID = get_canister_id()

# Simple function to call any canister method
async def call_canister(method_name, args="()"):
    try:
        cmd = [
            "dfx", "canister", "call", 
            CANISTER_ID, 
            method_name, 
            args,
            "--network", "local"
        ]
        
        print(f"Calling: dfx canister call {CANISTER_ID} {method_name} {args} --network local")
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            output = result.stdout.strip()
            print(f"✅ {method_name} success: {output}")
            return {"success": True, "output": output}
        else:
            error = result.stderr.strip()
            print(f"❌ {method_name} failed: {error}")
            return {"success": False, "error": error}
            
    except Exception as e:
        print(f"❌ Exception calling {method_name}: {e}")
        return {"success": False, "error": str(e)}

# Parse quest from Motoko output
def parse_quest(output):
    try:
        # Handle "opt record { ... }" format
        if "opt record" in output:
            # Extract fields using regex
            quest = {}
            
            # Extract id
            id_match = re.search(r'id\s*=\s*(\d+)', output)
            if id_match:
                quest['id'] = int(id_match.group(1))
            
            # Extract title
            title_match = re.search(r'title\s*=\s*"([^"]*)"', output)
            if title_match:
                quest['title'] = title_match.group(1)
            
            # Extract description
            desc_match = re.search(r'description\s*=\s*"([^"]*)"', output)
            if desc_match:
                quest['description'] = desc_match.group(1)
            
            return quest if quest else None
            
        elif "null" in output:
            return None
        else:
            return {"raw": output}
            
    except Exception as e:
        print(f"Error parsing quest: {e}")
        return {"error": str(e), "raw": output}

# Test basic connectivity
async def test_connection():
    print("Testing basic connectivity...")
    
    # Test 1: Simple greet function
    result = await call_canister("greet", '("Agent")')
    if result["success"]:
        print("✅ Basic canister call works!")
        return True
    else:
        print("❌ Basic canister call failed!")
        return False

# Define the Fetch.ai Agent
quest_agent = Agent(name="quest_giver", seed="a_very_secret_seed_phrase")

@quest_agent.on_interval(period=30.0)
async def check_for_quests(ctx: Context):
    ctx.logger.info("🔍 Agent checking for quests...")
    
    # Test connection first
    if not await test_connection():
        ctx.logger.error("❌ Cannot connect to canister!")
        return
    
    # Try to get quest count first
    count_result = await call_canister("getQuestCount", "()")
    if count_result["success"]:
        ctx.logger.info(f"📊 Found {count_result['output']} quests in canister")
    
    # Get next quest
    quest_result = await call_canister("getNextQuest", "()")
    
    if quest_result["success"]:
        quest = parse_quest(quest_result["output"])
        
        if quest and "error" not in quest:
            if "raw" in quest:
                ctx.logger.info(f"🎯 Got quest data: {quest['raw']}")
            else:
                title = quest.get('title', 'Unknown')
                description = quest.get('description', 'No description')
                ctx.logger.info(f"🎯 NEXT QUEST: {title}")
                ctx.logger.info(f"📝 {description}")
        else:
            ctx.logger.info("📭 No quests available")
    else:
        ctx.logger.error(f"❌ Failed to get quest: {quest_result.get('error', 'Unknown error')}")

@quest_agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info("🚀 LearnSphere Agent starting...")
    ctx.logger.info(f"🏷️  Using canister ID: {CANISTER_ID}")
    
    # Wait a moment then test
    await asyncio.sleep(1)
    await check_for_quests(ctx)

if __name__ == "__main__":
    print("🚀 Starting LearnSphere Quest Agent...")
    print(f"📍 Canister ID: {CANISTER_ID}")
    quest_agent.run()