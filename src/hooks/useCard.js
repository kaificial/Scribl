import { useState, useEffect } from 'react';
import { api } from '../services/api';

/**
 * Custom hook for fetching and caching card data with SWR (Stale-While-Revalidate)
 * @param {string} id - The card ID
 * @returns {Object} - { card, isLoading, error, refresh }
 */
export function useCard(id) {
    const cacheKey = `scribl_card_${id}`;

    // Initial state from localStorage if available (Stale)
    const [card, setCard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCard = async (silent = false) => {
        if (!id) return;
        if (!silent) setIsLoading(true);

        try {
            const data = await api.getCard(id);
            if (data) {
                setCard(data);
                // Update cache (Revalidate)
                localStorage.setItem(cacheKey, JSON.stringify(data));
            }
            setError(null);
        } catch (err) {
            console.error(`Error fetching card ${id}:`, err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            setCard(JSON.parse(cached));
            setIsLoading(false);
        } else {
            setCard(null);
            setIsLoading(true);
        }

        fetchCard(!!cached); // fetch silently if we have cache

        // Listen for cache invalidation events (useful for cross-page sync)
        const handleStorage = (e) => {
            if (e.key === cacheKey && e.newValue) {
                setCard(JSON.parse(e.newValue));
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [id]);

    return {
        card,
        isLoading,
        error,
        refresh: () => fetchCard(true),
        mutate: (newData) => {
            setCard(newData);
            localStorage.setItem(cacheKey, JSON.stringify(newData));
        }
    };
}
