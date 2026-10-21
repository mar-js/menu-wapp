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
