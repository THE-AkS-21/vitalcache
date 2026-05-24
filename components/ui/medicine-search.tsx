'use client';

/**
 * MedicineSearch — Autocomplete search for the prescription builder
 *
 * Fixes from original:
 * ✅ useDebounce hook replaces the manual setTimeout inside useEffect
 * ✅ medicinesApi.search now returns Medicine[] directly (no .data unwrap needed)
 * ✅ useQuery replaces manual isLoading / results state management
 *    — query only fires when debounced input is ≥2 chars (enabled flag)
 * ✅ Close dropdown on outside click (focus-within + blur pattern)
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, Pill } from 'lucide-react';
import { searchMedicines, type Medicine } from '@/lib/api/medicines';
import { useDebounce } from '@/lib/hooks/use-debounce';

interface MedicineSearchProps {
  onSelect: (medicine: Medicine) => void;
}

export function MedicineSearch({ onSelect }: MedicineSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const { data: results = [], isFetching } = useQuery<Medicine[]>({
    queryKey: ['medicines', 'search', debouncedQuery],
    queryFn: ({ signal }) => searchMedicines(debouncedQuery, 20, signal),
    enabled: debouncedQuery.trim().length >= 2,
    // Keep previous results while new ones load — prevents flicker
    placeholderData: (prev) => prev,
    // Don't cache search results for long — medicine data is looked up fresh
    staleTime: 10_000,
  });

  const showDropdown = isOpen && debouncedQuery.trim().length >= 2;

  const handleSelect = (med: Medicine) => {
    onSelect(med);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div
      className="relative w-full"
      onFocus={() => setIsOpen(true)}
      onBlur={(e) => {
        // Only close if focus moved outside this container
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsOpen(false);
        }
      }}
    >
      {/* Search input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 text-gray-400 pointer-events-none" size={16} aria-hidden="true" />
        <input
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown && results.length > 0}
          aria-label="Search medicines"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search medicines (e.g., Paracetamol)..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
        />
        {isFetching && (
          <Loader2
            className="absolute right-3 text-indigo-500 animate-spin pointer-events-none"
            size={16}
            aria-label="Searching..."
          />
        )}
      </div>

      {/* Dropdown results */}
      {showDropdown && results.length > 0 && (
        <ul
          role="listbox"
          aria-label="Medicine search results"
          className="absolute z-50 w-full mt-1 bg-white/95 backdrop-blur-md rounded-xl shadow-xl max-h-60 overflow-y-auto border border-slate-100"
        >
          {results.map((med) => (
            <li
              key={med.id}
              role="option"
              aria-selected="false"
              tabIndex={0}
              onClick={() => handleSelect(med)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect(med); }}
              className="flex items-start px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors outline-none focus:bg-indigo-50"
            >
              <Pill className="text-indigo-400 mt-0.5 mr-3 flex-shrink-0" size={16} aria-hidden="true" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">{med.name}</p>
                {med.dosage_options && med.dosage_options.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {med.dosage_options.slice(0, 2).map((dose) => (
                      <span key={dose} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {dose}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Empty state */}
      {showDropdown && results.length === 0 && !isFetching && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl p-4 text-center text-sm text-gray-400 border border-slate-100">
          No medicines found for &ldquo;{debouncedQuery}&rdquo;
        </div>
      )}
    </div>
  );
}