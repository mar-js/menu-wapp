import { create } from "zustand";
import type { IBusinessState } from "../interfaces";
import { supabase } from "../lib/supabase";

export const useBusinessStore = create<IBusinessState>((set, get) => ({
	products: [],
	// En tu store principal donde cargas los productos de Supabase:
	updateStock: async (productId: string, newStock: number) => {
		const targetStock = Math.max(0, newStock);

		// 1. Persistir cambio en Supabase
		const { error } = await supabase
			.from("products")
			.update({ stock: targetStock })
			.eq("id", productId);

		if (error) {
			console.error("Error al actualizar stock en Supabase:", error);
			return;
		}

		// 2. Actualizar la lista global de productos en Zustand
		set((state) => ({
			products: state.products.map((p) =>
				p.id === productId ? { ...p, stock: targetStock } : p,
			),
		}));
	},
}));
