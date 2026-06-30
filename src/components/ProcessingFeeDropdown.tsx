import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Info } from 'lucide-react';

interface BrandOption {
  label: string;
  fee: number | null;
}

const BRAND_OPTIONS: BrandOption[] = [
  { label: '0.00%',            fee: 0.00  },
  { label: 'IRONMAN',          fee: 10.00 },
  { label: 'IRONMAN 70.3',     fee: 10.00 },
  { label: 'IM World Champs',  fee: 10.00 },
  { label: 'Rock n Roll',      fee: 18.25 },
  { label: 'Running',          fee: 10.00 },
  { label: 'UTMB',             fee: 10.00 },
  { label: 'Haute Route',      fee: 0.00  },
  { label: 'Mountain Biking',  fee: 4.00  },
  { label: 'Other',            fee: null  },
];

function sanitizeFeeInput(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
  if (parts.length === 2) return parts[0] + '.' + parts[1].slice(0, 2);
  return cleaned;
}

interface ProcessingFeeDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

function getInitialBrand(value: string): string {
  if (value === '' ) return '';
  const numVal = parseFloat(value);
  const matched = BRAND_OPTIONS.find(o => o.fee !== null && o.fee === numVal);
  return matched ? matched.label : '';
}

export function ProcessingFeeDropdown({ value, onChange }: ProcessingFeeDropdownProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>(() => getInitialBrand(value));
  const [customInput, setCustomInput] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = e.target.value;
    setSelectedBrand(brand);
    setValidationError('');
    if (brand === '') { onChange(''); return; }
    const option = BRAND_OPTIONS.find(o => o.label === brand);
    if (!option) return;
    if (option.fee !== null) {
      setCustomInput('');
      onChange(option.fee.toFixed(2));
    } else {
      setCustomInput('');
      onChange('');
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const sanitized = sanitizeFeeInput(raw);
    setCustomInput(sanitized);
    setValidationError('');
    if (sanitized === '' || sanitized === '.') { onChange(''); return; }
    const num = parseFloat(sanitized);
    if (isNaN(num)) { setValidationError('Enter a valid number.'); return; }
    if (num < 0) { setValidationError('Processing Fee % cannot be negative.'); return; }
    onChange(sanitized);
  };

  const handleCustomBlur = () => {
    if (customInput === '' || customInput === '.') return;
    const num = parseFloat(customInput);
    if (!isNaN(num) && num >= 0) {
      const formatted = (Math.round(num * 100) / 100).toFixed(2);
      setCustomInput(formatted);
      onChange(formatted);
      setValidationError('');
    }
  };

  const isOther = selectedBrand === 'Other';
  const selectedOption = BRAND_OPTIONS.find(o => o.label === selectedBrand);
  const hasValue = selectedBrand !== '';

  const displayValue =
    selectedBrand === '' ? null
    : isOther
      ? (customInput === '' ? null : (Math.round(parseFloat(customInput) * 100) / 100).toFixed(2))
      : selectedOption?.fee !== null && selectedOption?.fee !== undefined
        ? selectedOption.fee.toFixed(2)
        : null;

  return (
    <div className="bg-white border-2 border-yellow-300 rounded-2xl p-4 shadow-sm hover:border-yellow-400 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-yellow-700">Processing Fee %</span>
          <div className="relative" ref={tooltipRef}>
            <button
              type="button"
              onClick={() => setShowTooltip(v => !v)}
              className="text-yellow-500 hover:text-yellow-700 transition-colors"
            >
              <Info size={13} />
            </button>
            {showTooltip && (
              <div className="absolute left-0 top-6 z-50 w-80 bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl leading-relaxed">
                Select a brand to auto-populate the standard processing fee, or choose Other to enter a custom value.
                <div className="absolute -top-1.5 left-2 w-3 h-3 bg-gray-900 rotate-45" />
              </div>
            )}
          </div>
        </div>
        {displayValue !== null && (
          <span className="text-lg font-bold text-gray-900 font-mono bg-yellow-100 px-3 py-0.5 rounded-lg border border-yellow-300">
            {displayValue}%
          </span>
        )}
        {displayValue === null && (
          <span className="text-sm font-medium text-gray-400 italic">Not set</span>
        )}
      </div>

      <div className="relative">
        <select
          value={selectedBrand}
          onChange={handleBrandChange}
          className="w-full px-4 py-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-500 font-semibold text-gray-800 appearance-none cursor-pointer text-sm pr-10"
        >
          <option value="">-- Select Brand --</option>
          {BRAND_OPTIONS.map(opt => (
            <option key={opt.label} value={opt.label}>
              {opt.label}{opt.fee !== null ? ` (${opt.fee.toFixed(2)}%)` : ''}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-600 pointer-events-none" />
      </div>

      {isOther && (
        <div className="mt-2">
          <input
            type="text"
            inputMode="decimal"
            value={customInput}
            onChange={handleCustomChange}
            onBlur={handleCustomBlur}
            placeholder="e.g. 7.50"
            className={`w-full px-4 py-3 bg-yellow-50 border-2 rounded-xl focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-500 font-semibold text-gray-800 text-sm ${
              validationError ? 'border-red-400' : 'border-yellow-200'
            }`}
          />
          {validationError && <p className="text-xs text-red-600 mt-1">{validationError}</p>}
        </div>
      )}

      <div className="mt-2 flex items-center gap-1.5">
        <span className={`inline-block w-2 h-2 rounded-full ${hasValue && !isOther ? 'bg-emerald-500' : isOther && displayValue !== null ? 'bg-amber-500' : 'bg-gray-300'}`} />
        <span className="text-xs text-gray-500">
          {hasValue && !isOther
            ? <span>Brand: <span className="font-medium text-gray-700">{selectedBrand}</span></span>
            : isOther && displayValue !== null ? 'Custom rate'
            : 'Select a brand above'}
        </span>
      </div>
    </div>
  );
}
