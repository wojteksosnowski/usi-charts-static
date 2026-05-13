import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, LabelList 
} from 'recharts';
import { USI_THEME } from '../theme';

/**
 * Interpolates between two hex colors
 */
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

const USIStar = ({ style = {} }) => (
  <svg width="14" height="16" viewBox="0 0 43 48" style={{ ...style, fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 }}>
    <g transform="matrix(1,0,0,1,-702,-1746)">
      <g transform="matrix(1.61888,0,0,1.41418,0,0)">
        <g transform="matrix(0.617711,0,0,3.19619,-293.656,-1304.64)">
          <g transform="matrix(1.33333,0,0,0.294986,-1188.94,598.17)">
            <g transform="matrix(0.75,0,0,0.75,447.725,170.834)">
              <g transform="matrix(0.024,0,0,0.024,1624.38,641.241)">
                <path d="M6820.02,1591.25C6820.02,1591.25 6820.12,1112.14 6820.12,1065.04C6820.11,1059.78 6823.6,1055.16 6828.65,1053.7C6841.17,1050.18 6870.83,1045.17 6938.22,1045.17C7005.63,1045.17 7035.28,1050.19 7047.8,1053.71C7052.86,1055.17 7056.33,1059.79 7056.33,1065.05L7056.36,1591.25L7556.89,1428.64C7561.9,1427.01 7567.38,1428.9 7570.33,1433.27C7577.53,1444.11 7591.43,1470.79 7612.21,1534.86C7633.02,1599.01 7637.43,1628.84 7637.97,1641.88C7638.15,1647.14 7634.82,1651.89 7629.82,1653.52C7579.1,1669.99 7287.12,1764.81 7129.43,1816.02L7438.94,2242.06C7441.79,2246.29 7441.61,2251.89 7438.45,2255.94C7430.37,2266.14 7409.28,2287.6 7354.78,2327.16C7300.19,2366.78 7273.18,2380.19 7260.95,2384.73C7256.65,2386.3 7251.91,2385.22 7248.7,2382.12L6938.22,1954.95L6627.75,2382.11C6627.6,2382.26 6627.44,2382.4 6627.28,2382.54C6624.1,2385.32 6619.59,2386.22 6615.49,2384.73C6603.26,2380.19 6576.26,2366.78 6521.67,2327.16C6467.16,2287.6 6446.08,2266.14 6437.99,2255.94C6434.75,2251.79 6434.65,2245.99 6437.75,2241.73L6746.97,1816.08C6549.76,1752 6293.55,1668.76 6246.57,1653.49C6246.49,1653.46 6246.41,1653.44 6246.33,1653.41C6241.46,1651.71 6238.25,1647.05 6238.42,1641.88C6238.93,1628.89 6243.35,1599.13 6264.23,1534.85C6285.29,1470.03 6299.26,1443.53 6306.4,1432.95C6309.25,1428.78 6314.51,1426.99 6319.3,1428.55L6820.02,1591.25Z" fill="currentColor" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
);

const USIZero = ({ style = {} }) => (
  <svg width="14" height="16" viewBox="0 0 43 48" style={{ ...style, fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 }}>
    <g transform="matrix(1,0,0,1,-702,-1793)">
      <g transform="matrix(1.61888,0,0,1.41418,0,0)">
        <g transform="matrix(0.617711,0,0,0.707122,-306.424,719.093)">
          <g transform="matrix(0.00527145,0,0,0.00907903,1206.79,783.194)">
            <path d="M4562.1,1859.93C4562.1,831.947 3697.45,306.003 2445.75,306.003C1054.06,306.003 296.454,874.979 296.454,1845.58C296.454,2744.47 872.893,3428.2 2429.28,3428.2C3944.49,3428.2 4562.1,2739.69 4562.1,1859.93ZM3269.23,1888.62C3269.23,2773.16 2964.54,3208.26 2429.28,3208.26C1885.78,3208.26 1581.09,2763.59 1581.09,1869.49C1581.09,956.261 1885.78,516.381 2421.04,516.381C2972.78,516.381 3269.23,951.479 3269.23,1888.62Z" fill="currentColor" />
          </g>
        </g>
      </g>
    </g>
  </svg>
);

const USILabel = ({ label, color: boxColor, showColorBox = false, textColor }) => {
  const labelStr = String(label);
  const isStar = labelStr.startsWith('usi-star-');
  const isZero = labelStr.startsWith('usi-zero-');
  const digit = isStar ? labelStr.split('-').pop() : '';

  const color = textColor || USI_THEME.colors.graphite;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Signika' }}>
      {showColorBox && (
        <div style={{ width: '12px', height: '12px', background: boxColor, borderRadius: '2px' }}></div>
      )}
      {isZero && (
        <USIZero style={{ color: color }} />
      )}
      {isStar && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <USIStar style={{ color: color }} />
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: color }}>{digit}</span>
        </div>
      )}
      {!isStar && !isZero && (
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: color }}>{label}</span>
      )}
    </div>
  );
};

const CustomYAxisTick = (props) => {
  const { x, y, payload } = props;
  if (!payload) return null;
  const label = payload.value;
  const labelStr = String(label);
  const isStar = labelStr.startsWith('usi-star-');
  const isZero = labelStr.startsWith('usi-zero-');
  const digit = isStar ? labelStr.split('-').pop() : '';

  return (
    <g transform={`translate(${x},${y})`}>
      {isZero && (
        <g transform="translate(-35, -8)">
           <USIZero style={{ color: '#666' }} />
        </g>
      )}
      {isStar && (
        <g transform="translate(-35, -8)">
          <USIStar style={{ color: '#666' }} />
          <text 
            x="17" 
            y="13" 
            textAnchor="start" 
            fill="#666" 
            style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'Signika' }}
          >
            {digit}
          </text>
        </g>
      )}
      {!isStar && !isZero && (
        <text 
          x="-10" 
          y="5" 
          textAnchor="end" 
          fill="#666" 
          style={{ fontSize: '12px', fontFamily: 'Signika' }}
        >
          {label}
        </text>
      )}
    </g>
  );
};

const USIChart = ({ 
  data, 
  title, 
  colorA = USI_THEME.colors.magenta, 
  colorB = USI_THEME.colors.orange,
  width = '100%',
  height = 400,
  premium = false
}) => {
  // Level colors interpolated between colorA and colorB
  const COLORS = {
    level4: colorB,
    level3: interpolateColor(colorA, colorB, 0.75),
    level2: interpolateColor(colorA, colorB, 0.5),
    level1: interpolateColor(colorA, colorB, 0.25),
    level0: USI_THEME.colors.graphiteDeep, // Zero level remains neutral/graphite
  };

  const LABELS = {
    level4: 'usi-star-4',
    level3: 'usi-star-3',
    level2: 'usi-star-2',
    level1: 'usi-star-1',
    level0: 'usi-zero-',
  };

  return (
    <div className="usi-chart-container" style={{ 
      width: typeof width === 'number' ? `${width}px` : width, 
      height: typeof height === 'number' ? `${height}px` : height,
      padding: '20px',
      background: premium ? `linear-gradient(180deg, ${colorA} 0%, ${colorB} 100%)` : 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      border: premium ? 'none' : '1px solid #eeedeb',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {title && <h3 style={{ 
        marginBottom: '16px', 
        color: premium ? 'white' : USI_THEME.colors.ink, 
        fontFamily: 'Signika' 
      }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={title ? "90%" : "100%"}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {Object.keys(COLORS).map(key => (
              <linearGradient key={key} id={`grad_${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[key]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS[key]} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid 
            strokeDasharray={premium ? "0" : "3 3"} 
            vertical={premium} 
            stroke={premium ? "rgba(255,255,255,0.3)" : USI_THEME.colors.mist} 
          />
          <XAxis 
            dataKey="quarter" 
            axisLine={false} 
            tickLine={false} 
            tick={{ 
              fill: premium ? 'white' : USI_THEME.colors.graphite, 
              fontSize: 12, 
              fontFamily: 'Signika' 
            }}
            dy={10}
          />
          {!premium && (
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: USI_THEME.colors.graphite, fontSize: 12, fontFamily: 'Signika' }}
              tickFormatter={(val) => `${val}%`}
              tick={<CustomYAxisTick />}
            />
          )}
          <Tooltip 
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontFamily: 'Signika'
            }}
          />
          {!premium && (
            <Legend 
              verticalAlign="top" 
              align="right"
              iconSize={0}
              content={({ payload }) => (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginBottom: '20px' }}>
                  {[...payload].reverse().map((entry, index) => (
                    <USILabel 
                      key={index} 
                      label={entry.value} 
                      color={entry.color} 
                      showColorBox={true} 
                    />
                  ))}
                </div>
              )}
            />
          )}
          
          {[0, 1, 2, 3, 4].map(lvl => (
            <Area
              key={lvl}
              type="monotone"
              dataKey={`level${lvl}`}
              stackId="1"
              stroke={premium ? "#ffffff" : COLORS[`level${lvl}`]}
              fill={premium ? "transparent" : `url(#grad_level${lvl})`}
              name={LABELS[`level${lvl}`]}
              strokeWidth={premium ? 1.5 : 2}
              isAnimationActive={!premium}
            >
              {premium && (
                <LabelList 
                  dataKey={`level${lvl}`} 
                  content={(props) => {
                    const { x, y, index, value } = props;
                    // Recharts LabelList passes index of the point
                    if (index !== data.length - 1) return null;
                    const label = LABELS[`level${lvl}`];
                    return (
                      <g transform={`translate(${x + 10}, ${y - 8})`}>
                         <foreignObject width="60" height="30">
                            <USILabel label={label} textColor="#ffffff" />
                         </foreignObject>
                      </g>
                    );
                  }}
                />
              )}
            </Area>
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default USIChart;
