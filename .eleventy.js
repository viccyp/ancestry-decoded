module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");

  eleventyConfig.addFilter("padSlide", (n) => String(n).padStart(2, "0"));

  eleventyConfig.addFilter("formatPercent", (n) => `${n}%`);

  /** Build SVG donut segment attrs from [{ pct, color }] */
  eleventyConfig.addFilter("donutSegments", (segments) => {
    let offset = 0;
    return segments.map((seg) => {
      const item = {
        pct: seg.pct,
        color: seg.color,
        dasharray: `${seg.pct} 100`,
        dashoffset: offset === 0 ? 0 : -offset,
      };
      offset += seg.pct;
      return item;
    });
  });

  /** Join ancestry regions: "63% Coastal European · 24% West African" */
  eleventyConfig.addFilter("ancestryLine", (regions) =>
    regions
      .map((r) => `<span class="big">${r.percent}%</span> ${r.region}`)
      .join(" · ")
  );

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      data: "_data",
    },
  };
};
