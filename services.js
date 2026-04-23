// VDI Chatbot API - FastAPI Backend Client
// All logic/reasoning delegated to backend (RAG, Troubleshooting, Ticket Generation)
const API_BASE_URL = 'http://localhost:8000';

// Session Management - Generate or load session ID
export function generateUUID() {
    try {
        // Modern browsers with crypto.randomUUID
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // Fallback for older environments
        return 'msg-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    } catch (e) {
        // Ultimate fallback if anything fails
        return 'msg-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
}

function getSessionId() {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
        sessionId = generateUUID();
        localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
}

/**
 * POST /chat - Main chat endpoint
 * Backend handles routing to: RAG, Troubleshooting Engine, or Ticket Generator
 * @param {string} sessionId - Optional session ID (auto-generated if not provided)
 * @param {string} message - User message
 * @returns {Promise<{ reply: string, intent: string, confidence: number }>}
 */
export const sendMessage = async (sessionId, message) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                session_id: sessionId || getSessionId(),
                message: message 
            })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Chat API Error:', error);
        throw error;
    }
};

/**
 * GET /chat/{session_id}/history - Retrieve conversation history
 * @param {string} sessionId - Session ID
 * @param {number} limit - Number of messages to retrieve (default: 50)
 * @returns {Promise<{ session_id: string, history: Array<{role: string, content: string}>, count: number }>}
 */
export const getChatHistory = async (sessionId, limit = 50) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/chat/${sessionId}/history?limit=${limit}`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Chat History API Error:', error);
        throw error;
    }
};

/**
 * Clear session from localStorage
 */
export const clearSession = () => {
    localStorage.removeItem('session_id');
};

/**
 * Get current session ID without creating new one
 * @returns {string|null}
 */
export const getCurrentSessionId = () => {
    return localStorage.getItem('session_id');
};
