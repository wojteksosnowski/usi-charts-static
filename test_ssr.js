import React from 'react';
import { renderToString } from 'react-dom/server';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

const data = [
  { name: 'A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'B', uv: 3000, pv: 1398, amt: 2210 },
];

const SimpleChart = () => React.createElement(AreaChart, { width: 500, height: 400, data: data },
  React.createElement(CartesianGrid, { strokeDasharray: "3 3" }),
  React.createElement(XAxis, { dataKey: "name" }),
  React.createElement(YAxis, null),
  React.createElement(Area, { type: "monotone", dataKey: "uv", stroke: "#8884d8", fill: "#8884d8", isAnimationActive: false })
);

const html = renderToString(React.createElement(SimpleChart));
console.log(html);
