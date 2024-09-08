"use client";
import React, { useContext, useEffect, useState } from "react";
import { LayoutContext } from "../../../layout/context/layoutcontext";
import { classNames } from "primereact/utils";
import AppTopbar from "@/layout/AppTopbar";
import { useSearchParams } from "next/navigation";
import Spinner from "@/app/(main)/Comman/spinner/page";
import {
  CREATE_AUTH_CODE,
  CREATE_GOOGLE_AUTH_CREDENTIALS,
} from "@/app/api/lib/graphql_mutation";
import client from "@/app/api/lib/apollo-client";
import { ApolloError } from "@apollo/client";
import { toast } from "react-toastify";
import { Card } from "primereact/card";
import Image from "next/image";

const MeetSuccess = () => {
  const searchParams = useSearchParams();
  const { layoutConfig } = useContext(LayoutContext);
  const [loader, setLoader] = useState(false);
  const containerClassName = classNames(
    "surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden",
    { "p-input-filled": layoutConfig.inputStyle === "filled" }
  );

  useEffect(() => {
    setLoader(true);
    const code = searchParams.get("code");
    sendCodeToApi(code);
  }, []);

  const sendCodeToApi = async (code: any) => {
    setLoader(true);
    try {
      const response: any = await client.mutate({
        mutation: CREATE_AUTH_CODE,
        variables: {
          authCode: {
            code: code,
          },
        },
      });
      if (response && response) {
        setLoader(false);
        setTimeout(() => {
          window.location.replace(
            `${process.env.NEXT_PUBLIC_BASE_URL}/admin/configuration/integrations`
          );
        }, 3000);
      } else {
        console.log("@");
        window.location.replace(
          `${process.env.NEXT_PUBLIC_BASE_URL}/meet_failure`
        );
        setLoader(false);
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        const errorMessage = error.message;
        window.location.replace(
          `${process.env.NEXT_PUBLIC_BASE_URL}/meet_failure`
        );
        toast.error(errorMessage);
        setLoader(false);
      } else {
        setLoader(false);
        window.location.replace(
          `${process.env.NEXT_PUBLIC_BASE_URL}/meet_failure`
        );
        console.error("Unexpected Error:", error);
      }
    }
  };
  return (
    <div className={containerClassName}>
      <AppTopbar />
      <div className="flex flex-column align-items-center justify-content-center success">
        <div className="successdiv">
          <div className="">
            <div className="card1" style={{ padding: "10rem !important" }}>
              <div className="datatable-editing-demo">
                <div className="wrapperclass">
                  <div className="backbtn"></div>
                </div>
                <div className="instructionsdiv">
                  {loader ? (
                    <>
                      <div className="spinnerclass">
                        <Spinner />
                      </div>
                      <p>Please wait...</p>
                    </>
                  ) : (
                    <div className="main1">
                      <Card title="" className="mainaaa">
                        <div className="mainchild1">
                          <Image
                            src="/layout/images/checkmark.png"
                            alt="success"
                            width={70}
                            height={70}
                            className="tickImage"
                          />
                        </div>
                        <div className="seconddiv">
                          <p className="m-0 successfulauth">
                            Authorization Successful
                          </p>
                          <br />
                          <p>Please wait to be redirected in a few seconds.</p>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetSuccess;
