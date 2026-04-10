import "./globals.css";

export const metadata = {
  title: "Desk — AI Helpdesk",
  description: "AI-powered support helpdesk",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
