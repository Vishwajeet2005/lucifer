# Lucifer
 
![Status](https://img.shields.io/badge/Status-Live-success) ![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20JavaScript-informational) ![Deploy](https://img.shields.io/badge/Deployed-Netlify-00C7B7)
 
**A Next.js web application deployed on Netlify with serverless functions.**
 
🔗 **[Live → lucifer7.netlify.app](https://lucifer7.netlify.app)**
 
---
 
## Tech stack
 
| Layer | Technology |
|---|---|
| Framework | Next.js |
| Language | JavaScript |
| Styling | CSS |
| Serverless | Netlify Functions |
| Deployment | Netlify |
 
---
 
## Getting started
 
```bash
git clone https://github.com/Vishwajeet2005/lucifer.git
cd lucifer
npm install
npm run dev
# Open http://localhost:3000
```
 
---
 
## Project structure
 
```
lucifer/
├── src/                  # Next.js pages and components
├── netlify/functions/    # Serverless function handlers
├── next.config.mjs       # Next.js configuration
├── tailwind.config.mjs   # Tailwind configuration
└── netlify.toml          # Netlify build + redirect config
```
 
---
 
## Deployment
 
The app deploys automatically to Netlify on every push to `master`. See `DEPLOY.md` for manual deployment steps.
 
