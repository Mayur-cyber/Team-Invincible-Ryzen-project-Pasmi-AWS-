import { Outlet, ScrollRestoration } from "react-router-dom";
import { Toaster } from "sonner";
import { UserProvider } from "../contexts/UserContext";

export default function Root() {
  return (
    <UserProvider>
      <Outlet />
      <ScrollRestoration />
      <Toaster position="top-right" />
    </UserProvider>
  );
}