import React from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { calculateAIP, formatCurrency } from '../utils/calculations';

interface ExamplePanelProps {
  onLoadForwardPreset: () => void;
  onLoadReversePreset: () => void;
}

export function ExamplePanel({ onLoadForwardPreset, onLoadReversePreset }: ExamplePanelProps) {
  const exampleValues = {
    basePrice: 1290,
    gstPercent: 15,
    processingFeePercent: 10,
    gstOnProcessingFeePercent: 15,
  };

  const exampleResult = calculateAIP(
    exampleValues.basePrice,
    exampleValues.gstPercent,
    exampleValues.processingFeePercent,
    exampleValues.gstOnProcessingFeePercent
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl shadow-sm p-6 border border-blue-200/50 mt-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
        </div>
        <h3 className="text-lg font-semibold text-blue-900">Quick Presets</h3>
      </div>

      <div className="space-y-3">
        <button
          onClick={onLoadForwardPreset}
          className="w-full p-4 bg-white/60 hover:bg-white rounded-2xl text-left transition-all border border-blue-200/30 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-blue-900">NZ Registration Example</span>
            <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <div>Base: 1290 → AIP: {formatCurrency(exampleResult.finalAIP, 'NZD')}</div>
          </div>
        </button>

        <button
          onClick={onLoadReversePreset}
          className="w-full p-4 bg-white/60 hover:bg-white rounded-2xl text-left transition-all border border-blue-200/30 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-blue-900">Reverse Example</span>
            <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <div>AIP: 1654.10 → Base: 1290.00</div>
          </div>
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-blue-300/50">
        <div className="space-y-2 text-xs text-blue-700">
          <div className="flex justify-between">
            <span>GST/VAT/TAX:</span>
            <span className="font-semibold">{exampleValues.gstPercent}%</span>
          </div>
          <div className="flex justify-between">
            <span>Processing Fee:</span>
            <span className="font-semibold">{exampleValues.processingFeePercent}%</span>
          </div>
          <div className="flex justify-between">
            <span>GST/VAT/TAX on Processing Fee:</span>
            <span className="font-semibold">{exampleValues.gstOnProcessingFeePercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
