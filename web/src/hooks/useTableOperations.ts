import { useState, useMemo } from 'react';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export function useTableOperations<T extends Record<string, any>>(data: T[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = useMemo(() => {
    let processed = [...data];

    // Filtering
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      processed = processed.filter((item) => {
        return Object.values(item).some((value) =>
          String(value).toLowerCase().includes(lowerSearch)
        );
      });
    }

    // Sorting
    if (sortConfig) {
      processed.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return processed;
  }, [data, searchTerm, sortConfig]);

  function getNestedValue(obj: any, key: string) {
    return key.split('.').reduce((o, i) => (o ? o[i] : null), obj);
  }

  return {
    searchTerm,
    setSearchTerm,
    sortConfig,
    requestSort,
    filteredAndSortedData,
  };
}
