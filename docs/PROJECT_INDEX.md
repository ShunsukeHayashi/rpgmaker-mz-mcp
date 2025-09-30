# RPG Maker MZ Project Index
**Game Title**: Dragon's Awakening
**Version**: RPGMZ 1.9.1
**Last Updated**: 2025-10-01

---

## 📁 Project Structure

### Maps (4)
| ID | Name | Size | Events | Description |
|---|---|---|---|---|
| 1 | MAP001 | Default | 0 | Initial map |
| 2 | Starting Village | 20x15 | 2 | Player starting location |
| 3 | Dragon's Lair | 25x20 | 1 | Final boss area |
| 4 | Forest Path | 30x20 | 1 | Connecting path with treasure |

---

## 🎭 Characters & Classes

### Actors
- **Dragon Knight** (ID: 2) - Main protagonist
- **Mage** (ID: 3) - Magic user companion

### Classes
- **Dragon Slayer** (ID: 2) - Melee combat specialist
- **Fire Wizard** (ID: 3) - Elemental magic specialist

---

## ⚔️ Skills & Items

### Skills
| ID | Name | Description |
|---|---|---|
| 8 | Dragon Slash | Powerful physical attack |
| 9 | Fire Storm | Area fire magic |
| 10 | Holy Shield | Defensive buff |

### Items
| ID | Name | Type |
|---|---|---|
| 5 | Dragon Scale | Key item |
| 6 | Ancient Sword | Weapon |
| 7 | Magic Potion | Consumable |

---

## 🎬 Events & Game Flow

### Starting Village (Map 2)
- **Event 1: Village Elder** (10, 7)
  - Quest giver
  - Explains dragon threat
  - Directs player to Forest Path

- **Event 2: Transfer to Forest** (19, 7)
  - Transfers player to Map 4 (Forest Path)

### Dragon's Lair (Map 3)
- **Event 1: Ancient Dragon** (12, 10)
  - Boss encounter

### Forest Path (Map 4)
- **Event 1: Treasure Chest** (15, 10)
  - Grants: Ancient Sword
  - One-time pickup

---

## 🔧 Plugins
- AltMenuScreen.js
- AltSaveScreen.js
- ButtonPicture.js
- TextPicture.js

---

## 📚 Registered Resources

### Templates
- **dragon_fantasy_theme**
  - Core game theme and setting
  - Genre: Fantasy
  - Tags: fantasy, dragon, rpg, theme

### Data Resources
- **standard_map_sizes**
  - Recommended dimensions for map types
  - Tags: map, design, standards

- **event_command_codes**
  - RPG Maker MZ command reference
  - Tags: events, commands, reference

---

## 📝 Prompt Templates

### create_npc_dialogue
Generate NPC dialogue with context
- Variables: npc_name, location, role, theme, tone, information
- References: dragon_fantasy_theme

### create_map_with_theme
Create themed maps
- Variables: map_name, map_type, purpose, size, theme, features
- References: dragon_fantasy_theme, standard_map_sizes

### add_quest_event
Add quest events
- Variables: map_id, x, y, quest_description, reward
- References: event_command_codes

---

## 🎯 Game Design Patterns

### Story Flow
1. **Start** → Starting Village (Map 2)
2. **Quest** → Village Elder explains mission
3. **Journey** → Transfer to Forest Path (Map 4)
4. **Treasure** → Find Ancient Sword
5. **Boss** → Dragon's Lair (Map 3)
6. **Victory** → Defeat Ancient Dragon

### Event Command Reference
- `101` - Show Text
- `401` - Text Data
- `201` - Transfer Player
- `125` - Change Items
- `127` - Change Weapons
- `301` - Start Battle
- `121` - Control Switches
- `122` - Control Variables

---

## 📊 Project Statistics
- **Total Maps**: 4
- **Total Events**: 4
- **Total Actors**: 2
- **Total Classes**: 2
- **Total Skills**: 3
- **Total Items**: 3
- **Registered Resources**: 3
- **Prompt Templates**: 3

---

## 🚀 Quick Commands

### Development
```bash
# Open project in RPG Maker MZ
open Game.rpgproject

# Test play
# Use F12 in RPG Maker MZ editor
```

### MCP Commands
```javascript
// Generate project context
mcp__rpgmaker-mz__generate_project_context

// Analyze structure
mcp__rpgmaker-mz__analyze_project_structure

// Search database
mcp__rpgmaker-mz__search_database

// List resources
mcp__rpgmaker-mz__list_resources
```

---

## 📌 Notes
- Project uses standard RPG Maker MZ structure
- All custom resources stored in `.rpgmz_resources/`
- Event commands follow RPG Maker MZ conventions
- Game designed for 1-2 hour playtime
