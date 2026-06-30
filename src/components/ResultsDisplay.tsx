import React from 'react';
import { Info, AlertCircle } from 'lucide-react';
import { formatCurrency, type CalculationResult } from '../utils/calculations';
import type { CalculationMode, ReverseMode } from '../App';

interface ResultsDisplayProps {
  mode: CalculationMode;
  reverseMode: ReverseMode;
  result: CalculationResult;
  currency: string;
  showFormulaView: boolean;
  showRawPrecision: boolean;
  basePrice: number;
  finalAIP: number;
  gstPercent: number;
  processingFeePercent: number;
  gstOnProcessingFeePercent: number;
}

export function ResultsDisplay({
  mode,
  reverseMode,
  result,
  currency,
  showFormulaView,
  showRawPrecision,
  basePrice,
  finalAIP,
  gstPercent,
  processingFeePercent,
  gstOnProcessingFeePercent,
}: ResultsDisplayProps) {
  const tooltips = {
    basePrice: 'The original price before any taxes or fees are applied',
    gstOnBasePrice: 'Goods and Services Tax calculated on the base price',
    priceAfterGst: 'The total of base price plus GST',
    processingFee: 'Fee charged for processing the transaction, calculated on the price after GST',
    gstOnProcessingFee: 'GST applied to the processing fee',
    finalAIP: 'The complete All-In Price including all taxes and fees',
  };

  const ResultRow = ({
    label,
    value,
    tooltip,
    highlight = false,
  }: {
    label: string;
    value: number;
    tooltip: string;
    highlight?: boolean;
  }) => (
    <div
      className={`flex items-center justify-between p-5 rounded-2xl transition-all ${
        highlight
          ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50'
          : 'bg-gray-50/50 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`font-medium ${highlight ? 'text-blue-900 text-lg' : 'text-gray-700'}`}>
          {label}
        </span>
        <div className="group relative">
          <Info className="w-4 h-4 text-gray-400 cursor-help" strokeWidth={2} />
          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl z-10">
            {tooltip}
          </div>
        </div>
      </div>
      <span className={`font-semibold tabular-nums ${highlight ? 'text-blue-900 text-xl' : 'text-gray-900'}`}>
        {formatCurrency(value, currency)}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm p-8 border border-gray-200/50">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Breakdown</h2>
        <div className="space-y-3">
          <ResultRow
            label="Base Price"
            value={result.basePrice}
            tooltip={tooltips.basePrice}
          />
          <ResultRow
            label="GST/VAT/TAX on Base Price"
            value={result.gstOnBasePrice}
            tooltip={tooltips.gstOnBasePrice}
          />
          <ResultRow
            label="Price After GST/VAT/TAX"
            value={result.priceAfterGst}
            tooltip={tooltips.priceAfterGst}
          />
          <ResultRow
            label="Processing Fee"
            value={result.processingFee}
            tooltip={tooltips.processingFee}
          />
          <ResultRow
            label="GST/VAT/TAX on Processing Fee"
            value={result.gstOnProcessingFee}
            tooltip={tooltips.gstOnProcessingFee}
          />
          <div className="mt-4 pt-4 border-t-2 border-gray-200">
            <ResultRow
              label="Final AIP"
              value={result.finalAIP}
              tooltip={tooltips.finalAIP}
              highlight
            />
          </div>
        </div>

        {mode === 'reverse' && reverseMode === 'njuko' && result.matchInfo && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Njuko Match Info</h3>
            <div className={`space-y-3 text-xs p-5 rounded-xl border ${
              result.matchInfo.isExactMatch
                ? 'bg-green-50/50 border-green-200/50'
                : 'bg-amber-50/50 border-amber-200/50'
            }`}>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Target AIP:</span>
                  <span className="text-gray-900 font-mono font-semibold">{formatCurrency(result.matchInfo.targetAIP, currency)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Initial Estimate:</span>
                  <span className="text-gray-900 font-mono">{formatCurrency(result.matchInfo.estimatedBase, currency)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Refined Base:</span>
                  <span className="text-gray-900 font-mono font-semibold">{formatCurrency(result.matchInfo.refinedBase, currency)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-300/50">
                  <span className="text-gray-600 font-medium">Achieved AIP:</span>
                  <span className="text-gray-900 font-mono font-semibold">{formatCurrency(result.matchInfo.achievedAIP, currency)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Difference:</span>
                  <span className={`font-mono font-semibold ${
                    Math.abs(result.matchInfo.delta) < 0.01 ? 'text-green-700' : 'text-amber-700'
                  }`}>
                    {result.matchInfo.delta >= 0 ? '+' : ''}{formatCurrency(result.matchInfo.delta, currency)}
                  </span>
                </div>
              </div>

              <div className={`flex items-start gap-2 pt-3 border-t ${
                result.matchInfo.isExactMatch ? 'border-green-300/50' : 'border-amber-300/50'
              }`}>
                {result.matchInfo.isExactMatch ? (
                  <>
                    <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-green-700 font-medium">Exact Njuko-style rounded match found.</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-amber-700 font-medium">Exact rounded match was not found. Closest valid Njuko-style result is shown.</span>
                  </>
                )}
              </div>

              {result.matchInfo.nearbyOptions && result.matchInfo.nearbyOptions.length > 0 && !result.matchInfo.isExactMatch && (
                <div className="pt-3 border-t border-amber-300/50">
                  <p className="text-gray-700 font-medium mb-2">Nearest achievable AIP values:</p>
                  <div className="space-y-1.5">
                    {result.matchInfo.nearbyOptions.map((option, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/60 p-2 rounded-lg">
                        <span className="text-gray-900 font-mono text-xs">{formatCurrency(option.aip, currency)}</span>
                        <span className="text-gray-600 text-xs">Base: {formatCurrency(option.basePrice, currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showRawPrecision && result.rawValues && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Raw Precision Values</h3>
            <div className="space-y-2 text-xs font-mono bg-gray-50/50 p-4 rounded-xl">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price:</span>
                <span className="text-gray-900">{result.rawValues.basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST/VAT/TAX on Base:</span>
                <span className="text-gray-900">{result.rawValues.gstOnBasePrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price After GST/VAT/TAX:</span>
                <span className="text-gray-900">{result.rawValues.priceAfterGst}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Fee:</span>
                <span className="text-gray-900">{result.rawValues.processingFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST/VAT/TAX on Processing:</span>
                <span className="text-gray-900">{result.rawValues.gstOnProcessingFee}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="text-gray-900 font-semibold">Final AIP:</span>
                <span className="text-gray-900 font-semibold">{result.rawValues.finalAIP}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showFormulaView ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm p-8 border border-gray-200/50">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Calculation Steps</h2>
          {mode === 'forward' ? (
            <div className="space-y-3 text-sm font-mono">
              <div className="p-4 bg-gray-50/50 rounded-2xl">
                <p className="text-gray-600 font-medium mb-1">GST/VAT/TAX on Base Price</p>
                <p className="text-gray-900">
                  {basePrice.toFixed(2)} × {gstPercent}% = {result.gstOnBasePrice.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-2xl">
                <p className="text-gray-600 font-medium mb-1">Price After GST/VAT/TAX</p>
                <p className="text-gray-900">
                  {result.basePrice.toFixed(2)} + {result.gstOnBasePrice.toFixed(2)} ={' '}
                  {result.priceAfterGst.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-2xl">
                <p className="text-gray-600 font-medium mb-1">Processing Fee</p>
                <p className="text-gray-900">
                  {result.priceAfterGst.toFixed(2)} × {processingFeePercent}% ={' '}
                  {result.processingFee.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-2xl">
                <p className="text-gray-600 font-medium mb-1">GST/VAT/TAX on Processing Fee</p>
                <p className="text-gray-900">
                  {result.processingFee.toFixed(2)} × {gstOnProcessingFeePercent}% ={' '}
                  {result.gstOnProcessingFee.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50">
                <p className="text-blue-900 font-semibold mb-1">Final AIP</p>
                <p className="text-blue-900">
                  {result.basePrice.toFixed(2)} + {result.gstOnBasePrice.toFixed(2)} +{' '}
                  {result.processingFee.toFixed(2)} + {result.gstOnProcessingFee.toFixed(2)} ={' '}
                  <span className="font-bold">{result.finalAIP.toFixed(2)}</span>
                </p>
              </div>
            </div>
          ) : reverseMode === 'njuko' ? (
            <div className="space-y-3 text-sm font-mono">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50">
                <p className="text-blue-900 font-semibold mb-1">1. Starting Point</p>
                <p className="text-blue-900">
                  Target Final AIP = <span className="font-bold">{finalAIP.toFixed(2)}</span>
                </p>
              </div>
              {result.matchInfo && (
                <>
                  <div className="p-4 bg-gray-50/50 rounded-2xl">
                    <p className="text-gray-600 font-medium mb-1">2. Initial Mathematical Estimate</p>
                    <p className="text-gray-900 text-xs mb-2">
                      Base = {finalAIP.toFixed(2)} / ((1 + {(gstPercent / 100).toFixed(2)}) × (1 + {(processingFeePercent / 100).toFixed(2)} × (1 + {(gstOnProcessingFeePercent / 100).toFixed(2)})))
                    </p>
                    <p className="text-gray-900">
                      Estimated Base = <span className="font-bold">{formatCurrency(result.matchInfo.estimatedBase, currency)}</span>
                    </p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${
                    result.matchInfo.isExactMatch
                      ? 'bg-green-50/50 border-green-200/50'
                      : 'bg-amber-50/50 border-amber-200/50'
                  }`}>
                    <p className={`font-medium mb-1 ${
                      result.matchInfo.isExactMatch ? 'text-green-900' : 'text-amber-900'
                    }`}>3. Njuko Match Refinement</p>
                    <p className="text-gray-900 text-xs mb-2">
                      Search performed around estimate using 2-decimal rounded forward steps
                    </p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${
                    result.matchInfo.isExactMatch
                      ? 'bg-green-50/50 border-green-200/50'
                      : 'bg-amber-50/50 border-amber-200/50'
                  }`}>
                    <p className={`font-medium mb-1 ${
                      result.matchInfo.isExactMatch ? 'text-green-900' : 'text-amber-900'
                    }`}>4. Chosen Base</p>
                    <p className={result.matchInfo.isExactMatch ? 'text-green-900' : 'text-amber-900'}>
                      Base = <span className="font-bold">{formatCurrency(result.matchInfo.refinedBase, currency)}</span>
                    </p>
                  </div>
                </>
              )}
              <div className="p-4 bg-gray-50/50 rounded-2xl">
                <p className="text-gray-600 font-medium mb-1">5. Forward Verification</p>
                <p className="text-gray-900 text-xs">Each step rounded to 2 decimals:</p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-2xl ml-4">
                <p className="text-gray-600 font-medium mb-1">GST/VAT/TAX on Base Price</p>
                <p className="text-gray-900">
                  {result.basePrice.toFixed(2)} × {gstPercent}% = {result.gstOnBasePrice.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-2xl ml-4">
                <p className="text-gray-600 font-medium mb-1">Price After GST/VAT/TAX</p>
                <p className="text-gray-900">
                  {result.basePrice.toFixed(2)} + {result.gstOnBasePrice.toFixed(2)} ={' '}
                  {result.priceAfterGst.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-2xl ml-4">
                <p className="text-gray-600 font-medium mb-1">Processing Fee</p>
                <p className="text-gray-900">
                  {result.priceAfterGst.toFixed(2)} × {processingFeePercent}% ={' '}
                  {result.processingFee.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-2xl ml-4">
                <p className="text-gray-600 font-medium mb-1">GST/VAT/TAX on Processing Fee</p>
                <p className="text-gray-900">
                  {result.processingFee.toFixed(2)} × {gstOnProcessingFeePercent}% ={' '}
                  {result.gstOnProcessingFee.toFixed(2)}
                </p>
              </div>
              <div className={`p-4 bg-gradient-to-br rounded-2xl border ${
                result.matchInfo?.isExactMatch
                  ? 'from-green-50 to-green-100/50 border-green-200/50'
                  : 'from-amber-50 to-amber-100/50 border-amber-200/50'
              }`}>
                <p className={`font-semibold mb-1 ${
                  result.matchInfo?.isExactMatch ? 'text-green-900' : 'text-amber-900'
                }`}>6. Match Result</p>
                <p className={result.matchInfo?.isExactMatch ? 'text-green-900' : 'text-amber-900'}>
                  {result.priceAfterGst.toFixed(2)} + {result.processingFee.toFixed(2)} +{' '}
                  {result.gstOnProcessingFee.toFixed(2)} ={' '}
                  <span className="font-bold">{result.finalAIP.toFixed(2)}</span>
                </p>
                {result.matchInfo && (
                  <p className="text-xs mt-2">
                    {result.matchInfo.isExactMatch ? (
                      <span className="text-green-700 font-medium">✓ Exact match found</span>
                    ) : (
                      <span className="text-amber-700 font-medium">
                        Closest match shown (delta: {result.matchInfo.delta >= 0 ? '+' : ''}{result.matchInfo.delta.toFixed(2)})
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm font-mono">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50">
                <p className="text-blue-900 font-semibold mb-1">Starting Point</p>
                <p className="text-blue-900">
                  Final AIP = <span className="font-bold">{finalAIP.toFixed(2)}</span>
                </p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-2xl">
                <p className="text-gray-600 font-medium mb-1">Calculate Base Price</p>
                <p className="text-gray-900">
                  Base = {finalAIP.toFixed(2)} / ((1 + {gstPercent / 100}) × (1 + {processingFeePercent / 100} × (1 + {gstOnProcessingFeePercent / 100})))
                </p>
                <p className="text-gray-900 mt-1">
                  Base = <span className="font-bold">{result.basePrice.toFixed(2)}</span>
                </p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-2xl">
                <p className="text-gray-600 font-medium mb-1">GST/VAT/TAX on Base Price</p>
                <p className="text-gray-900">
                  {result.basePrice.toFixed(2)} × {gstPercent}% = {result.gstOnBasePrice.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-2xl">
                <p className="text-gray-600 font-medium mb-1">Price After GST/VAT/TAX</p>
                <p className="text-gray-900">
                  {result.basePrice.toFixed(2)} + {result.gstOnBasePrice.toFixed(2)} ={' '}
                  {result.priceAfterGst.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-2xl">
                <p className="text-gray-600 font-medium mb-1">Processing Fee</p>
                <p className="text-gray-900">
                  {result.priceAfterGst.toFixed(2)} × {processingFeePercent}% ={' '}
                  {result.processingFee.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-2xl">
                <p className="text-gray-600 font-medium mb-1">GST/VAT/TAX on Processing Fee</p>
                <p className="text-gray-900">
                  {result.processingFee.toFixed(2)} × {gstOnProcessingFeePercent}% ={' '}
                  {result.gstOnProcessingFee.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm p-8 border border-gray-200/50">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Simple Explanation</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            {mode === 'forward' ? (
              <>
                <p>
                  Starting with a base price of <strong>{formatCurrency(result.basePrice, currency)}</strong>,
                  we first add <strong>{gstPercent}%</strong> GST, which comes to{' '}
                  <strong>{formatCurrency(result.gstOnBasePrice, currency)}</strong>.
                </p>
                <p>
                  This brings the price to{' '}
                  <strong>{formatCurrency(result.priceAfterGst, currency)}</strong>. We then apply a{' '}
                  <strong>{processingFeePercent}%</strong> processing fee on this amount, which is{' '}
                  <strong>{formatCurrency(result.processingFee, currency)}</strong>.
                </p>
                <p>
                  Finally, we add <strong>{gstOnProcessingFeePercent}%</strong> GST on the processing fee,
                  which is <strong>{formatCurrency(result.gstOnProcessingFee, currency)}</strong>.
                </p>
              </>
            ) : (
              <>
                <p>
                  Starting with a final All-In Price of <strong>{formatCurrency(result.finalAIP, currency)}</strong>,
                  we work backwards to find the base price by removing all the taxes and fees.
                </p>
                <p>
                  Using the formula that accounts for <strong>{gstPercent}%</strong> GST, a{' '}
                  <strong>{processingFeePercent}%</strong> processing fee, and{' '}
                  <strong>{gstOnProcessingFeePercent}%</strong> GST on the processing fee, we calculate
                  the base price to be <strong>{formatCurrency(result.basePrice, currency)}</strong>.
                </p>
                <p>
                  From this base, the GST adds{' '}
                  <strong>{formatCurrency(result.gstOnBasePrice, currency)}</strong>, the processing fee adds{' '}
                  <strong>{formatCurrency(result.processingFee, currency)}</strong>, and the GST on the
                  processing fee adds <strong>{formatCurrency(result.gstOnProcessingFee, currency)}</strong>.
                </p>
              </>
            )}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50 mt-6">
              <p className="text-blue-900 font-semibold text-lg">
                {mode === 'forward' ? 'The final All-In Price is' : 'This confirms the final All-In Price of'}{' '}
                <span className="text-2xl font-bold tabular-nums">{formatCurrency(result.finalAIP, currency)}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
