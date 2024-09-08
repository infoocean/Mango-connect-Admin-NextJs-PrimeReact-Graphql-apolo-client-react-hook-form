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
import {
  UPDATE_SITE_CONFIG,
  UPDATE_SITE_CONFIGURATION,
} from "@/app/api/lib/graphql_mutation";
import { nextLocalStorage } from "@/app/utils/commonFuns";
import Image from "next/image";

const SiteConfiguration = () => {
  const [loader, setLoader] = useState(false);
  const [configData, setConfigData] = useState<any>([]);
  const [logo, setlogo] = useState<any>("");
  const [logoBlogImage, setLogoBlobImage] = useState<any>("");
  const [favIcon, setfavIcon] = useState<any>("");
  const [favIconBlogImage, setFavIconBlobImage] = useState<any>("");
  const fileInputRef = useRef<any>(null);
  const fileIconInputRef = useRef<any>(null);
  const [orgTitle, setOrgTitle] = useState<any>("");
  const [companyName, setCompanyName] = useState<any>("");
  const [companyEmail, setCompanyEmail] = useState<any>("");
  const [companyPhone, setCompanyPhone] = useState<any>("");
  const [companyAddress, setCompanyAddress] = useState<any>("");
  const [siteImageData, setSiteImageData] = useState<any>([]);

  const [selectedAppointment, setSelectedAppointment] = useState<any>("");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(siteConfigurationFormvalidation),
  });

  const getOption = nextLocalStorage()?.getItem("option");
  const options: any = getOption && JSON.parse(getOption);
  useEffect(() => {
    getSiteData();
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
          setCompanyEmail(siteOptions?.option_value?.company_email);
          setCompanyAddress(siteOptions?.option_value?.company_address);
          setCompanyName(siteOptions?.option_value?.company_name);
          setCompanyPhone(siteOptions?.option_value?.company_phone);

          setValue("company_name", siteOptions?.option_value?.company_name);
          setValue("company_email", siteOptions?.option_value?.company_email);
          setValue(
            "company_address",
            siteOptions?.option_value?.company_address
          );
          setValue("company_phone", siteOptions?.option_value?.company_phone);
          setSiteImageData(siteOptions?.option_value);
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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API}/${siteImageData?.org_logo}`
    );
    const blob = await response.blob();
    const imglogo = new File([blob], "image.jpg", { type: blob.type });

    const responsefav = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API}/${siteImageData?.org_favicon}`
    );
    const blobfav = await responsefav.blob();
    const imgfav = new File([blobfav], "image.jpg", { type: blobfav.type });

    setLoader(true);
    try {
      const response: any = await client.mutate({
        mutation: UPDATE_SITE_CONFIG,
        variables: {
          optionKey: optionKey,
          orgTitle: data.org_title,
          orgLogo: logo === null || logo === "" ? imglogo : logo,
          orgFavicon: favIcon === null || favIcon === "" ? imgfav : favIcon,
          companyName: data.company_name,
          companyEmail: data.company_email,
          companyPhone: data.company_phone,
          companyAddress: data?.company_address,
        },
        context: {
          useMultipart: true,
        },
      });
      if (response && response) {
        toast.success("Data updated successfully!");
        setTimeout(() => {
          window.location.replace("/admin/configuration/site_config");
        }, 2000);
        setLoader(false);
      } else {
        console.log("@");
        setLoader(false);
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        const errorMessage = error.message;
        console.log("1err", error);
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
            <h4 className="headingtext">Site Config</h4>
          </div>
          <div className="card cardcss">
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
                      defaultValue={orgTitle}
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
                    <div className="flex justify-content-left imagecss1">
                      <div className="site_image-upload-container">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="imagefilecs"
                        />
                        {(siteImageData &&
                          siteImageData?.org_logo &&
                          logoBlogImage === null) ||
                        logoBlogImage === "" ? (
                          <Image
                            src={
                              process.env.NEXT_PUBLIC_SERVER_API +
                              "/" +
                              siteImageData?.org_logo
                            }
                            alt="Uploaded Preview"
                            className="image-preview"
                            width={55}
                            height={55}
                          />
                        ) : (
                          ""
                        )}
                        {logoBlogImage && (
                          <div className="image-preview-container">
                            <Button
                              icon="pi pi-times"
                              className="remove-image-button"
                              onClick={handleRemoveImage}
                            />
                            <Image
                              src={logoBlogImage}
                              alt="Uploaded Preview"
                              className="image-preview"
                              width={55}
                              height={55}
                            />
                          </div>
                        )}
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
                    <div className="flex justify-content-left imagecss1">
                      <div className="site_image-upload-container">
                        <input
                          ref={fileIconInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFavIconUpload}
                          className="imagefilecs"
                        />
                        {(siteImageData &&
                          siteImageData?.org_favicon &&
                          favIconBlogImage === null) ||
                        favIconBlogImage === "" ? (
                          <Image
                            src={
                              process.env.NEXT_PUBLIC_SERVER_API +
                              "/" +
                              siteImageData?.org_favicon
                            }
                            alt="Uploaded Preview"
                            className="image-preview"
                            width={55}
                            height={55}
                          />
                        ) : (
                          ""
                        )}
                        {favIconBlogImage && (
                          <div className="image-preview-container">
                            <Button
                              icon="pi pi-times"
                              className="remove-image-button"
                              onClick={handleIconRemoveImage}
                            />
                            <Image
                              src={favIconBlogImage}
                              alt="Uploaded Preview"
                              className="image-preview"
                              width={55}
                              height={55}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <br />
                  <div className="flex flex-column gap-2">
                    <label htmlFor="username" className="stripeheading">
                      Company Name
                    </label>
                    <InputText
                      id="company_name"
                      type="text"
                      {...register("company_name")}
                      placeholder="Company Name"
                      className="inputfieldcss"
                      defaultValue={companyName}
                    />
                    {errors && errors.company_name ? (
                      <p className="errorcss">
                        <small id="username-help">
                          {ErrorFormMsg(errors?.company_name?.message)}
                        </small>
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div>
                  <br />
                  <div className="flex flex-column gap-2">
                    <label htmlFor="username" className="stripeheading">
                      Company Email
                    </label>
                    <InputText
                      id="company_email"
                      type="text"
                      {...register("company_email")}
                      placeholder="Company Email"
                      className="inputfieldcss"
                      defaultValue={companyEmail}
                    />
                    {errors && errors.company_email ? (
                      <p className="errorcss">
                        <small id="username-help">
                          {ErrorFormMsg(errors?.company_email?.message)}
                        </small>
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div>
                  <br />
                  <div className="flex flex-column gap-2">
                    <label htmlFor="username" className="stripeheading">
                      Company Phone
                    </label>
                    <InputText
                      id="company_phone"
                      type="text"
                      {...register("company_phone")}
                      placeholder="Company Phone"
                      className="inputfieldcss"
                      defaultValue={companyPhone}
                    />
                    {errors && errors.company_phone ? (
                      <p className="errorcss">
                        <small id="username-help">
                          {ErrorFormMsg(errors?.company_phone?.message)}
                        </small>
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div>
                  <br />
                  <div className="flex flex-column gap-2">
                    <label htmlFor="username" className="stripeheading">
                      Company Address
                    </label>
                    <InputText
                      id="company_address"
                      type="text"
                      {...register("company_address")}
                      placeholder="Company Address"
                      className="inputfieldcss"
                      defaultValue={companyAddress}
                    />
                    {errors && errors.company_address ? (
                      <p className="errorcss">
                        <small id="username-help">
                          {ErrorFormMsg(errors?.company_address?.message)}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteConfiguration;
