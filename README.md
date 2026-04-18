# repo2album
An easy-to-use GitHub Pages photo album tool. Automatically scans image directories, dynamically renders albums, and displays static HTML pages on GitHub Pages. Fork this repository and use it right away.

Demo: [https://x200706.github.io/repo2album/](https://x200706.github.io/repo2album/)

## Features
- **Auto Scanning**: Automatically reads albums and photos via GitHub Contents API
- **Dynamic Rendering**: No need to manually maintain file lists. Albums update automatically after you add or delete images through GitHub Contents API
- **Responsive Design**: Fully compatible with desktops, tablets, mobile phones and all devices
- **Image Preview**: Powered by PhotoSwipe 5, supports image zoom, pinch scaling and swipe navigation
- **Lazy Loading**: Images load lazily to improve page loading speed
- Simple Configuration: Just fork the repo and edit `gallery.js` to finish all settings

## Quick Start
### 1. Create GitHub Repository
1. Create a public GitHub Repository
2. Enable GitHub Pages (Settings > Pages > Set source to main branch)
3. Wait for GitHub Pages deployment to complete

### 2. Upload Photos
1. Create an `albums` folder in the repository root
2. Create subfolders under `albums` — each subfolder represents one photo album
3. Upload photos into corresponding album folders

Example structure:
```
albums/
├── Album1/
│   ├── photo1.jpg
│   └── photo2.jpg
└── Album2/
    ├── photo3.jpg
    └── photo4.jpg
```

### 3. Deploy Your Album
1. Fork or download this project to your repository
2. Edit settings at the top of `assets/gallery.js` (GitHub username and repository name)
3. Enable GitHub Pages if you forked the project
4. Wait for GitHub Pages to rebuild and deploy

### 4. Configuration Guide
Open `assets/gallery.js` and modify the config at the top:
```javascript
const config = {
  // GitHub repository info
  repoOwner: 'Your GitHub Username',
  repoName: 'Your Repository Name',
  branch: 'main',

  // Album path settings
  albumsPath: 'albums',

  // Supported image formats
  supportedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],

  // API endpoints
  apiBaseUrl: 'https://api.github.com',
  rawBaseUrl: 'https://raw.githubusercontent.com',

  // Website appearance
  siteTitle: 'repo2album',
  siteDescription: 'Turn your GitHub repo into a public photo album instantly'
};
```

## Technical Details
- Frontend: HTML5 + CSS3 + JavaScript (ES6+)
- CSS Framework: Tailwind CSS v3
- Image Viewer: PhotoSwipe 5
- Data API: GitHub Contents API

## Notes
1. Unauthenticated GitHub API is limited to 60 requests per hour
2. Your repository **must be public**, otherwise the API cannot access files
3. Keep image file sizes reasonable to avoid slow loading
4. No CDN applied. Large numbers of photos may result in longer loading times

## Troubleshooting
### Albums not loading?
1. Double-check GitHub owner & repo name in `gallery.js`
2. Confirm your repository is public
3. Make sure `albums` folder exists and contains valid images
4. Check browser developer console for error logs

### Images not displaying?
1. Ensure file formats are supported: jpg, jpeg, png, webp
2. Do not exceed GitHub file size limits
3. Check your internet connection

## Contributing
Issues and pull requests are welcome to improve this project!

## License
MIT License