import type { JSX, LazyExoticComponent } from "react";

export interface IOrderItem {
	product_id: string;
	name: string;
	price: number;
	quantity: number;
	notes?: string;
}

export interface IOrder {
	id: string;
	business_id: string;
	customer_name: string;
	customer_phone: string;
	customer_notes?: string; // <-- Agregar a la interfaz
	customer_address: string;
	payment_method: string;
	total: number;
	items: IOrderItem[];
	status: "pending" | "completed" | "cancelled";
	created_at: string;
}

export interface IOrderList {
	businessId: string;
	products: IProduct[];
	onStockRestored?: () => void;
}

export interface IStockControl {
	productId: string;
	currentStock: number;
	onStockChange: (productId: string, newStock: number) => void;
}

export interface IBusinessState {
	products: IProduct[];
	updateStock: (productId: string, newStock: number) => Promise<void>;
}

export interface IProtectedRoute {
	component: LazyExoticComponent<() => JSX.Element>;
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
	has_delivery: boolean;
	delivery_zones: IDeliveryZones[];
}

export interface IDeliveryZones {
	id: string;
	name: string;
	price: number;
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
