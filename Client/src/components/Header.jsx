import { NavLink } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import CurrencySelector from "./CurrencySelector";
import useTheme from "../hooks/useTheme";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useAuth } from "../context/AuthContext";

const Header = ({ menu, toggleMenu }) => {
	const { theme, toggleTheme } = useTheme();
	const { user, logout } = useAuth();

	return (
		<div className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex-shrink-0 flex items-center">
						<NavLink to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
							CryptoTrack
						</NavLink>
					</div>
					<div className="hidden sm:flex items-center space-x-8">
						<NavLink
							to="/"
							className={({ isActive }) =>
								isActive
									? "text-blue-600 dark:text-blue-400 font-medium"
									: "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
							}
						>
							Home
						</NavLink>
						<NavLink
							to="/dashboard"
							className={({ isActive }) =>
								isActive
									? "text-blue-600 dark:text-blue-400 font-medium"
									: "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
							}
						>
							Dashboard
						</NavLink>
						<NavLink
							to="/watchlist"
							className={({ isActive }) =>
								isActive
									? "text-blue-600 dark:text-blue-400 font-medium"
									: "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
							}
						>
							Watchlist
						</NavLink>

						{user ? (
							<div className="flex items-center space-x-4">
								<span className="text-gray-700 dark:text-gray-300">Hi, {user.username}</span>
								<button
									onClick={logout}
									className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
								>
									Logout
								</button>
							</div>
						) : (
							<div className="flex items-center space-x-4">
								<NavLink
									to="/login"
									className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
								>
									Login
								</NavLink>
								<NavLink
									to="/signup"
									className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
								>
									Sign Up
								</NavLink>
							</div>
						)}

						<CurrencySelector />
						<button
							onClick={toggleTheme}
							className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						>
							{theme === "light" ? (
								<DarkModeIcon className="text-gray-700" />
							) : (
								<LightModeIcon className="text-yellow-400" />
							)}
						</button>
					</div>
					<div className="sm:hidden flex items-center">
						<button
							onClick={toggleMenu}
							className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
						>
							{menu ? <CloseIcon /> : <MenuIcon />}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Header;
