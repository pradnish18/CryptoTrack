import axios from "axios";

// API base URL - falls back to localhost if env var not set
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add auth token to requests
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export const authAPI = {
	login: async (username, password) => {
		const response = await api.post("/login", { username, password });
		return response.data;
	},

	register: async (username, password) => {
		const response = await api.post("/register", { username, password });
		return response.data;
	},
};

export const portfolioAPI = {
	get: async () => {
		const response = await api.get("/portfolio");
		return response.data;
	},

	update: async (coin, coinData) => {
		const response = await api.put("/portfolio/update", { coin, coinData });
		return response.data;
	},
};

export const watchlistAPI = {
	get: async () => {
		const res = await api.get("/watchlist");
		return res.data;
	},

	add: async (coin) => {
		const res = await api.put("/watchlist/add", { coin });
		return res.data;
	},

	remove: async (coin) => {
		const res = await api.put("/watchlist/remove", { coin });
		return res.data;
	},
};

export default api;
