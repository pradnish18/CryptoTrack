import { useState, useEffect } from "react";
import { COINGECKO_TOP_COINS_API } from "../constants";

export default function useTopCoins() {
	const [coins, setCoins] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	useEffect(() => {
		const topCoins = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await fetch(COINGECKO_TOP_COINS_API);
				if (!response.ok) {
					throw new Error(`Failed to fetch: ${response.status}`);
				}
				const data = await response.json();
				setCoins(data);
			} catch (err) {
				console.error("Error fetching top coins, using mock data:", err);
				// Fallback to mock data
				import("../constants/mockData").then((module) => {
					setCoins(module.MOCK_COINS);
				});
				// Don't set error state so UI doesn't show error message
			} finally {
				setLoading(false);
			}
		};

		topCoins();
	}, []);

	return { coins, loading, error };
}
