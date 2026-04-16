// /lib/auth/token-store.ts

class TokenStore {
    private accessToken: string | null = null

    setToken(token: string) {
        this.accessToken = token
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', token)
        }
    }

    getToken() {
        if (this.accessToken) return this.accessToken

        if (typeof window !== 'undefined') {
            this.accessToken = localStorage.getItem('accessToken')
        }

        return this.accessToken
    }

    clearToken() {
        this.accessToken = null
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken')
        }
    }
}

export const tokenStore = new TokenStore()