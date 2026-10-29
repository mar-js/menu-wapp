import type { IBusiness, ICartItem, ICheckoutDetails } from "../interfaces";

export const buildWhatsAppUrl = (
	business: IBusiness,
	items: ICartItem[],
	details: ICheckoutDetails,
): string => {
	const phone = business.whatsapp_number || "";

	let message = `*¡Hola! Nuevo Pedido desde MenuWapp* 🛒\n\n`;
	message += `👤 *Cliente:* ${details.name}\n`;
	message += `📍 *Dirección:* ${details.address}\n`;
	message += `🚚 *Envío:* ${details.deliveryZone || "Retiro en local"}\n`;
	message += `💳 *Pago:* ${details.paymentMethod}\n`;

	if (details.notes) {
		message += `📝 *Notas:* ${details.notes}\n`;
	}

	message += `\n*Detalle del pedido:*\n`;

	items.forEach((item) => {
		const itemTotal = item.product.price * item.quantity;
		message += `• ${item.quantity}x ${item.product.name} ($${item.product.price.toLocaleString("es-AR")} c/u) = $${itemTotal.toLocaleString("es-AR")}\n`;
	});

	const subtotal = items.reduce(
		(acc, item) => acc + item.product.price * item.quantity,
		0,
	);
	const delivery = details.deliveryCost || 0;
	const total = details.totalWithDelivery || subtotal + delivery;

	message += `\n------------------\n`;
	message += `📦 *Subtotal:* $${subtotal.toLocaleString("es-AR")}\n`;
	if (delivery > 0) {
		message += `🛵 *Envío:* $${delivery.toLocaleString("es-AR")}\n`;
	}
	message += `💰 *TOTAL A PAGAR:* *$${total.toLocaleString("es-AR")}*`;

	const encodedMessage = encodeURIComponent(message);
	return `https://wa.me/${phone}?text=${encodedMessage}`;
};
