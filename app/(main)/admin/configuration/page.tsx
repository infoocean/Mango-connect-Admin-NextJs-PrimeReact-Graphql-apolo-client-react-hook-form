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

const Configuration = () => {
  const [loader, setLoader] = useState(false);
  const [configData, setConfigData] = useState<any>([]);
  const [logo, setlogo] = useState<any>("");
  const [logoBlogImage, setLogoBlobImage] = useState<any>("");
  const [favIcon, setfavIcon] = useState<any>("");
  const [favIconBlogImage, setFavIconBlobImage] = useState<any>("");
  const fileInputRef = useRef<any>(null);
  const fileIconInputRef = useRef<any>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>("");

  const appointmentType = [{ name: "free" }, { name: "paid" }];
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
  }, []);

  const getSiteData = async () => {
    try {
      const data = await client.query({
        query: GET_SITE_CONGURATION,
      });
      if (data && data?.data?.getOptions) {
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
          setValue("stripe_pk", stripeOptions?.option_value?.stripe_pk);
          setValue("stripe_sk", stripeOptions?.option_value?.stripe_sk);
        } else {
          console.log("Stripe keys not found in options");
        }
        if (siteOptions) {
          setValue("org_title", siteOptions?.option_value?.org_title);
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

  const onSubmitSiteConfig = async (data: any) => {
    const optionKey = "org_logo_favicon_title";
    const optionValue = {
      org_title: data.org_title,
      org_logo: "uploads/banner.png",
      org_favicon: "uploads/banner.png",
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
  const onSubmitStripeKeys = async (data: any) => {
    const optionKey = "org_stripe_keys";
    const optionValue = {
      stripe_pk: data.stripe_pk,
      stripe_sk: data.stripe_sk,
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

  const onSubmitAppoinment = async (data: any) => {
    const optionKey = "appointment_config";
    const optionValue = {
      type: selectedAppointment
        ? selectedAppointment
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

  const handleImageUpload = async (event: any) => {
    const file = event.target.files[0];
    setlogo(file);

    const reader = new FileReader();
    reader.onloadend = function () {
      const base64data = reader.result;
      setLogoBlobImage(base64data);
    };
    reader.readAsDataURL(file);

    // const formData = new FormData();
    // formData.append("image", file);
    // console.log("filefile", file);
  };

  const handleFavIconUpload = async (event: any) => {
    const file = event.target.files[0];
    setfavIcon(file);

    const reader = new FileReader();
    reader.onloadend = function () {
      const base64data = reader.result;
      setFavIconBlobImage(base64data);
    };
    reader.readAsDataURL(file);

    // const formData = new FormData();
    // formData.append("image", file);
    // console.log("filefile", file);
  };

  const handleRemoveImage = () => {
    setlogo(null);
    fileInputRef.current.value = "";
    setLogoBlobImage(null);
  };

  const handleIconRemoveImage = () => {
    setfavIcon(null);
    fileIconInputRef.current.value = "";
    setFavIconBlobImage(null);
  };

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div className="headingcs">
            <h4 className="headingtext">Site Configuration</h4>
          </div>
          <div className="card cardcss">
            <TabView>
              <TabPanel header="Site Config" leftIcon="pi pi-wrench mr-2">
                <div className="m-0">
                  <form onSubmit={handleSubmit(onSubmitSiteConfig)}>
                    <div>
                      <br />
                      <div className="flex flex-column gap-2">
                        <label htmlFor="username" className="stripeheading">
                          Site Title
                        </label>
                        <InputText
                          id="org_title"
                          type="text"
                          {...register("org_title")}
                          placeholder="Title"
                          className="inputfieldcss"
                        />
                        {errors && errors.org_title ? (
                          <p className="errorcss">
                            <small id="username-help">
                              {ErrorFormMsg(errors?.org_title?.message)}
                            </small>
                          </p>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                    <br />
                    <div>
                      <div className="flex flex-column gap-2">
                        <label htmlFor="username" className="stripeheading">
                          Site Logo
                        </label>
                        <div className="card flex justify-content-left">
                          <div>
                            {logoBlogImage && (
                              <>
                                <img
                                  src={logoBlogImage}
                                  alt="image"
                                  width={70}
                                  height={70}
                                />
                                <button
                                  className="btn-remove-image"
                                  onClick={handleRemoveImage}
                                >
                                  <i className="pi pi-times cross"></i>
                                </button>
                              </>
                            )}
                          </div>
                          &emsp;
                          <div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="imageinputcss"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <br />
                    <div>
                      <div className="flex flex-column gap-2">
                        <label htmlFor="username" className="stripeheading">
                          Site FavIcon
                        </label>
                        <div className="card flex justify-content-left">
                          <div>
                            {favIconBlogImage && (
                              <>
                                <img
                                  src={favIconBlogImage}
                                  alt="image"
                                  width={70}
                                  height={70}
                                />
                                <button
                                  className="btn-remove-image"
                                  onClick={handleIconRemoveImage}
                                >
                                  <i className="pi pi-times cross"></i>
                                </button>
                              </>
                            )}
                          </div>
                          &emsp;
                          <div>
                            <input
                              ref={fileIconInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFavIconUpload}
                              className="image2inputcss"
                            />
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
              </TabPanel>
              <TabPanel header="Stripe keys" leftIcon="pi pi-lock  mr-2">
                <div className="m-0">
                  <form onSubmit={handleSubmit(onSubmitStripeKeys)}>
                    <div>
                      <br />
                      <div className="flex flex-column gap-2">
                        <label htmlFor="username" className="stripeheading">
                          Stripe Primary Key
                        </label>
                        <InputText
                          id="stripe_pk"
                          type="text"
                          {...register("stripe_pk")}
                          placeholder="Stripe Key"
                          className="inputfieldcss"
                        />
                        {errors && errors.stripe_pk ? (
                          <p className="errorcss">
                            <small id="username-help">
                              {ErrorFormMsg(errors?.stripe_pk?.message)}
                            </small>
                          </p>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                    <br />
                    <div>
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
              </TabPanel>
              <TabPanel
                header="Appointment Config"
                leftIcon="pi pi-calendar-plus mr-2"
              >
                <div className="m-0">
                  <form onSubmit={handleSubmit(onSubmitAppoinment)}>
                    <div>
                      <br />
                      <div className="flex flex-column gap-2">
                        <label htmlFor="username" className="stripeheading">
                          Appointment Type
                        </label>
                        <div className="flex justify-content-left">
                          <Dropdown
                            value={selectedAppointment}
                            onChange={(e) => setSelectedAppointment(e.value)}
                            options={appointmentType}
                            optionLabel="name"
                            placeholder="Select an appointment type"
                            className="w-full md:w-14rem dropdownc"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <br />
                      <div className="flex flex-column gap-2">
                        <label htmlFor="username" className="stripeheading">
                          Time Duration
                        </label>
                        <InputText
                          id="duration"
                          type="text"
                          {...register("duration")}
                          placeholder="Time Duration"
                          className="inputfieldcss time"
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
                    <div>
                      <div className="flex flex-column gap-2">
                        <label htmlFor="username" className="stripeheading">
                          Amount
                        </label>
                        <InputText
                          id="amount"
                          type="text"
                          {...register("amount")}
                          placeholder="Amount"
                          className="inputfieldcss time"
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
              </TabPanel>
            </TabView>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
