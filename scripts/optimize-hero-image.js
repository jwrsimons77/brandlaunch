#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const SOURCE_IMAGE = path.join(__dirname, '../images/hero/57C9980E-9F97-47A7-B945-7F5288BA9B49.png');
const OUTPUT_DIR = path.join(__dirname, '../images/hero/optimized');
const IMAGE_NAME = 'hero';

// Responsive sizes (widths in pixels) - Mobile-first approach
// Original is 1536x1024, so max size is 1536w
const SIZES = [640, 750, 828, 1024, 1280, 1536];

// Format configurations - Aggressive compression for <250KB target
const FORMATS = [
  {
    ext: 'avif',
    options: { quality: 75, effort: 8 }, // effort: 0-9, higher = better compression but slower
  },
  {
    ext: 'webp',
    options: { quality: 80 },
  },
  {
    ext: 'jpg',
    options: { quality: 80, mozjpeg: true },
  },
];

async function ensureOutputDir() {
  try {
    await fs.access(OUTPUT_DIR);
  } catch {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`✓ Created output directory: ${OUTPUT_DIR}`);
  }
}

async function optimizeImage(width, format) {
  const outputPath = path.join(OUTPUT_DIR, `${IMAGE_NAME}-${width}.${format.ext}`);

  try {
    let pipeline = sharp(SOURCE_IMAGE)
      .resize(width, null, {
        withoutEnlargement: true,
        fit: 'inside',
      });

    // Apply format-specific conversion
    if (format.ext === 'avif') {
      pipeline = pipeline.avif(format.options);
    } else if (format.ext === 'webp') {
      pipeline = pipeline.webp(format.options);
    } else if (format.ext === 'jpg') {
      pipeline = pipeline.jpeg(format.options);
    }

    await pipeline.toFile(outputPath);

    const stats = await fs.stat(outputPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`✓ Generated: ${path.basename(outputPath)} (${sizeMB} MB)`);
  } catch (error) {
    console.error(`✗ Failed to generate ${outputPath}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🖼️  Starting hero image optimization...\n');
  console.log(`Source: ${SOURCE_IMAGE}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  // Ensure output directory exists
  await ensureOutputDir();

  // Check if source image exists
  try {
    await fs.access(SOURCE_IMAGE);
  } catch {
    console.error(`✗ Source image not found: ${SOURCE_IMAGE}`);
    process.exit(1);
  }

  // Get source image dimensions
  const metadata = await sharp(SOURCE_IMAGE).metadata();
  console.log(`Source dimensions: ${metadata.width}x${metadata.height}\n`);

  // Generate all variants
  let successCount = 0;
  let totalImages = SIZES.length * FORMATS.length;

  for (const width of SIZES) {
    for (const format of FORMATS) {
      try {
        await optimizeImage(width, format);
        successCount++;
      } catch (error) {
        console.error(`Failed to optimize ${width}px ${format.ext}`);
      }
    }
  }

  console.log(`\n✨ Optimization complete: ${successCount}/${totalImages} images generated`);

  if (successCount < totalImages) {
    console.error(`⚠️  Some images failed to generate`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
