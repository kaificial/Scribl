const API_URL = 'http://localhost:8080/api/cards';

const handleResponse = async (response) => {
    if (!response.ok) {
        const text = await response.text();
        const error = new Error(text || `Request failed with status ${response.status}`);
        error.response = { status: response.status, data: text };
        throw error;
    }
    return response.json();
};

export const api = {
    // Create a new card or persist an existing one
    createCard: async (id, creatorName, recipientName) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, creatorName, recipientName })
        });
        return handleResponse(response);
    },

    // Get card details (including messages/drawings)
    getCard: async (id) => {
        const response = await fetch(`${API_URL}/${id}`);
        // Handle 404 naturally without throwing if we want to support silent failure in UI
        if (response.status === 404) return null;
        return handleResponse(response);
    },

    // Add a text message
    addMessage: async (cardId, messageConfig, recipientName) => {
        const url = `${API_URL}/${cardId}/messages${recipientName ? `?recipientName=${encodeURIComponent(recipientName)}` : ''}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageConfig)
        });
        return handleResponse(response);
    },

    // Add a drawing
    addDrawing: async (cardId, drawingConfig, recipientName) => {
        const url = `${API_URL}/${cardId}/drawings${recipientName ? `?recipientName=${encodeURIComponent(recipientName)}` : ''}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(drawingConfig)
        });
        return handleResponse(response);
    },

    // Update Message
    updateMessage: async (cardId, messageId, updates) => {
        const response = await fetch(`${API_URL}/${cardId}/messages/${messageId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return handleResponse(response);
    },

    // Update Drawing
    updateDrawing: async (cardId, drawingId, updates) => {
        const response = await fetch(`${API_URL}/${cardId}/drawings/${drawingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return handleResponse(response);
    },

    // Delete Message
    deleteMessage: async (cardId, messageId) => {
        const response = await fetch(`${API_URL}/${cardId}/messages/${messageId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete message');
    },

    // Delete Drawing
    deleteDrawing: async (cardId, drawingId) => {
        const response = await fetch(`${API_URL}/${cardId}/drawings/${drawingId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete drawing');
    },

    // Update Wrapped Data (gift experience customization)
    updateWrappedData: async (cardId, wrappedData) => {
        const response = await fetch(`${API_URL}/${cardId}/wrapped`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(wrappedData)
        });
        return handleResponse(response);
    }
};
