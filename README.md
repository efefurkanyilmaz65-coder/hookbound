# Hookbound

A browser-based mining game where you grab gold and gems from underground with a swinging hook.

## Problem and Target User

Players who enjoy classic arcade-style skill games often get bored of them quickly: every level feels the same, the player has very few meaningful decisions to make, and there is little reason to play again.

Hookbound keeps the simple, instantly understandable "fire the hook at the right moment" gameplay, but aims to solve this problem by adding systems that give the game more depth. On every throw, the player decides between value and time, since heavier objects take longer to pull up. In future versions, players will choose between characters with different abilities and buy different hooks between levels, building their own strategy so that every run feels different.

The game only requires a web browser. No download, sign-up, or installation needed.

## Board

https://github.com/users/efefurkanyilmaz65-coder/projects/2

## Play Online

https://efefurkanyilmaz65-coder.github.io/hookbound/

## How to Run

No installation is needed. The game runs in any modern web browser.

**Option 1: Play online**
Open the link in the "Play Online" section above.

**Option 2: Run locally**
1. Clone the repository: `git clone https://github.com/efefurkanyilmaz65-coder/hookbound.git`
2. Open the `hookbound` folder and double-click `index.html`.
   (Alternatively, open the folder in VS Code and click "Go Live" with the Live Server extension.)

## Controls

| Action | Key |
|---|---|
| Fire the hook | Space / Down arrow / Mouse click / Tap |

## Features

### 1. Swinging hook ([#2](https://github.com/efefurkanyilmaz65-coder/hookbound/issues/2))
The hook swings left and right under the miner and shoots out in the direction it is pointing.

**How to try it:**
1. Open the game. The hook swings continuously left and right.
2. Press **Space** (or click). The hook shoots out in its current direction.
3. Fire it toward an empty area. When it reaches the edge of the screen, it returns to the miner and starts swinging again.

### 2. Grab objects with weight ([#3](https://github.com/efefurkanyilmaz65-coder/hookbound/issues/3))
Gold, rocks and a diamond are placed randomly underground. The hook grabs the object it touches and pulls it up. Heavier objects are pulled more slowly.

**How to try it:**
1. Fire the hook at a **small gold** nugget and watch how fast it comes up.
2. Then fire it at a **big gold** nugget (or a big rock). It comes up noticeably more slowly.
3. When an object reaches the top, it disappears from the screen.
4. Refresh the page to get a new random layout.