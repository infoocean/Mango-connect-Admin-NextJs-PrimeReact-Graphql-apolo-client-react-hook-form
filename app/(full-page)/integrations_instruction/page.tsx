"use client";
import React, { useContext, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { classNames } from "primereact/utils";
import AppTopbar from "@/layout/AppTopbar";
import { LayoutContext } from "@/layout/context/layoutcontext";
import { Divider } from "primereact/divider";
import Image from "next/image";

const ForgotPassword = () => {
  const { layoutConfig } = useContext(LayoutContext);
  const router = useRouter();

  const containerClassName = classNames(
    "surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden",
    { "p-input-filled": layoutConfig.inputStyle === "filled" }
  );

  return (
    <div className={containerClassName}>
      <AppTopbar />
      <div className="flex flex-column align-items-center justify-content-center instructioncss">
        <div className="grid instructiongrid" style={{ width: "100%" }}>
          <div className="col-12">
            <div className="card">
              <div className="datatable-editing-demo">
                <div className="wrapperclass">
                  <div className="headingcs">
                    <h4 className="headingtext">
                      Instructions to enabling Google Meet{" "}
                    </h4>
                  </div>
                  <div className="backbtn"></div>
                </div>
                <Divider />
                <div className="instructionsdiv">
                  <br />
                  <p>
                    To connect with Google Meet, you need to first create Google
                    Credentials. You can do that by visiting{" "}
                    <a
                      href="https://console.cloud.google.com/projectselector2/apis/library"
                      className="linkcolor"
                    >
                      Google Developer Console.
                    </a>
                  </p>
                  <Image
                    src="/layout/images/instruction/image-1.png"
                    alt="google-meet"
                    width={70}
                    height={70}
                    className="imageinst"
                  />
                  <br />
                  <div className="div1">
                    <div className="div2">
                      <p className="step">1.</p>
                      <p>
                        From the top left corner, <b>select a project </b>
                        to use for credentials. If you do not have a project
                        created, please follow along. If you have created a
                        project already, please skip to <b>Step 3.</b>
                      </p>
                    </div>
                    <Image
                      src="/layout/images/instruction/image-2.png"
                      alt="google-meet"
                      width={70}
                      height={70}
                      className="imageinst"
                    />
                    <br />
                    <div className="div2">
                      <p className="step">2.</p>
                      <p>
                        Give the project a <b>name</b>, and if applicable,
                        select an <b>organization </b>. After creating it, it
                        will be selected as your project.
                      </p>
                    </div>
                    <Image
                      src="/layout/images/instruction/image-3.png"
                      alt="google-meet"
                      width={70}
                      height={70}
                      className="imageinst"
                    />
                    <br />
                    <div className="div2">
                      <p className="step">3.</p>
                      <p>
                        From the Dashboards, click{" "}
                        <b>Enable APIs and Services.</b>
                      </p>
                    </div>
                    <Image
                      src="/layout/images/instruction/image-4.png"
                      alt="google-meet"
                      width={70}
                      height={70}
                      className="imageinst"
                    />
                    <br />
                    <div className="div2">
                      <p className="step">4.</p>
                      <p>
                        Search for <b>Google Calendar</b> in the search box.
                      </p>
                    </div>{" "}
                    <Image
                      src="/layout/images/instruction/image-5.png"
                      alt="google-meet"
                      width={70}
                      height={70}
                      className="imageinst"
                    />
                    <br />
                    <div className="div2">
                      <p className="step">5.</p>
                      <p>
                        Click <b>Enable</b> to activate Google Calendar API for
                        this project.
                      </p>
                    </div>{" "}
                    <Image
                      src="/layout/images/instruction/image-6.png"
                      alt="google-meet"
                      width={70}
                      height={70}
                      className="imageinst"
                    />
                    <br />
                    <div className="div2">
                      <p className="step">6.</p>
                      <p>
                        Then, from the Google Calendar API dashboard, click on
                        <b> Create Credentials.</b>
                      </p>
                    </div>{" "}
                    <Image
                      src="/layout/images/instruction/image-7.png"
                      alt="google-meet"
                      width={70}
                      height={70}
                      className="imageinst"
                    />
                    <br />
                    <div className="div2">
                      <p className="step">7.</p>
                      <p>
                        From data type, select <b>User data</b>, and then click{" "}
                        <b>Next.</b>
                      </p>
                    </div>
                    <Image
                      src="/layout/images/instruction/image-8.png"
                      alt="google-meet"
                      width={70}
                      height={70}
                      className="imageinst"
                    />
                    <br />
                    <div className="div2">
                      <p className="step">8.</p>
                      <p>
                        In the OAuth Consent Screen section name your app and
                        add your{" "}
                        <b>User support email and Developer Contact email.</b>
                      </p>
                    </div>
                    <Image
                      src="/layout/images/instruction/image-9.png"
                      alt="google-meet"
                      width={70}
                      height={70}
                      className="imageinst"
                    />
                    <br />
                    <div className="div2">
                      <p className="step">9.</p>
                      <p>
                        After that, you can select the OAuth Client ID. Select{" "}
                        <b>Web application</b> as your application type. Then
                        you have to set an <b>Authorized redirect URI.</b>
                      </p>
                    </div>{" "}
                    <Image
                      src="/layout/images/instruction/image-10.png"
                      alt="google-meet"
                      width={70}
                      height={70}
                      className="imageinst"
                    />
                    <br />
                    <div className="div2">
                      <p className="step">10.</p>
                      <p>
                        After creating the credentials, you can then{" "}
                        <b>download the JSON file </b> from the credentials
                        dashboard. Simply click on the download icon to
                        continue.
                      </p>
                    </div>{" "}
                    <Image
                      src="/layout/images/instruction/image-11.png"
                      alt="google-meet"
                      width={70}
                      height={70}
                      className="imageinst"
                    />
                    <br />
                    <div className="div2">
                      <p className="step">11.</p>
                      <p>
                        Lastly, click on the <b>OAuth consent screen tab</b> and
                        then click <b>Publish App</b> to publish this app. Doing
                        this will make sure you can give Tutor LMS and Google
                        permission to use this integration. This is a very
                        important step, without doing this you might get an
                        error so make sure to do this step.
                      </p>
                    </div>{" "}
                    <Image
                      src="/layout/images/instruction/image-12.png"
                      alt="google-meet"
                      width={70}
                      height={70}
                      className="imageinst"
                    />
                    <br />
                    <div className="div2">
                      <p className="step">12.</p>
                      <p>
                        As soon as the app is published, we need the{" "}
                        <b>API key</b>, so you can click on credentials on the
                        left menu and then click on <b>create credentials</b> at
                        the top of the credential slide.
                      </p>
                    </div>{" "}
                    <Image
                      src="/layout/images/instruction/image-16.png"
                      alt="google-meet"
                      width={70}
                      height={70}
                      className="imageinst"
                    />
                    <br />
                    <div className="div2">
                      <p className="step">13.</p>
                      <p>
                        Upon clicking the button <b>create credentials</b>, a
                        dropdown appears and you can select the <b>API key</b>{" "}
                        option. It takes 5-10 seconds for the API key to be
                        generated.
                      </p>
                    </div>{" "}
                    <Image
                      src="/layout/images/instruction/image-17.png"
                      alt="google-meet"
                      width={70}
                      height={70}
                      className="imageinst"
                    />
                    <br />
                    <br />
                    <p>
                      For the next step, we need the Calendar Api key after
                      creating the credentials and publishing the app. To get
                      the Calendar API key, you can do that by visiting{" "}
                      <a
                        href="https://calendar.google.com/calendar/u/0/r"
                        className="linkcolor"
                      >
                        Google Calender.
                      </a>
                    </p>
                    <br />
                    <br />
                    {/* <div className="div2">
                      <p className="step">14.</p>
                      <p>
                        Lastly, click on the <b>OAuth consent screen tab</b> and
                        then click <b>Publish App</b> to publish this app. Doing
                        this will make sure you can give Tutor LMS and Google
                        permission to use this integration. This is a very
                        important step, without doing this you might get an
                        error so make sure to do this step.
                      </p>
                    </div>{" "}
                    <Image
                      src="/layout/images/instruction/image-12.png"
                      alt="google-meet"
                      width={70}
                      height={70}
                      className="imageinst"
                    />
                    <br /> */}
                    <div className="div2">
                      <p className="step">14.</p>
                      <p>
                        We can now view some of existing calendars or you can
                        create your own by clicking the plus (+) icon.
                      </p>
                    </div>{" "}
                    <Image
                      src="/layout/images/instruction/image-13.png"
                      alt="google-meet"
                      width={70}
                      height={70}
                      className="imageinst"
                    />
                    <br />
                    <div className="div2">
                      <p className="step">15.</p>
                      <p>
                        The popup will open once you click the <b>three dots</b>
                        , now select <b>'settings and sharing'</b>
                      </p>
                    </div>{" "}
                    <Image
                      src="/layout/images/instruction/image-14.png"
                      alt="google-meet"
                      width={70}
                      height={70}
                      className="imageinst"
                    />
                    <br />
                    <div className="div2">
                      <p className="step">16.</p>
                      <p>
                        You can view your calender ID after opening the
                        settings, and you can also view the other calenders on
                        the left menu so you can select any calender.
                      </p>
                    </div>{" "}
                    <Image
                      src="/layout/images/instruction/image-15.png"
                      alt="google-meet"
                      width={70}
                      height={70}
                      className="imageinst"
                    />
                    <br />
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

export default ForgotPassword;
