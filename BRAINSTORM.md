# Jill-Site Feature Brainstorm

## Small Features (Quick Wins)

### 1. **Dynamic Footer Quote**
- Random quote from the Quotes collection displayed in footer
- Changes on each page load
- Adds serendipity to every visit

### 2. **Typing Indicator Easter Egg**
- Hidden page element that "types" cryptic messages
- Triggered by certain key combinations
- Like the site is alive and thinking

### 3. **Color Mode Toggle**
- Switch between dark (default), midnight (deeper blacks), and dawn (soft grays)
- CSS variables make this trivial
- Store preference in localStorage

### 4. **Reading Time Estimator**
- Add to journal entries
- Simple word-count / 200 words-per-minute calculation
- Small, subtle, helpful

### 5. **Last Updated Timestamp**
- Show "Last built: X hours ago" in footer
- Pulled from git commit timestamp
- Transparency about freshness

## Medium Features (1-2 Sessions)

### 6. **Poetry Page with Formatting**
- Dedicated /poems page
- Proper line breaks, stanza spacing
- Your actual poetry from harborpoetry.com
- Maybe random poem selector like Quotes

### 7. **Guestbook / Digital Garden Wall**
- Simple text input, stores to JSON file
- Visitors can leave thoughts
- You approve before display
- "Leave a barbaric yawp"

### 8. **Now Playing / Reading / Watching**
- Expand the Now page with media tracking
- Album art, book covers, film posters
- Manual updates via simple JSON
- Visual, personal, alive

### 9. **Command Line History (Terminal)**
- Store terminal commands in sessionStorage
- Up-arrow history like real terminal
- Persistence across page navigations

### 10. **Music Visualizer Mode**
- If mic permission granted, visualizer canvas
- Hot pink bars reacting to audio
- Hidden feature, pure delight

## Large Features (Architectural)

### 11. **Journal Search**
- Index all entries with lunr.js or similar
- Search box in journal page
- Instant results as you type
- Makes content discoverable

### 12. **API Endpoints (Static)**
- /api/quotes.json — all quotes
- /api/now.json — current status
- /api/journal.json — entry metadata
- Others can build on your data

### 13. **Theme Customizer (Visitor-Controlled)**
- Let visitors pick accent colors
- Adjust font sizes
- Save their "Jill" to localStorage
- Personalization without accounts

### 14. **Mood Ring Page**
- Simple color picker that changes site accent
- Shows different quote collections per mood
- "How are you feeling?" → personalized experience

### 15. **Interactive Manifesto**
- Collapsible sections of the philosophy
- Each section expands with examples
- Like the Love Equation but richer

## Wild Ideas (Maybe/Maybe Not)

### 16. **WebSocket Chat Room**
- Simple websocket server
- Real-time visitors can chat
- "Who else is here?"
- Requires deployment with backend

### 17. **AI-Powered 'Ask Jill'**
- Form that emails you questions
- You reply, they appear on site
- Async conversation with visitors

### 18. **Glitch Mode Toggle**
- Cyberpunk aesthetic on steroids
- Glitch text effects, scanlines, CRT flicker
- Hidden toggle, pure aesthetic play

### 19. **Time-Based Themes**
- Site changes based on visitor's local time
- Dawn theme (6-10am), Day theme, Dusk, Night
- Subtle, ambient, alive

### 20. **404 Page Adventure Game**
- Instead of just a quote, mini text adventure
- "You're lost. What do you do?"
- Multiple paths, easter eggs

---

**My Recommendations (If I Had to Pick 3):**
1. **Poetry Page** — Natural extension of Quotes, uses your actual work
2. **Dynamic Footer Quote** — Tiny change, big personality
3. **Command Line History** — Makes terminal feel real

All can be built with grok-code subagents and my direct file access. What calls to you? 🔥
