export const NEW_WORLDS = [
  {
    id: "simplify",
    name: { EN: "Simplify Sands", TL: "Buhanginan ng Pagpapasimple" },
    icon: "✂️", bg: "from-amber-950 via-yellow-950 to-orange-950",
    cssBg: "linear-gradient(135deg,#451a03 0%,#422006 50%,#451a03 100%)",
    color: "text-amber-300", btnCls: "bg-amber-500 hover:bg-amber-400",
    levels: [
      { name: { EN: "Level 1 – Trim", TL: "Antas 1 – Putol" }, diff: 0, enemy: { emoji: "🐍", name: "Sand Serpent", atk: "💨" } },
      { name: { EN: "Level 2 – Reduce", TL: "Antas 2 – Bawasan" }, diff: 1, enemy: { emoji: "🦂", name: "Dust Scorpion", atk: "☠️" } },
      { name: { EN: "Level 3 – Lowest", TL: "Antas 3 – Pinakaliit" }, diff: 2, enemy: { emoji: "🌀", name: "Sand Wraith", atk: "🌪️" } },
    ],
  },
  {
    id: "unlikeAdd",
    name: { EN: "Unlike Plains", TL: "Kapatagan ng Magkaibang" },
    icon: "🌾", bg: "from-lime-950 via-green-950 to-emerald-950",
    cssBg: "linear-gradient(135deg,#1a2e05 0%,#052e16 50%,#022c22 100%)",
    color: "text-lime-300", btnCls: "bg-lime-500 hover:bg-lime-400",
    levels: [
      { name: { EN: "Level 1 – Pair", TL: "Antas 1 – Pares" }, diff: 0, enemy: { emoji: "🐗", name: "Wild Boar", atk: "💢" } },
      { name: { EN: "Level 2 – Bind", TL: "Antas 2 – Ugnayan" }, diff: 1, enemy: { emoji: "🦅", name: "Plain Hawk", atk: "🪶" } },
      { name: { EN: "Level 3 – Sum", TL: "Antas 3 – Kabuuan" }, diff: 2, enemy: { emoji: "🐻", name: "Hill Bear", atk: "🐾" } },
    ],
  },
  {
    id: "unlikeSub",
    name: { EN: "Difference Caverns", TL: "Yungib ng Kaibahan" },
    icon: "🕳️", bg: "from-stone-950 via-zinc-950 to-slate-950",
    cssBg: "linear-gradient(135deg,#0c0a09 0%,#09090b 50%,#020617 100%)",
    color: "text-stone-300", btnCls: "bg-stone-500 hover:bg-stone-400",
    levels: [
      { name: { EN: "Level 1 – Crack", TL: "Antas 1 – Lamat" }, diff: 0, enemy: { emoji: "🦇", name: "Cave Bat", atk: "🩸" } },
      { name: { EN: "Level 2 – Chasm", TL: "Antas 2 – Bangin" }, diff: 1, enemy: { emoji: "🕷️", name: "Stone Spider", atk: "🕸️" } },
      { name: { EN: "Level 3 – Abyss", TL: "Antas 3 – Kalaliman" }, diff: 2, enemy: { emoji: "👁️", name: "Hollow Eye", atk: "🌑" } },
    ],
  },
  {
    id: "multiply",
    name: { EN: "Multiplier Citadel", TL: "Tanggulan ng Pagpaparami" },
    icon: "✖️", bg: "from-fuchsia-950 via-purple-950 to-pink-950",
    cssBg: "linear-gradient(135deg,#4a044e 0%,#3b0764 50%,#500724 100%)",
    color: "text-fuchsia-300", btnCls: "bg-fuchsia-500 hover:bg-fuchsia-400",
    levels: [
      { name: { EN: "Level 1 – Echo", TL: "Antas 1 – Alingawngaw" }, diff: 0, enemy: { emoji: "🤖", name: "Cube Bot", atk: "🔩" } },
      { name: { EN: "Level 2 – Replicate", TL: "Antas 2 – Pagdoble" }, diff: 1, enemy: { emoji: "👾", name: "Glitch Ghost", atk: "💢" } },
      { name: { EN: "Level 3 – Multiply", TL: "Antas 3 – Pagpaparami" }, diff: 2, enemy: { emoji: "🦾", name: "Loom Lord", atk: "⚙️" } },
    ],
  },
  {
    id: "divide",
    name: { EN: "Divider Reef", TL: "Bahura ng Hatian" },
    icon: "➗", bg: "from-cyan-950 via-sky-950 to-indigo-950",
    cssBg: "linear-gradient(135deg,#083344 0%,#082f49 50%,#1e1b4b 100%)",
    color: "text-cyan-300", btnCls: "bg-cyan-500 hover:bg-cyan-400",
    levels: [
      { name: { EN: "Level 1 – Split", TL: "Antas 1 – Hati" }, diff: 0, enemy: { emoji: "🐠", name: "Reef Fish", atk: "💧" } },
      { name: { EN: "Level 2 – Share", TL: "Antas 2 – Bahagi" }, diff: 1, enemy: { emoji: "🪼", name: "Coral Jelly", atk: "✨" } },
      { name: { EN: "Level 3 – Reciprocal", TL: "Antas 3 – Baligtad" }, diff: 2, enemy: { emoji: "🐉", name: "Tide Serpent", atk: "🌊" } },
    ],
  },
  {
    id: "compare",
    name: { EN: "Compare Crossroads", TL: "Sangandaan ng Paghahambing" },
    icon: "🔍", bg: "from-rose-950 via-pink-950 to-red-950",
    cssBg: "linear-gradient(135deg,#4c0519 0%,#500724 50%,#450a0a 100%)",
    color: "text-rose-300", btnCls: "bg-rose-500 hover:bg-rose-400",
    levels: [
      { name: { EN: "Level 1 – Glance", TL: "Antas 1 – Sulyap" }, diff: 0, enemy: { emoji: "👻", name: "Mirror Wisp", atk: "🪞" } },
      { name: { EN: "Level 2 – Weigh", TL: "Antas 2 – Timbang" }, diff: 1, enemy: { emoji: "⚖️", name: "Scale Imp", atk: "💫" } },
      { name: { EN: "Level 3 – Decide", TL: "Antas 3 – Pasiya" }, diff: 2, enemy: { emoji: "🦹", name: "Judge Phantom", atk: "🗡️" } },
    ],
  },
  {
    id: "equivalent",
    name: { EN: "Equivalent Echo", TL: "Alingawngaw ng Katumbas" },
    icon: "🟰", bg: "from-teal-950 via-emerald-950 to-green-950",
    cssBg: "linear-gradient(135deg,#042f2e 0%,#022c22 50%,#052e16 100%)",
    color: "text-teal-300", btnCls: "bg-teal-500 hover:bg-teal-400",
    levels: [
      { name: { EN: "Level 1 – Twin", TL: "Antas 1 – Kambal" }, diff: 0, enemy: { emoji: "🦊", name: "Echo Fox", atk: "💨" } },
      { name: { EN: "Level 2 – Match", TL: "Antas 2 – Tugma" }, diff: 1, enemy: { emoji: "🦉", name: "Mirror Owl", atk: "🌀" } },
      { name: { EN: "Level 3 – Reflect", TL: "Antas 3 – Salamin" }, diff: 2, enemy: { emoji: "🐺", name: "Twin Wolf", atk: "🌙" } },
    ],
  },
];

export const NEW_TIPS = {
  simplify: {
    EN: ["Find the GCD then divide both top and bottom ✂️", "Simplest form = no common factor > 1 ✅", "Try ÷2, ÷3, ÷5… until nothing else divides"],
    TL: ["Hanapin ang GCD, hatiin ang itaas at ibaba ✂️", "Pinakasimpleng anyo = walang common factor > 1 ✅", "Subukang ÷2, ÷3, ÷5… hanggang wala nang nahahati"],
  },
  unlikeAdd: {
    EN: ["Find the LCM, convert, then ADD ➕", "Common bottom first, always 🧮", "Step 1 LCM. Step 2 add tops. Step 3 simplify"],
    TL: ["Hanapin ang LCM, i-convert, tapos IDAGDAG ➕", "Common bottom muna, palagi 🧮", "Step 1 LCM. Step 2 idagdag itaas. Step 3 simplehin"],
  },
  unlikeSub: {
    EN: ["LCM, convert, SUBTRACT, simplify 🔻", "Both bottoms equal first, then take away", "Subtract only the tops once bottoms match"],
    TL: ["LCM, i-convert, IBAWAS, simplehin 🔻", "Pantay-pantay ang ibaba muna, tapos bawasan", "Bawasan lang ang itaas kapag tugma na ang ibaba"],
  },
  multiply: {
    EN: ["Top × Top, Bottom × Bottom ✖️", "Cross-cancel before multiplying — easier", "Multiply straight across, then simplify"],
    TL: ["Itaas × Itaas, Ibaba × Ibaba ✖️", "Cross-cancel muna bago paramihin — mas madali", "Pagparamihin diretso, tapos simplehin"],
  },
  divide: {
    EN: ["Keep, Change, Flip 🔁", "Divide = multiply by reciprocal", "Flip the second fraction, then multiply"],
    TL: ["Itago, Baguhin, Baligtarin 🔁", "Hatian = paramihin sa baligtad", "Baligtarin ang pangalawa, tapos paramihin"],
  },
  compare: {
    EN: ["Cross-multiply: a×d vs b×c 🔀", "Same numerator? Bigger bottom = smaller value 🍕", "Or convert to same denominator and compare tops"],
    TL: ["Cross-multiply: a×d vs b×c 🔀", "Parehong numerador? Mas malaking ibaba = mas maliit ang halaga 🍕", "O i-convert sa parehong ibaba at ihambing ang itaas"],
  },
  equivalent: {
    EN: ["× same number on top AND bottom ⚖️", "Equivalent = same value, different look", "1/2 = 2/4 = 3/6 — all equal 🍕"],
    TL: ["× parehong numero sa itaas AT ibaba ⚖️", "Katumbas = parehong halaga, magkaibang itsura", "1/2 = 2/4 = 3/6 — lahat pantay 🍕"],
  },
};

export const NEW_TUTORIALS = {
  simplify: {
    EN: { title: "Simplifying Fractions", lessons: [
      { title: "What it means", body: "A fraction is in simplest form when its numerator and denominator share no common factor greater than 1.", example: "6/8 → divide both by 2 → 3/4 ✅" },
      { title: "How to do it", body: "Find the greatest common divisor (GCD) of top and bottom, then divide both by it.", example: "GCD(8, 12) = 4 → 8/12 ÷ 4/4 = 2/3" },
      { title: "Quick check", body: "Try dividing by 2, 3, 5, 7… If none divide cleanly, you're done.", example: "5/9 → already simplest (no common factor)" },
    ] },
    TL: { title: "Pagpapasimple ng Praksiyon", lessons: [
      { title: "Ano ang ibig sabihin", body: "Pinakasimpleng anyo: walang common factor na mas malaki sa 1 ang itaas at ibaba.", example: "6/8 → hatiin ang dalawa sa 2 → 3/4 ✅" },
      { title: "Paano gawin", body: "Hanapin ang GCD ng itaas at ibaba, tapos hatiin pareho.", example: "GCD(8, 12) = 4 → 8/12 ÷ 4/4 = 2/3" },
      { title: "Mabilisang tsek", body: "Subukan hatiin sa 2, 3, 5, 7… Kapag wala, tapos ka na.", example: "5/9 → simpleng-simple na" },
    ] },
  },
  unlikeAdd: {
    EN: { title: "Adding Unlike Fractions", lessons: [
      { title: "Why we need a common bottom", body: "You can't add 1/2 + 1/3 directly — the slices are different sizes. Convert both to the same denominator first.", example: "1/2 + 1/3 → 3/6 + 2/6 = 5/6" },
      { title: "Find the LCM", body: "Find the least common multiple of the two denominators. That's your shared denominator.", example: "LCM(4, 6) = 12" },
      { title: "Convert and add", body: "Multiply each fraction's top and bottom by what's needed to reach the LCM, then add the tops.", example: "1/4 + 1/6 → 3/12 + 2/12 = 5/12" },
    ] },
    TL: { title: "Pagdaragdag ng Magkaibang Praksiyon", lessons: [
      { title: "Bakit kailangan ng common bottom", body: "Hindi pwede idagdag agad ang 1/2 + 1/3 — magkaiba ang sukat ng hiwa. I-convert muna sa parehong denominador.", example: "1/2 + 1/3 → 3/6 + 2/6 = 5/6" },
      { title: "Hanapin ang LCM", body: "Hanapin ang least common multiple ng dalawang denominador. Iyon ang gagamitin nyong common.", example: "LCM(4, 6) = 12" },
      { title: "I-convert at idagdag", body: "Paramihin ang itaas at ibaba ng bawat praksiyon para maabot ang LCM, tapos idagdag ang itaas.", example: "1/4 + 1/6 → 3/12 + 2/12 = 5/12" },
    ] },
  },
  unlikeSub: {
    EN: { title: "Subtracting Unlike Fractions", lessons: [
      { title: "Same idea as adding", body: "You need a common denominator first. Find the LCM of the two bottoms.", example: "1/2 − 1/3 → LCM = 6 → 3/6 − 2/6" },
      { title: "Convert each side", body: "Scale each fraction up so both share the LCM denominator.", example: "3/4 − 1/6 → 9/12 − 2/12 = 7/12" },
      { title: "Subtract and simplify", body: "Once bottoms match, subtract the tops. Simplify if possible.", example: "5/6 − 1/2 → 5/6 − 3/6 = 2/6 = 1/3" },
    ] },
    TL: { title: "Pagbabawas ng Magkaibang Praksiyon", lessons: [
      { title: "Parehas lang sa pagdagdag", body: "Kailangan muna ng parehong ibaba. Hanapin ang LCM.", example: "1/2 − 1/3 → LCM = 6 → 3/6 − 2/6" },
      { title: "I-convert ang bawat panig", body: "Paramihin ang bawat praksiyon para parehong umabot sa LCM.", example: "3/4 − 1/6 → 9/12 − 2/12 = 7/12" },
      { title: "Ibawas at simplehin", body: "Kapag tugma na ang ibaba, ibawas ang itaas. Simplehin kung kaya.", example: "5/6 − 1/2 → 5/6 − 3/6 = 2/6 = 1/3" },
    ] },
  },
  multiply: {
    EN: { title: "Multiplying Fractions", lessons: [
      { title: "Straight across", body: "Multiply tops together, multiply bottoms together. No common denominator needed.", example: "2/3 × 3/4 = (2×3)/(3×4) = 6/12 = 1/2" },
      { title: "Cross-cancel first", body: "If a numerator shares a factor with a denominator, cancel before multiplying — saves work.", example: "2/9 × 3/4 → cancel 2&4 and 3&9 → 1/6" },
      { title: "Always simplify", body: "After multiplying, reduce the answer to its simplest form.", example: "4/5 × 5/8 = 20/40 → 1/2" },
    ] },
    TL: { title: "Pagpaparami ng Praksiyon", lessons: [
      { title: "Diretso lang", body: "Itaas × itaas, ibaba × ibaba. Hindi na kailangan ng common bottom.", example: "2/3 × 3/4 = (2×3)/(3×4) = 6/12 = 1/2" },
      { title: "Cross-cancel muna", body: "Kapag may common factor ang itaas at ibaba, kanselahin muna bago paramihin.", example: "2/9 × 3/4 → kansela 2&4 at 3&9 → 1/6" },
      { title: "Lagi simplehin", body: "Pagkatapos paramihin, simplehin ang sagot.", example: "4/5 × 5/8 = 20/40 → 1/2" },
    ] },
  },
  divide: {
    EN: { title: "Dividing Fractions", lessons: [
      { title: "Keep, Change, Flip", body: "Keep the first fraction. Change ÷ to ×. Flip the second fraction (reciprocal).", example: "2/3 ÷ 4/5 = 2/3 × 5/4" },
      { title: "Then multiply", body: "Once flipped, just multiply straight across like a normal multiplication problem.", example: "2/3 × 5/4 = 10/12 = 5/6" },
      { title: "Why it works", body: "Dividing by a fraction is the same as multiplying by its reciprocal — they undo each other.", example: "÷ 1/2 is the same as × 2" },
    ] },
    TL: { title: "Paghahati ng Praksiyon", lessons: [
      { title: "Itago, Baguhin, Baligtarin", body: "Itago ang una. Baguhin ang ÷ sa ×. Baligtarin ang pangalawa.", example: "2/3 ÷ 4/5 = 2/3 × 5/4" },
      { title: "Tapos paramihin", body: "Pagkatapos baligtarin, paramihin diretso na parang ordinary multiplication.", example: "2/3 × 5/4 = 10/12 = 5/6" },
      { title: "Bakit gumagana", body: "Paghahati sa praksiyon = pagpaparami sa baligtad nito.", example: "÷ 1/2 = × 2" },
    ] },
  },
  compare: {
    EN: { title: "Comparing Fractions", lessons: [
      { title: "Cross-multiply trick", body: "To compare a/b vs c/d, compare a×d with b×c. Bigger product = bigger fraction.", example: "3/4 vs 5/7 → 3×7=21, 4×5=20 → 3/4 > 5/7" },
      { title: "Common denominator method", body: "Convert both to the same bottom, then compare the tops.", example: "1/2 vs 2/5 → 5/10 vs 4/10 → 1/2 > 2/5" },
      { title: "Same numerator shortcut", body: "When tops match, the one with the BIGGER bottom is the SMALLER fraction (slices are thinner).", example: "1/3 > 1/4 (thirds are bigger than fourths)" },
    ] },
    TL: { title: "Paghahambing ng Praksiyon", lessons: [
      { title: "Cross-multiply", body: "Para ihambing ang a/b at c/d, ihambing ang a×d at b×c. Mas malaki = mas malaking praksiyon.", example: "3/4 vs 5/7 → 3×7=21, 4×5=20 → 3/4 > 5/7" },
      { title: "Common denominator", body: "I-convert sa parehong ibaba, tapos ihambing ang itaas.", example: "1/2 vs 2/5 → 5/10 vs 4/10 → 1/2 > 2/5" },
      { title: "Parehong numerador", body: "Kapag pareho ang itaas, ang mas malaking ibaba ay MAS MALIIT na praksiyon.", example: "1/3 > 1/4 (mas malaki ang katlo kaysa ikaapat)" },
    ] },
  },
  equivalent: {
    EN: { title: "Equivalent Fractions", lessons: [
      { title: "Same value, different form", body: "Equivalent fractions look different but are equal in value. They represent the same amount.", example: "1/2 = 2/4 = 3/6 = 4/8" },
      { title: "How to make one", body: "Multiply the top AND bottom by the same number — it doesn't change the value.", example: "2/3 × 4/4 = 8/12 (still equals 2/3)" },
      { title: "Or simplify", body: "Going the other way: dividing both by a common factor also gives an equivalent fraction.", example: "10/15 ÷ 5/5 = 2/3" },
    ] },
    TL: { title: "Magkatumbas na Praksiyon", lessons: [
      { title: "Parehong halaga, ibang itsura", body: "Magkatumbas: magkaiba ang itsura pero pareho ang halaga.", example: "1/2 = 2/4 = 3/6 = 4/8" },
      { title: "Paano gumawa", body: "Paramihin ang itaas AT ibaba sa parehong numero — hindi nababago ang halaga.", example: "2/3 × 4/4 = 8/12 (pareho pa rin sa 2/3)" },
      { title: "O simplehin", body: "Baliktad: hatiin ang dalawa sa common factor — magkatumbas pa rin.", example: "10/15 ÷ 5/5 = 2/3" },
    ] },
  },
};
