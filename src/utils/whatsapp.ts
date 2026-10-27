import type { IBusiness, ICartItem } from "../interfaces";

export const buildWhatsAppUrl = (
	business: IBusiness,
	cart: ICartItem[],
	customerDetails: { name: string; address?: string; notes?: string },
): string => {
	// Usamos emojis universales muy seguros o formato limpio de texto
	let message = `*NUEVO PEDIDO: ${business.name.toUpperCase()}*\n`;
	message += `==============================\n\n`;

	message += `*Cliente:* ${customerDetails.name}\n`;

	if (customerDetails.address && customerDetails.address.trim() !== "") {
		message += `*Dirección:* ${customerDetails.address}\n`;
	}

	if (customerDetails.notes && customerDetails.notes.trim() !== "") {
		message += `*Notas:* ${customerDetails.notes}\n`;
	}

	message += `\n==============================\n`;
	message += `*DETALLE DEL PEDIDO*\n`;
	message += `==============================\n`;

	let total = 0;

	cart.forEach((item) => {
		const subtotal = item.product.price * item.quantity;
		total += subtotal;

		message += `• *${item.quantity}x* ${item.product.name}\n`;
		message += `   Subtotal: ${business.currency_symbol}${subtotal.toFixed(2)}\n`;

		if (item.notes && item.notes.trim() !== "") {
			message += `   _Nota: ${item.notes}_\n`;
		}
	});

	message += `==============================\n`;
	message += `*TOTAL A PAGAR: ${business.currency_symbol}${total.toFixed(2)}*\n`;
	message += `==============================\n`;
	message += `_Enviado a través de MenuWapp_`;

	// Limpiar número de teléfono (quitar espacios, guiones o el signo +)
	const cleanPhone = business.whatsapp_number.replace(/\D/g, "");
	const encodedText = encodeURIComponent(message);

	return `https://wa.me/${cleanPhone}?text=${encodedText}`;
};
