import React from 'react';
import { RotateCcw, Lock } from 'lucide-react';
import type { CalculationMode } from '../App';

interface CalculatorFormProps {
  mode: CalculationMode;
  basePrice: string;
  setBasePrice: (value: string) => void;
  finalAIP: string;
  setFinalAIP: (value: string) => void;
  gstPercent: string;
  setGstPercent: (value: string) => void;
  processingFeePercent: string;
  setProcessingFeePercent: (value: string) => void;
  gstOnProcessingFeePercent: string;
  setGstOnProcessingFeePercent: (value: string) => void;
  currency: string;
  setCurrency: (value: string) => void;
  onReset: () => void;
}

export function CalculatorForm({
  mode,
  basePrice,
  setBasePrice,
  finalAIP,
  setFinalAIP,
  gstPercent,
  setGstPercent,
  processingFeePercent,
  setProcessingFeePercent,
  gstOnProcessingFeePercent,
  setGstOnProcessingFeePercent,
  currency,
  setCurrency,
  onReset,
}: CalculatorFormProps) {
  const handleNumberInput = (
    value: string,
    setter: (value: string) => void
  ) => {
    if (value === '' || value === '-') {
      setter(value);
      return;
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setter(value);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm p-8 border border-gray-200/50">
      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Inputs</h2>

      <div className="space-y-6">
        <div>
          <label htmlFor="basePrice" className="block text-sm font-medium text-gray-600 mb-2.5 flex items-center gap-2">
            Base Price
            {mode === 'reverse' && <Lock className="w-3.5 h-3.5 text-gray-400" />}
          </label>
          <input
            id="basePrice"
            type="number"
            step="0.01"
            value={basePrice}
            onChange={(e) => handleNumberInput(e.target.value, setBasePrice)}
            disabled={mode === 'reverse'}
            className={`w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 text-base ${
              mode === 'reverse' ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
            }`}
            placeholder="1290"
          />
        </div>

        <div>
          <label htmlFor="finalAIP" className="block text-sm font-medium text-gray-600 mb-2.5 flex items-center gap-2">
            Final AIP
            {mode === 'forward' && <Lock className="w-3.5 h-3.5 text-gray-400" />}
          </label>
          <input
            id="finalAIP"
            type="number"
            step="0.01"
            value={finalAIP}
            onChange={(e) => handleNumberInput(e.target.value, setFinalAIP)}
            disabled={mode === 'forward'}
            className={`w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 text-base ${
              mode === 'forward' ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
            }`}
            placeholder="1654.10"
          />
        </div>

        <div>
          <label htmlFor="gstPercent" className="block text-sm font-medium text-gray-600 mb-2.5">
            GST/VAT/TAX %
          </label>
          <input
            id="gstPercent"
            type="number"
            step="0.01"
            value={gstPercent}
            onChange={(e) => handleNumberInput(e.target.value, setGstPercent)}
            className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 text-base"
            placeholder="15"
          />
        </div>

        <div>
          <label htmlFor="processingFeePercent" className="block text-sm font-medium text-gray-600 mb-2.5">
            Processing Fee %
          </label>
          <input
            id="processingFeePercent"
            type="number"
            step="0.01"
            value={processingFeePercent}
            onChange={(e) => handleNumberInput(e.target.value, setProcessingFeePercent)}
            className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 text-base"
            placeholder="10"
          />
        </div>

        <div>
          <label htmlFor="gstOnProcessingFeePercent" className="block text-sm font-medium text-gray-600 mb-2.5">
            GST/VAT/TAX on Processing Fee %
          </label>
          <input
            id="gstOnProcessingFeePercent"
            type="number"
            step="0.01"
            value={gstOnProcessingFeePercent}
            onChange={(e) => handleNumberInput(e.target.value, setGstOnProcessingFeePercent)}
            className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 text-base"
            placeholder="15"
          />
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-600 mb-2.5">
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 text-base"
          >
            <option value="NZD">NZD - New Zealand Dollar</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="AUD">AUD - Australian Dollar</option>
          </select>
        </div>

        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium mt-8"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
