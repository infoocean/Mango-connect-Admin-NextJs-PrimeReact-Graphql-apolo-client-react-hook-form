"use client";
import React, { useContext, useEffect, useState } from "react";
import { LayoutContext } from "../../../layout/context/layoutcontext";
import { classNames } from "primereact/utils";
import { toast } from "react-toastify";
import AuthForm from "@/demo/components/AuthForm";
import AppTopbar from "@/layout/AppTopbar";
import Link from "next/link";
import { LOGIN_MUTATION } from "@/app/api/lib/graphql_mutation";
import client from "@/app/api/lib/apollo-client";
import { useRouter } from "next/navigation";
import { ApolloError } from "@apollo/client";
import { jwtDecode } from "jwt-decode";
import { GET_AUTHORIZATION_TOKEN } from "@/app/api/lib/graphql_queries";
import { nextLocalStorage } from "@/app/utils/commonFuns";

interface LoginData {
  email: string;
  password: string;
}
interface CancelEventData {
  // Define any properties you may want to pass when canceling the form
}

const LoginPage = () => {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { layoutConfig } = useContext(LayoutContext);
  const router = useRouter();
  const containerClassName = classNames(
    "surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden",
    { "p-input-filled": layoutConfig.inputStyle === "filled" }
  );

  useEffect(() => {
    const check_auth_token = nextLocalStorage()?.getItem("auth_token");

    if (check_auth_token) {
      const decoded: any = jwtDecode(check_auth_token);
      const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds

      if (decoded.exp < currentTime) {
        // Token has expired, redirect to login page
        nextLocalStorage()?.removeItem("auth_token");
        nextLocalStorage()?.removeItem("token");
        nextLocalStorage()?.removeItem("id");
        nextLocalStorage()?.removeItem("option");

        get_token();
        router.push("/login");
      }
    } else {
      get_token();
    }
    nextLocalStorage()?.removeItem("email");
    nextLocalStorage()?.removeItem("resettoken");
    nextLocalStorage()?.removeItem("path");
  }, []);

  const get_token = async () => {
    const {
      data: {
        generateAuthorizationToken: { token },
      },
    } = await client.query({
      query: GET_AUTHORIZATION_TOKEN,
    });
    if (token) {
      nextLocalStorage()?.setItem("auth_token", token);
    }
  };
  const handleLogin = async (info: LoginData) => {
    try {
      setLoading(true);
      const data = await client.mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          email: info.email,
          password: info.password,
        },
      });
      if (data && data.data.login) {
        nextLocalStorage()?.setItem("token", data.data.login.token);
        const decoded: any = jwtDecode(data.data.login.token);
        nextLocalStorage()?.setItem("id", decoded.id);
        toast.success("Login successfully");
        router.push("/admin/dashboard");
      } else {
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        const errorMessage = error.message; // Extract the error message
        toast.error("Email and Password are invalid!");
      } else {
        // Handle other types of errors
        console.error("Unexpected Error:", error);
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const loginFields = [
    { label: "Email", type: "email", name: "email" },

    {
      label: "Password",
      type: "password",
      name: "password",
      passwordField: true,
    },
  ];

  const handleCancel = (data: CancelEventData) => {
    //cancel the form field value
  };
  const handleChange = (e: { checked: boolean }) => {
    setChecked(e.checked);
  };

  return (
    <div className={containerClassName}>
      <AppTopbar />
      <div className="flex flex-column align-items-center justify-content-center">
        <div
          style={{
            borderRadius: "56px",
            padding: "0.3rem",
            background:
              "linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)",
            marginTop: "25%",
          }}
        >
          <div
            className="w-full surface-card py-8 px-5 sm:px-8"
            style={{ borderRadius: "53px" }}
          >
            <AuthForm
              title="Log in"
              subTitle="Please enter your details"
              buttonText="Login"
              onSubmit={handleLogin}
              fields={loginFields}
              onCancel={handleCancel}
              loading={loading} // Pass loading state to AuthForm
            />
            <br />
            <br />
            <div>
              <div className="flex align-items-center mb-2 ">
                <div className="flex align-items-center">
                  <label htmlFor="rememberme1">Don’t have an account?</label>
                </div>
                <Link
                  href="/signup"
                  className="font-medium no-underline ml-2 text-right cursor-pointer"
                  style={{ color: "var(--primary-color)" }}
                >
                  Sign-up here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
