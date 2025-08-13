import React, {createContext, useContext} from "react";

const AuthContext = createContext({
    isLoggedIn: false,
    setIsLoggedIn: (v: boolean) => {},
    username: "",
    setUsername: (u: string) => {}
})

export function AuthProvider({children} : {children: React.ReactNode}) {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [username, setUsername] = React.useState("");

    return (
        <AuthContext.Provider value={{isLoggedIn, setIsLoggedIn, username, setUsername}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}