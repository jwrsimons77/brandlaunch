# Image Optimization Guide for AORO

This document explains the image optimization implementation and the steps needed to complete the WebP conversion.

## Optimizations Implemented

### 1. **Picture Elements with WebP Support**
- Added `<picture>` elements for the main product image (Cloud Piercer Tee)
- Configured responsive `srcset` attributes for multiple screen sizes
- Browser will automatically select the best format (WebP if supported, JPG/PNG fallback)

### 2. **Lazy Loading**
- Modal image uses `loading="lazy"` attribute
- Footer logo uses `loading="lazy"` attribute
- Off-screen images won't load until needed, reducing initial page load

### 3. **Responsive Image Sizes**
- Configured `srcset` with multiple widths: 480px, 768px, 1024px, 1536px
- `sizes` attribute tells the browser which image to download based on viewport
- Reduces bandwidth usage on mobile devices

### 4. **Layout Shift Prevention**
- All images have explicit `width` and `height` attributes
- Browser reserves space before images load, preventing content jumping
- Improves Core Web Vitals (Cumulative Layout Shift score)

### 5. **Optimized Background Images**
- CSS uses `image-set()` for WebP support with JPG fallback
- Added `will-change` hints for better rendering performance
- Background color fallback prevents blank space during load

## Required: Create WebP Images

The HTML/CSS is ready for WebP images, but you need to convert the original images. Here are the images that need conversion:

### Product Image: Cloud Piercer Tee
**Original:** `/images/drops/cloud-piercer-tee.jpg` (1536x1024)

**Create these versions:**
```bash
# Using ImageMagick
convert images/drops/cloud-piercer-tee.jpg -resize 480x -quality 85 images/drops/cloud-piercer-tee-480.jpg
convert images/drops/cloud-piercer-tee.jpg -resize 768x -quality 85 images/drops/cloud-piercer-tee-768.jpg
convert images/drops/cloud-piercer-tee.jpg -resize 1024x -quality 85 images/drops/cloud-piercer-tee-1024.jpg

# Convert to WebP
convert images/drops/cloud-piercer-tee-480.jpg -quality 82 images/drops/cloud-piercer-tee-480.webp
convert images/drops/cloud-piercer-tee-768.jpg -quality 82 images/drops/cloud-piercer-tee-768.webp
convert images/drops/cloud-piercer-tee-1024.jpg -quality 82 images/drops/cloud-piercer-tee-1024.webp
convert images/drops/cloud-piercer-tee.jpg -quality 82 images/drops/cloud-piercer-tee.webp
```

### Hero Background
**Original:** `/images/hero/hero-bg.jpg` (3089x2048)

**Create WebP version:**
```bash
# Using cwebp (recommended for better compression)
cwebp -q 85 images/hero/hero-bg.jpg -o images/hero/hero-bg.webp

# Or using ImageMagick
convert images/hero/hero-bg.jpg -quality 85 images/hero/hero-bg.webp
```

### Values Section Background
**Original:** `/images/sections/values-bg.jpg` (3089x2048)

**Create WebP version:**
```bash
cwebp -q 85 images/sections/values-bg.jpg -o images/sections/values-bg.webp

# Or using ImageMagick
convert images/sections/values-bg.jpg -quality 85 images/sections/values-bg.webp
```

## Installation Tools

### Option 1: ImageMagick
```bash
# Ubuntu/Debian
sudo apt-get install imagemagick

# macOS
brew install imagemagick

# Windows
# Download from: https://imagemagick.org/script/download.php
```

### Option 2: cwebp (Google's WebP encoder)
```bash
# Ubuntu/Debian
sudo apt-get install webp

# macOS
brew install webp

# Windows
# Download from: https://developers.google.com/speed/webp/download
```

### Option 3: Online Converters
- https://squoosh.app/ (Google's image optimizer)
- https://convertio.co/jpg-webp/
- https://cloudconvert.com/jpg-to-webp

## Batch Conversion Script

Save this as `convert-images.sh` and run it:

```bash
#!/bin/bash

# Create WebP versions of all JPG images
echo "Converting hero background..."
cwebp -q 85 images/hero/hero-bg.jpg -o images/hero/hero-bg.webp

echo "Converting values background..."
cwebp -q 85 images/sections/values-bg.jpg -o images/sections/values-bg.webp

echo "Creating responsive sizes for Cloud Piercer Tee..."
# Create JPG sizes
convert images/drops/cloud-piercer-tee.jpg -resize 480x -quality 85 images/drops/cloud-piercer-tee-480.jpg
convert images/drops/cloud-piercer-tee.jpg -resize 768x -quality 85 images/drops/cloud-piercer-tee-768.jpg
convert images/drops/cloud-piercer-tee.jpg -resize 1024x -quality 85 images/drops/cloud-piercer-tee-1024.jpg

# Convert to WebP
cwebp -q 82 images/drops/cloud-piercer-tee-480.jpg -o images/drops/cloud-piercer-tee-480.webp
cwebp -q 82 images/drops/cloud-piercer-tee-768.jpg -o images/drops/cloud-piercer-tee-768.webp
cwebp -q 82 images/drops/cloud-piercer-tee-1024.jpg -o images/drops/cloud-piercer-tee-1024.webp
cwebp -q 82 images/drops/cloud-piercer-tee.jpg -o images/drops/cloud-piercer-tee.webp

echo "Conversion complete!"
echo ""
echo "File size comparison:"
du -h images/hero/hero-bg.jpg images/hero/hero-bg.webp
du -h images/sections/values-bg.jpg images/sections/values-bg.webp
```

Make it executable and run:
```bash
chmod +x convert-images.sh
./convert-images.sh
```

## Expected Performance Improvements

### Before Optimization
- Hero background: ~350-500 KB (JPG)
- Values background: ~350-500 KB (JPG)
- Product image: ~200-300 KB (PNG)
- **Total: ~900-1,300 KB**

### After Optimization (with WebP)
- Hero background: ~150-220 KB (WebP, 50-60% reduction)
- Values background: ~150-220 KB (WebP, 50-60% reduction)
- Product image (mobile 480px): ~30-50 KB (WebP, 85-90% reduction)
- Product image (tablet 768px): ~70-100 KB (WebP, 70-80% reduction)
- **Total (mobile): ~400-600 KB (50-60% reduction)**

### Performance Metrics Impact
- **First Contentful Paint (FCP)**: 20-30% faster
- **Largest Contentful Paint (LCP)**: 30-40% faster
- **Cumulative Layout Shift (CLS)**: Near-zero (width/height prevent shift)
- **Mobile Page Speed Score**: +10-20 points improvement expected

## Testing the Implementation

### 1. Test in Multiple Browsers
```bash
# Chrome/Edge (supports WebP)
# Should load .webp versions

# Safari (supports WebP since version 14)
# Should load .webp versions

# Older browsers
# Should fallback to .jpg versions
```

### 2. Verify in DevTools
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Filter by "Img"
4. Refresh page
5. Verify:
   - Images show `.webp` extension
   - File sizes are smaller
   - Lazy-loaded images only appear after scrolling

### 3. Lighthouse Audit
```bash
# Run Lighthouse in Chrome DevTools
# Check improvements in:
# - Performance score
# - First Contentful Paint
# - Largest Contentful Paint
# - Cumulative Layout Shift
```

## Browser Support

- **WebP**: 97%+ global support (Chrome, Firefox, Safari 14+, Edge)
- **Picture element**: 98%+ global support
- **Lazy loading**: 94%+ global support
- **Fallback**: Older browsers automatically use JPG/PNG

## Maintenance

When adding new images:
1. Create multiple sizes (480px, 768px, 1024px minimum)
2. Convert all sizes to WebP
3. Use `<picture>` element with srcset
4. Add `loading="lazy"` for below-fold images
5. Always include `width` and `height` attributes

## Questions?

For issues or questions about this optimization:
- Check browser console for image loading errors
- Verify WebP files are created correctly: `file images/hero/hero-bg.webp`
- Test file sizes: `du -h images/hero/*`
