export const AUTH_KEY = 'weighter_auth_token';

export const login = (token: string, remember: boolean) => {
    if (typeof window !== 'undefined') {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(AUTH_KEY, token);
    }
};

export const logout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(AUTH_KEY);
        window.location.href = '/login';
    }
};

export const isAuthenticated = (): boolean => {
    if (typeof window !== 'undefined') {
        return !!(localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY));
    }
    return false;
};
