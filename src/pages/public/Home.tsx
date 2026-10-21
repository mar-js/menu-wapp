import { ArrowRight, DollarSign, Smartphone, Store, Zap } from "lucide-react";
import type { JSX } from "react/jsx-runtime";
import { Link } from "wouter";

export const Home = (): JSX.Element => {
	return (
		<div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
			{/* Header / Navbar */}
			<header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
				<div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/20">
							<Store size={20} />
						</div>
						<span className="font-extrabold text-xl tracking-tight text-slate-900">
							Menu<span className="text-emerald-600">Wapp</span>
						</span>
					</div>

					<div className="flex items-center gap-3">
						<Link
							href="/admin/login"
							className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors"
						>
							Iniciar sesión
						</Link>
						<Link
							href="/admin/login"
							className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md"
						>
							Crear Menú Gratis
						</Link>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
				<div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/60 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-6">
					<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
					Pensado para gastronomía y comercios de Argentina
				</div>

				<h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
					Tu menú digital con QR y <br className="hidden sm:inline" />
					<span className="text-emerald-600">
						pedidos directo a tu WhatsApp
					</span>
				</h1>

				<p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
					Olvidate de los PDFs pesados que nadie lee y de pagar comisiones
					altísimas a las apps de envíos. Creá tu carta interactiva en 5 minutos
					y recibí pedidos organizados al instante.
				</p>

				<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
					<Link
						href="/admin/login"
						className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 group"
					>
						<span>Probar Gratis Ahora</span>
						<ArrowRight
							size={18}
							className="group-hover:translate-x-1 transition-transform"
						/>
					</Link>
					<a
						href="#como-funciona"
						className="w-full sm:w-auto bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-sm px-6 py-3.5 rounded-2xl transition-colors"
					>
						Ver cómo funciona
					</a>
				</div>
			</section>

			{/* Beneficios Clave */}
			<section className="bg-white border-y border-slate-200/80 py-16">
				<div className="max-w-6xl mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
							<div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
								<DollarSign size={24} />
							</div>
							<h3 className="font-bold text-lg text-slate-900 mb-2">
								0% Comisiones por venta
							</h3>
							<p className="text-sm text-slate-600 leading-relaxed">
								El dinero de tus ventas va directamente a tu cuenta o caja. No
								nos quedamos con ningún porcentaje de tus pedidos.
							</p>
						</div>

						<div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
							<div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
								<Zap size={24} />
							</div>
							<h3 className="font-bold text-lg text-slate-900 mb-2">
								Sin descargas para el cliente
							</h3>
							<p className="text-sm text-slate-600 leading-relaxed">
								Tus clientes escanean el QR desde la mesa o abren el link desde
								Instagram y eligen al instante sin instalar nada.
							</p>
						</div>

						<div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
							<div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
								<Smartphone size={24} />
							</div>
							<h3 className="font-bold text-lg text-slate-900 mb-2">
								Pedidos limpios y estructurados
							</h3>
							<p className="text-sm text-slate-600 leading-relaxed">
								Recibí por WhatsApp el detalle exacto: productos, cantidades,
								aclaraciones, dirección de envío y total calculado.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Cómo Funciona */}
			<section id="como-funciona" className="py-20 max-w-5xl mx-auto px-4">
				<div className="text-center mb-14">
					<h2 className="text-3xl font-extrabold text-slate-900">
						¿Cómo funciona MenuWapp?
					</h2>
					<p className="text-slate-600 text-sm mt-2">
						En solo 3 pasos tenés tu local vendiendo online
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
					<div className="text-center">
						<div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">
							1
						</div>
						<h4 className="font-bold text-slate-900 mb-1">Cargá tu menú</h4>
						<p className="text-xs text-slate-600">
							Subí tus productos, categorías y precios desde tu celular o
							computadora.
						</p>
					</div>

					<div className="text-center">
						<div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">
							2
						</div>
						<h4 className="font-bold text-slate-900 mb-1">
							Obtené tu QR y Link
						</h4>
						<p className="text-xs text-slate-600">
							Imprimí el QR para las mesas o compartí tu link exclusivo en el
							perfil de Instagram.
						</p>
					</div>

					<div className="text-center">
						<div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">
							3
						</div>
						<h4 className="font-bold text-slate-900 mb-1">Recibí pedidos</h4>
						<p className="text-xs text-slate-600">
							Tus clientes arman el carrito y te llega la orden lista para
							preparar por WhatsApp.
						</p>
					</div>
				</div>
			</section>

			{/* CTA Final */}
			<section className="max-w-4xl mx-auto px-4 pb-20">
				<div className="bg-emerald-600 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden">
					<h2 className="text-2xl sm:text-4xl font-black mb-4">
						Empezá a modernizar tu local hoy mismo
					</h2>
					<p className="text-emerald-100 text-sm sm:text-base max-w-lg mx-auto mb-8">
						Creá tu cuenta gratis, cargá tu menú de prueba en 5 minutos y
						comproba lo fácil que es recibir pedidos.
					</p>
					<Link
						href="/admin/login"
						className="bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-md transition-all inline-block"
					>
						Crear mi menú en MenuWapp
					</Link>
				</div>
			</section>

			{/* Footer Simple */}
			<footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
				<p>
					© {new Date().getFullYear()} MenuWapp. Hecho para potenciar los
					comercios locales.
				</p>
			</footer>
		</div>
	);
};
