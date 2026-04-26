// Villain data per world. Each entry mirrors the design's level structure:
// - villain (name, emoji, color, hp, taunt lines, defeatLine, bgGradient, scenery)
// - lesson (title, steps, example) shown before battle
// World id keys map onto the existing GENS map and WORLDS list.

export const VILLAINS = {
  proper: {
    villain: {
      name: "Shardex the Glass Goblin", emoji: "🧌", color: "#2d8a5a", hp: 5,
      taunt: [
        { speaker: "villain", text: "Heheheh... you dare enter MY plains? The first shard is MINE, little wizard!" },
        { speaker: "villain", text: "A proper fraction means the top number is SMALLER than the bottom — like MY patience with YOU. Zero!" },
        { speaker: "eldrin", text: "Careful! Shardex feeds on confusion. Remember: a proper fraction is always less than 1. The numerator (top) is always smaller than the denominator (bottom)." },
      ],
      defeatLine: "N-NO! How?! The shard... it belongs to Arithmia now... curse you...",
      bgGradient: "linear-gradient(180deg, #0d3320 0%, #1a5c35 40%, #0a1f10 100%)",
      scenery: "🌿🌱🍃",
    },
    lesson: {
      title: "What is a Proper Fraction?",
      steps: [
        "A fraction has a TOP (numerator) and a BOTTOM (denominator).",
        "PROPER fraction → top < bottom → value is LESS than 1.",
        "Example: 3/5 means '3 out of 5 equal pieces'.",
      ],
      example: { n: "3", d: "5", label: "3 < 5 → PROPER ✓" },
    },
  },

  improper: {
    villain: {
      name: "Grublor the Overflow Troll", emoji: "👹", color: "#1b4f72", hp: 5,
      taunt: [
        { speaker: "villain", text: "RAAAAH! I OVERFLOW with power! My fractions are BIGGER than one whole — just like my fists!" },
        { speaker: "villain", text: "You cannot handle IMPROPER fractions, little wizard! The top number is BIGGER than the bottom — CHAOS!" },
        { speaker: "eldrin", text: "Steady now! An improper fraction has a numerator BIGGER than its denominator. To convert to a mixed number: divide top ÷ bottom, the remainder becomes the new top!" },
      ],
      defeatLine: "IMPOSSIBLE! I was so... big... and yet you... converted me... to nothing...",
      bgGradient: "linear-gradient(180deg, #060d1f 0%, #0d2545 40%, #071530 100%)",
      scenery: "🌊🏝️🌴",
    },
    lesson: {
      title: "Improper Fractions",
      steps: [
        "IMPROPER → top ≥ bottom → value is MORE than 1.",
        "To convert: divide numerator ÷ denominator.",
        "Quotient = whole number, remainder = new numerator.",
      ],
      example: { n: "11", d: "4", label: "11 ÷ 4 = 2 r 3 → 2 and 3/4" },
    },
  },

  mixed: {
    villain: {
      name: "Mixella the Split Witch", emoji: "🧙‍♀️", color: "#6c3483", hp: 5,
      taunt: [
        { speaker: "villain", text: "Welcome to my mountain, little hero... I am both whole and fraction — TWO things at once. Can your simple mind grasp that?" },
        { speaker: "villain", text: "Mixed numbers are my power! Part whole number, part fraction... a beautiful ABOMINATION!" },
        { speaker: "eldrin", text: "Mixed numbers combine a whole number with a proper fraction. To convert to improper: multiply the whole by the denominator, then add the numerator!" },
      ],
      defeatLine: "My beautiful mountain... my mixed powers... you've unraveled them all...",
      bgGradient: "linear-gradient(180deg, #1a0b30 0%, #3d1a6e 40%, #1a0b30 100%)",
      scenery: "⛰️🌙✨",
    },
    lesson: {
      title: "Mixed Numbers",
      steps: [
        "Mixed = whole + proper fraction (e.g. 2 and 3/4).",
        "To convert to improper: (whole × denominator) + numerator.",
        "Keep the SAME denominator on the bottom!",
      ],
      example: { n: "2¾", d: null, label: "(2×4) + 3 = 11 → 11/4" },
    },
  },

  add: {
    villain: {
      name: "Addrus the Chain Phantom", emoji: "👻", color: "#1a5276", hp: 5,
      taunt: [
        { speaker: "villain", text: "OoooOOOO... I chain numbers together... but only when they share a bottom!" },
        { speaker: "villain", text: "Same denominators? Easy. Just don't get GREEDY and add the bottoms too!" },
        { speaker: "eldrin", text: "When the denominators match, just add the numerators and keep the bottom the same. Then simplify!" },
      ],
      defeatLine: "The chains... breaking... you kept the bottom steady...",
      bgGradient: "linear-gradient(180deg, #071520 0%, #0d3055 40%, #071520 100%)",
      scenery: "🌉⛓️🌫️",
    },
    lesson: {
      title: "Adding Like Fractions",
      steps: [
        "Same bottom? Just add the tops.",
        "Keep the denominator the same — never add bottoms!",
        "Simplify if you can.",
      ],
      example: { n: "1+2", d: "5", label: "1/5 + 2/5 = 3/5" },
    },
  },

  sub: {
    villain: {
      name: "Drakmire the Bog Wraith", emoji: "🌊", color: "#1e5631", hp: 5,
      taunt: [
        { speaker: "villain", text: "Welcome to my swamp... everything that enters here is slowly... subtracted." },
        { speaker: "villain", text: "Subtraction is LOSS. And you... you will lose EVERYTHING in this swamp!" },
        { speaker: "eldrin", text: "Subtracting like fractions: same idea as adding — just subtract the tops. Never the bottoms!" },
      ],
      defeatLine: "The swamp... draining... you took back what I stole...",
      bgGradient: "linear-gradient(180deg, #050f08 0%, #0d2e16 40%, #050f08 100%)",
      scenery: "🌿🐸💧",
    },
    lesson: {
      title: "Subtracting Like Fractions",
      steps: [
        "Same bottom? Subtract the tops.",
        "Keep the denominator the same.",
        "Simplify the result.",
      ],
      example: { n: "3-1", d: "5", label: "3/5 - 1/5 = 2/5" },
    },
  },

  simplify: {
    villain: {
      name: "Bloatrix the Infinite Mimic", emoji: "🐙", color: "#4a235a", hp: 5,
      taunt: [
        { speaker: "villain", text: "I am EVERYTHING and NOTHING! I grow and BLOAT until no one can see the truth hidden inside me!" },
        { speaker: "villain", text: "Complexity is my armor! My fractions look different but they are all THE SAME inside. Can you see through my disguise?" },
        { speaker: "eldrin", text: "To simplify, find the GCF — the Greatest Common Factor of both numerator and denominator. Divide both by the GCF to get the simplest form!" },
      ],
      defeatLine: "The GCF... you found it... my disguise... is gone... I am reduced... to nothing...",
      bgGradient: "linear-gradient(180deg, #0d0515 0%, #2d0e45 40%, #0d0515 100%)",
      scenery: "🌀🔮🕸️",
    },
    lesson: {
      title: "Simplifying to Lowest Terms",
      steps: [
        "Find the GCF of top and bottom.",
        "Divide BOTH numbers by the GCF.",
        "Repeat until top and bottom share no common factor > 1.",
      ],
      example: { n: "6", d: "9", label: "GCF=3 → ÷3 → 2/3 ✓" },
    },
  },

  unlikeAdd: {
    villain: {
      name: "Vortexa the Discord Specter", emoji: "🌀", color: "#0f7b6c", hp: 5,
      taunt: [
        { speaker: "villain", text: "Behold my chaos — denominators that REFUSE to agree! How will you add what cannot align?!" },
        { speaker: "villain", text: "Different bottoms break weak wizards... and you, hero, look very weak indeed." },
        { speaker: "eldrin", text: "Find the LCM (Lowest Common Multiple) of the denominators. Convert both fractions to that bottom — then add the tops!" },
      ],
      defeatLine: "The LCM... you found common ground... my discord shatters...",
      bgGradient: "linear-gradient(180deg, #042f2e 0%, #134e4a 40%, #022c22 100%)",
      scenery: "🌪️🍃🌫️",
    },
    lesson: {
      title: "Adding Unlike Fractions",
      steps: [
        "Find the LCM of the two denominators.",
        "Convert each fraction to the LCM bottom.",
        "Add the new tops, then simplify.",
      ],
      example: { n: "1/2 + 1/3", d: null, label: "LCM=6 → 3/6 + 2/6 = 5/6" },
    },
  },

  unlikeSub: {
    villain: {
      name: "Hollowis the Echo Wraith", emoji: "👁️", color: "#1f3a5f", hp: 5,
      taunt: [
        { speaker: "villain", text: "I am the absence between things... the silence between your numbers." },
        { speaker: "villain", text: "Different bottoms are my domain — and you cannot subtract what you cannot match!" },
        { speaker: "eldrin", text: "Same as addition with unlike fractions: find the LCM, convert, then subtract the tops. Never the bottoms!" },
      ],
      defeatLine: "Your blade... cut through the silence... I fade...",
      bgGradient: "linear-gradient(180deg, #0c0a09 0%, #1c1917 40%, #020617 100%)",
      scenery: "🕳️🦇🌑",
    },
    lesson: {
      title: "Subtracting Unlike Fractions",
      steps: [
        "Find the LCM of the two denominators.",
        "Convert both fractions to that bottom.",
        "Subtract the tops, simplify.",
      ],
      example: { n: "5/6 - 1/3", d: null, label: "LCM=6 → 5/6 - 2/6 = 3/6 = 1/2" },
    },
  },

  multiply: {
    villain: {
      name: "Colossus the Mesa Titan", emoji: "🗿", color: "#784212", hp: 5,
      taunt: [
        { speaker: "villain", text: "MULTIPLICATION... everything GROWS when I am near! I have grown beyond any single fraction!" },
        { speaker: "villain", text: "You think you can multiply fractions? Straight across? FALL BEFORE MY SIZE!" },
        { speaker: "eldrin", text: "Multiplying fractions is the EASIEST! Multiply the tops, then the bottoms. No common denominator needed!" },
      ],
      defeatLine: "UGHHH... so simple... straight across... why did I think... I was... invincible...",
      bgGradient: "linear-gradient(180deg, #1a0c05 0%, #5c2e08 40%, #1a0c05 100%)",
      scenery: "🏔️🌵☀️",
    },
    lesson: {
      title: "Multiplying Fractions",
      steps: [
        "Top × Top = new numerator.",
        "Bottom × Bottom = new denominator.",
        "Cross-cancel before multiplying when you can.",
      ],
      example: { n: "2×3", d: "3×4", label: "2/3 × 3/4 = 6/12 = 1/2" },
    },
  },

  divide: {
    villain: {
      name: "Sanda the Desert Specter", emoji: "🌪️", color: "#935116", hp: 5,
      taunt: [
        { speaker: "villain", text: "Division is the art of splitting things apart... just like I am splitting your will!" },
        { speaker: "villain", text: "You think you know how to divide fractions? The secret will BLOW AWAY like sand in my storm!" },
        { speaker: "eldrin", text: "The secret: KEEP, CHANGE, FLIP. Keep the first, change ÷ to ×, flip the second, then multiply!" },
      ],
      defeatLine: "K...keep...change...flip... you remembered... the sands have settled...",
      bgGradient: "linear-gradient(180deg, #120800 0%, #5c2a00 40%, #120800 100%)",
      scenery: "🏜️🌵🦂",
    },
    lesson: {
      title: "Dividing Fractions: KCF!",
      steps: [
        "🔑 KEEP the first fraction.",
        "🔄 CHANGE ÷ to ×.",
        "🔃 FLIP the second fraction (swap top and bottom).",
      ],
      example: { n: "3/4 ÷ 1/2", d: null, label: "→ 3/4 × 2/1 = 6/4 = 1 and 1/2" },
    },
  },

  compare: {
    villain: {
      name: "Equilis the Mirror Judge", emoji: "⚖️", color: "#7f1d1d", hp: 5,
      taunt: [
        { speaker: "villain", text: "I am the scale that weighs all things — and your fractions hang in my balance!" },
        { speaker: "villain", text: "Which is bigger? Smaller? Equal? You'll never decide without me!" },
        { speaker: "eldrin", text: "Cross-multiply! For a/b vs c/d, compare a×d with b×c. Bigger product = bigger fraction!" },
      ],
      defeatLine: "The scale tips... you weighed truly... I... am undone...",
      bgGradient: "linear-gradient(180deg, #4c0519 0%, #500724 40%, #450a0a 100%)",
      scenery: "🪞⚖️🗡️",
    },
    lesson: {
      title: "Comparing Fractions",
      steps: [
        "Cross-multiply: a×d vs b×c.",
        "Bigger product = bigger fraction.",
        "Or convert both to the same denominator and compare tops.",
      ],
      example: { n: "3/4 vs 5/7", d: null, label: "3×7=21 vs 4×5=20 → 3/4 > 5/7" },
    },
  },

  equivalent: {
    villain: {
      name: "Echolyn the Twin Wolf", emoji: "🐺", color: "#0f5132", hp: 5,
      taunt: [
        { speaker: "villain", text: "Two of every fraction! Identical in value, different in form... a hall of mirrors!" },
        { speaker: "villain", text: "Find my twin — or wander these reflections forever!" },
        { speaker: "eldrin", text: "Multiply (or divide) BOTH top and bottom by the same number. The value stays equal — only the form changes!" },
      ],
      defeatLine: "My twin... reduced to one... my hall... shatters...",
      bgGradient: "linear-gradient(180deg, #042f2e 0%, #022c22 40%, #052e16 100%)",
      scenery: "🌒🦊🌳",
    },
    lesson: {
      title: "Equivalent Fractions",
      steps: [
        "Multiply top AND bottom by the same number.",
        "Or divide both by a common factor.",
        "The value stays the same; only the form changes.",
      ],
      example: { n: "2/3", d: null, label: "2/3 × 4/4 = 8/12 (still 2/3)" },
    },
  },

  // The boss is a separate “world” surfaced as a final node on the map.
  boss: {
    villain: {
      name: "Fracton the Void Wyrm", emoji: "🐉", color: "#8b0000", hp: 8,
      taunt: [
        { speaker: "villain", text: "SO... the little wizard has fought through all of my generals. Impressive... but ultimately, pointless." },
        { speaker: "villain", text: "I shattered the Fraction Crystal because fractions DIVIDE everything. They are the source of all conflict, all imbalance, all CHAOS!" },
        { speaker: "villain", text: "And now... I shall DIVIDE you from your hope. Prepare yourself, champion. This ends HERE." },
        { speaker: "eldrin", text: "Champion... this is it. Everything you've learned — proper, improper, mixed, operations, simplifying — you must use it ALL now. I believe in you. Arithmia believes in you. FIGHT!" },
      ],
      defeatLine: "IMPOSSIBLE... a mere student... defeated ME?! The Crystal... it will reform... Arithmia... is saved... I am... undone...",
      bgGradient: "linear-gradient(180deg, #0a0005 0%, #3d0010 40%, #0a0005 100%)",
      scenery: "🌑💀⚡",
    },
    lesson: null, // boss has no pre-battle lesson card
  },
};

// Map node positions on the winding path — design uses 9 nodes; we have 12 worlds + boss = 13 nodes.
// Generate a serpentine layout in code to keep things flexible.
export function buildMapNodes(count) {
  const nodes = [];
  for (let i = 0; i < count; i++) {
    const t = count <= 1 ? 0 : i / (count - 1);
    const y = 92 - t * 92;                       // bottom (92%) to top (~0%)
    const x = 50 + Math.sin(i * 0.95) * 28;       // serpentine
    nodes.push({ x: Math.max(8, Math.min(92, x)), y });
  }
  return nodes;
}
