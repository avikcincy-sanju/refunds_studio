import React, { useState, useEffect } from 'react';
import { Calculator, Copy, TrendingUp, RotateCcw, Tag } from 'lucide-react';
import { CalculatorForm } from './components/CalculatorForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ExamplePanel } from './components/ExamplePanel';
import { EditionForecast } from './components/EditionForecast';
import { RefundsCalculator } from './components/RefundsCalculator';
import { DiscountsCalculator } from './components/DiscountsCalculator';
import { calculateAIP, calculateReverseAIP, type CalculationResult } from './utils/calculations';

export type ActiveTab = 'calculator' | 'forecast' | 'refunds' | 'discounts';

const DEFAULT_VALUES = {
  basePrice: 1290,
  finalAIP: 1654.10,
  gstPercent: 15,
  processingFeePercent: 10,
  gstOnProcessingFeePercent: 15,
  currency: 'NZD' as const,
  precision: 3,
};

export type CalculationMode = 'forward' | 'reverse';
export type ReverseMode = 'exact' | 'njuko';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [mode, setMode] = useState<CalculationMode>('forward');
  const [reverseMode, setReverseMode] = useState<ReverseMode>('njuko');
  const [basePrice, setBasePrice] = useState<string>(DEFAULT_VALUES.basePrice.toString());
  const [finalAIP, setFinalAIP] = useState<string>(DEFAULT_VALUES.finalAIP.toString());
  const [gstPercent, setGstPercent] = useState<string>(DEFAULT_VALUES.gstPercent.toString());
  const [processingFeePercent, setProcessingFeePercent] = useState<string>(DEFAULT_VALUES.processingFeePercent.toString());
  const [gstOnProcessingFeePercent, setGstOnProcessingFeePercent] = useState<string>(DEFAULT_VALUES.gstOnProcessingFeePercent.toString());
  const [currency, setCurrency] = useState<string>(DEFAULT_VALUES.currency);
  const [precision, setPrecision] = useState<number>(DEFAULT_VALUES.precision);
  const [showRawPrecision, setShowRawPrecision] = useState<boolean>(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showFormulaView, setShowFormulaView] = useState<boolean>(true);

  useEffect(() => {
    const gst = parseFloat(gstPercent) || 0;
    const processingFee = parseFloat(processingFeePercent) || 0;
    const gstOnProcessing = parseFloat(gstOnProcessingFeePercent) || 0;

    if (gst >= 0 && processingFee >= 0 && gstOnProcessing >= 0) {
      if (mode === 'forward') {
        const base = parseFloat(basePrice) || 0;
        if (base >= 0) {
          const calculationResult = calculateAIP(base, gst, processingFee, gstOnProcessing, precision);
          setResult(calculationResult);
          setFinalAIP(calculationResult.finalAIP.toString());
        }
      } else {
        const final = parseFloat(finalAIP) || 0;
        if (final >= 0) {
          const useNjukoMatch = reverseMode === 'njuko';
          const calculationResult = calculateReverseAIP(final, gst, processingFee, gstOnProcessing, precision, useNjukoMatch);
          setResult(calculationResult);
          setBasePrice(calculationResult.basePrice.toString());
        }
      }
    }
  }, [mode, reverseMode, basePrice, finalAIP, gstPercent, processingFeePercent, gstOnProcessingFeePercent, precision]);

  const handleReset = () => {
    setBasePrice(DEFAULT_VALUES.basePrice.toString());
    setFinalAIP(DEFAULT_VALUES.finalAIP.toString());
    setGstPercent(DEFAULT_VALUES.gstPercent.toString());
    setProcessingFeePercent(DEFAULT_VALUES.processingFeePercent.toString());
    setGstOnProcessingFeePercent(DEFAULT_VALUES.gstOnProcessingFeePercent.toString());
    setCurrency(DEFAULT_VALUES.currency);
    setPrecision(DEFAULT_VALUES.precision);
  };

  const loadForwardPreset = () => {
    setMode('forward');
    setBasePrice('1290');
    setGstPercent('15');
    setProcessingFeePercent('10');
    setGstOnProcessingFeePercent('15');
  };

  const loadReversePreset = () => {
    setMode('reverse');
    setFinalAIP('1654.10');
    setGstPercent('15');
    setProcessingFeePercent('10');
    setGstOnProcessingFeePercent('15');
  };

  const handleCopyToClipboard = () => {
    if (!result) return;

    const text = `
All-In Pricing (AIP) Breakdown
Currency: ${currency}

Base Price: ${result.basePrice.toFixed(2)}
GST/VAT/TAX on Base Price: ${result.gstOnBasePrice.toFixed(2)}
Price After GST/VAT/TAX: ${result.priceAfterGst.toFixed(2)}
Processing Fee: ${result.processingFee.toFixed(2)}
GST/VAT/TAX on Processing Fee: ${result.gstOnProcessingFee.toFixed(2)}

Final AIP: ${result.finalAIP.toFixed(2)}
    `.trim();

    navigator.clipboard.writeText(text);
    alert('Results copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Calculator className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-5xl font-semibold text-gray-900 mb-3 tracking-tight">
            IRONMAN - AIP Calculator / Forecast / Refund Studio
          </h1>
          <p className="text-sm text-gray-500">
            For any Feedback and Enhancements please contact Frankie McDermond -{' '}
            <a
              href="mailto:frankie.mcdermond@ironman.com"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              frankie.mcdermond@ironman.com
            </a>
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-base font-medium transition-all ${
              activeTab === 'calculator'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white/80 text-gray-700 hover:bg-white border border-gray-200/50'
            }`}
          >
            <Calculator className="w-5 h-5" strokeWidth={2} />
            AIP Calculator
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-base font-medium transition-all ${
              activeTab === 'forecast'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white/80 text-gray-700 hover:bg-white border border-gray-200/50'
            }`}
          >
            <TrendingUp className="w-5 h-5" strokeWidth={2} />
            Edition Forecast
          </button>
          <button
            onClick={() => setActiveTab('refunds')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-base font-medium transition-all ${
              activeTab === 'refunds'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white/80 text-gray-700 hover:bg-white border border-gray-200/50'
            }`}
          >
            <RotateCcw className="w-5 h-5" strokeWidth={2} />
            Refunds
          </button>
          <button
            onClick={() => setActiveTab('discounts')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-base font-medium transition-all ${
              activeTab === 'discounts'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white/80 text-gray-700 hover:bg-white border border-gray-200/50'
            }`}
          >
            <Tag className="w-5 h-5" strokeWidth={2} />
            Discounts
          </button>
        </div>

        {activeTab === 'calculator' && (
          <>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm p-6 border border-gray-200/50 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-600">Calculation Mode:</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMode('forward')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        mode === 'forward'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Forward Calculation
                    </button>
                    <button
                      onClick={() => setMode('reverse')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        mode === 'reverse'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Reverse Calculation
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-600">Precision:</label>
                  <select
                    value={precision}
                    onChange={(e) => setPrecision(parseInt(e.target.value))}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="2">2 decimals</option>
                    <option value="3">3 decimals</option>
                    <option value="4">4 decimals</option>
                    <option value="5">5 decimals</option>
                  </select>
                </div>
              </div>
              {mode === 'reverse' && (
                <div className="mt-4 pt-4 border-t border-gray-200/50">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-600">Reverse Mode:</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setReverseMode('njuko')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          reverseMode === 'njuko'
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Njuko Match Mode
                      </button>
                      <button
                        onClick={() => setReverseMode('exact')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          reverseMode === 'exact'
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Exact Math Mode
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {reverseMode === 'njuko'
                      ? 'Uses step-by-step rounded calculation to match Njuko-style outputs.'
                      : 'Uses direct mathematical formula for reverse calculation.'}
                  </p>
                </div>
              )}
              {mode === 'forward' && (
                <p className="text-xs text-gray-500 mt-3">
                  Internal calculations may use higher precision to match Njuko-style rounding and arrive at even final prices.
                </p>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <CalculatorForm
                  mode={mode}
                  basePrice={basePrice}
                  setBasePrice={setBasePrice}
                  finalAIP={finalAIP}
                  setFinalAIP={setFinalAIP}
                  gstPercent={gstPercent}
                  setGstPercent={setGstPercent}
                  processingFeePercent={processingFeePercent}
                  setProcessingFeePercent={setProcessingFeePercent}
                  gstOnProcessingFeePercent={gstOnProcessingFeePercent}
                  setGstOnProcessingFeePercent={setGstOnProcessingFeePercent}
                  currency={currency}
                  setCurrency={setCurrency}
                  onReset={handleReset}
                />
                <ExamplePanel
                  onLoadForwardPreset={loadForwardPreset}
                  onLoadReversePreset={loadReversePreset}
                />
              </div>

              <div className="lg:col-span-2">
                {result && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setShowFormulaView(!showFormulaView)}
                          className="px-5 py-2.5 bg-white/80 backdrop-blur-xl rounded-full text-sm font-medium text-gray-800 hover:bg-white transition-all shadow-sm border border-gray-200/50"
                        >
                          {showFormulaView ? 'Simple View' : 'Formula View'}
                        </button>
                        <button
                          onClick={() => setShowRawPrecision(!showRawPrecision)}
                          className={`px-5 py-2.5 backdrop-blur-xl rounded-full text-sm font-medium transition-all shadow-sm border ${
                            showRawPrecision
                              ? 'bg-blue-50 text-blue-700 border-blue-200/50'
                              : 'bg-white/80 text-gray-800 border-gray-200/50 hover:bg-white'
                          }`}
                        >
                          {showRawPrecision ? 'Hide Raw Values' : 'Show Raw Values'}
                        </button>
                      </div>
                      <button
                        onClick={handleCopyToClipboard}
                        className="p-2.5 bg-white/80 backdrop-blur-xl rounded-full text-gray-700 hover:bg-white transition-all shadow-sm border border-gray-200/50"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-5 h-5" strokeWidth={2} />
                      </button>
                    </div>

                    <ResultsDisplay
                      mode={mode}
                      reverseMode={reverseMode}
                      result={result}
                      currency={currency}
                      showFormulaView={showFormulaView}
                      showRawPrecision={showRawPrecision}
                      basePrice={parseFloat(basePrice)}
                      finalAIP={parseFloat(finalAIP)}
                      gstPercent={parseFloat(gstPercent)}
                      processingFeePercent={parseFloat(processingFeePercent)}
                      gstOnProcessingFeePercent={parseFloat(gstOnProcessingFeePercent)}
                    />
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'forecast' && <EditionForecast />}
        {activeTab === 'refunds' && <RefundsCalculator />}
        {activeTab === 'discounts' && <DiscountsCalculator />}
      </div>
    </div>
  );
}

export default App;
