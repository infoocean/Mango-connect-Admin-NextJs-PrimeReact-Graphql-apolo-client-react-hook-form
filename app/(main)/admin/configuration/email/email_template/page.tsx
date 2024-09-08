"use client";
import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  emailSubject,
  usersFormvalidation,
} from "@/app/validation/validations";
import { Divider } from "primereact/divider";
import { ConfirmPopup } from "primereact/confirmpopup";
import { useRouter, useSearchParams } from "next/navigation";
import { GET_EMAIL_TEMPLATE_DETAIL } from "@/app/api/lib/graphql_queries";
import client from "@/app/api/lib/apollo-client";
import { ApolloError } from "@apollo/client";
import { toast } from "react-toastify";
import CodeMirror from "@uiw/react-codemirror";
import { TabView, TabPanel } from "primereact/tabview";
import { InputText } from "primereact/inputtext";
import { ErrorFormMsg, ErrorTemplateMsg } from "@/demo/components/ErrorMessgae";
import { UPDATE_EMAIL_TEMPLATE } from "@/app/api/lib/graphql_mutation";
import Spinner from "@/app/(main)/Comman/spinner/page";

const EmailDetailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  let getId: any = searchParams.get("id");
  const [emailTemplates, setEmailTemplate] = useState<any>("");
  const [subjectEmail, setSubjectEmail] = useState<any>("");
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: {},
  } = useForm<any>({
    resolver: yupResolver(emailSubject),
  });

  useEffect(() => {
    setLoading(true);
    getEmailTemplates();
  }, []);

  const getEmailTemplates = async () => {
    setLoading(true);
    try {
      const data = await client.query({
        query: GET_EMAIL_TEMPLATE_DETAIL,
        variables: {
          id: parseInt(getId),
        },
      });

      if (data && data?.data) {
        setEmailTemplate(data?.data?.getEmailTemplateByid);
        setSubjectEmail(data?.data?.getEmailTemplateByid?.subject);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        const errorMessage = error.message; // Extract the error message
        toast.error(errorMessage);
        setLoading(false);
      } else {
        setLoading(false);

        console.error("Unexpected Error:", error);
      }
    }
  };

  const onSubmitTemplate = async () => {
    if (!subjectEmail.trim()) {
      toast.error("Subject field cannot be empty");
      return;
    }
    setLoader(true);
    try {
      const response: any = await client.mutate({
        mutation: UPDATE_EMAIL_TEMPLATE,
        variables: {
          id: parseInt(getId),
          subject: subjectEmail,
          content: emailTemplates.content,
          email_action: emailTemplates.email_action,
        },
      });
      if (response && response) {
        toast.success("Template updated successfully!");
        setLoader(false);
        setTimeout(() => {
          window.location.replace("/admin/configuration/email");
        }, 1000);
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
  const handleBack = () => {
    router.push("/admin/configuration/email");
  };

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div className="datatable-editing-demo">
            <div className="wrapperclass">
              <div className="headingcs">
                <h4 className="headingtext">Template Detail</h4>
              </div>
              <div className="backbtn">
                <Button
                  label="Back To List"
                  className="p-button-success btnsave"
                  onClick={handleBack}
                  icon="pi pi-arrow-left"
                />
              </div>
            </div>
            <Divider />
            {!loading ? (
              <form onSubmit={handleSubmit(onSubmitTemplate)}>
                <div className="templateheading">
                  <div style={{ display: "flex", width: "70%" }}>
                    <h5 className="subjectcs">Subject </h5>
                    <InputText
                      id="subject"
                      type="text"
                      placeholder="subject"
                      className="inputfieldtemplate"
                      defaultValue={subjectEmail}
                      onChange={(e: any) => setSubjectEmail(e.target.value)}
                    />
                  </div>
                  <div className="btntemplate">
                    {!loader ? (
                      <Button
                        label="Save"
                        type="submit"
                        className="p-button-success btnsave"
                        onClick={onSubmitTemplate}
                      />
                    ) : (
                      <Button
                        label="Saving..."
                        type="submit"
                        className="p-button-success btnsave"
                      />
                    )}
                  </div>
                </div>
                <ConfirmPopup />
                <div className="card">
                  <TabView>
                    <TabPanel
                      header="Edit"
                      leftIcon="pi pi-pencil"
                      className="previewCss"
                    >
                      <CodeMirror
                        height="383px"
                        maxWidth="100%"
                        value={emailTemplates?.content}
                        onChange={(e) => {
                          setEmailTemplate({ ...emailTemplates, content: e });
                        }}
                      />
                    </TabPanel>
                    <TabPanel
                      header="Preview"
                      leftIcon="pi pi-eye"
                      className="previewCss"
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: emailTemplates?.content,
                        }}
                      ></div>
                    </TabPanel>
                  </TabView>
                </div>
              </form>
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

export default EmailDetailPage;
