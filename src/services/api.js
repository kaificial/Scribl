const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const api = {
    getCard: async (id) => {
        const res = await fetch(`${API_URL}/cards/${id}`);
        if (!res.ok) return null;
        return res.json();
    },

    createCard: async (id, creatorName, recipientName) => {
        const res = await fetch(`${API_URL}/cards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, creatorName, recipientName })
        });
        return res.json();
    },

    addMessage: async (id, message, recipientName) => {
        const url = `${API_URL}/cards/${id}/messages${recipientName ? `?recipientName=${encodeURIComponent(recipientName)}` : ''}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });
        return res.json();
    },

    addDrawing: async (id, drawing, recipientName) => {
        const url = `${API_URL}/cards/${id}/drawings${recipientName ? `?recipientName=${encodeURIComponent(recipientName)}` : ''}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(drawing)
        });
        return res.json();
    },

    updateMessage: async (id, messageId, updates) => {
        const res = await fetch(`${API_URL}/cards/${id}/messages/${messageId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return res.json();
    },

    updateDrawing: async (id, drawingId, updates) => {
        const res = await fetch(`${API_URL}/cards/${id}/drawings/${drawingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return res.json();
    },

    deleteMessage: async (id, messageId) => {
        await fetch(`${API_URL}/cards/${id}/messages/${messageId}`, {
            method: 'DELETE'
        });
    },

    deleteDrawing: async (id, drawingId) => {
        await fetch(`${API_URL}/cards/${id}/drawings/${drawingId}`, {
            method: 'DELETE'
        });
    },

    updateWrappedData: async (id, wrappedData) => {
        const res = await fetch(`${API_URL}/cards/${id}/wrapped`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'text/plain' },
            body: typeof wrappedData === 'string' ? wrappedData : JSON.stringify(wrappedData)
        });
        return res.json();
    }
};
