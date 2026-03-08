const API_BASE_URL = "/api";

export const authClient = {
    signIn: {
        email: async (credentials: any) => {
            const params = new URLSearchParams();
            params.append("username", credentials.email);
            params.append("password", credentials.password);

            try {
                const res = await fetch(`${API_BASE_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: params
                });
                const data = await res.json();

                if (!res.ok) {
                    return { error: { message: data.detail || "Login failed" } };
                }

                localStorage.setItem("token", data.access_token);
                window.dispatchEvent(new Event('auth-change'));
                return { error: null, data };
            } catch (err: any) {
                return { error: { message: err.message || "Network error" } };
            }
        },
        social: async ({ provider, callbackURL }: any) => {
            if (provider === "google") {
                // To be implemented using @react-oauth/google
                return { error: { message: "Google Auth not fully implemented on frontend yet." } };
            }
            if (provider === "facebook") {
                return { error: { message: "Facebook Auth not supported." } };
            }
            return { error: { message: "Unsupported provider" } };
        }
    },
    signUp: {
        email: async (data: any) => {
            try {
                const res = await fetch(`${API_BASE_URL}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: data.email, password: data.password })
                });
                const resData = await res.json();

                if (!res.ok) {
                    return { error: { message: resData.detail || "Registration failed" } };
                }

                // Auto login after sign up
                return authClient.signIn.email({ email: data.email, password: data.password });
            } catch (err: any) {
                return { error: { message: err.message || "Network error" } };
            }
        }
    },
    signOut: () => {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event('auth-change'));
        window.location.href = "/login";
    }
};

export const getToken = () => localStorage.getItem("token");
export const isAuthenticated = () => !!getToken();
