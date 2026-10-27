import {
	CheckCircle2,
	Clock,
	MapPin,
	Package,
	Phone,
	XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { IOrder, IOrderList } from "../../interfaces";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../utils/formatPrice";

export const OrderList = ({
	businessId,
	products,
	onStockRestored,
}: IOrderList) => {
	const [orders, setOrders] = useState<IOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [filterStatus, setFilterStatus] = useState<
		"all" | "pending" | "completed" | "cancelled"
	>("all");

	const fetchOrders = useCallback(async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("orders")
				.select("*")
				.eq("business_id", businessId)
				.order("created_at", { ascending: false });

			if (!error && data) {
				setOrders(data);
			}
		} catch (err) {
			console.error("Error al cargar pedidos:", err);
		} finally {
			setLoading(false);
		}
	}, [businessId]);

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	// Cambiar el estado del pedido
	const handleUpdateStatus = async (
		order: IOrder,
		newStatus: "completed" | "cancelled",
	) => {
		try {
			// 1. Actualizar estado del pedido
			const { error } = await supabase
				.from("orders")
				.update({ status: newStatus })
				.eq("id", order.id);

			if (error) throw error;

			// 2. Si se CANCELA el pedido, devolvemos el stock automáticamente
			if (newStatus === "cancelled" && order.status !== "cancelled") {
				for (const item of order.items) {
					const product = products.find((p) => p.id === item.product_id);
					if (
						product &&
						product.stock !== null &&
						product.stock !== undefined
					) {
						const restoredStock = product.stock + item.quantity;
						await supabase
							.from("products")
							.update({ stock: restoredStock })
							.eq("id", item.product_id);
					}
				}
				if (onStockRestored) onStockRestored();
			}

			// Actualizar estado local
			setOrders((prev) =>
				prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)),
			);
		} catch (err) {
			console.error("Error cambiando el estado de la orden:", err);
		}
	};

	const filteredOrders =
		filterStatus === "all"
			? orders
			: orders.filter((o) => o.status === filterStatus);

	if (loading) {
		return (
			<div className="p-8 text-center text-gray-500">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
				Cargando pedidos...
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Filtros de Estado */}
			<div className="flex gap-2 pb-2 overflow-x-auto">
				{(["all", "pending", "completed", "cancelled"] as const).map((st) => (
					<button
						key={st}
						type="button"
						onClick={() => setFilterStatus(st)}
						className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
							filterStatus === st
								? "bg-slate-800 text-white"
								: "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
						}`}
					>
						{st === "all"
							? "Todos"
							: st === "pending"
								? "Pendientes"
								: st === "completed"
									? "Completados"
									: "Cancelados"}
					</button>
				))}
			</div>

			{filteredOrders.length === 0 ? (
				<div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
					<Package size={32} className="mx-auto mb-2 text-gray-400" />
					<p className="font-semibold text-sm">
						No hay pedidos registrados en este estado.
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{filteredOrders.map((order) => (
						<div
							key={order.id}
							className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3"
						>
							{/* Cabecera de la Orden */}
							<div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
								<div>
									<h3 className="font-bold text-gray-900 text-sm">
										{order.customer_name}
									</h3>
									<div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
										<span className="flex items-center gap-1">
											<MapPin size={12} /> {order.customer_address}
										</span>
										{order.customer_phone && (
											<span className="flex items-center gap-1">
												<Phone size={12} /> {order.customer_phone}
											</span>
										)}
									</div>
									{/* NOTAS DEL CLIENTE (Solo si existen) */}
									{order.customer_notes && (
										<div className="mt-2 text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md font-medium inline-block">
											📝 <strong>Nota:</strong> {order.customer_notes}
										</div>
									)}
								</div>

								{/* Badge de Estado */}
								<div>
									{order.status === "pending" && (
										<span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
											<Clock size={12} /> Pendiente
										</span>
									)}
									{order.status === "completed" && (
										<span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
											<CheckCircle2 size={12} /> Completado
										</span>
									)}
									{order.status === "cancelled" && (
										<span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
											<XCircle size={12} /> Cancelado
										</span>
									)}
								</div>
							</div>

							{/* Detalle de Productos */}
							<div className="space-y-1 bg-gray-50 p-3 rounded-lg text-xs">
								{order.items.map((it) => (
									<div
										key={it.product_id}
										className="flex justify-between items-center text-gray-700"
									>
										<span>
											<strong className="text-gray-900">{it.quantity}x</strong>{" "}
											{it.name}
										</span>
										<span className="font-semibold">
											{formatPrice(it.price * it.quantity)}
										</span>
									</div>
								))}
							</div>

							{/* Footer con Total y Acciones */}
							<div className="flex flex-wrap items-center justify-between gap-2 pt-1">
								<div className="text-xs text-gray-600">
									Pago:{" "}
									<strong className="text-gray-900">
										{order.payment_method}
									</strong>{" "}
									| Total:{" "}
									<strong className="text-emerald-700 font-bold text-sm">
										{formatPrice(order.total)}
									</strong>
								</div>

								{/* Botones de Cambio de Estado */}
								{order.status === "pending" && (
									<div className="flex gap-2">
										<button
											type="button"
											onClick={() => handleUpdateStatus(order, "completed")}
											className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
										>
											<CheckCircle2 size={14} /> Finalizar
										</button>
										<button
											type="button"
											onClick={() => handleUpdateStatus(order, "cancelled")}
											className="cursor-pointer bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
										>
											<XCircle size={14} /> Cancelar y Devolver Stock
										</button>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
