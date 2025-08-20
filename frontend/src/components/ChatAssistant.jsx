// src/components/ChatAssistant.jsx
import React, { useState, useEffect, useRef } from "react";
import { Bip39, Random } from "@cosmjs/crypto";
import { DirectSecp256k1HdWallet}  from "@cosmjs/proto-signing";

// Your LearnSphere agent's address from the terminal when you run it
const AGENT_ADDRESS =
  "agent1qghztqzczs2ge47xz7xr3vduust7zagw4zfdefpeg74e253paquf6gwr0lu"; // IMPORTANT: Replace with your agent's actual address

// Agentverse endpoints
const AGENTVERSE_URL = "https://agentverse.ai/v1";

const ChatAssistant = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [userWallet, setUserWallet] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Effect to create a temporary wallet for the user session
  useEffect(() => {
    const createWallet = async () => {
      try {
        // 1. Generate entropy & mnemonic
        const entropy = Random.getBytes(32);
        const mnemonic = Bip39.encode(entropy).toString();

        // 2. Create wallet from mnemonic
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
          prefix: "fetch", // or "fetch" depending on your chain
        });

        // 3. Get account address
        const [{ address }] = await wallet.getAccounts();

        setUserWallet(wallet);
        setUserAddress(address);

        setMessages([
          {
            text: "Hello! I'm the LearnSphere assistant. How can I help you today?",
            sender: "agent",
          },
        ]);
      } catch (err) {
        console.error("❌ Error creating wallet:", err);
      }
    };
    createWallet();
  }, []);

  // Effect to scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || !userWallet || !userAddress || isLoading) return;

    const newMessages = [...messages, { text: userInput, sender: "user" }];
    setMessages(newMessages);
    setUserInput("");
    setIsLoading(true);

    try {
      // 1. Define the message payload
      const message = {
        type: "ChatMessage",
        content: [
          {
            type: "TextContent",
            text: userInput,
          },
        ],
        timestamp: new Date().toISOString(),
        msg_id: crypto.randomUUID(),
      };

      // 2. Prepare the envelope to be signed
      const envelope = {
        version: 1,
        sender: userAddress,
        target: AGENT_ADDRESS,
        session: crypto.randomUUID(),
        protocol: "uagents.contrib.chat.Chat",
        payload: JSON.stringify(message),
        expires: Math.floor(Date.now() / 1000) + 300, // Expires in 5 minutes
      };

      const envelopeBytes = new TextEncoder().encode(JSON.stringify(envelope));

      // 3. Sign the envelope
      const { signature } = await userWallet.signDirect(userAddress, {
        bodyBytes: envelopeBytes,
        authInfoBytes: new Uint8Array(),
        chainId: "",
        accountNumber: 0,
      });

      // 4. Send the signed message
      await fetch(`${AGENTVERSE_URL}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          envelope: JSON.stringify(envelope),
          signature: signature.signature,
          public_key: signature.pub_key.value,
        }),
      });

      // 5. Poll for a response
      pollForResponse(userAddress);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([
        ...newMessages,
        {
          text: "Sorry, I couldn't send your message. Please try again.",
          sender: "agent",
        },
      ]);
      setIsLoading(false);
    }
  };

  const pollForResponse = async (address) => {
    let attempts = 0;
    const maxAttempts = 30; // Poll for 30 seconds

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${AGENTVERSE_URL}/peek/${address}`);
        if (response.status === 200) {
          const incoming = await response.json();
          const messagePayload = JSON.parse(incoming.payload);
          const responseText = messagePayload.content.find(
            (c) => c.type === "TextContent"
          )?.text;

          if (responseText) {
            setMessages((prev) => [
              ...prev,
              { text: responseText, sender: "agent" },
            ]);
          }
          clearInterval(intervalId);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error polling for messages:", error);
        clearInterval(intervalId);
        setIsLoading(false);
      }

      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(intervalId);
        setMessages((prev) => [
          ...prev,
          {
            text: "Sorry, I didn't receive a response. The agent might be busy. Please try again.",
            sender: "agent",
          },
        ]);
        setIsLoading(false);
      }
    }, 1000); // Check every second
  };

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col w-[400px] h-[600px] border border-white/20 rounded-2xl shadow-2xl bg-slate-900/50 backdrop-blur-md text-white overflow-hidden">
      {/* Message Area */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[80%] p-3 rounded-lg ${
              msg.sender === "user"
                ? "self-end bg-blue-600"
                : "self-start bg-slate-700"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="self-start bg-slate-700 p-3 rounded-lg">...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/20 flex items-center">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Ask about ICP, Fetch.ai, or quests..."
          className="flex-1 px-4 py-2 rounded-full border border-slate-600 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          className="ml-3 px-6 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatAssistant;
