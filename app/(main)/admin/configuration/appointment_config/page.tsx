"use client";
import React, { useEffect, useRef, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
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
import { Dropdown } from "primereact/dropdown";
import { UPDATE_SITE_CONFIGURATION } from "@/app/api/lib/graphql_mutation";
import { nextLocalStorage } from "@/app/utils/commonFuns";
import { RadioButton } from "primereact/radiobutton";

const AppointmentConfig = () => {
  const [loader, setLoader] = useState(false);
  const [configData, setConfigData] = useState<any>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>("");
  const [configureAppointment, setConfigureAppointment] =
    useState<any>("offline");

  const getOption = nextLocalStorage()?.getItem("option");
  const options: any = getOption && JSON.parse(getOption);

  const [amount, setAmount] = useState<any>("");
  const [duration, setDuration] = useState<any>("");
  const [type, setType] = useState<any>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(siteConfigurationFormvalidation),
  });

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
          setAmount(configOptions?.option_value?.amount);
          setDuration(configOptions?.option_value?.duration);
          setType(configOptions?.option_value?.type);
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

  const setConfigureAppointmentt = (value: any) => {
    if (value === "online") {
      toast.info(
        "You need to connect one online platform to schedule appointment."
      );
    }
    setConfigureAppointment("offline");
  };
  const onSubmitAppoinment = async (data: any) => {
    const optionKey = "appointment_config";
    const optionValue = {
      type: selectedAppointment
        ? selectedAppointment?.name
          ? selectedAppointment
          : { name: selectedAppointment }
        : selectedAppointment?.name,

      amount: data.amount,
      duration: data.duration,
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
          if (option.option_key === "appointment_config") {
            return {
              ...option,
              option_value: {
                ...option.option_value,
                amount: response?.data?.updateOption.option_value.amount,
                duration: response?.data?.updateOption.option_value.duration,
                type: response?.data?.updateOption.option_value.type,
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
          <div className="headingcs">
            <h4 className="headingtext">Appointment Configuration</h4>
          </div>
          <div className="card cardcss">
            <div className="m-0">
              <form onSubmit={handleSubmit(onSubmitAppoinment)}>
                <div>
                  <br />
                  <div className="flex flex-column gap-2 dropdownn">
                    <label htmlFor="username" className="stripeheading ">
                      Appointment Type
                    </label>
                    <div className="flex justify-content-left">
                      <div className="flex flex-wrap gap-3">
                        <div className="flex align-items-center">
                          <RadioButton
                            inputId="ingredient1"
                            name="free"
                            value="free"
                            onChange={(e) => setSelectedAppointment(e.value)}
                            checked={
                              selectedAppointment.name === "free" ||
                              selectedAppointment === "free"
                            }
                          />
                          <label htmlFor="ingredient1" className="ml-2">
                            Free
                          </label>
                        </div>
                        <div className="flex align-items-center">
                          <RadioButton
                            inputId="ingredient2"
                            name="paid"
                            value="paid"
                            onChange={(e) => setSelectedAppointment(e.value)}
                            checked={
                              selectedAppointment.name === "paid" ||
                              selectedAppointment === "paid"
                            }
                          />
                          <label htmlFor="ingredient2" className="ml-2">
                            Paid
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <br />
                  <div className="flex flex-column gap-2">
                    <label htmlFor="username" className="stripeheading">
                      Appointment Duration (minutes)
                    </label>
                    <InputText
                      id="duration"
                      type="text"
                      {...register("duration")}
                      placeholder="Time Duration"
                      className="inputfieldcss time"
                      defaultValue={duration}
                    />
                    {errors && errors.duration ? (
                      <p className="errorcss">
                        <small id="username-help">
                          {ErrorFormMsg(errors?.duration?.message)}
                        </small>
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <br />
                {selectedAppointment?.name === "paid" ||
                selectedAppointment === "paid" ? (
                  <div>
                    <div className="flex flex-column gap-2">
                      <label htmlFor="username" className="stripeheading">
                        Appointment Fee ($)
                      </label>
                      <InputText
                        id="amount"
                        type="text"
                        {...register("amount")}
                        placeholder="Amount"
                        className="inputfieldcss time"
                        defaultValue={amount}
                      />
                      {errors && errors.amount ? (
                        <p className="errorcss">
                          <small id="username-help">
                            {ErrorFormMsg(errors?.amount?.message)}
                          </small>
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                ) : (
                  ""
                )}
                <br />
                <div className="configuregoogle">
                  <div className="flex flex-column gap-2">
                    <label htmlFor="username" className="stripeheading">
                      Configure Appointment
                    </label>
                    <div className="flex justify-content-left">
                      <div className="flex flex-wrap gap-3">
                        <div className="flex align-items-center">
                          <RadioButton
                            inputId="ingredient1"
                            name="offline"
                            value="offline"
                            onChange={(e) => setConfigureAppointmentt(e.value)}
                            checked={configureAppointment === "offline"}
                          />
                          <label htmlFor="ingredient1" className="ml-2">
                            Offline
                          </label>
                        </div>
                        <div className="flex align-items-center">
                          <RadioButton
                            inputId="ingredient2"
                            name="online"
                            value="online"
                            onChange={(e) => setConfigureAppointmentt(e.value)}
                            checked={configureAppointment === "online"}
                          />
                          <label htmlFor="ingredient2" className="ml-2">
                            Online
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
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

export default AppointmentConfig;
