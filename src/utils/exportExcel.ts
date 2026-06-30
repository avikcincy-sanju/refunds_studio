interface TierCalculation {
  basePrice: number;
  gstOnBasePrice: number;
  priceAfterGst: number;
  processingFee: number;
  gstOnProcessingFee: number;
  finalAIP: number;
  volume: number;
  tierTotal: number;
  totalGstOnBasePrice: number;
  totalProcessingFee: number;
  totalGstOnProcessingFee: number;
  totalForecastAIP: number;
  totalNetRevenue: number;
}

function escapeCell(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadExcel(
  individualCalcs: TierCalculation[],
  relayCalcs: TierCalculation[],
  gstPercent: string,
  processingFeePercent: string,
  gstOnProcessingFeePercent: string
) {
  const rows: string[] = [];
  const p = (n: number) => n.toFixed(2);

  rows.push('Edition Forecast');
  rows.push('');

  rows.push('RATES APPLIED');
  rows.push(`GST/VAT/TAX %,${escapeCell(gstPercent ? parseFloat(gstPercent).toFixed(2) : '0.00')}`);
  rows.push(`Processing Fee %,${escapeCell(processingFeePercent ? parseFloat(processingFeePercent).toFixed(2) : '0.00')}`);
  rows.push(`GST/VAT/TAX on Processing Fee %,${escapeCell(gstOnProcessingFeePercent ? parseFloat(gstOnProcessingFeePercent).toFixed(2) : '0.00')}`);
  rows.push('');

  const indivTierHeaders = individualCalcs.map((_, i) => `Tier ${i + 1}`).join(',');
  rows.push(`INDIVIDUAL ENTRY,${indivTierHeaders}`);
  rows.push(`Base Price,${individualCalcs.map(c => p(c.basePrice)).join(',')}`);
  rows.push(`GST/VAT/TAX on Base Price,${individualCalcs.map(c => p(c.gstOnBasePrice)).join(',')}`);
  rows.push(`Price After GST/VAT/TAX,${individualCalcs.map(c => p(c.priceAfterGst)).join(',')}`);
  rows.push(`Processing Fee,${individualCalcs.map(c => p(c.processingFee)).join(',')}`);
  rows.push(`GST/VAT/TAX on Processing Fee,${individualCalcs.map(c => p(c.gstOnProcessingFee)).join(',')}`);
  rows.push(`Final AIP,${individualCalcs.map(c => p(c.finalAIP)).join(',')}`);
  rows.push(`Volume,${individualCalcs.map(c => c.volume.toFixed(0)).join(',')}`);
  rows.push(`Total GST/VAT/TAX on Base Price,${individualCalcs.map(c => p(c.totalGstOnBasePrice)).join(',')}`);
  rows.push(`Total Processing Fee,${individualCalcs.map(c => p(c.totalProcessingFee)).join(',')}`);
  rows.push(`Total GST/VAT/TAX on Processing Fee,${individualCalcs.map(c => p(c.totalGstOnProcessingFee)).join(',')}`);
  rows.push(`Total Forecast AIP,${individualCalcs.map(c => p(c.totalForecastAIP)).join(',')}`);
  rows.push(`Total Net Revenue,${individualCalcs.map(c => p(c.totalNetRevenue)).join(',')}`);
  rows.push('');

  const indivRevenue = individualCalcs.reduce((s, c) => s + c.tierTotal, 0);
  const indivVolume = individualCalcs.reduce((s, c) => s + c.volume, 0);
  const indivAvgAIP = indivVolume > 0 ? indivRevenue / indivVolume : 0;
  const indivNetRevenue = individualCalcs.reduce((s, c) => s + c.totalNetRevenue, 0);
  rows.push('Individual Entry Forecast Summary');
  rows.push(`Total Forecast AIP,${p(indivRevenue)}`);
  rows.push(`Total Forecast Volume,${indivVolume.toFixed(0)}`);
  rows.push(`Average AIP,${p(indivAvgAIP)}`);
  rows.push(`Total Net Revenue,${p(indivNetRevenue)}`);
  rows.push('');

  const relayTierHeaders = relayCalcs.map((_, i) => `Tier ${i + 1}`).join(',');
  rows.push(`RELAY ENTRY,${relayTierHeaders}`);
  rows.push(`Base Price,${relayCalcs.map(c => p(c.basePrice)).join(',')}`);
  rows.push(`GST/VAT/TAX on Base Price,${relayCalcs.map(c => p(c.gstOnBasePrice)).join(',')}`);
  rows.push(`Price After GST/VAT/TAX,${relayCalcs.map(c => p(c.priceAfterGst)).join(',')}`);
  rows.push(`Processing Fee,${relayCalcs.map(c => p(c.processingFee)).join(',')}`);
  rows.push(`GST/VAT/TAX on Processing Fee,${relayCalcs.map(c => p(c.gstOnProcessingFee)).join(',')}`);
  rows.push(`Final AIP,${relayCalcs.map(c => p(c.finalAIP)).join(',')}`);
  rows.push(`Volume,${relayCalcs.map(c => c.volume.toFixed(0)).join(',')}`);
  rows.push(`Total GST/VAT/TAX on Base Price,${relayCalcs.map(c => p(c.totalGstOnBasePrice)).join(',')}`);
  rows.push(`Total Processing Fee,${relayCalcs.map(c => p(c.totalProcessingFee)).join(',')}`);
  rows.push(`Total GST/VAT/TAX on Processing Fee,${relayCalcs.map(c => p(c.totalGstOnProcessingFee)).join(',')}`);
  rows.push(`Total Forecast AIP,${relayCalcs.map(c => p(c.totalForecastAIP)).join(',')}`);
  rows.push(`Total Net Revenue,${relayCalcs.map(c => p(c.totalNetRevenue)).join(',')}`);
  rows.push('');

  const relayRevenue = relayCalcs.reduce((s, c) => s + c.tierTotal, 0);
  const relayVolume = relayCalcs.reduce((s, c) => s + c.volume, 0);
  const relayAvgAIP = relayVolume > 0 ? relayRevenue / relayVolume : 0;
  const relayNetRevenue = relayCalcs.reduce((s, c) => s + c.totalNetRevenue, 0);
  rows.push('Relay Entry Forecast Summary');
  rows.push(`Total Forecast AIP,${p(relayRevenue)}`);
  rows.push(`Total Forecast Volume,${relayVolume.toFixed(0)}`);
  rows.push(`Average AIP,${p(relayAvgAIP)}`);
  rows.push(`Total Net Revenue,${p(relayNetRevenue)}`);
  rows.push('');

  const totalRevenue = indivRevenue + relayRevenue;
  const totalVolume = indivVolume + relayVolume;
  const totalAvgAIP = totalVolume > 0 ? totalRevenue / totalVolume : 0;
  const totalNetRevenue = indivNetRevenue + relayNetRevenue;
  rows.push('TOTAL FORECAST (Individual Entry + Relay Entry combined)');
  rows.push(`Total Forecast AIP,${p(totalRevenue)}`);
  rows.push(`Total Forecast Volume,${totalVolume.toFixed(0)}`);
  rows.push(`Average AIP,${p(totalAvgAIP)}`);
  rows.push('');
  rows.push('TOTAL FORECAST NET REVENUE (Individual Entry + Relay Entry combined)');
  rows.push(`Total Forecast Net Revenue,${p(totalNetRevenue)}`);
  rows.push(`Individual Entry Net Revenue,${p(indivNetRevenue)}`);
  rows.push(`Relay Entry Net Revenue,${p(relayNetRevenue)}`);

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'edition_forecast.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
