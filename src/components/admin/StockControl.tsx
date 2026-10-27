import {
	AlertTriangle,
	CheckCircle2,
	Minus,
	Plus,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import type { IStockControl } from "../../interfaces";
import { supabase } from "../../lib/supabase";

export const StockControl = ({
	productId,
	currentStock,
	onStockChange,
}: IStockControl) => {
	const [loading, setLoading] = useState(false);

	const handleStockUpdate = async (newStock: number) => {
		if (newStock < 0 || loading) return;

		try {
			setLoading(true);

			// 1. Persistir el cambio directo en Supabase
			const { error } = await supabase
				.from("products")
				.update({ stock: newStock })
				.eq("id", productId);

			if (error) {
				console.error("Error al actualizar el stock en Supabase:", error);
				return;
			}

			// 2. Notificar al componente padre (Dashboard) para sincronizar la UI
			onStockChange(productId, newStock);
		} catch (err) {
			console.error("Error inesperado actualizando stock:", err);
		} finally {
			setLoading(false);
		}
	};

	const getStockBadge = () => {
		if (currentStock === 0) {
			return (
				<span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md shrink-0">
					<XCircle size={12} /> Sin Stock
				</span>
			);
		}
		if (currentStock <= 3) {
			return (
				<span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shrink-0">
					<AlertTriangle size={12} /> Poco Stock ({currentStock})
				</span>
			);
		}
		return (
			<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
				<CheckCircle2 size={12} /> {currentStock} un.
			</span>
		);
	};

	return (
		<div className="flex items-center gap-2">
			{getStockBadge()}

			<div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-xs">
				<button
					type="button"
					onClick={() => handleStockUpdate(currentStock - 1)}
					disabled={loading || currentStock <= 0}
					className="cursor-pointer p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
					title="Restar stock"
				>
					<Minus size={14} />
				</button>

				<span className="px-2 text-xs font-bold text-gray-800 min-w-[2rem] text-center">
					{currentStock}
				</span>

				<button
					type="button"
					onClick={() => handleStockUpdate(currentStock + 1)}
					disabled={loading}
					className="cursor-pointer p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
					title="Sumar stock"
				>
					<Plus size={14} />
				</button>
			</div>
		</div>
	);
};
