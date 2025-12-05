import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in from localStorage
        const storedUser = localStorage.getItem("cryptotrack_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // JSON Server supports filtering: GET /users?email=x&password=y
            const res = await fetch(
                `http://localhost:3001/users?email=${email}&password=${password}`
            );

            if (!res.ok) throw new Error("Login failed");

            const users = await res.json();

            if (users.length > 0) {
                const loggedInUser = users[0];
                // Don't store password in state/localstorage
                const { password, ...userWithoutPassword } = loggedInUser;

                setUser(userWithoutPassword);
                localStorage.setItem("cryptotrack_user", JSON.stringify(userWithoutPassword));

                // Also load their portfolio/watchlist if it exists
                if (loggedInUser.portfolio) {
                    localStorage.setItem("cryptotrack_portfolio", JSON.stringify(loggedInUser.portfolio));
                }
                if (loggedInUser.watchlist) {
                    localStorage.setItem("cryptotrack_watchlist", JSON.stringify(loggedInUser.watchlist));
                }

                toast.success("Login successful!");
                return true;
            } else {
                toast.error("Invalid email or password");
                return false;
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Login failed. Is JSON Server running?");
            return false;
        }
    };

    const signup = async (username, email, password) => {
        try {
            // Check if user already exists
            const checkRes = await fetch(`http://localhost:3001/users?email=${email}`);
            const existingUsers = await checkRes.json();

            if (existingUsers.length > 0) {
                toast.error("User with this email already exists");
                return false;
            }

            // Create new user
            const newUser = {
                username,
                email,
                password,
                watchlist: [],
                portfolio: {}
            };

            const res = await fetch("http://localhost:3001/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newUser),
            });

            if (!res.ok) throw new Error("Signup failed");

            const createdUser = await res.json();

            // Auto login after signup
            const { password: _, ...userWithoutPassword } = createdUser;
            setUser(userWithoutPassword);
            localStorage.setItem("cryptotrack_user", JSON.stringify(userWithoutPassword));

            // Clear local data for new user
            localStorage.setItem("cryptotrack_portfolio", JSON.stringify({}));
            localStorage.setItem("cryptotrack_watchlist", JSON.stringify([]));

            toast.success("Account created successfully!");
            return true;
        } catch (error) {
            console.error("Signup error:", error);
            toast.error("Signup failed. Is JSON Server running?");
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("cryptotrack_user");
        // Optional: Clear portfolio/watchlist on logout or keep it?
        // For this app, we'll keep it in localStorage so it doesn't disappear visually
        // but in a real app you'd clear it.
        toast.info("Logged out successfully");
    };

    const value = {
        user,
        login,
        signup,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
