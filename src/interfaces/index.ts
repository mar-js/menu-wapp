export interface IBusiness {
	id: string;
	owner_id: string;
	name: string;
	slug: string;
	whatsapp_number: string;
	currency_symbol: string;
	is_active: boolean;
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
}

export interface ICartItem {
	product: IProduct;
	quantity: number;
	notes?: string;
}
