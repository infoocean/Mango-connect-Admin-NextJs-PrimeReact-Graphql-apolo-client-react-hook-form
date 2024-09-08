/* eslint-disable @next/next/no-img-element */
"use client";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { LayoutContext } from "../../../layout/context/layoutcontext";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import AuthForm from "@/demo/components/AuthForm";
import AppTopbar from "@/layout/AppTopbar";
import Link from "next/link";
import client from "@/app/api/lib/apollo-client";
import { CREATE_USER, FORGOT_PASSWORD } from "@/app/api/lib/graphql_mutation";
import { ApolloError } from "@apollo/client";
import { toast } from "react-toastify";
import { nextLocalStorage } from "@/app/utils/commonFuns";

interface RegisterData {
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  password: string;
  role_id: number;
}

interface CancelEventData {
  // Define any properties you may want to pass when canceling the form
}

const Signup = () => {
  const [password, setPassword] = useState("");
  const [checked, setChecked] = useState(false);
  const { layoutConfig } = useContext(LayoutContext);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const containerClassName = classNames(
    "surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden",
    { "p-input-filled": layoutConfig.inputStyle === "filled" }
  );
  const handleRegister = async (info: RegisterData) => {
    try {
      setLoading(true);
      const data = await client.mutate({
        mutation: CREATE_USER,
        variables: {
          first_name: info.firstname,
          last_name: info.lastname,
          email: info.email,
          phone: info.phone.replace(/-/g, ""),
          password: info.password,
          role_id: 1,
        },
      });
      if (data && data?.data && data?.data?.createUser) {
        toast.success(
          "Account details saved. Please verify your email with the OTP sent."
        );
        nextLocalStorage()?.setItem("email", info.email);
        nextLocalStorage()?.setItem("path", "signup");
        router.push("/verification");
      } else {
        console.log("@");
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        const errorMessage = error.message; // Extract the error message
        toast.error("All field are required !");
      } else {
        // Handle other types of errors
        console.error("Unexpected Error:", error);
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleCancel = (data: CancelEventData) => {
    // Handle cancel logic
  };

  const handleChange = (e: { checked: boolean }) => {
    setChecked(e.checked);
  };

  const registerFields = [
    { label: "First Name", type: "text", name: "firstname" },
    { label: "Last Name", type: "text", name: "lastname" },
    { label: "Email", type: "email", name: "email" },
    { label: "Phone Number", type: "text", name: "phone", digit: true },
    {
      label: "Password",
      type: passwordVisible ? "text" : "password",
      name: "password",
      passwordField: true,
    },
  ];

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
              title="Register"
              subTitle="Let's get started"
              buttonText="Sign Up"
              onSubmit={handleRegister}
              fields={registerFields}
              onCancel={handleCancel}
              loading={loading} // Pass loading state to AuthForm
            />
            <br />
            <br />
            <div>
              <div className="flex align-items-center mb-2 ">
                <div className="flex align-items-center">
                  <label htmlFor="rememberme1">Already have an account?</label>
                </div>
                <Link
                  href="/login"
                  className="font-medium no-underline ml-2 text-right cursor-pointer"
                  style={{ color: "var(--primary-color)" }}
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
