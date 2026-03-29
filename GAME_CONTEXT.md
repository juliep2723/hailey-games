# Hailey City RP — Game Context for Millie

This file describes what Millie can change in the game when Hailey asks.

## Characters

There are two playable characters defined in `app/Game.jsx`:

```js
const CHARS = {
  vivi: { name:"Vivi", color:"#FF1493", hair:"#BB006F", shoe:"#FF69B4", skin:"#FFD5A8", emoji:"👑" },
  lili: { name:"Lili", color:"#1E90FF", hair:"#005FCC", shoe:"#87CEEB", skin:"#FFD5A8", emoji:"⭐" },
};
```

### Changeable fields per character:
- `color` — main body/outfit color (hex)
- `hair` — hair color (hex)
- `shoe` — shoe/boot color (hex)
- `skin` — skin tone (hex, usually leave as default)
- `emoji` — floating icon above their head (any emoji)
- `name` — display name shown on nameplate

### Common color requests:
- "pink" → #FF69B4
- "hot pink" → #FF1493
- "purple" → #9B59B6
- "blue" → #1E90FF
- "light blue" → #87CEEB
- "yellow" → #FFD700
- "green" → #2ECC71
- "red" → #E74C3C
- "orange" → #FF6B35
- "white" → #FFFFFF
- "black" → #1a1a1a

## Buildings

Buildings are defined in the `BLDS` function in `app/Game.jsx`:

```js
{ id:"stadium",    label:"The Stadium",       trim:"#FFD700", emoji:"🏟️" },
{ id:"shop",       label:"Half & Half Shop",  trim:"#CC66FF", emoji:"🛍️" },
{ id:"tower",      label:"Penthouse Tower",   trim:"#FF1493", emoji:"🏙️" },
{ id:"boba",       label:"Boba Shop",         trim:"#F4A018", emoji:"🧋" },
{ id:"restaurant", label:"Fancy Restaurant",  trim:"#FF6B35", emoji:"🍽️" },
```

### Changeable fields per building:
- `label` — display name shown on the building
- `trim` — glow/border color (hex)
- `emoji` — large icon displayed on building front

## Rules for Millie (the AI)
1. Only change `app/Game.jsx` in the `hailey-games` repo
2. Apply the minimum change to fulfil the request
3. Preserve all other code exactly
4. Commit message should be friendly: e.g. "feat: Hailey made Vivi pink! 💖"
5. After committing, tell Hailey it's live in about 30 seconds
