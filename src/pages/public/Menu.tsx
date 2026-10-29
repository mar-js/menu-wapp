import {
	ArrowLeft,
	MessageCircle,
	Minus,
	Plus,
	Trash2,
	Truck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { JSX } from "react/jsx-runtime";
import { useRoute } from "wouter";
import type { IBusiness, ICategory, IProduct } from "../../interfaces";
import { supabase } from "../../lib/supabase";
import { useCartStore } from "../../store/useCartStore";
import { formatPrice } from "../../utils/formatPrice";
import { buildWhatsAppUrl } from "../../utils/whatsapp";

interface IDeliveryZone {
	id: string;
	name: string;
	price: number;
}

export const Menu = (): JSX.Element => {
	const [, params] = useRoute("/:slug");
	const slug = params?.slug;
	const [business, setBusiness] = useState<IBusiness | null>(null);
	const [categories, setCategories] = useState<ICategory[]>([]);
	const [products, setProducts] = useState<IProduct[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // null = "Todos"
	const [loading, setLoading] = useState(true);
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [isOwner, setIsOwner] = useState(false);

	// Estados del formulario de cliente para el checkout de WhatsApp
	const [customerName, setCustomerName] = useState("");
	const [customerPhone, setCustomerPhone] = useState("");
	const [customerAddress, setCustomerAddress] = useState("");
	const [customerNotes, setCustomerNotes] = useState("");
	const [paymentMethod, setPaymentMethod] = useState("");
	const [selectedDeliveryZone, setSelectedDeliveryZone] =
		useState<IDeliveryZone | null>(null);

	const { items, addItem, updateQuantity, removeItem, getTotal, clearCart } =
		useCartStore();

	const fetchMenuData = useCallback(async () => {
		try {
			setLoading(true);
			// 1. Obtener negocio por slug
			const { data: bizData, error: bizError } = await supabase
				.from("businesses")
				.select("*")
				.eq("slug", slug)
				.single();

			if (bizError || !bizData) throw new Error("Local no encontrado");
			setBusiness(bizData);

			// Verificar si el usuario actual logueado es el dueño del negocio
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user && bizData.owner_id === user.id) {
				setIsOwner(true);
			}

			// 2. Obtener categorías
			const { data: catData } = await supabase
				.from("categories")
				.select("*")
				.eq("business_id", bizData.id)
				.order("sort_order", { ascending: true });

			setCategories(catData || []);

			// 3. Obtener productos disponibles
			const { data: prodData } = await supabase
				.from("products")
				.select("*")
				.eq("business_id", bizData.id)
				.eq("is_available", true);

			setProducts(prodData || []);
		} catch (error) {
			console.error("Error cargando el menú:", error);
		} finally {
			setLoading(false);
		}
	}, [slug]);

	useEffect(() => {
		fetchMenuData();
	}, [fetchMenuData]);

	useEffect(() => {
		if (business) {
			document.title = `${business.name} | Catálogo y Pedidos - MenuWapp`;

			let metaDesc = document.querySelector('meta[name="description"]');
			if (!metaDesc) {
				metaDesc = document.createElement("meta");
				metaDesc.setAttribute("name", "description");
				document.head.appendChild(metaDesc);
			}
			metaDesc.setAttribute(
				"content",
				`Mirá el catálogo de ${business.name}, consultá disponibilidad y hacé tu pedido o consulta directamente por WhatsApp.`,
			);
		}
	}, [business]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
			</div>
		);
	}

	if (!business) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
				<h1 className="text-2xl font-bold text-gray-800 mb-2">
					Local no encontrado
				</h1>
				<p className="text-gray-600">
					El menú que buscás no existe o fue deshabilitado.
				</p>
			</div>
		);
	}

	const filteredProducts = selectedCategory
		? products.filter((p) => p.category_id === selectedCategory)
		: products;

	const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

	// Cálculo del costo de envío
	const deliveryCost =
		business.has_delivery && selectedDeliveryZone
			? selectedDeliveryZone.price
			: 0;
	const finalTotal = getTotal() + deliveryCost;

	const hasStockError = items.some((item) => {
		const realProduct =
			products.find((p) => p.id === item.product.id) || item.product;
		if (realProduct.stock === null || realProduct.stock === undefined)
			return false;
		return item.quantity > realProduct.stock;
	});

	const handleCheckout = async (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!business ||
			items.length === 0 ||
			!customerName.trim() ||
			!customerPhone.trim() ||
			!customerAddress.trim() ||
			(business.has_delivery && !selectedDeliveryZone) ||
			!paymentMethod ||
			hasStockError
		)
			return;

		try {
			// 1. Guardar el pedido en la tabla "orders" de Supabase incluyendo datos de envío
			const { error: orderError } = await supabase.from("orders").insert({
				business_id: business.id,
				customer_name: customerName.trim(),
				customer_phone: customerPhone.trim(),
				customer_notes: customerNotes.trim() ? customerNotes.trim() : null,
				customer_address: customerAddress.trim(),
				payment_method: paymentMethod,
				total: finalTotal,
				items: items.map((item) => ({
					product_id: item.product.id,
					name: item.product.name,
					price: item.product.price,
					quantity: item.quantity,
					notes: item.notes || "",
				})),
				status: "pending",
			});

			if (orderError) {
				console.error("Error al guardar el pedido en Supabase:", orderError);
			}

			// 2. Descontar el stock
			for (const item of items) {
				const currentProduct = products.find((p) => p.id === item.product.id);
				if (
					currentProduct &&
					currentProduct.stock !== null &&
					currentProduct.stock !== undefined
				) {
					const newStock = Math.max(0, currentProduct.stock - item.quantity);
					await supabase
						.from("products")
						.update({ stock: newStock })
						.eq("id", item.product.id);
				}
			}

			// 3. Generar URL de WhatsApp pasando la info de envío
			const whatsappUrl = buildWhatsAppUrl(business, items, {
				name: customerName,
				address: customerAddress,
				notes: customerNotes,
				paymentMethod: paymentMethod,
				deliveryZone: selectedDeliveryZone
					? `${selectedDeliveryZone.name} (${formatPrice(selectedDeliveryZone.price)})`
					: "Retiro en local ($0)",
				deliveryCost: deliveryCost,
				totalWithDelivery: finalTotal,
			});

			window.open(whatsappUrl, "_blank");
			clearCart();
			setIsCartOpen(false);
		} catch (err) {
			console.error("Error inesperado procesando el checkout:", err);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 pb-24">
			{/* Header del Negocio */}
			<header className="bg-white shadow-sm sticky top-0 z-20">
				<div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between gap-3">
					{isOwner && (
						<a
							href="/admin"
							className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold shrink-0"
							title="Volver al Panel de Administración"
						>
							<ArrowLeft size={16} /> Admin
						</a>
					)}

					<div className="min-w-0 flex-1">
						<h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
							{business.name}
						</h1>
						<p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
							<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>{" "}
							Abierto para pedidos
						</p>
					</div>

					{isOwner && (
						<div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold shrink-0">
							{business.name.charAt(0)}
						</div>
					)}
				</div>

				{/* Categorías */}
				<div className="flex overflow-x-auto px-4 gap-2 border-t border-gray-100 py-2 scrollbar-none">
					<button
						type="button"
						onClick={() => setSelectedCategory(null)}
						className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
							selectedCategory === null
								? "bg-emerald-600 text-white shadow-sm"
								: "bg-gray-100 text-gray-600 hover:bg-gray-200"
						}`}
					>
						Todos
					</button>
					{categories.map((cat) => (
						<button
							type="button"
							key={cat.id}
							onClick={() => setSelectedCategory(cat.id)}
							className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
								selectedCategory === cat.id
									? "bg-emerald-600 text-white shadow-sm"
									: "bg-gray-100 text-gray-600 hover:bg-gray-200"
							}`}
						>
							{cat.name}
						</button>
					))}
				</div>
			</header>

			{/* Lista de Productos */}
			<main className="max-w-md mx-auto px-4 pt-4 space-y-3">
				{filteredProducts.length === 0 ? (
					<div className="text-center py-12 text-gray-500">
						No hay productos disponibles.
					</div>
				) : (
					filteredProducts.map((product) => {
						const cartItem = items.find((i) => i.product.id === product.id);
						const currentQtyInCart = cartItem ? cartItem.quantity : 0;
						const isAtMax =
							product.stock !== null &&
							product.stock !== undefined &&
							currentQtyInCart >= product.stock;

						return (
							<div
								key={product.id}
								className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex gap-3 items-center justify-between"
							>
								{product.image_url && (
									<img
										src={product.image_url}
										alt={product.name}
										className="w-20 h-20 object-cover rounded-lg shrink-0"
									/>
								)}
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-gray-900 text-sm truncate">
										{product.name}
									</h3>
									<p className="text-gray-500 text-xs line-clamp-2 mt-0.5">
										{product.description}
									</p>
									<p className="font-bold text-emerald-700 text-sm mt-1">
										{formatPrice(product.price)}
									</p>
								</div>

								{product.stock !== null &&
								product.stock !== undefined &&
								product.stock <= 0 ? (
									<span className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-lg font-bold shrink-0">
										Agotado
									</span>
								) : (
									<button
										type="button"
										disabled={isAtMax}
										onClick={() => addItem(product)}
										className={`cursor-pointer w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0 ${
											isAtMax
												? "bg-gray-100 text-gray-300 cursor-not-allowed"
												: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
										}`}
										aria-label="Agregar al carrito"
									>
										<Plus size={18} />
									</button>
								)}
							</div>
						);
					})
				)}
			</main>

			{/* Botón Flotante del Carrito */}
			{totalItemsCount > 0 && (
				<div className="fixed bottom-4 left-0 right-0 px-4 z-30 max-w-md mx-auto">
					<button
						type="button"
						onClick={() => setIsCartOpen(true)}
						className={`cursor-pointer w-full py-3.5 px-6 rounded-2xl shadow-lg font-semibold flex items-center justify-between transition-transform active:scale-95 ${
							hasStockError
								? "bg-amber-600 text-white"
								: "bg-emerald-600 text-white hover:bg-emerald-700"
						}`}
					>
						<div className="flex items-center gap-2">
							<span
								className={`text-xs px-2 py-0.5 rounded-full font-bold ${hasStockError ? "bg-amber-800" : "bg-emerald-800"}`}
							>
								{totalItemsCount}
							</span>
							<span>
								{hasStockError
									? "Revisar pedido (Stock excede)"
									: "Ver mi pedido"}
							</span>
						</div>
						<span>{formatPrice(finalTotal)}</span>
					</button>
				</div>
			)}

			{/* Modal / Drawer del Carrito */}
			{isCartOpen && (
				<div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end">
					<div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col w-full max-w-md mx-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
						<div className="p-4 border-b border-gray-100 flex items-center justify-between">
							<h2 className="font-bold text-lg text-gray-900">Tu Pedido</h2>
							<button
								type="button"
								onClick={() => setIsCartOpen(false)}
								className="cursor-pointer text-gray-400 hover:text-gray-600 font-bold p-1"
							>
								✕
							</button>
						</div>

						<div className="p-4 overflow-y-auto flex-1 space-y-3">
							{items.length === 0 ? (
								<div className="text-center py-12 text-gray-500 space-y-3">
									<p className="text-sm font-medium">Tu carrito está vacío.</p>
									<button
										type="button"
										onClick={() => setIsCartOpen(false)}
										className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
									>
										Volver al catálogo
									</button>
								</div>
							) : (
								<>
									{items.map((item) => {
										const currentProduct =
											products.find((p) => p.id === item.product.id) ||
											item.product;

										const maxStock = currentProduct.stock;
										const hasStockLimit =
											maxStock !== null && maxStock !== undefined;
										const isAtMaxStock =
											hasStockLimit && item.quantity >= (maxStock as number);
										const isOverStock =
											hasStockLimit && item.quantity > (maxStock as number);

										return (
											<div
												key={item.product.id}
												className={`flex flex-col gap-1 border-b pb-3 ${
													isOverStock
														? "border-red-200 bg-red-50 p-2 rounded-xl"
														: "border-gray-100"
												}`}
											>
												<div className="flex items-center justify-between">
													<span className="font-medium text-sm text-gray-900">
														{item.product.name}
													</span>
													<span className="font-semibold text-sm text-gray-800">
														{formatPrice(item.product.price * item.quantity)}
													</span>
												</div>

												<div className="flex items-center justify-between mt-1">
													<div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
														<button
															type="button"
															onClick={() =>
																updateQuantity(
																	item.product.id,
																	item.quantity - 1,
																)
															}
															className="cursor-pointer p-1 text-gray-600 hover:text-black"
														>
															<Minus size={14} />
														</button>
														<span className="text-xs font-bold px-2">
															{item.quantity}
														</span>
														<button
															type="button"
															onClick={() => {
																updateQuantity(
																	item.product.id,
																	item.quantity + 1,
																	maxStock,
																);
															}}
															disabled={isAtMaxStock}
															className={`cursor-pointer p-1 ${
																isAtMaxStock
																	? "text-gray-300 cursor-not-allowed"
																	: "text-gray-600 hover:text-black"
															}`}
														>
															<Plus size={14} />
														</button>
													</div>

													<button
														type="button"
														onClick={() => {
															removeItem(item.product.id);
															if (items.length <= 1) {
																setIsCartOpen(false);
															}
														}}
														className="cursor-pointer text-red-500 hover:text-red-700 p-1"
													>
														<Trash2 size={16} />
													</button>
												</div>

												{isOverStock ? (
													<span className="text-[10px] text-red-600 font-bold mt-1">
														⚠️ Supera el stock disponible (Máximo disponible:{" "}
														{maxStock} un.)
													</span>
												) : isAtMaxStock ? (
													<span className="text-[10px] text-amber-600 font-medium mt-1">
														Llegaste al stock máximo disponible ({maxStock} un.)
													</span>
												) : null}
											</div>
										);
									})}

									{/* Formulario de Checkout */}
									<form
										id="checkout-form"
										onSubmit={handleCheckout}
										className="mt-4 space-y-3 pt-2"
									>
										<div>
											<label
												className="block text-xs font-medium text-gray-700 mb-1"
												htmlFor="customerName"
											>
												Tu Nombre *
											</label>
											<input
												id="customerName"
												type="text"
												required
												value={customerName}
												onChange={(e) => setCustomerName(e.target.value)}
												placeholder="Ej. Juan Pérez"
												className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
											/>
										</div>
										<div>
											<label
												className="block text-xs font-medium text-gray-700 mb-1"
												htmlFor="customerPhone"
											>
												Tu Teléfono / Celular *
											</label>
											<input
												id="customerPhone"
												type="tel"
												required
												value={customerPhone}
												onChange={(e) => setCustomerPhone(e.target.value)}
												placeholder="Ej. 3815555555"
												className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
											/>
										</div>
										<div>
											<label
												className="block text-xs font-medium text-gray-700 mb-1"
												htmlFor="customerAddress"
											>
												Dirección de Entrega *
											</label>
											<input
												id="customerAddress"
												type="text"
												required
												value={customerAddress}
												onChange={(e) => setCustomerAddress(e.target.value)}
												placeholder="Ej. Av. San Martín 123"
												className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
											/>
										</div>

										{/* Selector de Zona de Delivery / Retiro */}
										<div>
											<label
												className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1"
												htmlFor="deliveryZone"
											>
												<Truck size={14} className="text-emerald-600" /> Forma
												de Entrega / Zona *
											</label>
											<select
												id="deliveryZone"
												required
												value={selectedDeliveryZone?.id || ""}
												onChange={(e) => {
													if (e.target.value === "pickup-local") {
														setSelectedDeliveryZone({
															id: "pickup-local",
															name: "Retiro desde el local",
															price: 0,
														});
													} else {
														const found = (
															(business.delivery_zones as IDeliveryZone[]) || []
														).find((z) => z.id === e.target.value);
														setSelectedDeliveryZone(found || null);
													}
												}}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
											>
												<option value="" disabled>
													Seleccioná tu forma de entrega
												</option>
												<option value="pickup-local">
													Retiro desde el local - $0
												</option>
												{business.has_delivery &&
													(
														(business.delivery_zones as IDeliveryZone[]) || []
													).map((zone) => (
														<option key={zone.id} value={zone.id}>
															{zone.name} - {formatPrice(zone.price)}
														</option>
													))}
											</select>
										</div>
										<div>
											<label
												className="block text-xs font-medium text-gray-700 mb-1"
												htmlFor="paymentMethod"
											>
												Método de Pago *
											</label>
											<select
												id="paymentMethod"
												required
												value={paymentMethod}
												onChange={(e) => setPaymentMethod(e.target.value)}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
											>
												<option value="" disabled>
													Elige tu método de pago
												</option>
												{business.payment_methods &&
												business.payment_methods.length > 0 ? (
													business.payment_methods.map((method) => (
														<option key={method} value={method}>
															{method}
														</option>
													))
												) : (
													<option value="Efectivo">Efectivo</option>
												)}
											</select>
										</div>

										<div>
											<label
												className="block text-xs font-medium text-gray-700 mb-1"
												htmlFor="customerNotes"
											>
												Notas para el local (Opcional)
											</label>
											<input
												id="customerNotes"
												type="text"
												value={customerNotes}
												onChange={(e) => setCustomerNotes(e.target.value)}
												placeholder="Ej. Sin cebolla, por favor"
												className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
											/>
										</div>
									</form>
								</>
							)}
						</div>

						{/* Footer Modal / Resumen de Totales */}
						{items.length > 0 && (
							<div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2">
								<div className="flex justify-between text-xs text-gray-600">
									<span>Subtotal productos:</span>
									<span>{formatPrice(getTotal())}</span>
								</div>
								{business.has_delivery && (
									<div className="flex justify-between text-xs text-gray-600">
										<span>
											Costo de envío (
											{selectedDeliveryZone?.name || "Sin seleccionar"}
											):
										</span>
										<span>{formatPrice(deliveryCost)}</span>
									</div>
								)}
								<div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
									<span>Total final:</span>
									<span className="text-emerald-700 text-base">
										{formatPrice(finalTotal)}
									</span>
								</div>

								{hasStockError && (
									<div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium text-center">
										⚠️ Hay productos que superan el stock disponible. Ajustá las
										cantidades para poder enviar tu pedido.
									</div>
								)}

								<button
									type="submit"
									form="checkout-form"
									disabled={hasStockError}
									className={`cursor-pointer w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-colors ${
										hasStockError
											? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
											: "bg-emerald-600 hover:bg-emerald-700 text-white"
									}`}
								>
									<MessageCircle size={20} />
									Enviar pedido por WhatsApp
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
