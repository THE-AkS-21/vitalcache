"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Icons } from "@/components/ui/icons";
import { format } from "date-fns";

export default function AppointmentsPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);

    // Mock data for appointments
    const appointments = [
        {
            id: 1,
            patient: "Alice Johnson",
            time: "09:00 AM",
            type: "Check-up",
            date: new Date(),
        },
        {
            id: 2,
            patient: "Bob Smith",
            time: "10:30 AM",
            type: "Consultation",
            date: new Date(),
        },
        {
            id: 3,
            patient: "Charlie Brown",
            time: "02:00 PM",
            type: "Follow-up",
            date: new Date(),
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
                <Button onClick={() => setIsNewAppointmentOpen(true)}>
                    <Icons.add className="mr-2 h-4 w-4" />
                    New Appointment
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Calendar</CardTitle>
                        <CardDescription>Select a date to view appointments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                        />
                    </CardContent>
                </Card>

                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Schedule for {date ? format(date, "MMMM d, yyyy") : "Selected Date"}</CardTitle>
                        <CardDescription>
                            You have {appointments.length} appointments scheduled for today.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {appointments.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                                            <Icons.user className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{appointment.patient}</p>
                                            <p className="text-sm text-gray-500">{appointment.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Icons.clock className="h-4 w-4" />
                                        {appointment.time}
                                    </div>
                                </div>
                            ))}
                            {appointments.length === 0 && (
                                <div className="text-center text-gray-500 py-8">
                                    No appointments scheduled for this date.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>New Appointment</DialogTitle>
                        <DialogDescription>
                            Schedule a new appointment for a patient.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="patient" className="text-sm font-medium">Patient Name</label>
                            <Input id="patient" placeholder="Search patient..." />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="date" className="text-sm font-medium">Date</label>
                            <Input id="date" type="date" />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="time" className="text-sm font-medium">Time</label>
                            <Input id="time" type="time" />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="type" className="text-sm font-medium">Type</label>
                            <Select>
                                <option>Check-up</option>
                                <option>Consultation</option>
                                <option>Follow-up</option>
                                <option>Emergency</option>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNewAppointmentOpen(false)}>Cancel</Button>
                        <Button onClick={() => setIsNewAppointmentOpen(false)}>Schedule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
