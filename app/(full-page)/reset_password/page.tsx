/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutContext } from "../../../layout/context/layoutcontext";
import { classNames } from "primereact/utils";
import AuthForm from "@/demo/components/AuthForm";
import AppTopbar from "@/layout/AppTopbar";
import client from "@/app/api/lib/apollo-client";
import { RESET_PASSWORD } from "@/app/api/lib/graphql_mutation";
import { ApolloError } from "@apollo/client";
import { toast } from "react-toastify";
import { nextLocalStorage } from "@/app/utils/commonFuns";

interface ResetPasswordData {
  password: string;
  repeatPassword: String;
}
interface CancelEventData {
  // Define any properties you may want to pass when canceling the form
}

const ResetPassword = () => {
  const { layoutConfig } = useContext(LayoutContext);
  const resettoken = nextLocalStorage()?.getItem("resettoken");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const containerClassName = classNames(
    "surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden",
    { "p-input-filled": layoutConfig.inputStyle === "filled" }
  );
  const handleCancel = (data: CancelEventData) => {
    // Handle cancel logic
  };

  const handleSetNewPassword = async (info: ResetPasswordData) => {
    if (info.password !== info.repeatPassword) {
      // Passwords don't match, display validation message
      return toast.error("Passwords doesn't match");
    }

    try {
      setLoading(true);
      const data = await client.mutate({
        mutation: RESET_PASSWORD,
        variables: {
          token: resettoken && resettoken,
          password: info.password,
        },
      });
      if (data && data?.data && data?.data?.resetpasssword) {
        toast.success("Password Change successfully");
        router.push("/login");
      } else {
        console.log("@#", data);
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        const errorMessage = error.message; // Extract the error message
        toast.error(errorMessage);
      } else {
        // Handle other types of errors
        console.error("Unexpected Error:", error);
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const newPasswordFields = [
    {
      label: "Password",
      type: "password",
      name: "password",
      passwordField: true,
    },
    {
      label: "Repeat Password",
      type: "password",
      name: "repeatPassword",
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
              title="New Password"
              subTitle="Enter your new password"
              buttonText="Submit"
              onCancel={handleCancel}
              onSubmit={handleSetNewPassword}
              fields={newPasswordFields}
              loading={loading} // Pass loading state to AuthForm
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
