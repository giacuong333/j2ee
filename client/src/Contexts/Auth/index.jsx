import React from "react";
import AuthService from "../../Services/auth";
import UserService from "../../Services/user";
import paths from "../../Constants/paths";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../Components/Toast";
import { jwtDecode } from "jwt-decode";
import {
	clearTokens,
	getStoredToken,
	storeTokens,
} from "../../Utils/validation";
import { moveUserTo } from "../../Utils/moveUserTo";

const AuthContext = React.createContext();

const Auth = ({ children }) => {
	const [user, setUser] = React.useState(null);
	const [isPendingLogin, setIsPendingLogin] = React.useState(false);
	const [isPendingRegister, setIsPendingRegister] = React.useState(false);
	const navigate = useNavigate();

	React.useEffect(() => {
		const checkAuth = async () => {
			const storedToken = getStoredToken();
			if (storedToken) {
				try {
					const decoded = jwtDecode(storedToken);
					if (decoded.exp * 1000 > Date.now()) {
						const response = await UserService.getUserProfile();
						if (response.status === 200) {
							const user = response?.data;
							setUser(user);
						} else {
							throw new Error("Failed to fetch user profile");
						}
					} else {
						clearTokens();
					}
				} catch (error) {
					console.error("Error checking auth: ", error);
					clearTokens();
					setUser(null);
					navigate(paths.login);
				}
			}
		};

		checkAuth();
	}, [navigate]);

	const login = async (payload) => {
		try {
			setIsPendingLogin(true);

			const response = await AuthService.login(payload);
			if (response.status === 200) {
				showToast("Login successfully");
				const { token } = response?.data;
				storeTokens(token);

				const userResponse = await UserService.getUserProfile();
				if (userResponse.status === 200) {
					const user = userResponse?.data;
					const role = user?.role?.name;
					setUser(user);
					navigate(moveUserTo(role));
				} else {
					throw new Error("Failed to fetch user profile after login");
				}
			}
		} catch (error) {
			if (error.response?.status === 404) {
				showToast("Account does not exist", "error");
			} else if (error.response?.status === 401) {
				showToast("Password is incorrect", "error");
			} else {
				showToast("Internal Server Error", "error");
				console.log("Error occurs while registering:", error);
			}
		} finally {
			setIsPendingLogin(false);
		}
	};

	const register = async (payload) => {
		try {
			setIsPendingRegister(true);
			const response = await AuthService.register(payload);
			if (response.status === 201) {
				showToast("Register successfully");
				navigate(paths.login);
			}
		} catch (error) {
			if (error.response?.status === 409)
				showToast("Email or phone was registered", "error");

			showToast("Internal Server Error", "error");
			console.log("Error occurs while registering:", error);
		} finally {
			setIsPendingRegister(false);
		}
	};

	const logout = async (showMessage = true) => {
		await AuthService.logout();
		showMessage && showToast("Logged out successfully");
		clearTokens();
		navigate(paths.login);
		setUser(null);
	};

	const isAuthenticated = React.useMemo(() => !!user, [user]);

	return (
		<AuthContext.Provider
			value={{
				user,
				isPendingLogin,
				isPendingRegister,
				isAuthenticated,
				login,
				register,
				logout,
				setUser,
			}}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => React.useContext(AuthContext);

export default Auth;
