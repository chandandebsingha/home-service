"use client";

import React, { useEffect, useState } from "react";
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
import {
	adminListProviderProfiles,
	adminVerifyProviderProfile,
	ProviderProfileDTO,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Partner {
	id: number;
	name: string; // business name (fallbacks applied)
	email: string;
	phone?: string;
	businessType?: string; // occupation name (short)
	registrationDate?: string;
	verified: boolean;
	blocked: boolean;
	documents: string[];
	address?: string;
	// Additional provider profile fields
	userId: number;
	userFullName?: string;
	businessName?: string;
	businessAddress?: string;
	occupationName?: string;
	occupationId?: number;
	occupationDescription?: string;
	experience?: string;
	bio?: string;
	skills?: string[] | null;
	certifications?: string[] | null;
	isActive: boolean;
	updatedAt?: string;
}

const PartnerVerificationDashboard = () => {
	const [partners, setPartners] = useState<Partner[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { token } = useAuth();

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			setError(null);
			if (!token) {
				setPartners([]);
				setLoading(false);
				setError(
					"Please sign in as an admin to view partner verification requests."
				);
				return;
			}
			const res = await adminListProviderProfiles(token);
			if (res.success && res.data) {
				const mapped: Partner[] = res.data.map((p: ProviderProfileDTO) => ({
					id: p.id,
					name: p.businessName || p.user?.fullName || `User ${p.userId}`,
					email: p.user?.email || "",
					phone: p.phoneNumber || "",
					businessType: p.occupation?.name || undefined,
					registrationDate: p.createdAt || undefined,
					verified: !!p.isVerified,
					blocked: false,
					documents: [],
					address: p.businessAddress || undefined,
					// extras
					userId: p.userId,
					userFullName: p.user?.fullName || undefined,
					businessName: p.businessName || undefined,
					businessAddress: p.businessAddress || undefined,
					occupationName: p.occupation?.name || undefined,
					occupationId: p.occupationId || undefined,
					occupationDescription: p.occupation?.description || undefined,
					experience: p.experience || undefined,
					bio: p.bio || undefined,
					skills: (p.skills as any) || null,
					certifications: (p.certifications as any) || null,
					isActive: !!p.isActive,
					updatedAt: p.updatedAt || undefined,
				}));
				setPartners(mapped);
			} else {
				setError(res.error || "Failed to load partner profiles");
			}
			setLoading(false);
		};
		load();
	}, [token]);

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

	const handleVerify = async (id: number) => {
		if (!token) return;
		const res = await adminVerifyProviderProfile(token, id);
		if (res.success) {
			setPartners((prev) =>
				prev.map((p) =>
					p.id === id ? { ...p, verified: true, blocked: false } : p
				)
			);
			setSelectedPartner(null);
		}
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
				{error && (
					<div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
						{error}
					</div>
				)}
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
										{partner.registrationDate?.slice(0, 10) || "-"}
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
										Business Name
									</label>
									<p className="text-lg font-medium mt-1">
										{selectedPartner.businessName ||
											selectedPartner.name ||
											"-"}
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
										Account Name
									</label>
									<p className="text-foreground mt-1">
										{selectedPartner.userFullName || "-"}
									</p>
								</div>
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

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Business Type
									</label>
									<p className="text-foreground mt-1">
										{selectedPartner.occupationName ||
											selectedPartner.businessType ||
											"-"}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Experience
									</label>
									<p className="text-foreground mt-1">
										{selectedPartner.experience || "-"}
									</p>
								</div>
							</div>

							{/* Additional profile/meta info */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Profile ID
									</label>
									<p className="text-foreground mt-1">{selectedPartner.id}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										User ID
									</label>
									<p className="text-foreground mt-1">
										{selectedPartner.userId}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Occupation ID
									</label>
									<p className="text-foreground mt-1">
										{selectedPartner.occupationId ?? "-"}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Active
									</label>
									<p className="text-foreground mt-1">
										{selectedPartner.isActive ? "Yes" : "No"}
									</p>
								</div>
								{selectedPartner.occupationDescription && (
									<div className="col-span-2">
										<label className="text-sm font-medium text-muted-foreground">
											Occupation Description
										</label>
										<p className="text-foreground mt-1 whitespace-pre-wrap">
											{selectedPartner.occupationDescription}
										</p>
									</div>
								)}
							</div>

							<div>
								<label className="text-sm font-medium text-muted-foreground">
									Address
								</label>
								<p className="text-foreground mt-1">
									{selectedPartner.businessAddress ||
										selectedPartner.address ||
										"-"}
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
							{selectedPartner.updatedAt && (
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Last Updated
									</label>
									<p className="text-foreground mt-1">
										{selectedPartner.updatedAt}
									</p>
								</div>
							)}

							{selectedPartner.bio && (
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Bio
									</label>
									<p className="text-foreground mt-1 whitespace-pre-wrap">
										{selectedPartner.bio}
									</p>
								</div>
							)}

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Skills
									</label>
									<div className="mt-2 flex flex-wrap gap-2">
										{selectedPartner.skills &&
										selectedPartner.skills.length > 0 ? (
											selectedPartner.skills.map((s, i) => (
												<span
													key={i}
													className="px-2 py-1 text-xs rounded bg-muted"
												>
													{s}
												</span>
											))
										) : (
											<span className="text-sm text-muted-foreground">-</span>
										)}
									</div>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Certifications
									</label>
									<div className="mt-2 flex flex-wrap gap-2">
										{selectedPartner.certifications &&
										selectedPartner.certifications.length > 0 ? (
											selectedPartner.certifications.map((c, i) => (
												<span
													key={i}
													className="px-2 py-1 text-xs rounded bg-muted"
												>
													{c}
												</span>
											))
										) : (
											<span className="text-sm text-muted-foreground">-</span>
										)}
									</div>
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
