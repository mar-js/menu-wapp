import { lazy, Suspense } from "react";
import type { JSX } from "react/jsx-runtime";
import { Route, Router, Switch } from "wouter";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";

// Carga perezosa (Lazy loading) de las páginas
const Home = lazy(() =>
	import("./pages/public/Home").then((m) => ({ default: m.Home })),
);
const Terms = lazy(() =>
	import("./pages/public/Terms").then((m) => ({ default: m.Terms })),
);
const Login = lazy(() =>
	import("./pages/admin/Login").then((m) => ({ default: m.Login })),
);
const Dashboard = lazy(() =>
	import("./pages/admin/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const Menu = lazy(() =>
	import("./pages/public/Menu").then((m) => ({ default: m.Menu })),
);

export const App = (): JSX.Element => {
	return (
		<Router>
			<Suspense
				fallback={
					<div className="min-h-screen flex items-center justify-center bg-slate-50">
						<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
					</div>
				}
			>
				<Switch>
					{/* Rutas Públicas Libre Acceso */}
					<Route path="/" component={Home} />
					<Route path="/terms" component={Terms} />
					<Route path="/admin/login" component={Login} />

					{/* Ruta Protegida: Blindada contra usuarios no autenticados */}
					<Route path="/admin">
						{() => <ProtectedRoute component={Dashboard} />}
					</Route>

					{/* Ruta Pública del Menú por Slug (al final para no colisionar con /admin) */}
					<Route path="/:slug" component={Menu} />
				</Switch>
			</Suspense>
		</Router>
	);
};
