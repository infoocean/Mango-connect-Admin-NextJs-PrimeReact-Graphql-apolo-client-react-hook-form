/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutContext } from "../../../layout/context/layoutcontext";
import { classNames } from "primereact/utils";
import AppTopbar from "@/layout/AppTopbar";
import VerificationForm from "@/demo/components/VerificationForm";
import client from "@/app/api/lib/apollo-client";
import { FORGOT_PASSWORD, VERIFY_OTP } from "@/app/api/lib/graphql_mutation";
import { ApolloError } from "@apollo/client";
import { toast } from "react-toastify";
import { nextLocalStorage } from "@/app/utils/commonFuns";

interface ScreenLockData {
  verificationCode: string;
  verificationCode1: string;
  verificationCode2: string;
  verificationCode3: string;
  verificationCode4: string;
}
interface CancelEventData {
  // Define any properties you may want to pass when canceling the form
}

const Verification = () => {
  const { layoutConfig } = useContext(LayoutContext);
  const router = useRouter();
  const getEmail = nextLocalStorage()?.getItem("email");
  const getPath = nextLocalStorage()?.getItem("path");
  const containerClassName = classNames(
    "surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden",
    { "p-input-filled": layoutConfig.inputStyle === "filled" }
  );

  const handleCancel = (data: CancelEventData) => {
    // Handle cancel logic
  };

  const handleVerifyCode = async (data: ScreenLockData) => {
    const codeOne = data && data.verificationCode1;
    const codeTwo = data && data.verificationCode2;
    const codeThree = data && data.verificationCode3;
    const codeFour = data && data.verificationCode4;
    const verificationCode = `${codeOne || ""}${codeTwo || ""}${
      codeThree || ""
    }${codeFour || ""}`;
    try {
      const data = await client.mutate({
        mutation: VERIFY_OTP,
        variables: {
          email: getEmail,
          otp: parseInt(verificationCode),
        },
      });
      if (data && data?.data && data?.data?.verifyOtp) {
        if (getPath && getPath === "signup") {
          toast.success("Account successfully verified.");
          router.push("/login");
        } else {
          nextLocalStorage()?.setItem(
            "resettoken",
            data?.data?.verifyOtp?.token
          );
          router.push("/reset_password");
        }
      } else {
        console.log("@", data);
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        const errorMessage = error.message; // Extract the error message
        toast.error(errorMessage);
      } else {
        // Handle other types of errors
        console.error("Unexpected Error:", error);
      }
    }
  };
  const handle_resend_otp = async () => {
    const email = getEmail && getEmail;
    try {
      const data = await client.mutate({
        mutation: FORGOT_PASSWORD,
        variables: {
          userEmail: email,
        },
      });
      if (data && data?.data && data?.data?.forgotPassword) {
        toast.success(
          "A verification code has been sent to your email address."
        );
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
    }
  };

  const verificationFields = [
    { label: "", type: "text", name: "verificationCode1", maxLength: 1 },
    { label: "", type: "text", name: "verificationCode2", maxLength: 1 },
    { label: "", type: "text", name: "verificationCode3", maxLength: 1 },
    { label: "", type: "text", name: "verificationCode4", maxLength: 1 },
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
            <VerificationForm
              title="Verification"
              subTitle="We have sent code to you email"
              buttonText="Verify"
              onCancel={handleCancel}
              onSubmit={handleVerifyCode}
              fields={verificationFields}
            />

            <br />
            <div>
              <div className="flex align-items-right mb-2 ">
                <div
                  className="font-medium no-underline ml-2 text-right cursor-pointer"
                  style={{ color: "var(--primary-color)" }}
                  onClick={handle_resend_otp}
                >
                  resend otp?
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;
