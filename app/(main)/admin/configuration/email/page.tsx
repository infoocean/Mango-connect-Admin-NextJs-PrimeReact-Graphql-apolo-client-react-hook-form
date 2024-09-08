"use client";
import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { ApolloError } from "@apollo/client";
import { toast } from "react-toastify";
import client from "@/app/api/lib/apollo-client";
import { GET_EMAIL_TEMPLATES } from "@/app/api/lib/graphql_queries";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { usersFormvalidation } from "@/app/validation/validations";
import { UPDATE_USER } from "@/app/api/lib/graphql_mutation";
import { Divider } from "primereact/divider";
import { ConfirmPopup } from "primereact/confirmpopup";
import { InputTextarea } from "primereact/inputtextarea";
import { useRouter } from "next/navigation";
import { ErrorFormMsg } from "@/demo/components/ErrorMessgae";
import Spinner from "@/app/(main)/Comman/spinner/page";

interface DataItem {
  id: number;
  subject: string;
  content: string;
}

const Email: React.FC = () => {
  const router = useRouter();
  const [displayDialog, setDisplayDialog] = useState(false);
  const [editedItem, setEditedItem] = useState<DataItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<DataItem[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [first, setFirst] = useState(0); // Index of the first record
  const [rows, setRows] = useState(10); // Number of rows per page
  const [emailTemplate, setEmailTemplate] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const handleView = (item: DataItem) => {
    setEditedItem(item);
    router.push(`/admin/configuration/email/email_template?id=${item.id}`);
    setDisplayDialog(true);
  };

  useEffect(() => {
    setLoading(true);
    getEmailTemplates();
  }, []);

  const getEmailTemplates = async () => {
    setLoading(true);
    try {
      const data = await client.query({
        query: GET_EMAIL_TEMPLATES,
      });
      if (data && data?.data) {
        setEmailTemplate(data?.data?.getEmailTemplates);
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

  const filteredUsers = emailTemplate.filter((email: any) => {
    if (!email) return false; // Check if email is null or undefined
    const lowerCaseFilter = globalFilter.toLowerCase();
    const idMatch = email.id && email.id.toString().includes(lowerCaseFilter);
    const subject =
      email.subject && email.subject.toLowerCase().includes(lowerCaseFilter);

    return idMatch || subject;
  });

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div className="datatable-editing-demo">
            <div className="wrapperclass">
              <div className="headingcs">
                <h4 className="headingtext">Email Templates</h4>
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
                value={filteredUsers}
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
                className="datacsstable"
              >
                <Column field="id" header="Id" />
                <Column field="subject" header="Subject" />

                <Column
                  body={(rowData: any) => (
                    <Button
                      icon="pi pi pi-eye"
                      onClick={() => handleView(rowData)}
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

export default Email;
