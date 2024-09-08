"use client";
import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Paginator } from "primereact/paginator";
import { ApolloError } from "@apollo/client";
import { toast } from "react-toastify";
import client from "@/app/api/lib/apollo-client";
import { DELETE_BULK_USER, GET_USERS } from "@/app/api/lib/graphql_queries";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ErrorFormMsg } from "@/demo/components/ErrorMessgae";
import { usersFormvalidation } from "@/app/validation/validations";
import { UPDATE_USER } from "@/app/api/lib/graphql_mutation";
import { Divider } from "primereact/divider";
import { ConfirmPopup } from "primereact/confirmpopup";
import { Dropdown } from "primereact/dropdown";
import Spinner from "../../Comman/spinner/page";

interface DataItem {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: number;
}

const Customers: React.FC = () => {
  const [users, setUsers] = useState<any>([]);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [deleteDisplayDialog, setDeleteDisplayDialog] = useState(false);
  const [editedItem, setEditedItem] = useState<DataItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<DataItem[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [first, setFirst] = useState(0); // Index of the first record
  const [rows, setRows] = useState(10); // Number of rows per page
  const [loader, setLoader] = useState(false);
  const [userId, setUserId] = useState<any>(false);
  const [selectedStatus, setSelectedStatus] = useState<any>("");
  const [loading, setLoading] = useState(false);

  const statusType = [{ name: "Active" }, { name: "Inactive" }];
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(usersFormvalidation),
  });

  const handleEdit = (item: DataItem) => {
    setValue("id", item.id);
    setValue("first_name", item.first_name);
    setValue("last_name", item.last_name);
    setValue("email", item.email);
    setValue("phone", item.phone);
    setValue("status", item.status);
    setSelectedStatus({ name: item.status === 0 ? "Inactive" : "Active" });
    setEditedItem(item);
    setDisplayDialog(true);
  };

  const handlePopupOpen = (data: any) => {
    setUserId(data.id);
    setDeleteDisplayDialog(true);
  };

  const handleSingleDelete = async () => {
    const userIdArray = [userId];
    try {
      const data = await client.query({
        query: DELETE_BULK_USER,
        variables: {
          ids: userIdArray,
        },
      });
      if (data && data?.data?.deleteBulkUser) {
        const remainingUsers = users?.filter(
          (user: any) => !userIdArray.includes(user.id)
        );
        setDeleteDisplayDialog(false);
        setUsers(remainingUsers);
        toast.success("Customer delete successfully");
      } else {
        console.log("@");
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        const errorMessage = error.message; // Extract the error message
        toast.error(errorMessage);
        setDeleteDisplayDialog(false);
      } else {
        // Handle other types of errors
        console.error("Unexpected Error:", error);
      }
    }
  };

  const handleDelete = async () => {
    const ids = selectedItems && selectedItems?.map((user) => user.id);
    try {
      const data = await client.query({
        query: DELETE_BULK_USER,
        variables: {
          ids: ids,
        },
      });
      if (data && data?.data?.deleteBulkUser) {
        const remainingUsers = users.filter(
          (user: any) =>
            !selectedItems.find((selected) => selected.id === user.id)
        );
        setUsers(remainingUsers);
        setSelectedItems([]);
        toast.success("Selected customers deleted successfully");
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

  useEffect(() => {
    setLoading(true);
    getUserList();
  }, []);

  const getUserList = async () => {
    setLoading(true);
    try {
      const data = await client.query({
        query: GET_USERS,
      });
      if (data && data?.data?.getUsers) {
        setUsers(data?.data?.getUsers);
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

  const onSubmit = async (data: any) => {
    setLoader(true);
    try {
      const response: any = await client.mutate({
        mutation: UPDATE_USER,
        variables: {
          id: parseInt(data.id),
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          status: selectedStatus && selectedStatus?.name === "Active" ? 1 : 0,
        },
      });
      if (response && response?.data) {
        const updatedUser = response?.data?.updateUser; // Assuming the mutation returns the updated user object
        setUsers((prevUsers: any) =>
          prevUsers.map((user: any) =>
            user.id === updatedUser.id ? updatedUser : user
          )
        );
        toast.success("Details updated successfully!");
        setDisplayDialog(false);
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

  const renderStatus = (rowData: DataItem) => {
    const statusText = rowData.status === 1 ? "Active" : "Inactive";
    const statusColor = rowData.status === 1 ? "green" : "red";
    return <span style={{ color: statusColor }}>{statusText}</span>;
  };

  const headerCheckbox = (
    <Checkbox
      className="checckkboxcs"
      checked={selectedItems.length === users && users.length}
      onChange={(e) => setSelectedItems(e.checked ? [...users] : [])}
    />
  );

  const filteredUsers = users.filter((user: any) => {
    if (!user) return false; // Check if user is null or undefined
    const lowerCaseFilter = globalFilter.toLowerCase();
    const idMatch = user.id && user.id.toString().includes(lowerCaseFilter);
    const firstNameMatch =
      user.first_name &&
      user.first_name.toLowerCase().includes(lowerCaseFilter);
    const lastNameMatch =
      user.last_name && user.last_name.toLowerCase().includes(lowerCaseFilter);
    const emailMatch =
      user.email && user.email.toLowerCase().includes(lowerCaseFilter);
    const phoneMatch =
      user.phone && user.phone.toLowerCase().includes(lowerCaseFilter);
    const statusMatch =
      (user.status === 1 && "active".includes(lowerCaseFilter)) ||
      (user.status === 0 && "inactive".includes(lowerCaseFilter));

    return (
      idMatch ||
      firstNameMatch ||
      lastNameMatch ||
      emailMatch ||
      phoneMatch ||
      statusMatch
    );
  });

  const handleClose = () => {
    setDeleteDisplayDialog(false);
  };

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div className="datatable-editing-demo">
            <div className="wrapperclass">
              <div className="headingcs">
                <h4 className="headingtext">Customers</h4>
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
            <div className="multipledelete">
              {selectedItems && selectedItems?.length === 0 ? (
                <Button
                  label={`${
                    selectedItems && selectedItems.length
                  } Customers Selected `}
                  icon="pi pi-trash"
                  iconPos="right"
                  disabled
                  className="deletedbtncs"
                />
              ) : (
                <Button
                  label={`${
                    selectedItems && selectedItems.length
                  } Users Selected `}
                  icon="pi pi-trash"
                  iconPos="right"
                  onClick={handleDelete}
                  className="deletedbtncs"
                />
              )}
            </div>
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
                <Column
                  selectionMode="multiple"
                  header={headerCheckbox}
                  className="chckboxcss"
                />
                <Column field="id" header="Id" />
                <Column field="first_name" header="First Name" />
                <Column field="last_name" header="Last Name" />
                <Column field="email" header="Email" />
                <Column field="phone" header="Phone" />
                <Column field="status" header="Status" body={renderStatus} />

                <Column
                  body={(rowData: any) => (
                    <Button
                      icon="pi pi-pencil"
                      onClick={() => handleEdit(rowData)}
                      className="pencilcs"
                    />
                  )}
                />
                <Column
                  body={(rowData: any) => (
                    <Button
                      icon="pi pi-trash"
                      onClick={() => handlePopupOpen(rowData)}
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

            <Dialog
              header="Edit Customer"
              visible={displayDialog}
              className="dialogwidth"
              onHide={() => setDisplayDialog(false)}
            >
              <div className="p-grid p-fluid">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div>
                    <div className="flex flex-column gap-2 displaynone">
                      <label htmlFor="username">Id</label>
                      <InputText
                        id="id"
                        type="text"
                        {...register("id")}
                        placeholder="Id"
                        className="inputfieldcss"
                      />
                    </div>
                    <div className="flex flex-column gap-2">
                      <label htmlFor="username">First Name</label>
                      <InputText
                        id="first_name"
                        type="text"
                        {...register("first_name")}
                        placeholder="First name"
                        className="inputfieldcss"
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
                  </div>
                  <br />
                  <div>
                    <div className="flex flex-column gap-2">
                      <label htmlFor="username">Last Name</label>
                      <InputText
                        id="last_name"
                        type="text"
                        {...register("last_name")}
                        placeholder="Last name"
                        className="inputfieldcss"
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
                  </div>
                  <br />
                  <div>
                    <div className="flex flex-column gap-2">
                      <label htmlFor="username">Email</label>
                      <InputText
                        id="email"
                        type="text"
                        {...register("email")}
                        placeholder="Email"
                        className="inputfieldcss"
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
                  </div>
                  <br />
                  <div>
                    <div className="flex flex-column gap-2">
                      <label htmlFor="username">Phone</label>
                      <InputText
                        id="phone"
                        type="text"
                        {...register("phone")}
                        placeholder="Phone"
                        className="inputfieldcss"
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
                  </div>
                  <br />
                  <div>
                    <div className="flex flex-column gap-2">
                      <label htmlFor="username">Status</label>
                      <div className="flex justify-content-left">
                        <Dropdown
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.value)}
                          options={statusType}
                          optionLabel="name"
                          placeholder="Status"
                          className="w-full typedropdown"
                        />
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
            </Dialog>

            <Dialog
              header="Delete Customer"
              visible={deleteDisplayDialog}
              className="dialogwidth popup"
              onHide={() => setDeleteDisplayDialog(false)}
            >
              <div className="p-grid p-fluid">
                <div className="deleteiconcs">
                  <div>
                    <Button
                      icon="pi pi-exclamation-triangle"
                      className="exclamanition"
                    />
                  </div>
                  <p className="deletemessage">
                    Do you want to delete this customer?
                  </p>
                </div>
                <br />
                <br />
                <div className="btndeletepopup">
                  <Button
                    label=" No"
                    type="submit"
                    className="p-button-success btnsave popupdel"
                    onClick={() => handleClose()}
                  />
                  {!loader ? (
                    <>
                      <Button
                        label="Yes"
                        type="submit"
                        className="p-button-success btnsave popupdel"
                        onClick={() => handleSingleDelete()}
                      />
                    </>
                  ) : (
                    <Button
                      label="Loading..."
                      className="p-button-success btnsave popupdel"
                    />
                  )}
                </div>
              </div>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
