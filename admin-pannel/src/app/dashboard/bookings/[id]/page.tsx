import { AppSidebar } from "@/components/app-sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { AdminOnly } from "@/components/role-guard";
import { getAllBookings, type Booking } from "@/lib/api";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

async function fetchBookingById(id: number): Promise<Booking | null> {
	const token = (await cookies()).get("accessToken")?.value;
	if (!token) return null;

	const res = await getAllBookings(token);
	if (!res.success || !res.data) return null;

	const bookings = res.data as Booking[];
	return bookings.find((booking) => booking.id === id) ?? null;
}

function getStatusVariant(status: Booking["status"]) {
	switch (status) {
		case "upcoming":
			return "default" as const;
		case "completed":
			return "secondary" as const;
		default:
			return "destructive" as const;
	}
}

function formatCurrency(value: number | string) {
	const numericValue = typeof value === "string" ? Number(value) : value;
	if (!Number.isFinite(numericValue)) {
		return typeof value === "string" ? value : value.toString();
	}

	try {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
			maximumFractionDigits: 2,
		}).format(numericValue);
	} catch (error) {
		return `₹ ${numericValue.toLocaleString("en-IN")}`;
	}
}

function formatDate(value?: string) {
	if (!value) return "-";
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

interface BookingDetailsPageProps {
	params: {
		id: string;
	};
}

export default async function BookingDetailsPage({
	params,
}: BookingDetailsPageProps) {
	const bookingId = Number(params.id);
	if (Number.isNaN(bookingId)) {
		notFound();
	}

	const booking = await fetchBookingById(bookingId);
	if (!booking) {
		notFound();
	}

	return (
		<AuthGuard>
			<AdminOnly>
				<SidebarProvider>
					<AppSidebar />
					<SidebarInset>
						<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
							<div className="flex items-center gap-2 px-4">
								<SidebarTrigger className="-ml-1" />
								<Separator
									orientation="vertical"
									className="mr-2 data-[orientation=vertical]:h-4"
								/>
								<Breadcrumb>
									<BreadcrumbList>
										<BreadcrumbItem className="hidden md:block">
											<BreadcrumbLink href="#">Admin Panel</BreadcrumbLink>
										</BreadcrumbItem>
										<BreadcrumbSeparator className="hidden md:block" />
										<BreadcrumbItem className="hidden md:block">
											<BreadcrumbLink href="/dashboard">
												Dashboard
											</BreadcrumbLink>
										</BreadcrumbItem>
										<BreadcrumbSeparator className="hidden md:block" />
										<BreadcrumbItem className="hidden md:block">
											<BreadcrumbLink href="/dashboard">
												Bookings
											</BreadcrumbLink>
										</BreadcrumbItem>
										<BreadcrumbSeparator className="hidden md:block" />
										<BreadcrumbItem>
											<BreadcrumbPage>Booking #{booking.id}</BreadcrumbPage>
										</BreadcrumbItem>
									</BreadcrumbList>
								</Breadcrumb>
							</div>
						</header>
						<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
							<Button asChild variant="ghost" size="sm" className="w-fit">
								<Link href="/dashboard">← Back to Dashboard</Link>
							</Button>

							<Card>
								<CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
									<div className="space-y-1">
										<CardTitle>Booking #{booking.id}</CardTitle>
										<p className="text-sm text-muted-foreground">
											Detailed overview of the booking and its current status.
										</p>
									</div>
									<Badge
										className="capitalize"
										variant={getStatusVariant(booking.status)}
									>
										{booking.status}
									</Badge>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
										<div className="space-y-6">
											<section className="rounded-lg border p-4">
												<h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
													Schedule
												</h3>
												<dl className="mt-3 space-y-2 text-sm">
													<div className="flex items-start justify-between gap-3">
														<dt className="text-muted-foreground">Date</dt>
														<dd className="font-medium">{booking.date}</dd>
													</div>
													<div className="flex items-start justify-between gap-3">
														<dt className="text-muted-foreground">Time</dt>
														<dd className="font-medium">{booking.time}</dd>
													</div>
													<div className="flex items-start justify-between gap-3">
														<dt className="text-muted-foreground">Created</dt>
														<dd className="font-medium">
															{formatDate(booking.createdAt)}
														</dd>
													</div>
												</dl>
											</section>

											<section className="rounded-lg border p-4">
												<h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
													Address
												</h3>
												<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
													{booking.address}
												</p>
											</section>

											<section className="rounded-lg border p-4">
												<h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
													Special Instructions
												</h3>
												<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
													{booking.specialInstructions?.trim() ||
														"No special instructions provided."}
												</p>
											</section>
										</div>

										<div className="space-y-4">
											<section className="rounded-lg border p-4">
												<h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
													Summary
												</h3>
												<dl className="mt-3 space-y-3 text-sm">
													<div className="flex items-start justify-between gap-3">
														<dt className="text-muted-foreground">
															Expected Payout
														</dt>
														<dd className="font-semibold">
															{formatCurrency(booking.price)}
														</dd>
													</div>
													<div className="flex items-start justify-between gap-3">
														<dt className="text-muted-foreground">Reference</dt>
														<dd className="font-medium">REF #{booking.id}</dd>
													</div>
												</dl>
											</section>

											<section className="rounded-lg border p-4">
												<h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
													Related Records
												</h3>
												<dl className="mt-3 space-y-3 text-sm">
													<div className="flex items-start justify-between gap-3">
														<dt className="text-muted-foreground">User ID</dt>
														<dd className="font-medium">#{booking.userId}</dd>
													</div>
													<div className="flex items-start justify-between gap-3">
														<dt className="text-muted-foreground">
															Service ID
														</dt>
														<dd className="font-medium">
															#{booking.serviceId}
														</dd>
													</div>
												</dl>
											</section>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</SidebarInset>
				</SidebarProvider>
			</AdminOnly>
		</AuthGuard>
	);
}
