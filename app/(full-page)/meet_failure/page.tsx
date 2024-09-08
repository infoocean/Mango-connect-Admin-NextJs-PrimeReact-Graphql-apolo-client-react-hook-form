"use client";
import React, { useContext, useEffect, useState } from "react";
import { LayoutContext } from "../../../layout/context/layoutcontext";
import { classNames } from "primereact/utils";
import AppTopbar from "@/layout/AppTopbar";
import { Card } from "primereact/card";
import Image from "next/image";

const MeetFailure = () => {
  const { layoutConfig } = useContext(LayoutContext);
  const containerClassName = classNames(
    "surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden",
    { "p-input-filled": layoutConfig.inputStyle === "filled" }
  );
  useEffect(() => {
    setTimeout(() => {
      window.location.replace(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/configuration/integrations`
      );
    }, 3000);
  }, []);
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
                  <div className="main1">
                    <Card title="" className="mainaaa">
                      <div className="mainchild1">
                        <Image
                          src="/layout/images/warning.png"
                          alt="success"
                          width={70}
                          height={70}
                          className="tickImage"
                        />
                      </div>
                      <div className="seconddiv">
                        <p className="m-0 FailureErr">
                          Oops, something went wrong
                        </p>
                        <br />
                        <p className="failureCss">
                          Please wait to be redirected in a few seconds.
                        </p>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetFailure;
