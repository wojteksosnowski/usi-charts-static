/**
 * Gaussian weight function
 * @param {number} x - The point to evaluate (e.g. current quarter)
 * @param {number} mu - The mean (e.g. project quarter)
 * @param {number} sigma - The standard deviation (variance control)
 * @returns {number} The weight
 */
export const gaussianWeight = (x, mu, sigma) => {
  const exponent = -0.5 * Math.pow((x - mu), 2) / (4 * sigma);
  const amplitude = 10 / 4 / Math.sqrt(2 * Math.PI);
  return amplitude * Math.exp(exponent);
};

/**
 * Aggregates market data using Gaussian weighting over a timeline
 * @param {Array} data - List of investments
 * @param {string} category - Category to aggregate (e.g. 'Fasady')
 * @param {number} sigma - Variance control from slider
 * @param {Array} timeline - List of quarters to evaluate
 * @returns {Array} Aggregated data for charting
 */
export const aggregateGaussian = (data, category, sigma, timeline) => {
  return timeline.map(t => {
    const targetQ = typeof t === 'object' ? t.Q : t;
    const label = typeof t === 'object' ? t.label : t;
    
    const result = { quarter: label, Q: targetQ };
    let totalWeightedMieszkania = 0;
    
    const ratings = [0, 1, 2, 3, 4];
    ratings.forEach(r => result[`level${r}`] = 0);

    data.forEach(item => {
      // In a real app, this would be a quarter number or relative offset
      const itemQ = item.Q !== undefined ? item.Q : 0; 
      const weight = gaussianWeight(targetQ, itemQ, sigma);
      const mieszkania = item['Liczba Mieszkań'] || 0;
      
      if (item[category] !== null && item[category] !== undefined) {
        result[`level${item[category]}`] += mieszkania * weight;
        totalWeightedMieszkania += mieszkania * weight;
      }
    });

    // Normalize to percentages
    if (totalWeightedMieszkania > 0) {
      ratings.forEach(r => {
        result[`level${r}`] = (result[`level${r}`] / totalWeightedMieszkania) * 100;
      });
    }

    return result;
  });
};

/**
 * Generates a timeline array based on range and step
 */
export const generateTimeline = (start, end, step = 0.5) => {
  const timeline = [];
  for (let q = start; q <= end; q += step) {
    timeline.push(q);
  }
  return timeline;
};

/**
 * Generates 12 quarters for premium mode
 */
export const generatePremiumTimeline = (startYear = 2022, startQ = 1, count = 12) => {
  const timeline = [];
  let currentYear = startYear;
  let currentQ = startQ;
  
  for (let i = 0; i < count; i++) {
    timeline.push({
      Q: i,
      label: `${currentQ}Q${currentYear.toString().slice(-2)}`
    });
    
    currentQ++;
    if (currentQ > 4) {
      currentQ = 1;
      currentYear++;
    }
  }
  return timeline;
};
