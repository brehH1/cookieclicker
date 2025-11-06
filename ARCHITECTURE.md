# 🏗️ Architecture Documentation

## System Overview

Cookie Clicker is a full-stack web application built with modern technologies, featuring real-time data synchronization, offline capabilities, and scalable architecture.

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - Row Level Security (RLS)

### Infrastructure
- **Vercel** - Hosting and CI/CD (recommended)
- **GitHub** - Version control

## Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────┐
│                   Client Browser                     │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         Next.js App (React)                │    │
│  │                                            │    │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────┐ │    │
│  │  │  Pages   │  │Components│  │ Zustand │ │    │
│  │  │          │  │          │  │  Store  │ │    │
│  │  │ /game    │  │ Cookie   │  │         │ │    │
│  │  │ /login   │  │ Building │  │  State  │ │    │
│  │  │ /board   │  │ Upgrade  │  │ Actions │ │    │
│  │  └──────────┘  └──────────┘  └─────────┘ │    │
│  │                                            │    │
│  │  ┌────────────────────────────────────┐   │    │
│  │  │   Supabase Client (Browser)        │   │    │
│  │  │   - Auth                           │   │    │
│  │  │   - Real-time subscriptions        │   │    │
│  │  │   - Database queries               │   │    │
│  │  └────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS / WebSocket
                       │
┌──────────────────────▼──────────────────────────────┐
│                  Supabase Platform                   │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         PostgreSQL Database                │    │
│  │                                            │    │
│  │  Tables:                                   │    │
│  │  • game_state                              │    │
│  │  • leaderboard                             │    │
│  │  • auth.users (managed)                    │    │
│  │                                            │    │
│  │  Features:                                 │    │
│  │  • Row Level Security                      │    │
│  │  • Triggers & Functions                    │    │
│  │  • Real-time Change Data Capture           │    │
│  │  • Indexes for performance                 │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         Authentication Service             │    │
│  │  • Email/Password                          │    │
│  │  • OAuth (Google)                          │    │
│  │  • JWT tokens                              │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         Real-time Engine                   │    │
│  │  • WebSocket connections                   │    │
│  │  • Leaderboard updates                     │    │
│  │  • Live game state sync                    │    │
│  └────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
\`\`\`

## Data Flow

### 1. Cookie Click Flow
\`\`\`
User clicks cookie
    ↓
CookieButton component triggers
    ↓
Zustand store updates state
    ↓
React re-renders affected components
    ↓
Auto-save triggers every 10 seconds
    ↓
Data sent to Supabase
\`\`\`

### 2. Building Purchase Flow
\`\`\`
User clicks building
    ↓
BuildingShop validates cost
    ↓
Zustand store deducts cookies
    ↓
Building count incremented
    ↓
CPS recalculated
    ↓
UI updates reactively
    ↓
Changes auto-saved to Supabase
\`\`\`

### 3. Offline Progress Flow
\`\`\`
User opens app
    ↓
loadGame() called
    ↓
Fetch last_active timestamp from DB
    ↓
Calculate elapsed time
    ↓
Calculate cookies earned (CPS × time)
    ↓
Add cookies to player account
    ↓
Show welcome modal with earnings
\`\`\`

### 4. Prestige Flow
\`\`\`
User reaches 1T cookies
    ↓
Prestige button appears
    ↓
User confirms reset
    ↓
Calculate new multiplier
    ↓
Reset cookies, buildings, upgrades
    ↓
Keep achievements
    ↓
Increment prestige level
    ↓
Save new state to database
    ↓
Update leaderboard
\`\`\`

## State Management

### Zustand Store Structure

\`\`\`typescript
{
  // Core game state
  cookies: number,
  totalCookies: number,
  cps: number,
  clickPower: number,
  
  // Game entities
  buildings: Building[],
  upgrades: Upgrade[],
  achievements: Achievement[],
  
  // Prestige system
  prestigeLevel: number,
  prestigeMultiplier: number,
  
  // Metadata
  lastActive: number,
  
  // Actions
  clickCookie: () => void,
  buyBuilding: (id) => void,
  buyUpgrade: (id) => void,
  tick: () => void,
  saveGame: () => Promise<void>,
  loadGame: () => Promise<void>,
  prestige: () => Promise<void>,
  calculateCPS: () => void,
  checkAchievements: () => void
}
\`\`\`

### State Updates

**Optimistic Updates**: UI updates immediately for instant feedback
**Periodic Sync**: Auto-save every 10 seconds to Supabase
**Conflict Resolution**: Last-write-wins (single player game)

## Database Schema

### game_state
Primary table for player progress:
- **PK**: user_id (FK to auth.users)
- **Numeric fields**: cookies, total_cookies, cps, click_power
- **JSONB fields**: buildings, upgrades, achievements
- **Integer fields**: prestige_level
- **Numeric**: multiplier
- **Timestamp**: last_active, updated_at

### leaderboard
Public rankings:
- **PK**: user_id (FK to auth.users)
- **Fields**: username, total_cookies, prestige_level
- **Timestamp**: updated_at
- **Index**: ON total_cookies DESC for fast queries

## Security

### Row Level Security (RLS)

**game_state policies**:
- Users can SELECT their own row
- Users can INSERT their own row
- Users can UPDATE their own row
- No DELETE allowed

**leaderboard policies**:
- Anyone can SELECT (public leaderboard)
- Users can INSERT their own row
- Users can UPDATE their own row
- No DELETE allowed

### Authentication Flow

\`\`\`
User submits credentials
    ↓
Supabase Auth validates
    ↓
JWT token issued
    ↓
Token stored in httpOnly cookie
    ↓
All API requests include token
    ↓
RLS policies enforce access control
\`\`\`

## Performance Optimizations

### 1. Client-Side
- **React.memo** on expensive components
- **useMemo** for complex calculations
- **Debouncing** for save operations
- **Virtual scrolling** for large lists (if needed)
- **Code splitting** via Next.js dynamic imports

### 2. Network
- **Batched writes** - Save every 10s instead of every change
- **Optimistic updates** - Don't wait for server response
- **Connection pooling** - Supabase handles automatically
- **CDN caching** - Static assets cached globally

### 3. Database
- **Indexes** on frequently queried columns
- **JSONB** for flexible nested data
- **Prepared statements** via Supabase client
- **Connection pooling** for scalability

## Real-Time Updates

### Leaderboard Subscription

\`\`\`typescript
const subscription = supabase
  .channel('leaderboard-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'leaderboard'
  }, () => {
    // Refresh leaderboard data
  })
  .subscribe();
\`\`\`

**Benefits**:
- No polling required
- Instant updates when players achieve new scores
- Low bandwidth usage
- WebSocket-based for efficiency

## Scalability Considerations

### Current Limits
- **Supabase Free Tier**: 500MB database, 2GB bandwidth/month
- **Vercel Free Tier**: 100GB bandwidth/month
- **Expected**: ~1000-5000 active players on free tier

### Scaling Strategy

**Phase 1** (0-1K players):
- Current architecture sufficient
- Monitor Supabase usage

**Phase 2** (1K-10K players):
- Upgrade Supabase to Pro ($25/month)
- Enable CDN for static assets
- Add Redis for caching (optional)

**Phase 3** (10K-100K players):
- Database read replicas
- Horizontal scaling with load balancer
- Microservices for specific features
- Consider dedicated game server

## Testing Strategy

### Unit Tests
- Zustand store actions
- Game logic calculations
- Utility functions

### Integration Tests
- Authentication flow
- Save/load game state
- Prestige system
- Offline progress calculation

### E2E Tests
- Complete game workflow
- Purchase flows
- Leaderboard updates

### Manual Testing
- Cross-browser compatibility
- Mobile responsiveness
- Performance under load

## Monitoring & Observability

### Metrics to Track
- Active users
- Average session length
- Prestige rate
- Building purchase patterns
- Error rates
- API response times

### Tools
- Vercel Analytics (built-in)
- Supabase Dashboard (database metrics)
- Custom analytics events (optional)
- Error tracking (Sentry, optional)

## Future Architecture Improvements

### Short-term
- Add Redis for leaderboard caching
- Implement rate limiting
- Add comprehensive logging

### Long-term
- Microservices for game logic
- Event sourcing for game state
- GraphQL API layer
- Server-side game tick validation
- Multiplayer features

## Development Workflow

\`\`\`
Feature branch → Local testing → PR → Review → Merge to main → Auto-deploy
\`\`\`

### Local Development
\`\`\`bash
npm run dev        # Start dev server
npm run build      # Test production build
npm run lint       # Check code quality
\`\`\`

### CI/CD
- **Vercel**: Auto-deploy on push to main
- **Preview deployments**: Auto-created for PRs
- **Rollback**: One-click revert to previous deployment

## Backup & Recovery

### Automated Backups
- Supabase: Daily automatic backups (Pro tier)
- Git: Full version history
- Vercel: Deployment history

### Recovery Procedures
1. Database restore from Supabase dashboard
2. Redeploy previous version from Vercel
3. Manual data recovery via SQL queries

---

This architecture is designed to be:
- **Scalable**: Can handle growth from 10 to 10,000+ users
- **Maintainable**: Clear separation of concerns
- **Reliable**: Multiple redundancy layers
- **Performant**: Optimized for real-time gameplay
- **Secure**: RLS and authentication built-in
