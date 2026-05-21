import "./globals.css";
import Sidebar from "./components/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
          <Sidebar />
          <div className="flex-1 overflow-x-hidden">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}