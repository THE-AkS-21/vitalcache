'use client'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/ui/icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState } from 'react'

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = () => {
        setIsLoading(true)
        setTimeout(() => setIsLoading(false), 1000)
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Settings" description="Manage your account and preferences." />

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <div className="card p-6 space-y-6 border-none shadow-xl bg-white/50 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                                <AvatarImage src="https://avatar.vercel.sh/dr-smith.png" />
                                <AvatarFallback>DS</AvatarFallback>
                            </Avatar>
                            <div>
                                <Button variant="outline" size="sm">Change Avatar</Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <Input defaultValue="Dr. John Smith" className="bg-white/50" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input defaultValue="john.smith@hospital.com" className="bg-white/50" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Specialization</label>
                                <Input defaultValue="Cardiologist" className="bg-white/50" />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                                {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card p-6 space-y-6 border-none shadow-xl bg-white/50 backdrop-blur-xl">
                        <h3 className="font-semibold text-lg">Appearance</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl border bg-white/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-slate-100">
                                        <Icons.sun className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Theme</p>
                                        <p className="text-xs text-muted-foreground">Customize interface theme</p>
                                    </div>
                                </div>
                                <select className="bg-transparent border-none text-sm font-medium focus:ring-0">
                                    <option>Light</option>
                                    <option>Dark</option>
                                    <option>System</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6 space-y-6 border-none shadow-xl bg-white/50 backdrop-blur-xl">
                        <h3 className="font-semibold text-lg text-red-600">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground">
                            Irreversible actions regarding your account.
                        </p>
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            Delete Account
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}