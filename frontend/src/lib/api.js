const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const api = {
  async classify(prompt) {
    try {
      const response = await fetch(`${API_BASE}/api/v1/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error('Classification failed');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  async proxy(prompt, systemPrompt, bypassProtection = false) {
    try {
      const response = await fetch(`${API_BASE}/api/v1/proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemPrompt, bypassProtection }),
      });
      if (!response.ok) throw new Error('Proxy failed');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  async getStats() {
    try {
      const response = await fetch(`${API_BASE}/api/v1/stats`);
      if (!response.ok) throw new Error('Fetching stats failed');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }
};
