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

const getUsiStarGroup = (i) => `
<g transform="translate(${i * 43}, 0)">
  <g transform="matrix(1,0,0,1,-702,-1746)"><g transform="matrix(1.61888,0,0,1.41418,0,0)"><g transform="matrix(0.617711,0,0,3.19619,-293.656,-1304.64)"><g transform="matrix(1.33333,0,0,0.294986,-1188.94,598.17)"><g transform="matrix(0.75,0,0,0.75,447.725,170.834)"><g transform="matrix(0.024,0,0,0.024,1624.38,641.241)">
    <path d="M6820.02,1591.25C6820.02,1591.25 6820.12,1112.14 6820.12,1065.04C6820.11,1059.78 6823.6,1055.16 6828.65,1053.7C6841.17,1050.18 6870.83,1045.17 6938.22,1045.17C7005.63,1045.17 7035.28,1050.19 7047.8,1053.71C7052.86,1055.17 7056.33,1059.79 7056.33,1065.05L7056.36,1591.25L7556.89,1428.64C7556.89,1428.64 7561.9,1427.01 7570.33,1433.27C7577.53,1444.11 7591.43,1470.79 7612.21,1534.86C7633.02,1599.01 7637.43,1628.84 7637.97,1641.88C7638.15,1647.14 7634.82,1651.89 7629.82,1653.52C7579.1,1669.99 7287.12,1764.81 7129.43,1816.02L7438.94,2242.06C7441.79,2246.29 7441.61,2251.89 7438.45,2255.94C7430.37,2266.14 7409.28,2287.6 7354.78,2327.16C7300.19,2366.78 7273.18,2380.19 7260.95,2384.73C7256.65,2386.3 7251.91,2385.22 7248.7,2382.12L6938.22,1954.95L6627.75,2382.11C6627.6,2382.26 6627.44,2382.4 6627.28,2382.54C6624.1,2385.32 6619.59,2386.22 6615.49,2384.73C6603.26,2380.19 6576.26,2366.78 6521.67,2327.16C6467.16,2287.6 6446.08,2266.14 6437.99,2255.94C6434.75,2251.79 6434.65,2245.99 6437.75,2241.73L6746.97,1816.08C6549.76,1752 6293.55,1668.76 6246.57,1653.49C6246.49,1653.46 6246.41,1653.44 6246.33,1653.41C6241.46,1651.71 6238.25,1647.05 6238.42,1641.88C6238.93,1628.89 6243.35,1599.13 6264.23,1534.85C6285.29,1470.03 6299.26,1443.53 6306.4,1432.95C6309.25,1428.78 6314.51,1426.99 6319.3,1428.55L6820.02,1591.25Z" fill="white" />
  </g></g></g></g></g></g>
</g>
`;

const getUsiZeroGroup = () => `
<g transform="translate(0, 0)">
  <g transform="matrix(1,0,0,1,-702,-1793)"><g transform="matrix(1.61888,0,0,1.41418,0,0)"><g transform="matrix(0.617711,0,0,0.707122,-306.424,719.093)"><g transform="matrix(0.00527145,0,0,0.00907903,1206.79,783.194)">
    <path d="M4562.1,1859.93C4562.1,831.947 3697.45,306.003 2445.75,306.003C1054.06,306.003 296.454,874.979 296.454,1845.58C296.454,2744.47 872.893,3428.2 2429.28,3428.2C3944.49,3428.2 4562.1,2739.69 4562.1,1859.93ZM3269.23,1888.62C3269.23,2773.16 2964.54,3208.26 2429.28,3208.26C1885.78,3208.26 1581.09,2763.59 1581.09,1869.49C1581.09,956.261 1885.78,516.381 2421.04,516.381C2972.78,516.381 3269.23,951.479 3269.23,1888.62Z" fill="white" />
  </g></g></g></g>
</g>
`;

const getStarsSvgDataUri = (lvl) => {
  let innerHtml = '';
  let width = 0;
  
  if (lvl === 0) {
    innerHtml = getUsiZeroGroup();
    width = 43;
  } else {
    for (let i = 0; i < lvl; i++) {
      innerHtml += getUsiStarGroup(i);
    }
    width = lvl * 43;
  }
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="48" viewBox="0 0 ${width} 48" style="fill-rule: evenodd; clip-rule: evenodd; stroke-linejoin: round; stroke-miterlimit: 2;">${innerHtml}</svg>`;
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
      const itemWidth = 24 * (43 / 48);
      const width = lvl === 0 ? itemWidth : lvl * itemWidth;
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
