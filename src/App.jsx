import React, { useMemo, useState, useEffect } from 'react';
import krakowData from './data/krakow.json';
import USIChart from './components/USIChart';
import ExportButton from './components/ExportButton';
import { aggregateGaussian, generatePremiumTimeline } from './utils/math';
import { USI_THEME } from './theme';

function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const dataUrl = params.get('dataUrl');

  const [sigma, setSigma] = useState(parseFloat(params.get('sigma')) || 0.8);
  const [data, setData] = useState(krakowData);

  useEffect(() => {
    if (dataUrl) {
      fetch(dataUrl)
        .then(res => res.json())
        .then(json => setData(json))
        .catch(err => console.error("Failed to load external data", err));
    }
  }, [dataUrl]);

  const config = useMemo(() => ({
    chartType: params.get('chartType') || 'Fasady',
    colorA: params.get('colorA') || '#f39200',
    colorB: params.get('colorB') || '#ffd200',
    width: parseInt(params.get('width')) || 1000,
    height: parseInt(params.get('height')) || 500,
    title: params.get('title') || '',
  }), [params]);

  const enrichedData = useMemo(() => data.map((item, idx) => ({
    ...item,
    Q: item.Q !== undefined ? item.Q : (idx % 12)
  })), [data]);

  const chartData = useMemo(() => {
    const timeline = generatePremiumTimeline(2022, 1, 12);
    return aggregateGaussian(enrichedData, config.chartType, sigma, timeline);
  }, [config.chartType, enrichedData, sigma]);

  return (
    <div id="single-chart-export-target" style={{
      display: 'inline-block',
      background: USI_THEME.colors.paper,
      padding: '20px'
    }}>
      <USIChart
        data={chartData}
        title={config.title}
        colorA={config.colorA}
        colorB={config.colorB}
        width={config.width}
        height={config.height}
        premium={true}
      />
    </div>
  );
}

export default App;
