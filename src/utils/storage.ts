import { supabase } from "../lib/supabase";

export const uploadProductImage = async (
	file: File,
): Promise<string | null> => {
	try {
		// Generar un nombre único para la imagen
		const fileExt = file.name.split(".").pop();
		const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
		const filePath = `product-images/${fileName}`;

		// Subir el archivo al bucket 'products'
		const { error: uploadError } = await supabase.storage
			.from("products")
			.upload(filePath, file);

		if (uploadError) {
			throw uploadError;
		}

		// Obtener la URL pública del archivo subido
		const { data } = supabase.storage.from("products").getPublicUrl(filePath);

		return data.publicUrl;
	} catch (error) {
		console.error("Error subiendo la imagen:", error);
		return null;
	}
};
