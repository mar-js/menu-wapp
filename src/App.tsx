import type { JSX } from "react/jsx-runtime";
import { Route, Router, Switch } from "wouter";
import { Dashboard } from "./pages/admin/Dashboard";
import { Login } from "./pages/admin/Login";
import { Home } from "./pages/public/Home";
import { Menu } from "./pages/public/Menu";

export const App = (): JSX.Element => {
	return (
		<Router>
			<Switch>
				{/* Landing Page Principal */}
				<Route path="/" component={Home} />

				{/* Rutas de Administración */}
				<Route path="/admin" component={Dashboard} />
				<Route path="/admin/login" component={Login} />

				{/* Ruta Pública del Menú por Slug */}
				<Route path="/:slug" component={Menu} />
			</Switch>
		</Router>
	);
};
