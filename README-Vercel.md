# Privacy Policy Deployment to Vercel

This directory contains the configuration to deploy only the privacy policy page to Vercel without affecting your Chrome extension code.

## Files Created for Vercel Deployment

- `vercel.json` - Vercel configuration for static HTML deployment
- `.vercelignore` - Ignores all files except privacy policy
- `package-vercel.json` - Package.json specifically for Vercel deployment
- `deploy-privacy-policy.mjs` - Script to prepare files for Vercel deployment

## How to Deploy

### Option 1: Using the Deploy Script
```bash
npm run deploy:privacy
```

This will:
1. Create a `vercel-deploy` directory
2. Copy only the privacy policy and Vercel config files
3. Prepare everything for deployment

### Option 2: Manual Vercel CLI Deployment
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel --prod
```

### Option 3: GitHub Integration
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel will automatically detect the `vercel.json` configuration
5. Deploy only the privacy policy page

## URL Routes

The privacy policy will be accessible at:
- `https://your-domain.vercel.app/` (root)
- `https://your-domain.vercel.app/privacy-policy`
- `https://your-domain.vercel.app/privacy`

## What Gets Deployed

✅ **Included:**
- `privacy-policy.html` - The privacy policy page
- `vercel.json` - Vercel configuration
- `.vercelignore` - File exclusion rules

❌ **Excluded:**
- All Chrome extension source code (`src/` directory)
- Build files (`dist/` directory)
- Node modules
- Webpack configuration
- All other project files

## Your Chrome Extension Code

Your Chrome extension code remains completely untouched and can continue to be developed and built normally using:
```bash
npm run build  # Builds Chrome extension
npm run dev    # Development mode
```

The Vercel deployment is completely separate and won't interfere with your extension development workflow.
