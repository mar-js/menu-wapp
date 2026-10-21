export const formatArgentinianPhone = (inputPhone: string): string => {
	// 1. Dejar solo los dígitos numéricos
	let clean = inputPhone.replace(/\D/g, "");

	// 2. Si el usuario ingresó un 0 al inicio (ej: 0381...), se lo quitamos
	if (clean.startsWith("0")) {
		clean = clean.substring(1);
	}

	// 3. Si ingresó un 15 luego de la característica (ej: 381 15 456789), quitamos el 15
	// Casos comunes de códigos de área de 2, 3 o 4 dígitos + 15
	clean = clean.replace(/^(\d{2,4})15(\d{6,8})$/, "$1$2");

	// 4. Si no empieza con el código de país de Argentina (549), se lo agregamos
	if (!clean.startsWith("549")) {
		// Si empieza solo con 54, le agregamos el 9
		if (clean.startsWith("54")) {
			clean = `549${clean.substring(2)}`;
		} else {
			clean = `549${clean}`;
		}
	}

	return clean;
};
