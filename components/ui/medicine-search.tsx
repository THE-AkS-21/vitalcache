"use client";

import React, { useState, useEffect } from 'react';
import { Search, Loader2, Pill } from 'lucide-react';
import { medicinesApi, Medicine } from '@/lib/api/medicines';

interface MedicineSearchProps {
    onSelect: (medicine: Medicine) => void;
}

export function MedicineSearch({ onSelect }: MedicineSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Medicine[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Debounce the search input
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await medicinesApi.search(query);
                setResults(response.data);
                setIsOpen(true);
            } catch (error) {
                console.error("Failed to search medicines", error);
            } finally {
                setIsLoading(false);
            }
        }, 300); // 300ms delay (debounce)

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="relative w-full max-w-md">
            {/* Search Input */}
            <div className="relative flex items-center">
                <Search className="absolute left-3 text-gray-400" size={18} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search medicines (e.g., Paracetamol)..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-clay-in bg-[#e0e5ec] text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 text-indigo-500 animate-spin" size={18} />
                )}
            </div>

            {/* Autocomplete Dropdown */}
            {isOpen && results.length > 0 && (
                <ul className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-md rounded-xl shadow-xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                    {results.map((med) => (
                        <li
                            key={med.id}
                            onClick={() => {
                                onSelect(med);
                                setQuery(''); // Clear search after selection
                                setIsOpen(false);
                            }}
                            className="flex items-start px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                        >
                            <Pill className="text-indigo-400 mt-1 mr-3 flex-shrink-0" size={18} />
                            <div>
                                <p className="font-bold text-gray-800 text-sm">{med.name}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {med.dosage_options?.slice(0, 2).map((dose, idx) => (
                                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {dose}
                    </span>
                                    ))}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Empty State */}
            {isOpen && results.length === 0 && !isLoading && query.length >= 2 && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl p-4 text-center text-sm text-gray-500">
                    No medicines found.
                </div>
            )}
        </div>
    );
}