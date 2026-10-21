import { useEffect, useState } from "react";
import type { JSX } from "react/jsx-runtime";
import { useLocation } from "wouter";
import type { IProtectedRoute } from "../../interfaces";
import { supabase } from "../../lib/supabase";

export const ProtectedRoute = ({
	component: Component,
}: IProtectedRoute): JSX.Element => {
	const [, setLocation] = useLocation();
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

	useEffect(() => {
		// 1. Verificar sesión actual en Supabase
		const checkAuth = async (): Promise<void> => {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				setIsAuthenticated(false);
				setLocation("/admin/login");
			} else {
				setIsAuthenticated(true);
			}
		};

		checkAuth();

		// 2. Escuchar cambios de estado en la autenticación
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (!session) {
				setIsAuthenticated(false);
				setLocation("/admin/login");
			} else {
				setIsAuthenticated(true);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [setLocation]);

	if (isAuthenticated === null) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
			</div>
		);
	}

	return isAuthenticated ? <Component /> : <></>;
};
