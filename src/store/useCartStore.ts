import { create } from "zustand";
import type { ICartState } from "../interfaces";

export const useCartStore = create<ICartState>((set, get) => ({
	items: [],

	addItem: (product) => {
		const currentItems = get().items;
		const existingIndex = currentItems.findIndex(
			(i) => i.product.id === product.id,
		);

		const maxStock = product.stock;

		if (existingIndex > -1) {
			const currentQty = currentItems[existingIndex].quantity;

			if (
				maxStock !== null &&
				maxStock !== undefined &&
				currentQty >= maxStock
			) {
				return;
			}

			const updated = [...currentItems];
			updated[existingIndex] = {
				...updated[existingIndex],
				product,
				quantity: currentQty + 1,
			};
			set({ items: updated });
		} else {
			if (maxStock !== null && maxStock !== undefined && maxStock <= 0) {
				return;
			}
			set({ items: [...currentItems, { product, quantity: 1 }] });
		}
	},

	removeItem: (productId) => {
		set({ items: get().items.filter((i) => i.product.id !== productId) });
	},

	updateQuantity: (productId, quantity, maxStock) => {
		if (quantity <= 0) {
			get().removeItem(productId);
			return;
		}

		if (maxStock !== null && maxStock !== undefined && quantity > maxStock) {
			// Bloqueamos el incremento si supera el stock máximo
			return;
		}

		set({
			items: get().items.map((i) =>
				i.product.id === productId ? { ...i, quantity } : i,
			),
		});
	},

	updateNotes: (productId, notes) => {
		set({
			items: get().items.map((i) =>
				i.product.id === productId ? { ...i, notes } : i,
			),
		});
	},

	clearCart: () => set({ items: [] }),

	getTotal: () => {
		return get().items.reduce(
			(total, item) => total + item.product.price * item.quantity,
			0,
		);
	},
}));
