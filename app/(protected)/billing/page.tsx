"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { billingsService, Billing, Analytics } from "@/services/billings.service";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export default function BillingPage() {
    const { user } = useAuthStore();
    const [billings, setBillings] = useState<Billing[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!user) return;
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bRes, aRes] = await Promise.all([
                billingsService.list(50),
                user?.role === "Doctor" ? billingsService.getAnalytics().catch(() => null) : Promise.resolve(null)
            ]);
            setBillings(bRes.data || []);
            setAnalytics(aRes);
        } catch (err) {
            toast.error("Failed to load billing data");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async (id: string) => {
        try {
            await billingsService.updateStatus(id, "PAID");
            toast.success("Invoice marked as PAID");
            fetchData();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const filteredBillings = billings.filter(b => 
        b.patient_name.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
                {user?.role === "Doctor" && (
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Icons.download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                )}
            </div>

            {user?.role === "Doctor" && (
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="clay-card-elevated">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue (Year)</CardTitle>
                            <Icons.dollar className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${analytics?.yearly_earnings.toFixed(2) || "0.00"}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                ${analytics?.monthly_earnings.toFixed(2) || "0.00"} this month
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="clay-card-elevated">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue (Today)</CardTitle>
                            <Icons.dollar className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {analytics?.today_earnings ? `$${analytics.today_earnings.toFixed(2)}` : "No revenue today"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                ${analytics?.weekly_earnings?.toFixed(2) || "0.00"} this week
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="clay-card-elevated">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Patients Seen (Today)</CardTitle>
                            <Icons.patients className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics?.today_patients || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {analytics?.monthly_patients || 0} this month
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card className="clay-card">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Invoices</CardTitle>
                            <CardDescription>
                                {user?.role === "Doctor" ? "Manage your clinic's financial records." : "View your billing history."}
                            </CardDescription>
                        </div>
                        <div className="w-72">
                            <div className="relative">
                                <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input 
                                    className="pl-8 bg-white/50" 
                                    placeholder="Search invoices..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-10 text-center text-muted-foreground">Loading invoices...</div>
                    ) : filteredBillings.length === 0 ? (
                        <div className="py-10 text-center text-muted-foreground">No invoices found.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice ID</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    {user?.role === "Doctor" && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBillings.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium text-xs">{invoice.id.split('-')[0]}...</TableCell>
                                        <TableCell>{invoice.patient_name}</TableCell>
                                        <TableCell>{invoice.doctor_name}</TableCell>
                                        <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    invoice.status === "PAID"
                                                        ? "success"
                                                        : invoice.status === "CANCELLED"
                                                            ? "destructive"
                                                            : "warning"
                                                }
                                            >
                                                {invoice.status}
                                            </Badge>
                                        </TableCell>
                                        {user?.role === "Doctor" && (
                                            <TableCell className="text-right">
                                                {invoice.status === "PENDING" && (
                                                    <Button variant="outline" size="sm" onClick={() => handleMarkPaid(invoice.id)}>
                                                        Mark Paid
                                                    </Button>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
