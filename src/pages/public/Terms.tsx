import { ArrowLeft, ShieldCheck, Store } from "lucide-react";
import { useEffect } from "react";
import type { JSX } from "react/jsx-runtime";

export const Terms = (): JSX.Element => {
	// SEO básico para la página de términos
	useEffect(() => {
		document.title = "Términos y Condiciones | MenuWapp";
	}, []);

	return (
		<div className="min-h-screen bg-gray-50 text-gray-800">
			{/* Header */}
			<header className="bg-white border-b border-gray-200 sticky top-0 z-10">
				<div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Store className="text-emerald-600" size={24} />
						<span className="font-bold text-xl text-gray-900">MenuWapp</span>
					</div>
					<a
						href="/"
						className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5"
					>
						<ArrowLeft size={14} /> Volver al Inicio
					</a>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-4xl mx-auto px-4 py-10">
				<div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-sm space-y-8">
					{/* Header Title */}
					<div className="border-b border-gray-100 pb-6">
						<div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-1">
							<ShieldCheck size={18} /> Información Legal
						</div>
						<h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
							Términos y Condiciones de Uso
						</h1>
						<p className="text-xs text-gray-500 mt-2">
							Última actualización: Octubre de 2026
						</p>
					</div>

					{/* Legal Text Sections */}
					<div className="space-y-6 text-sm text-gray-600 leading-relaxed">
						<section className="space-y-2">
							<h2 className="text-base font-bold text-gray-900">
								1. Naturaleza del Servicio
							</h2>
							<p>
								MenuWapp es una herramienta de infraestructura digital diseñada
								para facilitar la creación de catálogos interactivos y actuar
								como puente de comunicación para el armado y envío de pedidos a
								través de WhatsApp. MenuWapp no actúa como intermediario
								comercial, no procesa pagos en línea ni interviene en las
								transacciones comerciales entre los comercios y sus clientes
								finales.
							</p>
						</section>

						<section className="space-y-2">
							<h2 className="text-base font-bold text-gray-900">
								2. Alcance Territorial y Gratuidad
							</h2>
							<p>
								El uso de la plataforma está destinado exclusivamente a
								emprendedores, comercios y usuarios dentro del territorio de la
								República Argentina. El acceso y uso de las funcionalidades
								principales de la plataforma es actualmente de carácter
								gratuito. La administración se reserva el derecho de modificar
								sus esquemas o planes de servicio en el futuro, notificando
								previamente a los usuarios.
							</p>
						</section>

						<section className="space-y-2">
							<h2 className="text-base font-bold text-gray-900">
								3. Protección de Datos y Privacidad
							</h2>
							<p>
								MenuWapp aplica estándares de seguridad para proteger la
								información almacenada en la base de datos. Los datos personales
								provistos por comerciantes y clientes se utilizan únicamente
								para posibilitar el correcto funcionamiento del catálogo y el
								envío del pedido, en conformidad con lo establecido por la Ley
								N.º 25.326 de Protección de Datos Personales de la República
								Argentina. MenuWapp no vende, alquila ni comparte datos
								personales con terceros.
							</p>
						</section>

						<section className="space-y-2">
							<h2 className="text-base font-bold text-gray-900">
								4. Limitación de Responsabilidad
							</h2>
							<ul className="list-disc pl-5 space-y-1.5">
								<li>
									<strong>Uso &quot;Tal Cual&quot;:</strong> La plataforma se
									proporciona &quot;tal cual&quot; y &quot;según
									disponibilidad&quot;. MenuWapp no se hace responsable por
									caídas temporales del servicio, interrupciones de redes de
									terceros (incluyendo WhatsApp, proveedores de hosting o bases
									de datos) ni por pérdidas accidentales de información.
								</li>
								<li>
									<strong>Operaciones Comerciales:</strong> MenuWapp no asume
									responsabilidad alguna respecto a la calidad de los productos,
									la precisión del stock, el cobro, la entrega o cualquier
									disputa que surja entre comerciantes y compradores. Toda
									transacción es responsabilidad exclusiva de las partes
									involucradas.
								</li>
								<li>
									<strong>Pérdidas o Lucro Cesante:</strong> Bajo ninguna
									circunstancia MenuWapp ni sus desarrolladores serán
									responsables por daños directos, indirectos o lucro cesante
									derivados del uso o de la imposibilidad de uso de la
									herramienta.
								</li>
							</ul>
						</section>

						<section className="space-y-2">
							<h2 className="text-base font-bold text-gray-900">
								5. Propiedad Intelectual
							</h2>
							<p>
								Todos los derechos de propiedad intelectual relativos a la marca
								MenuWapp, sus logos, diseño de interfaz y código fuente
								pertenecen a sus respectivos autores. &copy; 2026 MenuWapp.
								Todos los derechos reservados.
							</p>
						</section>
					</div>

					{/* Footer inside card */}
					<div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-2">
						<p>&copy; 2026 MenuWapp. Todos los derechos reservados.</p>
						<a
							href="/"
							className="text-emerald-600 font-semibold hover:underline"
						>
							Volver a la plataforma
						</a>
					</div>
				</div>
			</main>
		</div>
	);
};
