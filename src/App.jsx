import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { loadSave, saveSave } from "./game/store";
import { pickQuestion, adaptDiff, recordPerf } from "./game/dedup";
import { fpSingle, fpPair } from "./game/fingerprint";
import { canon } from "./game/math";
import { NEW_GENS } from "./game/generators";
import { NEW_WORLDS, NEW_TIPS } from "./game/worlds";
import { sfx, setSfxMuted } from "./audio/sfx";
import MissionIntroScreen from "./screens/MissionIntroScreen";

const writeSave = saveSave;
const tap = () => { try { navigator.vibrate?.(10); } catch (_) {} sfx.click(); };

/* ═══════════════════════════════════════════════════
   PROCEDURAL CHIPTUNE (Web Audio — no files needed)
═══════════════════════════════════════════════════ */
function useMusicEngine() {
  const ctxRef = useRef(null), gainRef = useRef(null), loopRef = useRef(null);
  const playingRef = useRef(false), mutedRef = useRef(false);
  const [muted, setMuted] = useState(false);
  const MELODY = [523.25,587.33,659.25,698.46,783.99,698.46,659.25,587.33,523.25,523.25,587.33,659.25,587.33,523.25,392.00,392.00,440.00,493.88,523.25,587.33,659.25,587.33,523.25,493.88,440.00,440.00,493.88,523.25,523.25,0,523.25,0];
  const BASS = [130.81,0,130.81,0,146.83,0,146.83,0,164.81,0,164.81,0,174.61,0,174.61,0];
  const BL = 0.13, LL = MELODY.length * BL;
  function getCtx() { if (!ctxRef.current) { ctxRef.current = new (window.AudioContext || window.webkitAudioContext)(); gainRef.current = ctxRef.current.createGain(); gainRef.current.gain.value = 0.18; gainRef.current.connect(ctxRef.current.destination); } return ctxRef.current; }
  function note(f, s, d, ctx, t = "square") { if (!f) return; const o = ctx.createOscillator(), e = ctx.createGain(); o.type = t; o.frequency.value = f; e.gain.setValueAtTime(0.001, s); e.gain.linearRampToValueAtTime(1, s + 0.01); e.gain.linearRampToValueAtTime(0.001, s + d - 0.01); o.connect(e); e.connect(gainRef.current); o.start(s); o.stop(s + d); }
  const startLoop = useCallback(() => {
    if (playingRef.current) return;
    const ctx = getCtx(); if (ctx.state === "suspended") ctx.resume(); playingRef.current = true;
    function sched(w) { if (!playingRef.current) return; MELODY.forEach((f, i) => note(f, w + i * BL, BL * 0.82, ctx)); BASS.forEach((f, i) => note(f, w + i * BL * 2, BL * 1.6, ctx, "triangle")); loopRef.current = setTimeout(() => sched(w + LL), (LL - 0.5) * 1000); }
    sched(ctx.currentTime + 0.05);
  }, []);
  const stopLoop = useCallback(() => { playingRef.current = false; clearTimeout(loopRef.current); }, []);
  const toggleMute = useCallback(() => { const nx = !mutedRef.current; mutedRef.current = nx; setMuted(nx); if (gainRef.current) gainRef.current.gain.value = nx ? 0 : 0.18; if (!nx && !playingRef.current) startLoop(); }, [startLoop]);
  const initMusic = useCallback(() => { if (!playingRef.current && !mutedRef.current) startLoop(); }, [startLoop]);
  useEffect(() => () => { stopLoop(); ctxRef.current?.close(); }, []);
  return { muted, toggleMute, initMusic };
}

/* ═══════════════════════════════════════════════════
   GLOBAL CSS
═══════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;800;900&display=swap');
*{box-sizing:border-box;}body{font-family:'Nunito',sans-serif;overflow-x:hidden;margin:0;}canvas{touch-action:none;}
@keyframes idleFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes hammyBob{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-10px) rotate(3deg)}}
@keyframes hammyHit{0%,100%{transform:translateX(0);filter:none}15%{transform:translateX(-30px) rotate(-12deg);filter:brightness(.08) saturate(0)}40%{transform:translateX(22px) rotate(7deg);filter:brightness(6) sepia(1)}65%{transform:translateX(-12px)}82%{transform:translateX(6px)}}
@keyframes hammyDie{0%{transform:scale(1) translateY(0);opacity:1}30%{transform:scale(.65) rotate(-20deg) translateY(12px);filter:saturate(0) brightness(.2)}100%{transform:scale(0) rotate(-100deg) translateY(80px);opacity:0}}
@keyframes bossFloat{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-18px) rotate(3deg)}}
@keyframes enemyIdle{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-12px) rotate(4deg)}}
@keyframes enemyHit{0%{transform:scale(1);filter:none}18%{transform:scale(1.9) rotate(-20deg);filter:brightness(14) saturate(0)}52%{transform:scale(.5) rotate(14deg)}80%{transform:scale(1.15)}100%{transform:scale(1);filter:none}}
@keyframes enemyDie{0%{transform:scale(1);opacity:1;filter:none}22%{transform:scale(2.4) rotate(28deg);filter:brightness(14) saturate(0)}60%{transform:scale(1.2) rotate(-18deg) translateY(-30px);opacity:.4}100%{transform:scale(0) rotate(-240deg) translateY(90px);opacity:0}}
@keyframes atkFwd{0%{left:18%;opacity:1;transform:scale(1) rotate(0)}65%{opacity:1;transform:scale(2.2) rotate(220deg)}100%{left:78%;opacity:0;transform:scale(3.8) rotate(400deg)}}
@keyframes atkBwd{0%{left:78%;opacity:1;transform:scale(1) rotate(0)}65%{opacity:1;transform:scale(2.2) rotate(-220deg)}100%{left:14%;opacity:0;transform:scale(3.8) rotate(-400deg)}}
@keyframes dmgFloat{0%{opacity:1;transform:translateY(0) scale(1)}28%{transform:translateY(-24px) scale(1.7)}100%{opacity:0;transform:translateY(-70px) scale(.55)}}
@keyframes flashRed{0%,100%{background:transparent}40%{background:rgba(239,68,68,.3)}}
@keyframes screenShake{0%,100%{transform:translate(0,0)}20%{transform:translate(-10px,5px)}40%{transform:translate(11px,-7px)}60%{transform:translate(-8px,8px)}80%{transform:translate(9px,-5px)}}
@keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
@keyframes starIn{from{transform:scale(0) rotate(-90deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}
@keyframes tipIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes timerPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.22)}}
@keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,215,0,.55)}50%{box-shadow:0 0 0 14px rgba(255,215,0,0)}}
@keyframes streakIn{0%{transform:scale(0) rotate(-20deg);opacity:0}60%{transform:scale(1.35) rotate(5deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
@keyframes bgStar{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:.9;transform:scale(1.3)}}
@keyframes popBounce{0%{transform:scale(0)}70%{transform:scale(1.15)}100%{transform:scale(1)}}
@keyframes shine{0%{opacity:0;transform:translateX(-100%)}50%{opacity:.4}100%{opacity:0;transform:translateX(100%)}}
.hammy-bob{animation:hammyBob 2.4s ease-in-out infinite}
.hammy-hit{animation:hammyHit .58s ease!important}
.hammy-die{animation:hammyDie .95s ease forwards!important}
.enemy-hit{animation:enemyHit .65s ease!important}
.enemy-die{animation:enemyDie 1.05s ease forwards!important}
.enemy-idle{animation:enemyIdle 2.8s ease-in-out infinite}
.boss-float{animation:bossFloat 2.4s ease-in-out infinite}
.atk-fwd{animation:atkFwd .6s ease forwards}
.atk-bwd{animation:atkBwd .6s ease forwards}
.dmg-float{animation:dmgFloat .95s ease forwards}
.flash-red{animation:flashRed .55s ease}
.screen-shake{animation:screenShake .48s ease}
.slide-up{animation:slideUp .35s ease}
.slide-in{animation:slideIn .35s ease}
.star-in{animation:starIn .55s cubic-bezier(.34,1.56,.64,1) forwards;opacity:0}
.tip-in{animation:tipIn .4s ease}
.streak-in{animation:streakIn .5s cubic-bezier(.34,1.56,.64,1)}
.timer-pulse{animation:timerPulse .85s ease-in-out infinite}
.idle-float{animation:idleFloat 2.6s ease-in-out infinite}
.glow-pulse{animation:glowPulse 2s ease-in-out infinite}
.pop-bounce{animation:popBounce .4s cubic-bezier(.34,1.56,.64,1)}
input[type=number]{-moz-appearance:textfield;}
input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
`;

/* ═══════════════════════════════════════════════════
   UTILS
═══════════════════════════════════════════════════ */
const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const simp = (n, d) => { const g = gcd(Math.abs(n), Math.abs(d)); return [n / g, d / g]; };
const shuf = (a) => [...a].sort(() => Math.random() - 0.5);
const pick = (a) => a[R(0, a.length - 1)];
const T = (obj, lang) => obj[lang] || obj["EN"];

/* ═══════════════════════════════════════════════════
   TIPS (bilingual)
═══════════════════════════════════════════════════ */
const TIPS = {
  proper: {
    EN: ["TOP < BOTTOM means Proper! Think: less than a whole pizza 🍕","The numerator (top) must be LESS THAN the denominator (bottom)!","Proper fraction = LESS THAN one whole ✅"],
    TL: ["ITAAS < IBABA = Tamang Praksiyon! Isipin: kulang sa isang buong pizza 🍕","Ang numerador (itaas) ay dapat MAS MALIIT kaysa sa denominador (ibaba)!","Tamang Praksiyon = KULANG PA sa isang buo ✅"],
  },
  improper: {
    EN: ["Divide TOP ÷ BOTTOM. Quotient = whole, remainder = new top ➗","TOP ≥ BOTTOM = you have ONE WHOLE or more 🎂","Divide top by bottom → answer is whole, leftover is new top 📝"],
    TL: ["Hatiin ang ITAAS ÷ IBABA. Sagot = buong bilang, natira = bagong itaas ➗","ITAAS ≥ IBABA = mayroon kang ISA O HIGIT pang buo 🎂","Hatiin: sagot = buo, natitira = bagong numerador 📝"],
  },
  mixed: {
    EN: ["Multiply whole × denominator, then ADD the numerator to get new top ✨","Example: 2 and 1/3 → (2×3)+1 = 7 → answer is 7/3 📚","Keep the SAME denominator when converting 🔄"],
    TL: ["I-multiply ang buo × denominador, tapos IDAGDAG ang numerador ✨","Halimbawa: 2 at 1/3 → (2×3)+1 = 7 → sagot ay 7/3 📚","Panatilihing PAREHO ang denominador sa pag-convert 🔄"],
  },
  add: {
    EN: ["Same bottom? Just ADD the top numbers together ➕","Add ONLY the tops — bottom stays unchanged 💡","Example: 1/5 + 2/5 = 3/5 — bottom stays the same ✅"],
    TL: ["Parehong ibaba? I-DAGDAG lang ang mga itaas na numero ➕","Idagdag LAMANG ang mga itaas — ang ibaba ay hindi nagbabago 💡","Halimbawa: 1/5 + 2/5 = 3/5 — pareho pa rin ang ibaba ✅"],
  },
  sub: {
    EN: ["Same bottom? Just SUBTRACT the top numbers ➖","Subtract ONLY the tops — keep the bottom unchanged 💡","Example: 4/7 − 2/7 = 2/7 — bottom stays ✅"],
    TL: ["Parehong ibaba? I-BAWAS lang ang mga itaas na numero ➖","Ibawas LAMANG ang mga itaas — ang ibaba ay hindi nagbabago 💡","Halimbawa: 4/7 − 2/7 = 2/7 — pareho pa rin ang ibaba ✅"],
  },
  ...NEW_TIPS,
};

/* ═══════════════════════════════════════════════════
   TUTORIAL CONTENT (bilingual, per world)
═══════════════════════════════════════════════════ */
const TUTORIALS = {
  proper: {
    EN: {
      title: "Proper Fractions",
      slides: [
        { icon: "🍕", title: "What is a Fraction?", text: "A fraction shows a PART of a whole thing!\n\nImagine a pizza cut into 4 equal slices. If you eat 1 slice, you ate 1 out of 4 slices — that's written as the fraction 1/4!\n\nThe LINE in the middle separates the two numbers.", visual: "intro" },
        { icon: "📖", title: "Parts of a Fraction", text: "Every fraction has TWO parts separated by a line:\n\n📌 TOP number = NUMERATOR\n→ How many parts you HAVE\n\n📌 BOTTOM number = DENOMINATOR\n→ How many TOTAL parts there are\n\nSay it out loud: Nu-mer-a-tor on TOP, De-nom-i-na-tor on BOTTOM!", visual: "parts" },
        { icon: "✅", title: "What Makes it PROPER?", text: "A PROPER fraction is when the TOP number is SMALLER than the BOTTOM number.\n\nThis means you have LESS THAN ONE whole!\n\n✅ 1/2 → 1 < 2 → PROPER!\n✅ 3/4 → 3 < 4 → PROPER!\n✅ 7/10 → 7 < 10 → PROPER!\n\nThink of it like having only PART of a pizza — not a whole one!", visual: "proper_ex" },
        { icon: "❌", title: "What is NOT Proper?", text: "If the TOP number is EQUAL TO or BIGGER than the BOTTOM, it is NOT a proper fraction!\n\n❌ 5/3 → 5 > 3 → NOT proper\n❌ 4/4 → 4 = 4 → NOT proper\n❌ 9/2 → 9 > 2 → NOT proper\n\nThese are called IMPROPER fractions — you'll learn those in the next world!", visual: "improper_ex" },
      ],
      practice: [
        { q: { type: "mc-frac", instruction: "Which one is a PROPER fraction? (top < bottom) 🎯", choices: [{ n: 1, d: 4, isCorrect: true }, { n: 5, d: 3, isCorrect: false }, { n: 6, d: 6, isCorrect: false }, { n: 9, d: 2, isCorrect: false }], hint: "Remember: TOP must be SMALLER than BOTTOM! 1 < 4 ✅" } },
        { q: { type: "mc-frac", instruction: "Pick the PROPER fraction! 🎯", choices: [{ n: 3, d: 8, isCorrect: true }, { n: 7, d: 5, isCorrect: false }, { n: 4, d: 4, isCorrect: false }, { n: 10, d: 3, isCorrect: false }], hint: "3 < 8 is TRUE — so 3/8 is proper! ✅" } },
      ],
    },
    TL: {
      title: "Tamang Praksiyon",
      slides: [
        { icon: "🍕", title: "Ano ang Praksiyon?", text: "Ang praksiyon ay nagpapakita ng BAHAGI ng isang bagay!\n\nIsipin mo ang pizza na hinati sa 4 na pantay na hiwa. Kung kumain ka ng 1 hiwa, kumain ka ng 1 sa 4 — iyon ay isinusulat bilang 1/4!\n\nAng LINYA sa gitna ay nagpapaghiwalay sa dalawang numero.", visual: "intro" },
        { icon: "📖", title: "Mga Bahagi ng Praksiyon", text: "Ang bawat praksiyon ay may DALAWANG bahagi na pinaghihiwalay ng linya:\n\n📌 ITAAS na numero = NUMERADOR\n→ Ilang bahagi ang MAYROON ka\n\n📌 IBABA na numero = DENOMINADOR\n→ Ilang bahagi ang KABUUAN\n\nSabihin natin nang malakas: Nu-me-ra-dor sa ITAAS, De-no-mi-na-dor sa IBABA!", visual: "parts" },
        { icon: "✅", title: "Ano ang TAMANG Praksiyon?", text: "Ang TAMANG PRAKSIYON ay kapag ang ITAAS na numero ay MAS MALIIT kaysa sa IBABA.\n\nIbig sabihin, KULANG KA pa sa isang buo!\n\n✅ 1/2 → 1 < 2 → TAMANG PRAKSIYON!\n✅ 3/4 → 3 < 4 → TAMANG PRAKSIYON!\n✅ 7/10 → 7 < 10 → TAMANG PRAKSIYON!\n\nParang may BAHAGI ka lamang ng pizza — hindi buong pizza!", visual: "proper_ex" },
        { icon: "❌", title: "Ano ang HINDI Tamang Praksiyon?", text: "Kung ang ITAAS na numero ay KATUMBAS o MALAKI kaysa sa IBABA, hindi ito tamang praksiyon!\n\n❌ 5/3 → 5 > 3 → HINDI tamang\n❌ 4/4 → 4 = 4 → HINDI tamang\n❌ 9/2 → 9 > 2 → HINDI tamang\n\nAng mga ito ay tinatawag na DI-WASTONG PRAKSIYON — matutunan mo ito sa susunod na mundo!", visual: "improper_ex" },
      ],
      practice: [
        { q: { type: "mc-frac", instruction: "Alin ang TAMANG PRAKSIYON? (itaas < ibaba) 🎯", choices: [{ n: 1, d: 4, isCorrect: true }, { n: 5, d: 3, isCorrect: false }, { n: 6, d: 6, isCorrect: false }, { n: 9, d: 2, isCorrect: false }], hint: "Tandaan: ITAAS ay dapat MAS MALIIT kaysa IBABA! 1 < 4 ✅" } },
        { q: { type: "mc-frac", instruction: "Piliin ang TAMANG PRAKSIYON! 🎯", choices: [{ n: 3, d: 8, isCorrect: true }, { n: 7, d: 5, isCorrect: false }, { n: 4, d: 4, isCorrect: false }, { n: 10, d: 3, isCorrect: false }], hint: "3 < 8 ay TOTOO — kaya ang 3/8 ay tamang praksiyon! ✅" } },
      ],
    },
  },
  improper: {
    EN: {
      title: "Improper Fractions",
      slides: [
        { icon: "🎂", title: "What is an Improper Fraction?", text: "An IMPROPER fraction is when the TOP number is EQUAL TO or BIGGER than the BOTTOM number.\n\nThis means you have ONE WHOLE or MORE!\n\n✅ 5/3 → 5 > 3 → IMPROPER!\n✅ 7/7 → 7 = 7 → IMPROPER (equals exactly 1 whole!)\n✅ 9/4 → 9 > 4 → IMPROPER!\n\nThink of it like having MORE than one whole pizza!", visual: "improper_ex" },
        { icon: "🔄", title: "Converting to Mixed Numbers", text: "We can convert an improper fraction to a MIXED NUMBER!\n\nA mixed number has a WHOLE NUMBER and a FRACTION.\n\nSTEPS:\n1️⃣ Divide: TOP ÷ BOTTOM\n2️⃣ The answer (quotient) → becomes the WHOLE NUMBER\n3️⃣ The leftover (remainder) → becomes the new TOP\n4️⃣ Keep the SAME BOTTOM number\n\nExample: 7 ÷ 3 = 2 remainder 1 → answer is 2 and 1/3!", visual: "convert_imp" },
        { icon: "📝", title: "Let's Practice the Steps!", text: "Let's convert 11/4 together!\n\nStep 1: 11 ÷ 4 = ?\n→ 4 × 2 = 8 (too small)\n→ 4 × 3 = 12 (too big!)\n→ So 4 goes into 11 exactly 2 times!\n\nStep 2: 2 becomes the whole number\n\nStep 3: 11 - 8 = 3 → 3 is the remainder (new top)\n\nStep 4: Bottom stays 4\n\nAnswer: 2 and 3/4! ✅", visual: "steps_imp" },
        { icon: "🎯", title: "Quick Tip!", text: "A good way to CHECK your answer:\n\nIf you have mixed number W and N/D, convert back:\n→ (W × D) + N should equal the original top!\n\nFor 2 and 3/4:\n→ (2 × 4) + 3 = 8 + 3 = 11 ✅\n\nThat matches 11/4 — correct! 🎉\n\nNow let's practice!", visual: "check_imp" },
      ],
      practice: [
        { q: { type: "mc-mixed", instruction: "Convert 7/2 to a Mixed Number! 🔄", displayFrac: { n: 7, d: 2 }, choices: [{ w: 3, n: 1, d: 2, isCorrect: true }, { w: 2, n: 1, d: 2, isCorrect: false }, { w: 3, n: 2, d: 3, isCorrect: false }, { w: 4, n: 1, d: 2, isCorrect: false }], answer: { w: 3, n: 1, d: 2 }, hint: "7 ÷ 2 = 3 remainder 1 → answer is 3 and 1/2! ✅" } },
        { q: { type: "mc-mixed", instruction: "Convert 9/4 to a Mixed Number! 🔄", displayFrac: { n: 9, d: 4 }, choices: [{ w: 2, n: 1, d: 4, isCorrect: true }, { w: 3, n: 1, d: 4, isCorrect: false }, { w: 2, n: 3, d: 5, isCorrect: false }, { w: 1, n: 1, d: 4, isCorrect: false }], answer: { w: 2, n: 1, d: 4 }, hint: "9 ÷ 4 = 2 remainder 1 → answer is 2 and 1/4! ✅" } },
      ],
    },
    TL: {
      title: "Di-Wastong Praksiyon",
      slides: [
        { icon: "🎂", title: "Ano ang Di-Wastong Praksiyon?", text: "Ang DI-WASTONG PRAKSIYON ay kapag ang ITAAS na numero ay KATUMBAS o MALAKI kaysa sa IBABA.\n\nIbig sabihin, mayroon kang ISA O HIGIT pang buo!\n\n✅ 5/3 → 5 > 3 → DI-WASTO!\n✅ 7/7 → 7 = 7 → DI-WASTO (eksaktong 1 buo!)\n✅ 9/4 → 9 > 4 → DI-WASTO!\n\nParang mayroon kang HIGIT sa isang buong pizza!", visual: "improper_ex" },
        { icon: "🔄", title: "Pag-convert sa Halo-halong Bilang", text: "Maaari nating i-convert ang di-wastong praksiyon sa HALO-HALONG BILANG!\n\nAng halo-halong bilang ay may BUONG NUMERO at PRAKSIYON.\n\nMGA HAKBANG:\n1️⃣ Hatiin: ITAAS ÷ IBABA\n2️⃣ Ang sagot (quotient) → BUONG NUMERO\n3️⃣ Ang natira (remainder) → bagong ITAAS\n4️⃣ Panatilihing PAREHO ang IBABA\n\nHalimbawa: 7 ÷ 3 = 2 natira 1 → sagot ay 2 at 1/3!", visual: "convert_imp" },
        { icon: "📝", title: "Subukan Natin ang mga Hakbang!", text: "I-convert natin ang 11/4 nang magkasama!\n\nHakbang 1: 11 ÷ 4 = ?\n→ 4 × 2 = 8 (masyadong maliit)\n→ 4 × 3 = 12 (masyadong malaki!)\n→ Kaya 4 pumasok sa 11 nang 2 beses!\n\nHakbang 2: 2 ang buong numero\n\nHakbang 3: 11 - 8 = 3 → 3 ang natira (bagong itaas)\n\nHakbang 4: Ibaba ay nananatiling 4\n\nSagot: 2 at 3/4! ✅", visual: "steps_imp" },
        { icon: "🎯", title: "Mabilis na Tip!", text: "Paraan ng PAGSURI ng iyong sagot:\n\nKung mayroon kang halo-halong bilang W at N/D, i-convert pabalik:\n→ (W × D) + N ay dapat katumbas ng original na itaas!\n\nPara sa 2 at 3/4:\n→ (2 × 4) + 3 = 8 + 3 = 11 ✅\n\nTumutugma ito sa 11/4 — tama! 🎉\n\nSubukan na natin!", visual: "check_imp" },
      ],
      practice: [
        { q: { type: "mc-mixed", instruction: "I-convert ang 7/2 sa Halo-halong Bilang! 🔄", displayFrac: { n: 7, d: 2 }, choices: [{ w: 3, n: 1, d: 2, isCorrect: true }, { w: 2, n: 1, d: 2, isCorrect: false }, { w: 3, n: 2, d: 3, isCorrect: false }, { w: 4, n: 1, d: 2, isCorrect: false }], answer: { w: 3, n: 1, d: 2 }, hint: "7 ÷ 2 = 3 natira 1 → sagot ay 3 at 1/2! ✅" } },
        { q: { type: "mc-mixed", instruction: "I-convert ang 9/4 sa Halo-halong Bilang! 🔄", displayFrac: { n: 9, d: 4 }, choices: [{ w: 2, n: 1, d: 4, isCorrect: true }, { w: 3, n: 1, d: 4, isCorrect: false }, { w: 2, n: 3, d: 5, isCorrect: false }, { w: 1, n: 1, d: 4, isCorrect: false }], answer: { w: 2, n: 1, d: 4 }, hint: "9 ÷ 4 = 2 natira 1 → sagot ay 2 at 1/4! ✅" } },
      ],
    },
  },
  mixed: {
    EN: {
      title: "Mixed Numbers",
      slides: [
        { icon: "🍰", title: "What is a Mixed Number?", text: "A MIXED NUMBER has two parts:\n1️⃣ A WHOLE NUMBER (like 1, 2, 3...)\n2️⃣ A PROPER FRACTION (like 1/2, 3/4...)\n\nExamples:\n• 2½ = 2 whole cakes + half a cake\n• 3 and 1/4 = 3 whole pizzas + 1/4 of a pizza\n• 1 and 2/3 = 1 whole chocolate bar + 2/3 of another\n\nIt describes having MORE THAN ONE WHOLE thing!", visual: "mixed_intro" },
        { icon: "🔄", title: "Converting Mixed → Improper", text: "To convert a MIXED NUMBER to an IMPROPER FRACTION:\n\nSTEPS:\n1️⃣ Multiply: WHOLE × DENOMINATOR\n2️⃣ Add: result + NUMERATOR = new TOP\n3️⃣ Keep the SAME DENOMINATOR at bottom\n\nExample: 2 and 1/3\n→ Step 1: 2 × 3 = 6\n→ Step 2: 6 + 1 = 7 (new TOP!)\n→ Step 3: Keep 3 at bottom\n→ Answer: 7/3 ✅", visual: "convert_mix" },
        { icon: "🎨", title: "Why Do We Convert?", text: "Converting mixed numbers to improper fractions makes it EASIER to add or subtract fractions!\n\nFor example, to add 1½ + 2¼:\n→ Convert: 3/2 + 9/4\n→ Then add normally!\n\nSo it's a very useful skill to have! 💪\n\nLet's do some examples together:", visual: "why_mix" },
        { icon: "✨", title: "Memory Trick!", text: "Here's a trick to remember the conversion:\n\nImagine the DENOMINATOR is a wheel 🎡\nThe WHOLE NUMBER says how many FULL spins\nThe NUMERATOR is the extra steps after!\n\nFor 3 and 2/5:\n→ 3 full spins × 5 steps each = 15\n→ Plus 2 extra steps = 17\n→ So 17/5! ✅\n\n(3 × 5) + 2 = 17 → answer is 17/5!", visual: "trick_mix" },
      ],
      practice: [
        { q: { type: "mc-frac", instruction: "Convert 2 and 1/3 to an Improper Fraction! 🔄", displayMixed: { w: 2, n: 1, d: 3 }, choices: [{ n: 7, d: 3, isCorrect: true }, { n: 5, d: 3, isCorrect: false }, { n: 6, d: 3, isCorrect: false }, { n: 7, d: 4, isCorrect: false }], answer: { n: 7, d: 3 }, hint: "(2 × 3) + 1 = 6 + 1 = 7 → answer is 7/3! ✅" } },
        { q: { type: "mc-frac", instruction: "Convert 3 and 1/4 to an Improper Fraction! 🔄", displayMixed: { w: 3, n: 1, d: 4 }, choices: [{ n: 13, d: 4, isCorrect: true }, { n: 10, d: 4, isCorrect: false }, { n: 12, d: 4, isCorrect: false }, { n: 13, d: 3, isCorrect: false }], answer: { n: 13, d: 4 }, hint: "(3 × 4) + 1 = 12 + 1 = 13 → answer is 13/4! ✅" } },
      ],
    },
    TL: {
      title: "Halo-halong Bilang",
      slides: [
        { icon: "🍰", title: "Ano ang Halo-halong Bilang?", text: "Ang HALO-HALONG BILANG ay may dalawang bahagi:\n1️⃣ BUONG NUMERO (tulad ng 1, 2, 3...)\n2️⃣ TAMANG PRAKSIYON (tulad ng 1/2, 3/4...)\n\nMga halimbawa:\n• 2½ = 2 buong cake + kalahating cake\n• 3 at 1/4 = 3 buong pizza + 1/4 ng pizza\n• 1 at 2/3 = 1 buong tsokolate + 2/3 ng isa pa\n\nIto ay naglalarawan ng pagkakaroon ng HIGIT sa isang buo!", visual: "mixed_intro" },
        { icon: "🔄", title: "Pag-convert ng Halo-halo → Di-wasto", text: "Para i-convert ang HALO-HALONG BILANG sa DI-WASTONG PRAKSIYON:\n\nMGA HAKBANG:\n1️⃣ I-multiply: BUO × DENOMINADOR\n2️⃣ Idagdag: resulta + NUMERADOR = bagong ITAAS\n3️⃣ Panatilihing PAREHO ang DENOMINADOR sa ibaba\n\nHalimbawa: 2 at 1/3\n→ Hakbang 1: 2 × 3 = 6\n→ Hakbang 2: 6 + 1 = 7 (bagong ITAAS!)\n→ Hakbang 3: Panatilihin ang 3 sa ibaba\n→ Sagot: 7/3 ✅", visual: "convert_mix" },
        { icon: "🎨", title: "Bakit Natin Ito I-co-convert?", text: "Ang pag-convert ng halo-halong bilang sa di-wastong praksiyon ay nagpapadali ng pagdaragdag o pagbabawas ng mga praksiyon!\n\nHalimbawa, para magdagdag ng 1½ + 2¼:\n→ I-convert: 3/2 + 9/4\n→ Tapos magdagdag ng normal!\n\nKaya napaka-useful na kasanayan ito! 💪\n\nMag-practice tayo:", visual: "why_mix" },
        { icon: "✨", title: "Trick para Matandaan!", text: "Narito ang trick para matandaan ang conversion:\n\nIsipin mo ang DENOMINADOR bilang gulong 🎡\nAng BUONG NUMERO ay nagsasabi kung ilang BESES itong umikot\nAng NUMERADOR ay ang extra na hakbang!\n\nPara sa 3 at 2/5:\n→ 3 beses × 5 hakbang = 15\n→ Plus 2 extra = 17\n→ Kaya 17/5! ✅\n\n(3 × 5) + 2 = 17 → sagot ay 17/5!", visual: "trick_mix" },
      ],
      practice: [
        { q: { type: "mc-frac", instruction: "I-convert ang 2 at 1/3 sa Di-wastong Praksiyon! 🔄", displayMixed: { w: 2, n: 1, d: 3 }, choices: [{ n: 7, d: 3, isCorrect: true }, { n: 5, d: 3, isCorrect: false }, { n: 6, d: 3, isCorrect: false }, { n: 7, d: 4, isCorrect: false }], answer: { n: 7, d: 3 }, hint: "(2 × 3) + 1 = 6 + 1 = 7 → sagot ay 7/3! ✅" } },
        { q: { type: "mc-frac", instruction: "I-convert ang 3 at 1/4 sa Di-wastong Praksiyon! 🔄", displayMixed: { w: 3, n: 1, d: 4 }, choices: [{ n: 13, d: 4, isCorrect: true }, { n: 10, d: 4, isCorrect: false }, { n: 12, d: 4, isCorrect: false }, { n: 13, d: 3, isCorrect: false }], answer: { n: 13, d: 4 }, hint: "(3 × 4) + 1 = 12 + 1 = 13 → sagot ay 13/4! ✅" } },
      ],
    },
  },
  add: {
    EN: {
      title: "Adding Fractions",
      slides: [
        { icon: "➕", title: "Adding Fractions — Same Bottom!", text: "When two fractions have the SAME DENOMINATOR (bottom number), adding them is SUPER EASY!\n\nYou only add the TOP numbers (numerators)!\nThe BOTTOM number STAYS THE SAME!\n\nThink of it like this:\n🍕 1 slice/8 + 3 slices/8 = 4 slices/8\nYou're just counting slices — the pizza stays the same size (8 slices total)!", visual: "add_intro" },
        { icon: "📐", title: "The Golden Rule", text: "THE RULE:\n\n  N1     N2     N1 + N2\n ─── + ─── = ─────────\n  D      D         D\n\nJust add the TOPS, keep the BOTTOM!\n\n✅ 2/7 + 3/7 = (2+3)/7 = 5/7\n✅ 1/5 + 2/5 = (1+2)/5 = 3/5\n✅ 4/9 + 2/9 = (4+2)/9 = 6/9 = 2/3\n\nRemember: ONLY add numerators (tops)! Never add the denominators!", visual: "add_rule" },
        { icon: "✂️", title: "Simplifying Your Answer", text: "Sometimes you can SIMPLIFY (reduce) your answer!\n\nSimplifying means making the fraction smaller by dividing both top and bottom by the SAME number.\n\nExample: 6/9\n→ Both 6 and 9 can be divided by 3!\n→ 6÷3 = 2, 9÷3 = 3\n→ 6/9 = 2/3 ✅ (simpler!)\n\nAlways check if you can simplify your answer!", visual: "simplify" },
        { icon: "🎯", title: "Practice Strategy", text: "When you see an addition question, follow these steps:\n\n1️⃣ CHECK — are the bottom numbers the same?\n2️⃣ ADD — add only the top numbers\n3️⃣ KEEP — keep the bottom number the same\n4️⃣ SIMPLIFY — can you divide top and bottom by the same number?\n\nLet's try some practice questions!", visual: "add_steps" },
      ],
      practice: [
        { q: { type: "mc-frac", instruction: "Add the fractions! ➕", displayOp: { n1: 2, d1: 7, op: "+", n2: 3, d2: 7 }, choices: [{ n: 5, d: 7, isCorrect: true }, { n: 5, d: 14, isCorrect: false }, { n: 6, d: 7, isCorrect: false }, { n: 1, d: 7, isCorrect: false }], answer: { n: 5, d: 7 }, hint: "2 + 3 = 5, keep the bottom 7 → answer is 5/7! ✅" } },
        { q: { type: "mc-frac", instruction: "Add and simplify! ➕", displayOp: { n1: 2, d1: 6, op: "+", n2: 1, d2: 6 }, choices: [{ n: 1, d: 2, isCorrect: true }, { n: 3, d: 6, isCorrect: true }, { n: 3, d: 12, isCorrect: false }, { n: 2, d: 6, isCorrect: false }], answer: { n: 1, d: 2 }, hint: "2+1=3, keep 6 → 3/6 → simplify: ÷3 = 1/2! ✅" } },
      ],
    },
    TL: {
      title: "Pagdaragdag ng Mga Praksiyon",
      slides: [
        { icon: "➕", title: "Pagdaragdag — Parehong Ibaba!", text: "Kapag ang dalawang praksiyon ay may PAREHONG DENOMINADOR (ibabang numero), ang pagdaragdag ay napakasimple!\n\nI-DAGDAG LANG ang mga ITAAS na numero (numeradores)!\nAng IBABANG numero ay NANANATILING PAREHO!\n\nIsipin ito:\n🍕 1 hiwa/8 + 3 hiwa/8 = 4 hiwa/8\nBinibilang mo lang ang mga hiwa — ang pizza ay nananatiling parehong laki (8 hiwa)!", visual: "add_intro" },
        { icon: "📐", title: "Ang Gintong Panuntunan", text: "ANG PANUNTUNAN:\n\n  N1     N2     N1 + N2\n ─── + ─── = ─────────\n  D      D         D\n\nIdagdag lang ang mga ITAAS, panatilihin ang IBABA!\n\n✅ 2/7 + 3/7 = (2+3)/7 = 5/7\n✅ 1/5 + 2/5 = (1+2)/5 = 3/5\n✅ 4/9 + 2/9 = (4+2)/9 = 6/9 = 2/3\n\nTandaan: NUMERADORES (itaas) LANG ang dinadagdag! Huwag idagdag ang mga denominador!", visual: "add_rule" },
        { icon: "✂️", title: "Pag-simplify ng Sagot", text: "Minsan maaari mong SIMPLIFYHIN (bawasan) ang iyong sagot!\n\nAng simplifying ay nangangahulugang gawing mas maliit ang praksiyon sa pamamagitan ng paghahati ng itaas at ibaba sa PAREHONG numero.\n\nHalimbawa: 6/9\n→ Ang 6 at 9 ay maaaring hatiin ng 3!\n→ 6÷3 = 2, 9÷3 = 3\n→ 6/9 = 2/3 ✅ (mas simple!)\n\nPalaging suriin kung maaari mong i-simplify ang iyong sagot!", visual: "simplify" },
        { icon: "🎯", title: "Estratehiya sa Pagsagot", text: "Kapag nakakita ka ng tanong na pagdaragdag, sundin ang mga hakbang na ito:\n\n1️⃣ SURIIN — pareho ba ang mga ibabang numero?\n2️⃣ IDAGDAG — idagdag lang ang mga itaas na numero\n3️⃣ PANATILIHIN — panatilihing pareho ang ibabang numero\n4️⃣ SIMPLIFYHIN — maaari mo bang hatiin ang itaas at ibaba sa parehong numero?\n\nSubukan na natin!", visual: "add_steps" },
      ],
      practice: [
        { q: { type: "mc-frac", instruction: "Idagdag ang mga praksiyon! ➕", displayOp: { n1: 2, d1: 7, op: "+", n2: 3, d2: 7 }, choices: [{ n: 5, d: 7, isCorrect: true }, { n: 5, d: 14, isCorrect: false }, { n: 6, d: 7, isCorrect: false }, { n: 1, d: 7, isCorrect: false }], answer: { n: 5, d: 7 }, hint: "2 + 3 = 5, panatilihing 7 ang ibaba → sagot ay 5/7! ✅" } },
        { q: { type: "mc-frac", instruction: "Idagdag at i-simplify! ➕", displayOp: { n1: 2, d1: 6, op: "+", n2: 1, d2: 6 }, choices: [{ n: 1, d: 2, isCorrect: true }, { n: 3, d: 6, isCorrect: true }, { n: 3, d: 12, isCorrect: false }, { n: 2, d: 6, isCorrect: false }], answer: { n: 1, d: 2 }, hint: "2+1=3, panatilihin 6 → 3/6 → i-simplify: ÷3 = 1/2! ✅" } },
      ],
    },
  },
  sub: {
    EN: {
      title: "Subtracting Fractions",
      slides: [
        { icon: "➖", title: "Subtracting Fractions — Same Bottom!", text: "Just like adding, when two fractions have the SAME DENOMINATOR, subtraction is easy!\n\nYou only subtract the TOP numbers!\nThe BOTTOM stays the same!\n\n🍕 If you have 5/8 of a pizza and eat 2/8 more:\n5/8 − 2/8 = 3/8 of the pizza left!\n\nYou're just counting the remaining slices!", visual: "sub_intro" },
        { icon: "📐", title: "The Rule", text: "THE RULE:\n\n  N1     N2     N1 - N2\n ─── − ─── = ─────────\n  D      D         D\n\nJust subtract the TOPS, keep the BOTTOM!\n\n✅ 5/7 − 2/7 = (5-2)/7 = 3/7\n✅ 4/5 − 1/5 = (4-1)/5 = 3/5\n✅ 8/9 − 5/9 = (8-5)/9 = 3/9 = 1/3\n\nAlways make sure the answer is POSITIVE (bigger minus smaller)!", visual: "sub_rule" },
        { icon: "⚠️", title: "Important Warning!", text: "Make sure you subtract the SMALLER top from the BIGGER top!\n\nIf you see 3/8 − 7/8, the answer would be NEGATIVE.\nIn this level we always give you fractions where the result is positive, so don't worry!\n\n✅ 7/8 − 3/8 = 4/8 = 1/2 ← THIS is positive!\n\nAlso remember to SIMPLIFY when possible:\n4/8 → both divided by 4 → 1/2 ✅", visual: "sub_warning" },
        { icon: "🎯", title: "Practice Strategy", text: "For subtraction questions:\n\n1️⃣ CHECK — same bottom numbers? ✅\n2️⃣ SUBTRACT — subtract only the tops (bigger − smaller)\n3️⃣ KEEP — keep the bottom the same\n4️⃣ SIMPLIFY — can you reduce the fraction?\n\nSame steps as addition but with minus! Let's try!", visual: "sub_steps" },
      ],
      practice: [
        { q: { type: "mc-frac", instruction: "Subtract the fractions! ➖", displayOp: { n1: 5, d1: 8, op: "−", n2: 2, d2: 8 }, choices: [{ n: 3, d: 8, isCorrect: true }, { n: 7, d: 8, isCorrect: false }, { n: 3, d: 16, isCorrect: false }, { n: 2, d: 8, isCorrect: false }], answer: { n: 3, d: 8 }, hint: "5 − 2 = 3, keep the bottom 8 → answer is 3/8! ✅" } },
        { q: { type: "mc-frac", instruction: "Subtract and simplify! ➖", displayOp: { n1: 4, d1: 6, op: "−", n2: 2, d2: 6 }, choices: [{ n: 1, d: 3, isCorrect: true }, { n: 2, d: 6, isCorrect: true }, { n: 2, d: 12, isCorrect: false }, { n: 3, d: 6, isCorrect: false }], answer: { n: 1, d: 3 }, hint: "4-2=2, keep 6 → 2/6 → simplify: ÷2 = 1/3! ✅" } },
      ],
    },
    TL: {
      title: "Pagbabawas ng Mga Praksiyon",
      slides: [
        { icon: "➖", title: "Pagbabawas — Parehong Ibaba!", text: "Tulad ng pagdaragdag, kapag ang dalawang praksiyon ay may PAREHONG DENOMINADOR, ang pagbabawas ay madali!\n\nI-BAWAS LANG ang mga ITAAS na numero!\nAng IBABA ay nananatiling pareho!\n\n🍕 Kung mayroon kang 5/8 ng pizza at kumain ka ng 2/8 pa:\n5/8 − 2/8 = 3/8 ng pizza ang natitira!\n\nBinibilang mo lang ang natitirang mga hiwa!", visual: "sub_intro" },
        { icon: "📐", title: "Ang Panuntunan", text: "ANG PANUNTUNAN:\n\n  N1     N2     N1 - N2\n ─── − ─── = ─────────\n  D      D         D\n\nI-bawas lang ang mga ITAAS, panatilihin ang IBABA!\n\n✅ 5/7 − 2/7 = (5-2)/7 = 3/7\n✅ 4/5 − 1/5 = (4-1)/5 = 3/5\n✅ 8/9 − 5/9 = (8-5)/9 = 3/9 = 1/3\n\nSiguraduhing ang sagot ay POSITIBO (malaki minus maliit)!", visual: "sub_rule" },
        { icon: "⚠️", title: "Mahalagang Babala!", text: "Siguraduhing ibinabawas mo ang MALIIT mula sa MALAKI!\n\nKung nakakita ka ng 3/8 − 7/8, ang sagot ay magiging NEGATIBO.\nSa level na ito lagi kaming nagbibigay ng mga praksiyon kung saan ang sagot ay positibo, kaya huwag mag-alala!\n\n✅ 7/8 − 3/8 = 4/8 = 1/2 ← ITO ay positibo!\n\nTandaan din na I-SIMPLIFY kapag posible:\n4/8 → hatiin ng 4 → 1/2 ✅", visual: "sub_warning" },
        { icon: "🎯", title: "Estratehiya sa Pagsagot", text: "Para sa mga tanong na pagbabawas:\n\n1️⃣ SURIIN — parehong ibabang numero? ✅\n2️⃣ IBAWAS — ibawas lang ang mga itaas (malaki − maliit)\n3️⃣ PANATILIHIN — panatilihing pareho ang ibaba\n4️⃣ SIMPLIFYHIN — maaari mo bang bawasan ang praksiyon?\n\nParehong mga hakbang sa pagdaragdag ngunit may minus! Subukan natin!", visual: "sub_steps" },
      ],
      practice: [
        { q: { type: "mc-frac", instruction: "Ibawas ang mga praksiyon! ➖", displayOp: { n1: 5, d1: 8, op: "−", n2: 2, d2: 8 }, choices: [{ n: 3, d: 8, isCorrect: true }, { n: 7, d: 8, isCorrect: false }, { n: 3, d: 16, isCorrect: false }, { n: 2, d: 8, isCorrect: false }], answer: { n: 3, d: 8 }, hint: "5 − 2 = 3, panatilihing 8 ang ibaba → sagot ay 3/8! ✅" } },
        { q: { type: "mc-frac", instruction: "Ibawas at i-simplify! ➖", displayOp: { n1: 4, d1: 6, op: "−", n2: 2, d2: 6 }, choices: [{ n: 1, d: 3, isCorrect: true }, { n: 2, d: 6, isCorrect: true }, { n: 2, d: 12, isCorrect: false }, { n: 3, d: 6, isCorrect: false }], answer: { n: 1, d: 3 }, hint: "4-2=2, panatilihin 6 → 2/6 → i-simplify: ÷2 = 1/3! ✅" } },
      ],
    },
  },
};

/* ═══════════════════════════════════════════════════
   3-D CSS HAMSTER
═══════════════════════════════════════════════════ */
function Hamster3D({ size = 80, style = {}, className = "" }) {
  const s = (n) => `${(n * size) / 80}px`;
  return (
    <div className={className} style={{ position: "relative", width: s(80), height: s(88), flexShrink: 0, ...style }}>
      <div style={{ position: "absolute", bottom: s(-3), left: "50%", transform: "translateX(-50%)", width: s(60), height: s(10), background: "rgba(0,0,0,.35)", borderRadius: "50%", filter: "blur(4px)" }} />
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: s(62), height: s(48), background: "radial-gradient(circle at 38% 32%,#f7d08a,#c8864e)", borderRadius: "50%", boxShadow: `${s(2)} ${s(6)} ${s(14)} rgba(0,0,0,.45),inset ${s(-4)} ${s(-5)} ${s(10)} rgba(0,0,0,.25),inset ${s(3)} ${s(3)} ${s(8)} rgba(255,255,255,.25)` }} />
      <div style={{ position: "absolute", bottom: s(6), left: "50%", transform: "translateX(-50%)", width: s(34), height: s(26), background: "radial-gradient(circle at 50% 40%,#fdf0dc,#f7d8b0)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", top: s(3), left: "50%", transform: "translateX(-50%)", width: s(58), height: s(50), background: "radial-gradient(circle at 38% 30%,#f7d08a,#c8864e)", borderRadius: "55% 55% 48% 48%", boxShadow: `${s(2)} ${s(4)} ${s(12)} rgba(0,0,0,.4),inset ${s(-3)} ${s(-4)} ${s(8)} rgba(0,0,0,.2),inset ${s(2)} ${s(2)} ${s(6)} rgba(255,255,255,.3)` }} />
      {[{ l: s(3) }, { r: s(3) }].map((e, i) => (
        <div key={i} style={{ position: "absolute", top: s(1), ...(i === 0 ? { left: s(3) } : { right: s(3) }), width: s(18), height: s(18), background: "radial-gradient(circle at 40% 40%,#d4956a,#b06030)", borderRadius: "50%", boxShadow: `${s(1)} ${s(2)} ${s(5)} rgba(0,0,0,.35)` }}>
          <div style={{ position: "absolute", top: "22%", left: "18%", width: "60%", height: "60%", background: "#ffb3c6", borderRadius: "50%" }} />
        </div>
      ))}
      {[{ l: s(0) }, { r: s(0) }].map((e, i) => <div key={i} style={{ position: "absolute", top: s(26), ...(i === 0 ? { left: s(0) } : { right: s(0) }), width: s(22), height: s(18), background: "radial-gradient(circle at 40% 40%,rgba(255,195,165,.85),rgba(220,145,105,.65))", borderRadius: "50%" }} />)}
      {[{ l: s(13) }, { r: s(13) }].map((e, i) => (
        <div key={i} style={{ position: "absolute", top: s(19), ...(i === 0 ? { left: s(13) } : { right: s(13) }), width: s(11), height: s(11), background: "radial-gradient(circle at 38% 32%,#3d2010,#1a0a00)", borderRadius: "50%", boxShadow: `inset ${s(1)} ${s(1)} ${s(4)} rgba(255,255,255,.35)` }}>
          <div style={{ position: "absolute", top: "12%", left: "12%", width: "38%", height: "38%", background: "rgba(255,255,255,.9)", borderRadius: "50%" }} />
        </div>
      ))}
      <div style={{ position: "absolute", top: s(32), left: "50%", transform: "translateX(-50%)", width: s(10), height: s(7), background: "radial-gradient(circle at 40% 40%,#ff9bb0,#e87090)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", top: s(38), left: "50%", transform: "translateX(-50%)", width: s(14), height: s(5), borderBottom: `${s(2)} solid rgba(180,100,60,.55)`, borderRadius: "0 0 50% 50%" }} />
      {[{ l: s(4) }, { r: s(4) }].map((e, i) => <div key={i} style={{ position: "absolute", bottom: s(3), ...(i === 0 ? { left: s(4) } : { right: s(4) }), width: s(14), height: s(10), background: "radial-gradient(circle at 40% 35%,#f7d08a,#c8864e)", borderRadius: "50% 50% 40% 40%", boxShadow: `${s(1)} ${s(2)} ${s(4)} rgba(0,0,0,.3)` }} />)}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   FRACTION / MIXED ATOMS
═══════════════════════════════════════════════════ */
const Frac = ({ n, d, col = "text-white", big = false }) => (
  <span className={`inline-flex flex-col items-center font-black leading-none mx-1.5 align-middle ${col}`} style={{ fontFamily: "Fredoka One,cursive" }}>
    <span className={big ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}>{n}</span>
    <span className={`block ${big ? "my-1.5" : "my-1"}`} style={{ borderBottom: "5px solid currentColor", width: big ? "3.2rem" : "2.4rem", borderRadius: "4px" }} />
    <span className={big ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}>{d}</span>
  </span>
);
const Mixed = ({ w, n, d, col = "text-white", big = false }) => (
  <span className="inline-flex items-center gap-1.5 align-middle">
    <span className={`font-black ${big ? "text-4xl sm:text-5xl" : "text-3xl"} ${col}`} style={{ fontFamily: "Fredoka One,cursive" }}>{w}</span>
    <Frac n={n} d={d} col={col} big={big} />
  </span>
);

/* ═══════════════════════════════════════════════════
   WORLD DATA
═══════════════════════════════════════════════════ */
const WORLDS = [
  { id: "proper",   name: { EN: "Proper Fraction Forest",   TL: "Kagubatan ng Tamang Praksiyon" }, icon: "🌲", bg: "from-emerald-950 via-green-950 to-teal-950",   cssBg: "linear-gradient(135deg,#022c22 0%,#052e16 50%,#042f2e 100%)", color: "text-emerald-300", btnCls: "bg-emerald-500 hover:bg-emerald-400",
    levels: [
      { name: { EN: "Level 1 – Seedling", TL: "Antas 1 – Punla" }, diff: 0, enemy: { emoji: "🐛", name: "Chubby Caterpillar", atk: "🌿" } },
      { name: { EN: "Level 2 – Explorer", TL: "Antas 2 – Manlalakbay" }, diff: 1, enemy: { emoji: "🦎", name: "Stone Lizard", atk: "🪨" } },
      { name: { EN: "Level 3 – Champion", TL: "Antas 3 – Kampeon" }, diff: 2, enemy: { emoji: "🐲", name: "Forest Drake", atk: "🔥" } },
    ] },
  { id: "improper", name: { EN: "Improper Dragon's Den",   TL: "Yungib ng Di-Wastong Praksiyon" }, icon: "🔥", bg: "from-orange-950 via-red-950 to-rose-950",   cssBg: "linear-gradient(135deg,#431407 0%,#450a0a 50%,#4c0519 100%)", color: "text-orange-300", btnCls: "bg-orange-500 hover:bg-orange-400",
    levels: [
      { name: { EN: "Level 1 – Rookie",   TL: "Antas 1 – Baguhan" }, diff: 0, enemy: { emoji: "👾", name: "Slime Bug",   atk: "💦" } },
      { name: { EN: "Level 2 – Warrior",  TL: "Antas 2 – Mandirigma" }, diff: 1, enemy: { emoji: "🧌", name: "Cave Troll",  atk: "🪨" } },
      { name: { EN: "Level 3 – Dragon",   TL: "Antas 3 – Dragon" }, diff: 2, enemy: { emoji: "🦕", name: "Dino Rex",    atk: "🦷" } },
    ] },
  { id: "mixed",    name: { EN: "Mixed Number Mountain",   TL: "Bundok ng Halo-halong Bilang" }, icon: "⛰️", bg: "from-violet-950 via-purple-950 to-indigo-950", cssBg: "linear-gradient(135deg,#2e1065 0%,#3b0764 50%,#1e1b4b 100%)", color: "text-violet-300", btnCls: "bg-violet-500 hover:bg-violet-400",
    levels: [
      { name: { EN: "Level 1 – Climber",  TL: "Antas 1 – Umaakyat" }, diff: 0, enemy: { emoji: "🐸", name: "Mud Frog",    atk: "💧" } },
      { name: { EN: "Level 2 – Hiker",    TL: "Antas 2 – Manlalakad" }, diff: 1, enemy: { emoji: "🧟", name: "Mud Zombie",  atk: "🫧" } },
      { name: { EN: "Level 3 – Peak",     TL: "Antas 3 – Tuktok" }, diff: 2, enemy: { emoji: "👹", name: "Mountain Oni", atk: "⚡" } },
    ] },
  { id: "add",      name: { EN: "Addition Arena",          TL: "Arena ng Pagdaragdag" }, icon: "⚡", bg: "from-sky-950 via-blue-950 to-cyan-950",         cssBg: "linear-gradient(135deg,#082f49 0%,#172554 50%,#083344 100%)", color: "text-sky-300",    btnCls: "bg-sky-500 hover:bg-sky-400",
    levels: [
      { name: { EN: "Level 1 – Spark",   TL: "Antas 1 – Iskintipay" }, diff: 0, enemy: { emoji: "🧙", name: "Dark Wizard",  atk: "🔮" } },
      { name: { EN: "Level 2 – Bolt",    TL: "Antas 2 – Kidlat" }, diff: 1, enemy: { emoji: "🧛", name: "Shadow Count", atk: "🩸" } },
      { name: { EN: "Level 3 – Thunder", TL: "Antas 3 – Kulog" }, diff: 2, enemy: { emoji: "⚡", name: "Storm Giant",  atk: "🌩️" } },
    ] },
  { id: "sub",      name: { EN: "Subtraction Swamp",       TL: "Latian ng Pagbabawas" }, icon: "💧", bg: "from-teal-950 via-cyan-950 to-blue-950",         cssBg: "linear-gradient(135deg,#042f2e 0%,#083344 50%,#172554 100%)", color: "text-teal-300",   btnCls: "bg-teal-500 hover:bg-teal-400",
    levels: [
      { name: { EN: "Level 1 – Puddle",  TL: "Antas 1 – Lusak" }, diff: 0, enemy: { emoji: "🦑", name: "Ink Squid",    atk: "🖤" } },
      { name: { EN: "Level 2 – River",   TL: "Antas 2 – Ilog" }, diff: 1, enemy: { emoji: "🦈", name: "Dark Shark",   atk: "🦷" } },
      { name: { EN: "Level 3 – Deep",    TL: "Antas 3 – Kailaliman" }, diff: 2, enemy: { emoji: "🐙", name: "Giant Kraken", atk: "🌊" } },
    ] },
  ...NEW_WORLDS,
];

/* ═══════════════════════════════════════════════════
   QUESTION GENERATORS  (difficulty 0=easy MC, 1=mix, 2=hard type-in)
═══════════════════════════════════════════════════ */
function genProper(diff) {
  const maxD = diff === 0 ? 5 : diff === 1 ? 10 : 16;
  const d = R(3, maxD), n = R(1, d - 1);
  const w = [];
  while (w.length < 3) { const wd = R(2, maxD), wn = wd + R(0, 4); if (!w.find(x => x.n === wn && x.d === wd) && wn !== n) w.push({ n: wn, d: wd, isCorrect: false }); }
  return { type: "mc-frac", instruction: "Which one is a PROPER fraction? (top < bottom) 🎯", choices: shuf([{ n, d, isCorrect: true }, ...w]), answer: { n, d }, hint: pick(TIPS.proper.EN), process: `${n} < ${d} → ${n}/${d} is proper`, fingerprint: `prop|${canon(n, d)}` };
}
function genImproper(diff) {
  const maxD = diff === 0 ? 5 : diff === 1 ? 8 : 12, d = R(2, maxD), w2 = R(1, diff === 0 ? 3 : 5), ex = R(1, d - 1), n = w2 * d + ex;
  if (diff < 2) {
    const ws = [];
    while (ws.length < 3) { const ww = R(1, 4), wn = R(1, d - 1), wd = d + R(-1, 2) || d; if (!ws.find(x => x.w === ww && x.n === wn)) ws.push({ w: ww, n: wn, d: wd, isCorrect: false }); }
    return { type: "mc-mixed", instruction: diff === 0 ? "Convert to a Mixed Number! 🔄" : "Convert this improper fraction! 🔄", displayFrac: { n, d }, choices: shuf([{ w: w2, n: ex, d, isCorrect: true }, ...ws]), answer: { w: w2, n: ex, d }, hint: pick(TIPS.improper.EN), process: `${n} ÷ ${d} = ${w2} R ${ex} → ${w2} ${ex}/${d}`, fingerprint: `imp|${canon(n, d)}` };
  }
  return { type: "type-mixed", instruction: "Convert to a Mixed Number! 🔄", displayFrac: { n, d }, answer: { w: w2, n: ex, d }, hint: pick(TIPS.improper.EN), process: `${n} ÷ ${d} = ${w2} R ${ex} → ${w2} ${ex}/${d}`, fingerprint: `imp|${canon(n, d)}` };
}
function genMixed(diff) {
  const maxD = diff === 0 ? 5 : diff === 1 ? 8 : 12, d = R(2, maxD), w2 = R(1, diff === 0 ? 3 : 5), n = R(1, d - 1), ansN = w2 * d + n;
  if (diff < 2) {
    const ws = [];
    while (ws.length < 3) { const wn = ansN + R(-3, 4) || ansN + 1, wd = d + R(-1, 2) || d; if (wn > 0 && wd > 0 && !(wn === ansN && wd === d) && !ws.find(x => x.n === wn && x.d === wd)) ws.push({ n: wn, d: wd, isCorrect: false }); }
    return { type: "mc-frac", instruction: diff === 0 ? "Convert to an Improper Fraction! 🔄" : "Convert this mixed number! 🔄", displayMixed: { w: w2, n, d }, choices: shuf([{ n: ansN, d, isCorrect: true }, ...ws]), answer: { n: ansN, d }, hint: pick(TIPS.mixed.EN), process: `(${w2}×${d})+${n} = ${ansN} → ${ansN}/${d}`, fingerprint: `mxd|${w2}+${canon(n, d)}` };
  }
  return { type: "type-frac", instruction: "Convert to an Improper Fraction! 🔄", displayMixed: { w: w2, n, d }, answer: { n: ansN, d }, hint: pick(TIPS.mixed.EN), process: `(${w2}×${d})+${n} = ${ansN} → ${ansN}/${d}`, fingerprint: `mxd|${w2}+${canon(n, d)}` };
}
function genAdd(diff) {
  const maxD = diff === 0 ? 7 : diff === 1 ? 12 : 18, d = R(2, maxD), n1 = R(1, d - 1), n2 = R(1, d - 1);
  const [ansN, ansD] = simp(n1 + n2, d);
  const ch = shuf([{ n: ansN, d: ansD, isCorrect: true }, { n: n1 + n2, d: d * 2, isCorrect: false }, { n: ansN + R(1, 3), d: ansD, isCorrect: false }, { n: Math.abs(n1 - n2) || 1, d, isCorrect: false }]);
  if (diff < 2) return { type: "mc-frac", instruction: diff === 0 ? "Add the fractions! ➕" : "Add and simplify! ➕", displayOp: { n1, d1: d, op: "+", n2, d2: d }, choices: ch, answer: { n: ansN, d: ansD }, hint: pick(TIPS.add.EN), process: `${n1}/${d} + ${n2}/${d} = ${n1+n2}/${d} → ${ansN}/${ansD}`, fingerprint: fpPair("addS", [n1, d], [n2, d], { commutative: true, sep: "+" }) };
  return { type: "type-frac", instruction: "Add and simplify! ➕", displayOp: { n1, d1: d, op: "+", n2, d2: d }, answer: { n: ansN, d: ansD }, hint: pick(TIPS.add.EN), process: `${n1}/${d} + ${n2}/${d} = ${n1+n2}/${d} → ${ansN}/${ansD}`, fingerprint: fpPair("addS", [n1, d], [n2, d], { commutative: true, sep: "+" }) };
}
function genSub(diff) {
  const maxD = diff === 0 ? 7 : diff === 1 ? 12 : 18, d = R(2, maxD), n1 = R(2, d - 1), n2 = R(1, n1 - 1);
  const [ansN, ansD] = simp(n1 - n2, d);
  const ch = shuf([{ n: ansN, d: ansD, isCorrect: true }, { n: n1 + n2, d, isCorrect: false }, { n: ansN + R(1, 3), d: ansD, isCorrect: false }, { n: Math.max(1, ansN - R(1, 2)), d: ansD, isCorrect: false }]);
  if (diff < 2) return { type: "mc-frac", instruction: diff === 0 ? "Subtract the fractions! ➖" : "Subtract and simplify! ➖", displayOp: { n1, d1: d, op: "−", n2, d2: d }, choices: ch, answer: { n: ansN, d: ansD }, hint: pick(TIPS.sub.EN), process: `${n1}/${d} − ${n2}/${d} = ${n1-n2}/${d} → ${ansN}/${ansD}`, fingerprint: fpPair("subS", [n1, d], [n2, d], { commutative: false, sep: "-" }) };
  return { type: "type-frac", instruction: "Subtract and simplify! ➖", displayOp: { n1, d1: d, op: "−", n2, d2: d }, answer: { n: ansN, d: ansD }, hint: pick(TIPS.sub.EN), process: `${n1}/${d} − ${n2}/${d} = ${n1-n2}/${d} → ${ansN}/${ansD}`, fingerprint: fpPair("subS", [n1, d], [n2, d], { commutative: false, sep: "-" }) };
}
const GENS = { proper: genProper, improper: genImproper, mixed: genMixed, add: genAdd, sub: genSub, ...NEW_GENS };
function genBossQ() {
  const ids = Object.keys(GENS);
  const id = pick(ids);
  return GENS[id](R(0, 2));
}

/* ═══════════════════════════════════════════════════
   CONFETTI
═══════════════════════════════════════════════════ */
const CONF_COLS = ["#ff6b9d","#ffd93d","#4ecdc4","#26de81","#ff9f43","#a55eea","#6ee7f7","#f9a8d4","#ff7675","#74b9ff"];
function FancyConfetti() {
  const pieces = useMemo(() => Array.from({ length: 65 }, (_, i) => ({ id: i, left: R(2, 98), endX: R(-110, 110), color: pick(CONF_COLS), size: R(6, 17), delay: R(0, 18) / 10, dur: R(13, 24) / 10, rot: R(200, 900), shape: i % 3 })), []);
  const kf = pieces.map(p => `@keyframes cf${p.id}{0%{opacity:1;transform:translate(0,-10px) rotate(0deg) scale(1);}100%{opacity:0;transform:translate(${p.endX}px,92vh) rotate(${p.rot}deg) scale(0.25);}}`).join("");
  return (
    <>
      <style>{kf}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 50, pointerEvents: "none", overflow: "hidden" }}>
        {pieces.map(p => <div key={p.id} style={{ position: "absolute", left: p.left + "%", top: "-20px", width: p.shape === 2 ? p.size * 1.5 : p.size, height: p.shape === 2 ? p.size * 1.5 : p.size, background: p.shape !== 2 ? p.color : "transparent", color: p.shape === 2 ? p.color : "transparent", fontSize: p.shape === 2 ? p.size * 1.3 : 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: p.shape === 0 ? "50%" : "2px", fontWeight: 900, animation: `cf${p.id} ${p.dur}s ease-in ${p.delay}s both` }}>{p.shape === 2 ? "★" : ""}</div>)}
      </div>
    </>
  );
}

/* ─── shared small components ─── */
function DmgNum({ text, color }) { return <div className="dmg-float absolute pointer-events-none font-black select-none text-xl sm:text-2xl" style={{ zIndex: 30, color, fontFamily: "Fredoka One,cursive", textShadow: "0 3px 8px rgba(0,0,0,.7)", top: "12%", left: "50%", transform: "translate(-50%,0)" }}>{text}</div>; }
function BgStars() { const d = useMemo(() => Array.from({ length: 18 }, (_, i) => ({ id: i, l: R(3, 97) + "%", t: R(5, 92) + "%", s: R(2, 7), dl: R(0, 35) / 10 + "s", dr: R(15, 40) / 10 + "s", o: R(1, 6) / 10 })), []); return <div className="absolute inset-0 pointer-events-none overflow-hidden">{d.map(x => <div key={x.id} className="absolute rounded-full bg-white" style={{ left: x.l, top: x.t, width: x.s, height: x.s, animation: `bgStar ${x.dr} ease-in-out ${x.dl} infinite`, opacity: x.o }} />)}</div>; }
function MusicBtn({ muted, onToggle }) { return <button onClick={onToggle} title={muted ? "Unmute" : "Mute"} className="fixed top-3 right-3 w-10 h-10 rounded-full font-black text-lg cursor-pointer border-none flex items-center justify-center transition-all hover:scale-110 active:scale-95" style={{ zIndex: 100, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.2)" }}>{muted ? "🔇" : "🎵"}</button>; }
function QDisplay({ q }) {
  if (!q) return null;
  if (q.displayOp) return <div className="flex items-center justify-center gap-2 flex-wrap"><Frac n={q.displayOp.n1} d={q.displayOp.d1} col="text-yellow-200" big /><span className="text-4xl sm:text-5xl font-black text-white" style={{ fontFamily: "Fredoka One,cursive" }}>{q.displayOp.op}</span><Frac n={q.displayOp.n2} d={q.displayOp.d2} col="text-yellow-200" big /></div>;
  if (q.displayFrac) return <Frac n={q.displayFrac.n} d={q.displayFrac.d} col="text-yellow-200" big />;
  if (q.displayMixed) return <Mixed w={q.displayMixed.w} n={q.displayMixed.n} d={q.displayMixed.d} col="text-yellow-200" big />;
  return null;
}
function DrawingCanvas() {
  const ref = useRef(null), dr = useRef(false), last = useRef({ x: 0, y: 0 });
  const [col, setCol] = useState("#fff"), [sz, setSz] = useState(5), [tool, setTool] = useState("pen");
  const pos = (e) => { const c = ref.current, r = c.getBoundingClientRect(), sx = c.width / r.width, sy = c.height / r.height, src = e.touches ? e.touches[0] : e; return { x: (src.clientX - r.left) * sx, y: (src.clientY - r.top) * sy }; };
  const s = (e) => { e.preventDefault(); dr.current = true; const p = pos(e), ctx = ref.current.getContext("2d"); ctx.globalCompositeOperation = tool === "erase" ? "destination-out" : "source-over"; ctx.beginPath(); ctx.arc(p.x, p.y, (tool === "erase" ? 14 : sz) / 2, 0, Math.PI * 2); ctx.fillStyle = tool === "erase" ? "rgba(0,0,0,1)" : col; ctx.fill(); last.current = p; };
  const m = (e) => { e.preventDefault(); if (!dr.current) return; const p = pos(e), ctx = ref.current.getContext("2d"); ctx.globalCompositeOperation = tool === "erase" ? "destination-out" : "source-over"; ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.strokeStyle = tool === "erase" ? "rgba(0,0,0,1)" : col; ctx.lineWidth = tool === "erase" ? 20 : sz; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(); last.current = p; };
  const colors = ["#ffffff","#ff6b6b","#ffd93d","#6ee7f7","#86efac","#f9a8d4","#c4b5fd","#fdba74","#4ade80","#fb923c"];
  return (
    <div className="mt-3 rounded-2xl p-3" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>✏️ Scratch Pad</span>
        <button onClick={() => ref.current.getContext("2d").clearRect(0, 0, ref.current.width, ref.current.height)} className="text-xs px-3 py-1 rounded-full font-bold cursor-pointer border-none" style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5" }}>🗑️ Clear</button>
      </div>
      <div className="flex gap-1.5 mb-2 flex-wrap items-center">
        {colors.map(c => <button key={c} onClick={() => { setCol(c); setTool("pen"); }} className="rounded-full cursor-pointer border-none flex-shrink-0" style={{ background: c, width: "26px", height: "26px", outline: col === c && tool === "pen" ? "3px solid white" : "3px solid transparent", outlineOffset: "2px" }} />)}
        <div className="w-px h-5 flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)" }} />
        {[3, 6, 11].map(sz2 => <button key={sz2} onClick={() => { setSz(sz2); setTool("pen"); }} className="rounded font-black cursor-pointer border-none flex-shrink-0" style={{ width: "28px", height: "24px", fontSize: "11px", background: sz === sz2 && tool === "pen" ? "white" : "rgba(255,255,255,0.12)", color: sz === sz2 && tool === "pen" ? "black" : "white" }}>{sz2 === 3 ? "S" : sz2 === 6 ? "M" : "L"}</button>)}
        <button onClick={() => setTool("erase")} className="px-2.5 h-6 rounded-full text-xs font-black cursor-pointer border-none flex-shrink-0" style={{ background: tool === "erase" ? "white" : "rgba(255,255,255,0.12)", color: tool === "erase" ? "black" : "white" }}>🧹</button>
      </div>
      <canvas ref={ref} width={800} height={200} className="w-full rounded-xl block cursor-crosshair" style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)", touchAction: "none" }} onMouseDown={s} onMouseMove={m} onMouseUp={() => dr.current = false} onMouseLeave={() => dr.current = false} onTouchStart={s} onTouchMove={m} onTouchEnd={() => dr.current = false} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   LANGUAGE PICKER SCREEN
═══════════════════════════════════════════════════ */
function LanguagePicker({ onPick }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: "radial-gradient(ellipse at 50% 30%,#1e1b4b 0%,#0d0221 60%,#000 100%)" }}>
      <style>{CSS}</style>
      <div className="idle-float mb-4"><Hamster3D size={100} style={{ filter: "drop-shadow(0 0 22px rgba(255,200,100,.65))" }} /></div>
      <h2 className="font-black text-3xl sm:text-4xl text-white mb-2" style={{ fontFamily: "Fredoka One,cursive" }}>Choose your language!</h2>
      <p className="font-black text-2xl sm:text-3xl mb-8" style={{ fontFamily: "Fredoka One,cursive", color: "rgba(255,255,255,0.6)" }}>Piliin ang iyong wika!</p>
      <div className="flex gap-5 flex-wrap justify-center">
        <button onClick={() => onPick("EN")}
          className="flex flex-col items-center gap-3 px-10 py-6 rounded-2xl cursor-pointer border-none hover:scale-105 active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", boxShadow: "0 8px 0 rgba(0,0,0,.35)" }}>
          <span className="text-5xl">🇺🇸</span>
          <span className="font-black text-xl text-white" style={{ fontFamily: "Fredoka One,cursive" }}>English</span>
        </button>
        <button onClick={() => onPick("TL")}
          className="flex flex-col items-center gap-3 px-10 py-6 rounded-2xl cursor-pointer border-none hover:scale-105 active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg,#fbbf24,#ef4444)", boxShadow: "0 8px 0 rgba(0,0,0,.35)" }}>
          <span className="text-5xl">🇵🇭</span>
          <span className="font-black text-xl text-white" style={{ fontFamily: "Fredoka One,cursive" }}>Filipino</span>
        </button>
      </div>
      <p className="mt-6 text-xs font-bold" style={{ color: "rgba(255,255,255,0.2)" }}>You can change this later from the map · Mababago mo ito sa mapa</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TUTORIAL SCREEN  (per world, slides + 2 practice Qs)
═══════════════════════════════════════════════════ */
function TutorialScreen({ worldIdx, lang, onFinish, onSkip, music }) {
  const w = WORLDS[worldIdx];
  const tut = TUTORIALS[w.id][lang];
  const TOTAL_SLIDES = tut.slides.length;
  const TOTAL_STEPS = TOTAL_SLIDES + tut.practice.length; // slides + practice

  const [step, setStep] = useState(0);
  const [practiceOk, setPracticeOk] = useState([false, false]);
  const [feedbacks, setFeedbacks] = useState(["", ""]);
  const [shake, setShake] = useState([false, false]);

  const isSlide = step < TOTAL_SLIDES;
  const pIdx = isSlide ? -1 : step - TOTAL_SLIDES;
  const slide = isSlide ? tut.slides[step] : null;
  const pq = !isSlide ? tut.practice[pIdx]?.q : null;

  const checkPractice = (choice) => {
    if (practiceOk[pIdx]) return;
    const ok = choice.isCorrect;
    if (ok) {
      const nok = [...practiceOk]; nok[pIdx] = true; setPracticeOk(nok);
      const nf = [...feedbacks]; nf[pIdx] = lang === "TL" ? "🎉 Tama! Magaling!" : "🎉 Correct! Great job!"; setFeedbacks(nf);
    } else {
      const ns = [...shake]; ns[pIdx] = true; setShake(ns); setTimeout(() => { const ns2 = [...shake]; ns2[pIdx] = false; setShake(ns2); }, 500);
      const nf = [...feedbacks]; nf[pIdx] = pq.hint; setFeedbacks(nf);
    }
  };

  const canNext = isSlide ? true : practiceOk[pIdx];
  const isLast = step === TOTAL_STEPS - 1;

  return (
    <div className="min-h-screen px-3 py-4 pb-10" style={{ background: w.cssBg || "linear-gradient(135deg,#0a0a1a,#050510)" }}>
      <style>{CSS}</style>
      <MusicBtn muted={music.muted} onToggle={music.toggleMute} />
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <button onClick={onSkip} className="font-black text-xs px-3 py-1.5 rounded-full cursor-pointer border-none" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,.5)" }}>
            {lang === "TL" ? "Laktawan ▶" : "Skip ▶"}
          </button>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%`, background: "linear-gradient(90deg,#ffd93d,#ff9f43)" }} />
          </div>
          <span className="font-black text-xs" style={{ color: "rgba(255,255,255,.4)" }}>{step + 1}/{TOTAL_STEPS}</span>
        </div>

        {/* World badge */}
        <div className="text-center mb-4">
          <span className="text-4xl">{w.icon}</span>
          <div className={`font-black text-lg sm:text-xl mt-1 ${w.color}`} style={{ fontFamily: "Fredoka One,cursive" }}>
            {lang === "TL" ? "Tutorial:" : "Tutorial:"} {tut.title}
          </div>
        </div>

        {/* SLIDE */}
        {isSlide && slide && (
          <div className="slide-in rounded-2xl p-5 mb-4" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <div className="text-5xl text-center mb-3">{slide.icon}</div>
            <h3 className="font-black text-xl sm:text-2xl text-white text-center mb-4" style={{ fontFamily: "Fredoka One,cursive" }}>{slide.title}</h3>

            {/* Fraction visual for intro */}
            {slide.visual === "intro" && (
              <div className="flex justify-center gap-4 mb-4 flex-wrap">
                {[{n:1,d:4},{n:2,d:4},{n:3,d:4}].map((f, i) => <div key={i} className="text-center"><Frac n={f.n} d={f.d} col={w.color} big /><div className="text-xs font-bold mt-1" style={{ color: "rgba(255,255,255,.4)" }}>{f.n}/{f.d}</div></div>)}
              </div>
            )}
            {slide.visual === "parts" && (
              <div className="flex justify-center mb-4">
                <div className="text-center relative">
                  <div className="font-black text-sm mb-1 text-yellow-300">{lang === "TL" ? "← NUMERADOR" : "← NUMERATOR"}</div>
                  <Frac n={3} d={5} col={w.color} big />
                  <div className="font-black text-sm mt-1 text-pink-300">{lang === "TL" ? "← DENOMINADOR" : "← DENOMINATOR"}</div>
                </div>
              </div>
            )}
            {slide.visual === "proper_ex" && (
              <div className="flex gap-4 justify-center mb-4 flex-wrap">
                {[{n:1,d:2},{n:3,d:4},{n:7,d:10}].map((f, i) => <div key={i} className="text-center"><Frac n={f.n} d={f.d} col="text-green-300" big /><div className="text-xs font-bold mt-1 text-green-400">{f.n}&lt;{f.d} ✅</div></div>)}
              </div>
            )}
            {slide.visual === "improper_ex" && (
              <div className="flex gap-4 justify-center mb-4 flex-wrap">
                {[{n:5,d:3},{n:4,d:4},{n:9,d:2}].map((f, i) => <div key={i} className="text-center"><Frac n={f.n} d={f.d} col="text-red-300" big /><div className="text-xs font-bold mt-1 text-red-400">{f.n}≥{f.d} ❌</div></div>)}
              </div>
            )}
            {slide.visual === "convert_imp" && (
              <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
                <Frac n={7} d={3} col={w.color} big />
                <span className="text-2xl text-white font-black">→</span>
                <Mixed w={2} n={1} d={3} col="text-green-300" big />
              </div>
            )}
            {slide.visual === "convert_mix" && (
              <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
                <Mixed w={2} n={1} d={3} col={w.color} big />
                <span className="text-2xl text-white font-black">→</span>
                <Frac n={7} d={3} col="text-green-300" big />
              </div>
            )}
            {slide.visual === "mixed_intro" && (
              <div className="flex gap-4 justify-center mb-4 flex-wrap">
                {[{w:2,n:1,d:3},{w:1,n:3,d:4}].map((m, i) => <Mixed key={i} w={m.w} n={m.n} d={m.d} col={w.color} big />)}
              </div>
            )}
            {(slide.visual === "add_intro" || slide.visual === "add_rule") && (
              <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
                <Frac n={1} d={5} col="text-yellow-200" big />
                <span className="text-3xl text-white font-black">+</span>
                <Frac n={2} d={5} col="text-yellow-200" big />
                <span className="text-3xl text-white font-black">=</span>
                <Frac n={3} d={5} col="text-green-300" big />
              </div>
            )}
            {(slide.visual === "sub_intro" || slide.visual === "sub_rule") && (
              <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
                <Frac n={5} d={8} col="text-yellow-200" big />
                <span className="text-3xl text-white font-black">−</span>
                <Frac n={2} d={8} col="text-yellow-200" big />
                <span className="text-3xl text-white font-black">=</span>
                <Frac n={3} d={8} col="text-green-300" big />
              </div>
            )}

            <p className="text-sm sm:text-base leading-relaxed font-bold whitespace-pre-line" style={{ color: "rgba(255,255,255,.8)" }}>{slide.text}</p>
          </div>
        )}

        {/* PRACTICE QUESTION */}
        {!isSlide && pq && (
          <div className={`slide-in rounded-2xl p-5 mb-4 ${shake[pIdx] ? "screen-shake" : ""}`} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <div className="text-center mb-2">
              <span className="text-2xl">🎯</span>
              <div className="font-black text-sm uppercase tracking-wider mt-1" style={{ color: "rgba(255,255,255,.4)" }}>
                {lang === "TL" ? `Pagsanay ${pIdx + 1} / ${tut.practice.length}` : `Practice ${pIdx + 1} / ${tut.practice.length}`}
              </div>
            </div>
            <p className="text-center font-black text-sm sm:text-base mb-3 text-white">{pq.instruction}</p>
            <div className="flex items-center justify-center min-h-[60px] mb-4"><QDisplay q={pq} /></div>

            {/* Hint always visible in tutorial */}
            <div className="rounded-xl p-3 mb-3" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}>
              <p className="font-black text-sm" style={{ color: "#fde68a" }}>💡 {lang === "TL" ? "Pahiwatig" : "Hint"}: {pq.hint}</p>
            </div>

            {feedbacks[pIdx] && !feedbacks[pIdx].startsWith("💡") && (
              <div className="rounded-xl p-2.5 mb-3 text-center font-black text-sm" style={{ background: practiceOk[pIdx] ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${practiceOk[pIdx] ? "rgba(74,222,128,0.4)" : "rgba(248,113,113,0.4)"}`, color: practiceOk[pIdx] ? "#86efac" : "#fca5a5" }}>
                {feedbacks[pIdx]}
              </div>
            )}
            {!practiceOk[pIdx] && pq.choices && (
              <div className="grid grid-cols-2 gap-2.5">
                {pq.choices.map((c, i) => (
                  <button key={i} onClick={() => checkPractice(c)} className="rounded-xl py-3 px-2 font-black text-white flex items-center justify-center min-h-[65px] cursor-pointer border-none hover:scale-[1.03] active:scale-95 transition-transform" style={{ background: "rgba(255,255,255,0.07)", border: "2px solid rgba(255,255,255,0.14)" }}>
                    {pq.type === "mc-mixed" ? <Mixed w={c.w} n={c.n} d={c.d} /> : <Frac n={c.n} d={c.d} big />}
                  </button>
                ))}
              </div>
            )}
            {practiceOk[pIdx] && <div className="text-center text-4xl mt-2 pop-bounce">⭐</div>}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 justify-between">
          {step > 0 && <button onClick={() => setStep(s => s - 1)} className="font-black px-6 py-3 rounded-xl cursor-pointer border-none hover:scale-105 active:scale-95 transition-transform" style={{ background: "rgba(255,255,255,0.09)", color: "white" }}>← {lang === "TL" ? "Bumalik" : "Back"}</button>}
          <div className="flex-1" />
          <button
            disabled={!canNext}
            onClick={() => { if (isLast) { onFinish(); } else { setStep(s => s + 1); } }}
            className={`font-black text-base sm:text-lg px-8 py-3 rounded-xl transition-transform border-none ${canNext ? "hover:scale-105 active:scale-95 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
            style={{ fontFamily: "Fredoka One,cursive", background: canNext ? "linear-gradient(135deg,#ffd93d,#ff9f43)" : "rgba(255,255,255,0.1)", color: canNext ? "black" : "white", boxShadow: canNext ? "0 5px 0 rgba(0,0,0,.3)" : "none" }}>
            {isLast ? (lang === "TL" ? "🐹 Laro na!" : "🐹 Let's Battle!") : (lang === "TL" ? "Susunod →" : "Next →")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HOME SCREEN
═══════════════════════════════════════════════════ */
function HomeScreen({ onPlay, music, lang, onStory }) {
  const stars = useMemo(() => Array.from({ length: 70 }, (_, i) => ({ id: i, l: R(0, 100) + "%", t: R(0, 100) + "%", w: R(1, 4), dur: R(20, 55) / 10 + "s", del: R(0, 55) / 10 + "s", o: R(1, 7) / 10 })), []);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: "radial-gradient(ellipse at 50% 30%,#2e1065 0%,#0d0221 60%,#000 100%)" }} onClick={music.initMusic}>
      <style>{CSS}</style>
      <MusicBtn muted={music.muted} onToggle={music.toggleMute} />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        {stars.map(s => <div key={s.id} className="absolute rounded-full bg-white" style={{ left: s.l, top: s.t, width: s.w, height: s.w, animation: `bgStar ${s.dur} ease-in-out ${s.del} infinite`, opacity: s.o }} />)}
      </div>
      <div className="relative flex flex-col items-center" style={{ zIndex: 1 }}>
        <div className="idle-float mb-3" style={{ filter: "drop-shadow(0 0 22px rgba(255,200,100,.65))" }}><Hamster3D size={110} /></div>
        <h1 className="font-black text-5xl sm:text-7xl lg:text-8xl mb-2 leading-none" style={{ fontFamily: "Fredoka One,cursive", background: "linear-gradient(135deg,#ffd93d 0%,#ff9f43 30%,#ff6b9d 65%,#a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>FRACTION<br />QUEST!</h1>
        <p className="font-black text-sm sm:text-base uppercase tracking-widest mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>{lang === "TL" ? "⚔️ Tulungan si Hammy na matalo ang mga praksiyon! ⚔️" : "⚔️ Help Hammy beat fractions! ⚔️"}</p>
        <button onClick={onPlay} className="text-white font-black text-xl sm:text-2xl px-12 sm:px-16 py-4 sm:py-5 rounded-2xl cursor-pointer border-none hover:scale-105 active:scale-95 transition-transform glow-pulse" style={{ fontFamily: "Fredoka One,cursive", background: "linear-gradient(135deg,#ff6b9d,#ff9f43)", boxShadow: "0 8px 0 rgba(0,0,0,.4),0 0 40px rgba(255,107,157,.4)" }}>
          {lang === "TL" ? "▶ SIMULAN ANG PAKIKIPAGSAPALARAN!" : "▶ START ADVENTURE!"}
        </button>
        <div className="mt-10 flex justify-center gap-4 sm:gap-6 text-3xl sm:text-4xl">{["🌲","🔥","⛰️","⚡","💧","👑"].map((e, i) => <span key={i} className="cursor-default select-none" style={{ opacity: 0.55, animation: `idleFloat ${2 + i * 0.3}s ease-in-out ${i * 0.2}s infinite` }}>{e}</span>)}</div>
        {onStory && <button onClick={onStory} className="mt-4 text-white/80 font-bold text-xs sm:text-sm px-4 py-2 rounded-full cursor-pointer hover:text-white" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)" }}>📖 {lang === "TL" ? "Kuwento" : "Story"}</button>}
        <p className="mt-5 font-bold text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>{lang === "TL" ? "12 Mundo · 36 Antas · 1 Epikong Laban sa Boss!" : "12 Worlds · 36 Levels · 1 Epic Boss Battle!"}</p>
        <p className="mt-2 font-bold text-xs" style={{ color: "rgba(255,255,255,0.18)" }}>{lang === "TL" ? "✅ Awtomatikong nase-save ang progreso" : "✅ Progress auto-saves"}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAP SCREEN
═══════════════════════════════════════════════════ */
function MapScreen({ gs, onSelect, onBoss, music, onReset, onChangeLang, lang }) {
  const allDone = WORLDS.every(w => w.levels.every((_, li) => gs.stars[`${w.id}-${li}`]));
  const xpPct = Math.min(100, (gs.xp / (gs.lv * 150)) * 100);
  const [confirmReset, setConfirmReset] = useState(false);
  const L = (en, tl) => lang === "TL" ? tl : en;
  return (
    <div className="min-h-screen px-4 py-5 pb-12" style={{ background: "radial-gradient(ellipse at 50% 0%,#1e1b4b 0%,#0d0221 60%,#000 100%)" }}>
      <style>{CSS}</style>
      <MusicBtn muted={music.muted} onToggle={music.toggleMute} />
      <div className="max-w-lg mx-auto">
        {/* XP bar */}
        <div className="flex items-center gap-3 rounded-2xl p-3 mb-5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="text-3xl idle-float">🌟</span>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-xs font-black mb-1" style={{ color: "rgba(255,255,255,.45)" }}><span>{L("Lv","Antas")} {gs.lv}</span><span>{gs.xp}/{gs.lv * 150} XP</span></div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.1)" }}><div className="h-full rounded-full transition-all duration-700" style={{ width: `${xpPct}%`, background: "linear-gradient(90deg,#ffd93d,#ff9f43)" }} /></div>
          </div>
          <span className="text-yellow-300 font-black text-sm whitespace-nowrap">⭐{Object.values(gs.stars).reduce((a, b) => a + b, 0)}</span>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-black text-white mb-1" style={{ fontFamily: "Fredoka One,cursive" }}>🗺️ {L("World Map","Mapa ng Mundo")}</h2>
        <div className="flex justify-center gap-2 mb-4">
          <button onClick={() => onChangeLang("EN")} className={`text-xs font-black px-3 py-1 rounded-full cursor-pointer border-none transition-all ${lang === "EN" ? "bg-blue-500 text-white" : "text-white"}`} style={{ background: lang === "EN" ? "#3b82f6" : "rgba(255,255,255,0.1)" }}>🇺🇸 EN</button>
          <button onClick={() => onChangeLang("TL")} className={`text-xs font-black px-3 py-1 rounded-full cursor-pointer border-none transition-all`} style={{ background: lang === "TL" ? "#ef4444" : "rgba(255,255,255,0.1)", color: "white" }}>🇵🇭 FIL</button>
        </div>
        <div className="space-y-3">
          {WORLDS.map((w, wi) => {
            const lvlOk = (li) => {
              if (wi === 0 && li === 0) return true;
              if (li === 0) {
                const prev = WORLDS[wi - 1];
                const allBeaten = prev.levels.every((_, x) => gs.stars[`${prev.id}-${x}`]);
                if (allBeaten) return true;
                const arr = gs.performance?.[`${prev.id}__${prev.levels.length - 1}`] || [];
                if (arr.length >= 5 && (arr.reduce((a, b) => a + b, 0) / arr.length) >= 0.7) return true;
                return false;
              }
              return !!gs.stars[`${w.id}-${li - 1}`];
            };
            const worldOk = lvlOk(0);
            const tutSeen = gs.tutSeen?.[w.id];
            return (
              <div key={w.id} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${worldOk ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)"}`, background: worldOk ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)", opacity: worldOk ? 1 : 0.5 }}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="text-3xl sm:text-4xl flex-shrink-0">{w.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-black text-base sm:text-lg ${w.color}`} style={{ fontFamily: "Fredoka One,cursive" }}>{T(w.name, lang)}</div>
                    <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: "rgba(255,255,255,.35)" }}>
                      {w.levels.length} {L("levels","antas")}
                      {worldOk && !tutSeen && <span className="text-yellow-400 text-[10px] font-black bg-yellow-400/15 px-1.5 py-0.5 rounded-full">✨ {L("Tutorial","Tutorial")}</span>}
                    </div>
                  </div>
                  {!worldOk && <span className="text-2xl">🔒</span>}
                </div>
                {worldOk && (
                  <div className="grid grid-cols-3 gap-2 px-3 pb-3">
                    {w.levels.map((lv, li) => {
                      const unlk = lvlOk(li); const st = gs.stars[`${w.id}-${li}`] || 0;
                      return (
                        <button key={li} disabled={!unlk} onClick={() => unlk && onSelect(wi, li)}
                          className={`rounded-xl p-2.5 text-left border-none ${unlk ? `${w.btnCls} hover:scale-105 shadow-lg cursor-pointer active:scale-95 transition-transform` : "cursor-not-allowed"}`}
                          style={!unlk ? { background: "rgba(255,255,255,0.05)", opacity: 0.4 } : {}}>
                          <div className="font-black text-white text-xs leading-tight mb-1">{T(lv.name, lang).split("–")[1]?.trim() || T(lv.name, lang)}</div>
                          <div className="text-xs font-bold mt-0.5 text-white/60">{li === 0 ? "⭐ Easy" : li === 1 ? "⭐⭐ Medium" : "⭐⭐⭐ Hard"}</div>
                          <div className="text-base mt-0.5">{unlk ? (st > 0 ? "⭐".repeat(st) + "☆".repeat(3 - st) : "☆☆☆") : "🔒"}</div>
                          <div className="text-[10px] font-bold mt-0.5" style={{ color: "rgba(255,255,255,.7)" }}>{lv.enemy.emoji} {lv.enemy.name}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {/* Boss */}
          <button disabled={!allDone} onClick={allDone ? onBoss : undefined} className={`w-full rounded-2xl p-5 text-center border-none ${allDone ? "hover:scale-[1.02] active:scale-95 cursor-pointer transition-transform" : "opacity-50 cursor-not-allowed"}`} style={allDone ? { background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 0 30px rgba(251,191,36,.3)" } : { background: "rgba(255,255,255,0.04)" }}>
            <div className="text-5xl mb-2">{allDone ? "👑" : "🔒"}</div>
            <div className="font-black text-xl text-white" style={{ fontFamily: "Fredoka One,cursive" }}>{L("FINAL BOSS BATTLE!","HULING LABAN SA BOSS!")}</div>
            <div className="text-sm font-bold mt-1" style={{ color: "rgba(255,255,255,.8)" }}>{allDone ? L("⏱️ 60-Second Timed Challenge!","⏱️ 60-Segundong Hamon!") : L("Complete all 5 worlds to unlock!","Tapusin ang lahat ng 5 mundo para i-unlock!")}</div>
          </button>
          {/* Reset / lang footer */}
          <div className="text-center pt-2">
            {!confirmReset ? <button onClick={() => setConfirmReset(true)} className="text-xs font-bold cursor-pointer border-none bg-transparent" style={{ color: "rgba(255,255,255,.2)" }}>🗑️ {L("Reset save","I-reset ang save")}</button>
              : <div className="flex gap-2 justify-center items-center">
                  <span className="text-xs font-black" style={{ color: "rgba(255,100,100,.8)" }}>{L("Are you sure?","Sigurado ka ba?")}</span>
                  <button onClick={() => { onReset(); setConfirmReset(false); }} className="text-xs px-3 py-1 rounded-full font-black cursor-pointer border-none" style={{ background: "rgba(239,68,68,.3)", color: "#fca5a5" }}>{L("Yes","Oo")}</button>
                  <button onClick={() => setConfirmReset(false)} className="text-xs px-3 py-1 rounded-full font-black cursor-pointer border-none" style={{ background: "rgba(255,255,255,.1)", color: "white" }}>{L("Cancel","Hindi")}</button>
                </div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BATTLE SCREEN  (wrong = same Q stays, correct = new Q, win/lose on HP)
═══════════════════════════════════════════════════ */
function BattleScreen({ worldIdx, levelIdx, onWin, onLose, music, lang, save }) {
  const w = WORLDS[worldIdx], lv = w.levels[levelIdx], ENEMY_HP = 5;
  const baseDiff = lv.diff;
  const perfKey = `${w.id}__${levelIdx}`;
  const adaptiveDiff = useMemo(() => adaptDiff(baseDiff, save?.performance?.[perfKey]), [baseDiff, perfKey, save]);
  const diff = adaptiveDiff;
  const dedupKey = `${w.id}__${levelIdx}`;
  const nextQ = () => pickQuestion(GENS[w.id], dedupKey, diff, save, writeSave);
  const [lives, setLives] = useState(3), [q, setQ] = useState(() => nextQ()), [locked, setLocked] = useState(false);
  const [missesOnQ, setMissesOnQ] = useState(0), [showProcess, setShowProcess] = useState(false), [reinforce, setReinforce] = useState("");
  const [lastOk, setLastOk] = useState(null), [tipText, setTipText] = useState(""), [eClass, setEClass] = useState("enemy-idle");
  const [hClass, setHClass] = useState("hammy-bob"), [atk, setAtk] = useState(null), [dmgs, setDmgs] = useState([]);
  const [showConf, setShowConf] = useState(false), [screenCls, setScreenCls] = useState(""), [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0), [streakMsg, setStreakMsg] = useState(""), [typeW, setTypeW] = useState(""), [typeN, setTypeN] = useState(""), [typeD, setTypeD] = useState("");
  const [eHp, setEHp] = useState(ENEMY_HP);
  const dmgId = useRef(0);
  const L = (en, tl) => lang === "TL" ? tl : en;

  const addDmg = (t, c) => { const id = ++dmgId.current; setDmgs(p => [...p, { id, text: t, color: c }]); setTimeout(() => setDmgs(p => p.filter(x => x.id !== id)), 1000); };
  const doAtk = (dir, emoji) => { setAtk(null); setTimeout(() => setAtk({ dir, emoji, k: Date.now() }), 20); setTimeout(() => setAtk(null), 660); };
  const resetInput = () => { setTypeW(""); setTypeN(""); setTypeD(""); };
  // diff 0 = hint always visible
  const alwaysShowHint = diff === 0;

  const handleCorrect = () => {
    if (locked) return; setLocked(true);
    sfx.correct();
    recordPerf(save, perfKey, true, writeSave);
    const ns = streak + 1; setStreak(ns);
    setStreakMsg(ns === 3 ? (lang === "TL" ? "🔥 NAGLILIYAB!" : "🔥 ON FIRE!") : ns === 5 ? (lang === "TL" ? "⚡ HINDI MATALO!" : "⚡ UNSTOPPABLE!") : ns >= 7 ? "💫 LEGENDARY!" : "");
    const nx = xp + 10; setXp(nx); const ne = eHp - 1; setEHp(ne); setLastOk(true); setTipText("");
    if (q?.process && Math.random() < 0.3) setReinforce(q.process); else setReinforce(lang === "TL" ? "Galing!" : "Nice work!");
    setMissesOnQ(0); setShowProcess(false);
    doAtk("fwd", "⚔️");
    setTimeout(() => {
      setEClass("enemy-hit"); addDmg("💥 HIT!", "#4ade80");
      setTimeout(() => {
        if (ne <= 0) { setEClass("enemy-die"); setShowConf(true); setTimeout(() => onWin(lives, ENEMY_HP, nx), 1100); }
        else { setEClass("enemy-idle"); setQ(nextQ()); resetInput(); setLastOk(null); setLocked(false); setReinforce(""); }
      }, 620);
    }, 280);
  };

  const handleWrong = (hint) => {
    if (locked) return; setLocked(true);
    sfx.wrong();
    recordPerf(save, perfKey, false, writeSave);
    setMissesOnQ((prev) => {
      if (prev === 0) setTipText(hint);
      else if (q?.process) setShowProcess(true);
      return prev + 1;
    });
    const nl = lives - 1; setLives(nl); setStreak(0); setStreakMsg(""); setLastOk(false); if (missesOnQ === 0) setTipText(hint);
    doAtk("bwd", lv.enemy.atk || "💥"); setScreenCls("flash-red"); setTimeout(() => setScreenCls(""), 600);
    setHClass("hammy-hit screen-shake"); addDmg("-❤️", "#f87171");
    setTimeout(() => {
      if (nl <= 0) { setHClass("hammy-die"); setTimeout(() => onLose(), 1100); return; }
      setTimeout(() => { setHClass("hammy-bob"); setLastOk(null); setLocked(false); resetInput(); }, 1400);
    }, 380);
  };

  const checkMC = (c) => { if (locked) return; c.isCorrect ? handleCorrect() : handleWrong(q.hint); };
  const checkType = () => {
    if (locked) return; const { answer: a } = q; let ok = false;
    if (q.type === "type-mixed") ok = +typeW === a.w && +typeN === a.n && +typeD === a.d;
    else { const n = +typeN, d = +typeD; if (!d) return; ok = n * a.d === a.n * d; }
    ok ? handleCorrect() : handleWrong(q.hint);
  };

  const diffLabel = diff === 0 ? (L("Easy 🟢", "Madali 🟢")) : diff === 1 ? (L("Medium 🟡", "Katamtaman 🟡")) : (L("Hard 🔴", "Mahirap 🔴"));

  return (
    <div className={`min-h-screen relative overflow-hidden ${screenCls}`} style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(255,255,255,.04) 0%,transparent 60%),linear-gradient(to bottom,#0a0a1a,#050510)" }}>
      <style>{CSS}</style>
      <MusicBtn muted={music.muted} onToggle={music.toggleMute} />
      {showConf && <FancyConfetti />}
      <div className="max-w-lg mx-auto px-3 py-3 relative" style={{ zIndex: 10 }}>
        {/* HUD */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-0.5 text-xl sm:text-2xl">{Array.from({ length: 3 }, (_, i) => <span key={i} style={{ opacity: i < lives ? 1 : 0.2, filter: i < lives ? "none" : "grayscale(1)" }}>{i < lives ? "❤️" : "🖤"}</span>)}</div>
          <div className="flex-1">
            <div className="flex gap-0.5 h-3 sm:h-4">{Array.from({ length: ENEMY_HP }, (_, i) => <div key={i} className="flex-1 rounded-full transition-all duration-500" style={{ background: i < eHp ? "linear-gradient(90deg,#f87171,#dc2626)" : "rgba(255,255,255,0.1)" }} />)}</div>
            <div className="flex justify-between text-[10px] font-bold mt-0.5" style={{ color: "rgba(255,255,255,.35)" }}><span>{lv.enemy.name} HP</span><span className={diff === 0 ? "text-green-400" : diff === 1 ? "text-yellow-400" : "text-red-400"}>{diffLabel}</span></div>
          </div>
          <div className="text-yellow-300 font-black text-sm">⚡{xp}</div>
        </div>
        {/* Arena */}
        <div className="rounded-2xl mb-3 relative overflow-hidden" style={{ minHeight: "160px", background: "linear-gradient(180deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.01) 100%)", border: "1px solid rgba(255,255,255,.08)" }}>
          <BgStars />
          <div className="absolute bottom-0 left-0 right-0 h-6 rounded-b-2xl" style={{ background: "linear-gradient(0deg,rgba(255,255,255,.07),transparent)" }} />
          {atk && <div className={`absolute pointer-events-none text-2xl sm:text-3xl select-none ${atk.dir === "fwd" ? "atk-fwd" : "atk-bwd"}`} style={{ zIndex: 20, top: "38%", transform: "translateY(-50%)", left: atk.dir === "fwd" ? "18%" : "78%" }}>{atk.emoji}</div>}
          {dmgs.map(d => <DmgNum key={d.id} text={d.text} color={d.color} />)}
          <div className="relative flex items-end justify-between px-4 py-4" style={{ zIndex: 10 }}>
            <div className={`flex flex-col items-center ${hClass}`} style={{ transition: "none" }}>
              <Hamster3D size={72} style={{ filter: "drop-shadow(0 4px 14px rgba(255,200,100,.45))" }} />
              <div className="text-[10px] font-black mt-1" style={{ color: "rgba(255,255,255,.5)" }}>HAMMY</div>
              <div className="flex gap-0.5 mt-1">{Array.from({ length: 3 }, (_, i) => <div key={i} className="h-1.5 w-4 rounded-full transition-all" style={{ background: i < lives ? "#4ade80" : "rgba(255,255,255,0.12)" }} />)}</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              {streakMsg && <div className="streak-in font-black text-sm sm:text-base text-yellow-300" style={{ fontFamily: "Fredoka One,cursive" }}>{streakMsg}</div>}
              <div className="font-black text-xl" style={{ fontFamily: "Fredoka One,cursive", color: "rgba(255,255,255,.15)" }}>VS</div>
              {streak >= 3 && <div className="text-xs font-black text-orange-400">{streak}🔥</div>}
            </div>
            <div className={`flex flex-col items-center ${eClass}`}>
              <div className="text-5xl sm:text-7xl select-none mb-1">{lv.enemy.emoji}</div>
              <div className="text-[10px] font-black" style={{ color: "rgba(255,255,255,.4)" }}>{lv.enemy.name.toUpperCase()}</div>
              <div className="flex gap-0.5 mt-1">{Array.from({ length: ENEMY_HP }, (_, i) => <div key={i} className="h-1.5 w-3 rounded-full transition-all" style={{ background: i < eHp ? "#f87171" : "rgba(255,255,255,0.12)" }} />)}</div>
            </div>
          </div>
        </div>
        {/* Question */}
        <div className="rounded-2xl p-4 mb-3 slide-up" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="text-center font-black text-sm sm:text-base mb-3 text-white">{q?.instruction}</div>
          <div className="flex items-center justify-center min-h-[65px]"><QDisplay q={q} /></div>
        </div>
        {/* Always-visible hint for Level 1 */}
        {alwaysShowHint && q?.hint && !tipText && (
          <div className="rounded-xl p-3 mb-3" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <p className="font-black text-xs" style={{ color: "#fde68a" }}>💡 {lang === "TL" ? "Pahiwatig" : "Hint"}: {q.hint}</p>
          </div>
        )}
        {tipText && <div className="rounded-xl p-3 mb-3 tip-in" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.35)" }}><p className="font-black text-sm" style={{ color: "#fde68a" }}>💡 {lang === "TL" ? "Pahiwatig" : "Tip"}: {tipText}</p></div>}
        {showProcess && q?.process && <div className="rounded-xl p-3 mb-3 tip-in" style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.4)" }}><p className="font-black text-xs uppercase tracking-wide mb-1" style={{ color: "#93c5fd" }}>{lang === "TL" ? "Hakbang-hakbang" : "Step by step"}</p><p className="font-bold text-sm" style={{ color: "#dbeafe" }}>{q.process}</p></div>}
        {reinforce && lastOk && <div className="rounded-xl p-2.5 mb-3 text-center font-black text-xs slide-up" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(74,222,128,0.3)", color: "#bbf7d0" }}>✨ {reinforce}</div>}
        {locked && lastOk !== null && (
          <div className="rounded-xl p-3 mb-3 text-center font-black text-base slide-up" style={{ background: lastOk ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${lastOk ? "rgba(74,222,128,0.4)" : "rgba(248,113,113,0.4)"}`, color: lastOk ? "#86efac" : "#fca5a5" }}>
            {lastOk ? pick(lang === "TL" ? ["🎉 Magaling, Hammy!","⭐ Perpekto!","🔥 Tama!","💪 Napakagaling!","✨ Kahanga-hanga!"] : ["🎉 AMAZING! Hammy strikes!","⭐ PERFECT!","🔥 CORRECT!","💪 GREAT JOB!","✨ NAILED IT!"]) : (lang === "TL" ? "😅 Mali! Basahin ang pahiwatig at subukang muli!" : "😅 Wrong! Read the tip and try again!")}
          </div>
        )}
        {/* Answers */}
        {!locked && q && (
          <div className="mb-3">
            {(q.type === "mc-frac" || q.type === "mc-mixed") && <div className="grid grid-cols-2 gap-2.5">{q.choices.map((c, i) => <button key={i} onClick={() => { tap(); checkMC(c); }} className="rounded-xl py-3 px-2 font-black text-white flex items-center justify-center min-h-[72px] cursor-pointer border-none hover:scale-[1.03] active:scale-95 transition-transform" style={{ background: "rgba(255,255,255,0.07)", border: "2px solid rgba(255,255,255,0.14)" }}>{q.type === "mc-mixed" ? <Mixed w={c.w} n={c.n} d={c.d} /> : <Frac n={c.n} d={c.d} big />}</button>)}</div>}
            {q.type === "mc-compare" && <div className="grid grid-cols-3 gap-2.5">{q.choices.map((c, i) => <button key={i} onClick={() => { tap(); checkMC(c); }} className="rounded-xl py-4 px-2 font-black text-white text-3xl sm:text-4xl flex items-center justify-center min-h-[72px] cursor-pointer border-none hover:scale-[1.03] active:scale-95 transition-transform" style={{ fontFamily: "Fredoka One,cursive", background: "rgba(255,255,255,0.07)", border: "2px solid rgba(255,255,255,0.14)" }}>{c.label}</button>)}</div>}
            {q.type === "type-frac" && (
              <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,.45)" }}>✏️ {lang === "TL" ? "I-type ang iyong sagot:" : "Type your answer:"}</p>
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="font-bold text-sm" style={{ color: "rgba(255,255,255,.5)" }}>{lang === "TL" ? "Sagot =" : "Answer ="}</span>
                  <div className="flex flex-col items-center gap-1">
                    <input type="number" value={typeN} onChange={e => setTypeN(e.target.value)} placeholder="top" min="0" className="text-white font-black text-xl text-center outline-none" style={{ width: "4rem", background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: "11px", padding: "8px" }} />
                    <div style={{ width: "4rem", height: "5px", background: "rgba(255,255,255,0.6)", borderRadius: "4px" }} />
                    <input type="number" value={typeD} onChange={e => setTypeD(e.target.value)} placeholder="bot" min="1" className="text-white font-black text-xl text-center outline-none" style={{ width: "4rem", background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: "11px", padding: "8px" }} />
                  </div>
                </div>
                <button onClick={checkType} className="w-full text-white font-black py-3 rounded-xl text-base active:scale-95 cursor-pointer border-none" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", boxShadow: "0 5px 0 rgba(0,0,0,.3)" }}>✅ {lang === "TL" ? "Suriin ang Sagot!" : "Check Answer!"}</button>
              </div>
            )}
            {q.type === "type-mixed" && (
              <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,.45)" }}>✏️ {lang === "TL" ? "I-type ang iyong halo-halong bilang:" : "Type your mixed number:"}</p>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="font-bold text-sm" style={{ color: "rgba(255,255,255,.5)" }}>{lang === "TL" ? "Sagot =" : "Answer ="}</span>
                  <input type="number" value={typeW} onChange={e => setTypeW(e.target.value)} placeholder="whole" min="0" className="text-white font-black text-xl text-center outline-none" style={{ width: "4rem", background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: "11px", padding: "8px" }} />
                  <span className="font-black text-sm" style={{ color: "rgba(255,255,255,.4)" }}>{lang === "TL" ? "at" : "and"}</span>
                  <div className="flex flex-col items-center gap-1">
                    <input type="number" value={typeN} onChange={e => setTypeN(e.target.value)} placeholder="top" min="0" className="text-white font-black text-xl text-center outline-none" style={{ width: "4rem", background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: "11px", padding: "8px" }} />
                    <div style={{ width: "4rem", height: "5px", background: "rgba(255,255,255,0.6)", borderRadius: "4px" }} />
                    <input type="number" value={typeD} onChange={e => setTypeD(e.target.value)} placeholder="bot" min="1" className="text-white font-black text-xl text-center outline-none" style={{ width: "4rem", background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: "11px", padding: "8px" }} />
                  </div>
                </div>
                <button onClick={checkType} className="w-full text-white font-black py-3 rounded-xl text-base active:scale-95 cursor-pointer border-none" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", boxShadow: "0 5px 0 rgba(0,0,0,.3)" }}>✅ {lang === "TL" ? "Suriin ang Sagot!" : "Check Answer!"}</button>
              </div>
            )}
          </div>
        )}
        <DrawingCanvas />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BOSS SCREEN
═══════════════════════════════════════════════════ */
function BossScreen({ onWin, onLose, music, lang, save }) {
  const TOTAL_TIME = 60, TOTAL_Q = 10;
  const dedupKey = "boss__main";
  const pickBoss = () => {
    const ids = Object.keys(GENS);
    const id = ids[Math.floor(Math.random() * ids.length)];
    return pickQuestion(GENS[id], dedupKey, 2, save, writeSave);
  };
  const endTimeRef = useRef(Date.now() + TOTAL_TIME * 1000);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME), [score, setScore] = useState(0), [qNum, setQNum] = useState(0), [q, setQ] = useState(() => pickBoss());
  const [locked, setLocked] = useState(false), [bossHp, setBossHp] = useState(TOTAL_Q), [tipText, setTipText] = useState(""), [lastOk, setLastOk] = useState(null);
  const [bossAnim, setBossAnim] = useState("boss-float"), [atk, setAtk] = useState(null), [screenCls, setScreenCls] = useState(""), [showConf, setShowConf] = useState(false);
  const [typeN, setTypeN] = useState(""), [typeD, setTypeD] = useState(""), [typeW, setTypeW] = useState("");
  const [missesOnQ, setMissesOnQ] = useState(0), [showProcess, setShowProcess] = useState(false);
  const ended = useRef(false);
  const L = (en, tl) => lang === "TL" ? tl : en;
  const phase = useMemo(() => qNum < 3 ? 1 : qNum < 7 ? 2 : 3, [qNum]);
  useEffect(() => {
    const t = setInterval(() => {
      const remain = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remain);
      if (remain <= 0) { clearInterval(t); if (!ended.current) { ended.current = true; onLose(); } }
    }, 250);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { if (phase === 3) sfx.bossRoar(); }, [phase]);
  const doAtk = (d, e) => { setAtk(null); setTimeout(() => setAtk({ dir: d, e, k: Date.now() }), 20); setTimeout(() => setAtk(null), 660); };
  const resetIn = () => { setTypeW(""); setTypeN(""); setTypeD(""); };
  const advance = (ok) => { const n = qNum + 1; if (n >= TOTAL_Q) { ended.current = true; const fs = score + (ok ? 1 : 0); if (fs >= 5) { setShowConf(true); setTimeout(() => onWin(fs, TOTAL_Q), 1000); } else setTimeout(() => onLose(), 1000); return; } setTimeout(() => { setQ(pickBoss()); setQNum(n); setLocked(false); setLastOk(null); setTipText(""); setMissesOnQ(0); setShowProcess(false); resetIn(); }, 900); };
  const correct = () => {
    if (locked) return; setLocked(true);
    sfx.correct();
    recordPerf(save, dedupKey, true, writeSave);
    setScore(p => p + 1); setBossHp(p => p - 1); setLastOk(true);
    doAtk("fwd", "⚡"); setBossAnim("enemy-hit"); setTimeout(() => setBossAnim("boss-float"), 700);
    advance(true);
  };
  const wrong = (h) => {
    if (locked) return; setLocked(true);
    sfx.wrong();
    recordPerf(save, dedupKey, false, writeSave);
    setMissesOnQ((prev) => {
      if (prev === 0) setTipText(h);
      else if (q?.process) setShowProcess(true);
      return prev + 1;
    });
    setLastOk(false); setTipText(h);
    doAtk("bwd", "💀"); setScreenCls("flash-red"); setTimeout(() => setScreenCls(""), 600);
    advance(false);
  };
  const checkMC = (c) => { if (locked) return; c.isCorrect ? correct() : wrong(c.hint || q.hint); };
  const checkType = () => { if (locked) return; const { answer: a } = q; let ok = false; if (q.type === "type-mixed") ok = +typeW === a.w && +typeN === a.n && +typeD === a.d; else { const n = +typeN, d = +typeD; if (!d) return; ok = n * a.d === a.n * d; } ok ? correct() : wrong(q.hint); };
  const danger = timeLeft <= 10, timePct = (timeLeft / TOTAL_TIME) * 100;
  return (
    <div className={`min-h-screen relative overflow-hidden ${screenCls}`} style={{ background: "radial-gradient(ellipse at 50% 20%,#451a03 0%,#1c0a00 50%,#000 100%)" }}>
      <style>{CSS}</style>
      <MusicBtn muted={music.muted} onToggle={music.toggleMute} />
      {showConf && <FancyConfetti />}
      <div className="max-w-lg mx-auto px-3 py-3 relative" style={{ zIndex: 10 }}>
        <div className="flex items-center gap-3 mb-3 rounded-2xl p-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className={`font-black text-3xl sm:text-4xl whitespace-nowrap ${danger ? "text-red-400 timer-pulse" : "text-white"}`} style={{ fontFamily: "Fredoka One,cursive" }}>⏱️ {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}</div>
          <div className="flex-1"><div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.4)" }}><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${timePct}%`, background: danger ? "#ef4444" : "linear-gradient(90deg,#4ade80,#22c55e)" }} /></div></div>
          <div className="text-yellow-300 font-black whitespace-nowrap">⚡{score}/{TOTAL_Q}</div>
        </div>
        <div className="text-center mb-3 relative">
          {atk && <div className={`absolute pointer-events-none text-3xl select-none ${atk.dir === "fwd" ? "atk-fwd" : "atk-bwd"}`} style={{ zIndex: 20, top: "40%", transform: "translateY(-50%)", left: atk.dir === "fwd" ? "20%" : "76%" }}>{atk.e}</div>}
          <div className={`text-7xl sm:text-9xl select-none ${bossAnim}`}>💀</div>
          <div className="font-black text-xl sm:text-2xl text-yellow-300" style={{ fontFamily: "Fredoka One,cursive" }}>👑 {L("FRACTION KING","HARI NG PRAKSIYON")}</div>
          <div className="flex gap-1 justify-center mt-2 px-4">{Array.from({ length: TOTAL_Q }, (_, i) => <div key={i} className="flex-1 h-2 sm:h-3 rounded-full transition-all" style={{ background: i < bossHp ? "#f87171" : "rgba(255,255,255,0.1)" }} />)}</div>
        </div>
        <div className="rounded-2xl p-4 mb-3 slide-up" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,215,61,0.15)" }}>
          <div className="text-center text-xs font-black uppercase tracking-widest mb-1" style={{ color: "rgba(255,215,61,.5)" }}>⚡ {L("Boss Q","Boss Q")} {qNum + 1} / {TOTAL_Q}</div>
          <div className="text-center font-black text-sm sm:text-base mb-3 text-white">{q?.instruction}</div>
          <div className="flex items-center justify-center min-h-[55px]"><QDisplay q={q} /></div>
        </div>
        {tipText && <div className="rounded-xl p-3 mb-3 tip-in" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}><p className="font-black text-sm" style={{ color: "#fde68a" }}>💡 {L("Tip","Pahiwatig")}: {tipText}</p></div>}
        {showProcess && q?.process && <div className="rounded-xl p-3 mb-3 tip-in" style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.4)" }}><p className="font-black text-xs uppercase tracking-wide mb-1" style={{ color: "#93c5fd" }}>{L("Step by step","Hakbang-hakbang")}</p><p className="font-bold text-sm" style={{ color: "#dbeafe" }}>{q.process}</p></div>}
        {phase >= 2 && <div aria-hidden className="fixed inset-0 pointer-events-none" style={{ zIndex: 1, background: phase === 2 ? "radial-gradient(ellipse at center,transparent 55%,rgba(220,38,38,0.18) 100%)" : "radial-gradient(ellipse at center,transparent 40%,rgba(220,38,38,0.32) 100%)", animation: phase === 3 ? "bgStar 0.6s ease-in-out infinite" : undefined }} />}
        {locked && lastOk !== null && <div className="rounded-xl p-2.5 mb-3 text-center font-black text-sm slide-up" style={{ background: lastOk ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${lastOk ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`, color: lastOk ? "#86efac" : "#fca5a5" }}>{lastOk ? (lang === "TL" ? "🔥 TAMA!" : "🔥 CORRECT!") : (lang === "TL" ? "😅 Mali — tingnan ang pahiwatig!" : "😅 Wrong — check the tip!")}</div>}
        {!locked && q && (
          <div className="mb-3">
            {(q.type === "mc-frac" || q.type === "mc-mixed") && <div className="grid grid-cols-2 gap-2">{q.choices.map((c, i) => <button key={i} onClick={() => { tap(); checkMC(c); }} className="rounded-xl py-3 px-2 font-black text-white flex items-center justify-center min-h-[65px] cursor-pointer border-none hover:scale-[1.03] active:scale-95 transition-transform" style={{ background: "rgba(255,255,255,0.07)", border: "2px solid rgba(255,255,255,0.14)" }}>{q.type === "mc-mixed" ? <Mixed w={c.w} n={c.n} d={c.d} /> : <Frac n={c.n} d={c.d} big />}</button>)}</div>}
            {q.type === "mc-compare" && <div className="grid grid-cols-3 gap-2">{q.choices.map((c, i) => <button key={i} onClick={() => { tap(); checkMC(c); }} className="rounded-xl py-4 px-2 font-black text-white text-3xl flex items-center justify-center min-h-[65px] cursor-pointer border-none hover:scale-[1.03] active:scale-95 transition-transform" style={{ fontFamily: "Fredoka One,cursive", background: "rgba(255,255,255,0.07)", border: "2px solid rgba(255,255,255,0.14)" }}>{c.label}</button>)}</div>}
            {(q.type === "type-frac" || q.type === "type-mixed") && (
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {q.type === "type-mixed" && <input type="number" value={typeW} onChange={e => setTypeW(e.target.value)} placeholder="whole" className="text-white font-black text-lg text-center outline-none" style={{ width: "4rem", background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: "10px", padding: "7px" }} />}
                  <div className="flex flex-col items-center gap-1">
                    <input type="number" value={typeN} onChange={e => setTypeN(e.target.value)} placeholder="top" className="text-white font-black text-lg text-center outline-none" style={{ width: "4rem", background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: "10px", padding: "7px" }} />
                    <div style={{ width: "4rem", height: "4px", background: "rgba(255,255,255,0.6)", borderRadius: "3px" }} />
                    <input type="number" value={typeD} onChange={e => setTypeD(e.target.value)} placeholder="bot" className="text-white font-black text-lg text-center outline-none" style={{ width: "4rem", background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: "10px", padding: "7px" }} />
                  </div>
                </div>
                <button onClick={checkType} className="w-full text-black font-black py-2.5 rounded-xl text-sm active:scale-95 cursor-pointer border-none" style={{ background: "linear-gradient(135deg,#ffd93d,#ff9f43)", boxShadow: "0 4px 0 rgba(0,0,0,.3)" }}>⚡ {L("ATTACK!","ATAKE!")}</button>
              </div>
            )}
          </div>
        )}
        <DrawingCanvas />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   WIN / BOSS-WIN / GAME-OVER
═══════════════════════════════════════════════════ */
function WinScreen({ worldIdx, levelIdx, livesLeft, xpGained, onNext, onRetry, onMap, music, lang }) {
  const w = WORLDS[worldIdx], lv = w?.levels[levelIdx], stars = livesLeft >= 3 ? 3 : livesLeft >= 2 ? 2 : 1;
  const L = (en, tl) => lang === "TL" ? tl : en;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center py-8" style={{ background: "radial-gradient(ellipse at 50% 30%,rgba(255,215,61,.1) 0%,#050510 60%,#000 100%)" }}>
      <style>{CSS}</style><MusicBtn muted={music.muted} onToggle={music.toggleMute} /><FancyConfetti />
      <div className="idle-float mb-3" style={{ filter: "drop-shadow(0 0 22px rgba(255,200,100,.7))" }}><Hamster3D size={100} /></div>
      <h2 className="font-black text-4xl sm:text-5xl text-white mb-1" style={{ fontFamily: "Fredoka One,cursive" }}>{L("LEVEL CLEAR!","ANTAS TAPOS!")}</h2>
      {lv && <p className="font-bold text-sm mb-4" style={{ color: "rgba(255,255,255,.45)" }}>{lv.enemy.emoji} {lv.enemy.name} {L("defeated!","natalo!")}</p>}
      <div className="flex gap-3 mb-5">{Array.from({ length: 3 }, (_, i) => <span key={i} className={`text-5xl sm:text-6xl ${i < stars ? "star-in" : "opacity-20"}`} style={{ animationDelay: `${i * 0.25}s` }}>{i < stars ? "⭐" : "☆"}</span>)}</div>
      <div className="rounded-2xl p-5 mb-5 w-full max-w-sm" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center"><div className="text-3xl mb-1">❤️</div><div className="font-black text-xl sm:text-2xl text-white">{livesLeft}/3</div><div className="text-xs font-bold uppercase" style={{ color: "rgba(255,255,255,.35)" }}>{L("Hearts Left","Natitira")}</div></div>
          <div className="text-center"><div className="text-3xl mb-1">⚡</div><div className="font-black text-xl sm:text-2xl text-white">+{xpGained}</div><div className="text-xs font-bold uppercase" style={{ color: "rgba(255,255,255,.35)" }}>XP {L("Earned","Nakuha")}</div></div>
        </div>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <button onClick={onRetry} className="text-white font-black px-6 py-3 rounded-xl cursor-pointer border-none hover:scale-105 active:scale-95 transition-transform" style={{ background: "rgba(255,255,255,0.09)" }}>🔄 {L("Retry","Ulit")}</button>
        <button onClick={onMap} className="text-white font-black px-6 py-3 rounded-xl cursor-pointer border-none hover:scale-105 active:scale-95 transition-transform" style={{ background: "rgba(255,255,255,0.09)" }}>🗺️ {L("Map","Mapa")}</button>
        {onNext && <button onClick={onNext} className="text-black font-black px-8 py-3 rounded-xl hover:scale-105 active:scale-95 cursor-pointer border-none transition-transform" style={{ fontFamily: "Fredoka One,cursive", background: "linear-gradient(135deg,#ffd93d,#ff9f43)", boxShadow: "0 5px 0 rgba(0,0,0,.3)" }}>{L("Next Level ▶","Susunod na Antas ▶")}</button>}
      </div>
    </div>
  );
}
function BossWinScreen({ score, total, onMap, music, lang }) {
  const L = (en, tl) => lang === "TL" ? tl : en;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center py-8" style={{ background: "radial-gradient(ellipse at 50% 20%,rgba(251,191,36,.15) 0%,#0a0500 60%,#000 100%)" }}>
      <style>{CSS}</style><MusicBtn muted={music.muted} onToggle={music.toggleMute} /><FancyConfetti />
      <div className="text-7xl sm:text-9xl boss-float mb-2 select-none" style={{ filter: "drop-shadow(0 0 32px gold)" }}>👑</div>
      <h2 className="font-black text-4xl sm:text-5xl text-yellow-300 mb-1" style={{ fontFamily: "Fredoka One,cursive" }}>{L("BOSS DEFEATED!","NATALO ANG BOSS!")}</h2>
      <p className="font-bold mb-4" style={{ color: "rgba(255,255,255,.5)" }}>{L("Hammy is a TRUE FRACTION MASTER! 🐹","Si Hammy ay isang TUNAY NA MAESTRO NG PRAKSIYON! 🐹")}</p>
      <div className="text-5xl mb-3">{score >= 9 ? "🌟🌟🌟" : score >= 7 ? "⭐⭐⭐" : score >= 5 ? "⭐⭐" : "⭐"}</div>
      <div className="rounded-2xl p-5 mb-6" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="font-black text-5xl sm:text-6xl text-yellow-300" style={{ fontFamily: "Fredoka One,cursive" }}>{score}/{total}</div>
        <div className="font-bold text-sm uppercase mt-1" style={{ color: "rgba(255,255,255,.4)" }}>{L("Questions Correct!","Tamang Sagot!")}</div>
      </div>
      <button onClick={onMap} className="text-black font-black text-lg px-10 py-4 rounded-2xl hover:scale-105 active:scale-95 cursor-pointer border-none transition-transform" style={{ fontFamily: "Fredoka One,cursive", background: "linear-gradient(135deg,#ffd93d,#ff9f43)", boxShadow: "0 6px 0 rgba(0,0,0,.3)" }}>🗺️ {L("Back to Map","Bumalik sa Mapa")}</button>
    </div>
  );
}
function GameOverScreen({ onRetry, onMap, music, lang }) {
  const L = (en, tl) => lang === "TL" ? tl : en;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-5" style={{ background: "radial-gradient(ellipse at 50% 30%,rgba(220,38,38,.15) 0%,#0a0000 60%,#000 100%)" }}>
      <style>{CSS}</style><MusicBtn muted={music.muted} onToggle={music.toggleMute} />
      <div className="text-8xl select-none" style={{ animation: "idleFloat 2s ease-in-out infinite" }}>💔</div>
      <h2 className="font-black text-5xl sm:text-6xl text-red-400" style={{ fontFamily: "Fredoka One,cursive" }}>{L("OH NO!","AWIT!")}</h2>
      <p className="font-bold text-base max-w-xs leading-relaxed" style={{ color: "rgba(255,255,255,.55)" }}>{L("Hammy ran out of hearts! 🐹💔\nEvery mistake teaches something! 💡\nYou can do this! 💪","Naubusan si Hammy ng puso! 🐹💔\nBawat pagkakamali ay nagdudulot ng kaalaman! 💡\nKaya mo ito! 💪")}</p>
      <div className="flex gap-3 mt-2">
        <button onClick={onRetry} className="text-white font-black text-lg px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 cursor-pointer border-none transition-transform" style={{ fontFamily: "Fredoka One,cursive", background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 6px 0 rgba(0,0,0,.3)" }}>💪 {L("Try Again!","Subukan Muli!")}</button>
        <button onClick={onMap} className="text-white font-black text-lg px-8 py-4 rounded-2xl cursor-pointer border-none hover:scale-105 active:scale-95 transition-transform" style={{ background: "rgba(255,255,255,0.09)" }}>🗺️ {L("Map","Mapa")}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("langpick");
  const [worldIdx, setWorldIdx] = useState(0), [levelIdx, setLevelIdx] = useState(0);
  const [gs, setGs] = useState(() => { const s = loadSave(); if (!s.lang) { return s; } return s; });
  const [winData, setWinData] = useState({});
  const music = useMusicEngine();
  const lang = gs.lang || "EN";

  // If lang already set, skip language picker (and route through mission intro if first time)
  useEffect(() => { if (gs.lang) setScreen(gs.missionSeen ? "home" : "mission"); }, []);
  useEffect(() => { writeSave(gs); }, [gs]);
  useEffect(() => { setSfxMuted(music.muted); }, [music.muted]);

  const setLang = (l) => setGs(p => ({ ...p, lang: l }));
  const goMap = () => setScreen("map");
  const addXP = (a) => setGs(p => { let { xp, lv, stars, tutSeen, lang: pl } = p; xp += a; while (xp >= lv * 150) { xp -= lv * 150; lv++; } return { xp, lv, stars, tutSeen, lang: pl }; });
  const saveStars = (wid, li, st) => setGs(p => ({ ...p, stars: { ...p.stars, [`${wid}-${li}`]: Math.max(p.stars[`${wid}-${li}`] || 0, st) } }));
  const markTutSeen = (wid) => setGs(p => ({ ...p, tutSeen: { ...(p.tutSeen || {}), [wid]: true } }));
  const handleReset = () => { const f = { xp: 0, lv: 1, stars: {}, tutSeen: {}, lang }; setGs(f); writeSave(f); };

  const handlePick = (l) => { setLang(l); setScreen(gs.missionSeen ? "home" : "mission"); };
  const handleChangeLang = (l) => setGs(p => ({ ...p, lang: l }));
  const handleMissionDone = () => { setGs(p => ({ ...p, missionSeen: true })); setScreen("home"); };
  const handleStoryReplay = () => setScreen("mission");

  const handleSelect = (wi, li) => {
    setWorldIdx(wi); setLevelIdx(li);
    const wid = WORLDS[wi].id;
    if (!gs.tutSeen?.[wid] && TUTORIALS[wid]) { setScreen("tutorial"); }
    else { setScreen("battle"); }
  };

  const handleTutFinish = () => { markTutSeen(WORLDS[worldIdx].id); setScreen("battle"); };
  const handleTutSkip = () => { markTutSeen(WORLDS[worldIdx].id); setScreen("battle"); };

  const handleWin = (livesLeft, total, xpGained) => {
    const st = livesLeft >= 3 ? 3 : livesLeft >= 2 ? 2 : 1;
    saveStars(WORLDS[worldIdx].id, levelIdx, st);
    addXP(xpGained + (st === 3 ? 50 : st === 2 ? 25 : 10));
    setWinData({ livesLeft, xpGained }); setScreen("win");
  };
  const handleBossWin = (score, total) => { addXP(score * 15 + 60); setWinData({ score, total }); setScreen("bosswin"); };
  const handleLose = () => setScreen("gameover");
  const nextLevel = () => {
    const w = WORLDS[worldIdx];
    if (levelIdx < w.levels.length - 1) { setLevelIdx(l => l + 1); setScreen("battle"); }
    else if (worldIdx < WORLDS.length - 1) {
      const nw = WORLDS[worldIdx + 1];
      setWorldIdx(wi => wi + 1); setLevelIdx(0);
      setScreen(gs.tutSeen?.[nw.id] || !TUTORIALS[nw.id] ? "battle" : "tutorial");
    } else setScreen("map");
  };

  return (
    <div>
      <style>{CSS}</style>
      {screen === "langpick"  && <LanguagePicker onPick={handlePick} />}
      {screen === "mission"   && <MissionIntroScreen lang={lang} save={gs} persistSave={writeSave} onDone={handleMissionDone} />}
      {screen === "home"      && <HomeScreen onPlay={goMap} music={music} lang={lang} onStory={handleStoryReplay} />}
      {screen === "map"       && <MapScreen gs={gs} onSelect={handleSelect} onBoss={() => setScreen("boss")} music={music} onReset={handleReset} onChangeLang={handleChangeLang} lang={lang} />}
      {screen === "tutorial"  && <TutorialScreen worldIdx={worldIdx} lang={lang} onFinish={handleTutFinish} onSkip={handleTutSkip} music={music} />}
      {screen === "battle"    && <BattleScreen key={`${worldIdx}-${levelIdx}-${Date.now()}`} worldIdx={worldIdx} levelIdx={levelIdx} onWin={handleWin} onLose={handleLose} music={music} lang={lang} save={gs} />}
      {screen === "boss"      && <BossScreen key={Date.now()} onWin={handleBossWin} onLose={handleLose} music={music} lang={lang} save={gs} />}
      {screen === "win"       && <WinScreen worldIdx={worldIdx} levelIdx={levelIdx} livesLeft={winData.livesLeft} xpGained={winData.xpGained} onNext={nextLevel} onRetry={() => setScreen("battle")} onMap={goMap} music={music} lang={lang} />}
      {screen === "bosswin"   && <BossWinScreen score={winData.score} total={winData.total} onMap={goMap} music={music} lang={lang} />}
      {screen === "gameover"  && <GameOverScreen onRetry={() => setScreen("battle")} onMap={goMap} music={music} lang={lang} />}
    </div>
  );
}
