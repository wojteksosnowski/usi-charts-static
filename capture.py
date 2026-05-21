"""
Generate chart PNG via the API server.

Prerequisites:
  1. npm run dev       (Vite on :5173)
  2. npm run server    (API on :3001)
"""
import requests

def get_chart(chart_type='Fasady', color_a='#f39200', color_b='#ffd200',
              width=1200, height=400, sigma=0.8, title='', output='chart.png'):
    params = {
        'chartType': chart_type,
        'colorA': color_a,
        'colorB': color_b,
        'width': width,
        'height': height,
        'sigma': sigma,
    }
    if title:
        params['title'] = title

    resp = requests.get('http://127.0.0.1:3001/chart', params=params)
    resp.raise_for_status()

    with open(output, 'wb') as f:
        f.write(resp.content)
    print(f'Saved: {output} ({len(resp.content)} bytes)')


if __name__ == '__main__':
    get_chart(chart_type='Fasady', output='chart-fasady.png')
    get_chart(chart_type='Balkony', color_a='#1F6FE5', color_b='#00D4AA', output='chart-balkony.png')
