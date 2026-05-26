'use client'

import type { AxiosError } from 'axios'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validators'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'
import { GoogleLogin } from '@react-oauth/google'

type LoginFormData = LoginInput

// Floating particles component
function FloatingParticles() {
    const particles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: Math.random() * 10 + 15
    }))

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute rounded-full bg-white/20 animate-float"
                    style={{
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        left: `${particle.left}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${particle.delay}s`,
                        animationDuration: `${particle.duration}s`
                    }}
                />
            ))}
        </div>
    )
}

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [emailFocused, setEmailFocused] = useState(false)
    const [passwordFocused, setPasswordFocused] = useState(false)
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
    const [loginSuccess, setLoginSuccess] = useState(false)

    // ✅ Access token stored in memory only; refresh token lives in HttpOnly cookie (set by server)
    const setAccessToken = useAuthStore((state) => state.setAccessToken)
    const setUser = useAuthStore((state) => state.setUser)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            rememberMe: false
        }
    })

    const emailValue = watch('email')
    const passwordValue = watch('password')

    // Track cursor position for interactive gradient
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setCursorPosition({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    // ✅ Secure login: access token → Zustand memory only; refresh token → HttpOnly cookie (never visible to JS)
    const onSubmit = async (data: LoginFormData) => {
        setError(null)

        try {
            // authApi uses withCredentials — server sets the HttpOnly refresh_token cookie automatically
            const payload = await authApi.login(data.email, data.password)

            // Store access token in memory ONLY (never localStorage/sessionStorage)
            setAccessToken(payload.access_token)
            // Persist minimal user metadata (no tokens) — in-memory only, no localStorage
            if (payload.user) setUser(payload.user)

            // Show success animation before redirect
            setLoginSuccess(true)
            setTimeout(() => {
                router.replace('/dashboard')
            }, 800)
        } catch (err: unknown) {
            const axiosErr = err as AxiosError<{ error?: { message?: string } }>
            setError(
                axiosErr?.response?.data?.error?.message ??
                'Login failed. Please check your credentials.'
            )
        }
    }

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setError(null)
        try {
            if (!credentialResponse.credential) throw new Error('No credential received');
            const payload = await authApi.googleLogin(credentialResponse.credential);
            setAccessToken(payload.access_token);
            if (payload.user) setUser(payload.user);
            setLoginSuccess(true);
            setTimeout(() => {
                router.replace('/dashboard')
            }, 800)
        } catch (err: unknown) {
            const axiosErr = err as AxiosError<{ error?: { message?: string } }>
            setError(
                axiosErr?.response?.data?.error?.message ??
                'Google Login failed. Please try again.'
            )
        }
    }

    // Only show Google Login when a real client ID is configured.
    // An empty or placeholder client ID causes a Google 401 invalid_client error.
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const hasGoogleAuth = Boolean(googleClientId && !googleClientId.includes('placeholder'))

    return (
        <div className="min-h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 relative">
            {/* Interactive gradient orb that follows cursor */}
            <div
                className="fixed w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none transition-all duration-700 ease-out"
                style={{
                    left: `${cursorPosition.x - 192}px`,
                    top: `${cursorPosition.y - 192}px`
                }}
            />

            {/* Left side - Enhanced Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 p-12 flex-col justify-between relative overflow-hidden animate-fade-in">
                {/* Floating particles */}
                <FloatingParticles />

                {/* Animated gradient mesh */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute top-[10%] right-[-10%] w-[400px] h-[400px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                <div className="absolute bottom-[10%] left-[30%] w-[450px] h-[450px] bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }} />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8 animate-slide-in-left">
                        <div className="h-14 w-14 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg animate-pulse-glow">
                            <Icons.activity className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-white drop-shadow-lg">VitalCache</span>
                    </div>

                    <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg animate-slide-in-left delay-100">
                        Modern Clinic<br />Management
                    </h1>
                    <p className="text-blue-100 text-lg leading-relaxed drop-shadow animate-slide-in-left delay-200">
                        Streamline your healthcare practice with our comprehensive management platform
                    </p>
                </div>

                {/* Feature cards */}
                <div className="relative z-10 space-y-4">
                    {[
                        { icon: Icons.patients, title: "Patient Management", desc: "Complete patient records and history at your fingertips" },
                        { icon: Icons.appointments, title: "Appointment Scheduling", desc: "Smart calendar with automated reminders" },
                        { icon: Icons.billing, title: "Billing & Analytics", desc: "Track revenue and insights in real-time" }
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className={`flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 hover-lift cursor-default animate-slide-in-left delay-${(index + 3) * 100}`}
                        >
                            <div className="h-12 w-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                                <feature.icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1 drop-shadow">{feature.title}</h3>
                                <p className="text-blue-100 text-sm drop-shadow-sm">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust badges */}
                <div className="relative z-10 pt-6 border-t border-white/20 animate-fade-in delay-700">
                    <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm">
                        <div className="flex items-center gap-2">
                            <Icons.check className="w-4 h-4" />
                            <span>HIPAA Compliant</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icons.check className="w-4 h-4" />
                            <span>99.9% Uptime</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icons.check className="w-4 h-4" />
                            <span>24/7 Support</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
                {/* Subtle background orbs */}
                <div className="absolute top-[10%] right-[10%] w-[250px] h-[250px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute bottom-[20%] left-[5%] w-[200px] h-[200px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

                <div className="w-full max-w-md relative z-10 animate-fade-in-up">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                            <Icons.activity className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VitalCache</span>
                    </div>

                    {/* Success overlay */}
                    {loginSuccess && (
                        <div className="absolute inset-0 bg-white rounded-3xl flex flex-col items-center justify-center z-50 animate-scale-in">
                            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce">
                                <Icons.check className="w-10 h-10 text-green-600" />
                            </div>
                            <p className="text-xl font-semibold text-gray-900">Login Successful!</p>
                            <p className="text-sm text-gray-500 mt-1">Redirecting to dashboard...</p>
                        </div>
                    )}

                    {/* Form card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/60 relative overflow-hidden hover-glow transition-all duration-300">
                        {/* Header */}
                        <div className="mb-8 relative">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                                Welcome back
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                    Sign up here
                                </Link> to continue
                            </p>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl flex items-start gap-3 shadow-sm animate-shake">
                                <Icons.alert className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Email field */}
                            <div className="relative group">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                        <Icons.mail className={`h-5 w-5 transition-all duration-200 ${emailFocused || emailValue ? 'text-blue-600 scale-110' : 'text-gray-400'
                                        }`} />
                                    </div>

                                    <Input
                                        type="email"
                                        {...register('email')}
                                        onFocus={() => setEmailFocused(true)}
                                        onBlur={() => setEmailFocused(false)}
                                        className="pl-10 pt-6 pb-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:shadow-lg focus:shadow-blue-100 peer bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:shadow-md"
                                        placeholder=" "
                                        disabled={isSubmitting}
                                    />

                                    <label
                                        className={`absolute left-10 text-gray-500 pointer-events-none transition-all duration-200 ${emailFocused || emailValue ? 'top-1 text-xs text-blue-600 font-medium' : 'top-3 text-base'
                                        }`}
                                    >
                                        Email address
                                    </label>
                                </div>

                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                                        <Icons.alert className="w-3 h-3" />
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password field */}
                            <div className="relative">
                                <div className="flex items-center justify-end mb-2">
                                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline">
                                        Forgot password?
                                    </a>
                                </div>

                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                        <Icons.stethoscope className={`h-5 w-5 transition-all duration-200 ${passwordFocused || passwordValue ? 'text-blue-600 scale-110' : 'text-gray-400'
                                        }`} />
                                    </div>

                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        {...register('password')}
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => setPasswordFocused(false)}
                                        className="pl-10 pr-10 pt-6 pb-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:shadow-lg focus:shadow-blue-100 peer bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:shadow-md"
                                        placeholder=" "
                                        disabled={isSubmitting}
                                    />

                                    <label
                                        className={`absolute left-10 text-gray-500 pointer-events-none transition-all duration-200 ${passwordFocused || passwordValue ? 'top-1 text-xs text-blue-600 font-medium' : 'top-3 text-base'
                                        }`}
                                    >
                                        Password
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 hover:scale-110 transition-transform duration-200"
                                        disabled={isSubmitting}
                                    >
                                        {showPassword ? (
                                            <Icons.eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Icons.eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>

                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                                        <Icons.alert className="w-3 h-3" />
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    {...register('rememberMe')}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-110"
                                    disabled={isSubmitting}
                                />
                                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 select-none cursor-pointer">
                                    Remember me for 30 days
                                </label>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                isLoading={isSubmitting}
                                className="w-full h-12 text-base font-semibold relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span className="relative z-10">{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
                                {/* Ripple effect on hover */}
                                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                            </Button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white/80 text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="flex justify-center mt-4">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Google login failed. Please use email/password.')}
                                    theme="outline"
                                    size="large"
                                    text="signin_with"
                                    shape="rectangular"
                                />
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <a href="#" className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all">
                                    Contact your administrator
                                </a>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="mt-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>© 2025 VitalCache.</span>
                                <span className="text-gray-400">|</span>
                                <span>All rights reserved.</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>Built with ❤️ by</span>
                                <a
                                    href="https://skaeht.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all"
                                >
                                    skaeht
                                </a>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                                <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
                                <span>·</span>
                                <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
                                <span>·</span>
                                <a href="#" className="hover:text-gray-600 transition-colors">Contact</a>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>

            {/* CSS Animations - keeping existing ones */}
            <style jsx global>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }

                .animate-blob {
                    animation: blob 7s infinite;
                }

                .animation-delay-2000 {
                    animation-delay: 2s;
                }

                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    )
}