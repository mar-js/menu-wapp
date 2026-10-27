import {
	CreditCard,
	Eye,
	EyeOff,
	Image as ImageIcon,
	Layers,
	Package,
	Plus,
	QrCode,
	ShoppingBag,
	Store,
	Trash2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";
import type { JSX } from "react/jsx-runtime";
import { OrderList } from "../../components/admin/OrderList";
import { StockControl } from "../../components/admin/StockControl";
import { AVAILABLE_PAYMENT_OPTIONS } from "../../global/constants";
import type { IBusiness, ICategory, IProduct } from "../../interfaces";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../utils/formatPrice";
import { uploadProductImage } from "../../utils/storage";

export const Dashboard = (): JSX.Element => {
	const [business, setBusiness] = useState<IBusiness | null>(null);
	const [categories, setCategories] = useState<ICategory[]>([]);
	const [products, setProducts] = useState<IProduct[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [uploadingImage, setUploadingImage] = useState<boolean>(false);

	// Agregamos "payment-methods" a las pestañas activas posibles
	const [activeTab, setActiveTab] = useState<
		"products" | "categories" | "qr" | "payment-methods" | "orders"
	>("products");

	// Formularios
	const [newCategoryName, setNewCategoryName] = useState<string>("");
	const [newProductName, setNewProductName] = useState<string>("");
	const [newProductPrice, setNewProductPrice] = useState<string>("");
	const [newProductDesc, setNewProductDesc] = useState<string>("");
	const [newProductStock, setNewProductStock] = useState<string>("");
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [isCreatingCategory, setIsCreatingCategory] = useState(false);
	const [quickCategoryName, setQuickCategoryName] = useState<string>("");

	const handleLogout = async (): Promise<void> => {
		await supabase.auth.signOut();
		window.location.href = "/admin/login";
	};

	const fetchAdminData = useCallback(async (): Promise<void> => {
		try {
			setLoading(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const { data: bizData } = await supabase
				.from("businesses")
				.select("*")
				.eq("owner_id", user.id)
				.single();

			if (bizData) {
				setBusiness(bizData);

				const { data: catData } = await supabase
					.from("categories")
					.select("*")
					.eq("business_id", bizData.id)
					.order("sort_order", { ascending: true });
				setCategories(catData || []);

				const { data: prodData } = await supabase
					.from("products")
					.select("*")
					.eq("business_id", bizData.id);
				setProducts(prodData || []);
			}
		} catch (error) {
			console.error("Error cargando datos:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	const handleCreateCategory = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		if (!business || !newCategoryName.trim()) return;

		try {
			const { data, error } = await supabase
				.from("categories")
				.insert({
					business_id: business.id,
					name: newCategoryName.trim(),
				})
				.select()
				.single();

			if (!error && data) {
				setCategories([...categories, data]);
				setNewCategoryName("");
			}
		} catch (error) {
			console.error("Error al crear la categoría:", error);
		}
	};

	const handleCreateProduct = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		if (!business || !newProductName.trim() || !newProductPrice) return;

		try {
			setUploadingImage(true);
			let imageUrl: string | null = null;

			if (imageFile) {
				imageUrl = await uploadProductImage(imageFile);
			}

			const { data, error } = await supabase
				.from("products")
				.insert({
					business_id: business.id,
					category_id: selectedCategory || null,
					name: newProductName,
					description: newProductDesc,
					price: parseFloat(newProductPrice),
					stock: newProductStock ? parseInt(newProductStock, 10) : null,
					image_url: imageUrl,
					is_available: true,
				})
				.select()
				.single();

			if (!error && data) {
				setProducts([...products, data]);
				setNewProductName("");
				setNewProductPrice("");
				setNewProductDesc("");
				setImageFile(null);
			}
		} catch (error) {
			console.error("Error al guardar el producto:", error);
		} finally {
			setUploadingImage(false);
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

	const handleDeleteCategory = async (categoryId: string): Promise<void> => {
		try {
			const { error } = await supabase
				.from("categories")
				.delete()
				.eq("id", categoryId);

			if (!error) {
				setCategories(categories.filter((c) => c.id !== categoryId));
				if (selectedCategory === categoryId) {
					setSelectedCategory("");
				}
				setProducts(
					products.map((p) =>
						p.category_id === categoryId ? { ...p, category_id: null } : p,
					),
				);
			} else {
				console.error("Error al eliminar la categoría:", error);
			}
		} catch (error) {
			console.error("Error al eliminar la categoría:", error);
		}
	};

	// Función para alternar y guardar métodos de pago en Supabase
	const togglePaymentMethod = async (method: string) => {
		if (!business) return;

		const currentMethods = business.payment_methods || [];
		const updatedMethods = currentMethods.includes(method)
			? currentMethods.filter((m: string) => m !== method)
			: [...currentMethods, method];

		try {
			const { error } = await supabase
				.from("businesses")
				.update({ payment_methods: updatedMethods })
				.eq("id", business.id);

			if (!error) {
				setBusiness({ ...business, payment_methods: updatedMethods });
			} else {
				console.error("Error al actualizar métodos de pago:", error);
			}
		} catch (error) {
			console.error("Error al actualizar métodos de pago:", error);
		}
	};

	// 1. Agregar el handler de actualización de stock dentro de Dashboard
	const handleStockChange = (productId: string, newStock: number) => {
		setProducts((prevProducts) =>
			prevProducts.map((p) =>
				p.id === productId ? { ...p, stock: newStock } : p,
			),
		);
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
			<header className="bg-white border-b border-gray-200 sticky top-0 z-10">
				<div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
					<div className="flex items-center gap-2">
						<Store className="text-emerald-600" />
						<h1 className="font-bold text-xl text-gray-800">
							{business?.name || "Panel Admin"}
						</h1>
					</div>
					<div className="flex items-center gap-3">
						<a
							href={publicMenuUrl}
							target="_blank"
							rel="noreferrer"
							className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-emerald-100 transition-colors"
						>
							Ver Menú Público ↗
						</a>
						<button
							type="button"
							onClick={handleLogout}
							className="cursor-pointer text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
						>
							Cerrar Sesión
						</button>
					</div>
				</div>
			</header>

			<main className="max-w-5xl mx-auto px-4 py-6">
				{/* Pestañas de Navegación del Dashboard */}
				<div className="flex gap-2 border-b border-gray-200 mb-6 pb-2 overflow-x-auto">
					<button
						type="button"
						onClick={() => setActiveTab("products")}
						className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
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
						className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
							activeTab === "categories"
								? "bg-emerald-600 text-white"
								: "bg-white text-gray-600 hover:bg-gray-50"
						}`}
					>
						<Layers size={16} /> Categorías
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("payment-methods")}
						className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
							activeTab === "payment-methods"
								? "bg-emerald-600 text-white"
								: "bg-white text-gray-600 hover:bg-gray-50"
						}`}
					>
						<CreditCard size={16} /> Métodos de Pago
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("qr")}
						className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
							activeTab === "qr"
								? "bg-emerald-600 text-white"
								: "bg-white text-gray-600 hover:bg-gray-50"
						}`}
					>
						<QrCode size={16} /> Código QR
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("orders")}
						className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
							activeTab === "orders"
								? "bg-emerald-600 text-white"
								: "bg-white text-gray-600 hover:bg-gray-50"
						}`}
					>
						<ShoppingBag size={16} /> Pedidos
					</button>
				</div>

				{/* Pestaña: Productos */}
				{activeTab === "products" && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-fit">
							<h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
								<Plus size={18} /> Nuevo Producto
							</h2>
							<form
								onSubmit={handleCreateProduct}
								className="space-y-3"
								id="save-product-form"
							>
								<div>
									<label
										className="block text-xs font-semibold text-gray-600 mb-1"
										htmlFor="productName"
									>
										Nombre
									</label>
									<input
										type="text"
										required
										value={newProductName}
										onChange={(e) => setNewProductName(e.target.value)}
										placeholder="Ej. Hamburguesa Doble"
										className="w-full p-2 border border-gray-300 rounded-lg text-sm"
										id="productName"
									/>
								</div>
								<div>
									<label
										className="block text-xs font-semibold text-gray-600 mb-1"
										htmlFor="productPrice"
									>
										Precio ($)
									</label>
									<input
										type="number"
										step="0.01"
										required
										value={newProductPrice}
										onChange={(e) => setNewProductPrice(e.target.value)}
										placeholder="2500"
										className="w-full p-2 border border-gray-300 rounded-lg text-sm"
										id="productPrice"
									/>
								</div>
								<div>
									<label
										className="block text-xs font-semibold text-gray-600 mb-1"
										htmlFor="productStock"
									>
										Stock / Cantidad disponible (Opcional)
									</label>
									<input
										id="productStock"
										type="number"
										value={newProductStock}
										onChange={(e) => setNewProductStock(e.target.value)}
										placeholder="Ej. 20 (vacío = ilimitado)"
										className="w-full p-2 border border-gray-300 rounded-lg text-sm"
									/>
								</div>
								<div>
									<div className="flex items-center justify-between mb-1">
										<label
											className="block text-xs font-semibold text-gray-600"
											htmlFor="productCategory"
										>
											Categoría
										</label>
										<button
											type="button"
											onClick={() => setIsCreatingCategory(true)}
											className="cursor-pointer text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
										>
											+ Nueva categoría
										</button>
									</div>

									<select
										id="productCategory"
										value={selectedCategory}
										onChange={(e) => {
											if (e.target.value === "__NEW__") {
												setIsCreatingCategory(true);
											} else {
												setSelectedCategory(e.target.value);
											}
										}}
										className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
									>
										<option value="">Sin categoría</option>
										{categories.map((cat) => (
											<option key={cat.id} value={cat.id}>
												{cat.name}
											</option>
										))}
										<option
											value="__NEW__"
											className="text-emerald-600 font-semibold bg-emerald-50"
										>
											✨ + Crear nueva categoría...
										</option>
									</select>

									{isCreatingCategory && (
										<div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
											<p className="text-xs font-bold text-emerald-900">
												Nueva Categoría
											</p>
											<div className="flex gap-2">
												<input
													type="text"
													value={quickCategoryName}
													onChange={(e) => setQuickCategoryName(e.target.value)}
													placeholder="Ej. Bebidas, Pizzas..."
													className="w-full p-1.5 border border-emerald-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
												/>
												<button
													type="button"
													onClick={async () => {
														if (!business || !quickCategoryName.trim()) return;

														try {
															const { data, error } = await supabase
																.from("categories")
																.insert({
																	business_id: business.id,
																	name: quickCategoryName.trim(),
																})
																.select()
																.single();

															if (!error && data) {
																setCategories([...categories, data]);
																setSelectedCategory(data.id);
																setQuickCategoryName("");
																setIsCreatingCategory(false);
															}
														} catch (error) {
															console.error(
																"Error al crear categoría rápida:",
																error,
															);
														}
													}}
													className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold shrink-0"
												>
													Guardar
												</button>
												<button
													type="button"
													onClick={() => {
														setQuickCategoryName("");
														setIsCreatingCategory(false);
													}}
													className="cursor-pointer text-gray-500 hover:text-gray-700 text-xs px-2 py-1.5 shrink-0"
												>
													Cancelar
												</button>
											</div>
										</div>
									)}
								</div>
								<div>
									<label
										className="block text-xs font-semibold text-gray-600 mb-1"
										htmlFor="productImage"
									>
										Imagen del Producto
									</label>
									<div className="flex items-center gap-2 border border-gray-300 p-2 rounded-lg bg-gray-50">
										<ImageIcon size={18} className="text-gray-400 shrink-0" />
										<input
											type="file"
											accept="image/*"
											id="productImage"
											className="hidden"
											onChange={(e) =>
												setImageFile(e.target.files?.[0] || null)
											}
										/>
										<label
											htmlFor="productImage"
											className="flex-1 text-xs text-gray-600 truncate cursor-pointer bg-white border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-between"
										>
											<span className="truncate">
												{imageFile ? imageFile.name : "Seleccionar imagen..."}
											</span>
											<span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded text-[10px] shrink-0 ml-2">
												Examinar
											</span>
										</label>
										{imageFile && (
											<button
												type="button"
												onClick={() => setImageFile(null)}
												className="cursor-pointer text-red-500 hover:text-red-700 text-xs font-medium px-1 shrink-0"
												title="Quitar imagen"
											>
												✕
											</button>
										)}
									</div>
								</div>
								<div>
									<label
										className="block text-xs font-semibold text-gray-600 mb-1"
										htmlFor="productDescription"
									>
										Descripción
									</label>
									<textarea
										id="productDescription"
										rows={2}
										value={newProductDesc}
										onChange={(e) => setNewProductDesc(e.target.value)}
										placeholder="Detalle del producto..."
										className="w-full p-2 border border-gray-300 rounded-lg text-sm"
									/>
								</div>
								<button
									type="submit"
									form="save-product-form"
									disabled={uploadingImage}
									className="cursor-pointer w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
								>
									{uploadingImage ? (
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									) : (
										"Guardar Producto"
									)}
								</button>
							</form>
						</div>

						<div className="md:col-span-2 space-y-3">
							{products.map((p) => (
								<div
									key={p.id}
									className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
								>
									<div className="flex items-center gap-3">
										{p.image_url ? (
											<img
												src={p.image_url}
												alt={p.name}
												className="w-14 h-14 object-cover rounded-lg border border-gray-100"
											/>
										) : (
											<div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
												<ImageIcon size={20} />
											</div>
										)}
										<div>
											<h3 className="font-bold text-gray-800 text-sm">
												{p.name}
											</h3>
											<p className="text-xs text-gray-500 line-clamp-1">
												{p.description}
											</p>
											<span className="font-semibold text-emerald-700 text-sm mt-0.5 block">
												{formatPrice(p.price)}
											</span>
										</div>
									</div>

									<div className="flex items-center justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
										{/* Controles de Stock integrados y sincronizados */}
										<StockControl
											productId={p.id}
											currentStock={p.stock ?? 0}
											onStockChange={handleStockChange}
										/>

										<div className="flex items-center gap-1 border-l border-gray-200 pl-2">
											<button
												type="button"
												onClick={() => toggleProductAvailability(p)}
												className="cursor-pointer p-2 rounded-lg text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
												title={
													p.is_available
														? "Ocultar producto"
														: "Mostrar producto"
												}
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
												className="cursor-pointer p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
												title="Eliminar producto"
											>
												<Trash2 size={16} />
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Pestaña: Categorías */}
				{activeTab === "categories" && (
					<div className="max-w-md bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
						<h2 className="font-bold text-gray-800">Crear Categoría</h2>
						<form
							onSubmit={handleCreateCategory}
							className="flex gap-2"
							id="add-category-form"
						>
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
								form="add-category-form"
								className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
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
									<button
										type="button"
										onClick={() => handleDeleteCategory(cat.id)}
										className="cursor-pointer p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
										title="Eliminar categoría"
									>
										<Trash2 size={16} />
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Pestaña NUEVA: Métodos de Pago */}
				{activeTab === "payment-methods" && (
					<div className="max-w-md bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
						<div>
							<h2 className="font-bold text-gray-800 text-base">
								Métodos de Pago Habilitados
							</h2>
							<p className="text-xs text-gray-500 mt-0.5">
								Seleccioná cuáles de estos métodos de pago aceptarás en tu
								negocio. Tus clientes podrán elegirlos al momento de enviar el
								pedido por WhatsApp.
							</p>
						</div>

						<div className="space-y-2 pt-2">
							{AVAILABLE_PAYMENT_OPTIONS.map((option) => {
								const isSelected =
									business?.payment_methods?.includes(option) || false;
								return (
									<button
										type="button"
										key={option}
										onClick={() => togglePaymentMethod(option)}
										className={`cursor-pointer w-full px-4 py-3 rounded-xl text-sm font-medium border transition-all flex items-center justify-between text-left ${
											isSelected
												? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm"
												: "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
										}`}
									>
										<span>{option}</span>
										<span
											className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
												isSelected
													? "bg-emerald-600 text-white"
													: "border border-gray-300 text-transparent"
											}`}
										>
											✓
										</span>
									</button>
								);
							})}
						</div>
					</div>
				)}

				{/* Pestaña: Código QR */}
				{activeTab === "qr" && (
					<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-md mx-auto text-center space-y-4">
						<h2 className="font-bold text-lg text-gray-800">
							Código QR del Menú
						</h2>
						<div className="p-4 bg-white border border-gray-200 rounded-xl inline-block shadow-inner">
							<QRCodeSVG value={publicMenuUrl} size={200} />
						</div>
						<p className="text-xs font-mono text-emerald-700 break-all bg-emerald-50 p-2 rounded-lg">
							{publicMenuUrl}
						</p>
					</div>
				)}

				{/* Pestaña: Pedidos/Ordenes */}
				{activeTab === "orders" && business && (
					<OrderList
						businessId={business.id}
						products={products}
						onStockRestored={fetchAdminData}
					/>
				)}
			</main>
		</div>
	);
};
