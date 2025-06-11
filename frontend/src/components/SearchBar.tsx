'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    isLoading?: boolean;
    resultCount?: number;
    totalCount?: number;
}

export default function SearchBar({
    onSearch,
    placeholder = "Search tasks by title...",
    isLoading = false,
    resultCount = 0,
    totalCount = 0
}: SearchBarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Debounce search to avoid too many API calls
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Call onSearch when debounced value changes
    useEffect(() => {
        onSearch(debouncedSearch);
    }, [debouncedSearch, onSearch]);

    const handleClear = useCallback(() => {
        setSearchQuery('');
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const showResults = searchQuery.trim().length > 0;

    return (
        <div className="mb-6">
            {/* Search Input */}
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                        maxLength={200}
                    />

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                        </div>
                    )}

                    {/* Clear button */}
                    {searchQuery && (
                        <button
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Search Results Indicator */}
            {showResults && (
                <div className="mt-3 animate-fade-in">
                    {resultCount > 0 ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-blue-700 font-medium">
                                        Found {resultCount} {resultCount === 1 ? 'task' : 'tasks'} matching "{searchQuery.trim()}"
                                    </span>
                                </div>
                                <button
                                    onClick={handleClear}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span className="text-sm text-yellow-700 font-medium">
                                        No tasks found for "{searchQuery.trim()}"
                                    </span>
                                </div>
                                <button
                                    onClick={handleClear}
                                    className="text-yellow-600 hover:text-yellow-800 text-sm font-medium transition-colors duration-200"
                                >
                                    Clear
                                </button>
                            </div>
                            <p className="text-xs text-yellow-600 mt-1 ml-4">
                                Try adjusting your search terms or browse all {totalCount} available tasks
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}