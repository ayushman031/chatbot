"use client"

import { useState, useEffect, useRef } from "react"
import {
  Bot,
  Gamepad2,
  Search,
  Send,
  Sparkles,
  User,
  Settings,
  Moon,
  Sun,
  BookMarked,
  Heart,
  Filter,
  ChevronDown,
  LogOut,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// Sample game data
const GAME_CATEGORIES = [
  { id: "arcade", name: "Arcade Classics" },
  { id: "nes", name: "NES" },
  { id: "snes", name: "SNES" },
  { id: "genesis", name: "Sega Genesis" },
  { id: "ps1", name: "PlayStation" },
  { id: "n64", name: "Nintendo 64" },
  { id: "gb", name: "Game Boy" },
  { id: "gba", name: "Game Boy Advance" },
  { id: "dreamcast", name: "Dreamcast" },
]

const POPULAR_GAMES = [
  {
    id: "pacman",
    name: "Pac-Man",
    category: "arcade",
    image: "/placeholder.svg?height=80&width=80",
    difficulty: "easy",
    year: 1980,
  },
  {
    id: "mario",
    name: "Super Mario Bros.",
    category: "nes",
    image: "/placeholder.svg?height=80&width=80",
    difficulty: "medium",
    year: 1985,
  },
  {
    id: "zelda",
    name: "The Legend of Zelda",
    category: "nes",
    image: "/placeholder.svg?height=80&width=80",
    difficulty: "hard",
    year: 1986,
  },
  {
    id: "sonic",
    name: "Sonic the Hedgehog",
    category: "genesis",
    image: "/placeholder.svg?height=80&width=80",
    difficulty: "medium",
    year: 1991,
  },
  {
    id: "ff7",
    name: "Final Fantasy VII",
    category: "ps1",
    image: "/placeholder.svg?height=80&width=80",
    difficulty: "hard",
    year: 1997,
  },
  {
    id: "mario64",
    name: "Super Mario 64",
    category: "n64",
    image: "/placeholder.svg?height=80&width=80",
    difficulty: "medium",
    year: 1996,
  },
  {
    id: "tetris",
    name: "Tetris",
    category: "gb",
    image: "/placeholder.svg?height=80&width=80",
    difficulty: "easy",
    year: 1989,
  },
  {
    id: "pokemon",
    name: "Pokémon Red/Blue",
    category: "gb",
    image: "/placeholder.svg?height=80&width=80",
    difficulty: "medium",
    year: 1996,
  },
  {
    id: "metroid",
    name: "Super Metroid",
    category: "snes",
    image: "/placeholder.svg?height=80&width=80",
    difficulty: "hard",
    year: 1994,
  },
  {
    id: "castlevania",
    name: "Castlevania: Symphony of the Night",
    category: "ps1",
    image: "/placeholder.svg?height=80&width=80",
    difficulty: "hard",
    year: 1997,
  },
  {
    id: "donkeykong",
    name: "Donkey Kong Country",
    category: "snes",
    image: "/placeholder.svg?height=80&width=80",
    difficulty: "medium",
    year: 1994,
  },
  {
    id: "streetfighter",
    name: "Street Fighter II",
    category: "arcade",
    image: "/placeholder.svg?height=80&width=80",
    difficulty: "hard",
    year: 1991,
  },
]

// Sample tips data (fallback if AI fails)
const GAME_TIPS = {
  pacman: [
    "Each ghost has a unique personality and movement pattern",
    "The ghosts turn blue and can be eaten after consuming a Power Pellet",
    "Memorize the maze layout to plan escape routes",
    "Focus on clearing one section of the maze at a time",
  ],
  mario: [
    "Hold B while running to sprint and jump farther",
    "You can jump on most enemies to defeat them",
    "Hidden blocks often contain power-ups or 1-UPs",
    "Warp pipes can lead to secret areas or shortcuts",
  ],
  zelda: [
    "Burn bushes and bomb walls to find secret passages",
    "The boomerang can stun enemies and collect items",
    "Heart containers increase your maximum health",
    "Talk to everyone in towns for valuable hints",
  ],
  sonic: [
    "Maintain momentum to clear loops and ramps",
    "Spin dash by pressing down + jump, then release",
    "Rings provide protection - when hit, you'll lose rings instead of dying",
    "Look for hidden paths in the ceiling and floors",
  ],
  ff7: [
    "Pair complementary Materia for powerful combinations",
    "Back row characters take less damage but deal less physical damage",
    "Use Sense materia to learn enemy weaknesses",
    "Save limit breaks for boss battles",
  ],
  mario64: [
    "The longer you hold the jump button, the higher Mario jumps",
    "Wall kicks can help you reach high places",
    "Triple jumps cover the most distance",
    "Stars can be collected in any order within a level",
  ],
}

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  game?: string
  isLoading?: boolean
}

interface UserPreferences {
  theme: "dark" | "light" | "system"
  difficultyFilter: string | null
  eraFilter: string | null
  favoriteGames: string[]
  notificationEnabled: boolean
  tipDetailLevel: number // 1-3 (basic, detailed, comprehensive)
}

// Custom component for rendering markdown with proper styling
const MarkdownContent = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      className="text-gray-300"
      components={{
        // Style headings
        h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-2 text-white" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-lg font-bold my-2 text-white" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-md font-bold my-2 text-white" {...props} />,

        // Style paragraphs
        p: ({ node, ...props }) => <p className="mb-2" {...props} />,

        // Style lists
        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,

        // Style emphasis
        strong: ({ node, ...props }) => <strong className="font-bold text-purple-300" {...props} />,
        em: ({ node, ...props }) => <em className="italic text-gray-200" {...props} />,

        // Style code blocks
        code: ({ node, ...props }) => <code className="bg-gray-700 px-1 rounded text-xs" {...props} />,

        // Style links
        a: ({ node, ...props }) => <a className="text-purple-400 hover:underline" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default function RetroGamingGuide() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to RetroTips! I'm your classic gaming assistant powered by Gemini 2.0 Flash. What game would you like tips for today?",
    },
  ])
  const [input, setInput] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [userName, setUserName] = useState("Player One")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    theme: "dark",
    difficultyFilter: null,
    eraFilter: null,
    favoriteGames: [],
    notificationEnabled: true,
    tipDetailLevel: 2,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Filter games based on category, search, and preferences
  const filteredGames = POPULAR_GAMES.filter((game) => !selectedCategory || game.category === selectedCategory)
    .filter((game) => !searchQuery || game.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((game) => !userPreferences.difficultyFilter || game.difficulty === userPreferences.difficultyFilter)
    .filter((game) => {
      if (!userPreferences.eraFilter) return true
      const year = game.year
      if (userPreferences.eraFilter === "80s") return year >= 1980 && year < 1990
      if (userPreferences.eraFilter === "90s") return year >= 1990 && year < 2000
      return true
    })

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Toggle favorite game
  const toggleFavorite = (gameId: string) => {
    setUserPreferences((prev) => {
      const isFavorite = prev.favoriteGames.includes(gameId)
      return {
        ...prev,
        favoriteGames: isFavorite ? prev.favoriteGames.filter((id) => id !== gameId) : [...prev.favoriteGames, gameId],
      }
    })
  }

  // Get AI response from Gemini
  const getAIResponse = async (userMessage: string, gameContext?: string) => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userMessage,
          gameContext: gameContext,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()

      // Add a note if using fallback responses
      if (data.fromFallback) {
        return data.response
      }

      return data.response
    } catch (error) {
      console.error("Error getting AI response:", error)
      // Fallback to static tips if AI fails
      if (gameContext && GAME_TIPS[gameContext]) {
        return `Here are some tips for ${POPULAR_GAMES.find((g) => g.id === gameContext)?.name || gameContext}:\n\n• ${GAME_TIPS[gameContext].join("\n• ")}\n\n(Note: Using offline tips due to connection issues.)`
      }
      return "I'm having trouble connecting right now. Please try again in a moment, or ask about a specific game like Pac-Man, Mario, or Zelda for offline tips."
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])

    // Add loading message
    const loadingId = (Date.now() + 1).toString()
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: "assistant",
        content: "",
        isLoading: true,
      },
    ])

    setInput("")

    // Check if user mentioned a game
    let gameContext = selectedGame
    for (const game of POPULAR_GAMES) {
      if (input.toLowerCase().includes(game.name.toLowerCase())) {
        gameContext = game.id
        setSelectedGame(game.id)
        break
      }
    }

    // Get AI response
    const aiResponse = await getAIResponse(input, gameContext || undefined)

    // Remove loading message and add AI response
    setMessages((prev) => prev.filter((msg) => msg.id !== loadingId))

    const botResponse: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: aiResponse,
      game: gameContext || undefined,
    }

    setMessages((prev) => [...prev, botResponse])
  }

  const handleGameSelect = async (gameId: string) => {
    setSelectedGame(gameId)

    // Get game name
    const game = POPULAR_GAMES.find((g) => g.id === gameId)
    if (!game) return

    // Add loading message
    const loadingId = Date.now().toString()
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: "assistant",
        content: "",
        game: gameId,
        isLoading: true,
      },
    ])

    // Get AI response for the selected game
    const prompt = `Give me tips and strategies for playing ${game.name}. Focus on the most useful techniques, secrets, and strategies.`
    const aiResponse = await getAIResponse(prompt, gameId)

    // Remove loading message and add AI response
    setMessages((prev) => prev.filter((msg) => msg.id !== loadingId))

    const botResponse: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: aiResponse,
      game: gameId,
    }

    setMessages((prev) => [...prev, botResponse])
  }

  // Update theme based on user preference
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (userPreferences.theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(userPreferences.theme)
    }
  }, [userPreferences.theme])

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-950">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-purple-400" />
              <h1 className="text-xl font-bold text-white">RetroTips</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setUserPreferences((prev) => ({ ...prev, theme: "light" }))}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUserPreferences((prev) => ({ ...prev, theme: "dark" }))}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUserPreferences((prev) => ({ ...prev, theme: "system" }))}>
                  <span className="mr-2">💻</span>
                  <span>System</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <Dialog>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>Customize your RetroTips experience</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="tipDetail">Tip Detail Level</Label>
                        <Slider
                          id="tipDetail"
                          min={1}
                          max={3}
                          step={1}
                          value={[userPreferences.tipDetailLevel]}
                          onValueChange={(value) =>
                            setUserPreferences((prev) => ({ ...prev, tipDetailLevel: value[0] }))
                          }
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Basic</span>
                          <span>Detailed</span>
                          <span>Comprehensive</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="notifications"
                          checked={userPreferences.notificationEnabled}
                          onCheckedChange={(checked) =>
                            setUserPreferences((prev) => ({ ...prev, notificationEnabled: checked }))
                          }
                        />
                        <Label htmlFor="notifications">Enable notifications</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search games..."
              className="pl-8 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus-visible:ring-purple-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-gray-400">CATEGORIES</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-400">
                    <Filter className="h-4 w-4 mr-1" />
                    <span>Filter</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Difficulty</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setUserPreferences((prev) => ({ ...prev, difficultyFilter: null }))}>
                    All Difficulties
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setUserPreferences((prev) => ({ ...prev, difficultyFilter: "easy" }))}
                  >
                    Easy
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setUserPreferences((prev) => ({ ...prev, difficultyFilter: "medium" }))}
                  >
                    Medium
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setUserPreferences((prev) => ({ ...prev, difficultyFilter: "hard" }))}
                  >
                    Hard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Era</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setUserPreferences((prev) => ({ ...prev, eraFilter: null }))}>
                    All Eras
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setUserPreferences((prev) => ({ ...prev, eraFilter: "80s" }))}>
                    1980s
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setUserPreferences((prev) => ({ ...prev, eraFilter: "90s" }))}>
                    1990s
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700",
                  selectedCategory === null && "bg-gray-700 text-white",
                )}
                onClick={() => setSelectedCategory(null)}
              >
                All Games
              </Button>
              {GAME_CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700",
                    selectedCategory === category.id && "bg-gray-700 text-white",
                  )}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-400">GAMES</h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-gray-400 hover:text-white"
              onClick={() => setSelectedCategory("favorites")}
            >
              <BookMarked className="h-4 w-4 mr-1" />
              <span>Favorites</span>
            </Button>
          </div>

          {selectedCategory === "favorites" ? (
            userPreferences.favoriteGames.length > 0 ? (
              <div className="grid gap-2">
                {POPULAR_GAMES.filter((game) => userPreferences.favoriteGames.includes(game.id)).map((game) => (
                  <div
                    key={game.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors",
                      selectedGame === game.id && "bg-gray-700",
                    )}
                  >
                    <button className="flex-1 flex items-center gap-3" onClick={() => handleGameSelect(game.id)}>
                      <img
                        src={game.image || "/placeholder.svg"}
                        alt={game.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <span className="text-sm text-gray-200">{game.name}</span>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-purple-400"
                      onClick={() => toggleFavorite(game.id)}
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No favorite games yet</p>
            )
          ) : (
            <div className="grid gap-2">
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors",
                    selectedGame === game.id && "bg-gray-700",
                  )}
                >
                  <button className="flex-1 flex items-center gap-3" onClick={() => handleGameSelect(game.id)}>
                    <img
                      src={game.image || "/placeholder.svg"}
                      alt={game.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div>
                      <span className="text-sm text-gray-200">{game.name}</span>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs py-0 h-5">
                          {game.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs py-0 h-5">
                          {game.year}
                        </Badge>
                      </div>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      userPreferences.favoriteGames.includes(game.id)
                        ? "text-purple-400"
                        : "text-gray-400 hover:text-purple-400",
                    )}
                    onClick={() => toggleFavorite(game.id)}
                  >
                    <Heart
                      className={cn("h-4 w-4", userPreferences.favoriteGames.includes(game.id) && "fill-current")}
                    />
                  </Button>
                </div>
              ))}
              {filteredGames.length === 0 && (
                <p className="text-sm text-gray-400 italic">No games match your filters</p>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback className="bg-purple-600">{userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-white">{userName}</p>
              <p className="text-xs text-gray-400">Retro Enthusiast</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <Tabs defaultValue="chat" className="flex flex-col flex-1">
          <div className="border-b border-gray-800 px-4">
            <TabsList className="h-14 bg-transparent">
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
              >
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="explore"
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
              >
                Explore Games
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
              >
                Favorites
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 flex flex-col pt-4">
            <ScrollArea className="flex-1 px-4">
              <div className="max-w-2xl mx-auto space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 p-4 rounded-lg",
                      message.role === "user" ? "bg-gray-800" : "bg-gray-900 border border-gray-800",
                    )}
                  >
                    {message.role === "user" ? (
                      <Avatar>
                        <AvatarFallback className="bg-purple-600">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar>
                        <AvatarFallback className="bg-purple-500">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">
                          {message.role === "user" ? userName : "RetroTips AI"}
                        </p>
                        {message.game && (
                          <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded-full">
                            {POPULAR_GAMES.find((g) => g.id === message.game)?.name}
                          </span>
                        )}
                      </div>
                      <div className="mt-1">
                        {message.isLoading ? (
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-3/4 bg-gray-700" />
                            <Skeleton className="h-4 w-full bg-gray-700" />
                            <Skeleton className="h-4 w-2/3 bg-gray-700" />
                          </div>
                        ) : (
                          <MarkdownContent content={message.content} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-gray-800">
              <div className="max-w-2xl mx-auto flex gap-2">
                <Input
                  placeholder="Ask for gaming tips..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus-visible:ring-purple-500"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="sr-only">Send</span>
                </Button>
              </div>
              <div className="max-w-2xl mx-auto mt-2 flex items-center gap-2 text-xs text-gray-500">
                <Sparkles className="h-3 w-3" />
                <span>Powered by Gemini 2.0 Flash</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="explore" className="flex-1 p-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-white mb-4">Explore Classic Games</h2>

              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  All
                </Button>
                {GAME_CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={selectedCategory === category.id ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGames.map((game) => (
                  <div
                    key={game.id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={game.image || "/placeholder.svg"}
                        alt={game.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-white">{game.name}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-8 w-8",
                              userPreferences.favoriteGames.includes(game.id)
                                ? "text-purple-400"
                                : "text-gray-400 hover:text-purple-400",
                            )}
                            onClick={() => toggleFavorite(game.id)}
                          >
                            <Heart
                              className={cn(
                                "h-4 w-4",
                                userPreferences.favoriteGames.includes(game.id) && "fill-current",
                              )}
                            />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-400">
                          {GAME_CATEGORIES.find((c) => c.id === game.category)?.name} • {game.year}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {game.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {game.year >= 1990 ? "90s" : "80s"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">
                      {GAME_TIPS[game.id]
                        ? GAME_TIPS[game.id][0] + "..."
                        : "Get tips and strategies for this classic game."}
                    </p>
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => {
                        handleGameSelect(game.id)
                        document.querySelector('[data-state="active"][value="chat"]')?.click()
                      }}
                    >
                      Get Tips
                    </Button>
                  </div>
                ))}
              </div>

              {filteredGames.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No games match your current filters</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSelectedCategory(null)
                      setUserPreferences((prev) => ({
                        ...prev,
                        difficultyFilter: null,
                        eraFilter: null,
                      }))
                      setSearchQuery("")
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="flex-1 p-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-white mb-4">Your Favorite Games</h2>

              {userPreferences.favoriteGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {POPULAR_GAMES.filter((game) => userPreferences.favoriteGames.includes(game.id)).map((game) => (
                    <div
                      key={game.id}
                      className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={game.image || "/placeholder.svg"}
                          alt={game.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-white">{game.name}</h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-purple-400"
                              onClick={() => toggleFavorite(game.id)}
                            >
                              <Heart className="h-4 w-4 fill-current" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-400">
                            {GAME_CATEGORIES.find((c) => c.id === game.category)?.name} • {game.year}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">
                        {GAME_TIPS[game.id]
                          ? GAME_TIPS[game.id][0] + "..."
                          : "Get tips and strategies for this classic game."}
                      </p>
                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => {
                          handleGameSelect(game.id)
                          document.querySelector('[data-state="active"][value="chat"]')?.click()
                        }}
                      >
                        Get Tips
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                  <Heart className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No favorites yet</h3>
                  <p className="text-gray-400 mb-4">Add games to your favorites by clicking the heart icon</p>
                  <Button
                    variant="outline"
                    onClick={() => document.querySelector('[data-state="active"][value="explore"]')?.click()}
                  >
                    Explore Games
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

