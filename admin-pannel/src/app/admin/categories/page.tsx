"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost, getApiUrl } from "@/lib/api";
import { AuthGuard } from "@/components/auth-guard";

interface Category {
	id: number;
	name: string;
	description: string;
	emoji?: string;
	createdAt: string;
	updatedAt: string;
}

export default function CategoriesPage() {
	const { hasPermission, token } = useAuth();
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		emoji: "",
	});
	const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

	const EMOJI_OPTIONS = [
		"🛠️",
		"🧹",
		"🔌",
		"🪣",
		"🏠",
		"🪚",
		"🔨",
		"🛠",
		"👷",
		"🌿",
		"⚙️",
		"🔧",
		"🚽",
		"🍽️",
		"❄️",
	];

	const canManage = hasPermission("canManageCategories");

	const fetchCategories = async () => {
		try {
			setLoading(true);
			if (!token || !canManage) {
				setError("No authentication token");
				return;
			}

			const res = await apiGet<Category[]>("/services/meta/categories", token);
			if (res.success) {
				setCategories(res.data || []);
			} else {
				setError(res.error || "Failed to fetch categories");
			}
		} catch (err) {
			setError("Failed to fetch categories");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCategories();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canManage, token]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (!token) {
				setError("No authentication token");
				return;
			}

			if (editingCategory) {
				const response = await fetch(
					getApiUrl(`/services/meta/categories/${editingCategory.id}`),
					{
						method: "PUT",
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
						body: JSON.stringify(formData),
					}
				);
				const data = await response.json();
				if (!response.ok || !data?.success)
					throw new Error(data?.error || "Failed to update");
			} else {
				const res = await apiPost<Category>(
					"/services/meta/categories",
					formData,
					token
				);
				if (!res.success) throw new Error(res.error || "Failed to create");
			}

			{
				setIsDialogOpen(false);
				setFormData({ name: "", description: "", emoji: "" });
				setEditingCategory(null);
				fetchCategories();
			}
		} catch (err) {
			setError("Failed to save category");
		}
	};

	const handleEdit = (category: Category) => {
		setEditingCategory(category);
		setFormData({
			name: category.name,
			description: category.description,
			emoji: (category as any).emoji || "",
		});
		setIsDialogOpen(true);
	};

	const handleDelete = async (id: number) => {
		if (!confirm("Are you sure you want to delete this category?")) return;
		try {
			if (!token) {
				setError("No authentication token");
				return;
			}

			const response = await fetch(getApiUrl(`/occupations/${id}`), {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();
			if (response.ok && data.success) {
				fetchCategories();
			} else {
				setError(data.error || "Failed to delete category");
			}
		} catch (err) {
			setError("Failed to delete category");
		}
	};

	return (
		<AuthGuard>
			<div className="p-6 space-y-6">
				{!canManage && (
					<Alert variant="destructive">
						<AlertDescription>
							You don't have permission to manage categories.
						</AlertDescription>
					</Alert>
				)}
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold">Categories Management</h1>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button
								onClick={() => {
									setEditingCategory(null);
									setFormData({ name: "", description: "", emoji: "" });
								}}
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Category
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									{editingCategory ? "Edit Category" : "Add New Category"}
								</DialogTitle>
							</DialogHeader>
							<form onSubmit={handleSubmit} className="space-y-4">
								{error && (
									<Alert variant="destructive">
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								)}

								<div className="space-y-2">
									<Label htmlFor="name">Category Name</Label>
									<Input
										id="name"
										value={formData.name}
										onChange={(e) =>
											setFormData((prev) => ({ ...prev, name: e.target.value }))
										}
										required
										placeholder="e.g., Plumbing, Electrical, Cleaning"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										value={formData.description}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												description: e.target.value,
											}))
										}
										placeholder="Describe this category"
										rows={3}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="emoji">Emoji (optional)</Label>
									<div className="flex items-center gap-2">
										<div className="text-2xl">{formData.emoji || "—"}</div>
										<div className="flex gap-2">
											<Button
												type="button"
												variant="outline"
												onClick={() => setEmojiPickerOpen((v) => !v)}
											>
												{emojiPickerOpen ? "Close" : "Pick"}
											</Button>
											<Button
												type="button"
												variant="ghost"
												onClick={() =>
													setFormData((prev) => ({ ...prev, emoji: "" }))
												}
											>
												Clear
											</Button>
										</div>
									</div>

									{emojiPickerOpen && (
										<div className="grid grid-cols-6 gap-2 mt-3">
											{EMOJI_OPTIONS.map((e) => (
												<button
													key={e}
													type="button"
													onClick={() => {
														setFormData((prev) => ({ ...prev, emoji: e }));
														setEmojiPickerOpen(false);
													}}
													className="p-2 rounded hover:bg-slate-100"
												>
													<span className="text-xl">{e}</span>
												</button>
											))}
										</div>
									)}
								</div>

								<div className="flex justify-end space-x-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={!canManage}>
										{editingCategory ? "Update" : "Create"} Category
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>All Categories ({categories.length})</CardTitle>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="text-center py-4">Loading categories...</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>ID</TableHead>
										<TableHead>Emoji</TableHead>
										<TableHead>Name</TableHead>
										<TableHead>Description</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Created</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{categories.map((category) => (
										<TableRow key={category.id}>
											<TableCell className="font-medium">
												{category.id}
											</TableCell>
											<TableCell>
												{category.emoji ? (
													<span className="text-xl">{category.emoji}</span>
												) : (
													<span className="text-muted">-</span>
												)}
											</TableCell>
											<TableCell>
												<Badge variant="outline">{category.name}</Badge>
											</TableCell>
											<TableCell className="max-w-xs truncate">
												{category.description}
											</TableCell>
											<TableCell>
												<Badge variant="default">Active</Badge>
											</TableCell>
											<TableCell>
												{new Date(category.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell>
												<div className="flex space-x-2">
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleEdit(category)}
													>
														<Edit className="w-4 h-4" />
													</Button>
													<Button
														size="sm"
														variant="destructive"
														onClick={() => handleDelete(category.id)}
														disabled={!canManage}
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>
		</AuthGuard>
	);
}
