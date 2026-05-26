"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import apiClient from "@/services/api.client";
import { toast } from "sonner";
import { Icons } from "@/components/ui/icons";

export default function DeveloperSettingsPage() {
    const { user } = useAuthStore();
    
    const [hospitalId, setHospitalId] = useState("");
    const [role, setRole] = useState("Doctor");
    const [loading, setLoading] = useState(false);
    const [inviteLink, setInviteLink] = useState("");

    const handleGenerateInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hospitalId || !role) return toast.error("Please fill all fields");

        setLoading(true);
        try {
            const res = await apiClient.post("/api/v1/invites", {
                hospital_id: hospitalId,
                role: role
            });
            const token = res.data.invite_token;
            const link = `${window.location.origin}/register?invite=${token}`;
            setInviteLink(link);
            toast.success("Invite link generated");
        } catch (err) {
            toast.error("Failed to generate invite link");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink);
        toast.success("Copied to clipboard");
    };

    if (!user) return <div className="p-6">Loading...</div>;

    if (user.role !== "Developer" && user.role !== "GodFather" && user.role !== "Admin") {
        return (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center animate-in fade-in slide-in-from-bottom-4">
                <Icons.alert className="h-12 w-12 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                    <p className="text-muted-foreground mt-1">Administration and developer tools.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="clay-card">
                    <CardHeader>
                        <CardTitle>Generate Invite Link</CardTitle>
                        <CardDescription>Create a secure registration link for new doctors or staff.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleGenerateInvite} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="hospital" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Hospital ID</label>
                                <Input 
                                    id="hospital" 
                                    value={hospitalId} 
                                    onChange={e => setHospitalId(e.target.value)} 
                                    className="bg-white/50"
                                    placeholder="Enter Hospital UUID"
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="role" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Assign Role</label>
                                <Select value={role} onChange={(e) => setRole(e.target.value)} className="bg-white/50">
                                    <option value="" disabled>Select a role</option>
                                    <option value="Doctor">Doctor</option>
                                    <option value="Staff">Staff</option>
                                </Select>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? "Generating..." : "Generate Link"}
                            </Button>
                        </form>

                        {inviteLink && (
                            <div className="mt-6 p-4 bg-gray-50 border rounded-lg space-y-3 animate-in fade-in">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Share this link:</label>
                                <div className="flex gap-2">
                                    <Input value={inviteLink} readOnly className="bg-white font-mono text-xs" />
                                    <Button variant="outline" size="icon" onClick={copyToClipboard}>
                                        <Icons.file className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Link expires in 7 days.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {user.role === "GodFather" && (
                    <Card className="clay-card">
                        <CardHeader>
                            <CardTitle>GodFather Controls</CardTitle>
                            <CardDescription>Highest level administrative controls.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                                <h4 className="font-semibold mb-1">Database Maintenance</h4>
                                <p className="text-sm">Functions for clearing caches and rebuilding indexes will appear here.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
