"use client";
import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import { ApolloError, gql } from "@apollo/client";
import client from "@/app/api/lib/apollo-client";
import { GET_USER_DETAIL_BY_ID } from "@/app/api/lib/graphql_queries";
import { toast } from "react-toastify";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { profileFormvalidation } from "@/app/validation/validations";
import { ErrorFormMsg } from "@/demo/components/ErrorMessgae";
import { UPDATE_USER } from "@/app/api/lib/graphql_mutation";
import { nextLocalStorage } from "@/app/utils/commonFuns";

interface ProfileField {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const user_id: any = nextLocalStorage()?.getItem("id");
  const [loader, setLoader] = useState(false);
  const [profileData, setProfileData] = useState<any>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(profileFormvalidation),
  });

  const onSubmit = async (data: any) => {
    setLoader(true);
    try {
      const response: any = await client.mutate({
        mutation: UPDATE_USER,
        variables: {
          id: parseInt(user_id),
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
        },
      });
      if (response && response?.data) {
        getUserDetail(user_id);
        toast.success("Details updated successfully!");
        handleEditToggle();
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

  useEffect(() => {
    getUserDetail(user_id);
  }, [user_id]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const getUserDetail = async (id: any) => {
    try {
      const data = await client.query({
        query: GET_USER_DETAIL_BY_ID,
        variables: {
          id: parseInt(id),
        },
      });
      if (data && data?.data) {
        setProfileData(data?.data?.getUserById);
        setValue("first_name", data?.data?.getUserById.first_name);
        setValue("last_name", data?.data?.getUserById.last_name);
        setValue("email", data?.data?.getUserById.email);
        setValue("phone", data?.data?.getUserById.phone);
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

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div>
            <div className="profilegrid">
              <div className="content-center">
                <h1>Profile</h1>
              </div>
              <div className="togglebtn">
                <ToggleButton
                  checked={editMode}
                  onChange={handleEditToggle}
                  onLabel="Cancel"
                  offLabel="Edit"
                  className="toggleBtn"
                />
              </div>
            </div>
            <br />
            <div className="textareacenter">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                  {editMode ? (
                    <div className="flex flex-column gap-2">
                      <label htmlFor="username">First Name</label>
                      <InputText
                        id="first_name"
                        type="text"
                        {...register("first_name")}
                        placeholder="First name"
                        className="inputcss"
                      />
                      {errors && errors.first_name ? (
                        <p className="errorcss">
                          <small id="username-help">
                            {ErrorFormMsg(errors?.first_name?.message)}
                          </small>
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-column gap-2">
                      <label htmlFor="username">First Name</label>
                      <InputText
                        id="first_name"
                        type="text"
                        value={profileData.first_name}
                        placeholder="First name"
                        className="inputcss"
                        disabled
                      />
                    </div>
                  )}
                </div>
                <br />
                <div>
                  {editMode ? (
                    <div className="flex flex-column gap-2">
                      <label htmlFor="username">Last Name</label>
                      <InputText
                        id="last_name"
                        type="text"
                        {...register("last_name")}
                        placeholder="Last name"
                        className="inputcss"
                      />
                      {errors && errors.last_name ? (
                        <p className="errorcss">
                          <small id="username-help">
                            {ErrorFormMsg(errors?.last_name?.message)}
                          </small>
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-column gap-2">
                      <label htmlFor="username">Last Name</label>
                      <InputText
                        id="last_name"
                        type="text"
                        placeholder="Last name"
                        value={profileData.last_name}
                        className="inputcss"
                        disabled
                      />
                    </div>
                  )}
                </div>
                <br />
                <div>
                  {editMode ? (
                    <div className="flex flex-column gap-2">
                      <label htmlFor="username">Email</label>
                      <InputText
                        id="email"
                        type="text"
                        {...register("email")}
                        placeholder="Email"
                        className="inputcss"
                      />
                      {errors && errors.email ? (
                        <p className="errorcss">
                          <small id="username-help">
                            {ErrorFormMsg(errors?.email?.message)}
                          </small>
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-column gap-2">
                      <label htmlFor="username">Email</label>
                      <InputText
                        id="email"
                        type="text"
                        value={profileData.email}
                        placeholder="Email"
                        className="inputcss"
                        disabled
                      />
                    </div>
                  )}
                </div>
                <br />
                <div>
                  {editMode ? (
                    <div className="flex flex-column gap-2">
                      <label htmlFor="username">Phone</label>
                      <InputText
                        id="phone"
                        type="text"
                        {...register("phone")}
                        placeholder="Phone"
                        className="inputcss"
                      />
                      {errors && errors.phone ? (
                        <p className="errorcss">
                          <small id="username-help">
                            {ErrorFormMsg(errors?.phone?.message)}
                          </small>
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-column gap-2">
                      <label htmlFor="username">Phone</label>
                      <InputText
                        id="phone"
                        type="text"
                        value={profileData.phone}
                        placeholder="Phone"
                        className="inputcss"
                        disabled
                      />
                    </div>
                  )}
                </div>
                <br />
                <br />
                <div>
                  {editMode &&
                    (!loader ? (
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
                    ))}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
