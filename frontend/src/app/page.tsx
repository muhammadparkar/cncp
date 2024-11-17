'use client'

import { useEffect, useRef, useState } from "react"
import { Send, User } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import io from "socket.io-client"

export default function Component() {
  const [socket, setSocket] = useState<any>(null)
  const [message, setMessage] = useState<string>("")
  const [messages, setMessages] = useState<{ userName: string, msg: string, isMe: boolean }[]>([])
  const [userName, setUserName] = useState<string>("")
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const newSocket = io("http://localhost:3000")
    setSocket(newSocket)

    newSocket.on("ask name", () => {
      const name = prompt("Enter your name:")
      if (name) {
        setUserName(name)
        newSocket.emit("set name", name)
      }
    })

    newSocket.on("chat message", (msg) => {
      // Add the message to state, but only if it's not from the current user (isMe = false)
      if (msg.userName !== userName) {
        setMessages((prevMessages) => [...prevMessages, { userName: msg.userName, msg: msg.msg, isMe: false }])
      }
      scrollToBottom()
    })

    return () => {
      newSocket.close()
    }
  }, [userName])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      socket.emit("chat message", message)
      // Don't show your own message in the chat for yourself
      setMessages((prevMessages) => [...prevMessages, { userName: userName, msg: message, isMe: true }])
      setMessage("")
      scrollToBottom()
    }
  }

  return (
    <div className="h-screen w-screen flex justify-center items-center">
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Real-Time Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea ref={scrollAreaRef} className="h-[500px] pr-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                <Avatar>
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] break-words ${
                    msg.isMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {/* Show name only for other users */}
                  {!msg.isMe && (
                    <div className="font-medium text-sm mb-1">
                      {msg.userName}
                    </div>
                  )}
                  <div>{msg.msg}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <form onSubmit={handleMessageSubmit} className="flex gap-2 mt-4">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
  )
}
