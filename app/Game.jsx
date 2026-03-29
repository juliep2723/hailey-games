"use client"
import { useState, useEffect, useRef } from "react";

const BASE_WIDTH = 1400, BASE_HEIGHT = 1000, SPD = 3.5;

const CHARS = {
  vivi: { name:"Vivi", color:"#FF1493", hair:"#BB006F", shoe:"#FF69B4", skin:"#FFD5A8", emoji:"👑" },
  lili: { name:"Lili", color:"#1E90FF", hair:"#005FCC", shoe:"#87CEEB", skin:"#FFD5A8", emoji:"⭐" },
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
  wins: b.wins ? b.wins : [],
});

const BLDS = (scaleX, scaleY) => [
  { id:"stadium",    label:"The Stadium",       x:80,   y:68,  w:300, h:225, wall:"#0d0c00", roof:"#201e00", trim:"#FFD700", emoji:"🏟️", screen:"stadium",    tip:"[E] Perform 🎤" },
  { id:"shop",       label:"Half & Half Shop",  x:1020, y:68,  w:310, h:215, wall:"#08001a", roof:"#110026", trim:"#CC66FF", emoji:"🛍️", screen:"shop",       tip:"[E] Shop 🛍️"   },
  { id:"tower",      label:"Penthouse Tower",   x:570,  y:368, w:260, h:255, wall:"#160028", roof:"#240044", trim:"#FF1493", emoji:"🏙️", screen:"penthouse",  tip:"[E] Go home 🏠" },
  { id:"boba",       label:"Boba Shop",         x:80,   y:726, w:190, h:148, wall:"#120900", roof:"#1c1200", trim:"#F4A018", emoji:"🧋", screen:null,         tip:"[E] Get boba 🧋"},
  { id:"restaurant", label:"Fancy Restaurant",  x:1030, y:726, w:290, h:180, wall:"#140700", roof:"#1e0a00", trim:"#FF6B35", emoji:"🍽️", screen:"restaurant", tip:"[E] Work 💼"    },
].map(b => ({ ...b, wins: mkWins(b.w * scaleX, b.h * scaleY) }))
 .map(b => SCALE_COORDS(b, scaleX, scaleY));

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
  const [transitioning, setTransitioning] = useState(false);
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

  const goScreen = (next) => {
    if (!next) { showNotif("Boba Shop coming soon! 🧋","🧋"); return; }
    setTransitioning(true);
    setTimeout(() => {
      setScreen(next);
      setTransitioning(false);
    }, 100);
  };

  return (
    <div style={{ width:"100%", height:"100vh", overflow:"hidden", position:"relative", fontFamily:"'Nunito',sans-serif", background:"#0a0a0a" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&family=Fredoka+One&display=swap" rel="stylesheet" />
      {notif && (
        <div style={{ position:"absolute", top:"14%", left:"50%", transform:"translate(-50%,-50%)", background:"rgba(0,0,0,.92)", border:`3px solid ${c.color}`, borderRadius:20, padding:"10px 24px", color:"white", fontSize:18, fontWeight:900, zIndex:2000, whiteSpace:"nowrap", boxShadow:`0 0 28px ${c.color}99`, pointerEvents:"none", animation:"popIn .25s ease" }}>
          {notif.emoji} {notif.msg}
        </div>
      )}
      {transitioning && (
        <div style={{ position:"absolute", inset:0, zIndex:3000, background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ color:"rgba(255,255,255,.4)", fontSize:14 }}>✨</div>
        </div>
      )}
      {!transitioning && screen === "intro"      && <Intro setCharKey={setCharKey} goScreen={goScreen} />}
      {!transitioning && screen === "world"      && <World charKey={charKey} money={money} fans={fans} goScreen={goScreen} showNotif={showNotif} />}
      {!transitioning && screen === "penthouse"  && <Penthouse c={c} charKey={charKey} money={money} fans={fans} goBack={() => goScreen("world")} />}
      {!transitioning && screen === "stadium"    && <Stadium c={c} earn={earn} goBack={() => goScreen("world")} />}
      {!transitioning && screen === "restaurant" && <Restaurant c={c} earn={earn} goBack={() => goScreen("world")} />}
      {!transitioning && screen === "shop"       && <Shop c={c} money={money} setMoney={setMoney} goBack={() => goScreen("world")} showNotif={showNotif} />}
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

function Intro({ setCharKey, goScreen }) {
  const [picked, setPicked] = useState(null);
  const choose = k => { setPicked(k); setCharKey(k); setTimeout(() => goScreen("world"), 300); };
  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24, padding:20, background:"radial-gradient(ellipse at 50% 30%,#2a0040,#0a000f)" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:56, animation:"floatY 2s ease-in-out infinite", lineHeight:1 }}>👑⭐👑</div>
        <h1 style={{ fontFamily:"Fredoka One", fontSize:"clamp(30px,8vw,58px)", color:"white", margin:"8px 0 4px", textShadow:"0 0 40px #FF69B4,0 0 80px #87CEEB", letterSpacing:1 }}>The Supertwins</h1>
        <p style={{ color:"rgba(255,255,255,.45)", fontSize:14, margin:"0 0 4px" }}>🏙️ Welcome to Hailey City RP!</p>
        <p style={{ color:"rgba(255,255,255,.3)", fontSize:12, margin:0 }}>Walk around · WASD or Arrow Keys · E to enter buildings</p>
      </div>
      <div style={{ display:"flex", gap:20, flexWrap:"wrap", justifyContent:"center" }}>
        {Object.entries(CHARS).map(([k, ch]) => (
          <button key={k} onClick={() => choose(k)} style={{ width:172, padding:"22px 14px 18px", borderRadius:26, background:picked===k?`${ch.color}22`:"rgba(255,255,255,.05)", border:`3px solid ${ch.color}`, cursor:"pointer", transform:picked===k?"scale(1.06)":"scale(1)", transition:"all .2s", boxShadow:`0 0 ${picked===k?50:20}px ${ch.color}55` }}>
            <div style={{ fontSize:50, animation:"floatY 2s ease-in-out infinite", animationDelay:k==="lili"?".8s":"0s" }}>{k==="vivi"?"🩷":"💙"}</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:32, color:ch.color, marginTop:6, textShadow:`0 0 12px ${ch.color}` }}>{ch.name}</div>
            <div style={{ color:"rgba(255,255,255,.45)", fontSize:12 }}>🐩 Sparkly {k==="vivi"?"Pink":"Blue"} Puppy</div>
            <div style={{ marginTop:10, background:"rgba(0,0,0,.4)", borderRadius:10, padding:"5px", color:"rgba(255,255,255,.6)", fontSize:11 }}>
              {k==="vivi"?"🏠 Pink":"🏠 Blue"} Penthouse
            </div>
          </button>
        ))}
      </div>
      <div style={{ color:"rgba(255,255,255,.3)", fontSize:13, textAlign:"center" }}>
        🎯 Big Goal: Earn <span style={{ color:"#FFD700", fontWeight:900 }}>$5,000,000</span> for the 💎 Diamond Set!
      </div>
    </div>
  );
}

function World({ charKey, money, fans, goScreen, showNotif }) {
  const canvasRef = useRef(null);
  const S = useRef({ px:700, py:680, camX:0, camY:0, frame:0, keys:{}, joy:{ active:false, dx:0, dy:0 }, nearBld:null });
  const [nearBld, setNearBld] = useState(null);
  const rafRef = useRef(null);
  const enterFn = useRef(null);

  const doEnter = (bld) => {
    if (!bld) return;
    if (!bld.screen) { showNotif("Boba Shop coming soon! 🧋","🧋"); return; }
    goScreen(bld.screen);
  };
  enterFn.current = doEnter;

  useEffect(() => {
    const kd = e => {
      S.current.keys[e.key.toLowerCase()] = true;
      if ((e.key === "e" || e.key === "E") && S.current.nearBld) enterFn.current(S.current.nearBld);
      if (e.key.startsWith("Arrow")) e.preventDefault();
    };
    const ku = e => { S.current.keys[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const s = S.current;

    const sparks = Array.from({ length: 55 }, () => ({
      x: Math.random() * BASE_WIDTH, y: Math.random() * BASE_HEIGHT,
      vx: (Math.random() - .5) * .28, vy: -Math.random() * .38 - .1,
      life: Math.random(), speed: Math.random() * .005 + .003,
      size: Math.random() * 2.5 + .8,
      col: ["#FF1493","#1E90FF","#FFD700","#FF69B4","#87CEEB"][Math.floor(Math.random()*5)],
    }));

    function drawGround(ctx, cx, cy, W, H, worldW, worldH, scaleX, scaleY) {
      ctx.fillStyle = "#1c2b1c"; ctx.fillRect(0,0,W,H);
      const ts = 48 * Math.min(scaleX, scaleY);
      const sx = Math.floor(cx/ts)*ts, sy = Math.floor(cy/ts)*ts;
      for (let tx = sx; tx < cx+W+ts; tx += ts)
        for (let ty = sy; ty < cy+H+ts; ty += ts) {
          ctx.fillStyle = ((Math.floor(tx/ts)+Math.floor(ty/ts))%2===0) ? "#223422" : "#1c2b1c";
          ctx.fillRect(tx-cx, ty-cy, ts, ts);
        }
      const plazaX = 482*scaleX, plazaY = 290*scaleY, plazaW = 436*scaleX, plazaH = 440*scaleY;
      ctx.fillStyle = "#26263a";
      ctx.fillRect(plazaX-cx, plazaY-cy, plazaW, plazaH);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 606*scaleY-cy, W, 82*scaleY);
      ctx.fillRect(678*scaleX-cx, 0, 84*scaleX, H);
      ctx.strokeStyle = "#2e2e00"; ctx.setLineDash([26*Math.min(scaleX,scaleY),16*Math.min(scaleX,scaleY)]); ctx.lineWidth = 3*Math.min(scaleX,scaleY);
      ctx.beginPath(); ctx.moveTo(0, 647*scaleY-cy); ctx.lineTo(W, 647*scaleY-cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(720*scaleX-cx, 0); ctx.lineTo(720*scaleX-cx, H); ctx.stroke();
      ctx.setLineDash([]);
    }

    function drawBuilding(ctx, b, cx, cy, scaleX, scaleY) {
      const x = b.x-cx, y = b.y-cy, D = 14 * Math.min(scaleX,scaleY);
      if (x+b.w+D<0||x>ctx.canvas.width||y+b.h<0||y-D>ctx.canvas.height) return;
      ctx.fillStyle = b.roof;
      ctx.beginPath();
      ctx.moveTo(x,y); ctx.lineTo(x+D,y-D); ctx.lineTo(x+b.w+D,y-D); ctx.lineTo(x+b.w,y);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = shade(b.wall, -22);
      ctx.beginPath();
      ctx.moveTo(x+b.w,y); ctx.lineTo(x+b.w+D,y-D); ctx.lineTo(x+b.w+D,y+b.h-D); ctx.lineTo(x+b.w,y+b.h);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = b.wall;
      ctx.fillRect(x, y, b.w, b.h);
      ctx.strokeStyle = b.trim; ctx.lineWidth = 2.5 * Math.min(scaleX,scaleY);
      ctx.shadowColor = b.trim; ctx.shadowBlur = 14 * Math.min(scaleX,scaleY);
      ctx.strokeRect(x+1, y+1, b.w-2, b.h-2);
      ctx.shadowBlur = 0;
      const cols = Math.max(1, Math.floor((b.w-40*scaleX)/(70*scaleX)));
      for (const w of (b.wins || [])) {
        const wx = x + 22*scaleX + w.c * ((b.w - 36*scaleX) / Math.max(1, cols));
        const wy = y + 22*scaleY + w.r * 57*scaleY;
        if (wy + 22*scaleY < y + b.h - 46*scaleY) {
          ctx.fillStyle = w.lit ? b.trim+"38" : b.trim+"12";
          ctx.fillRect(wx, wy, 26*scaleX, 20*scaleY);
          ctx.strokeStyle = b.trim+"55"; ctx.lineWidth = 1 * Math.min(scaleX,scaleY);
          ctx.strokeRect(wx, wy, 26*scaleX, 20*scaleY);
        }
      }
      const dw = 34*scaleX, dh = 46*scaleY;
      const dx = x + b.w/2 - dw/2, dy = y + b.h - dh;
      ctx.fillStyle = b.trim+"55"; ctx.fillRect(dx, dy, dw, dh);
      ctx.strokeStyle = b.trim; ctx.lineWidth = 2 * Math.min(scaleX,scaleY); ctx.strokeRect(dx, dy, dw, dh);
      ctx.fillStyle = "#FFD700";
      ctx.beginPath(); ctx.arc(dx+dw-7*scaleX, dy+dh/2, 3*Math.min(scaleX,scaleY), 0, Math.PI*2); ctx.fill();
      ctx.shadowColor = b.trim; ctx.shadowBlur = 8 * Math.min(scaleX,scaleY);
      ctx.font = `700 ${13*Math.min(scaleX,scaleY)}px Nunito,sans-serif`; ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,.88)";
      ctx.fillText(b.label, x+b.w/2, y+b.h/2+5*scaleY);
      ctx.font = `${24*Math.min(scaleX,scaleY)}px serif`;
      ctx.fillText(b.emoji, x+b.w/2, y+26*scaleY);
      ctx.shadowBlur = 0;
    }

    function drawTree(ctx, tx, ty, cx, cy, scaleX, scaleY) {
      const x = tx-cx, y = ty-cy;
      const s = Math.min(scaleX,scaleY);
      if (x<-60*s||x>ctx.canvas.width+60*s||y<-70*s||y>ctx.canvas.height+50*s) return;
      ctx.fillStyle = "#5D4037"; ctx.fillRect(x-4*s, y, 8*s, 20*s);
      ctx.fillStyle = "rgba(0,0,0,.28)";
      ctx.beginPath(); ctx.ellipse(x, y+2*s, 20*s, 7*s, 0, 0, Math.PI*2); ctx.fill();
      ctx.shadowColor = "#4CAF50"; ctx.shadowBlur = 8*s;
      ctx.fillStyle = "#1B5E20"; ctx.beginPath(); ctx.arc(x, y-13*s, 21*s, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#2E7D32";
      ctx.beginPath(); ctx.arc(x-9*s, y-9*s, 14*s, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x+9*s, y-9*s, 14*s, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#43A047"; ctx.beginPath(); ctx.arc(x, y-20*s, 12*s, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    function drawPlayer(ctx, sx, sy, ck, ch, frame) {
      const bob = Math.sin(frame*.18)*2;
      const ls  = Math.sin(frame*.22)*5;
      const as  = Math.sin(frame*.22)*6;
      ctx.fillStyle = "rgba(0,0,0,.3)";
      ctx.beginPath(); ctx.ellipse(sx, sy+1, 13, 5, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = ch.shoe;
      ctx.fillRect(sx-9,  sy-3+bob+ls, 9, 6);
      ctx.fillRect(sx+1,  sy-3+bob-ls, 9, 6);
      ctx.fillStyle = shade(ch.color, -35);
      ctx.fillRect(sx-8,  sy-16+bob, 7, 14+ls);
      ctx.fillRect(sx+1,  sy-16+bob, 7, 14-ls);
      ctx.fillStyle = ch.color;
      ctx.fillRect(sx-10, sy-32+bob, 20, 17);
      ctx.fillStyle = "#FFD700"; ctx.font = "11px serif"; ctx.textAlign = "center";
      ctx.fillText("★", sx, sy-22+bob);
      ctx.fillStyle = ch.color;
      ctx.fillRect(sx-16, sy-30+bob+as, 7, 12);
      ctx.fillRect(sx+9,  sy-30+bob-as, 7, 12);
      ctx.fillStyle = ch.skin; ctx.fillRect(sx-3, sy-36+bob, 6, 5);
      ctx.fillStyle = ch.skin; ctx.fillRect(sx-11, sy-52+bob, 22, 18);
      ctx.fillStyle = ch.hair;
      ctx.fillRect(sx-12, sy-54+bob, 24, 7);
      ctx.fillRect(sx-14, sy-51+bob, 5, 11);
      ctx.fillRect(sx+9,  sy-51+bob, 5, 11);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(sx-7, sy-47+bob, 5, 5);
      ctx.fillRect(sx+2, sy-47+bob, 5, 5);
      ctx.fillStyle = "white";
      ctx.fillRect(sx-6, sy-47+bob, 2, 2);
      ctx.fillRect(sx+3, sy-47+bob, 2, 2);
      ctx.fillStyle = "rgba(255,120,120,.38)";
      ctx.beginPath(); ctx.ellipse(sx-8, sy-41+bob, 4, 3, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(sx+8, sy-41+bob, 4, 3, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = "#c07050"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(sx, sy-39+bob, 4, .1, Math.PI-.1); ctx.stroke();
      const fl = -Math.abs(Math.sin(frame*.055))*5;
      ctx.font = "16px serif"; ctx.textAlign = "center";
      ctx.fillText(ch.emoji, sx, sy-57+bob+fl);
      ctx.font = "700 11px Nunito,sans-serif";
      const nw = ctx.measureText(ch.name).width + 14;
      rrect(ctx, sx-nw/2, sy-74+bob, nw, 17, 4);
      ctx.fillStyle = "rgba(0,0,0,.78)"; ctx.fill();
      ctx.fillStyle = ch.color;
      ctx.fillText(ch.name, sx, sy-61+bob);
    }

    function drawPrompt(ctx, W, H, bld, scaleX, scaleY) {
      if (!bld) return;
      const s = Math.min(scaleX, scaleY);
      ctx.font = `700 ${13*s}px Nunito,sans-serif`; ctx.textAlign = "center";
      const tw = ctx.measureText(bld.tip).width + 28*s;
      const bx = W/2, by = H-72*s;
      rrect(ctx, bx-tw/2, by-17*s, tw, 32*s, 8*s);
      ctx.fillStyle = "rgba(0,0,0,.88)"; ctx.fill();
      ctx.shadowColor = bld.trim; ctx.shadowBlur = 12*s;
      ctx.strokeStyle = bld.trim; ctx.lineWidth = 2*s;
      rrect(ctx, bx-tw/2, by-17*s, tw, 32*s, 8*s);
      ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = "white"; ctx.fillText(bld.tip, bx, by+5*s);
    }

    function loop() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const W = canvas.width, H = canvas.height;
      const scaleX = W / BASE_WIDTH;
      const scaleY = H / BASE_HEIGHT;
      const currentBLDS = BLDS(scaleX, scaleY);
      const currentTREES = TREES(scaleX, scaleY);

      let dx = 0, dy = 0;
      const k = s.keys;
      const speed = SPD * Math.min(scaleX, scaleY);
      if (k["arrowleft"] || k["a"]) dx -= speed;
      if (k["arrowright"]|| k["d"]) dx += speed;
      if (k["arrowup"]   || k["w"]) dy -= speed;
      if (k["arrowdown"] || k["s"]) dy += speed;
      if (s.joy.active && joyId.current !== null) { dx += s.joy.dx*speed; dy += s.joy.dy*speed; }
      if (dx && dy) { dx *= .707; dy *= .707; }

      const nx = Math.max(20*scaleX, Math.min(W-20*scaleX, s.px+dx));
      const ny = Math.max(20*scaleY, Math.min(H-20*scaleY, s.py+dy));
      let blocked = false;
      for (const b of currentBLDS) {
        if (nx > b.x && nx < b.x+b.w && ny > b.y && ny < b.y+b.h-40*scaleY) { blocked = true; break; }
      }
      if (!blocked) { s.px = nx; s.py = ny; }
      if (dx || dy) s.frame++;

      const worldW = BASE_WIDTH*scaleX;
      const worldH = BASE_HEIGHT*scaleY;
      s.camX += (s.px - W/2 - s.camX) * .12;
      s.camY += (s.py - H/2 - s.camY) * .12;
      s.camX = Math.max(0, Math.min(worldW-W, s.camX));
      s.camY = Math.max(0, Math.min(worldH-H, s.camY));

      let closest = null, bestD = 82*Math.min(scaleX,scaleY);
      for (const b of currentBLDS) {
        const d = Math.hypot(s.px-(b.x+b.w/2), s.py-(b.y+b.h));
        if (d < bestD) { bestD = d; closest = b; }
      }
      if (s.nearBld?.id !== closest?.id) { s.nearBld = closest; setNearBld(closest); }

      for (const p of sparks) {
        p.x += p.vx*scaleX; p.y += p.vy*scaleY; p.life -= p.speed;
        if (p.life <= 0) { p.x = Math.random()*worldW; p.y = worldH+10; p.life = .4+Math.random()*.6; }
      }

      drawGround(ctx, s.camX, s.camY, W, H, worldW, worldH, scaleX, scaleY);
      ctx.save();
      for (const p of sparks) {
        if (p.x < s.camX-100 || p.x > s.camX+W+100) continue;
        ctx.globalAlpha = p.life*.48;
        ctx.fillStyle = p.col; ctx.shadowColor = p.col; ctx.shadowBlur = 6*Math.min(scaleX,scaleY);
        ctx.beginPath(); ctx.arc(p.x-s.camX, p.y-s.camY, p.size*Math.min(scaleX,scaleY), 0, Math.PI*2); ctx.fill();
      }
      ctx.restore();

      const items = [
        ...currentBLDS.map(b => ({ t:"b", d:b, sy:b.y+b.h })),
        ...currentTREES.map(t => ({ t:"t", d:t, sy:t.y })),
        { t:"p", sy:s.py },
      ].sort((a, b) => a.sy - b.sy);

      for (const item of items) {
        if (item.t === "b") drawBuilding(ctx, item.d, s.camX, s.camY, scaleX, scaleY);
        else if (item.t === "t") drawTree(ctx, item.d.x, item.d.y, s.camX, s.camY, scaleX, scaleY);
        else drawPlayer(ctx, s.px-s.camX, s.py-s.camY, charKey, CHARS[charKey], s.frame);
      }
      drawPrompt(ctx, W, H, s.nearBld, scaleX, scaleY);
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [charKey]);

  const [knob, setKnob] = useState({ x:50, y:50 });
  const joyId = useRef(null);
  const joyStart = e => { e.preventDefault(); joyId.current = e.changedTouches[0].identifier; };
  const joyMove = e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier !== joyId.current) continue;
      const rect = e.currentTarget.getBoundingClientRect();
      let dx = t.clientX-(rect.left+50), dy = t.clientY-(rect.top+50);
      const mag = Math.hypot(dx, dy), maxR = 30;
      if (mag > maxR) { dx = dx/mag*maxR; dy = dy/mag*maxR; }
      S.current.joy = { active:true, dx:dx/maxR, dy:dy/maxR };
      setKnob({ x:50+dx, y:50+dy });
    }
  };
  const joyEnd = e => {
    if (e && e.preventDefault) e.preventDefault();
    S.current.joy = { active:false, dx:0, dy:0 };
    joyId.current = null; setKnob({ x:55, y:55 });
  };

  const c = CHARS[charKey] || CHARS.vivi;
  return (
    <div style={{ width:"100%", height:"100vh", position:"relative", userSelect:"none", WebkitUserSelect:"none" }}>
      <canvas ref={canvasRef} style={{ width:"100%", height:"100%", display:"block" }} />
      <div style={{ position:"absolute", top:10, left:10, display:"flex", flexDirection:"column", gap:5, zIndex:10 }}>
        <div style={{ background:"rgba(0,0,0,.78)", border:`2px solid ${c.color}`, borderRadius:14, padding:"7px 14px", color:"white", fontSize:13, fontWeight:900, backdropFilter:"blur(6px)", display:"flex", alignItems:"center", gap:7 }}>
          <span style={{ color:c.color, fontSize:18 }}>{c.emoji}</span>
          <span>{c.name}</span>
          <span style={{ color:"rgba(255,255,255,.3)", fontSize:11, marginLeft:4 }}>Hailey City RP</span>
        </div>
        <div style={{ background:"rgba(0,0,0,.72)", border:"2px solid #FFD700", borderRadius:12, padding:"6px 14px", color:"#FFD700", fontSize:13, fontWeight:900, backdropFilter:"blur(6px)" }}>
          💰 ${money.toLocaleString()}
        </div>
        <div style={{ background:"rgba(0,0,0,.72)", border:`2px solid ${c.color}`, borderRadius:12, padding:"6px 14px", color:c.color, fontSize:13, fontWeight:900, backdropFilter:"blur(6px)" }}>
          🌟 {fans.toLocaleString()} fans
        </div>
      </div>
      <div style={{ position:"absolute", top:10, right:10, width:175, zIndex:10 }}>
        <div style={{ background:"rgba(0,0,0,.72)", border:"2px solid #FFD700", borderRadius:14, padding:"8px 13px", backdropFilter:"blur(6px)" }}>
          <div style={{ color:"#FFD700", fontSize:11, fontWeight:900, marginBottom:4 }}>💎 Diamond Goal</div>
          <div style={{ height:8, background:"rgba(255,255,255,.1)", borderRadius:5, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${Math.min((money/5000000)*100,100)}%`, background:`linear-gradient(90deg,${c.color},#FFD700)`, borderRadius:5, transition:"width .5s" }} />
          </div>
          <div style={{ color:"rgba(255,255,255,.4)", fontSize:10, marginTop:3, textAlign:"right" }}>${Math.min(money,5000000).toLocaleString()} / $5M</div>
          {money >= 5000000 && <div style={{ textAlign:"center", color:"#FFD700", fontWeight:900, fontSize:13, marginTop:4, animation:"pulse 1s infinite" }}>🎉 DIAMOND UNLOCKED! 🎉</div>}
        </div>
      </div>
      <div onTouchStart={joyStart} onTouchMove={joyMove} onTouchEnd={joyEnd} onTouchCancel={joyEnd}
        style={{ position:"absolute", bottom:"calc(env(safe-area-inset-bottom, 0px) + 80px)", left:20, width:110, height:110, borderRadius:"50%", background:"rgba(255,255,255,.15)", border:"3px solid rgba(255,255,255,.3)", zIndex:10, touchAction:"none" }}>
        <div style={{ position:"absolute", left:knob.x-18, top:knob.y-18, width:36, height:36, borderRadius:"50%", background:`${c.color}cc`, border:"2px solid white", boxShadow:`0 0 12px ${c.color}`, pointerEvents:"none" }} />
      </div>
      {nearBld && (
        <button onClick={() => enterFn.current(nearBld)} style={{ position:"absolute", bottom:"calc(env(safe-area-inset-bottom, 0px) + 80px)", right:20, width:90, height:90, borderRadius:"50%", background:`${nearBld.trim}bb`, border:`3px solid ${nearBld.trim}`, color:"white", fontWeight:900, fontSize:14, cursor:"pointer", zIndex:10, boxShadow:`0 0 22px ${nearBld.trim}`, animation:"pulse 1s infinite", lineHeight:1.3, touchAction:"none" }}>
          ENTER
        </button>
      )}
      <div style={{ position:"absolute", bottom:"calc(env(safe-area-inset-bottom, 0px) + 56px)", left:"50%", transform:"translateX(-50%)", color:"rgba(255,255,255,.28)", fontSize:10, background:"rgba(0,0,0,.5)", padding:"3px 11px", borderRadius:8, zIndex:10, pointerEvents:"none", whiteSpace:"nowrap" }}>
        WASD / Arrow Keys to walk · E to enter buildings
      </div>
    </div>
  );
}

function Penthouse({ c, charKey, money, fans, goBack }) {
  const [secret, setSecret] = useState(false);
  const [cityLight, setCityLight] = useState(c.color);
  const pct = Math.min((money/5000000)*100, 100);
  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"linear-gradient(160deg,#0d001f,#050010)", padding:"60px 16px 16px", overflowY:"auto" }}>
      <button onClick={goBack} style={{ position:"absolute", top:12, left:12, background:"rgba(0,0,0,.6)", border:`2px solid ${c.color}`, borderRadius:20, padding:"6px 14px", color:"white", fontSize:13, fontWeight:900, cursor:"pointer" }}>← Hailey City</button>
      <h2 style={{ fontFamily:"Fredoka One", color:c.color, fontSize:26, margin:"0 0 14px", textShadow:`0 0 20px ${c.color}` }}>
        {charKey==="vivi"?"🩷":"💙"} {charKey==="vivi"?"Pink":"Blue"} Penthouse
      </h2>
      {!secret ? (
        <div style={{ width:"100%", maxWidth:380, display:"flex", flexDirection:"column", gap:12, animation:"slideUp .4s ease" }}>
          <div style={{ background:"rgba(255,255,255,.06)", borderRadius:22, padding:18, border:`2px solid ${c.color}44`, textAlign:"center" }}>
            <div style={{ fontSize:52, animation:"floatY 2s ease-in-out infinite" }}>🏠</div>
            <p style={{ color:"white", fontSize:14, margin:"10px 0 4px" }}>Luxury penthouse with indoor 🏊 pool!</p>
            <p style={{ color:c.color+"99", fontSize:13 }}>🐩 Your sparkly {charKey==="vivi"?"pink":"blue"} puppy is here!</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:14 }}>
              <div style={{ background:"rgba(0,0,0,.4)", borderRadius:12, padding:12 }}>
                <div style={{ color:"#FFD700", fontSize:20, fontWeight:900 }}>${money.toLocaleString()}</div>
                <div style={{ color:"rgba(255,255,255,.35)", fontSize:11 }}>💰 Total Earned</div>
              </div>
              <div style={{ background:"rgba(0,0,0,.4)", borderRadius:12, padding:12 }}>
                <div style={{ color:c.color, fontSize:20, fontWeight:900 }}>{fans.toLocaleString()}</div>
                <div style={{ color:"rgba(255,255,255,.35)", fontSize:11 }}>🌟 Fans</div>
              </div>
            </div>
            <div style={{ marginTop:12 }}>
              <div style={{ color:"rgba(255,255,255,.35)", fontSize:11, marginBottom:4 }}>💎 Diamond Goal Progress</div>
              <div style={{ height:10, background:"rgba(255,255,255,.1)", borderRadius:5, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${c.color},#FFD700)`, borderRadius:5, transition:"width .5s" }} />
              </div>
            </div>
          </div>
          <button onClick={() => setSecret(true)} style={{ background:"rgba(0,0,0,.6)", border:`2px dashed ${c.color}`, borderRadius:14, padding:"14px", color:c.color, fontWeight:900, fontSize:14, cursor:"pointer", animation:"pulse 2s infinite" }}>
            🚿 Secret Bathroom Door...
          </button>
        </div>
      ) : (
        <div style={{ width:"100%", maxWidth:400, animation:"slideUp .35s ease" }}>
          <div style={{ background:"linear-gradient(160deg,rgba(0,0,0,.88),rgba(5,0,30,.92))", borderRadius:24, padding:20, border:`2px solid ${c.color}`, boxShadow:`0 0 50px ${c.color}44` }}>
            <h3 style={{ fontFamily:"Fredoka One", color:c.color, margin:"0 0 4px", textAlign:"center" }}>🔬 Secret Tech Base!</h3>
            <p style={{ color:"rgba(255,255,255,.4)", fontSize:12, textAlign:"center", marginBottom:14 }}>Wall-to-wall screens · supercomputers · city controls</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ background:"rgba(0,0,0,.5)", borderRadius:14, padding:14, border:`1px solid ${c.color}33` }}>
                <div style={{ color:"rgba(255,255,255,.4)", fontSize:12, marginBottom:6 }}>📡 Fan Monitor — Live Feed</div>
                <div style={{ color:c.color, fontSize:28, fontWeight:900, textAlign:"center" }}>{fans.toLocaleString()} 🌟</div>
              </div>
              <div style={{ background:"rgba(0,0,0,.5)", borderRadius:14, padding:14, border:`1px solid ${c.color}33` }}>
                <div style={{ color:"rgba(255,255,255,.4)", fontSize:12, marginBottom:8 }}>💡 City Lighting Control</div>
                <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
                  {[["🩷","#FF1493"],["💙","#1E90FF"],["💛","#FFD700"],["💜","#9B59B6"],["🤍","#DDDDDD"]].map(([em,col]) => (
                    <button key={col} onClick={() => setCityLight(col)} style={{ fontSize:28, background:cityLight===col?`${col}33`:"none", border:`2px solid ${cityLight===col?col:"transparent"}`, borderRadius:10, cursor:"pointer", padding:4, filter:`drop-shadow(0 0 6px ${col})` }}>{em}</button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setSecret(false)} style={{ marginTop:12, background:"transparent", border:"none", color:"rgba(255,255,255,.3)", fontSize:13, cursor:"pointer", width:"100%" }}>🚪 Close the door</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stadium({ c, earn, goBack }) {
  const [phase, setPhase] = useState("ready");
  const [stars, setStars] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const scoreRef = useRef(0), comboRef = useRef(0);

  const start = () => { setPhase("go"); setScore(0); setCombo(0); scoreRef.current=0; comboRef.current=0; setTimeLeft(15); setStars([]); };
  useEffect(() => {
    if (phase !== "go") return;
    const iv = setInterval(() => {
      setStars(prev => {
        if (prev.filter(s => !s.hit).length > 10) return prev;
        return [...prev.filter(s => !s.hit), { id:Date.now()+Math.random(), y:8+Math.random()*58, dur:2+Math.random()*2.2, size:32+Math.random()*20, emoji:STAGE[Math.floor(Math.random()*STAGE.length)], pts:Math.floor(Math.random()*350)+150, hit:false }];
      });
    }, 500);
    return () => clearInterval(iv);
  }, [phase]);
  useEffect(() => {
    if (phase !== "go") return;
    const iv = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { setPhase("done"); earn(scoreRef.current*7, Math.floor(scoreRef.current/4),"from the show! 🎤"); return 0; } return t-1; });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);
  const hit = (id, pts) => {
    comboRef.current++;
    const m = comboRef.current>=8?5:comboRef.current>=5?3:comboRef.current>=3?2:1;
    const earned = pts*m; scoreRef.current += earned;
    setScore(s => s+earned); setCombo(comboRef.current);
    setStars(prev => prev.map(s => s.id===id?{...s,hit:true}:s));
  };

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"linear-gradient(160deg,#060020,#150050,#060020)", padding:"55px 16px 16px" }}>
      <button onClick={goBack} style={{ position:"absolute", top:12, left:12, background:"rgba(0,0,0,.6)", border:`2px solid ${c.color}`, borderRadius:20, padding:"6px 14px", color:"white", fontSize:13, fontWeight:900, cursor:"pointer" }}>← City</button>
      <h2 style={{ fontFamily:"Fredoka One", color:"#FFD700", fontSize:26, margin:"0 0 10px", textShadow:"0 0 25px #FFD700" }}>🏟️ The Stadium</h2>
      {phase === "ready" && (
        <div style={{ textAlign:"center", animation:"slideUp .4s ease" }}>
          <div style={{ fontSize:68, animation:"floatY 1.5s ease-in-out infinite" }}>{c.emoji}</div>
          <p style={{ color:"white", fontSize:15, margin:"14px 0 8px", lineHeight:1.7 }}>Tap flying emojis as they zoom across the stage!<br /><span style={{ color:"#FFD700", fontWeight:900 }}>Build combos for MEGA multipliers! 🔥</span></p>
          <button onClick={start} style={{ background:`linear-gradient(135deg,${c.color},#FFD700,${c.color})`, backgroundSize:"200%", border:"none", borderRadius:28, padding:"16px 44px", color:"white", fontFamily:"Fredoka One", fontSize:22, cursor:"pointer", boxShadow:`0 8px 35px ${c.color}88`, animation:"pulse 1.4s ease-in-out infinite" }}>⭐ START THE SHOW ⭐</button>
        </div>
      )}
      {phase === "go" && (
        <div style={{ width:"100%", maxWidth:520 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <div style={{ color:"#FFD700", fontWeight:900, fontSize:20 }}>⏱️ {timeLeft}s</div>
            <div style={{ color:"white", fontWeight:900, fontSize:15 }}>🎯 {score.toLocaleString()}</div>
            {combo >= 3 && <div style={{ color:c.color, fontWeight:900, fontSize:14, animation:"pulse .4s infinite" }}>🔥 x{combo>=8?5:combo>=5?3:2} COMBO!</div>}
          </div>
          <div style={{ width:"100%", height:290, borderRadius:22, overflow:"hidden", position:"relative", background:"linear-gradient(180deg,#040018 0%,#100040 50%,#1a0060 100%)", border:`3px solid ${c.color}`, boxShadow:`0 0 50px ${c.color}44` }}>
            {stars.map(s => !s.hit && (
              <button key={s.id} onClick={() => hit(s.id, s.pts)} style={{ position:"absolute", top:`${s.y}%`, fontSize:s.size, background:"none", border:"none", cursor:"pointer", padding:0, animation:`flyLeft ${s.dur}s linear forwards`, filter:`drop-shadow(0 0 10px ${c.color})`, zIndex:10, lineHeight:1 }}>{s.emoji}</button>
            ))}
          </div>
        </div>
      )}
      {phase === "done" && (
        <div style={{ textAlign:"center", animation:"slideUp .4s ease" }}>
          <div style={{ fontSize:60, animation:"floatY 1s ease-in-out infinite" }}>🎉</div>
          <h3 style={{ fontFamily:"Fredoka One", color:"#FFD700", fontSize:26, margin:"8px 0" }}>Amazing Performance!</h3>
          <div style={{ color:"#FFD700", fontSize:22, fontWeight:900, marginBottom:20 }}>💰 Earned: ${(score*7).toLocaleString()}!</div>
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <button onClick={start} style={{ background:`linear-gradient(135deg,${c.color},#FFD700)`, border:"none", borderRadius:22, padding:"12px 22px", color:"white", fontFamily:"Nunito", fontWeight:900, fontSize:15, cursor:"pointer" }}>🎤 Again!</button>
            <button onClick={goBack} style={{ background:"rgba(255,255,255,.08)", border:"2px solid rgba(255,255,255,.2)", borderRadius:22, padding:"12px 22px", color:"white", fontFamily:"Nunito", fontWeight:700, fontSize:15, cursor:"pointer" }}>🏙️ City</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Restaurant({ c, earn, goBack }) {
  const [phase, setPhase] = useState("ready");
  const [orders, setOrders] = useState([]);
  const [served, setServed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const servedRef = useRef(0);
  const start = () => { setPhase("go"); setOrders([]); setServed(0); servedRef.current=0; setTimeLeft(25); };
  useEffect(() => {
    if (phase !== "go") return;
    const iv = setInterval(() => {
      setOrders(prev => { if (prev.length >= 6) return prev; const m = MENU[Math.floor(Math.random()*MENU.length)]; return [...prev, { id:Date.now()+Math.random(), ...m, fresh:10 }]; });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);
  useEffect(() => {
    if (phase !== "go") return;
    const iv = setInterval(() => { setOrders(prev => prev.map(o => ({...o,fresh:o.fresh-.28})).filter(o => o.fresh > 0)); }, 250);
    return () => clearInterval(iv);
  }, [phase]);
  useEffect(() => {
    if (phase !== "go") return;
    const iv = setInterval(() => { setTimeLeft(t => { if (t <= 1) { setPhase("done"); earn(servedRef.current*180,0,"in tips! 💁"); return 0; } return t-1; }); }, 1000);
    return () => clearInterval(iv);
  }, [phase]);
  const serve = id => { servedRef.current++; setServed(s => s+1); setOrders(prev => prev.filter(o => o.id !== id)); };

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"linear-gradient(160deg,#1a0400,#0d0200)", padding:"55px 16px 16px" }}>
      <button onClick={goBack} style={{ position:"absolute", top:12, left:12, background:"rgba(0,0,0,.6)", border:"2px solid #FF6B35", borderRadius:20, padding:"6px 14px", color:"white", fontSize:13, fontWeight:900, cursor:"pointer" }}>← City</button>
      <h2 style={{ fontFamily:"Fredoka One", color:"#FF6B35", fontSize:24, margin:"0 0 8px", textShadow:"0 0 25px #FF6B35" }}>🍽️ Fancy Restaurant</h2>
      {phase === "ready" && (
        <div style={{ textAlign:"center", animation:"slideUp .4s ease", maxWidth:360 }}>
          <div style={{ fontSize:64, animation:"floatY 1.6s ease-in-out infinite" }}>👗</div>
          <p style={{ color:"white", fontSize:15, margin:"12px 0 6px", lineHeight:1.6 }}>Wearing the <span style={{ color:"#FFD700", fontWeight:900 }}>most expensive dress ever!</span></p>
          <button onClick={start} style={{ background:"linear-gradient(135deg,#FF6B35,#FF1493)", border:"none", borderRadius:28, padding:"14px 36px", color:"white", fontFamily:"Fredoka One", fontSize:20, cursor:"pointer", animation:"pulse 1.4s ease-in-out infinite" }}>👗 Start Your Shift!</button>
        </div>
      )}
      {phase === "go" && (
        <div style={{ width:"100%", maxWidth:480 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <div style={{ color:"#FFD700", fontWeight:900, fontSize:18 }}>⏱️ {timeLeft}s</div>
            <div style={{ color:"#2ECC71", fontWeight:900 }}>✅ {served} served</div>
          </div>
          <div style={{ background:"rgba(255,255,255,.04)", borderRadius:22, padding:14, minHeight:220, border:"2px solid rgba(255,107,53,.35)" }}>
            {orders.length === 0
              ? <p style={{ color:"rgba(255,255,255,.22)", textAlign:"center", paddingTop:60 }}>Waiting for orders… 🍽️</p>
              : <div style={{ display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center" }}>
                  {orders.map(o => (
                    <button key={o.id} onClick={() => serve(o.id)} style={{ background:"rgba(0,0,0,.45)", border:`2px solid hsl(${Math.max(0,o.fresh*12)},75%,55%)`, borderRadius:16, padding:"10px 12px", cursor:"pointer", minWidth:76 }}>
                      <div style={{ fontSize:32 }}>{o.emoji}</div>
                      <div style={{ color:"white", fontSize:10, fontWeight:700, marginTop:2 }}>{o.name}</div>
                      <div style={{ color:"#FFD700", fontSize:10 }}>+${o.pts}</div>
                    </button>
                  ))}
                </div>
            }
          </div>
        </div>
      )}
      {phase === "done" && (
        <div style={{ textAlign:"center", animation:"slideUp .4s ease" }}>
          <div style={{ fontSize:60, animation:"floatY 1s ease-in-out infinite" }}>💰</div>
          <h3 style={{ fontFamily:"Fredoka One", color:"#FF6B35", fontSize:24, margin:"8px 0" }}>Great Shift!</h3>
          <div style={{ color:"#FFD700", fontSize:22, fontWeight:900, marginBottom:20 }}>💰 Tips: ${(served*180).toLocaleString()}!</div>
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <button onClick={start} style={{ background:"linear-gradient(135deg,#FF6B35,#FF1493)", border:"none", borderRadius:22, padding:"12px 22px", color:"white", fontFamily:"Nunito", fontWeight:900, fontSize:15, cursor:"pointer" }}>👗 Again!</button>
            <button onClick={goBack} style={{ background:"rgba(255,255,255,.08)", border:"2px solid rgba(255,255,255,.2)", borderRadius:22, padding:"12px 22px", color:"white", fontFamily:"Nunito", fontWeight:700, fontSize:15, cursor:"pointer" }}>🏙️ City</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Shop({ c, money, setMoney, goBack, showNotif }) {
  const [owned, setOwned] = useState([]);
  const buy = item => {
    if (money >= item.price && !owned.includes(item.id)) {
      setMoney(m => m - item.price); setOwned(p => [...p, item.id]);
      showNotif(`${item.emoji} ${item.name}!`, "🎉");
    }
  };
  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", background:"linear-gradient(160deg,#0a0018,#050010)", padding:"55px 14px 20px", overflowY:"auto" }}>
      <button onClick={goBack} style={{ position:"absolute", top:12, left:12, background:"rgba(0,0,0,.6)", border:"2px solid #CC66FF", borderRadius:20, padding:"6px 14px", color:"white", fontSize:13, fontWeight:900, cursor:"pointer" }}>← City</button>
      <h2 style={{ fontFamily:"Fredoka One", color:"#CC66FF", fontSize:24, margin:"0 0 2px", textShadow:"0 0 20px #CC66FF" }}>🛍️ Half & Half Boutique</h2>
      <p style={{ color:"rgba(255,255,255,.38)", fontSize:13, margin:"0 0 14px" }}>💰 Budget: <span style={{ color:"#FFD700", fontWeight:900 }}>${money.toLocaleString()}</span></p>
      <div style={{ width:"100%", maxWidth:440, display:"flex", flexDirection:"column", gap:10 }}>
        {SHOP_ITEMS.map(item => {
          const isOwned = owned.includes(item.id);
          const canAfford = money >= item.price;
          return (
            <div key={item.id} style={{ background:isOwned?`${item.color}18`:"rgba(255,255,255,.04)", border:`2px solid ${isOwned?item.color:"rgba(255,255,255,.1)"}`, borderRadius:18, padding:"11px 13px", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ fontSize:34, minWidth:44, textAlign:"center" }}>{item.emoji}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:isOwned?item.color:"white", fontWeight:900, fontSize:12 }}>{item.name}</div>
                <div style={{ color:"rgba(255,255,255,.38)", fontSize:11 }}>{item.sub}</div>
                <div style={{ color:"#FFD700", fontWeight:900, fontSize:12, marginTop:1 }}>${item.price.toLocaleString()}</div>
              </div>
              {isOwned
                ? <div style={{ fontSize:20, color:item.color }}>✅</div>
                : <button onClick={() => buy(item)} disabled={!canAfford} style={{ background:canAfford?`linear-gradient(135deg,${item.color},#FFD700)`:"rgba(255,255,255,.07)", border:"none", borderRadius:12, padding:"8px 12px", color:canAfford?"white":"rgba(255,255,255,.2)", fontWeight:900, fontSize:12, cursor:canAfford?"pointer":"not-allowed" }}>
                    {canAfford?"BUY!":"🔒"}
                  </button>
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}
