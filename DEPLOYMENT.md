# GitHub Pages Deployment Guide

This guide will help you deploy the RegAI application to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your local machine
- Node.js and npm installed

## Step-by-Step Deployment

### 1. Update Package.json Homepage

Before deploying, you need to update the `homepage` field in `package.json`:

1. Open `sebi-knowledge-base/package.json`
2. Find the `homepage` field (around line 5)
3. Replace `YOUR_USERNAME` with your actual GitHub username:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/RegAI"
   ```

   **Note**: If your repository name is different from `RegAI`, update it accordingly.

### 2. Push Code to GitHub

If you haven't already:

```bash
cd sebi-knowledge-base
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/RegAI.git
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** (top menu)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. Click **Save**

### 4. Automatic Deployment

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that will automatically:

- Build your React app when you push to `main` or `master` branch
- Deploy it to GitHub Pages
- Make it available at `https://YOUR_USERNAME.github.io/RegAI`

**To trigger deployment:**

1. Make sure all your code is committed and pushed:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. Go to the **Actions** tab in your GitHub repository
3. You should see a workflow run called "Deploy to GitHub Pages"
4. Wait for it to complete (usually takes 2-3 minutes)
5. Once complete, your site will be live!

### 5. Verify Deployment

1. Go to your repository **Settings** → **Pages**
2. You should see a green checkmark and a URL like:
   `https://YOUR_USERNAME.github.io/RegAI`
3. Click the URL to visit your deployed site

## Troubleshooting

### Issue: 404 errors on routes

**Solution**: The `404.html` file handles client-side routing. Make sure it's in your `public` folder and gets deployed. The GitHub Actions workflow should handle this automatically.

### Issue: Assets not loading

**Solution**: 
- Verify the `homepage` field in `package.json` matches your GitHub Pages URL
- Check that all assets use relative paths or `%PUBLIC_URL%`

### Issue: Build fails

**Solution**:
- Check the Actions tab for error messages
- Ensure `package-lock.json` is committed
- Verify Node.js version compatibility (the workflow uses Node 18)

### Issue: Site shows blank page

**Solution**:
- Open browser developer tools (F12)
- Check the Console for JavaScript errors
- Verify the build completed successfully in GitHub Actions
- Ensure the `homepage` field is correctly set

## Manual Deployment (Alternative)

If you prefer to deploy manually:

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Build the app:
   ```bash
   npm run build
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

This will create a `gh-pages` branch and deploy your app.

## Updating Your Site

After making changes:

1. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. The GitHub Actions workflow will automatically rebuild and redeploy your site

3. Wait 2-3 minutes for the deployment to complete

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file in the `public` folder with your domain name
2. Configure DNS settings with your domain provider
3. Update the `homepage` field in `package.json` to match your custom domain

## Support

If you encounter issues:
1. Check the GitHub Actions logs in the **Actions** tab
2. Review the browser console for client-side errors
3. Verify all configuration files are correct
4. Open an issue in the repository
