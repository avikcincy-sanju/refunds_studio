import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Info } from 'lucide-react';

const PRESET_OPTIONS = ['0', '10', '11', '12', '13', '14', '15'];

interface GstDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

function sanitizeGstInput(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
  if (parts.length === 2) return parts[0] + '.' + parts[1].slice(0, 2);
  return cleaned;
}

export function GstDropdown({ value, onChange }: GstDropdownProps) {
  const isPreset = (v: string) => PRESET_OPTIONS.includes(v) || PRESET_OPTIONS.includes(String(parseFloat(v)));

  const [selectValue, setSelectValue] = useState<string>(
    value === '' ? '' : isPreset(value) ? (PRESET_OPTIONS.find(o => parseFloat(o) === parseFloat(value)) ?? 'other') : 'other'
  );
  const [customInput, setCustomInput] = useState<string>(
    isPreset(value) || value === '' ? '' : value
  );
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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sel = e.target.value;
    setSelectValue(sel);
    setValidationError('');
    if (sel === '') {
      onChange('');
    } else if (sel === 'other') {
      setCustomInput('');
      onChange('');
    } else {
      setCustomInput('');
      onChange(sel);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const sanitized = sanitizeGstInput(raw);
    setCustomInput(sanitized);
    setValidationError('');
    if (sanitized === '' || sanitized === '.') { onChange(''); return; }
    const num = parseFloat(sanitized);
    if (isNaN(num)) { setValidationError('Enter a valid number.'); return; }
    if (num < 0) { setValidationError('GST/VAT/TAX % cannot be negative.'); return; }
    const decimalPart = sanitized.split('.')[1];
    if (decimalPart && decimalPart.length > 2) { setValidationError('Max 2 decimal places allowed.'); return; }
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

  const isOther = selectValue === 'other';
  const hasValue = selectValue !== '';

  const displayValue =
    selectValue === '' ? null
    : isOther
      ? (customInput === '' ? null : (Math.round(parseFloat(customInput) * 100) / 100).toFixed(2))
      : parseFloat(selectValue).toFixed(2);

  return (
    <div className="bg-white border-2 border-yellow-300 rounded-2xl p-4 shadow-sm hover:border-yellow-400 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-yellow-700">GST/VAT/TAX %</span>
          <div className="relative" ref={tooltipRef}>
            <button
              type="button"
              onClick={() => setShowTooltip(v => !v)}
              className="text-yellow-500 hover:text-yellow-700 transition-colors"
            >
              <Info size={13} />
            </button>
            {showTooltip && (
              <div className="absolute left-0 top-6 z-50 w-72 bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl leading-relaxed">
                GST/VAT/TAX follows Njuko rounding standards (2 decimal precision). Select a preset or enter a custom value.
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
          value={selectValue}
          onChange={handleSelectChange}
          className="w-full px-4 py-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-500 font-semibold text-gray-800 appearance-none cursor-pointer text-sm pr-10"
        >
          <option value="">-- Select GST/VAT/TAX % --</option>
          {PRESET_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{parseFloat(opt).toFixed(2)}%</option>
          ))}
          <option value="other">Other (custom)</option>
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

      {(isOther && displayValue !== null || (!hasValue)) && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-xs text-gray-500">
            {isOther && displayValue !== null ? 'Custom rate' : 'Select a rate above'}
          </span>
        </div>
      )}
    </div>
  );
}
