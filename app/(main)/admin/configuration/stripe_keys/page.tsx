"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ApolloError } from "@apollo/client";
import { toast } from "react-toastify";
import { InputText } from "primereact/inputtext";
import { ErrorFormMsg } from "@/demo/components/ErrorMessgae";
import { siteConfigurationFormvalidation } from "@/app/validation/validations";
import client from "@/app/api/lib/apollo-client";
import { GET_SITE_CONGURATION } from "@/app/api/lib/graphql_queries";
import { UPDATE_SITE_CONFIGURATION } from "@/app/api/lib/graphql_mutation";
import { nextLocalStorage } from "@/app/utils/commonFuns";
import { InputSwitch } from "primereact/inputswitch";

const Stripe_key = () => {
  const [loader, setLoader] = useState(false);
  const [configData, setConfigData] = useState<any>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>("");
  const getOption = nextLocalStorage()?.getItem("option");
  const options: any = getOption && JSON.parse(getOption);
  const [pk_stripe, set_pk_stripe] = useState<any>("");
  const [sk_stripe, set_sk_stripe] = useState<any>("");

  const [test_pk_stripe, set_test_pk_stripe] = useState<any>("");
  const [test_sk_stripe, set_test_sk_stripe] = useState<any>("");
  const [checked, setChecked] = useState<any>(false);
  const [liveMode, setLiveMode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(siteConfigurationFormvalidation),
  });

  const changeLiveStripeStatus = (value: any) => {
    setChecked(value);
  };
  useEffect(() => {
    getSiteData();
    if (options) {
      if (options && options) {
        const stripeOptions = options?.find(
          (option: any) => option?.option_key === "org_stripe_keys"
        );

        const siteOptions = options?.find(
          (option: any) => option?.option_key === "org_logo_favicon_title"
        );
        const configOptions = options?.find(
          (option: any) => option?.option_key === "appointment_config"
        );

        if (stripeOptions) {
          set_pk_stripe(stripeOptions?.option_value?.live_mode?.stripe_pk);
          set_sk_stripe(stripeOptions?.option_value?.live_mode?.stripe_sk);
          set_test_pk_stripe(stripeOptions?.option_value?.test_mode?.stripe_pk);
          set_test_sk_stripe(stripeOptions?.option_value?.test_mode?.stripe_sk);
          setValue(
            "stripe_pk",
            stripeOptions?.option_value?.live_mode?.stripe_pk
          );
          setValue(
            "stripe_sk",
            stripeOptions?.option_value?.live_mode?.stripe_sk
          );
          setValue(
            "stripe_pk",
            stripeOptions?.option_value?.test_mode?.stripe_pk
          );
          setValue(
            "stripe_sk",
            stripeOptions?.option_value?.test_mode?.stripe_sk
          );
          setLiveMode(stripeOptions?.option_value?.live_mode_status);
          setChecked(stripeOptions?.option_value?.live_mode_status);
        } else {
          console.log("Stripe keys not found in options");
        }
        if (siteOptions) {
          setValue("org_title", siteOptions?.option_value?.org_title);
          setValue("company_name", siteOptions?.option_value?.company_name);
          setValue("company_email", siteOptions?.option_value?.company_email);
          setValue(
            "company_address",
            siteOptions?.option_value?.company_address
          );
          setValue("company_phone", siteOptions?.option_value?.company_phone);
        } else {
          console.log("Stripe keys not found in options");
        }
        if (configOptions) {
          setValue("type", configOptions?.option_value?.type);
          setSelectedAppointment(configOptions?.option_value?.type);
          setValue("amount", configOptions?.option_value?.amount);
          setValue("duration", configOptions?.option_value?.duration);
        } else {
          console.log("Stripe keys not found in options");
        }
      } else {
        console.log("@");
      }
    }
  }, []);

  const getSiteData = async () => {
    try {
      const data = await client.query({
        query: GET_SITE_CONGURATION,
      });
      if (options && options.length !== 0) {
      } else if (data && data?.data?.getOptions) {
        const stripeOptions = data?.data?.getOptions?.find(
          (option: any) => option?.option_key === "org_stripe_keys"
        );

        const siteOptions = data?.data?.getOptions?.find(
          (option: any) => option?.option_key === "org_logo_favicon_title"
        );
        const configOptions = data?.data?.getOptions?.find(
          (option: any) => option?.option_key === "appointment_config"
        );

        if (stripeOptions) {
          setValue(
            "stripe_pk",
            stripeOptions?.option_value?.live_mode?.stripe_pk
          );
          setValue(
            "stripe_sk",
            stripeOptions?.option_value?.live_mode?.stripe_sk
          );
          setValue(
            "stripe_pk",
            stripeOptions?.option_value?.test_mode?.stripe_pk
          );
          setValue(
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
        if (siteOptions) {
          setValue("org_title", siteOptions?.option_value?.org_title);
          setValue("company_name", siteOptions?.option_value?.company_name);
          setValue("company_email", siteOptions?.option_value?.company_email);
          setValue(
            "company_address",
            siteOptions?.option_value?.company_address
          );
          setValue("company_phone", siteOptions?.option_value?.company_phone);
        } else {
          console.log("Stripe keys not found in options");
        }
        if (configOptions) {
          setValue("type", configOptions?.option_value?.type);
          setSelectedAppointment(configOptions?.option_value?.type);
          setValue("amount", configOptions?.option_value?.amount);
          setValue("duration", configOptions?.option_value?.duration);
        } else {
          console.log("Stripe keys not found in options");
        }
        setConfigData(data?.data?.getOptions);
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
        const details =
          options === null || options.length === 0 ? configData : options;
        const updatedArray = details.map((option: any) => {
          if (option.option_key === "org_stripe_keys") {
            return {
              ...option,
              option_value: {
                ...option.option_value,
                live_mode: {
                  stripe_pk:
                    response?.data?.updateOption.option_value.live_mode
                      .stripe_pk,
                  stripe_sk:
                    response?.data?.updateOption.option_value.live_mode
                      .stripe_sk,
                },
                live_mode_status:
                  response?.data?.updateOption.option_value.live_mode_status,
                test_mode: {
                  stripe_pk:
                    response?.data?.updateOption.option_value.test_mode
                      .stripe_pk,
                  stripe_sk:
                    response?.data?.updateOption.option_value.test_mode
                      .stripe_sk,
                },
              },
            };
          }
          return option;
        });
        setConfigData(updatedArray);
        nextLocalStorage()?.setItem("option", JSON.stringify(updatedArray));
        setLoader(false);
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

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div className="wrapperclass">
            <div className="headingcs">
              <h4 className="headingtext">Stripe Keys</h4>
            </div>
            <div className="backbtn modeparacss">
              {checked ? (
                <p className="modecsslive">Live mode enable</p>
              ) : (
                <p className="modecsstest">Test mode enable</p>
              )}
              <InputSwitch
                checked={checked}
                onChange={(e): any => changeLiveStripeStatus(e.value)}
              />
            </div>
          </div>
          <div className="card cardcss">
            <div className="m-0">
              <form onSubmit={handleSubmit(onSubmitStripeKeys)}>
                <div>
                  <br />
                  <label
                    htmlFor="username"
                    className="stripeheading"
                  >
                    Stripe Primary Key
                  </label>
                  {checked === true ? (
                    <InputText
                      id="stripe_pk"
                      type="text"
                      {...register("stripe_pk")}
                      placeholder="Primary Key"
                      className="inputfieldcss stripefield"
                      value={pk_stripe}
                      onChange={(e) => set_pk_stripe(e.target.value)}
                    />
                  ) : (
                    <InputText
                      id="stripe_pk"
                      type="text"
                      {...register("stripe_pk")}
                      placeholder="Primary Key"
                      className="inputfieldcss stripefield"
                      value={test_pk_stripe}
                      onChange={(e) => set_test_pk_stripe(e.target.value)}
                    />
                  )}
                </div>
                <br />
                <div>
                  <label
                    htmlFor="username"
                    className="stripeheading"
                  >
                    Stripe Secret Key
                  </label>
                  {checked ? (
                    <InputText
                      id="stripe_sk"
                      type="text"
                      {...register("stripe_sk")}
                      placeholder="Secret Key"
                      className="inputfieldcss stripefield"
                      value={sk_stripe}
                      onChange={(e) => set_sk_stripe(e.target.value)}
                    />
                  ) : (
                    <InputText
                      id="stripe_sk"
                      type="text"
                      {...register("stripe_sk")}
                      placeholder="Secret Key"
                      className="inputfieldcss stripefield"
                      value={test_sk_stripe}
                      onChange={(e) => set_test_sk_stripe(e.target.value)}
                    />
                  )}
                  {/* {checked && checked === true ? ( */}
                  {/* <div className="flex flex-column gap-2">
                    <label htmlFor="username" className="stripeheading">
                      Stripe Secret Key
                    </label>
                    <InputText
                      id="stripe_sk"
                      type="text"
                      {...register("stripe_sk")}
                      placeholder="Secret Key"
                      className="inputfieldcss"
                      defaultValue={checked ? sk_stripe : test_sk_stripe}
                    />
                    {errors && errors.stripe_sk ? (
                      <p className="errorcss">
                        <small id="username-help">
                          {ErrorFormMsg(errors?.stripe_sk?.message)}
                        </small>
                      </p>
                    ) : (
                      ""
                    )}
                  </div> */}
                  {/* ) : (
                    <div className="flex flex-column gap-2">
                      <label htmlFor="username" className="stripeheading">
                        Stripe Secret Key
                      </label>
                      <InputText
                        id="stripe_sk"
                        type="text"
                        {...register("stripe_sk")}
                        placeholder="Secret Key"
                        className="inputfieldcss"
                        defaultValue={test_sk_stripe}
                      />
                      {errors && errors.stripe_sk ? (
                        <p className="errorcss">
                          <small id="username-help">
                            {ErrorFormMsg(errors?.stripe_sk?.message)}
                          </small>
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                  )} */}
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
        </div>
      </div>
    </div>
  );
};

export default Stripe_key;
