
## Project Structure

```
danielidrissa.blog/
├── eleventy.config.js
├── package.json
├── src/
│   ├── _includes/
│   │   ├── layouts/
│   │   │   └── base.njk
│   │   └── partials/
│   │       ├── header.njk
│   │       └── sticky-nav.njk
│   ├── _data/
│   │   └── site.json
│   ├── css/
│   │   └── styles.css
│   ├── content/
│   │   ├── sermons/
│   │   ├── videos/
│   │   ├── audio/
│   │   └── images/
│   ├── assets/
│   │   └── audio/
│   ├── index.njk
│   ├── about.njk
│   └── sermons.njk
│   └── videos.njk
│   └── audio.njk
│   └── images.njk
└── .eleventyignore
```

---

## 1. Configuration (`eleventy.config.js`)

```javascript
// eleventy.config.js
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const eleventyImage = require("@11ty/eleventy-img");
const embedYouTube = require("eleventy-plugin-youtube-embed");

module.exports = function(eleventyConfig) {
  // ─────────────────────────────────────────
  // PLUGINS
  // ─────────────────────────────────────────
  
  // Base plugin for HTML transformations
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  
  // YouTube embed plugin
  eleventyConfig.addPlugin(embedYouTube, {
    lite: true, // Uses lite-youtube-embed for performance
    modestBranding: true
  });

  // ─────────────────────────────────────────
  // PASSTHROUGH COPY
  // ─────────────────────────────────────────
  
  // Audio files
  eleventyConfig.addPassthroughCopy("src/assets/audio/");
  
  // Other static assets
  eleventyConfig.addPassthroughCopy("src/css/");
  eleventyConfig.addPassthroughCopy("src/assets/images/");

  // ─────────────────────────────────────────
  // COLLECTIONS
  // ─────────────────────────────────────────
  
  // Sermons collection from /content/sermons/
  eleventyConfig.addCollection("sermons", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/sermons/*.md")
      .sort((a, b) => b.date - a.date); // Newest first
  });

  // Videos collection from /content/videos/
  eleventyConfig.addCollection("videos", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/videos/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Audio collection from /content/audio/
  eleventyConfig.addCollection("audio", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/audio/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Images collection from /content/images/
  eleventyConfig.addCollection("images", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/images/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // ─────────────────────────────────────────
  // IMAGE PROCESSING (@11ty/eleventy-img)
  // ─────────────────────────────────────────
  
  async function imageShortcode(src, alt, sizes = "100vw") {
    if (alt === undefined) {
      throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
    }

    let metadata = await eleventyImage(src, {
      widths: [300, 600, 900, 1200],
      formats: ["avif", "webp", "jpeg"],
      outputDir: "./_site/img/",
      urlPath: "/img/"
    });

    let lowsrc = metadata.jpeg[0];
    let highsrc = metadata.jpeg[metadata.jpeg.length - 1];

    return `<picture>
      ${Object.values(metadata).map(imageFormat => {
        return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`;
      }).join("\n")}
      <img
        src="${lowsrc.url}"
        width="${highsrc.width}"
        height="${highsrc.height}"
        alt="${alt}"
        loading="lazy"
        decoding="async">
    </picture>`;
  }

  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addLiquidShortcode("image", imageShortcode);
  eleventyConfig.addJavaScriptFunction("image", imageShortcode);

  // ─────────────────────────────────────────
  // FILTERS
  // ─────────────────────────────────────────
  
  // Date formatting
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // ─────────────────────────────────────────
  // WATCH TARGETS
  // ─────────────────────────────────────────
  
  eleventyConfig.addWatchTarget("./src/css/");

  // ─────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────
  
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};
```

---

## 2. Base Layout (`src/_includes/layouts/base.njk`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }} | {{ site.name }}</title>
  <meta name="description" content="{{ description or site.description }}">
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  
  <!-- Styles -->
  <link rel="stylesheet" href="/css/styles.css">
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
</head>
<body>
  <!-- Skip to content for accessibility -->
  <a href="#main-content" class="skip-link">Skip to content</a>

  <!-- Main Header -->
  {% include "partials/header.njk" %}

  <!-- Sticky Sub-Navigation -->
  {% include "partials/sticky-nav.njk" %}

  <!-- Main Content -->
  <main id="main-content" class="main-content">
    {{ content | safe }}
  </main>

  <!-- Footer -->
  <footer class="site-footer">
    <div class="container">
      <p>&copy; {{ site.currentYear }} {{ site.name }}. All rights reserved.</p>
    </div>
  </footer>

</body>
</html>
```

---

## 3. Header Partial (`src/_includes/partials/header.njk`)

```html
<header class="main-header">
  <div class="container header-container">
    <!-- Logo/Site Name -->
    <a href="/" class="site-brand">
      <span class="site-logo">{{ site.name }}</span>
    </a>

    <!-- Navigation -->
    <nav class="main-nav" aria-label="Main navigation">
      <a href="/" class="nav-link">Home</a>
    </nav>

    <!-- Quick Action Tools -->
    <div class="quick-actions">
      <button class="action-btn search-btn" aria-label="Search" title="Search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
      </button>
      
      <a href="https://twitter.com/yourhandle" class="action-btn social-btn" aria-label="Twitter" title="Twitter" target="_blank" rel="noopener">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
    </div>
  </div>
</header>
```

---

## 4. Sticky Navigation Partial (`src/_includes/partials/sticky-nav.njk`)

```html
<nav class="sticky-nav" aria-label="Content sections">
  <div class="container sticky-container">
    <ul class="sticky-nav-list">
      <li class="sticky-nav-item">
        <a href="/about/" class="sticky-nav-link{% if page.url == '/about/' %} is-active{% endif %}">About</a>
      </li>
      <li class="sticky-nav-item">
        <a href="/sermons/" class="sticky-nav-link{% if page.url == '/sermons/' or page.url | startsWith('/sermons/') %} is-active{% endif %}">Sermons</a>
      </li>
      <li class="sticky-nav-item">
        <a href="/videos/" class="sticky-nav-link{% if page.url == '/videos/' or page.url | startsWith('/videos/') %} is-active{% endif %}">Videos</a>
      </li>
      <li class="sticky-nav-item">
        <a href="/audio/" class="sticky-nav-link{% if page.url == '/audio/' or page.url | startsWith('/audio/') %} is-active{% endif %}">Audio</a>
      </li>
      <li class="sticky-nav-item">
        <a href="/images/" class="sticky-nav-link{% if page.url == '/images/' or page.url | startsWith('/images/') %} is-active{% endif %}">Images</a>
      </li>
    </ul>
  </div>
</nav>
```

---

## 5. CSS Styles (`src/css/styles.css`)

```css
/* ─────────────────────────────────────────
   CSS VARIABLES & RESET
   ───────────────────────────────────────── */

:root {
  /* Colors */
  --color-primary: #1a1a2e;
  --color-secondary: #16213e;
  --color-accent: #e94560;
  --color-text: #333333;
  --color-text-light: #666666;
  --color-background: #ffffff;
  --color-surface: #f8f9fa;
  --color-border: #e5e7eb;
  
  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-serif: 'Merriweather', Georgia, serif;
  
  /* Spacing */
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  
  /* Layout */
  --container-max: 1200px;
  --header-height: 64px;
  --sticky-nav-height: 56px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-sticky: 0 4px 6px -2px rgba(0, 0, 0, 0.1);
}

/* Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-text);
  background-color: var(--color-background);
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: var(--color-accent);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--color-primary);
}

/* ─────────────────────────────────────────
   ACCESSIBILITY
   ───────────────────────────────────────── */

.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: white;
  padding: 8px 16px;
  z-index: 100;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 0;
}

/* ─────────────────────────────────────────
   CONTAINER
   ───────────────────────────────────────── */

.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-md);
}

/* ─────────────────────────────────────────
   MAIN HEADER
   ───────────────────────────────────────── */

.main-header {
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  height: var(--header-height);
  position: relative;
  z-index: 50;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.site-brand {
  display: flex;
  align-items: center;
}

.site-logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.02em;
}

.site-logo:hover {
  color: var(--color-accent);
}

/* Main Navigation */
.main-nav {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.nav-link {
  font-weight: 500;
  color: var(--color-text);
  padding: var(--space-xs) 0;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--color-accent);
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link:hover {
  color: var(--color-primary);
}

/* Quick Actions */
.quick-actions {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: var(--color-surface);
  color: var(--color-accent);
}

.social-btn {
  color: var(--color-text);
}

/* ─────────────────────────────────────────
   STICKY SUB-NAVIGATION
   ───────────────────────────────────────── */

.sticky-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  height: var(--sticky-nav-height);
  transition: box-shadow 0.3s ease;
}

/* Shadow appears when sticky (scrolled) */
.sticky-nav.is-sticky {
  box-shadow: var(--shadow-sticky);
}

.sticky-container {
  height: 100%;
  display: flex;
  align-items: center;
}

.sticky-nav-list {
  display: flex;
  list-style: none;
  gap: var(--space-xs);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  width: 100%;
}

.sticky-nav-list::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.sticky-nav-item {
  flex-shrink: 0;
}

.sticky-nav-link {
  display: block;
  padding: var(--space-xs) var(--space-md);
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--color-text-light);
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.sticky-nav-link:hover {
  color: var(--color-primary);
  background-color: var(--color-surface);
}

.sticky-nav-link.is-active {
  color: var(--color-accent);
  background-color: rgba(233, 69, 96, 0.08);
  font-weight: 600;
}

/* ─────────────────────────────────────────
   MAIN CONTENT
   ───────────────────────────────────────── */

.main-content {
  min-height: calc(100vh - var(--header-height) - var(--sticky-nav-height) - 100px);
  padding: var(--space-xl) 0;
}

/* ─────────────────────────────────────────
   PAGE HEADER
   ───────────────────────────────────────── */

.page-header {
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.page-title {
  font-family: var(--font-serif);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-sm);
  line-height: 1.2;
}

.page-description {
  font-size: 1.125rem;
  color: var(--color-text-light);
  max-width: 600px;
}

/* ─────────────────────────────────────────
   CONTENT GRID (for listing pages)
   ───────────────────────────────────────── */

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-lg);
}

.content-card {
  background: var(--color-surface);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.content-card-image {
  aspect-ratio: 16 / 9;
  background: var(--color-border);
  overflow: hidden;
}

.content-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content-card-body {
  padding: var(--space-md);
}

.content-card-meta {
  display: flex;
  gap: var(--space-xs);
  font-size: 0.875rem;
  color: var(--color-text-light);
  margin-bottom: var(--space-xs);
}

.content-card-title {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-xs);
  line-height: 1.3;
}

.content-card-title a {
  color: inherit;
}

.content-card-title a:hover {
  color: var(--color-accent);
}

.content-card-excerpt {
  font-size: 0.95rem;
  color: var(--color-text-light);
  line-height: 1.5;
}

/* ─────────────────────────────────────────
   SINGLE POST STYLES
   ───────────────────────────────────────── */

.post-header {
  margin-bottom: var(--space-xl);
  text-align: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.post-title {
  font-family: var(--font-serif);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-md);
  line-height: 1.2;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-md);
  font-size: 0.95rem;
  color: var(--color-text-light);
}

.post-meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.post-meta-label {
  font-weight: 600;
  color: var(--color-text);
}

.post-content {
  max-width: 720px;
  margin: 0 auto;
  font-family: var(--font-serif);
  font-size: 1.125rem;
  line-height: 1.8;
}

.post-content h2,
.post-content h3 {
  font-family: var(--font-sans);
  font-weight: 700;
  color: var(--color-primary);
  margin-top: var(--space-xl);
  margin-bottom: var(--space-md);
  line-height: 1.3;
}

.post-content h2 {
  font-size: 1.75rem;
}

.post-content h3 {
  font-size: 1.375rem;
}

.post-content p {
  margin-bottom: var(--space-md);
}

.post-content ul,
.post-content ol {
  margin-bottom: var(--space-md);
  padding-left: var(--space-lg);
}

.post-content li {
  margin-bottom: var(--space-xs);
}

.post-content blockquote {
  border-left: 4px solid var(--color-accent);
  padding-left: var(--space-md);
  margin: var(--space-lg) 0;
  font-style: italic;
  color: var(--color-text-light);
}

/* ─────────────────────────────────────────
   AUDIO PLAYER STYLES
   ───────────────────────────────────────── */

.audio-player-container {
  background: var(--color-surface);
  border-radius: 12px;
  padding: var(--space-lg);
  margin: var(--space-lg) 0;
  border: 1px solid var(--color-border);
}

.audio-player-title {
  font-family: var(--font-sans);
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: var(--space-sm);
  color: var(--color-primary);
}

.audio-player {
  width: 100%;
  border-radius: 8px;
}

.audio-player audio {
  width: 100%;
  border-radius: 8px;
}

/* ─────────────────────────────────────────
   VIDEO EMBED STYLES
   ───────────────────────────────────────── */

.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  overflow: hidden;
  border-radius: 12px;
  background: var(--color-surface);
  margin: var(--space-lg) 0;
}

.video-container iframe,
.video-container lite-youtube {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
}

/* ─────────────────────────────────────────
   IMAGE GALLERY STYLES
   ───────────────────────────────────────── */

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--space-md);
  margin: var(--space-lg) 0;
}

.gallery-item {
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  background: var(--color-surface);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.05);
}

/* ─────────────────────────────────────────
   FOOTER
   ───────────────────────────────────────── */

.site-footer {
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: var(--space-lg) 0;
  text-align: center;
  color: var(--color-text-light);
  font-size: 0.875rem;
}

/* ─────────────────────────────────────────
   RESPONSIVE ADJUSTMENTS
   ───────────────────────────────────────── */

@media (max-width: 768px) {
  :root {
    --header-height: 56px;
  }
  
  .site-logo {
    font-size: 1.25rem;
  }
  
  .page-title {
    font-size: 1.875rem;
  }
  
  .post-title {
    font-size: 1.875rem;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .sticky-nav-link {
    padding: var(--space-xs) var(--space-sm);
    font-size: 0.875rem;
  }
}

/* ─────────────────────────────────────────
   UTILITY CLASSES
   ───────────────────────────────────────── */

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.text-center {
  text-align: center;
}

.mt-lg {
  margin-top: var(--space-lg);
}

.mb-lg {
  margin-bottom: var(--space-lg);
}
```

---

## 6. Site Data (`src/_data/site.json`)

```json
{
  "name": "danielidrissa.blog",
  "description": "Thoughts, sermons, and media from Daniel Idrissa",
  "url": "https://danielidrissa.blog",
  "currentYear": 2026
}
```

---

## 7. Content Examples

### Sermon Post (`src/content/sermons/faith-in-adversity.md`)

```markdown
---
title: "Faith in the Midst of Adversity"
date: 2026-03-15
speaker: "Daniel Idrissa"
topic: "Perseverance"
series: "Walking Through the Storm"
description: "An exploration of maintaining faith when facing life's greatest challenges, drawing from the book of James."
tags: ["faith", "trials", "james"]
---

## Introduction

When we face trials of many kinds, our natural response is often to question God's presence. Yet Scripture calls us to a different perspective.

## The Refining Process

James writes: *"Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance."*

This isn't a call to masochism or denial of pain. Rather, it's an invitation to...

## Three Keys to Persevering Faith

### 1. Perspective Shift
We must learn to see our circumstances through God's eternal lens rather than our temporary discomfort.

### 2. Community Support
Faith was never meant to be solitary. We need brothers and sisters who will...

### 3. Present Obedience
Even when we don't understand the "why," we can choose faithfulness in the "what."

## Conclusion

Adversity doesn't indicate absence. Often, it's in the fire that we feel God's presence most acutely.
```

### Audio Post (`src/content/audio/morning-devotional-march.md`)

```markdown
---
title: "Morning Devotional: March 2026"
date: 2026-03-01
duration: "12:34"
audioFile: "/assets/audio/morning-devotional-march-2026.mp3"
speaker: "Daniel Idrissa"
description: "A reflective morning meditation on Psalm 23 and God's shepherd heart."
tags: ["devotional", "psalms", "meditation"]
---

## Listen

<div class="audio-player-container">
  <div class="audio-player-title">{{ title }}</div>
  <audio controls class="audio-player">
    <source src="{{ audioFile }}" type="audio/mpeg">
    Your browser does not support the audio element.
  </audio>
</div>

## Transcript

*Good morning, friends.*

Today I want us to sit with one of the most beloved passages of Scripture: Psalm 23. But I want us to hear it fresh...

[Full transcript continues...]
```

### Video Post (`src/content/videos/introduction-to-hermeneutics.md`)

```markdown
---
title: "Introduction to Biblical Hermeneutics"
date: 2026-02-20
youtubeId: "dQw4w9WgXcQ"
duration: "45:30"
description: "A beginner-friendly introduction to the principles of interpreting Scripture accurately and faithfully."
tags: ["bible-study", "hermeneutics", "theology"]
---

## Overview

In this session, we cover the foundational principles every believer needs for sound biblical interpretation.

https://www.youtube.com/watch?v={{ youtubeId }}

## Key Points

1. **Context is King** - No verse exists in isolation
2. **Genre Matters** - Poetry isn't history, apocalypse isn't narrative
3. **Christ-Centered** - All Scripture points to Jesus
4. **Application vs. Interpretation** - First determine what it meant, then what it means

## Resources

- Download the study guide [PDF]
- Recommended reading: *How to Read the Bible for All Its Worth*
```

### Image Post (`src/content/images/holy-land-tour-2025.md`)

```markdown
---
title: "Journey Through the Holy Land: Winter 2025"
date: 2025-12-10
description: "Photographs from our recent pilgrimage to Israel and Palestine, capturing sites significant to biblical history."
location: "Israel & Palestine"
tags: ["travel", "holy-land", "photography"]
---

## The Sea of Galilee

{% image "src/assets/images/holy-land/galilee-dawn.jpg", "Dawn breaking over the Sea of Galilee with fishing boats in the distance" %}

Standing on the shores where Jesus called his first disciples, watching the same dawn break over the same waters...

## The Garden of Gethsemane

{% image "src/assets/images/holy-land/olive-trees.jpg", "Ancient olive trees in the Garden of Gethsemane" %}

These olive trees, some dating back 2,000 years, may have been silent witnesses to Jesus' anguished prayer...

## Via Dolorosa

[Additional images and reflections...]
```

---

## 8. Listing Pages

### Sermons Index (`src/sermons.njk`)

```html
---
layout: layouts/base.njk
title: Sermons
description: Messages and teachings from Daniel Idrissa
pagination:
  data: collections.sermons
  size: 10
  alias: sermons
---

<header class="page-header">
  <h1 class="page-title">{{ title }}</h1>
  <p class="page-description">{{ description }}</p>
</header>

<div class="content-grid">
  {% for sermon in sermons %}
  <article class="content-card">
    <div class="content-card-body">
      <div class="content-card-meta">
        <time datetime="{{ sermon.date | htmlDateString }}">{{ sermon.date | readableDate }}</time>
        {% if sermon.data.speaker %}
        <span>• {{ sermon.data.speaker }}</span>
        {% endif %}
      </div>
      <h2 class="content-card-title">
        <a href="{{ sermon.url }}">{{ sermon.data.title }}</a>
      </h2>
      {% if sermon.data.topic %}
      <p class="content-card-meta">Topic: {{ sermon.data.topic }}</p>
      {% endif %}
      {% if sermon.data.description %}
      <p class="content-card-excerpt">{{ sermon.data.description }}</p>
      {% endif %}
    </div>
  </article>
  {% endfor %}
</div>

{% if pagination.pages.length > 1 %}
<nav class="pagination" aria-label="Pagination">
  {% if pagination.previousPageHref %}
  <a href="{{ pagination.previousPageHref }}" class="pagination-link">← Previous</a>
  {% endif %}
  {% if pagination.nextPageHref %}
  <a href="{{ pagination.nextPageHref }}" class="pagination-link">Next →</a>
  {% endif %}
</nav>
{% endif %}
```

### Audio Index (`src/audio.njk`)

```html
---
layout: layouts/base.njk
title: Audio
description: Podcasts, devotionals, and audio teachings
---

<header class="page-header">
  <h1 class="page-title">{{ title }}</h1>
  <p class="page-description">{{ description }}</p>
</header>

<div class="content-grid">
  {% for item in collections.audio %}
  <article class="content-card">
    <div class="content-card-body">
      <div class="content-card-meta">
        <time datetime="{{ item.date | htmlDateString }}">{{ item.date | readableDate }}</time>
        {% if item.data.duration %}
        <span>• {{ item.data.duration }}</span>
        {% endif %}
      </div>
      <h2 class="content-card-title">
        <a href="{{ item.url }}">{{ item.data.title }}</a>
      </h2>
      {% if item.data.description %}
      <p class="content-card-excerpt">{{ item.data.description }}</p>
      {% endif %}
      {% if item.data.audioFile %}
      <audio controls style="width: 100%; margin-top: 1rem;">
        <source src="{{ item.data.audioFile }}" type="audio/mpeg">
      </audio>
      {% endif %}
    </div>
  </article>
  {% endfor %}
</div>
```

---

## 9. Package.json

```json
{
  "name": "danielidrissa.blog",
  "version": "1.0.0",
  "description": "Personal blog of Daniel Idrissa",
  "scripts": {
    "build": "npx @11ty/eleventy",
    "start": "npx @11ty/eleventy --serve --watch",
    "debug": "DEBUG=* npx @11ty/eleventy"
  },
  "keywords": ["blog", "eleventy", "11ty"],
  "author": "Daniel Idrissa",
  "license": "MIT",
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0",
    "@11ty/eleventy-img": "^4.0.0"
  },
  "dependencies": {
    "eleventy-plugin-youtube-embed": "^1.11.0"
  }
}
```

---

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create folder structure:**
   ```bash
   mkdir -p src/content/{sermons,videos,audio,images}
   mkdir -p src/assets/audio
   mkdir -p src/_includes/{layouts,partials}
   ```

3. **Add your audio files** to `src/assets/audio/`

4. **Run development server:**
   ```bash
   npm start
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

