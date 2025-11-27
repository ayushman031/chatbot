import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt, gameContext } = await req.json()

    // Check if API key is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.warn("GOOGLE_GENERATIVE_AI_API_KEY is not set")
      // Return a fallback response
      return NextResponse.json({
        response: getFallbackResponse(gameContext, prompt),
        fromFallback: true,
      })
    }

    // Create a system prompt that guides the model to respond as a retro gaming expert
    const systemPrompt = `You are RetroTips AI, an expert on classic and retro video games.
    You provide helpful, accurate, and enthusiastic tips for gamers.
    Keep responses conversational, friendly, and concise.
    Focus on practical gameplay advice, hidden secrets, and strategies.
    ${gameContext ? `The user is specifically asking about ${gameContext}.` : ""}
    If you don't know about a specific game, suggest similar games you do know about.
    Always maintain a positive, encouraging tone.`

    // Generate response using Gemini 2.0 Flash
    const response = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: prompt,
      system: systemPrompt,
      maxTokens: 500,
    })

    return NextResponse.json({
      response: response.text,
      fromFallback: false,
    })
  } catch (error) {
    console.error("Error generating response:", error)
    const { prompt, gameContext } = await req.json().catch(() => ({ prompt: "", gameContext: "" }))

    // Return a fallback response
    return NextResponse.json({
      response: getFallbackResponse(gameContext, prompt),
      fromFallback: true,
      error: error.message,
    })
  }
}

// Fallback responses for when the API is unavailable
function getFallbackResponse(gameContext: string, prompt: string): string {
  // Game-specific fallback tips
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
    tetris: [
      "Plan ahead for the I-piece to clear four lines at once (Tetris)",
      "Keep the stack as low as possible",
      "Leave a column open for the I-piece",
      "Use the wall to your advantage for T-spins",
    ],
    pokemon: [
      "Different Pokémon types have strengths and weaknesses against others",
      "Keep a balanced team with different types",
      "Save your Master Ball for rare legendary Pokémon",
      "Talk to all NPCs for valuable items and information",
    ],
    metroid: [
      "Use the morph ball to access small passages",
      "Wall jump by jumping against a wall and pressing in the opposite direction",
      "Shoot walls to find hidden passages",
      "Save often at save stations",
    ],
    castlevania: [
      "Equip two different weapons to switch between them",
      "Familiars can help in combat and finding secrets",
      "The Crissaegrim is one of the most powerful weapons",
      "Explore the inverted castle for the true ending",
    ],
    donkeykong: [
      "Roll-jump to reach farther distances",
      "Look for hidden bonus barrels",
      "DK barrels contain Diddy or Donkey Kong if you've lost one",
      "Collect KONG letters for extra lives",
    ],
    streetfighter: [
      "Learn to block and counter attacks",
      "Practice special move inputs until they become muscle memory",
      "Different characters have different speeds and strengths",
      "Use throws against defensive opponents",
    ],
  }

  // Game names for context
  const GAME_NAMES = {
    pacman: "Pac-Man",
    mario: "Super Mario Bros.",
    zelda: "The Legend of Zelda",
    sonic: "Sonic the Hedgehog",
    ff7: "Final Fantasy VII",
    mario64: "Super Mario 64",
    tetris: "Tetris",
    pokemon: "Pokémon Red/Blue",
    metroid: "Super Metroid",
    castlevania: "Castlevania: Symphony of the Night",
    donkeykong: "Donkey Kong Country",
    streetfighter: "Street Fighter II",
  }

  // If we have tips for the requested game
  if (gameContext && GAME_TIPS[gameContext]) {
    const gameName = GAME_NAMES[gameContext] || gameContext
    return `Here are some tips for ${gameName}:\n\n• ${GAME_TIPS[gameContext].join("\n• ")}\n\n(Note: I'm currently using offline tips. For more detailed advice, please try again later.)`
  }

  // Generic response for greetings
  if (prompt.toLowerCase().includes("hello") || prompt.toLowerCase().includes("hi")) {
    return "Hey there! I'm currently using offline mode, but I can still help with tips for classic games. What would you like to know about?"
  }

  // Default fallback
  return "I'm currently in offline mode but can still provide tips for many classic games like Pac-Man, Super Mario Bros., Zelda, Sonic, Final Fantasy VII, and more. Just ask about a specific game!"
}

