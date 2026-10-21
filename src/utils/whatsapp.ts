import type { IBusiness, ICartItem } from "../interfaces";

export const buildWhatsAppUrl = (
	business: IBusiness,
	cart: ICartItem[],
	customerDetails: { name: string; address?: string; notes?: string },
): string => {
	let message = `*¡Nuevo Pedido para ${business.name}!*\n\n`;
	message += `👤 *Cliente:* ${customerDetails.name}\n`;
	if (customerDetails.address) {
		message += `📍 *Dirección:* ${customerDetails.address}\n`;
	}
	message += `------------------------------------\n\n`;
	message += `*Detalle del pedido:*\n`;

	let total = 0;

	cart.forEach((item) => {
		const subtotal = item.product.price * item.quantity;
		total += subtotal;
		message += `• *${item.quantity}x* ${item.product.name} - ${business.currency_symbol}${subtotal.toFixed(2)}\n`;
		if (item.notes) {
			message += `   └ _Nota: ${item.notes}_\n`;
		}
	});

	message += `\n------------------------------------\n`;
	message += `💰 *Total a pagar:* ${business.currency_symbol}${total.toFixed(2)}\n`;

	if (customerDetails.notes) {
		message += `\n📝 *Notas adicionales:* ${customerDetails.notes}\n`;
	}

	// Limpiar número de teléfono (quitar espacios, guiones o el signo +)
	const cleanPhone = business.whatsapp_number.replace(/\D/g, "");
	const encodedText = encodeURIComponent(message);

	return `https://wa.me/${cleanPhone}?text=${encodedText}`;
};
