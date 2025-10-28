"use client";

import React, { useState } from "react";
import {
	CheckCircle,
	XCircle,
	Clock,
	Eye,
	Check,
	X,
	Shield,
	ShieldOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface Partner {
	id: number;
	name: string;
	email: string;
	phone: string;
	businessType: string;
	registrationDate: string;
	verified: boolean;
	blocked: boolean;
	documents: string[];
	address: string;
}

const PartnerVerificationDashboard = () => {
	const [partners, setPartners] = useState<Partner[]>([
		{
			id: 1,
			name: "Tech Solutions Inc",
			email: "contact@techsolutions.com",
			phone: "+1 234-567-8900",
			businessType: "IT Services",
			registrationDate: "2024-10-15",
			verified: false,
			blocked: false,
			documents: ["Business License", "Tax ID", "Insurance"],
			address: "123 Tech Street, Silicon Valley, CA",
		},
		{
			id: 2,
			name: "Green Energy Co",
			email: "info@greenenergy.com",
			phone: "+1 234-567-8901",
			businessType: "Renewable Energy",
			registrationDate: "2024-10-10",
			verified: true,
			blocked: false,
			documents: ["Business License", "Tax ID", "ISO Certification"],
			address: "456 Green Ave, Austin, TX",
		},
		{
			id: 3,
			name: "Digital Marketing Pro",
			email: "hello@digitalmarketing.com",
			phone: "+1 234-567-8902",
			businessType: "Marketing",
			registrationDate: "2024-10-20",
			verified: false,
			blocked: true,
			documents: ["Business License", "Tax ID"],
			address: "789 Market Blvd, New York, NY",
		},
		{
			id: 4,
			name: "CloudHost Systems",
			email: "support@cloudhost.com",
			phone: "+1 234-567-8903",
			businessType: "Cloud Services",
			registrationDate: "2024-10-08",
			verified: true,
			blocked: false,
			documents: ["Business License", "Tax ID", "SOC 2 Compliance"],
			address: "321 Cloud Drive, Seattle, WA",
		},
	]);

	const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
	const [filter, setFilter] = useState<
		"all" | "verified" | "pending" | "blocked"
	>("all");

	const stats = {
		total: partners.length,
		verified: partners.filter((p) => p.verified && !p.blocked).length,
		pending: partners.filter((p) => !p.verified && !p.blocked).length,
		blocked: partners.filter((p) => p.blocked).length,
	};

	const handleVerify = (id: number) => {
		setPartners(
			partners.map((p) =>
				p.id === id ? { ...p, verified: true, blocked: false } : p
			)
		);
		setSelectedPartner(null);
	};

	const handleReject = (id: number) => {
		if (confirm("Are you sure you want to reject this partner?")) {
			setPartners(partners.filter((p) => p.id !== id));
			setSelectedPartner(null);
		}
	};

	const handleBlock = (id: number) => {
		if (confirm("Are you sure you want to block this partner?")) {
			setPartners(
				partners.map((p) => (p.id === id ? { ...p, blocked: true } : p))
			);
			setSelectedPartner(null);
		}
	};

	const handleUnblock = (id: number) => {
		setPartners(
			partners.map((p) => (p.id === id ? { ...p, blocked: false } : p))
		);
		setSelectedPartner(null);
	};

	const filteredPartners = partners.filter((p) => {
		if (filter === "verified") return p.verified && !p.blocked;
		if (filter === "pending") return !p.verified && !p.blocked;
		if (filter === "blocked") return p.blocked;
		return true;
	});

	const getStatusBadge = (partner: Partner) => {
		if (partner.blocked) {
			return (
				<Badge variant="destructive" className="flex items-center gap-1">
					<ShieldOff className="w-3 h-3" />
					Blocked
				</Badge>
			);
		}
		if (partner.verified) {
			return (
				<Badge
					variant="default"
					className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100"
				>
					<CheckCircle className="w-3 h-3" />
					Verified
				</Badge>
			);
		}
		return (
			<Badge variant="secondary" className="flex items-center gap-1">
				<Clock className="w-3 h-3" />
				Pending
			</Badge>
		);
	};

	return (
		<div className="min-h-screen bg-background p-6">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground">
						Partner Verification Dashboard
					</h1>
					<p className="text-muted-foreground mt-2">
						Manage and verify partner accounts
					</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Partners
							</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.total}</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Verified</CardTitle>
							<CheckCircle className="h-4 w-4 text-green-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600">
								{stats.verified}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Pending</CardTitle>
							<Clock className="h-4 w-4 text-orange-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-orange-600">
								{stats.pending}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Blocked</CardTitle>
							<ShieldOff className="h-4 w-4 text-red-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-red-600">
								{stats.blocked}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Filter Tabs */}
				<Card className="mb-6">
					<CardContent className="p-4">
						<Tabs
							value={filter}
							onValueChange={(value) => setFilter(value as any)}
						>
							<TabsList className="grid w-full grid-cols-4">
								<TabsTrigger value="all">All Partners</TabsTrigger>
								<TabsTrigger value="verified">Verified</TabsTrigger>
								<TabsTrigger value="pending">Pending</TabsTrigger>
								<TabsTrigger value="blocked">Blocked</TabsTrigger>
							</TabsList>
						</Tabs>
					</CardContent>
				</Card>

				{/* Partners Table */}
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Partner</TableHead>
								<TableHead>Business Type</TableHead>
								<TableHead>Registration Date</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredPartners.map((partner) => (
								<TableRow key={partner.id}>
									<TableCell>
										<div>
											<div className="font-medium text-foreground">
												{partner.name}
											</div>
											<div className="text-sm text-muted-foreground">
												{partner.email}
											</div>
										</div>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{partner.businessType}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{partner.registrationDate}
									</TableCell>
									<TableCell>{getStatusBadge(partner)}</TableCell>
									<TableCell className="text-right">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setSelectedPartner(partner)}
											className="flex items-center gap-1"
										>
											<Eye className="w-4 h-4" />
											View
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Card>
			</div>

			{/* Detail Dialog */}
			<Dialog
				open={!!selectedPartner}
				onOpenChange={() => setSelectedPartner(null)}
			>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Partner Details</DialogTitle>
					</DialogHeader>

					{selectedPartner && (
						<div className="space-y-6">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Partner Name
									</label>
									<p className="text-lg font-medium mt-1">
										{selectedPartner.name}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Status
									</label>
									<div className="mt-1">{getStatusBadge(selectedPartner)}</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Email
									</label>
									<p className="text-foreground mt-1">
										{selectedPartner.email}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Phone
									</label>
									<p className="text-foreground mt-1">
										{selectedPartner.phone}
									</p>
								</div>
							</div>

							<div>
								<label className="text-sm font-medium text-muted-foreground">
									Business Type
								</label>
								<p className="text-foreground mt-1">
									{selectedPartner.businessType}
								</p>
							</div>

							<div>
								<label className="text-sm font-medium text-muted-foreground">
									Address
								</label>
								<p className="text-foreground mt-1">
									{selectedPartner.address}
								</p>
							</div>

							<div>
								<label className="text-sm font-medium text-muted-foreground">
									Registration Date
								</label>
								<p className="text-foreground mt-1">
									{selectedPartner.registrationDate}
								</p>
							</div>

							<div>
								<label className="text-sm font-medium text-muted-foreground">
									Submitted Documents
								</label>
								<div className="mt-2 space-y-2">
									{selectedPartner.documents.map((doc, idx) => (
										<div
											key={idx}
											className="flex items-center p-2 bg-muted rounded"
										>
											<CheckCircle className="w-4 h-4 text-green-600 mr-2" />
											<span className="text-foreground">{doc}</span>
										</div>
									))}
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-3 pt-6 border-t">
								{!selectedPartner.verified && !selectedPartner.blocked && (
									<>
										<Button
											onClick={() => handleVerify(selectedPartner.id)}
											className="flex-1 flex items-center gap-2"
										>
											<Check className="w-4 h-4" />
											Verify Partner
										</Button>
										<Button
											variant="outline"
											onClick={() => handleReject(selectedPartner.id)}
											className="flex-1 flex items-center gap-2"
										>
											<X className="w-4 h-4" />
											Reject
										</Button>
									</>
								)}

								{selectedPartner.verified && !selectedPartner.blocked && (
									<Button
										variant="destructive"
										onClick={() => handleBlock(selectedPartner.id)}
										className="flex-1 flex items-center gap-2"
									>
										<ShieldOff className="w-4 h-4" />
										Block Partner
									</Button>
								)}

								{selectedPartner.blocked && (
									<Button
										onClick={() => handleUnblock(selectedPartner.id)}
										className="flex-1 flex items-center gap-2"
									>
										<Shield className="w-4 h-4" />
										Unblock Partner
									</Button>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default PartnerVerificationDashboard;
