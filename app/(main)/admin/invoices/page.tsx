"use client";
import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { ApolloError } from "@apollo/client";
import { toast } from "react-toastify";
import client from "@/app/api/lib/apollo-client";
import { GET_ALL_INVOICES } from "@/app/api/lib/graphql_queries";
import { Divider } from "primereact/divider";
import { ConfirmPopup } from "primereact/confirmpopup";
import moment from "moment";
import Spinner from "../../Comman/spinner/page";

interface DataItem {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<any>([]);
  const [selectedItems, setSelectedItems] = useState<DataItem[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleEdit = (item: DataItem) => {
    window.location.replace(`/admin/invoice_details?id=${item.id}`);
  };

  useEffect(() => {
    setLoading(true);
    getAllInvoices();
  }, []);

  const getAllInvoices = async () => {
    setLoading(true);
    try {
      const data = await client.query({
        query: GET_ALL_INVOICES,
      });
      if (data && data?.data?.getOrders) {
        setInvoices(data?.data?.getOrders);
        setLoading(false);
      } else {
        console.log("@");
        setLoading(false);
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        const errorMessage = error.message; // Extract the error message
        toast.error(errorMessage);
        setLoading(false);
      } else {
        console.error("Unexpected Error:", error);
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString: any) => {
    return moment(dateString).format("DD MMM YYYY");
  };

  const renderDate = (rowData: any) => {
    return <span>{formatDate(rowData.payment_date)}</span>;
  };
  const renderInvoiceid = (rowData: any) => {
    return <span>INV-{rowData.id}</span>;
  };

  const renderAmount = (rowData: any) => {
    const currencySymbol = rowData?.currency === "USD" ? "$" : "₹";
    return (
      <span>
        {"$"}
        {rowData.amount}
      </span>
    );
  };

  const filteredInvoices = invoices.filter((invoice: any) => {
    if (!invoice) return false;

    const lowerCaseInvoice = { ...invoice };
    Object.keys(lowerCaseInvoice).forEach((key) => {
      if (typeof lowerCaseInvoice[key] === "string") {
        lowerCaseInvoice[key] = lowerCaseInvoice[key].toLowerCase();
      }
    });
    return (
      (lowerCaseInvoice?.id &&
        `INV-${lowerCaseInvoice?.id}`
          .toLowerCase()
          .includes(globalFilter?.toLowerCase())) ||
      moment(lowerCaseInvoice.date)
        .format("DD MMM YYYY")
        .includes(globalFilter) ||
      lowerCaseInvoice?.amount?.toString()?.includes(globalFilter)
    );
  });

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div className="datatable-editing-demo">
            <div className="wrapperclass">
              <div className="headingcs">
                <h4 className="headingtext">Invoices</h4>
              </div>
              <div className="p-inputgroup inputSearch">
                <InputText
                  placeholder="Search"
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="searchboxcss"
                />
                <Button icon="pi pi-search" className="searchIcon" />
              </div>
            </div>
            <Divider />
            <ConfirmPopup />

            {!loading ? (
              <DataTable
                value={filteredInvoices}
                selectionMode="multiple"
                selection={selectedItems}
                onSelectionChange={(e) => setSelectedItems(e.value)}
                first={first}
                rows={rows}
                paginator={true}
                paginatorPosition="bottom"
                onPage={(e) => {
                  setFirst(e.first);
                  setRows(e.rows);
                }}
                rowsPerPageOptions={[10, 15, 20]}
                className="datacsstable invoicecsstable"
              >
                <Column field="id" header="Invoice" body={renderInvoiceid} />
                {/* <Column field="transaction_id" header="Transaction Id" /> */}
                <Column field="payment_date" header="Date" body={renderDate} />
                <Column field="amount" header="Amount" body={renderAmount} />
                <Column
                  body={(rowData: any) => (
                    <Button
                      icon="pi pi-eye"
                      onClick={() => handleEdit(rowData)}
                      className="pencilcs"
                    />
                  )}
                />
              </DataTable>
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

export default Invoices;
