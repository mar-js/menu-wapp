import {
	Eye,
	EyeOff,
	Layers,
	Package,
	Plus,
	QrCode,
	Store,
	Trash2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";
import type { JSX } from "react/jsx-dev-runtime";
import type { IBusiness, ICategory, IProduct } from "../../interfaces";
import { supabase } from "../../lib/supabase";

export const Dashboard = (): JSX.Element => {
	const [business, setBusiness] = useState<IBusiness | null>(null);
	const [categories, setCategories] = useState<ICategory[]>([]);
	const [products, setProducts] = useState<IProduct[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [activeTab, setActiveTab] = useState<"products" | "categories" | "qr">(
		"products",
	);

	// Formularios
	const [newCategoryName, setNewCategoryName] = useState<string>("");
	const [newProductName, setNewProductName] = useState<string>("");
	const [newProductPrice, setNewProductPrice] = useState<string>("");
	const [newProductDesc, setNewProductDesc] = useState<string>("");
	const [selectedCategory, setSelectedCategory] = useState<string>("");

	const fetchAdminData = useCallback(async (): Promise<void> => {
		try {
			setLoading(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			// Cargar datos del negocio
			const { data: bizData } = await supabase
				.from("businesses")
				.select("*")
				.eq("owner_id", user.id)
				.single();

			if (bizData) {
				setBusiness(bizData);

				// Cargar categorías
				const { data: catData } = await supabase
					.from("categories")
					.select("*")
					.eq("business_id", bizData.id)
					.order("sort_order", { ascending: true });
				setCategories(catData || []);

				// Cargar productos
				const { data: prodData } = await supabase
					.from("products")
					.select("*")
					.eq("business_id", bizData.id);
				setProducts(prodData || []);
			}
		} catch (error) {
			console.error("Error cargando datos del dashboard:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	const handleCreateCategory = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		if (!business || !newCategoryName.trim()) return;

		const { data, error } = await supabase
			.from("categories")
			.insert({
				business_id: business.id,
				name: newCategoryName,
			})
			.select()
			.single();

		if (!error && data) {
			setCategories([...categories, data]);
			setNewCategoryName("");
		}
	};

	const handleCreateProduct = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		if (!business || !newProductName.trim() || !newProductPrice) return;

		const { data, error } = await supabase
			.from("products")
			.insert({
				business_id: business.id,
				category_id: selectedCategory || null,
				name: newProductName,
				description: newProductDesc,
				price: parseFloat(newProductPrice),
				is_available: true,
			})
			.select()
			.single();

		if (!error && data) {
			setProducts([...products, data]);
			setNewProductName("");
			setNewProductPrice("");
			setNewProductDesc("");
		}
	};

	const toggleProductAvailability = async (
		product: IProduct,
	): Promise<void> => {
		const { error } = await supabase
			.from("products")
			.update({ is_available: !product.is_available })
			.eq("id", product.id);

		if (!error) {
			setProducts(
				products.map((p) =>
					p.id === product.id ? { ...p, is_available: !p.is_available } : p,
				),
			);
		}
	};

	const handleDeleteProduct = async (id: string): Promise<void> => {
		const { error } = await supabase.from("products").delete().eq("id", id);
		if (!error) {
			setProducts(products.filter((p) => p.id !== id));
		}
	};

	useEffect(() => {
		fetchAdminData();
	}, [fetchAdminData]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-100">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
			</div>
		);
	}

	const publicMenuUrl = `${window.location.origin}/${business?.slug}`;

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Top Navbar */}
			<header className="bg-white border-b border-gray-200 sticky top-0 z-10">
				<div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
					<div className="flex items-center gap-2">
						<Store className="text-emerald-600" />
						<h1 className="font-bold text-xl text-gray-800">
							{business?.name || "Panel Admin"}
						</h1>
					</div>
					<a
						href={publicMenuUrl}
						target="_blank"
						rel="noreferrer"
						className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-emerald-100 transition-colors"
					>
						Ver Menú Público ↗
					</a>
				</div>
			</header>

			<main className="max-w-5xl mx-auto px-4 py-6">
				{/* Navigation Tabs */}
				<div className="flex gap-2 border-b border-gray-200 mb-6 pb-2">
					<button
						type="button"
						onClick={() => setActiveTab("products")}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
							activeTab === "products"
								? "bg-emerald-600 text-white"
								: "bg-white text-gray-600 hover:bg-gray-50"
						}`}
					>
						<Package size={16} /> Productos
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("categories")}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
							activeTab === "categories"
								? "bg-emerald-600 text-white"
								: "bg-white text-gray-600 hover:bg-gray-50"
						}`}
					>
						<Layers size={16} /> Categorías
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("qr")}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
							activeTab === "qr"
								? "bg-emerald-600 text-white"
								: "bg-white text-gray-600 hover:bg-gray-50"
						}`}
					>
						<QrCode size={16} /> Código QR
					</button>
				</div>

				{/* TAB: PRODUCTOS */}
				{activeTab === "products" && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Formulario de Alta */}
						<div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-fit">
							<h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
								<Plus size={18} /> Nuevo Producto
							</h2>
							<form onSubmit={handleCreateProduct} className="space-y-3">
								<div>
									<label
										className="block text-xs font-semibold text-gray-600 mb-1"
										htmlFor="name"
									>
										Nombre
									</label>
									<input
										id="name"
										type="text"
										required
										value={newProductName}
										onChange={(e) => setNewProductName(e.target.value)}
										placeholder="Ej. Hamburguesa Doble"
										className="w-full p-2 border border-gray-300 rounded-lg text-sm"
									/>
								</div>
								<div>
									<label
										className="block text-xs font-semibold text-gray-600 mb-1"
										htmlFor="price"
									>
										Precio ($)
									</label>
									<input
										id="price"
										type="number"
										step="0.01"
										required
										value={newProductPrice}
										onChange={(e) => setNewProductPrice(e.target.value)}
										placeholder="2500"
										className="w-full p-2 border border-gray-300 rounded-lg text-sm"
									/>
								</div>
								<div>
									<label
										className="block text-xs font-semibold text-gray-600 mb-1"
										htmlFor="category"
									>
										Categoría
									</label>
									<select
										id="category"
										value={selectedCategory}
										onChange={(e) => setSelectedCategory(e.target.value)}
										className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
									>
										<option value="">Sin categoría</option>
										{categories.map((cat) => (
											<option key={cat.id} value={cat.id}>
												{cat.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label
										className="block text-xs font-semibold text-gray-600 mb-1"
										htmlFor="description"
									>
										Descripción
									</label>
									<textarea
										id="description"
										rows={2}
										value={newProductDesc}
										onChange={(e) => setNewProductDesc(e.target.value)}
										placeholder="Ingredientes o detalle..."
										className="w-full p-2 border border-gray-300 rounded-lg text-sm"
									/>
								</div>
								<button
									type="submit"
									className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg text-sm transition-colors"
								>
									Agregar Producto
								</button>
							</form>
						</div>

						{/* Listado de Productos */}
						<div className="md:col-span-2 space-y-3">
							{products.length === 0 ? (
								<div className="bg-white p-8 rounded-xl text-center text-gray-500 border border-gray-200">
									Aún no agregaste productos.
								</div>
							) : (
								products.map((p) => (
									<div
										key={p.id}
										className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm"
									>
										<div>
											<h3 className="font-bold text-gray-800 text-sm">
												{p.name}
											</h3>
											<p className="text-xs text-gray-500">{p.description}</p>
											<span className="font-semibold text-emerald-700 text-sm mt-1 block">
												${p.price.toFixed(2)}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={() => toggleProductAvailability(p)}
												className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 ${
													p.is_available
														? "bg-emerald-50 text-emerald-700"
														: "bg-gray-100 text-gray-500"
												}`}
												title="Cambiar visibilidad"
											>
												{p.is_available ? (
													<Eye size={16} />
												) : (
													<EyeOff size={16} />
												)}
											</button>
											<button
												type="button"
												onClick={() => handleDeleteProduct(p.id)}
												className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
												title="Eliminar"
											>
												<Trash2 size={16} />
											</button>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				)}

				{/* TAB: CATEGORÍAS */}
				{activeTab === "categories" && (
					<div className="max-w-md bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
						<h2 className="font-bold text-gray-800">Crear Categoría</h2>
						<form onSubmit={handleCreateCategory} className="flex gap-2">
							<input
								type="text"
								required
								value={newCategoryName}
								onChange={(e) => setNewCategoryName(e.target.value)}
								placeholder="Ej. Bebidas, Postres"
								className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
							/>
							<button
								type="submit"
								className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
							>
								Agregar
							</button>
						</form>

						<div className="divide-y divide-gray-100 pt-2">
							{categories.map((cat) => (
								<div
									key={cat.id}
									className="py-2.5 flex justify-between items-center text-sm"
								>
									<span className="font-medium text-gray-700">{cat.name}</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* TAB: CÓDIGO QR */}
				{activeTab === "qr" && (
					<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-md mx-auto text-center space-y-4">
						<h2 className="font-bold text-lg text-gray-800">
							Código QR del Menú
						</h2>
						<p className="text-xs text-gray-500">
							Imprimí este código para colocarlo en las mesas o mostrador de tu
							local.
						</p>
						<div className="p-4 bg-white border border-gray-200 rounded-xl inline-block shadow-inner">
							<QRCodeSVG value={publicMenuUrl} size={200} />
						</div>
						<p className="text-xs font-mono text-emerald-700 break-all bg-emerald-50 p-2 rounded-lg">
							{publicMenuUrl}
						</p>
					</div>
				)}
			</main>
		</div>
	);
};
