# ChronoSync 🌀

yo! this is ChronoSync. I built this for the Stardance Hackathon because timezones are literally the worst part of the internet and i was tired of googling "what time is 3pm est in tokyo".

it's basically a big slider that controls time for everyone on your team at once. no math, no accounts, just pure vibes.

## How it works

it's super simple:
1. drag the master clock slider
2. see what time it is for everyone else instantly
3. copy the link and send it to your team (it saves your team in the URL!)

### fun features i added:
- **Time Travel**: smash the "🌀 Time Travel" button if you can't decide when to meet and want the app to violently pick a random time for you.
- **Auto-Emojis**: if you add a person without an emoji, the app assigns them a random cool one because everything is better with emojis.
- **Day/Night Colors**: the cards change color depending on if it's day, evening, or night for that person so you don't accidentally schedule a call at 3am.

## Tech stack

i wanted to keep this super raw and fast, so there are NO frameworks.
- Vanilla HTML/JS
- Custom neo-brutalist CSS (thick borders, loud colors)
- Vite for dev server
- `Intl.DateTimeFormat` for the native timezone math (so it doesn't break)

## How to run it

if you wanna mess around with it locally:

```bash
# clone it
git clone https://github.com/Yugpatel-09/chrono-Sync.git
cd chrono-Sync

# install the thing
npm install

# run it
npm run dev
```

then go to `http://localhost:5173/`

stay frosty 🥶
