"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";

export default function BillingPage() {
    const invoices = [
        {
            id: "INV-001",
            patient: "Alice Johnson",
            amount: "$150.00",
            status: "Paid",
            date: "2023-10-25",
        },
        {
            id: "INV-002",
            patient: "Bob Smith",
            amount: "$200.00",
            status: "Pending",
            date: "2023-10-26",
        },
        {
            id: "INV-003",
            patient: "Charlie Brown",
            amount: "$75.00",
            status: "Overdue",
            date: "2023-10-20",
        },
        {
            id: "INV-004",
            patient: "Diana Prince",
            amount: "$300.00",
            status: "Paid",
            date: "2023-10-24",
        },
        {
            id: "INV-005",
            patient: "Evan Wright",
            amount: "$120.00",
            status: "Pending",
            date: "2023-10-27",
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Icons.download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button>
                        <Icons.add className="mr-2 h-4 w-4" />
                        Create Invoice
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <Icons.dollar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                        <Icons.file className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">23</div>
                        <p className="text-xs text-muted-foreground">
                            $3,400.00 uncollected
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <Icons.alert className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">
                            Requires attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Invoices</CardTitle>
                            <CardDescription>
                                Manage your clinic's financial records.
                            </CardDescription>
                        </div>
                        <div className="w-72">
                            <div className="relative">
                                <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input className="pl-8" placeholder="Search invoices..." />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.id}</TableCell>
                                    <TableCell>{invoice.patient}</TableCell>
                                    <TableCell>{invoice.date}</TableCell>
                                    <TableCell>{invoice.amount}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                invoice.status === "Paid"
                                                    ? "success"
                                                    : invoice.status === "Overdue"
                                                        ? "destructive"
                                                        : "warning"
                                            }
                                        >
                                            {invoice.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Icons.moreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
