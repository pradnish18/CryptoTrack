import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Watchlist from "./pages/Watchlist";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import Menu from "./components/Menu";
import { AuthProvider } from "./context/AuthContext";

function App() {
	const [menu, setMenu] = useState(false);
	const [watchlist, setWatchlist] = useState([]);
	const [form, setForm] = useState(false);
	const [coinData, setCoinData] = useState({});
	const [portfolio, setPortfolio] = useState({});

	// Load data from localStorage on mount
	useEffect(() => {
		const savedWatchlist = localStorage.getItem("cryptotrack_watchlist");
		const savedPortfolio = localStorage.getItem("cryptotrack_portfolio");

		if (savedWatchlist) {
			try {
				setWatchlist(JSON.parse(savedWatchlist));
			} catch (e) {
				console.error("Failed to parse watchlist from localStorage");
			}
		}

		if (savedPortfolio) {
			try {
				setPortfolio(JSON.parse(savedPortfolio));
			} catch (e) {
				console.error("Failed to parse portfolio from localStorage");
			}
		}
	}, []);

	// Save watchlist to localStorage whenever it changes
	useEffect(() => {
		localStorage.setItem("cryptotrack_watchlist", JSON.stringify(watchlist));
	}, [watchlist]);

	// Save portfolio to localStorage whenever it changes
	useEffect(() => {
		localStorage.setItem("cryptotrack_portfolio", JSON.stringify(portfolio));
	}, [portfolio]);

	const toggleForm = (coin = null) => {
		if (coin) {
			setCoinData(coin);
		} else {
			setCoinData({});
		}
		setForm(!form);
	};

	function addCoin(id, totalInvestment, coins) {
		const coinData = {
			totalInvestment: parseFloat(totalInvestment),
			coins: parseFloat(coins),
		};

		const updatedPortfolio = { ...portfolio };

		if (updatedPortfolio[id]) {
			// Update existing coin
			updatedPortfolio[id] = {
				totalInvestment: updatedPortfolio[id].totalInvestment + coinData.totalInvestment,
				coins: updatedPortfolio[id].coins + coinData.coins,
			};
		} else {
			// Add new coin
			updatedPortfolio[id] = coinData;
		}

		setPortfolio(updatedPortfolio);
		toggleForm();
		toast.success("Portfolio updated!");
	}

	function removeCoin(id, totalInvestment, coins) {
		const updatedPortfolio = { ...portfolio };

		if (updatedPortfolio[id]) {
			const coinsToRemove = parseFloat(coins);

			const newCoins = updatedPortfolio[id].coins - coinsToRemove;

			if (newCoins <= 0) {
				// Remove coin completely
				delete updatedPortfolio[id];
			} else {
				// Reduce proportionally
				const remainingRatio = newCoins / updatedPortfolio[id].coins;
				updatedPortfolio[id] = {
					totalInvestment: updatedPortfolio[id].totalInvestment * remainingRatio,
					coins: newCoins,
				};
			}
		}

		setPortfolio(updatedPortfolio);
		toggleForm();
		toast.success("Portfolio updated!");
	}

	const location = useLocation();

	useEffect(() => {
		setMenu(false);
	}, [location]);

	const toggleMenu = () => {
		setMenu(!menu);
	};

	function toggleWatchlist(coinId, coinName = null) {
		if (!watchlist.includes(coinId)) {
			setWatchlist([...watchlist, coinId]);
			toast.success(`${coinName || "Coin"} added to watchlist`);
		} else {
			setWatchlist(watchlist.filter(id => id !== coinId));
			toast.info(`${coinName || "Coin"} removed from watchlist`);
		}
	}

	return (
		<AuthProvider>
			<div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
				<div className="min-h-screen flex flex-col">
					<Header menu={menu} setMenu={setMenu} toggleMenu={toggleMenu} />
					<Routes>
						<Route
							path="/"
							element={
								<Home
									watchlist={watchlist}
									toggleWatchlist={toggleWatchlist}
									addCoin={addCoin}
									form={form}
									toggleForm={toggleForm}
									coinData={coinData}
								/>
							}
						/>
						<Route
							path="/dashboard"
							element={
								<Dashboard
									watchlist={watchlist}
									toggleWatchlist={toggleWatchlist}
									portfolio={portfolio}
									addCoin={addCoin}
									form={form}
									toggleForm={toggleForm}
									coinData={coinData}
									removeCoin={removeCoin}
								/>
							}
						/>
						<Route
							path="/watchlist"
							element={
								<Watchlist
									watchlist={watchlist}
									toggleWatchlist={toggleWatchlist}
									addCoin={addCoin}
									form={form}
									toggleForm={toggleForm}
									coinData={coinData}
								/>
							}
						/>
						<Route path="/login" element={<Login />} />
						<Route path="/signup" element={<SignUp />} />
					</Routes>
				</div>
				{menu && <Menu toggleMenu={toggleMenu} />}
				<ToastContainer />
			</div>
		</AuthProvider>
	);
}

export default App;
