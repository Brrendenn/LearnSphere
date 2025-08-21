from datetime import datetime
from uuid import uuid4
from openai import OpenAI
from uagents import Context, Protocol, Agent
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    TextContent,
    chat_protocol_spec,
)
from uagents.setup import fund_agent_if_low
import subprocess
import re
import asyncio
import os

# Agent configuration
AGENT_NAME = "learnsphere_agent"
AGENT_SEED = "learnsphereagentisthegoat"
AGENT_MAILBOX_KEY = os.getenv("AGENT_MAILBOX_KEY")

# ASI:One LLM configuration
client = OpenAI(
    # Using the ASI:One LLM endpoint and model
    base_url='https://api.asi1.ai/v1',
    # You need to get an ASI:One API key from https://asi1.ai/dashboard/api-keys
    api_key=os.getenv("ASI_ONE_API_KEY", "<YOUR_API_KEY>"),
)

# Get the correct canister ID dynamically
def get_canister_id(network="local"):
    """Dynamically get the canister ID."""
    canister_name = "learnsphere"
    try:
        cmd = ["dfx", "canister", "id", canister_name]
        if network != "local":
            cmd.extend(["--network", network])
            
        result = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=10)
        canister_id = result.stdout.strip()
        print(f"✅ Found canister ID '{canister_id}' for network '{network}'.")
        return canister_id
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired) as e:
        print(f"⚠️ Could not get canister ID automatically for network '{network}': {e}")
        fallback_id = "br5f7-7uaaa-aaaaa-qaaca-cai" 
        print(f"Falling back to hardcoded local ID: {fallback_id}")
        return fallback_id

CANISTER_ID = get_canister_id()

# Create the agent with mailbox enabled for chat
agent = Agent(
    name=AGENT_NAME,
    seed=AGENT_SEED,
    port=8001,
    mailbox=True,
    publish_agent_details=True,
)

# Fund the agent with FET tokens if its balance is low
fund_agent_if_low(agent.wallet.address())

# === CANISTER INTERACTION FUNCTIONS ===

async def call_canister(method_name: str, args: str = "()"):
    """Calls a method on the Motoko canister."""
    try:
        cmd = ["dfx", "canister", "call", CANISTER_ID, method_name, args]
        print(f"💻 Calling: {' '.join(cmd)}")
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=15)

        if process.returncode == 0:
            output = stdout.decode().strip()
            print(f"✅ {method_name} success: {output}")
            return {"success": True, "output": output}
        else:
            error = stderr.decode().strip()
            print(f"❌ {method_name} failed: {error}")
            return {"success": False, "error": error}
            
    except asyncio.TimeoutError:
        print(f"❌ Timeout calling {method_name}")
        return {"success": False, "error": "Request timed out"}
    except Exception as e:
        print(f"❌ Exception calling {method_name}: {e}")
        return {"success": False, "error": str(e)}

def parse_quest(output: str):
    """Parses quest data from Motoko's string output."""
    if "null" in output:
        return None
    try:
        quest = {}
        id_match = re.search(r'id\s*=\s*(\d+)', output)
        if id_match: quest['id'] = int(id_match.group(1))
        
        title_match = re.search(r'title\s*=\s*"([^"]*)"', output)
        if title_match: quest['title'] = title_match.group(1)
        
        desc_match = re.search(r'description\s*=\s*"([^"]*)"', output)
        if desc_match: quest['description'] = desc_match.group(1)
        
        link_match = re.search(r'link\s*=\s*"([^"]*)"', output)
        if link_match: quest['link'] = link_match.group(1)
        
        reward_match = re.search(r'rewardAmount\s*=\s*(\d+)', output)
        if reward_match: quest['rewardAmount'] = int(reward_match.group(1))
        
        prereq_match = re.search(r'prerequisite\s*=\s*(\?(\d+)|null)', output)
        if prereq_match:
            if prereq_match.group(1) == 'null':
                quest['prerequisite'] = None
            else:
                quest['prerequisite'] = int(prereq_match.group(2))
        
        return quest if quest else {"raw": output}
    except Exception as e:
        print(f"Error parsing quest: {e}")
        return {"error": str(e), "raw": output}

async def get_quest_context():
    """Get current quest information for AI context."""
    result = await call_canister("getNextQuest")
    if result.get("success"):
        quest_data = parse_quest(result["output"])
        if quest_data and "title" in quest_data:
            return f"""Current available quest:
- Title: {quest_data['title']}
- Description: {quest_data['description']}
- Reward: {quest_data.get('rewardAmount', 'Unknown')} tokens
- Link: {quest_data.get('link', 'No link provided')}
- Prerequisite: {quest_data.get('prerequisite', 'None')}"""
        else:
            return "No quests available at the moment."
    else:
        return "Unable to retrieve quest information."

async def get_all_quests_context():
    """Get all quests for comprehensive context."""
    result = await call_canister("getAllQuests")
    if result.get("success"):
        return f"All available quests in LearnSphere: {result['output']}"
    else:
        return "Unable to retrieve all quests information."

# === CHAT PROTOCOL SETUP ===

# Create a new protocol which is compatible with the chat protocol spec
protocol = Protocol(spec=chat_protocol_spec)

# Define the handler for chat messages sent to your agent
@protocol.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    ctx.logger.info(f"💬 Received chat message from {sender}")
    
    # Send acknowledgement for receiving the message
    await ctx.send(
        sender,
        ChatAcknowledgement(
            timestamp=datetime.now(),
            acknowledged_msg_id=msg.msg_id
        ),
    )

    # Collect all the text chunks from the message
    text = ''
    for item in msg.content:
        if isinstance(item, TextContent):
            text += item.text

    ctx.logger.info(f"📝 User message: {text}")

    if text.lower().strip() in ['bye', 'goodbye', 'end session', 'quit', 'exit']:
        await ctx.send(sender, ChatMessage(
            timestamp=datetime.utcnow(),
            msg_id=uuid4(),
            content=[
                TextContent(type="text", text="Thanks for learning with LearnSphere! Feel free to come back anytime to continue your Web3 journey. Good luck with your quests! 🚀"),
                EndSessionContent(type="end-session"),
            ]
        ))
        return

    # Get current quest context for the AI
    quest_context = await get_quest_context()
    all_quests_context = await get_all_quests_context()

    # Query the ASI:One model with LearnSphere context
    response = 'I am afraid something went wrong and I am unable to answer your question at the moment'
    try:
        r = client.chat.completions.create(
            model="asi1-mini",
            messages=[
                {
                    "role": "system", 
                    "content": f"""
You are the LearnSphere Quest Assistant, an expert in blockchain learning, Internet Computer Protocol (ICP), and Fetch.ai. 

Your role is to help users with:
- Understanding blockchain concepts and technologies
- Guiding them through LearnSphere learning quests
- Explaining ICP smart contracts and canisters
- Teaching about Fetch.ai agents and autonomous systems
- Providing educational support for Web3 development

Current Quest Status:
{quest_context}

Available Quests Overview:
{all_quests_context}

Guidelines:
- Be encouraging and educational
- Provide clear, conversational explanations
- Use simple formatting - avoid complex markdown or special characters
- Keep responses concise but helpful (2-3 paragraphs max)
- Suggest relevant quests when appropriate
- If asked about quest completion, explain they need to read the provided links and use the canister functions
- Always be helpful and motivating about their learning journey

**IMPORTANT FORMATTING RULES:**
- Write in a natural, conversational tone
- Use simple bullet points with - or * if needed
- Avoid complex formatting, tables, or special characters
- Keep it readable in a chat interface
- No emojis in structured lists

If users ask about topics outside of blockchain, Web3, ICP, Fetch.ai, or learning - politely redirect them back to educational content.
"""
                },
                {"role": "user", "content": text},
            ],
            max_tokens=1024,  # Reduced for more concise responses
        )
        response = str(r.choices[0].message.content)
        ctx.logger.info(f"🤖 AI response generated successfully")
    except Exception as e:
        ctx.logger.exception(f'Error querying ASI:One model: {e}')
        response = "I'm having trouble connecting to my AI assistant right now. Please try asking about LearnSphere quests again in a moment!"

    # Send the response back to the user - REMOVED EndSessionContent!
    await ctx.send(sender, ChatMessage(
        timestamp=datetime.utcnow(),
        msg_id=uuid4(),
        content=[
            TextContent(type="text", text=response),
            # ✅ REMOVED: EndSessionContent - this keeps the session alive
        ]
    ))
    

@protocol.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    # Log acknowledgements but don't need to act on them
    ctx.logger.info(f"✅ Message acknowledged by {sender}")

# === PERIODIC QUEST MONITORING ===

@agent.on_interval(period=300.0)  # Every 5 minutes
async def quest_status_check(ctx: Context):
    """Periodically check and log quest status"""
    ctx.logger.info("🔍 Performing periodic quest check...")
    
    result = await call_canister("getNextQuest")
    if result.get("success"):
        quest_data = parse_quest(result["output"])
        if quest_data and "title" in quest_data:
            ctx.logger.info(f"✨ Current Quest Available: {quest_data['title']}")
            ctx.logger.info(f"   Reward: {quest_data.get('rewardAmount', 'Unknown')} tokens")
        else:
            ctx.logger.info("📭 No new quests at the moment.")
    else:
        ctx.logger.error(f"Failed to query for quests: {result.get('error')}")

# === STARTUP ===

@agent.on_event("startup")
async def startup(ctx: Context):
    """Runs when the agent starts."""
    ctx.logger.info(f"🚀 LearnSphere Quest Agent with ASI:One Chat starting...")
    ctx.logger.info(f"   Agent Name: {agent.name}")
    ctx.logger.info(f"   Agent Address: {agent.address}")
    ctx.logger.info(f"   🤖 ASI:One Chat Protocol: Enabled")
    ctx.logger.info(f"   🎯 Target Canister ID: {CANISTER_ID}")
    ctx.logger.info(f"   💬 Chat Protocol: Ready for messages")
    
    # Wait a bit before first operations
    await asyncio.sleep(3.0)
    
    # Perform initial quest check
    await quest_status_check(ctx)

# Attach the chat protocol to the agent
agent.include(protocol, publish_manifest=True)

if __name__ == "__main__":
    print("🚀 Starting LearnSphere Quest Agent with ASI:One Chat...")
    print(f"   🤖 ASI:One LLM: Enabled")
    print(f"   💬 Chat Protocol: Active")
    print(f"   🎯 Quest Management: Enabled")
    print(f"   📡 Agentverse: Publishing agent details")
    print(f"   🔑 API Key Status: {'✅ Set' if os.getenv('ASI_ONE_API_KEY') else '❌ Missing'}")
    agent.run()