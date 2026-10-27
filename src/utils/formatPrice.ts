export const formatPrice = (price: number, currencySymbol = "$"): string => {
	const formatted = new Intl.NumberFormat("es-AR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(price);

	return `${currencySymbol}${formatted}`;
};
