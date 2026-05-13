import React, { useMemo, useState, useEffect } from 'react';
import krakowData from './data/krakow.json';
import USIChart from './components/USIChart';
import ExportButton from './components/ExportButton';
import { aggregateGaussian, generateTimeline, generatePremiumTimeline } from './utils/math';
import { USI_THEME } from './theme';

function App() {
  // Parse search params for parametric rendering
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const mode = params.get('mode'); // 'render', 'premium'
  const dataUrl = params.get('dataUrl');

  const [sigma, setSigma] = useState(parseFloat(params.get('sigma')) || 0.8);
  const [data, setData] = useState(krakowData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dataUrl) {
      setLoading(true);
      fetch(dataUrl)
        .then(res => res.json())
        .then(json => {
          setData(json);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load external data", err);
          setLoading(false);
        });
    }
  }, [dataUrl]);

  const config = useMemo(() => {
    if (mode !== 'render' && mode !== 'premium') return null;
    
    const isPremium = mode === 'premium';
    const timeRange = (params.get('timeRange') || (isPremium ? '0,11' : '-2,2')).split(',').map(Number);
    
    return {
      chartType: params.get('chartType') || 'Fasady',
      timeRange,
      colorA: params.get('colorA') || (isPremium ? '#f39200' : USI_THEME.colors.magenta),
      colorB: params.get('colorB') || (isPremium ? '#ffd200' : USI_THEME.colors.orange),
      width: parseInt(params.get('width')) || 1000,
      height: parseInt(params.get('height')) || 500,
      title: params.get('title') || 'Analiza Standardu',
      premium: isPremium || params.get('premium') === 'true'
    };
  }, [mode, params]);

  // Mocking timeline quarters
  const enrichedData = useMemo(() => {
    const isPremium = mode === 'premium';
    const qCount = isPremium ? 12 : 5;
    const qOffset = isPremium ? 0 : -2;

    return data.map((item, idx) => ({
      ...item,
      Q: item.Q !== undefined ? item.Q : (idx % qCount) + qOffset
    }));
  }, [data, mode]);

  // Single chart data for render mode
  const renderChartData = useMemo(() => {
    if (!config) return null;
    let timeline;
    if (config.premium) {
      timeline = generatePremiumTimeline(2022, 1, 12);
    } else {
      timeline = generateTimeline(config.timeRange[0], config.timeRange[1], 0.5);
    }
    return aggregateGaussian(enrichedData, config.chartType, sigma, timeline);
  }, [config, enrichedData, sigma]);

  // Dashboard data
  const DASHBOARD_TIMELINE = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
  const fasadyData = useMemo(() => aggregateGaussian(enrichedData, 'Fasady', sigma, DASHBOARD_TIMELINE), [enrichedData, sigma]);
  const balkonyData = useMemo(() => aggregateGaussian(enrichedData, 'Balkony', sigma, DASHBOARD_TIMELINE), [enrichedData, sigma]);

  // If in 'render' or 'premium' mode, show only the requested chart
  if ((mode === 'render' || mode === 'premium') && config) {
    return (
      <div id="single-chart-export-target" style={{ 
        display: 'inline-block',
        background: USI_THEME.colors.paper,
        padding: '20px'
      }}>
        <USIChart 
          data={renderChartData} 
          title={config.title}
          colorA={config.colorA}
          colorB={config.colorB}
          width={config.width}
          height={config.height}
          premium={config.premium}
        />
        <div style={{ 
          marginTop: '10px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'Signika'
        }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '12px', color: USI_THEME.colors.graphite }}>Wariancja (Sigma):</label>
              <input 
                type="range" 
                min="0.1" 
                max="2.0" 
                step="0.1" 
                value={sigma} 
                onChange={(e) => setSigma(parseFloat(e.target.value))}
              />
              <span style={{ fontWeight: 'bold' }}>{sigma}</span>
           </div>
           <ExportButton targetId="single-chart-export-target" fileName={`usi-${config.chartType.toLowerCase()}`} />
        </div>
      </div>
    );
  }

  // Otherwise show the standard dashboard
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '40px'
      }}>
        <div>
          <h1 style={{ fontSize: '32px', color: USI_THEME.colors.ink, fontFamily: 'Signika' }}>USI Charts Renderer</h1>
          <p style={{ color: USI_THEME.colors.graphite, fontFamily: 'Signika' }}>Generator statycznych grafik rynkowych</p>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right', fontFamily: 'Signika' }}>
            <label style={{ display: 'block', fontSize: '12px', color: USI_THEME.colors.graphite }}>Wariancja (Sigma)</label>
            <input 
              type="range" 
              min="0.1" 
              max="2.0" 
              step="0.1" 
              value={sigma} 
              onChange={(e) => setSigma(parseFloat(e.target.value))}
            />
            <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>{sigma}</span>
          </div>
          <ExportButton targetId="report-container" fileName="usi-krakow-dashboard" />
        </div>
      </header>

      <div id="report-container" style={{ padding: '20px', background: USI_THEME.colors.paper }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ gridColumn: 'span 2' }}>
             <USIChart 
               data={fasadyData} 
               title="usi-star-4: Elewacje i Fasady" 
               colorA={USI_THEME.colors.magenta}
               colorB={USI_THEME.colors.orange}
             />
          </div>
          <USIChart 
            data={balkonyData} 
            title="usi-star-4: Balkony i Loggie" 
            colorA={USI_THEME.colors.blue}
            colorB={USI_THEME.colors.green}
          />
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ marginBottom: '12px' }}>Tryb Parametryczny (Link API)</h3>
            <p style={{ fontSize: '14px', color: USI_THEME.colors.graphite, marginBottom: '16px' }}>
              Możesz wywołać ten renderer z parametrami, aby wygenerować konkretny wykres.
            </p>
            <code style={{ fontSize: '11px', background: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
              ?mode=render&chartType=Fasady&colorA=%23E5145B&colorB=%23F39200&width=1000&height=600
            </code>
            <a 
              href="?mode=premium&chartType=Fasady&colorA=%23f39200&colorB=%23ffd200&width=1200&height=600"
              style={{ marginTop: '16px', color: USI_THEME.colors.magenta, fontWeight: 'bold', textDecoration: 'none', display: 'block' }}
            >
              Testuj Premium (12 kwartałów) →
            </a>
          </div>
        </div>

        <footer style={{ 
          marginTop: '40px', 
          borderTop: `1px solid ${USI_THEME.colors.mist}`,
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'Signika'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ 
               width: '40px', 
               height: '40px', 
               background: 'linear-gradient(135deg, #E5145B, #F39200)',
               borderRadius: '8px'
             }}></div>
             <span style={{ fontWeight: '700', letterSpacing: '1px' }}>USI TRACKER</span>
          </div>
          <div style={{ color: USI_THEME.colors.graphite, fontSize: '12px' }}>
            © Urban Standard Index | {new Date().toLocaleDateString()}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
