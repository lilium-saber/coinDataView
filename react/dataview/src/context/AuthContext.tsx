import React, {createContext, useContext} from "react";

interface AuthContextType {
    userId: string;
    setUserId: React.Dispatch<React.SetStateAction<string>>;
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    username: string;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    UserLogin: (username: string, userId: string) => void;
    UserLogout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    userId: "",
    setUserId: () => {},
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
    const [userId, setUserId] = React.useState("");

    const UserLogin = (name: string, id: string) => {
        setIsLoggedIn(true);
        setUsername(name);
        setUserId(id);
    };

    const UserLogout = () => {
        setIsLoggedIn(false);
        setUsername("");
        setUserId("");
    };

    return (
        <AuthContext.Provider value={{
            userId, setUserId,
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
