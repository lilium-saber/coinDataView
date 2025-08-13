import React, {createContext, useContext} from "react";

interface AuthContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    username: string;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    UserLogin: (username: string) => void;
    UserLogout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    username: "",
    setUsername: () => {},
    UserLogin: () => {},
    UserLogout: () => {}
});

export function AuthProvider({children} : {children: React.ReactNode}) {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [username, setUsername] = React.useState("");

    const UserLogin = (name: string) => {
        setIsLoggedIn(true);
        setUsername(name);
    };

    const UserLogout = () => {
        setIsLoggedIn(false);
        setUsername("");
    };

    return (
        <AuthContext.Provider value={{
            isLoggedIn, setIsLoggedIn,
            username, setUsername,
            UserLogin, UserLogout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function UseAuth() {
    return useContext(AuthContext);
}
