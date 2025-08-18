import React from "react";
import { UseAuth } from "../context/AuthContext";
import { TextField, Button, Stack, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function UserLoginPage () {
    const {isLoggedIn, username, UserLogin} = UseAuth();
    const [isLoginMode, setIsLoginMode] = React.useState(true);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const [loginForm, setLoginForm] = React.useState({ UserId: "", UserPassword: "" });
    const [registerForm, setRegisterForm] = React.useState({
        UserId: "",
        UserPassword: "",
        UserName: "",
        UserEmail: ""
    });
    const navigate = useNavigate();

    const handleChange = (form: any, setForm: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLogin = async () => {
        if (!loginForm.UserId || !loginForm.UserPassword) {
            setError("UserId and UserPassword cannot be empty");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const res = await fetch("http://localhost:11434/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginForm)
            });
            const data = await res.json();
            if (data.success === 1) {
                document.cookie = `token=${data.message}; max-age=43200; path=/`;
                UserLogin(loginForm.UserId, loginForm.UserId);
                navigate("/");
            } else {
                setError("id or password is wrong");
            }
        } catch {
            setError("network error");
        }
        setLoading(false);
    };

    if (isLoggedIn) {
        return (
            <Box sx={{maxWidth: 400, mx: "auto", p: 3}}>
                <Typography variant="h5" mb={2}>
                    {isLoginMode ? "user log in" : "user register"}
                </Typography>
                {isLoginMode ? (
                    <Stack spacing={2}>
                        <Typography>
                        you have logged in as {username}
                        </Typography> 
                        <Button variant="contained" fullWidth onClick={() => setIsLoginMode(false)}>
                            enter register
                        </Button>
                    </Stack>
                    ) : (
                        <Stack spacing={2}>
                            <TextField
                                label="UserId"
                                name="UserId"
                                value={registerForm.UserId}
                                onChange={handleChange(registerForm, setRegisterForm)}
                                fullWidth
                            />
                            <TextField
                                label="UserPassword"
                                name="UserPassword"
                                type="password"
                                value={registerForm.UserPassword}
                                onChange={handleChange(registerForm, setRegisterForm)}
                                fullWidth
                            />
                            <TextField
                                label="UserName"
                                name="UserName"
                                value={registerForm.UserName}
                                onChange={handleChange(registerForm, setRegisterForm)}
                                fullWidth
                            />
                            <TextField
                                label="UserEmail (can null)"
                                name="UserEmail"
                                value={registerForm.UserEmail}
                                onChange={handleChange(registerForm, setRegisterForm)}
                                fullWidth
                            />
                            <Stack direction="row" spacing={2} mt={2}>
                                <Button variant="contained" fullWidth>
                                    confirm register
                                </Button>
                                <Button variant="outlined" fullWidth onClick={() => setIsLoginMode(true)}>
                                    enter login
                                </Button>
                            </Stack>
                        </Stack>
                    )
                }
            </Box>
        );
    } else {
        return (
            <Box sx={{maxWidth: 400, mx: "auto", p: 3}}>
                <Typography variant="h5" mb={2}>
                    {isLoginMode ? "user log in" : "user register"}
                </Typography>
                {isLoginMode ? <Stack spacing={2}>
                    <TextField
                        label="UserId"
                        name="UserId"
                        value={loginForm.UserId}
                        onChange={handleChange(loginForm, setLoginForm)}
                        fullWidth
                    />
                    <TextField
                        label="UserPassword"
                        name="UserPassword"
                        type="password"
                        value={loginForm.UserPassword}
                        onChange={handleChange(loginForm, setLoginForm)}
                        fullWidth
                    />
                    <Stack direction="row" spacing={2} mt={2}>
                        <Button variant="contained" fullWidth onClick={handleLogin} disabled={loading}>
                            confirm login
                        </Button>
                        <Button variant="outlined" fullWidth onClick={() => setIsLoginMode(false)}>
                            enter register
                        </Button>
                    </Stack>
                </Stack> : (
                    <Stack spacing={2}>
                        <TextField
                            label="UserId"
                            name="UserId"
                            value={registerForm.UserId}
                            onChange={handleChange(registerForm, setRegisterForm)}
                            fullWidth
                        />
                        <TextField
                            label="UserPassword"
                            name="UserPassword"
                            type="password"
                            value={registerForm.UserPassword}
                            onChange={handleChange(registerForm, setRegisterForm)}
                            fullWidth
                        />
                        <TextField
                            label="UserName"
                            name="UserName"
                            value={registerForm.UserName}
                            onChange={handleChange(registerForm, setRegisterForm)}
                            fullWidth
                        />
                        <TextField
                            label="UserEmail（can null）"
                            name="UserEmail"
                            value={registerForm.UserEmail}
                            onChange={handleChange(registerForm, setRegisterForm)}
                            fullWidth
                        />
                        <Stack direction="row" spacing={2} mt={2}>
                            <Button variant="contained" fullWidth>
                                confirm register
                            </Button>
                            <Button variant="outlined" fullWidth onClick={() => setIsLoginMode(true)}>
                                enter login
                            </Button>
                        </Stack>
                    </Stack>
                )}
            </Box>
        );
    }
}