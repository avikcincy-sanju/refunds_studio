import React, { useState, useEffect } from 'react';
import { Copy, RotateCcw, Info } from 'lucide-react';
import { calculateAIP, type CalculationResult } from '../utils/calculations';
import { GstDropdown } from './GstDropdown';
import { ProcessingFeeDropdown } from './ProcessingFeeDropdown';
import { GstOnProcessingFeeDropdown } from './GstOnProcessingFeeDropdown';

type RefundAmountType = 'flat' | 'percentage';

const DEFAULT = {
  basePrice: '',
  gstPercent: '15',
  processingFeePercent: '10',
  gstOnProcessingFeePercent: '15',
};

const PRECISION = 2;

const fmt = (v: number) => v.toFixed(PRECISION);

interface BreakdownCardProps {
  title: string;
  titleColor: 'blue' | 'emerald';
  result: CalculationResult;
  subtitle?: string;
}

function BreakdownCard({ title, titleColor, result, subtitle }: BreakdownCardProps) {
  const highlightClass = titleColor === 'emerald'
    ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50'
    : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50';
  const highlightText = titleColor === 'emerald' ? 'text-emerald-900' : 'text-blue-900';

  const rows = [
    { label: 'Base Price', value: result.basePrice, tooltip: 'The original price before any taxes or fees are applied' },
    { label: 'GST/VAT/TAX on Base Price', value: result.gstOnBasePrice, tooltip: 'Goods and Services Tax calculated on the base price' },
    { label: 'Price After GST/VAT/TAX', value: result.priceAfterGst, tooltip: 'The total of base price plus GST' },
    { label: 'Processing Fee', value: result.processingFee, tooltip: 'Fee charged for processing the transaction' },
    { label: 'GST/VAT/TAX on Processing Fee', value: result.gstOnProcessingFee, tooltip: 'GST applied to the processing fee' },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm p-6 border border-gray-200/50 flex-1 min-w-0">
      <h2 className={`text-lg font-semibold mb-1 ${titleColor === 'emerald' ? 'text-emerald-800' : 'text-gray-900'}`}>
        {title}
      </h2>
      {subtitle && <p className="text-xs text-gray-500 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      <div className="space-y-2">
        {rows.map(({ label, value, tooltip }) => (
          <div key={label} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-all">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <div className="group relative">
                <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" strokeWidth={2} />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-56 p-2.5 bg-gray-900 text-white text-xs rounded-xl shadow-xl z-10">{tooltip}</div>
              </div>
            </div>
            <span className="text-sm font-semibold tabular-nums text-gray-900">{fmt(value)}</span>
          </div>
        ))}
        <div className="pt-3 mt-1 border-t-2 border-gray-200">
          <div className={`flex items-center justify-between p-3.5 rounded-xl ${highlightClass}`}>
            <span className={`font-semibold text-base ${highlightText}`}>Final AIP</span>
            <span className={`font-bold tabular-nums text-lg ${highlightText}`}>{fmt(result.finalAIP)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RefundsCalculator() {
  const [basePrice, setBasePrice] = useState(DEFAULT.basePrice);
  const [gstPercent, setGstPercent] = useState(DEFAULT.gstPercent);
  const [processingFeePercent, setProcessingFeePercent] = useState(DEFAULT.processingFeePercent);
  const [gstOnProcessingFeePercent, setGstOnProcessingFeePercent] = useState(DEFAULT.gstOnProcessingFeePercent);

  const [refundType, setRefundType] = useState<RefundAmountType>('flat');
  const [refundFlat, setRefundFlat] = useState('');
  const [refundPercent, setRefundPercent] = useState('');
  const [refundError, setRefundError] = useState('');

  const [resetKey, setResetKey] = useState(0);
  const [beforeResult, setBeforeResult] = useState<CalculationResult | null>(null);
  const [afterResult, setAfterResult] = useState<CalculationResult | null>(null);

  const gst = parseFloat(gstPercent) || 0;
  const fee = parseFloat(processingFeePercent) || 0;
  const gstFee = parseFloat(gstOnProcessingFeePercent) || 0;

  // Before-refund: based on user-entered base price
  useEffect(() => {
    const base = parseFloat(basePrice);
    if (!isNaN(base) && base > 0) {
      setBeforeResult(calculateAIP(base, gst, fee, gstFee, PRECISION));
    } else {
      setBeforeResult(null);
    }
  }, [basePrice, gst, fee, gstFee]);

  // With-refund: flat value or percentage value used directly as base price
  useEffect(() => {
    let withBase: number | null = null;

    if (refundType === 'flat') {
      const v = parseFloat(refundFlat);
      if (!isNaN(v) && v > 0) withBase = v;
    } else {
      const pct = parseFloat(refundPercent);
      const base = parseFloat(basePrice);
      if (!isNaN(pct) && pct > 0 && pct <= 100 && !isNaN(base) && base > 0) {
        withBase = Math.round(base * (pct / 100) * 100) / 100;
      }
    }

    if (withBase !== null) {
      setAfterResult(calculateAIP(withBase, gst, fee, gstFee, PRECISION));
    } else {
      setAfterResult(null);
    }
  }, [refundType, refundFlat, refundPercent, gst, fee, gstFee]);

  const handleNumberInput = (value: string, setter: (v: string) => void) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) setter(value);
  };

  const handleRefundFlat = (value: string) => {
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) setRefundFlat(value);
  };

  const handleRefundPercent = (value: string) => {
    setRefundError('');
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      const n = parseFloat(value);
      if (!isNaN(n) && n > 100) { setRefundError('Maximum 100% allowed.'); return; }
      setRefundPercent(value);
    }
  };

  const handleReset = () => {
    setBasePrice('');
    setGstPercent('');
    setProcessingFeePercent('');
    setGstOnProcessingFeePercent('');
    setRefundFlat('');
    setRefundPercent('');
    setRefundError('');
    setRefundType('flat');
    setResetKey(k => k + 1);
  };

  const handleCopy = () => {
    if (!beforeResult) return;
    const lines = [
      'AIP Breakdown (Before Refund)',
      `Base Price: ${fmt(beforeResult.basePrice)}`,
      `GST/VAT/TAX on Base Price: ${fmt(beforeResult.gstOnBasePrice)}`,
      `Price After GST/VAT/TAX: ${fmt(beforeResult.priceAfterGst)}`,
      `Processing Fee: ${fmt(beforeResult.processingFee)}`,
      `GST/VAT/TAX on Processing Fee: ${fmt(beforeResult.gstOnProcessingFee)}`,
      `Final AIP: ${fmt(beforeResult.finalAIP)}`,
    ];
    if (afterResult) {
      lines.push('', 'AIP Breakdown (With Refund)');
      lines.push(`Base Price: ${fmt(afterResult.basePrice)}`);
      lines.push(`GST/VAT/TAX on Base Price: ${fmt(afterResult.gstOnBasePrice)}`);
      lines.push(`Price After GST/VAT/TAX: ${fmt(afterResult.priceAfterGst)}`);
      lines.push(`Processing Fee: ${fmt(afterResult.processingFee)}`);
      lines.push(`GST/VAT/TAX on Processing Fee: ${fmt(afterResult.gstOnProcessingFee)}`);
      lines.push(`Final AIP: ${fmt(afterResult.finalAIP)}`);
      if (beforeResult) lines.push(``, `AIP Difference: ${fmt(beforeResult.finalAIP - afterResult.finalAIP)}`);
    }
    navigator.clipboard.writeText(lines.join('\n'));
    alert('Results copied to clipboard!');
  };

  const afterSubtitle = (() => {
    if (refundType === 'flat' && refundFlat) return `Base price = flat value entered (${refundFlat})`;
    if (refundType === 'percentage' && refundPercent && !refundError && basePrice) {
      const base = parseFloat(basePrice);
      const pct = parseFloat(refundPercent);
      if (!isNaN(base) && !isNaN(pct)) {
        const reduced = Math.round(base * (pct / 100) * 100) / 100;
        return `Base price = ${pct}% of ${fmt(base)} = ${fmt(reduced)}`;
      }
    }
    return undefined;
  })();

  return (
    <div className="space-y-6">
      {/* Rate Dropdowns — full width row */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm p-8 border border-gray-200/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Inputs</h2>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All Fields
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <GstDropdown key={`gst-${resetKey}`} value={gstPercent} onChange={setGstPercent} />
          <ProcessingFeeDropdown key={`fee-${resetKey}`} value={processingFeePercent} onChange={setProcessingFeePercent} />
          <GstOnProcessingFeeDropdown key={`gstfee-${resetKey}`} value={gstOnProcessingFeePercent} onChange={setGstOnProcessingFeePercent} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Refund Amount */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm p-8 border border-gray-200/50">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Refund Amount</h2>
            <div className="space-y-5">
              {/* Base Price input lives here */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2.5">Base Price</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={basePrice}
                  onChange={e => handleNumberInput(e.target.value, setBasePrice)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 text-base"
                  placeholder="e.g. 1290"
                />
              </div>

              <div className="border-t border-gray-100 pt-5">
                <label className="block text-sm font-medium text-gray-600 mb-2.5">Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setRefundType('flat'); setRefundError(''); }}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${refundType === 'flat' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Flat
                  </button>
                  <button
                    onClick={() => { setRefundType('percentage'); setRefundError(''); }}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${refundType === 'percentage' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Percentage
                  </button>
                </div>
              </div>

              {refundType === 'flat' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2.5">Refund Amount</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={refundFlat}
                    onChange={e => handleRefundFlat(e.target.value)}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 text-base"
                    placeholder="e.g. 50.00"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2.5">Refund Percentage (max 100%)</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={refundPercent}
                      onChange={e => handleRefundPercent(e.target.value)}
                      className={`w-full px-4 py-3.5 pr-8 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 text-base ${refundError ? 'border-red-400' : 'border-gray-200'}`}
                      placeholder="e.g. 25"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">%</span>
                  </div>
                  {refundError && <p className="text-xs text-red-600 mt-1.5">{refundError}</p>}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right columns: side-by-side breakdowns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-end">
            <button
              onClick={handleCopy}
              disabled={!beforeResult}
              className="p-2.5 bg-white/80 backdrop-blur-xl rounded-full text-gray-700 hover:bg-white transition-all shadow-sm border border-gray-200/50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Copy to clipboard"
            >
              <Copy className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          <div className="flex gap-4">
            {beforeResult ? (
              <BreakdownCard
                title="AIP Breakdown (Before Refund)"
                titleColor="blue"
                result={beforeResult}
                subtitle={`Base price: ${fmt(beforeResult.basePrice)}`}
              />
            ) : (
              <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-dashed border-gray-300 flex-1 min-w-0 flex items-center justify-center p-8">
                <p className="text-sm text-gray-400 text-center">Enter a Base Price above to see the AIP breakdown</p>
              </div>
            )}

            {afterResult ? (
              <BreakdownCard
                title="AIP Breakdown (With Refund)"
                titleColor="emerald"
                result={afterResult}
                subtitle={afterSubtitle}
              />
            ) : (
              <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-dashed border-gray-300 flex-1 min-w-0 flex items-center justify-center p-8">
                <p className="text-sm text-gray-400 text-center">
                  Enter a refund {refundType === 'flat' ? 'value' : 'percentage'} above to see the adjusted AIP breakdown
                </p>
              </div>
            )}
          </div>

          {/* Refund summary */}
          {beforeResult && afterResult && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm p-6 border border-gray-200/50">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Refund Amount</p>
                <span className="text-2xl font-bold tabular-nums text-emerald-700">
                  {fmt(afterResult.finalAIP)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
