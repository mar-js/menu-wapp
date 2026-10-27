import type { JSX } from "react/jsx-runtime";

export interface IProtectedRoute {
	component: () => JSX.Element;
}

export interface ICartState {
	items: ICartItem[];
	addItem: (product: IProduct) => void;
	removeItem: (productId: string) => void;
	updateQuantity: (
		productId: string,
		quantity: number,
		maxStock?: number | null,
	) => void;
	updateNotes: (productId: string, notes: string) => void;
	clearCart: () => void;
	getTotal: () => number;
}

export interface IBusiness {
	id: string;
	owner_id: string;
	name: string;
	slug: string;
	whatsapp_number: string;
	currency_symbol: string;
	is_active: boolean;
	payment_methods: string[];
}

export interface ICategory {
	id: string;
	business_id: string;
	name: string;
	sort_order: number;
}

export interface IProduct {
	id: string;
	business_id: string;
	category_id: string | null;
	name: string;
	description: string | null;
	price: number;
	image_url: string | null;
	is_available: boolean;
	stock?: number | null;
}

export interface ICartItem {
	product: IProduct;
	quantity: number;
	notes?: string;
}
