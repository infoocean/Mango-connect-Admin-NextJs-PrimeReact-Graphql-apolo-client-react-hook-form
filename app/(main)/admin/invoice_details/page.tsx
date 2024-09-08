"use client";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Divider } from "primereact/divider";
import { ConfirmPopup } from "primereact/confirmpopup";
import { toast } from "react-toastify";
import Spinner from "@/app/(main)/Comman/spinner/page";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { refundValidation } from "@/app/validation/validations";
import { ErrorFormMsg } from "@/demo/components/ErrorMessgae";
import { ApolloError } from "@apollo/client";
import client from "@/app/api/lib/apollo-client";
import "react-datepicker/dist/react-datepicker.css";
import { Dialog } from "primereact/dialog";
import moment from "moment";
import { capitalizeF, formatTime } from "@/app/utils/commonFuns";
import { GET_INVOICES_BY_ID } from "@/app/api/lib/graphql_queries";
import { UPDATE_REFUND_AMOUNT } from "@/app/api/lib/graphql_mutation";

const InvoiceDetail: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [invoices, setInvoices] = useState<any>([]);
  const searchParams = useSearchParams();
  let getId: any = searchParams.get("id");
  const [returnPopupOpen, setReturnPopupOpen] = useState<any>(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(refundValidation(invoices?.amount || 0)),
  });

  useEffect(() => {
    setLoading(true);
    getInvoices();
  }, []);

  const getInvoices = async () => {
    setLoading(true);
    try {
      const data = await client.query({
        query: GET_INVOICES_BY_ID,
        variables: {
          orderId: parseInt(getId),
        },
      });
      if (data && data?.data) {
        setInvoices(data?.data?.getOrderDetailsById[0]);
        setValue("amount", data?.data?.getOrderDetailsById[0]?.amount);
        setLoading(false);
      } else {
        console.log("@");
        setLoading(false);
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        const errorMessage = error.message;
        toast.error(errorMessage);
        setLoading(false);
      } else {
        console.error("Unexpected Error:", error);
        setLoading(false);
      }
    }
  };

  const onSubmitSiteConfig = async (data: any) => {
    setLoader(true);
    try {
      const response: any = await client.mutate({
        mutation: UPDATE_REFUND_AMOUNT,
        variables: {
          scheduleId: invoices?.schedule_id,
          amount: parseInt(data.amount),
        },
      });
      if (response && response) {
        toast.success("Amount refund successfully!");
        setTimeout(() => {
          router.push("/admin/invoices");
        }, 2000);
        setLoader(false);
      } else {
        console.log("@");
        setLoader(false);
        setReturnPopupOpen(false);
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        const errorMessage = error.message;
        toast.error(errorMessage);
        setLoader(false);
        setReturnPopupOpen(false);
      } else {
        setLoader(false);
        setReturnPopupOpen(false);
        console.error("Unexpected Error:", error);
      }
    }
  };

  const handleBack = () => {
    router.push("/admin/invoices");
  };

  const handleClose = () => {
    setReturnPopupOpen(false);
  };

  const handleReturn = () => {
    setReturnPopupOpen(true);
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
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div className="datatable-editing-demo">
            <div className="wrapperclass">
              <div className="headingcs">
                <h4 className="headingtext">Invoice Details</h4>
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
            {/* <Divider /> */}
            <ConfirmPopup />
            {!loading ? (
              <>
                <div className="card cardcss schdules" ref={tableRef}>
                  <div className="grid servicess">
                    <div className="col-12 lg:col-12 xl:col-12">
                      <div className="card mb-0 cardblock flexfiv">
                        <div>
                          <h4>
                            {invoices?.user?.first_name}{" "}
                            {invoices?.user?.last_name}
                          </h4>
                          <p className="emailcsinv">
                            <i
                              className="pi pi-envelope"
                              style={{ fontSize: "1rem" }}
                            ></i>
                            &nbsp; {invoices?.user?.email}
                          </p>
                          <p>
                            <i
                              className="pi pi-phone"
                              style={{ fontSize: "1rem" }}
                            ></i>
                            &nbsp; {invoices?.user?.phone}
                          </p>
                        </div>
                        <div className="maininvoicediv">
                          <div className="invoicediv11">
                            <div className="innerdiv11">
                              <p className="invoicehead">Invoice Id</p>
                            </div>
                            <div className="innerdiv12">
                              <p className="subhead">INV-{invoices?.id}</p>
                            </div>
                          </div>
                          <div className="invoicediv11">
                            <div className="innerdiv11">
                              <p className="invoicehead">Date</p>
                            </div>
                            <div className="innerdiv12">
                              <p className="subhead">
                                {moment(invoices?.payment_date).format(
                                  "MMM DD, YYYY"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* <Divider /> */}
                    </div>
                    <br />
                  </div>
                  <div className="grid servicess invoice">
                    <div className="col-12 lg:col-6 xl:col-6">
                      <div className="card mb-0 card1">
                        <h5 className="h5heading">Service</h5>
                        <div className="invoicesp">
                          <div className="innerdiv">
                            <p className="para1divv">Name</p>
                          </div>
                          <div className="innerdiv1">
                            <p>{invoices?.schedule?.service?.name}</p>
                          </div>
                        </div>

                        <div className="invoicesp">
                          <div className="innerdiv">
                            <p className="para1divv">Amount</p>
                          </div>
                          <div className="innerdiv1">
                            <p>${invoices?.schedule?.service?.fee}</p>
                          </div>
                        </div>

                        <div className="invoicesp">
                          <div className="innerdiv">
                            <p className="para1divv">Duration</p>
                          </div>
                          <div className="innerdiv1">
                            <p>{invoices?.schedule?.service?.duration} min</p>
                          </div>
                        </div>

                        <div className="invoicesp">
                          <div className="innerdiv">
                            <p className="para1divv">Type</p>
                          </div>
                          <div className="innerdiv1">
                            <p>
                              {capitalizeF(invoices?.schedule?.service?.type)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 lg:col-6 xl:col-6">
                      <div className="card mb-0 card1 card1a">
                        <h5 className="h5heading">Appointment</h5>

                        <div className="invoicesp">
                          <div className="innerdiv">
                            <p className="para1divv">Date</p>
                          </div>
                          <div className="innerdiv1">
                            <p>
                              {moment(invoices?.schedule?.date).format(
                                "MMM DD, YYYY"
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="invoicesp">
                          <div className="innerdiv">
                            <p className="para1divv">Time</p>
                          </div>
                          <div className="innerdiv1">
                            <p>
                              {formatTime(invoices?.schedule?.start_time)} -{" "}
                              {formatTime(invoices?.schedule?.end_time)}
                            </p>
                          </div>
                        </div>

                        <div className="invoicesp">
                          <div className="innerdiv">
                            <p className="para1divv">Type</p>
                          </div>
                          <div className="innerdiv1">
                            <p>{capitalizeF(invoices?.schedule?.type)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 lg:col-6 xl:col-6">
                      <div className="card mb-0 card1">
                        <h5 className="h5heading">Transaction</h5>
                        <div className="invoicesp">
                          <div className="innerdiv">
                            <p className="para1divv">Amount</p>
                          </div>
                          <div className="innerdiv1">
                            <p>${invoices?.amount}</p>
                          </div>
                        </div>

                        <div className="invoicesp">
                          <div className="innerdiv">
                            <p className="para1divv">Date</p>
                          </div>
                          <div className="innerdiv1">
                            <p>
                              {moment(invoices?.schedule?.date).format(
                                "MMM DD, YYYY"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="invoicesp">
                          <div className="innerdiv">
                            <p className="para1divv">Status</p>
                          </div>
                          <div className="innerdiv1">
                            <p>{capitalizeF(invoices?.status)}</p>
                          </div>
                        </div>
                        <div className="invoicesp">
                          <div className="innerdiv">
                            <p className="para1divv">Transaction Id</p>
                          </div>
                          <div className="innerdiv1">
                            <CopyableInputText
                              id="calender_id"
                              type="text"
                              placeholder="Transaction id"
                              className="inputfieldcss"
                              value={invoices?.transaction_id}
                            />
                          </div>
                        </div>
                        {invoices?.schedule?.status === "canceled" ? (
                          invoices?.refund_amount === null &&
                          invoices?.refund_id === null ? (
                            <>
                              <br />
                              <Button
                                type="button"
                                label="Amount Refund"
                                className="p-button-success btnsave"
                                icon="pi pi-refresh"
                                iconPos="left"
                                onClick={handleReturn}
                              />
                            </>
                          ) : (
                            <>
                              <div className="invoicesp">
                                <div className="innerdiv">
                                  <p className="para1divv">
                                    Refunded Id &nbsp;
                                  </p>
                                </div>
                                <div className="innerdiv1">
                                  <CopyableInputText
                                    id="calender_id"
                                    type="text"
                                    placeholder="Transaction id"
                                    className="inputfieldcss"
                                    value={invoices?.refund_id}
                                  />
                                </div>
                              </div>
                              <div className="invoicesp">
                                <div className="innerdiv">
                                  <p className="para1divv">
                                    Refunded Amount &nbsp;
                                  </p>
                                </div>
                                <div className="innerdiv1">
                                  <p>${invoices?.refund_amount}</p>
                                </div>
                              </div>
                            </>
                          )
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="spinnerclass">
                <Spinner />
              </div>
            )}

            <Dialog
              visible={returnPopupOpen}
              onHide={handleClose}
              header="Please enter the amount to return to the customer."
              modal
              style={{ width: "352px" }}
            >
              <div className="calendar-container">
                <form onSubmit={handleSubmit(onSubmitSiteConfig)}>
                  <div>
                    <div className="flex flex-column gap-2 popuprefund">
                      <label htmlFor="username" className="stripeheading">
                        Amount
                      </label>
                      <InputText
                        id="amount"
                        type="text"
                        {...register("amount")}
                        placeholder="Enter refund amount"
                        className="inputfieldcss"
                        defaultValue={""}
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
                    <span className="calenderpopoubtn">
                      <Button
                        type="button"
                        label="Cancel"
                        onClick={handleClose}
                        className="cancelbtncalender"
                      />
                      {!loader ? (
                        <Button
                          type="submit"
                          label="Return"
                          className="applybtnreturn"
                        />
                      ) : (
                        <Button
                          type="submit"
                          label="Processing..."
                          className="applybtnreturn"
                          icon="pi pi-spin pi-spinner"
                          iconPos="left"
                        />
                      )}
                    </span>
                  </div>
                </form>
              </div>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
