"use client";
import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  integrations,
  siteConfigurationFormvalidation,
  stripeFormvalidation,
} from "@/app/validation/validations";
import { Divider } from "primereact/divider";
import { ConfirmPopup } from "primereact/confirmpopup";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/app/(main)/Comman/spinner/page";
import Image from "next/image";
import { InputSwitch } from "primereact/inputswitch";
import Link from "next/link";
import { InputText } from "primereact/inputtext";
import { ErrorFormMsg } from "@/demo/components/ErrorMessgae";
import { toast } from "react-toastify";
import { ApolloError } from "@apollo/client";
import { nextLocalStorage } from "@/app/utils/commonFuns";
import {
  CREATE_GOOGLE_AUTH_CREDENTIALS,
  UPDATE_SITE_CONFIGURATION,
} from "@/app/api/lib/graphql_mutation";
import client from "@/app/api/lib/apollo-client";
import {
  GET_SITE_CONGURATION,
  GET_SITE_CONGURATION_BY_KEYS,
} from "@/app/api/lib/graphql_queries";
import { Tooltip } from "primereact/tooltip";

const Integrations: React.FC = () => {
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleChecked, setGoogleChecked] = useState(false);
  const [meetChecked, setMeetChecked] = useState(false);
  const [googleDivOpen, setGoogleDivOpen] = useState(false);
  const [meetDivOpen, setMeetDivOpen] = useState(false);
  const [stripeDivOpen, setStripeDivOpen] = useState(false);
  const [paypalDivOpen, setPaypalDivOpen] = useState(false);
  const [configData, setConfigData] = useState<any>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>("");
  const getOption = nextLocalStorage()?.getItem("option");
  // const options: any = getOption && JSON.parse(getOption);
  const [pk_stripe, set_pk_stripe] = useState<any>("");
  const [sk_stripe, set_sk_stripe] = useState<any>("");

  const [test_pk_stripe, set_test_pk_stripe] = useState<any>("");
  const [test_sk_stripe, set_test_sk_stripe] = useState<any>("");
  const [checked, setChecked] = useState<any>(false);
  const [liveMode, setLiveMode] = useState<any>(false);
  const router = useRouter();
  const [googleMeetData, setGoogleMeetData] = useState<any>("");
  const [authCredentialData, setAuthCredentialData] = useState<any>("");
  const [handleCheckAuth, setHandleCheckAuth] = useState<any>(false);

  const {
    register: registerSite,
    handleSubmit: handleSubmitSite,
    reset: resetSite,
    setValue: setValueSite,
    formState: { errors: errorsSite },
  } = useForm<any>({
    resolver: yupResolver(stripeFormvalidation),
  });

  const {
    register: registerIntegration,
    handleSubmit: handleSubmitIntegration,
    reset: resetIntegration,
    setValue: setValueIntegration,
    formState: { errors: errorsIntegration },
  } = useForm<any>({
    resolver: yupResolver(integrations),
  });

  const changeLiveStripeStatus = (value: any) => {
    setChecked(value);
  };
  useEffect(() => {
    getSiteData();
  }, []);

  const getSiteData = async () => {
    try {
      const data = await client.query({
        query: GET_SITE_CONGURATION_BY_KEYS,
        variables: {
          optionsKeys: [
            "org_stripe_keys",
            "meeting_config",
            "auth_credentials",
          ],
        },
      });

      if (data?.data?.getOptionsByOprionkeys) {
        const stripeOptions = data?.data?.getOptionsByOprionkeys?.find(
          (option: any) => option?.option_key === "org_stripe_keys"
        );
        const GoogleMeetOptions = data?.data?.getOptionsByOprionkeys?.find(
          (option: any) => option?.option_key === "meeting_config"
        );
        const auth_credential = data?.data?.getOptionsByOprionkeys?.find(
          (option: any) => option?.option_key === "auth_credentials"
        );
        if (stripeOptions) {
          setValueSite(
            "stripe_pk",
            stripeOptions?.option_value?.live_mode?.stripe_pk
          );
          setValueSite(
            "stripe_sk",
            stripeOptions?.option_value?.live_mode?.stripe_sk
          );
          setValueSite(
            "stripe_pk",
            stripeOptions?.option_value?.test_mode?.stripe_pk
          );
          setValueSite(
            "stripe_sk",
            stripeOptions?.option_value?.test_mode?.stripe_sk
          );
          setLiveMode(stripeOptions?.option_value?.live_mode_status);
          setChecked(stripeOptions?.option_value?.live_mode_status);
          set_pk_stripe(stripeOptions?.option_value?.live_mode?.stripe_pk);
          set_sk_stripe(stripeOptions?.option_value?.live_mode?.stripe_sk);
          set_test_pk_stripe(stripeOptions?.option_value?.test_mode?.stripe_pk);
          set_test_sk_stripe(stripeOptions?.option_value?.test_mode?.stripe_sk);
        } else {
          console.log("Stripe keys not found in options");
        }
        if (GoogleMeetOptions) {
          setGoogleMeetData(GoogleMeetOptions?.option_value);
          setGoogleChecked(GoogleMeetOptions?.option_value?.google_meet);
        } else {
        }
        if (auth_credential) {
          setAuthCredentialData(auth_credential?.option_value);
        } else {
        }
        setConfigData(data?.data?.getOptionsByOprionkeys);
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

  const onSubmitStripeKeys = async (data: any) => {
    const optionKey = "org_stripe_keys";
    const optionValue = {
      live_mode: {
        stripe_pk: pk_stripe,
        stripe_sk: sk_stripe,
      },
      live_mode_status: checked,
      test_mode: {
        stripe_pk: test_pk_stripe,
        stripe_sk: test_sk_stripe,
      },
    };
    setLoader(true);
    try {
      const response: any = await client.mutate({
        mutation: UPDATE_SITE_CONFIGURATION,
        variables: {
          option_key: optionKey,
          option_value: optionValue,
        },
      });

      if (response && response?.data?.updateOption) {
        toast.success("Data updated successfully!");
        setTimeout(() => {
          setLoader(false);
          window.location.replace(
            `${process.env.NEXT_PUBLIC_BASE_URL}/admin/configuration/integrations`
          );
        }, 2000);
      } else {
        console.log("@");
        setLoader(false);
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        const errorMessage = error.message;
        toast.error(errorMessage);
        setLoader(false);
      } else {
        setLoader(false);
        console.error("Unexpected Error:", error);
      }
    }
  };

  const onSubmitTemplate = async (data: any) => {
    setLoader(true);
    try {
      const response: any = await client.mutate({
        mutation: CREATE_GOOGLE_AUTH_CREDENTIALS,
        variables: {
          authCredentials: {
            api_key: data.api_key,
            calender_id: data.calender_id,
            cancel_uris: "https://mango-connect.mangoitsol.com/meet_failure",
            client_id: data.client_id,
            client_secret: data.client_secret,
            redirect_uris: "https://mango-connect.mangoitsol.com/meet_success",
          },
        },
      });
      if (response && response?.data) {
        setLoader(false);
        window.location.replace(response.data?.saveAuthCredentials);
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
        toast.error(errorMessage);
        setTimeout(() => {
          window.location.replace(
            `${process.env.NEXT_PUBLIC_BASE_URL}/meet_failure`
          );
        }, 2000);
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

  const handleGoogoleMeet = () => {
    setGoogleDivOpen(!googleDivOpen);
    setMeetDivOpen(false);
    setStripeDivOpen(false);
  };

  const handleZoom = () => {
    setMeetDivOpen(!meetDivOpen);
    setGoogleDivOpen(false);
    setStripeDivOpen(false);
  };

  const handleStripe = () => {
    setStripeDivOpen(!stripeDivOpen);
    setMeetDivOpen(false);
    setGoogleDivOpen(false);
  };

  const handleCheckedValue = () => {
    setHandleCheckAuth(true);
  };

  const CopyableInputText = ({ id, label, placeholder, value }: any) => {
    const copyToClipboard = (text: any) => {
      navigator.clipboard.writeText(text);
      toast.success("Copied!");
    };

    return (
      <div className="flex flex-column gap-2 copytextfieldt">
        <label htmlFor={id} className="stripeheading">
          {label}
        </label>
        <div className="p-inputgroup">
          <InputText
            id={id}
            type="text"
            placeholder={placeholder}
            className="inputfieldcss"
            value={value}
            readOnly
          />
          <Button
            icon="pi pi-clone"
            onClick={() => copyToClipboard(value)}
            tooltip="Copy to clipboard"
            tooltipOptions={{ position: "bottom" }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="grid integrations">
      <div className="col-12">
        <div className="card">
          <div className="datatable-editing-demo">
            <div className="wrapperclass">
              <div className="headingcs">
                <h4 className="headingtext">Integrations</h4>
              </div>
              <div className="backbtn"></div>
            </div>
            <Divider />
            {!loading ? (
              <>
                <div className="grid1">
                  <span className="googlewrapdiv">
                    <div className="col-12 lg:col-6 xl:col-12">
                      <div
                        className="card mb-0"
                        onClick={handleGoogoleMeet}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="flex justify-content-between mb-3">
                          <div>
                            <span className="block text-500 font-medium mb-3">
                              <Image
                                src="/layout/images/google_meet.png"
                                alt="google-meet"
                                width={70}
                                height={70}
                                className="googlemeet"
                                onClick={handleGoogoleMeet}
                              />
                            </span>
                            <div className="text-900 font-medium text-xl">
                              Google Meet
                            </div>
                          </div>
                        </div>
                        <span className="text-500">
                          Connect Tutor LMS with Google Meet to online
                          Appoinment.
                        </span>
                      </div>
                    </div>
                    <div className="checkbox1div">
                      <p
                        className="connectcss"
                        onClick={handleGoogoleMeet}
                        style={{ cursor: "pointer" }}
                      >
                        {googleMeetData && googleMeetData?.google_meet === true
                          ? "Connected"
                          : "Connect"}
                      </p>
                      <InputSwitch
                        checked={googleChecked}
                        onChange={(e: any) => setGoogleChecked(e.value)}
                        className="checkbox1"
                        disabled
                      />
                    </div>
                  </span>
                  <span className="googlewrapdiv">
                    <div className="col-12 lg:col-6 xl:col-12">
                      <div
                        className="card mb-0"
                        onClick={handleZoom}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="flex justify-content-between mb-3">
                          <div>
                            <span className="block text-500 font-medium mb-3">
                              <Image
                                src="/layout/images/zoom.png"
                                alt="google-meet"
                                width={70}
                                height={70}
                                className="googlemeet"
                                onClick={handleZoom}
                              />
                            </span>
                            <div className="text-900 font-medium text-xl">
                              Zoom Meet
                            </div>
                          </div>
                        </div>
                        <span className="text-500">
                          To make an online appointment, connect Tutor LMS with
                          Zoom.
                        </span>
                      </div>
                    </div>{" "}
                    <div className="checkbox1div">
                      <p className="connectcss">Connect</p>
                      <InputSwitch
                        checked={meetChecked}
                        onChange={(e: any) => setMeetChecked(e.value)}
                        className="checkbox1"
                        disabled
                      />
                    </div>
                  </span>
                  <span className="googlewrapdiv">
                    <div className="col-12 lg:col-6 xl:col-12">
                      <div
                        className="card mb-0"
                        onClick={handleStripe}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="flex justify-content-between mb-3">
                          <div>
                            <span className="block text-500 font-medium mb-3">
                              <Image
                                src="/layout/images/stripe.png"
                                alt="stripe"
                                width={70}
                                height={70}
                                className="googlemeet"
                                onClick={handleStripe}
                              />
                            </span>
                            <div className="text-900 font-medium text-xl">
                              Stripe
                            </div>
                          </div>
                        </div>
                        <span className="text-500">
                          You can connect your Stripe account to receive the
                          appointment amount.
                        </span>
                      </div>
                    </div>{" "}
                    <div className="checkbox1div">
                      <p
                        className="connectcss"
                        onClick={handleStripe}
                        style={{ cursor: "pointer" }}
                      >
                        {(test_pk_stripe !== "" && test_sk_stripe !== "") ||
                        (pk_stripe !== "" && sk_stripe !== "")
                          ? "Connected"
                          : "Connect"}
                      </p>
                      <InputSwitch
                        checked={
                          (test_pk_stripe !== "" && test_sk_stripe !== "") ||
                          (pk_stripe !== "" && sk_stripe !== "")
                        }
                        onChange={(e): any => changeLiveStripeStatus(e.value)}
                        className="checkbox1"
                        disabled
                      />
                    </div>
                  </span>
                  <span className="googlewrapdiv">
                    <div className="col-12 lg:col-6 xl:col-12">
                      <div
                        className="card mb-0"
                        onClick={handleZoom}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="flex justify-content-between mb-3">
                          <div>
                            <span className="block text-500 font-medium mb-3">
                              <Image
                                src="/layout/images/paypal.png"
                                alt="paypal"
                                width={70}
                                height={70}
                                className="googlemeet"
                                onClick={handleZoom}
                              />
                            </span>
                            <div className="text-900 font-medium text-xl">
                              Paypal
                            </div>
                          </div>
                        </div>
                        <span className="text-500">
                          You can connect your Paypal account to receive the
                          appointment amount.
                        </span>
                      </div>
                    </div>
                    <div className="checkbox1div">
                      <p className="connectcss">Connect</p>
                      <InputSwitch
                        checked={paypalDivOpen}
                        onChange={(e: any) => setPaypalDivOpen(e.value)}
                        className="checkbox1"
                        disabled
                      />
                    </div>
                  </span>
                </div>
                {/* /////////////////////////popup//////////////// */}
                <ConfirmPopup />
                {googleDivOpen ? (
                  <div className="grid availabiltyc">
                    <div className="col-12 lg:col-6 xl:col-6">
                      <div className="card mb-0">
                        <h6 className="headingIntegration">Google Meet</h6>
                        <br />
                        <div className="flex justify-content-between mb-3">
                          <div className="integrationwrap">
                            <form
                              onSubmit={handleSubmitIntegration(
                                onSubmitTemplate
                              )}
                            >
                              <div>
                                <div className="flex flex-column gap-2">
                                  <label
                                    htmlFor="username"
                                    className="stripeheading"
                                  >
                                    Client ID
                                  </label>
                                  <InputText
                                    id="client_id"
                                    type="text"
                                    {...registerIntegration("client_id")}
                                    placeholder="Client ID"
                                    className="inputfieldcss"
                                    defaultValue={
                                      authCredentialData &&
                                      authCredentialData?.client_id
                                    }
                                    onChange={handleCheckedValue}
                                  />
                                  {errorsIntegration &&
                                  errorsIntegration.client_id ? (
                                    <p className="errorcss">
                                      <small id="username-help">
                                        {ErrorFormMsg(
                                          errorsIntegration?.client_id?.message
                                        )}
                                      </small>
                                    </p>
                                  ) : (
                                    ""
                                  )}
                                </div>
                                <br />
                                <div className="flex flex-column gap-2">
                                  <label
                                    htmlFor="username"
                                    className="stripeheading"
                                  >
                                    Client Secret
                                  </label>
                                  <InputText
                                    id="client_secret"
                                    type="text"
                                    {...registerIntegration("client_secret")}
                                    placeholder="Client Secret"
                                    className="inputfieldcss"
                                    defaultValue={
                                      authCredentialData &&
                                      authCredentialData?.client_secret
                                    }
                                    onChange={handleCheckedValue}
                                  />
                                  {errorsIntegration &&
                                  errorsIntegration.client_secret ? (
                                    <p className="errorcss">
                                      <small id="username-help">
                                        {ErrorFormMsg(
                                          errorsIntegration?.client_secret
                                            ?.message
                                        )}
                                      </small>
                                    </p>
                                  ) : (
                                    ""
                                  )}
                                </div>
                                <br />
                                <div className="flex flex-column gap-2">
                                  <label
                                    htmlFor="username"
                                    className="stripeheading"
                                  >
                                    API Key
                                  </label>
                                  <InputText
                                    id="api_key"
                                    type="text"
                                    {...registerIntegration("api_key")}
                                    placeholder="API Key"
                                    className="inputfieldcss"
                                    defaultValue={
                                      authCredentialData &&
                                      authCredentialData?.api_key
                                    }
                                    onChange={handleCheckedValue}
                                  />
                                  {errorsIntegration &&
                                  errorsIntegration.api_key ? (
                                    <p className="errorcss">
                                      <small id="username-help">
                                        {ErrorFormMsg(
                                          errorsIntegration?.api_key?.message
                                        )}
                                      </small>
                                    </p>
                                  ) : (
                                    ""
                                  )}
                                </div>
                                <br />
                                <div className="flex flex-column gap-2">
                                  <label
                                    htmlFor="username"
                                    className="stripeheading"
                                  >
                                    Calendar ID
                                  </label>
                                  <InputText
                                    id="calender_id"
                                    type="text"
                                    {...registerIntegration("calender_id")}
                                    placeholder="Calendar ID"
                                    className="inputfieldcss"
                                    defaultValue={
                                      authCredentialData &&
                                      authCredentialData?.calender_id
                                    }
                                    onChange={handleCheckedValue}
                                  />
                                  {errorsIntegration &&
                                  errorsIntegration.calender_id ? (
                                    <p className="errorcss">
                                      <small id="username-help">
                                        {ErrorFormMsg(
                                          errorsIntegration?.calender_id
                                            ?.message
                                        )}
                                      </small>
                                    </p>
                                  ) : (
                                    ""
                                  )}
                                </div>
                              </div>
                              <br />
                              <br />
                              <div>
                                {!loader ? (
                                  <>
                                    {handleCheckAuth === true ? (
                                      <Button
                                        label="Update"
                                        type="submit"
                                        className="p-button-success btnsave"
                                      />
                                    ) : (
                                      <Button
                                        label="Update"
                                        type="submit"
                                        className="p-button-success btnsave"
                                        disabled
                                      />
                                    )}
                                  </>
                                ) : (
                                  <Button
                                    label="Loading..."
                                    className="p-button-success btnsave"
                                  />
                                )}
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 lg:col-6 xl:col-6">
                      <div className="card mb-0">
                        <div className="flex justify-content-between ">
                          <div className="avail2a">
                            <h5>
                              <Button
                                label=" Here are the instrution to follow the google
                                connect"
                                link
                                className="instructionLink"
                                onClick={() =>
                                  window.open(
                                    `${process.env.NEXT_PUBLIC_BASE_URL}/integrations_instruction`,
                                    "_blank"
                                  )
                                }
                              ></Button>
                            </h5>
                          </div>
                        </div>
                        <div className="flex flex-column gap-2">
                          <label htmlFor="username" className="stripeheading">
                            Redirect URL
                          </label>
                          <CopyableInputText
                            id="calender_id"
                            type="text"
                            placeholder=" Redirect URL"
                            className="inputfieldcss"
                            value={
                              "https://mango-connect.mangoitsol.com/meet_success"
                            }
                          />
                        </div>
                        <br />
                        <div className="flex flex-column gap-2">
                          <label htmlFor="username" className="stripeheading">
                            Failure URL
                          </label>
                          <CopyableInputText
                            id="calender_id"
                            type="text"
                            placeholder="Failure URL"
                            className="inputfieldcss"
                            value={
                              "https://mango-connect.mangoitsol.com/meet_failure"
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  ""
                )}

                {meetDivOpen ? (
                  <div className="grid availabiltyc">
                    <div className="col-12 lg:col-6 xl:col-12">
                      <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                          <div className="integrationwrap">
                            <h5 className="integrationmeettext">
                              It has not been integrated yet, but we will do so
                              soon.
                            </h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  ""
                )}

                {stripeDivOpen ? (
                  <div className="card cardcss">
                    <div className="m-0">
                      <div className="wrapperclass">
                        <div className="headingcs">
                          <h6 className="headingIntegration">Stripe Details</h6>
                        </div>
                        <div className="backbtn modeparacss">
                          {checked ? (
                            <p className="modecsslive">Live mode</p>
                          ) : (
                            <p className="modecsstest">Test mode</p>
                          )}
                          <InputSwitch
                            checked={checked}
                            onChange={(e): any =>
                              changeLiveStripeStatus(e.value)
                            }
                          />
                        </div>
                      </div>
                      <form onSubmit={handleSubmitSite(onSubmitStripeKeys)}>
                        <div>
                          <br />
                          <label htmlFor="username" className="stripeheading">
                            Stripe Primary Key
                          </label>
                          {checked === true ? (
                            <InputText
                              id="stripe_pk"
                              type="text"
                              {...registerSite("stripe_pk")}
                              placeholder="Primary Key"
                              className="inputfieldcss stripefield"
                              value={pk_stripe}
                              onChange={(e) => set_pk_stripe(e.target.value)}
                            />
                          ) : (
                            <InputText
                              id="stripe_pk"
                              type="text"
                              {...registerSite("stripe_pk")}
                              placeholder="Primary Key"
                              className="inputfieldcss stripefield"
                              value={test_pk_stripe}
                              onChange={(e) =>
                                set_test_pk_stripe(e.target.value)
                              }
                            />
                          )}
                        </div>
                        <br />
                        <div>
                          <label htmlFor="username" className="stripeheading">
                            Stripe Secret Key
                          </label>
                          {checked ? (
                            <InputText
                              id="stripe_sk"
                              type="text"
                              {...registerSite("stripe_sk")}
                              placeholder="Secret Key"
                              className="inputfieldcss stripefield"
                              value={sk_stripe}
                              onChange={(e) => set_sk_stripe(e.target.value)}
                            />
                          ) : (
                            <InputText
                              id="stripe_sk"
                              type="text"
                              {...registerSite("stripe_sk")}
                              placeholder="Secret Key"
                              className="inputfieldcss stripefield"
                              value={test_sk_stripe}
                              onChange={(e) =>
                                set_test_sk_stripe(e.target.value)
                              }
                            />
                          )}
                        </div>
                        <br />
                        <br />
                        <div>
                          {!loader ? (
                            <>
                              <Button
                                label="Update"
                                type="submit"
                                className="p-button-success btnsave"
                              />
                            </>
                          ) : (
                            <Button
                              label="Loading..."
                              className="p-button-success btnsave"
                            />
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </>
            ) : (
              <div className="spinnerclass">
                <Spinner />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
