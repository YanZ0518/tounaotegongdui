"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Send } from "lucide-react"

type Character = "joy" | "anger" | "sadness"

interface CharacterData {
  id: Character
  name: string
  image: string
  avatarImage: string
  glowColor: string
  shadowColor: string
  themeColor: string
  bgGradient: string
}

const characters: CharacterData[] = [
  {
    id: "anger",
    name: "Anger",
    image: "/images/anger.png",
    avatarImage: "/images/anger-avatar-new.png", // Updated to use new image
    glowColor: "rgba(239, 68, 68, 0.6)",
    shadowColor: "rgba(239, 68, 68, 0.5)",
    themeColor: "rgb(239, 68, 68)",
    bgGradient: "from-red-900/20 via-red-800/30 to-red-700/20",
  },
  {
    id: "joy",
    name: "Joy",
    image: "/images/joy.png",
    avatarImage: "/images/joy-avatar.jpeg",
    glowColor: "rgba(234, 179, 8, 0.6)",
    shadowColor: "rgba(234, 179, 8, 0.5)",
    themeColor: "rgb(234, 179, 8)",
    bgGradient: "from-yellow-900/20 via-yellow-800/30 to-yellow-700/20",
  },
  {
    id: "sadness",
    name: "Sadness",
    image: "/images/sadness.png",
    avatarImage: "/images/sadness-avatar.jpeg",
    glowColor: "rgba(59, 130, 246, 0.6)",
    shadowColor: "rgba(59, 130, 246, 0.5)",
    themeColor: "rgb(59, 130, 246)",
    bgGradient: "from-blue-900/20 via-blue-800/30 to-blue-700/20",
  },
]

interface Message {
  id: string
  text: string
  sender: "user" | "character"
  timestamp: Date
}

export default function ChatbotSelection() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character>("joy")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")

  const selectedData = characters.find((char) => char.id === selectedCharacter)

  const handleDoubleClick = (character: Character) => {
    setSelectedCharacter(character)
    setIsChatOpen(true)
    // Add initial greeting message
    const greetings = {
      joy: "Hi there! I'm Joy! Ready to spread some happiness today? ✨",
      anger: "What do you want?! I'm busy being angry about everything!",
      sadness: "Oh... hello. I guess we can talk if you want to... *sigh*",
    }
    setMessages([
      {
        id: Date.now().toString(),
        text: greetings[character],
        sender: "character",
        timestamp: new Date(),
      },
    ])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a ${selectedCharacter} character. Respond accordingly.`
            },
            {
              role: 'user',
              content: inputMessage
            }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          sender: "character",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I encountered an error. Please try again.",
          sender: "character",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-8">
      {/* Background blur overlay when chat is open */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
            onClick={() => setIsChatOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Dynamic Character Name */}
      <div className="mb-16 text-center">
        <AnimatePresence mode="wait">
          <motion.h1
            key={selectedCharacter}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="text-6xl font-bold text-white italic tracking-wide"
            style={{
              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            {selectedData?.name}
          </motion.h1>
        </AnimatePresence>
      </div>

      {/* Character Cards Container */}
      <div className="flex items-center justify-center gap-12 w-full max-w-6xl">
        {characters.map((character) => {
          const isSelected = character.id === selectedCharacter
          const isNotSelected = character.id !== selectedCharacter

          return (
            <motion.div
              key={character.id}
              className="relative cursor-pointer"
              onClick={() => setSelectedCharacter(character.id)}
              onDoubleClick={() => handleDoubleClick(character.id)}
              animate={{
                scale: isSelected ? 1.2 : isNotSelected ? 0.85 : 1,
                x: isSelected
                  ? 0
                  : selectedCharacter === "joy" && character.id === "anger"
                    ? -40
                    : selectedCharacter === "joy" && character.id === "sadness"
                      ? 40
                      : selectedCharacter === "anger" && character.id === "joy"
                        ? 40
                        : selectedCharacter === "anger" && character.id === "sadness"
                          ? 80
                          : selectedCharacter === "sadness" && character.id === "anger"
                            ? -80
                            : selectedCharacter === "sadness" && character.id === "joy"
                              ? -40
                              : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.6,
              }}
              whileHover={
                !isSelected
                  ? {
                      scale: 0.9,
                      y: -10,
                    }
                  : {}
              }
              style={{
                filter: isSelected ? "drop-shadow(0 0 20px " + character.glowColor + ")" : "none",
                transition: "filter 0.5s ease-out",
              }}
            >
              <motion.div
                className="relative"
                animate={{
                  filter: isSelected
                    ? `drop-shadow(0 20px 30px ${character.shadowColor})`
                    : "drop-shadow(0 10px 15px rgba(0,0,0,0.3))",
                }}
                transition={{ duration: 0.4 }}
              >
                <motion.img
                  src={character.image}
                  alt={character.name}
                  className="max-h-[300px] object-contain"
                  style={{
                    maxWidth: isSelected ? "280px" : "200px",
                    transition: "max-width 0.5s ease-out",
                  }}
                  animate={{
                    y: isSelected ? -10 : 0,
                  }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
                />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Updated Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-20 text-slate-300 text-base text-center whitespace-nowrap"
      >
        Double-click a chatbot personality to begin the conversation.
      </motion.p>

      {/* Floating Chat Interface */}
      <AnimatePresence>
        {isChatOpen && selectedData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex flex-col"
          >
            <div
              className={`
              h-full rounded-2xl backdrop-blur-xl bg-gradient-to-br ${selectedData.bgGradient}
              border border-white/20 shadow-2xl overflow-hidden
              bg-black/40 flex flex-col
            `}
            >
              {/* Chat Header */}
              <div className="flex items-center gap-4 p-6 border-b border-white/10 flex-shrink-0">
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${
                        selectedData.id === "anger" ? "bg-red-500" : "bg-transparent"
                      }`}
                    >
                      {selectedData.id === "anger" ? (
                        <img
                          src={selectedData.avatarImage || "/placeholder.svg"}
                          alt={selectedData.name}
                          className="w-10 h-10 object-contain"
                          style={{
                            filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))",
                          }}
                        />
                      ) : (
                        <img
                          src={selectedData.avatarImage || "/placeholder.svg"}
                          alt={selectedData.name}
                          className="w-12 h-12 object-cover rounded-full"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{selectedData.name} Chatbot</h3>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.sender === "character" && (
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${
                            selectedData.id === "anger" ? "bg-red-500" : "bg-transparent"
                          }`}
                        >
                          {selectedData.id === "anger" ? (
                            <img
                              src={selectedData.avatarImage || "/placeholder.svg"}
                              alt={selectedData.name}
                              className="w-7 h-7 object-contain"
                              style={{
                                filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.8))",
                              }}
                            />
                          ) : (
                            <img
                              src={selectedData.avatarImage || "/placeholder.svg"}
                              alt={selectedData.name}
                              className="w-8 h-8 object-cover rounded-full"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.sender === "user" ? "bg-white/20 text-white ml-auto" : "bg-white/10 text-white"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>

                    {message.sender === "user" && <div className="w-8 h-8 rounded-full bg-gray-400/50 flex-shrink-0" />}
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-white/10 flex-shrink-0">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-3 rounded-full transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: selectedData.themeColor,
                      boxShadow: `0 4px 15px ${selectedData.shadowColor}`,
                    }}
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
