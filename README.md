# 🍪 Cookie Clicker - Full Stack Incremental Game

A modern, full-featured Cookie Clicker clone built with Next.js 14, React, TypeScript, Tailwind CSS, and Supabase. Features include real-time leaderboards, offline progression, prestige system, achievements, and cloud save functionality.

## ✨ Features

### Core Gameplay
- **Click to earn cookies** - Click the giant cookie to earn cookies manually
- **Automated production** - Buy buildings that generate cookies automatically
- **Upgrades system** - Purchase upgrades to boost production
- **Prestige mechanic** - Reset progress for permanent multipliers
- **Achievements** - Unlock achievements by reaching milestones

### Online Features
- **Cloud saves** - Your progress syncs across devices
- **Real-time leaderboard** - Compete with other players
- **Offline progression** - Earn cookies even when not playing (up to 24 hours)
- **Guest mode** - Play without an account (local storage only)

### Technical Features
- Server-side rendering with Next.js 14
- Type-safe development with TypeScript
- State management with Zustand
- Real-time updates with Supabase Realtime
- Responsive design with Tailwind CSS
- Row Level Security (RLS) for data protection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works great)

### 1. Clone and Install

\`\`\`bash
git clone <your-repo-url>
cd cookie-clicker
npm install
\`\`\`

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Project Settings → API
3. Copy your project URL and anon/public key
4. Go to SQL Editor and run the contents of `supabase-schema.sql`
5. Enable Email authentication in Authentication → Providers
6. (Optional) Enable Google OAuth in Authentication → Providers

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## 📁 Project Structure

\`\`\`
cookie-clicker/
├── app/                      # Next.js 14 app directory
│   ├── game/                # Main game page
│   ├── leaderboard/         # Leaderboard page
│   ├── login/               # Authentication page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page (redirects to login)
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── Achievements.tsx     # Achievement display
│   ├── AuthForm.tsx         # Login/signup form
│   ├── BuildingShop.tsx     # Building purchase interface
│   ├── CookieButton.tsx     # Main clickable cookie
│   ├── PrestigeModal.tsx    # Prestige confirmation modal
│   ├── StatsDisplay.tsx     # Game statistics
│   └── UpgradeShop.tsx      # Upgrade purchase interface
├── lib/                     # Utilities and configuration
│   ├── gameData.ts          # Game constants and initial data
│   ├── store.ts             # Zustand state management
│   └── supabase.ts          # Supabase client configuration
├── types/                   # TypeScript type definitions
│   └── game.ts              # Game-related types
├── public/                  # Static assets
├── supabase-schema.sql      # Database schema
└── package.json             # Dependencies
\`\`\`

## 🎮 Game Mechanics

### Buildings
Buildings generate cookies automatically. Each building has:
- **Base cost** - Initial purchase price
- **Base production** - Cookies per second
- **Cost scaling** - Price increases by 15% per purchase

### Upgrades
Upgrades provide permanent multipliers to production:
- Some upgrades boost specific building types
- Others provide global production boosts
- Upgrades unlock based on total cookies baked

### Prestige System
- Unlock at 1 trillion total cookies
- Reset all progress (cookies, buildings, upgrades)
- Gain permanent +50% multiplier per prestige level
- Keep achievements

### Offline Progress
- Calculates earnings based on CPS while away
- Capped at 24 hours
- Shown in a welcome modal on return

### Achievements
- Unlock by meeting specific conditions
- Track your progress through the game
- Persist through prestige

## 🗄️ Database Schema

### game_state table
Stores individual player progress:
- cookies, total_cookies, cps
- buildings (JSONB array)
- upgrades (JSONB array)
- achievements (JSONB array)
- prestige_level, multiplier
- last_active timestamp

### leaderboard table
Public leaderboard entries:
- username
- total_cookies
- prestige_level
- Real-time updates via Supabase Realtime

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only read/write their own game state
- Leaderboard is publicly readable
- Authentication required for cloud saves
- Guest mode uses localStorage only

## 🎨 Customization

### Adding New Buildings

Edit `lib/gameData.ts`:

\`\`\`typescript
{
  id: 'your-building',
  name: 'Your Building',
  baseCost: 1000,
  baseProduction: 10,
  count: 0,
  description: 'Does something cool',
  icon: '🏠',
}
\`\`\`

### Adding New Upgrades

Edit `lib/gameData.ts`:

\`\`\`typescript
{
  id: 'your-upgrade',
  name: 'Your Upgrade',
  cost: 5000,
  description: 'Boosts production',
  multiplier: 2,
  purchased: false,
  unlockCondition: 1000,
  icon: '⚡',
}
\`\`\`

### Adding New Achievements

Edit `lib/gameData.ts`:

\`\`\`typescript
{
  id: 'your-achievement',
  name: 'Your Achievement',
  description: 'Do something impressive',
  condition: (state) => state.totalCookies >= 1000000,
  unlocked: false,
  icon: '🏆',
}
\`\`\`

## 📱 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

Works on any Node.js hosting platform:
- Netlify
- Railway
- Render
- AWS
- Google Cloud

## 🐛 Troubleshooting

### "Cannot read properties of undefined"
- Check that environment variables are set correctly
- Ensure Supabase project is created and schema is applied

### Leaderboard not updating
- Verify Supabase Realtime is enabled in project settings
- Check RLS policies are correctly configured

### Offline progress not working
- Ensure `last_active` timestamp is being saved
- Check that `calculateOfflineProgress` is being called on load

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Credits

Inspired by the original Cookie Clicker by Orteil.

Built with:
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Zustand](https://github.com/pmndrs/zustand)

## 🚧 Future Enhancements

- [ ] Golden cookies with random bonuses
- [ ] Seasonal events and themes
- [ ] Friend system and cookie gifting
- [ ] Mobile app version
- [ ] More building types and upgrades
- [ ] Sound effects and music
- [ ] Advanced statistics and graphs
- [ ] Cookie collection/variants

---

Happy baking! 🍪
