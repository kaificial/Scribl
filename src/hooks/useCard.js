import { useState, useEffect } from 'react';
import { api } from '../services/api';

/**
 * Custom hook for fetching and caching card data with SWR (Stale-While-Revalidate)
 * @param {string} id - The card ID
 * @returns {Object} - { card, isLoading, error, refresh }
 */
export function useCard(id) {
    const cacheKey = `scribl_card_${id}`;

    // Helper to get cache synchronously
    const getCached = () => {
        const cached = localStorage.getItem(cacheKey);
        try {
            return cached ? JSON.parse(cached) : null;
        } catch (e) {
            return null;
        }
    };

    const [card, setCard] = useState(getCached);
    const [isLoading, setIsLoading] = useState(!card);
    const [error, setError] = useState(null);
    const [lastId, setLastId] = useState(id);

    // Sync state immediately if ID changes (before useEffect)
    if (id !== lastId) {
        const cached = getCached();
        setCard(cached);
        setIsLoading(!cached);
        setLastId(id);
    }

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
        // We already handled immediate cache sync in the render body above
        fetchCard(!!card); // fetch silently if we have ANY data (even stale)

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
