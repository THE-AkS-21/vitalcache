"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import apiClient from "@/services/api.client";
import { toast } from "sonner";
import { Icons } from "@/components/ui/icons";

export default function ProfilePage() {
    const { user } = useAuthStore();
    
    // Password state
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loadingPassword, setLoadingPassword] = useState(false);

    // Fee state
    const [fee, setFee] = useState<string>("");
    const [loadingFee, setLoadingFee] = useState(false);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oldPassword || !newPassword) return toast.error("Please fill all fields");
        
        setLoadingPassword(true);
        try {
            await apiClient.put("/api/v1/auth/password", { old_password: oldPassword, new_password: newPassword });
            toast.success("Password updated successfully");
            setOldPassword("");
            setNewPassword("");
        } catch (err) {
            toast.error("Failed to update password");
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleUpdateFee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.doctor_id) return toast.error("Doctor ID not found");
        
        const feeNum = parseFloat(fee);
        if (isNaN(feeNum) || feeNum < 0) return toast.error("Invalid fee amount");

        setLoadingFee(true);
        try {
            await apiClient.put(`/api/v1/doctors/${user.doctor_id}/fee`, { fee: feeNum });
            toast.success("Consultation fee updated successfully");
        } catch (err) {
            toast.error("Failed to update fee");
        } finally {
            setLoadingFee(false);
        }
    };

    if (!user) return <div className="p-6">Loading...</div>;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="clay-card">
                    <CardHeader>
                        <CardTitle>Personal Details</CardTitle>
                        <CardDescription>Your role and access level.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">User ID</label>
                            <div className="font-mono text-sm p-2 bg-gray-100 rounded-md truncate">{user.user_id}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Role</label>
                            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-md font-medium">{user.role}</div>
                        </div>
                        {user.designation && (
                            <div className="space-y-1">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Designation</label>
                                <div className="p-2 bg-gray-50 rounded-md">{user.designation}</div>
                            </div>
                        )}
                        {user.doctor_id && (
                            <div className="space-y-1">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Doctor ID</label>
                                <div className="font-mono text-sm p-2 bg-gray-100 rounded-md truncate">{user.doctor_id}</div>
                            </div>
                        )}
                        {user.patient_id && (
                            <div className="space-y-1">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Patient ID</label>
                                <div className="font-mono text-sm p-2 bg-gray-100 rounded-md truncate">{user.patient_id}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="clay-card">
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your login credentials.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="old-pwd" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Current Password</label>
                                    <Input 
                                        id="old-pwd" 
                                        type="password" 
                                        value={oldPassword} 
                                        onChange={e => setOldPassword(e.target.value)} 
                                        className="bg-white/50"
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="new-pwd" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">New Password</label>
                                    <Input 
                                        id="new-pwd" 
                                        type="password" 
                                        value={newPassword} 
                                        onChange={e => setNewPassword(e.target.value)} 
                                        className="bg-white/50"
                                        required 
                                        minLength={8}
                                    />
                                </div>
                                <Button type="submit" disabled={loadingPassword} className="w-full">
                                    {loadingPassword ? "Updating..." : "Update Password"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {user.role === "Doctor" && (
                        <Card className="clay-card">
                            <CardHeader>
                                <CardTitle>Consultation Fee</CardTitle>
                                <CardDescription>Set your standard fee for new billings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpdateFee} className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="fee" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Fee Amount ($)</label>
                                        <div className="relative">
                                            <Icons.dollar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                            <Input 
                                                id="fee" 
                                                type="number" 
                                                step="0.01"
                                                min="0"
                                                placeholder="e.g. 150.00"
                                                value={fee} 
                                                onChange={e => setFee(e.target.value)} 
                                                className="pl-8 bg-white/50"
                                                required 
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={loadingFee} variant="secondary" className="w-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                                        {loadingFee ? "Saving..." : "Save Fee"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
