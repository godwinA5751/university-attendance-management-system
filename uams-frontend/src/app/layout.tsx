import { NotificationProvider } from "@/context/NotificationContext";
import "./global.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
          <NotificationProvider>
            {children}
          </NotificationProvider>
      </body>
    </html>
  );
}