// Shortcode Generator für verschiedene CMS
class RecruitingChartShortcode {
  constructor() {
    this.baseUrl = "https://deine-domain.com/recruiting-potential"
  }

  // WordPress Shortcode
  generateWordPress(options = {}) {
    const attrs = Object.entries(options)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ")

    return `[recruiting_chart ${attrs}]`
  }

  // Webflow Embed Code
  generateWebflow(options = {}) {
    const config = {
      width: "100%",
      height: "600px",
      salary: "60000",
      commission: "25",
      ...options,
    }

    return `
<div id="recruiting-chart-container" style="width: ${config.width}; height: ${config.height};">
    <iframe 
        src="${this.baseUrl}?salary=${config.salary}&commission=${config.commission}" 
        width="100%" 
        height="100%" 
        frameborder="0"
        style="border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
    </iframe>
</div>`
  }

  // React Component
  generateReact(options = {}) {
    return `
import React from 'react';

const RecruitingChart = ({ 
    width = '100%', 
    height = '600px', 
    salary = '60000', 
    commission = '25' 
}) => {
    const iframeUrl = \`${this.baseUrl}?salary=\${salary}&commission=\${commission}\`;
    
    return (
        <iframe
            src={iframeUrl}
            width={width}
            height={height}
            frameBorder="0"
            style={{
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                maxWidth: '100%'
            }}
        />
    );
};

export default RecruitingChart;`
  }

  // Vue Component
  generateVue(options = {}) {
    return `
<template>
    <iframe
        :src="iframeUrl"
        :width="width"
        :height="height"
        frameborder="0"
        :style="iframeStyle"
    />
</template>

<script>
export default {
    name: 'RecruitingChart',
    props: {
        width: { type: String, default: '100%' },
        height: { type: String, default: '600px' },
        salary: { type: String, default: '60000' },
        commission: { type: String, default: '25' }
    },
    computed: {
        iframeUrl() {
            return \`${this.baseUrl}?salary=\${this.salary}&commission=\${this.commission}\`;
        },
        iframeStyle() {
            return {
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                maxWidth: '100%'
            };
        }
    }
};
</script>`
  }
}

// Usage Examples
const generator = new RecruitingChartShortcode()

console.log(
  "WordPress:",
  generator.generateWordPress({
    width: "800px",
    salary: "70000",
  }),
)

console.log(
  "Webflow:",
  generator.generateWebflow({
    height: "500px",
    commission: "30",
  }),
)
