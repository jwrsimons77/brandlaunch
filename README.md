# BRAND_NAME - Fitness Lifestyle Website

A modern, mobile-first fitness lifestyle brand website built for Netlify deployment. Inspired by the bold aesthetics of contemporary fitness communities like Sums Club and UVU Club.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Netlify](https://img.shields.io/badge/deploy-netlify-00C7B7)

## ✨ Features

- **Mobile-First Design** - Responsive across all devices (320px+)
- **Bold, Modern Aesthetic** - Strong typography and minimalist design
- **Smooth Animations** - Intersection Observer API for scroll animations
- **Netlify Forms Integration** - Built-in email capture with spam protection
- **Fast Loading** - Optimized images and efficient code
- **SEO Friendly** - Semantic HTML and meta tags
- **Accessible** - WCAG compliant with keyboard navigation support
- **Zero Dependencies** - Pure HTML, CSS, and JavaScript

## 📁 Project Structure

```
brandlaunch/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Main stylesheet (mobile-first)
├── js/
│   └── main.js            # JavaScript for interactivity
├── images/
│   ├── hero/              # Hero section images
│   ├── events/            # Event images
│   ├── gallery/           # Gallery/community images
│   └── icons/             # Icons and favicon
├── netlify.toml           # Netlify configuration
├── _redirects             # Netlify redirects configuration
├── README.md              # This file
└── BRAND_GUIDE.md         # Customization guide
```

## 🎨 Key Sections

1. **Hero Section** - Full-screen hero with video/image background
2. **About Section** - Brand philosophy and core values
3. **Events Section** - Upcoming pop-up events and experiences
4. **Gallery Section** - Instagram-style community showcase
5. **Join Section** - Membership form with Netlify Forms integration
6. **Contact Section** - Contact info and social media links
7. **Footer** - Site links and legal information

## 🚀 Quick Start - Netlify Deployment

### Method 1: Drag and Drop (Fastest)

1. **Prepare Your Files**
   ```bash
   # Create a zip file of the project (or use the folder directly)
   zip -r brandlaunch.zip . -x "*.git*" -x "node_modules/*"
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Log in or create an account
   - Click "Add new site" → "Deploy manually"
   - Drag and drop your project folder or zip file
   - Wait for deployment (usually under 1 minute)
   - Your site is live at `https://your-site-name.netlify.app`

### Method 2: Git Integration (Recommended for Continuous Deployment)

1. **Push to GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: BRAND_NAME website"
   git branch -M main
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com) and log in
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider
   - Select your repository
   - Configure build settings:
     - **Build command:** (leave empty)
     - **Publish directory:** `.` (root)
   - Click "Deploy site"

3. **Automatic Deployments**
   - Every push to your main branch will trigger a new deployment
   - Preview deployments are created for pull requests

### Method 3: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   # For a draft deployment
   netlify deploy

   # For production deployment
   netlify deploy --prod
   ```

## ⚙️ Configuration

### Custom Domain Setup

1. Go to your site settings in Netlify
2. Navigate to "Domain management"
3. Click "Add custom domain"
4. Follow the instructions to configure your DNS
5. Netlify will automatically provision an SSL certificate

### Environment Variables

If you need environment variables (for future integrations):

1. Go to Site settings → Build & deploy → Environment
2. Add your variables (e.g., `API_KEY`, `GOOGLE_ANALYTICS_ID`)
3. Access them in your code or build process

### Form Notifications

1. Go to Site settings → Forms
2. Configure email notifications for form submissions
3. Set up Slack/webhook integrations if needed
4. View form submissions in the Netlify dashboard

## 🎨 Customization

### Update Brand Name

Use find-and-replace to update `BRAND_NAME` throughout the codebase:

```bash
# Using grep to find all instances
grep -r "BRAND_NAME" .

# Or use your code editor's find-and-replace feature
# Find: BRAND_NAME
# Replace: Your Actual Brand Name
```

### Color Scheme

Edit the CSS variables in `css/styles.css`:

```css
:root {
    --color-primary: #FF4655;        /* Your primary color */
    --color-primary-dark: #E03444;   /* Darker shade */
    --color-primary-light: #FF6B78;  /* Lighter shade */
}
```

Pre-configured color palette options are included in the CSS file. Simply uncomment your preferred palette.

### Images

Replace placeholder images in the `images/` directory:

**Recommended Image Dimensions:**
- Hero background: 1920x1080px (or video)
- About image: 1200x1200px
- Event cards: 800x600px
- Gallery items: 600x600px (square)
- OG image: 1200x630px

**Optimization Tips:**
- Use WebP format for better compression
- Compress images before uploading (TinyPNG, ImageOptim)
- Keep file sizes under 500KB for optimal loading

### Typography

The site uses Google Fonts (Inter + Bebas Neue). To change fonts:

1. Choose fonts from [Google Fonts](https://fonts.google.com)
2. Update the `<link>` tag in `index.html`
3. Update CSS variables in `css/styles.css`:
   ```css
   --font-primary: 'Your Font', sans-serif;
   --font-display: 'Your Display Font', sans-serif;
   ```

## 📱 Testing

### Local Development

**Option 1: Python HTTP Server**
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

**Option 2: PHP Built-in Server**
```bash
php -S localhost:8000
```

**Option 3: VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

**Option 4: Netlify Dev (Recommended)**
```bash
netlify dev
# This simulates the Netlify environment locally
```

### Browser Testing

Test on multiple devices and browsers:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

### Performance Testing

Run Lighthouse audits (built into Chrome DevTools):
```bash
# Or use CLI
npm install -g lighthouse
lighthouse https://your-site.netlify.app
```

Target scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

## 🔧 Advanced Features

### Adding Google Analytics

1. Get your Google Analytics tracking ID
2. Add to `index.html` before closing `</head>`:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'GA_MEASUREMENT_ID');
   </script>
   ```

### Adding Social Media Tracking Pixels

Add Facebook Pixel, TikTok Pixel, etc. in the `<head>` section following their respective documentation.

### Netlify Functions (Serverless)

To add serverless functions:

1. Create `netlify/functions/` directory
2. Add your function files (e.g., `hello.js`)
3. Deploy - functions will be available at `/.netlify/functions/hello`

Example function:
```javascript
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from serverless!" })
  };
};
```

## 📊 Performance Optimizations

The site includes several performance optimizations:

- ✅ Minified and optimized code
- ✅ Lazy loading for images
- ✅ CSS and JS loaded efficiently
- ✅ Netlify CDN for global distribution
- ✅ Browser caching via headers
- ✅ Intersection Observer for animations
- ✅ Throttled scroll events
- ✅ Preload critical assets

## 🔒 Security Features

- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ HTTPS enforced by Netlify
- ✅ Netlify Forms spam protection (honeypot)
- ✅ XSS protection
- ✅ No external dependencies that could be compromised

## 📝 SEO Checklist

- ✅ Semantic HTML structure
- ✅ Meta descriptions and titles
- ✅ Open Graph tags for social sharing
- ✅ Alt text for all images
- ✅ Sitemap (add `sitemap.xml` if needed)
- ✅ Robots.txt (add if needed)
- ✅ Fast loading times
- ✅ Mobile-friendly design
- ✅ Structured data (can be added)

## 🐛 Troubleshooting

### Forms Not Submitting

1. Ensure `data-netlify="true"` is in the form tag
2. Check that form `name` attribute is set
3. Include hidden `form-name` input
4. Verify honeypot field is present

### Images Not Loading

1. Check image paths are relative (start with `/`)
2. Verify images are in the correct directory
3. Check file extensions match actual files
4. Ensure images are committed to Git

### Styles Not Applying

1. Clear browser cache (Ctrl+Shift+R)
2. Check CSS file path in HTML
3. Verify no syntax errors in CSS
4. Check browser console for errors

### Mobile Menu Not Working

1. Check JavaScript is loading (no console errors)
2. Verify hamburger button has correct ID
3. Test on actual mobile device, not just resized browser

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Forms Guide](https://docs.netlify.com/forms/setup/)
- [Custom Domain Setup](https://docs.netlify.com/domains-https/custom-domains/)
- [Netlify Redirects](https://docs.netlify.com/routing/redirects/)
- [Web Performance Best Practices](https://web.dev/performance/)

## 🤝 Contributing

This is a template project. Feel free to customize it for your brand!

## 📄 License

MIT License - Feel free to use this template for your projects.

## 💬 Support

For issues or questions about deployment:
- Check the [Netlify Community Forums](https://answers.netlify.com/)
- Review the troubleshooting section above
- Check browser console for errors

## 🎯 Next Steps

1. ✅ Deploy to Netlify
2. ✅ Replace BRAND_NAME with your actual brand name
3. ✅ Update colors and fonts
4. ✅ Add your images
5. ✅ Configure custom domain
6. ✅ Set up form notifications
7. ✅ Add Google Analytics (optional)
8. ✅ Share with the world!

---

**Built with ❤️ for the fitness community**

Ready to launch? Deploy now and start building your community! 🚀
