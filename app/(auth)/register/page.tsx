'use client'

import type { AxiosError } from 'axios'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/lib/validators'
import { authApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'

type RegisterFormData = RegisterInput

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

export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
    const [registerSuccess, setRegisterSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'DOCTOR' // Default to DOCTOR as requested
        }
    })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setCursorPosition({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    const onSubmit = async (data: RegisterFormData) => {
        setError(null)

        try {
            await authApi.register(data)
            
            setRegisterSuccess(true)
            setTimeout(() => {
                router.replace('/login?registered=true')
            }, 1500)
        } catch (err: unknown) {
            const axiosErr = err as AxiosError<{ error?: { message?: string } }>
            setError(
                axiosErr?.response?.data?.error?.message ??
                'Registration failed. Please try again.'
            )
        }
    }

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
                <FloatingParticles />

                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute top-[10%] right-[-10%] w-[400px] h-[400px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                <div className="absolute bottom-[10%] left-[30%] w-[450px] h-[450px] bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

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
                        Join Our Network
                    </h1>
                    <p className="text-blue-100 text-lg leading-relaxed drop-shadow animate-slide-in-left delay-200">
                        Create an account to securely access patient records, manage appointments, and prescribe medications through our enterprise-grade clinical portal.
                    </p>
                </div>

                <div className="relative z-10 mt-auto pt-12 animate-slide-in-up delay-300">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                            <Icons.check className="h-8 w-8 text-blue-300 mb-4" />
                            <h3 className="text-white font-medium mb-2">HIPAA Compliant</h3>
                            <p className="text-blue-200 text-sm">End-to-end encryption for all patient data.</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                            <Icons.patients className="h-8 w-8 text-purple-300 mb-4" />
                            <h3 className="text-white font-medium mb-2">Collaborative</h3>
                            <p className="text-blue-200 text-sm">Seamlessly share records with authorized staff.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Enhanced Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
                <div className="max-w-md w-full space-y-8 animate-fade-in-up">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white shadow-xl shadow-blue-100 mb-6 border border-gray-100">
                            <Icons.activity className="h-8 w-8 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create an account</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Already registered?{' '}
                            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                Sign in here
                            </Link>
                        </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-900/5 p-8 border border-white">
                        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                            {error && (
                                <div className="p-4 bg-red-50/80 backdrop-blur border border-red-100 text-red-600 text-sm rounded-xl flex items-center animate-shake">
                                    <Icons.alert className="h-5 w-5 mr-3 flex-shrink-0 text-red-500" />
                                    {error}
                                </div>
                            )}

                            {registerSuccess ? (
                                <div className="p-8 text-center space-y-4 animate-fade-in">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                        <Icons.check className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-900">Registration Complete</h3>
                                    <p className="text-gray-500">Redirecting you to login...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700 ml-1">First Name</label>
                                            <Input
                                                id="first_name"
                                                type="text"
                                                placeholder="John"
                                                {...register('first_name')}
                                                className={`h-12 bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.first_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                            />
                                            {errors.first_name && <p className="text-red-500 text-xs mt-1 ml-1 animate-fade-in">{errors.first_name.message}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700 ml-1">Last Name</label>
                                            <Input
                                                id="last_name"
                                                type="text"
                                                placeholder="Doe"
                                                {...register('last_name')}
                                                className={`h-12 bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.last_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                            />
                                            {errors.last_name && <p className="text-red-500 text-xs mt-1 ml-1 animate-fade-in">{errors.last_name.message}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 ml-1">Email address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Icons.mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <Input
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                placeholder="doctor@vitalcache.com"
                                                {...register('email')}
                                                className={`h-12 pl-11 bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                            />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-xs mt-1 ml-1 animate-fade-in">{errors.email.message}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 ml-1">Role</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Icons.patients className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <select
                                                id="role"
                                                {...register('role')}
                                                className={`h-12 w-full pl-11 rounded-md bg-gray-50/50 border border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.role ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                            >
                                                <option value="DOCTOR">Doctor</option>
                                                <option value="PATIENT">Patient</option>
                                            </select>
                                        </div>
                                        {errors.role && <p className="text-red-500 text-xs mt-1 ml-1 animate-fade-in">{errors.role.message}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Icons.settings className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                            </div>
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                {...register('password')}
                                                className={`h-12 pl-11 pr-12 bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                            >
                                                {showPassword ? (
                                                    <Icons.eye className="h-5 w-5 opacity-50" />
                                                ) : (
                                                    <Icons.eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-red-500 text-xs mt-1 ml-1 animate-fade-in">{errors.password.message}</p>}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-12 mt-6 text-base font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Icons.spinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                                Creating account...
                                            </>
                                        ) : (
                                            'Sign Up'
                                        )}
                                    </Button>
                                </>
                            )}
                        </form>
                    </div>

                    <p className="text-center text-xs text-gray-500">
                        By registering, you agree to our{' '}
                        <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    )
}
