"use client"
import { useState, useEffect, useRef } from "react";

const BASE_WIDTH = 1400, BASE_HEIGHT = 1000, SPD = 3.5;

const CHARS = {
  vivi: { id: "vivi", name:"Vivi", color:"#FF1493", hair:"#BB006F", shoe:"#FF69B4", skin:"#FFD5A8", emoji:"👑" },
  lili: { id: "lili", name:"Lili", color:"#1E90FF", hair:"#005FCC", shoe:"#87CEEB", skin:"#FFD5A8", emoji:"⭐" },
};

const MENU = [
  {emoji:"🍕",name:"Pizza",pts:180,color:"#FF6B35"},
  {emoji:"🍣",name:"Sushi",pts:240,color:"#E74C3C"},
  {emoji:"🐟",name:"Fish & Chips",pts:160,color:"#3498DB"},
  {emoji:"🧀",name:"Grilled Cheese",pts:140,color:"#F39C12"},
  {emoji:"🍝",name:"Mac & Cheese",pts:150,color:"#E67E22"},
];
const STAGE = ["⭐","💫","✨","🌟","💖","🦋","🎇","💎","🌸","🎆"];
const SHOP_ITEMS = [
  {id:"boots",  emoji:"👢",name:"Pink Sparkly Cowboy Boots",price:5000,   color:"#FF69B4",sub:"⚡ Power-up item!"},
  {id:"outfit", emoji:"👗",name:"Half & Half Boutique Fit", price:18000,  color:"#CC66FF",sub:"Matching colors!"},
  {id:"puppy",  emoji:"🎀",name:"Puppy Sparkle Outfit",     price:3500,   color:"#FF1493",sub:"For your puppy!"},
  {id:"boba",   emoji:"🧋",name:"Giant Boba Supreme",        price:500,    color:"#F4A018",sub:"Downstairs treat!"},
  {id:"jet",    emoji:"✈️",name:"💎 Private Supertwins Jet",price:5000000,color:"#FFD700",sub:"The big dream!"},
  {id:"crown",  emoji:"👑",name:"💎 Royal Crown Set",        price:2500000,color:"#FFD700",sub:"You ARE royalty!"},
];

const mkWins = (w, h) => {
  if (w <= 0 || h <= 0) return [];
  const a = [];
  const cols = Math.max(1, Math.floor((w - 40) / 70));
  const rows = Math.max(1, Math.floor((h - 55) / 60));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      a.push({ c, r, lit: Math.random() > 0.35 });
  return a;
};

const SCALE_COORDS = (b, scaleX, scaleY) => ({
  ...b,
  x: b.x * scaleX,
  y: b.y * scaleY,
  w: b.w * scaleX,
  h: b.h * scaleY,
});

const BLDS = (scaleX, scaleY) => [
  { id:"stadium",    label:"The Stadium",       x:80,   y:68,  w:300, h:225, wall:"#0d0c00", roof:"#201e00", trim:"#FFD700", emoji:"🏟️", screen:"stadium",    tip:"[E] Perform 🎤" },
  { id:"shop",       label:"Half & Half Shop",  x:1020, y:68,  w:310, h:215, wall:"#08001a", roof:"#110026", trim:"#CC66FF", emoji:"🛍️", screen:"shop",       tip:"[E] Shop 🛍️"   },
  { id:"tower",      label:"Penthouse Tower",   x:570,  y:368, w:260, h:255, wall:"#160028", roof:"#240044", trim:"#FF1493", emoji:"🏙️", screen:"penthouse",  tip:"[E] Go home 🏠" },
  { id:"boba",       label:"Boba Shop",         x:80,   y:726, w:190, h:148, wall:"#120900", roof:"#1c1200", trim:"#F4A018", emoji:"🧋", screen:null,         tip:"[E] Get boba 🧋"},
  { id:"restaurant", label:"Fancy Restaurant",  x:1030, y:726, w:290, h:180, wall:"#140700", roof:"#1e0a00", trim:"#FF6B35", emoji:"🍽️", screen:"restaurant", tip:"[E] Work 💼"    },
].map(b => SCALE_COORDS(b, scaleX, scaleY)).map(b => ({ ...b, wins: mkWins(b.w, b.h) }));

const TREES = (scaleX, scaleY) => [
  {x:30,y:370},{x:32,y:445},{x:28,y:525},
  {x:1368,y:370},{x:1372,y:445},{x:1368,y:525},
  {x:440,y:96},{x:476,y:142},{x:510,y:96},
  {x:890,y:92},{x:930,y:134},{x:972,y:96},
  {x:462,y:292},{x:502,y:308},{x:900,y:292},{x:940,y:306},
  {x:282,y:745},{x:322,y:778},{x:342,y:748},
  {x:700,y:798},{x:740,y:828},{x:678,y:840},
  {x:932,y:745},{x:962,y:772},{x:992,y:748},
  {x:452,y:918},{x:700,y:948},{x:948,y:918},
].map(t => ({ x: t.x * scaleX, y: t.y * scaleY }));

function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function shade(hex, amt) {
  try {
    const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + amt));
    const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + amt));
    const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + amt));
    return `rgb(${r},${g},${b})`;
  } catch { return hex; }
}

export default function Game() {
  const [screen, setScreen] = useState("intro");
  const [charKey, setCharKey] = useState("vivi");
  const [money, setMoney] = useState(0);
  const [fans, setFans] = useState(0);
  const [notif, setNotif] = useState(null);
  const [initializing, setInitializing] = useState(false);

  const c = CHARS[charKey] || CHARS.vivi;

  const showNotif = (msg, emoji = "✨") => {
    setNotif({ msg, emoji });
    setTimeout(() => setNotif(null), 2500);
  };
  const earn = (amt, fanGain = 0, lbl = "") => {
    setMoney(m => m + amt);
    setFans(f => f + fanGain);
    showNotif(`+$${amt.toLocaleString()} ${lbl}`, fanGain > 0 ? "🌟" : "💰");
  };

  const handleScreenSwitch = async (next) => {
      setInitializing(true);
      await new Promise(r => setTimeout(r, 400));
      setScreen(next);
      setInitializing(false);
  }

  return (
    <div style={{ width:"100%", height:"100vh", overflow:"hidden", position:"relative", fontFamily:"'Nunito',sans-serif", background:"#0a0a0a" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&family=Fredoka+One&display=swap" rel="stylesheet" />
      {notif && (
        <div style={{ position:"absolute", top:"14%", left:"50%", transform:"translate(-50%,-50%)", background:"rgba(0,0,0,.92)", border:`3px solid ${c.color}`, borderRadius:20, padding:"10px 24px", color:"white", fontSize:18, fontWeight:900, zIndex:2000, whiteSpace:"nowrap", boxShadow:`0 0 28px ${c.color}99`, pointerEvents:"none", animation:"popIn .25s ease" }}>
          {notif.emoji} {notif.msg}
        </div>
      )}
      {initializing && (
          <div style={{ position:"absolute", inset:0, zIndex:3000, background:"rgba(0,0,0,.8)", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
              Loading...
          </div>
      )}
      {screen === "intro"      && <Intro setCharKey={setCharKey} onComplete={() => handleScreenSwitch("world")} />}
      {screen === "world"      && <World charKey={charKey} money={money} fans={fans} goScreen={handleScreenSwitch} showNotif={showNotif} />}
      {screen === "penthouse"  && <Penthouse c={c} charKey={charKey} money={money} fans={fans} goBack={() => handleScreenSwitch("world")} />}
      {screen === "stadium"    && <Stadium c={c} earn={earn} goBack={() => handleScreenSwitch("world")} />}
      {screen === "restaurant" && <Restaurant c={c} earn={earn} goBack={() => handleScreenSwitch("world")} />}
      {screen === "shop"       && <Shop c={c} money={money} setMoney={setMoney} goBack={() => handleScreenSwitch("world")} showNotif={showNotif} />}
      <style>{`
        @keyframes popIn    { from{transform:translate(-50%,-50%) scale(.35);opacity:0} to{transform:translate(-50%,-50%) scale(1);opacity:1} }
        @keyframes floatY   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
        @keyframes slideUp  { from{transform:translateY(50px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes flyLeft  { from{left:110%} to{left:-15%} }
        @keyframes aud      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        * { box-sizing:border-box }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.2);border-radius:8px }
      `}</style>
    </div>
  );
}

function Intro({ setCharKey, onComplete }) {
  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24, padding:20, background:"radial-gradient(ellipse at 50% 30%,#2a0040,#0a000f)" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:56, animation:"floatY 2s ease-in-out infinite", lineHeight:1 }}>👑⭐👑</div>
        <h1 style={{ fontFamily:"Fredoka One", fontSize:"clamp(30px,8vw,58px)", color:"white", margin:"8px 0 4px", textShadow:"0 0 40px #FF69B4,0 0 80px #87CEEB", letterSpacing:1 }}>The Supertwins</h1>
        <p style={{ color:"rgba(255,255,255,.45)", fontSize:14, margin:"0 0 4px" }}>🏙️ Welcome to Hailey City RP!</p>
      </div>
      <div style={{ display:"flex", gap:20, flexWrap:"wrap", justifyContent:"center" }}>
        {Object.entries(CHARS).map(([k, ch]) => (
          <button key={k} onClick={() => { setCharKey(k); onComplete(); }} style={{ width:172, padding:"22px 14px 18px", borderRadius:26, background:"rgba(255,255,255,.05)", border:`3px solid ${ch.color}`, cursor:"pointer", transition:"all .2s" }}>
            <div style={{ fontSize:50, animation:"floatY 2s ease-in-out infinite" }}>{k==="vivi"?"🩷":"💙"}</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:32, color:ch.color, marginTop:6 }}>{ch.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function World({ charKey, money, fans, goScreen, showNotif }) {
  const canvasRef = useRef(null);
  const S = useRef({ px:700, py:680, camX:0, camY:0, frame:0, keys:{}, joy:{ active:false, dx:0, dy:0 }, nearBld:null });
  const [nearBld, setNearBld] = useState(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const kd = e => { S.current.keys[e.key.toLowerCase()] = true; if (e.key === "e" && S.current.nearBld) goScreen(S.current.nearBld.screen); };
    const ku = e => { S.current.keys[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    return () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const scaleX = W / BASE_WIDTH;
    const scaleY = H / BASE_HEIGHT;
    const s = S.current;

    function loop() {
      // Movement
      let dx = 0, dy = 0;
      const k = s.keys;
      const speed = SPD * Math.min(scaleX, scaleY);
      if (k["arrowleft"] || k["a"]) dx -= speed;
      if (k["arrowright"]|| k["d"]) dx += speed;
      if (k["arrowup"]   || k["w"]) dy -= speed;
      if (k["arrowdown"] || k["s"]) dy += speed;
      s.px += dx; s.py += dy;
      
      // Draw (simplified for brevity)
      ctx.fillStyle = "#1c2b1c"; ctx.fillRect(0,0,W,H);
      // ... rest of draw logic ...
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={canvasRef} style={{ width:"100%", height:"100%" }} />;
}

function Penthouse({ c, charKey, money, fans, goBack }) { return <div />; }
function Stadium({ c, earn, goBack }) { return <div />; }
function Restaurant({ c, earn, goBack }) { return <div />; }
function Shop({ c, money, setMoney, goBack, showNotif }) { return <div />; }
