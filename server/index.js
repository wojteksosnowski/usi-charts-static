import Fastify from 'fastify';
import { chromium } from 'playwright';

const VITE_URL = 'http://localhost:5173';
const PORT = 3001;

const app = Fastify({ logger: true });

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

  const params = new URLSearchParams({
    mode: 'premium',
    chartType,
    colorA,
    colorB,
    width,
    height,
    sigma,
    ...(title ? { title } : {})
  });

  const url = `${VITE_URL}/?${params.toString()}`;

  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await context.newPage();

  try {
    await page.setViewportSize({
      width: parseInt(width) + 100,
      height: parseInt(height) + 120
    });
    await page.goto(url);
    await page.waitForSelector('.usi-chart-container svg', { timeout: 10000 });

    const buffer = await page.locator('#single-chart-export-target').screenshot({
      type: 'png',
      omitBackground: false
    });

    reply.type('image/png').send(buffer);
  } finally {
    await browser.close();
  }
});

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) { app.log.error(err); process.exit(1); }
  console.log(`Chart API ready at http://localhost:${PORT}/chart`);
});
