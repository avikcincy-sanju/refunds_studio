import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { downloadExcel } from '../utils/exportExcel';
import { GstDropdown } from './GstDropdown';
import { ProcessingFeeDropdown } from './ProcessingFeeDropdown';
import { GstOnProcessingFeeDropdown } from './GstOnProcessingFeeDropdown';

interface TierData {
  basePrice: string;
  volume: string;
}

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

type CalcMode = 'forward' | 'reverse';

const EMPTY_TIERS: TierData[] = Array(8).fill(null).map(() => ({ basePrice: '', volume: '' }));
const EMPTY_RELAY_TIERS: TierData[] = Array(3).fill(null).map(() => ({ basePrice: '', volume: '' }));

const validateBasePriceInput = (value: string): string => {
  if (value === '' || value === '.') return value;
  const regex = /^\d*\.?\d{0,2}$/;
  if (regex.test(value)) {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue >= 0) return value;
  }
  return value.slice(0, -1);
};

const validateVolumeInput = (value: string): string => {
  if (value === '') return value;
  const regex = /^\d+$/;
  return regex.test(value) ? value : value.slice(0, -1);
};

function useTierCalculations(
  tiers: TierData[],
  gstPercent: string,
  processingFeePercent: string,
  gstOnProcessingFeePercent: string
) {
  const [calculations, setCalculations] = useState<TierCalculation[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalVolume, setTotalVolume] = useState<number>(0);
  const [blendedAIP, setBlendedAIP] = useState<number>(0);

  useEffect(() => {
    const gstRate = parseFloat(gstPercent) / 100 || 0;
    const feeRate = parseFloat(processingFeePercent) / 100 || 0;
    const gstFeeRate = parseFloat(gstOnProcessingFeePercent) / 100 || 0;
    const r2 = (n: number) => Math.round(n * 100) / 100;

    const newCalculations: TierCalculation[] = tiers.map(tier => {
      const base = parseFloat(tier.basePrice) || 0;
      const vol = parseFloat(tier.volume) || 0;
      const gstOnBase = r2(base * gstRate);
      const afterGst = r2(base + gstOnBase);
      const fee = r2(afterGst * feeRate);
      const gstOnFee = r2(fee * gstFeeRate);
      const finalAIP = r2(afterGst + fee + gstOnFee);
      const total = finalAIP * vol;
      return {
        basePrice: base,
        gstOnBasePrice: gstOnBase,
        priceAfterGst: afterGst,
        processingFee: fee,
        gstOnProcessingFee: gstOnFee,
        finalAIP,
        volume: vol,
        tierTotal: total,
        totalGstOnBasePrice: gstOnBase * vol,
        totalProcessingFee: fee * vol,
        totalGstOnProcessingFee: gstOnFee * vol,
        totalForecastAIP: finalAIP * vol,
        totalNetRevenue: base * vol,
      };
    });

    setCalculations(newCalculations);
    const revenue = newCalculations.reduce((sum, c) => sum + c.tierTotal, 0);
    const volume = newCalculations.reduce((sum, c) => sum + c.volume, 0);
    setTotalRevenue(revenue);
    setTotalVolume(volume);
    setBlendedAIP(volume > 0 ? revenue / volume : 0);
  }, [gstPercent, processingFeePercent, gstOnProcessingFeePercent, tiers]);

  return { calculations, totalRevenue, totalVolume, blendedAIP };
}

export function EditionForecast() {
  const [gstPercent, setGstPercent] = useState<string>('0');
  const [processingFeePercent, setProcessingFeePercent] = useState<string>('0');
  const [gstOnProcessingFeePercent, setGstOnProcessingFeePercent] = useState<string>('0');
  const [dropdownResetKey, setDropdownResetKey] = useState<number>(0);
  const [calcMode, setCalcMode] = useState<CalcMode>('forward');
  const [tiers, setTiers] = useState<TierData[]>(EMPTY_TIERS);
  const [relayTiers, setRelayTiers] = useState<TierData[]>(EMPTY_RELAY_TIERS);
  const precision = 2;

  // Reverse-calculate base price from a given Final AIP value using current dropdown rates.
  // Formula: finalAIP = base * (1+gst) * (1 + fee*(1+gstFee))  =>  base = finalAIP / divisor
  const reverseBasePrice = (finalAIP: number): number => {
    const gstRate = parseFloat(gstPercent) / 100 || 0;
    const feeRate = parseFloat(processingFeePercent) / 100 || 0;
    const gstFeeRate = parseFloat(gstOnProcessingFeePercent) / 100 || 0;
    const divisor = (1 + gstRate) * (1 + feeRate * (1 + gstFeeRate));
    if (divisor === 0) return 0;
    return Math.round((finalAIP / divisor) * 100) / 100;
  };

  // In reverse mode, tier.basePrice stores the entered Final AIP.
  // Convert to effective base prices before passing to the calculation hook.
  const effectiveTiers = calcMode === 'reverse'
    ? tiers.map(t => ({
        ...t,
        basePrice: t.basePrice !== '' ? String(reverseBasePrice(parseFloat(t.basePrice) || 0)) : '',
      }))
    : tiers;

  const effectiveRelayTiers = calcMode === 'reverse'
    ? relayTiers.map(t => ({
        ...t,
        basePrice: t.basePrice !== '' ? String(reverseBasePrice(parseFloat(t.basePrice) || 0)) : '',
      }))
    : relayTiers;

  const { calculations, totalRevenue, totalVolume, blendedAIP } = useTierCalculations(
    effectiveTiers, gstPercent, processingFeePercent, gstOnProcessingFeePercent
  );
  const {
    calculations: relayCalculations,
    totalRevenue: relayTotalRevenue,
    totalVolume: relayTotalVolume,
    blendedAIP: relayBlendedAIP,
  } = useTierCalculations(effectiveRelayTiers, gstPercent, processingFeePercent, gstOnProcessingFeePercent);

  const combinedRevenue = totalRevenue + relayTotalRevenue;
  const combinedVolume = totalVolume + relayTotalVolume;
  const combinedAvgAIP = combinedVolume > 0 ? combinedRevenue / combinedVolume : 0;
  const indivNetRevenue = calculations.reduce((s, c) => s + c.totalNetRevenue, 0);
  const relayNetRevenue = relayCalculations.reduce((s, c) => s + c.totalNetRevenue, 0);
  const combinedNetRevenue = indivNetRevenue + relayNetRevenue;

  const handleGstChange = (value: string) => setGstPercent(value);
  const handleProcessingFeeChange = (value: string) => setProcessingFeePercent(value);
  const handleGstOnProcessingFeePercentChange = (value: string) => setGstOnProcessingFeePercent(value);

  const updateTierBasePrice = (index: number, value: string) => {
    const validated = validateBasePriceInput(value);
    const updated = [...tiers];
    updated[index] = { ...updated[index], basePrice: validated };
    setTiers(updated);
  };
  const updateTierVolume = (index: number, value: string) => {
    const validated = validateVolumeInput(value);
    const updated = [...tiers];
    updated[index] = { ...updated[index], volume: validated };
    setTiers(updated);
  };
  const updateRelayTierBasePrice = (index: number, value: string) => {
    const validated = validateBasePriceInput(value);
    const updated = [...relayTiers];
    updated[index] = { ...updated[index], basePrice: validated };
    setRelayTiers(updated);
  };
  const updateRelayTierVolume = (index: number, value: string) => {
    const validated = validateVolumeInput(value);
    const updated = [...relayTiers];
    updated[index] = { ...updated[index], volume: validated };
    setRelayTiers(updated);
  };

  const handleModeChange = (mode: CalcMode) => {
    setCalcMode(mode);
    setTiers(prev => prev.map(t => ({ basePrice: '', volume: t.volume })));
    setRelayTiers(prev => prev.map(t => ({ basePrice: '', volume: t.volume })));
  };

  const handleClearAll = () => {
    setGstPercent('0');
    setProcessingFeePercent('0');
    setGstOnProcessingFeePercent('0');
    setDropdownResetKey(k => k + 1);
    setTiers(Array(8).fill(null).map(() => ({ basePrice: '', volume: '' })));
    setRelayTiers(Array(3).fill(null).map(() => ({ basePrice: '', volume: '' })));
  };

  const handleDownload = () => {
    downloadExcel(calculations, relayCalculations, gstPercent, processingFeePercent, gstOnProcessingFeePercent);
  };

  const blueCell = (idx: number, light: string, dark: string) =>
    `py-2 px-2 text-center font-mono text-xs border-l border-blue-100 ${idx % 2 === 0 ? light : dark}`;
  const tealCell = (idx: number, light: string, dark: string) =>
    `py-2 px-2 text-center font-mono text-xs border-l border-teal-100 ${idx % 2 === 0 ? light : dark}`;

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm p-6 border border-gray-200/50">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Edition Forecast</h2>
          <div className="flex items-center gap-3 flex-wrap">

            {/* Mode toggle */}
            <div className="flex rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <button
                onClick={() => handleModeChange('forward')}
                className={`px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                  calcMode === 'forward'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Final AIP Forward Calculation
              </button>
              <button
                onClick={() => handleModeChange('reverse')}
                className={`px-4 py-2.5 text-sm font-medium transition-all border-l border-gray-200 whitespace-nowrap ${
                  calcMode === 'reverse'
                    ? 'bg-amber-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Reverse Base Price Calculation
              </button>
            </div>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
            >
              <Download size={15} />
              Download to Excel
            </button>
            <button
              onClick={handleClearAll}
              className="px-5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-700 hover:bg-red-100 transition-all"
            >
              Clear All Fields
            </button>
          </div>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <GstDropdown key={dropdownResetKey} value={gstPercent} onChange={handleGstChange} />
          </div>
          <div>
            <ProcessingFeeDropdown key={dropdownResetKey} value={processingFeePercent} onChange={handleProcessingFeeChange} />
          </div>
          <div>
            <GstOnProcessingFeeDropdown key={dropdownResetKey} value={gstOnProcessingFeePercent} onChange={handleGstOnProcessingFeePercentChange} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 px-3 font-semibold text-gray-900 bg-gray-50 rounded-tl-xl whitespace-nowrap w-36"></th>
                <th colSpan={8} className="text-center py-2 px-3 font-semibold text-blue-800 bg-blue-50 border-l border-blue-200">
                  Individual Entry
                </th>
                <th className="py-2 px-1 bg-gray-200 w-2"></th>
                <th colSpan={3} className="text-center py-2 px-3 font-semibold text-teal-800 bg-teal-50 border-l border-teal-200 rounded-tr-xl">
                  Relay Entry
                </th>
              </tr>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-3 bg-gray-50 text-left text-xs font-medium text-gray-500 whitespace-nowrap"></th>
                {[1,2,3,4,5,6,7,8].map(n => (
                  <th key={n} className={`py-2 px-2 text-center text-xs font-semibold border-l border-blue-100 ${n % 2 === 0 ? 'bg-blue-100 text-blue-800' : 'bg-blue-50 text-blue-700'}`}>T{n}</th>
                ))}
                <th className="bg-gray-200 w-2"></th>
                {[1,2,3].map(n => (
                  <th key={n} className={`py-2 px-2 text-center text-xs font-semibold border-l border-teal-100 ${n % 2 === 0 ? 'bg-teal-100 text-teal-800' : 'bg-teal-50 text-teal-700'}`}>T{n}</th>
                ))}
              </tr>
            </thead>
            <tbody>

              {/* Base Price — editable in forward, greyed read-only in reverse */}
              <tr className="border-b border-gray-200">
                <td className="py-2 px-3 font-medium text-gray-700 bg-gray-50 whitespace-nowrap text-xs">Base Price</td>
                {tiers.map((tier, idx) => (
                  <td key={idx} className={`py-1 px-1 text-center border-l border-blue-100 ${idx % 2 === 0 ? 'bg-blue-50/60' : 'bg-blue-100/60'}`}>
                    {calcMode === 'forward' ? (
                      <input
                        type="text"
                        value={tier.basePrice}
                        onChange={e => updateTierBasePrice(idx, e.target.value)}
                        className="w-full px-1 py-1.5 bg-white border border-blue-200 rounded text-center text-xs focus:ring-1 focus:ring-blue-400/30 focus:border-blue-400 font-medium"
                        placeholder="0.00"
                      />
                    ) : (
                      <div className="w-full px-1 py-1.5 bg-gray-100 border border-gray-200 rounded text-center text-xs font-mono text-gray-400 select-none">
                        {tier.basePrice !== '' ? reverseBasePrice(parseFloat(tier.basePrice) || 0).toFixed(precision) : '—'}
                      </div>
                    )}
                  </td>
                ))}
                <td className="bg-gray-200 w-2"></td>
                {relayTiers.map((tier, idx) => (
                  <td key={idx} className={`py-1 px-1 text-center border-l border-teal-100 ${idx % 2 === 0 ? 'bg-teal-50/60' : 'bg-teal-100/60'}`}>
                    {calcMode === 'forward' ? (
                      <input
                        type="text"
                        value={tier.basePrice}
                        onChange={e => updateRelayTierBasePrice(idx, e.target.value)}
                        className="w-full px-1 py-1.5 bg-white border border-teal-200 rounded text-center text-xs focus:ring-1 focus:ring-teal-400/30 focus:border-teal-400 font-medium"
                        placeholder="0.00"
                      />
                    ) : (
                      <div className="w-full px-1 py-1.5 bg-gray-100 border border-gray-200 rounded text-center text-xs font-mono text-gray-400 select-none">
                        {tier.basePrice !== '' ? reverseBasePrice(parseFloat(tier.basePrice) || 0).toFixed(precision) : '—'}
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200">
                <td className="py-2 px-3 font-medium text-gray-600 whitespace-nowrap text-xs bg-gray-50/80">GST/VAT/TAX on Base Price</td>
                {calculations.map((calc, idx) => (
                  <td key={idx} className={blueCell(idx, 'bg-blue-50/40 text-gray-800', 'bg-blue-100/40 text-gray-800')}>
                    {calc.gstOnBasePrice.toFixed(precision)}
                  </td>
                ))}
                <td className="bg-gray-200"></td>
                {relayCalculations.map((calc, idx) => (
                  <td key={idx} className={tealCell(idx, 'bg-teal-50/40 text-gray-800', 'bg-teal-100/40 text-gray-800')}>
                    {calc.gstOnBasePrice.toFixed(precision)}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200">
                <td className="py-2 px-3 font-medium text-gray-600 whitespace-nowrap text-xs bg-gray-50/50">Price After GST/VAT/TAX</td>
                {calculations.map((calc, idx) => (
                  <td key={idx} className={blueCell(idx, 'bg-blue-50/60 text-gray-800', 'bg-blue-100/60 text-gray-800')}>
                    {calc.priceAfterGst.toFixed(precision)}
                  </td>
                ))}
                <td className="bg-gray-200"></td>
                {relayCalculations.map((calc, idx) => (
                  <td key={idx} className={tealCell(idx, 'bg-teal-50/60 text-gray-800', 'bg-teal-100/60 text-gray-800')}>
                    {calc.priceAfterGst.toFixed(precision)}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200">
                <td className="py-2 px-3 font-medium text-gray-600 whitespace-nowrap text-xs bg-gray-50/80">Processing Fee</td>
                {calculations.map((calc, idx) => (
                  <td key={idx} className={blueCell(idx, 'bg-blue-50/40 text-gray-800', 'bg-blue-100/40 text-gray-800')}>
                    {calc.processingFee.toFixed(precision)}
                  </td>
                ))}
                <td className="bg-gray-200"></td>
                {relayCalculations.map((calc, idx) => (
                  <td key={idx} className={tealCell(idx, 'bg-teal-50/40 text-gray-800', 'bg-teal-100/40 text-gray-800')}>
                    {calc.processingFee.toFixed(precision)}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200">
                <td className="py-2 px-3 font-medium text-gray-600 whitespace-nowrap text-xs bg-gray-50/50">GST/VAT/TAX on Proc. Fee</td>
                {calculations.map((calc, idx) => (
                  <td key={idx} className={blueCell(idx, 'bg-blue-50/60 text-gray-800', 'bg-blue-100/60 text-gray-800')}>
                    {calc.gstOnProcessingFee.toFixed(precision)}
                  </td>
                ))}
                <td className="bg-gray-200"></td>
                {relayCalculations.map((calc, idx) => (
                  <td key={idx} className={tealCell(idx, 'bg-teal-50/60 text-gray-800', 'bg-teal-100/60 text-gray-800')}>
                    {calc.gstOnProcessingFee.toFixed(precision)}
                  </td>
                ))}
              </tr>

              {/* Final AIP — calculated in forward, editable inputs in reverse */}
              <tr className="border-b-2 border-gray-300">
                <td className="py-2 px-3 font-semibold text-gray-900 whitespace-nowrap text-xs bg-blue-900/5">Final AIP</td>
                {calcMode === 'forward'
                  ? calculations.map((calc, idx) => (
                      <td key={idx} className={`py-2 px-2 text-center font-mono font-semibold text-blue-800 text-xs border-l border-blue-200 ${idx % 2 === 0 ? 'bg-blue-100/70' : 'bg-blue-200/60'}`}>
                        {calc.finalAIP.toFixed(precision)}
                      </td>
                    ))
                  : tiers.map((tier, idx) => (
                      <td key={idx} className={`py-1 px-1 text-center border-l border-blue-200 ${idx % 2 === 0 ? 'bg-blue-100/70' : 'bg-blue-200/60'}`}>
                        <input
                          type="text"
                          value={tier.basePrice}
                          onChange={e => updateTierBasePrice(idx, e.target.value)}
                          className="w-full px-1 py-1.5 bg-white border border-blue-300 rounded text-center text-xs focus:ring-1 focus:ring-blue-400/30 focus:border-blue-400 font-semibold text-blue-800"
                          placeholder="0.00"
                        />
                      </td>
                    ))
                }
                <td className="bg-gray-200"></td>
                {calcMode === 'forward'
                  ? relayCalculations.map((calc, idx) => (
                      <td key={idx} className={`py-2 px-2 text-center font-mono font-semibold text-teal-800 text-xs border-l border-teal-200 ${idx % 2 === 0 ? 'bg-teal-100/70' : 'bg-teal-200/60'}`}>
                        {calc.finalAIP.toFixed(precision)}
                      </td>
                    ))
                  : relayTiers.map((tier, idx) => (
                      <td key={idx} className={`py-1 px-1 text-center border-l border-teal-200 ${idx % 2 === 0 ? 'bg-teal-100/70' : 'bg-teal-200/60'}`}>
                        <input
                          type="text"
                          value={tier.basePrice}
                          onChange={e => updateRelayTierBasePrice(idx, e.target.value)}
                          className="w-full px-1 py-1.5 bg-white border border-teal-300 rounded text-center text-xs focus:ring-1 focus:ring-teal-400/30 focus:border-teal-400 font-semibold text-teal-800"
                          placeholder="0.00"
                        />
                      </td>
                    ))
                }
              </tr>

              <tr className="border-b border-gray-200">
                <td className="py-2 px-3 font-medium text-gray-700 whitespace-nowrap text-xs bg-gray-50">Volume</td>
                {tiers.map((tier, idx) => (
                  <td key={idx} className={`py-1 px-1 text-center border-l border-blue-100 ${idx % 2 === 0 ? 'bg-blue-50/60' : 'bg-blue-100/60'}`}>
                    <input
                      type="text"
                      value={tier.volume}
                      onChange={e => updateTierVolume(idx, e.target.value)}
                      className="w-full px-1 py-1.5 bg-white border border-blue-200 rounded text-center text-xs focus:ring-1 focus:ring-blue-400/30 focus:border-blue-400 font-medium"
                      placeholder="0"
                    />
                  </td>
                ))}
                <td className="bg-gray-200"></td>
                {relayTiers.map((tier, idx) => (
                  <td key={idx} className={`py-1 px-1 text-center border-l border-teal-100 ${idx % 2 === 0 ? 'bg-teal-50/60' : 'bg-teal-100/60'}`}>
                    <input
                      type="text"
                      value={tier.volume}
                      onChange={e => updateRelayTierVolume(idx, e.target.value)}
                      className="w-full px-1 py-1.5 bg-white border border-teal-200 rounded text-center text-xs focus:ring-1 focus:ring-teal-400/30 focus:border-teal-400 font-medium"
                      placeholder="0"
                    />
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200">
                <td className="py-2 px-3 font-medium text-gray-600 whitespace-nowrap text-xs bg-gray-50/80">Total GST/VAT/TAX on Base Price</td>
                {calculations.map((calc, idx) => (
                  <td key={idx} className={blueCell(idx, 'bg-blue-50/40 text-gray-800', 'bg-blue-100/40 text-gray-800')}>
                    {calc.totalGstOnBasePrice.toFixed(precision)}
                  </td>
                ))}
                <td className="bg-gray-200"></td>
                {relayCalculations.map((calc, idx) => (
                  <td key={idx} className={tealCell(idx, 'bg-teal-50/40 text-gray-800', 'bg-teal-100/40 text-gray-800')}>
                    {calc.totalGstOnBasePrice.toFixed(precision)}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200">
                <td className="py-2 px-3 font-medium text-gray-600 whitespace-nowrap text-xs bg-gray-50/50">Total Processing Fee</td>
                {calculations.map((calc, idx) => (
                  <td key={idx} className={blueCell(idx, 'bg-blue-50/60 text-gray-800', 'bg-blue-100/60 text-gray-800')}>
                    {calc.totalProcessingFee.toFixed(precision)}
                  </td>
                ))}
                <td className="bg-gray-200"></td>
                {relayCalculations.map((calc, idx) => (
                  <td key={idx} className={tealCell(idx, 'bg-teal-50/60 text-gray-800', 'bg-teal-100/60 text-gray-800')}>
                    {calc.totalProcessingFee.toFixed(precision)}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200">
                <td className="py-2 px-3 font-medium text-gray-600 whitespace-nowrap text-xs bg-gray-50/80">Total GST/VAT/TAX on Processing Fee</td>
                {calculations.map((calc, idx) => (
                  <td key={idx} className={blueCell(idx, 'bg-blue-50/40 text-gray-800', 'bg-blue-100/40 text-gray-800')}>
                    {calc.totalGstOnProcessingFee.toFixed(precision)}
                  </td>
                ))}
                <td className="bg-gray-200"></td>
                {relayCalculations.map((calc, idx) => (
                  <td key={idx} className={tealCell(idx, 'bg-teal-50/40 text-gray-800', 'bg-teal-100/40 text-gray-800')}>
                    {calc.totalGstOnProcessingFee.toFixed(precision)}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200">
                <td className="py-2 px-3 font-semibold text-gray-900 whitespace-nowrap text-xs bg-blue-900/5">Total Forecast AIP</td>
                {calculations.map((calc, idx) => (
                  <td key={idx} className={`py-2 px-2 text-center font-mono font-semibold text-blue-800 text-xs border-l border-blue-200 ${idx % 2 === 0 ? 'bg-blue-100/70' : 'bg-blue-200/60'}`}>
                    {calc.totalForecastAIP.toFixed(precision)}
                  </td>
                ))}
                <td className="bg-gray-200"></td>
                {relayCalculations.map((calc, idx) => (
                  <td key={idx} className={`py-2 px-2 text-center font-mono font-semibold text-teal-800 text-xs border-l border-teal-200 ${idx % 2 === 0 ? 'bg-teal-100/70' : 'bg-teal-200/60'}`}>
                    {calc.totalForecastAIP.toFixed(precision)}
                  </td>
                ))}
              </tr>

              <tr className="border-b-2 border-gray-300">
                <td className="py-2 px-3 font-semibold text-gray-900 whitespace-nowrap text-xs bg-gray-50">Total Net Revenue</td>
                {calculations.map((calc, idx) => (
                  <td key={idx} className={`py-2 px-2 text-center font-mono font-semibold text-blue-900 text-xs border-l border-blue-200 ${idx % 2 === 0 ? 'bg-blue-100/80' : 'bg-blue-200/70'}`}>
                    {calc.totalNetRevenue.toFixed(precision)}
                  </td>
                ))}
                <td className="bg-gray-200"></td>
                {relayCalculations.map((calc, idx) => (
                  <td key={idx} className={`py-2 px-2 text-center font-mono font-semibold text-teal-900 text-xs border-l border-teal-200 ${idx % 2 === 0 ? 'bg-teal-100/80' : 'bg-teal-200/70'}`}>
                    {calc.totalNetRevenue.toFixed(precision)}
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-lg p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-5">Total Forecast AIP (Individual Entry + Relay Entry combined)</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="text-sm font-medium text-emerald-400 mb-1">Total Forecast AIP</div>
            <div className="text-3xl font-semibold text-white font-mono">{combinedRevenue.toFixed(precision)}</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="text-sm font-medium text-sky-400 mb-1">Total Forecast Volume</div>
            <div className="text-3xl font-semibold text-white font-mono">{combinedVolume.toFixed(0)}</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="text-sm font-medium text-amber-400 mb-1">Average AIP</div>
            <div className="text-3xl font-semibold text-white font-mono">{combinedAvgAIP.toFixed(precision)}</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-lg p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-5">Total Forecast Net Revenue (Individual Entry + Relay Entry combined)</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="text-sm font-medium text-emerald-400 mb-1">Total Forecast Net Revenue</div>
            <div className="text-3xl font-semibold text-white font-mono">{combinedNetRevenue.toFixed(precision)}</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="text-sm font-medium text-sky-400 mb-1">Individual Entry Net Revenue</div>
            <div className="text-3xl font-semibold text-white font-mono">{indivNetRevenue.toFixed(precision)}</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="text-sm font-medium text-amber-400 mb-1">Relay Entry Net Revenue</div>
            <div className="text-3xl font-semibold text-white font-mono">{relayNetRevenue.toFixed(precision)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
