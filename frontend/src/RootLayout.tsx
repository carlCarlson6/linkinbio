import { Outlet } from "@tanstack/react-router";
import { Header } from "./infrastructure/components/Header";

export default function RootLayout() {
  return (
    <>
      <Header />
      <div style={{ padding: '0 32px' }}>
        <Outlet />
      </div>
    </>
  );
}