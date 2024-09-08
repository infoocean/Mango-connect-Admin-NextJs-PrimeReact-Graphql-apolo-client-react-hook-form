/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useContext, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutContext } from "../../../layout/context/layoutcontext";
import { toast } from "react-toastify";
import { classNames } from "primereact/utils";
import AuthForm from "@/demo/components/AuthForm";
import AppTopbar from "@/layout/AppTopbar";
import { FORGOT_PASSWORD } from "@/app/api/lib/graphql_mutation";
import client from "@/app/api/lib/apollo-client";
import { ApolloError } from "@apollo/client";
import { nextLocalStorage } from "@/app/utils/commonFuns";

interface ResetPassword {
  email: string;
}
interface CancelEventData {
  // Define any properties you may want to pass when canceling the form
}

const ForgotPassword = () => {
  const { layoutConfig } = useContext(LayoutContext);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const containerClassName = classNames(
    "surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden",
    { "p-input-filled": layoutConfig.inputStyle === "filled" }
  );

  const handleCancel = (data: CancelEventData) => {
    // Handle cancel logic
  };

  const handleResetPassword = async (info: ResetPassword) => {
    try {
      setLoading(true);
      const data = await client.mutate({
        mutation: FORGOT_PASSWORD,
        variables: {
          userEmail: info.email,
        },
      });
      if (data && data?.data && data?.data?.forgotPassword) {
        toast.success(
          "A verification code has been sent to your email address."
        );
        nextLocalStorage()?.setItem("email", info.email);
        router.push("/verification");
      } else {
        console.log("@");
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

  const forgotPasswordFields = [
    { label: "Email", type: "email", name: "email" },
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
            marginTop: "11%",
          }}
        >
          <div
            className="w-full surface-card py-8 px-5 sm:px-8"
            style={{ borderRadius: "53px" }}
          >
            <AuthForm
              title="Forgot Password"
              subTitle="Enter your email to reset your password"
              onCancel={handleCancel}
              onSubmit={handleResetPassword}
              fields={forgotPasswordFields}
              buttonText={"Submit"}
              loading={loading} // Pass loading state to AuthForm
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
