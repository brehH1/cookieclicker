# 🚀 Deployment Guide

## Deploying to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications and offers a generous free tier.

### Step 1: Prepare Your Repository

1. Initialize git (if not already done):
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
\`\`\`

2. Push to GitHub:
\`\`\`bash
gh repo create cookie-clicker --public --source=. --push
# Or manually create a repo on GitHub and push
\`\`\`

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`

6. Click "Deploy"

Your app will be live at `https://your-project.vercel.app` in ~2 minutes!

### Step 3: Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## Deploying to Netlify

### Via Netlify UI

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Functions directory**: Leave empty

5. Add environment variables in Site Settings → Environment Variables

6. Deploy!

### Via Netlify CLI

\`\`\`bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
\`\`\`

## Deploying to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Next.js
5. Add environment variables in Variables tab
6. Deploy automatically starts

## Deploying to Your Own VPS

### Requirements
- Ubuntu 20.04+ or similar
- Node.js 18+
- Nginx (recommended)
- PM2 for process management

### Steps

1. **SSH into your server**:
\`\`\`bash
ssh user@your-server-ip
\`\`\`

2. **Install dependencies**:
\`\`\`bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm install -g pm2
\`\`\`

3. **Clone and build**:
\`\`\`bash
git clone your-repo-url
cd cookie-clicker
npm install
npm run build
\`\`\`

4. **Set up environment**:
\`\`\`bash
nano .env.local
# Add your environment variables
\`\`\`

5. **Start with PM2**:
\`\`\`bash
pm2 start npm --name "cookie-clicker" -- start
pm2 startup
pm2 save
\`\`\`

6. **Configure Nginx**:
\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

7. **Enable site and restart Nginx**:
\`\`\`bash
sudo ln -s /etc/nginx/sites-available/cookie-clicker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
\`\`\`

8. **Set up SSL with Certbot** (optional but recommended):
\`\`\`bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
\`\`\`

## Post-Deployment Checklist

- [ ] Test authentication (email and Google OAuth)
- [ ] Verify game state saves correctly
- [ ] Check leaderboard updates in real-time
- [ ] Test offline progression
- [ ] Ensure prestige system works
- [ ] Verify responsive design on mobile
- [ ] Check all pages load correctly
- [ ] Test guest mode (localStorage)
- [ ] Monitor for any console errors
- [ ] Set up analytics (optional)

## Continuous Deployment

### GitHub Actions (for VPS)

Create `.github/workflows/deploy.yml`:

\`\`\`yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd cookie-clicker
            git pull
            npm install
            npm run build
            pm2 restart cookie-clicker
\`\`\`

### Vercel/Netlify

Automatic deployment on every push to main branch - no configuration needed!

## Monitoring

### Vercel Analytics
- Enable in Project Settings → Analytics
- Free tier includes basic metrics

### Custom Analytics
Add to `app/layout.tsx`:

\`\`\`typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
\`\`\`

## Performance Optimization

### Enable Caching
Add to `next.config.js`:

\`\`\`javascript
module.exports = {
  // ... existing config
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
\`\`\`

### Image Optimization
Next.js automatically optimizes images. Use the Image component:

\`\`\`typescript
import Image from 'next/image';
\`\`\`

## Troubleshooting

### Build Failures
- Check Node.js version (18+ required)
- Ensure all dependencies are installed
- Verify environment variables are set

### Runtime Errors
- Check Supabase connection
- Verify API keys are correct
- Check browser console for errors

### Slow Performance
- Enable Next.js caching
- Optimize images
- Check Supabase region (should match deployment region)

## Scaling

### Database
- Supabase free tier supports up to 500MB
- Upgrade to Pro for unlimited database size
- Add database indexes for better performance

### Hosting
- Vercel Pro supports more concurrent builds
- Consider Redis for caching if needed
- Use CDN for static assets

---

Need help? Check the [README.md](./README.md) or open an issue on GitHub!
