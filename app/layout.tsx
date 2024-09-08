"use client";
import { LayoutProvider } from "../layout/context/layoutcontext";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "../styles/layout/layout.scss";
import "../styles/demo/Demos.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { nextLocalStorage } from "./utils/commonFuns";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    const tokenExpire = localStorage.getItem("token");
    if (tokenExpire) {
      const decoded: any = jwtDecode(tokenExpire);
      const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds

      if (decoded.exp < currentTime) {
        // Token has expired, redirect to login page
        nextLocalStorage()?.removeItem("token");
        nextLocalStorage()?.removeItem("id");
        nextLocalStorage()?.removeItem("auth_token");
        router.push("/login");
      }
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          id="theme-css"
          href={`/themes/lara-light-indigo/theme.css`}
          rel="stylesheet"
        ></link>
      </head>
      <body>
        <PrimeReactProvider>
          <ToastContainer
            autoClose={3000}
            progressClassName="custom-progress-bar"
          />
          <LayoutProvider>{children}</LayoutProvider>
        </PrimeReactProvider>
      </body>
    </html>
  );
}
