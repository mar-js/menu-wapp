import { create } from "zustand";
import type { ICartState } from "../interfaces";

export const useCartStore = create<ICartState>((set, get) => ({
	items: [],

	addItem: (product) => {
		const currentItems = get().items;
		const existingIndex = currentItems.findIndex(
			(i) => i.product.id === product.id,
		);

		if (existingIndex > -1) {
			const updated = [...currentItems];
			updated[existingIndex].quantity += 1;
			set({ items: updated });
		} else {
			set({ items: [...currentItems, { product, quantity: 1 }] });
		}
	},

	removeItem: (productId) => {
		set({ items: get().items.filter((i) => i.product.id !== productId) });
	},

	updateQuantity: (productId, quantity) => {
		if (quantity <= 0) {
			get().removeItem(productId);
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
