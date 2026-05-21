import Fastify from 'fastify';
import * as echarts from 'echarts';
import { Resvg } from '@resvg/resvg-js';
import { aggregateGaussian, generatePremiumTimeline } from '../src/utils/math.js';
import krakowData from '../src/data/krakow.json' with { type: 'json' };

const PORT = 3001;
const app = Fastify({ logger: true });

// Helper to interpolate hex colors
const interpolateColor = (color1, color2, factor) => {
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const getStarsSvgDataUri = (lvl) => {
  const starPath = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
  const zeroPath = "M12,2 C17.52,2 22,6.48 22,12 C22,17.52 17.52,22 12,22 C6.48,22 2,17.52 2,12 C2,6.48 6.48,2 12,2 Z M12,4 C7.58,4 4,7.58 4,12 C4,16.42 7.58,20 12,20 C16.42,20 20,16.42 20,12 C20,7.58 16.42,4 12,4 Z";

  let innerHtml = '';
  let width = 0;
  if (lvl === 0) {
    innerHtml = `<path d="${zeroPath}" fill="white" />`;
    width = 24;
  } else {
    for (let i = 0; i < lvl; i++) {
      innerHtml += `<g transform="translate(${i * 18}, 0) scale(0.9)"><path d="${starPath}" fill="white" /></g>`;
    }
    width = lvl * 18 + 4;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="24" viewBox="0 0 ${width} 24">${innerHtml}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

app.get('/chart', async (request, reply) => {
  const {
    chartType = 'Fasady',
    colorA = '#f39200',
    colorB = '#ffd200',
    width = '1200',
    height = '400',
    sigma = '0.8',
    title = ''
  } = request.query;

  const numericWidth = parseInt(width);
  const numericHeight = parseInt(height);
  const numericSigma = parseFloat(sigma);

  // 1. Prepare data
  const enrichedData = krakowData.map((item, idx) => ({
    ...item,
    Q: item.Q !== undefined ? item.Q : (idx % 12)
  }));
  const timeline = generatePremiumTimeline(2022, 1, 12);
  const chartData = aggregateGaussian(enrichedData, chartType, numericSigma, timeline);

  const xAxisData = chartData.map(d => d.quarter);
  
  const colors = [
    '#2E2F31', // level0
    interpolateColor(colorA, colorB, 0.25),
    interpolateColor(colorA, colorB, 0.5),
    interpolateColor(colorA, colorB, 0.75),
    colorB
  ];

  // 2. Initialize ECharts in SSR mode
  const chart = echarts.init(null, null, {
    renderer: 'svg',
    ssr: true,
    width: numericWidth,
    height: numericHeight
  });

  const margins = 50;
  const gridLeft = margins;
  const gridRight = margins;
  const gridTop = margins + (title ? 40 : 0);
  const gridBottom = margins + 10;
  
  const axisWidth = numericWidth - gridLeft - gridRight;
  const columnWidth = axisWidth / (timeline.length - 1);

  let currentStack = 0;
  const lastIdx = chartData.length - 1;

  const series = [0, 1, 2, 3, 4].map(lvl => {
    const val = chartData[lastIdx][`level${lvl}`];
    let markPoint = undefined;
    if (val > 2) {
      const midY = currentStack + val / 2;
      const width = lvl === 0 ? 24 : lvl * 18 + 4;
      markPoint = {
        symbol: 'image://' + getStarsSvgDataUri(lvl),
        symbolSize: [width, 24],
        symbolOffset: [-width / 2 - 10, 0], // Shift them left so they don't clip on the right edge
        data: [
          { coord: [lastIdx, midY] }
        ]
      };
    }
    currentStack += val;

    return {
      name: `level${lvl}`,
      type: 'line',
      stack: 'Total',
      areaStyle: {
        color: 'transparent'
      },
      lineStyle: {
        color: '#ffffff',
        width: 1.5
      },
      symbol: 'none',
      smooth: true,
      data: chartData.map(d => d[`level${lvl}`]),
      markPoint: markPoint
    };
  });

  const option = {
    backgroundColor: {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [{ offset: 0, color: colorA }, { offset: 1, color: colorB }]
    },
    title: {
      text: title,
      left: margins,
      top: margins / 2,
      textStyle: { color: 'white', fontFamily: 'Signika', fontSize: 18 }
    },
    grid: {
      left: gridLeft,
      right: gridRight,
      bottom: gridBottom,
      top: gridTop,
      containLabel: false
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
      axisLabel: {
        interval: 0,
        color: 'white',
        fontFamily: 'Signika',
        fontSize: 20, // 2x bigger (was ~10px)
        fontWeight: 'lighter', // light
        formatter: function (value, index) {
          if (index === 0) return '';
          return `{a|${value}}`;
        },
        rich: {
          a: {
            padding: [0, columnWidth, 0, 0] // Shift left by half column width (because it's center aligned, right padding pushes it left)
          }
        }
      },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: { color: 'rgba(255,255,255,0.3)', type: 'solid' }
      }
    },
    yAxis: {
      type: 'value',
      max: 100,
      min: 0,
      axisLabel: {
        formatter: '{value}%',
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'Signika'
      },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false }
    },
    series: series
  };

  chart.setOption(option);
  const svgStr = chart.renderToSVGString();

  // 3. Convert SVG to PNG
  const resvg = new Resvg(svgStr, {
    font: { loadSystemFonts: true, defaultFontFamily: 'Arial' },
    fitTo: { mode: 'width', value: numericWidth },
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  reply.type('image/png').send(pngBuffer);
});

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) { app.log.error(err); process.exit(1); }
  console.log(`API ready at http://localhost:${PORT}/chart`);
});
