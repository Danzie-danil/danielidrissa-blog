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
  
  // Static assets
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy({ "src/assets/favicon.svg": "favicon.svg" });

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

  // Limit filter
  eleventyConfig.addFilter("limit", (array, limit) => {
    return array.slice(0, limit);
  });

  // HTML Date String
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return new Date(dateObj).toISOString().split('T')[0];
  });

  // StartsWith filter (custom)
  eleventyConfig.addFilter("startsWith", (str, prefix) => {
    return str.startsWith(prefix);
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
