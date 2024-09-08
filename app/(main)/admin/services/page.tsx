"use client";
import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Divider } from "primereact/divider";
import { ConfirmPopup } from "primereact/confirmpopup";
import { toast } from "react-toastify";
import client from "@/app/api/lib/apollo-client";
import {
  DELETE_BULK_SERVICES,
  GET_SERVICES,
} from "@/app/api/lib/graphql_queries";
import Spinner from "../../Comman/spinner/page";
import { ApolloError } from "@apollo/client";
import { Dropdown } from "primereact/dropdown";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Paginator } from "primereact/paginator";
import { Dialog } from "primereact/dialog";

interface DataItem {
  id: number;
  name: string;
  duration: number;
  fee: number;
  image: string;
  type: string;
  status: string;
  short_description: string;
  created_at: string;
  updated_at: string;
}

const Services: React.FC = () => {
  const router = useRouter();
  const [servicesData, setServicesData] = useState<DataItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<DataItem[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [first, setFirst] = useState(1);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Draft", value: "draft" },
    { label: "Archived", value: "archive" },
  ];
  const [deleteDisplayDialog, setDeleteDisplayDialog] = useState(false);
  const [loader, setLoader] = useState(false);
  const [serviceId, setServiceId] = useState<any>("");

  useEffect(() => {
    fetchServices(1, rows, globalFilter, "status", statusFilter);
  }, [first, rows, globalFilter]);

  const fetchServices = async (
    start: number,
    limit: number,
    search: string,
    filterBy: string | null = null,
    filterValue: string | null = null
  ) => {
    setLoading(true);
    try {
      const { data } = await client.query({
        query: GET_SERVICES,
        variables: {
          page: start,
          limit,
          search,
          sortBy: null,
          sortOrder: null,
          filterBy: filterBy,
          filterValue: filterValue,
        },
      });
      if (data?.getServices) {
        const parsedData = JSON.parse(data.getServices);
        setServicesData(parsedData.services);
        setTotalRecords(parsedData.totalCount);
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        toast.error(error.message);
      } else {
        console.error("Unexpected Error:", error);
      }
    } finally {
      setLoading(false);
    }
  };
  const onPageChange = async (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
    fetchServices(
      event.page + 1,
      event.rows,
      globalFilter,
      "status",
      statusFilter
    );
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(e.target.value);
  };

  const durationBodyTemplate = (rowData: DataItem) => {
    return `${rowData.duration} min`;
  };

  const feeBodyTemplate = (rowData: DataItem) => {
    return `$${rowData.fee}`;
  };

  const handleStatusFilterChange = (e: { value: string | null }) => {
    setStatusFilter(e.value);
    fetchServices(1, rows, globalFilter, "status", e.value);
  };

  const statusFilterElement = (
    <Dropdown
      value={statusFilter}
      options={statusOptions}
      onChange={handleStatusFilterChange}
      placeholder="Select a Status"
      className="status-filter-dropdown filter"
      showClear
    />
  );

  const imageBodyTemplate = (rowData: DataItem) => {
    return (
      <Image
        src={process.env.NEXT_PUBLIC_SERVER_API + rowData.image}
        alt={rowData.name}
        width={45}
        height={45}
        className="servicesImage"
      />
    );
  };

  const handleMoveServices = () => {
    router.push("/admin/add_services");
  };

  const handlePopupOpen = (data: any) => {
    setServiceId(data.id);
    setDeleteDisplayDialog(true);
  };

  const handleDelete = async () => {
    const ids = selectedItems && selectedItems?.map((user) => user.id);
    try {
      const data = await client.query({
        query: DELETE_BULK_SERVICES,
        variables: {
          ids: ids,
        },
      });
      if (data && data?.data) {
        const remainingServices = servicesData.filter(
          (service: any) =>
            !selectedItems.find((selected) => selected.id === service.id)
        );
        setServicesData(remainingServices);
        setSelectedItems([]);
        toast.success("Selected services deleted successfully");
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

  const handleClose = () => {
    setDeleteDisplayDialog(false);
  };

  const handleSingleDelete = async () => {
    const serviceIdArray = [serviceId];
    try {
      const data = await client.query({
        query: DELETE_BULK_SERVICES,
        variables: {
          ids: serviceIdArray,
        },
      });
      if (data && data?.data) {
        const remainingServices = servicesData?.filter(
          (servicee: any) => !serviceIdArray.includes(servicee.id)
        );
        setDeleteDisplayDialog(false);
        setServicesData(remainingServices);
        toast.success("Service delete successfully");
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

  const typeBodyTemplate = (rowData: DataItem) => {
    return (
      <span
        style={{
          color: rowData.type === "online" ? "green" : "red",
          fontWeight: "",
        }}
      >
        {rowData.type.charAt(0).toUpperCase() + rowData.type.slice(1)}
      </span>
    );
  };

  const statusBodyTemplate = (rowData: DataItem) => {
    let color;
    switch (rowData.status) {
      case "active":
        color = "green";
        break;
      case "draft":
        color = "blue";
        break;
      case "archive":
        color = "red";
        break;
      default:
        color = "black";
    }
    return (
      <span style={{ color, fontWeight: "" }}>
        {rowData.status.charAt(0).toUpperCase() + rowData.status.slice(1)}
      </span>
    );
  };

  const handleEdit = (data: any) => {
    // router.push(`/admin/services/edit_service?id=${data.id}`);
    window.location.replace(`/admin/edit_service?id=${data.id}`);
  };

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div className="datatable-editing-demo">
            <div className="wrapperclass">
              <div className="headingcs">
                <h4 className="headingtext">Services</h4>
              </div>
              <div className="p-inputgroup inputSearch">
                <InputText
                  placeholder="Search by name"
                  value={globalFilter}
                  onChange={handleFilterChange}
                  className="searchboxcss"
                />
                <Button icon="pi pi-search" className="searchIcon" />
              </div>
            </div>
            <Divider />
            <div className="wrapservices">
              <Button
                label={`${selectedItems.length} Services Selected`}
                icon="pi pi-trash"
                iconPos="right"
                disabled={selectedItems.length === 0}
                onClick={handleDelete}
                className="deletedbtncs"
              />
              <Button
                label="Add Service"
                icon="pi pi-plus"
                iconPos="right"
                className="deletedbtncs"
                onClick={handleMoveServices}
              />
            </div>
            <ConfirmPopup />
            {!loading ? (
              <>
                <DataTable
                  value={servicesData}
                  selectionMode="multiple"
                  selection={selectedItems}
                  onSelectionChange={(e) => setSelectedItems(e.value)}
                  className="datacsstable services"
                >
                  <Column selectionMode="multiple" header="" />
                  <Column field="id" header="Id" />
                  <Column
                    field="image"
                    header="Image"
                    body={imageBodyTemplate}
                  />
                  <Column field="name" header="Name" />
                  <Column
                    field="duration"
                    header="Duration"
                    body={durationBodyTemplate}
                  />
                  <Column field="fee" header="Fee" body={feeBodyTemplate} />
                  <Column field="type" header="Type" body={typeBodyTemplate} />
                  <Column
                    field="status"
                    header="Status"
                    body={statusBodyTemplate}
                    filter
                    filterField="status"
                    filterElement={statusFilterElement}
                    className="filterdropdown"
                  />
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
                <div className="card">
                  <Paginator
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    rowsPerPageOptions={[10, 20, 30]}
                    onPageChange={onPageChange}
                  />
                </div>
              </>
            ) : (
              <div className="spinnerclass">
                <Spinner />
              </div>
            )}
            <Dialog
              header="Delete Service"
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
                    Do you want to delete this service?
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

export default Services;
