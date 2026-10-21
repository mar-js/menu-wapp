import { ArrowRight, Lock, Mail, Store } from "lucide-react";
import { useState } from "react";
import type { JSX } from "react/jsx-dev-runtime";
import { useLocation } from "wouter";
import { supabase } from "../../lib/supabase";

export const Login = (): JSX.Element => {
	const [, setLocation] = useLocation();
	const [isRegistering, setIsRegistering] = useState<boolean>(false);
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [businessName, setBusinessName] = useState<string>("");
	const [whatsappNumber, setWhatsappNumber] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>("");

	const handleAuth = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		setErrorMessage("");

		try {
			if (isRegistering) {
				// 1. Crear usuario en Supabase Auth
				const { data: authData, error: authError } = await supabase.auth.signUp(
					{
						email,
						password,
					},
				);

				if (authError) throw authError;

				if (authData.user) {
					// Generar slug automático a partir del nombre del negocio
					const slug = businessName
						.toLowerCase()
						.trim()
						.replace(/[\s\W-]+/g, "-");

					// 2. Crear registro inicial en la tabla 'businesses'
					const { error: bizError } = await supabase.from("businesses").insert({
						owner_id: authData.user.id,
						name: businessName,
						slug,
						whatsapp_number: whatsappNumber,
						currency_symbol: "$",
					});

					if (bizError) throw bizError;
					setLocation("/admin");
				}
			} else {
				// Login existente
				const { error: loginError } = await supabase.auth.signInWithPassword({
					email,
					password,
				});

				if (loginError) throw loginError;
				setLocation("/admin");
			}
		} catch (error: any) {
			setErrorMessage(
				error.message || "Ocurrió un error al procesar la solicitud.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
				<div className="w-12 h-12 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg mb-3">
					<Store size={24} />
				</div>
				<h2 className="text-2xl font-bold text-gray-900">
					{isRegistering
						? "Creá tu cuenta en MenuWapp"
						: "Iniciar sesión en MenuWapp"}
				</h2>
				<p className="mt-1 text-xs text-gray-500">
					{isRegistering
						? "Empezá a vender por WhatsApp en minutos"
						: "Gestioná tus productos y menú digital"}
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow-sm border border-gray-200 rounded-2xl sm:px-10">
					{errorMessage && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">
							{errorMessage}
						</div>
					)}

					<form className="space-y-4" onSubmit={handleAuth}>
						{isRegistering && (
							<>
								<div>
									<label
										className="block text-xs font-semibold text-gray-700 mb-1"
										htmlFor="businessName"
									>
										Nombre del Local / Comercio
									</label>
									<input
										id="businessName"
										type="text"
										required
										value={businessName}
										onChange={(e) => setBusinessName(e.target.value)}
										placeholder="Ej. Mi Cafetería"
										className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
									/>
								</div>

								<div>
									<label
										className="block text-xs font-semibold text-gray-700 mb-1"
										htmlFor="whatsappNumber"
									>
										Número de WhatsApp (con código de país)
									</label>
									<input
										id="whatsappNumber"
										type="text"
										required
										value={whatsappNumber}
										onChange={(e) => setWhatsappNumber(e.target.value)}
										placeholder="Ej. 5491122334455"
										className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
									/>
								</div>
							</>
						)}

						<div>
							<label
								className="block text-xs font-semibold text-gray-700 mb-1"
								htmlFor="email"
							>
								Correo Electrónico
							</label>
							<div className="relative">
								<input
									id="email"
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="tu@email.com"
									className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
								/>
								<Mail
									size={16}
									className="absolute left-3 top-2.5 text-gray-400"
								/>
							</div>
						</div>

						<div>
							<label
								className="block text-xs font-semibold text-gray-700 mb-1"
								htmlFor="password"
							>
								Contraseña
							</label>
							<div className="relative">
								<input
									id="password"
									type="password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
								/>
								<Lock
									size={16}
									className="absolute left-3 top-2.5 text-gray-400"
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
						>
							{loading ? (
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
							) : (
								<>
									<span>
										{isRegistering
											? "Crear mi cuenta"
											: "Ingresar al Dashboard"}
									</span>
									<ArrowRight size={16} />
								</>
							)}
						</button>
					</form>

					<div className="mt-6 text-center">
						<button
							type="button"
							onClick={() => {
								setIsRegistering(!isRegistering);
								setErrorMessage("");
							}}
							className="text-xs text-emerald-600 hover:underline font-medium"
						>
							{isRegistering
								? "¿Ya tenés una cuenta? Iniciar sesión"
								: "¿No tenés cuenta? Registrá tu comercio gratis"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
