# RegAI - Regulatory Knowledge Center

A comprehensive knowledge management system for regulatory compliance, featuring an interactive chatbot interface for managing regulations, events, and obligations.

## Features

- **Regulation Management**: Browse and manage regulatory documents (e.g., SEBI LODR)
- **Event Tracking**: Track and manage regulatory events and obligations
- **Interactive Chatbot**: AI-powered chatbot for adding regulations and querying domain information
- **Obligations Table**: Comprehensive table with validation rules, severity levels, and scoring
- **Mindmap Visualization**: Visual representation of regulatory relationships
- **Domain Summary**: Automated domain analysis and summary generation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/RegAI.git
cd RegAI/sebi-knowledge-base
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run deploy` - Deploys the app to GitHub Pages (requires gh-pages package)

## Deployment to GitHub Pages

### Option 1: Automatic Deployment via GitHub Actions (Recommended)

This repository includes a GitHub Actions workflow that automatically deploys your app to GitHub Pages whenever you push to the `main` or `master` branch.

#### Setup Steps:

1. **Update the homepage in package.json**:
   - Open `package.json`
   - Replace `YOUR_USERNAME` in the `homepage` field with your GitHub username:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/RegAI"
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Save the changes

3. **Push your code**:
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

4. **Monitor deployment**:
   - Go to the **Actions** tab in your GitHub repository
   - Watch the workflow run and complete
   - Once complete, your site will be available at `https://YOUR_USERNAME.github.io/RegAI`

### Option 2: Manual Deployment

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**:
   - Ensure the `homepage` field is set correctly (see Option 1, Step 1)
   - The `deploy` script is already configured

3. **Build and deploy**:
   ```bash
   npm run deploy
   ```

   This will:
   - Build your app for production
   - Deploy it to the `gh-pages` branch
   - Make it available on GitHub Pages

### Important Notes for GitHub Pages

- **Routing**: The app uses React Router with BrowserRouter. The included `404.html` file handles client-side routing for GitHub Pages.
- **Base Path**: If your repository is not at the root (e.g., `username.github.io/repo-name`), you may need to configure a basename in your Router component.
- **Build Folder**: The `build` folder is gitignored by default. The GitHub Actions workflow handles building and deploying automatically.

## Project Structure

```
sebi-knowledge-base/
├── public/
│   ├── index.html          # Main HTML template
│   └── 404.html            # GitHub Pages routing support
├── src/
│   ├── components/         # React components
│   │   └── AddRegulationChatbot.js
│   ├── context/            # React Context providers
│   │   └── RegulationsContext.js
│   ├── pages/              # Page components
│   ├── App.js              # Main app component
│   └── index.js            # Entry point
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions deployment workflow
└── package.json
```

## Technologies Used

- **React** - UI library
- **React Router DOM** - Client-side routing
- **React Context API** - State management
- **CSS3** - Styling and animations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues and questions, please open an issue in the GitHub repository.
