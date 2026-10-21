import type { JSX } from "react/jsx-runtime";
import { Route, Router, Switch } from "wouter";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";
import { Dashboard } from "./pages/admin/Dashboard";
import { Login } from "./pages/admin/Login";
import { Home } from "./pages/public/Home";
import { Menu } from "./pages/public/Menu";

export const App = (): JSX.Element => {
	return (
		<Router>
			<Switch>
				{/* Rutas Públicas Libre Acceso */}
				<Route path="/" component={Home} />
				<Route path="/admin/login" component={Login} />
				{/* Ruta Protegida: Blindada contra usuarios no autenticados */}
				<Route path="/admin">
					{() => <ProtectedRoute component={Dashboard} />}
				</Route>
				{/* Ruta Pública del Menú por Slug (al final para no colisionar con /admin) */}
				<Route path="/:slug" component={Menu} />{" "}
			</Switch>
		</Router>
	);
};
