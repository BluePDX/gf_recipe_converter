# Gluten-Free Recipe Converter

Convert any recipe to gluten-free with intelligent, context-aware substitutions for celiac disease and Hashimoto's disease.

## Features

- 📝 **Three Input Methods**: Paste recipe text, enter URL, or upload an image
- 🔄 **Smart Substitutions**: Context-aware swaps based on recipe type (cookies vs bread vs dumplings)
- 📊 **Multiple Options**: Get 2-3 flour/ingredient alternatives with texture comparisons
- 📖 **Detailed Notes**: Footnoted instructions with explanations at the bottom
- 🏷️ **Brand Recommendations**: Only shows brands relevant to your specific recipe
- ⚠️ **Honest Feasibility Ratings**: Know when a recipe won't work well gluten-free

## Deployment Instructions

### Step 1: Get Your Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to "API Keys"
4. Click "Create Key"
5. Copy your API key (save it somewhere safe!)

### Step 2: Deploy to Vercel (Free & Easy)

1. **Create a Vercel Account**
   - Go to https://vercel.com/signup
   - Sign up with GitHub, GitLab, or Bitbucket

2. **Upload Your Project**
   - Download this entire `gf-recipe-app` folder
   - Go to https://vercel.com/new
   - Click "Add New Project"
   - Drag and drop the `gf-recipe-app` folder

3. **Add Your API Key**
   - Before deploying, click "Environment Variables"
   - Add a new variable:
     - Name: `ANTHROPIC_API_KEY`
     - Value: [paste your API key from Step 1]
   - Click "Add"

4. **Deploy!**
   - Click "Deploy"
   - Wait 2-3 minutes
   - You'll get a live URL like `your-app-name.vercel.app`

### Step 3: Use Your App

Visit your new URL and start converting recipes! Share it with friends, use it on your phone, whatever you want.

## Local Development (Optional)

If you want to run it on your computer first:

```bash
# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Add your API key to .env.local
# Then run the dev server
npm run dev
```

Visit http://localhost:3000

## How It Works

1. **Input**: Paste recipe, URL, or upload image
2. **Analysis**: Claude analyzes recipe type and structure needs
3. **Conversion**: Smart GF substitutions with multiple options
4. **Output**: Clean recipe with swaps, notes, and brand recommendations

## Tech Stack

- Next.js (React framework)
- Tailwind CSS (styling)
- Anthropic Claude API (AI conversion)

## Troubleshooting

**"API key not configured" error:**
- Make sure you added `ANTHROPIC_API_KEY` in Vercel environment variables
- Redeploy after adding the key

**Recipe won't convert:**
- Make sure recipe has ingredients and instructions
- Try paste mode if URL/image isn't working
- Check that your API key has credits

## Cost

- Vercel hosting: **FREE** (hobby tier)
- Anthropic API: Pay-per-use (very cheap - ~$0.01-0.05 per recipe)

## License

MIT - Do whatever you want with it!
