import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { redirect } from "next/navigation";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "ETE Movil",
  description: "Gestión de clientes y facturas",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ETE Movil",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let isTecnico = false;

  // Global Session Validation
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (session) {
    try {
      const sessionData = JSON.parse(session.value);

      // If we have a session, verify token_version matches DB
      if (sessionData.userId && sessionData.token_version) {
        const res = await query('SELECT token_version FROM usuarios WHERE id = $1', [sessionData.userId]);
        if (res.rows.length > 0) {
          const currentVersion = res.rows[0].token_version || 1;
          if (currentVersion !== sessionData.token_version) {
            // Token invalid (global logout happened)
            // Redirect to logout api to clear cookie, then login
            // Since we can't easily clear cookie in Server Component, we redirect to login
            // The middleware or client side will handle the stale cookie eventually, 
            // but for now, we just redirect. A better approach is to rely on middleware 
            // but middleware can't check DB. 
            // Let's redirect to a special route that clears cookie? 
            // Simplified: Just redirect to login. The user will be forced to login again, 
            // which overwrites the cookie.
            // Ideally we should clear the cookie here, but Server Components are read-only for cookies mostly.
            // We'll rely on the fact that if they try to access protected data, API will fail? 
            // Actually, API routes SHOULD also check token_version.
            // For now, let's just do nothing here to avoid redirect loops if not handled perfectly,
            // OR implement API middleware validation.
            // Wait, the USER REQUESTED: "when I logout in one place, all sessions should close".
            // So if I am here and version mismatch -> I should be treated as logged out.
            // I will start by just redirecting to /login, effectively logging them out visually.
            redirect('/login');
          }
        }
      }

      const roleText = String(sessionData.rol || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

      if (sessionData.isTecnico || roleText.includes('tecnico')) {
        isTecnico = true;
      } else if (sessionData.userId) {
        const tecnicoRes = await query(
          `SELECT
            (SELECT r.nombre_rol
             FROM usuarios_roles ur
             JOIN roles r ON r.id = ur.rol_id
             WHERE ur.usuario_id = $1
               AND ur.activo = true
               AND r.activo = true
             ORDER BY r.prioridad DESC, ur.fecha_asignacion DESC
             LIMIT 1) AS nombre_rol,
            (
              EXISTS (
                SELECT 1
                FROM usuarios_roles ur
                JOIN roles r ON r.id = ur.rol_id
                WHERE ur.usuario_id = $1
                  AND ur.activo = true
                  AND r.activo = true
                  AND lower(translate(r.nombre_rol, 'áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙ', 'aeiouAEIOUaeiouAEIOU')) LIKE '%tecnico%'
              )
              OR EXISTS (
                SELECT 1
                FROM usuarios_permisos up
                JOIN permisos p ON p.id = up.permiso_id
                WHERE up.usuario_id = $1
                  AND up.activo = true
                  AND p.activo = true
                  AND lower(translate(p.nombre_permiso, 'áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙ', 'aeiouAEIOUaeiouAEIOU')) LIKE '%tecnico%'
              )
            ) AS is_tecnico`,
          [sessionData.userId]
        );

        const roleFromDb = String(tecnicoRes.rows[0]?.nombre_rol || '');
        isTecnico = Boolean(tecnicoRes.rows[0]?.is_tecnico) ||
          roleFromDb.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes('tecnico');
      }
    } catch (e) {
      // Ignore json parse errors
    }
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen pb-24`} suppressHydrationWarning>
        <main className="max-w-lg mx-auto px-4 pt-8">
          {children}
        </main>
        <Navbar isTecnico={isTecnico} />
      </body>
    </html>
  );
}
