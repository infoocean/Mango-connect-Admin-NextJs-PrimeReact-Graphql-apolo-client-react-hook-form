/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "primereact/button";
import { Chart } from "primereact/chart";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Menu } from "primereact/menu";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ProductService } from "../../../../demo/service/ProductService";
import { LayoutContext } from "../../../../layout/context/layoutcontext";
import Link from "next/link";
import { Demo } from "@/types";
import { ChartData, ChartOptions } from "chart.js";
import client from "@/app/api/lib/apollo-client";
import { GET_DASHBOARD_DATA } from "@/app/api/lib/graphql_mutation";
import { capitalizeF, nextLocalStorage } from "@/app/utils/commonFuns";
import { ApolloError } from "@apollo/client";
import { GET_USERS } from "@/app/api/lib/graphql_queries";
import { toast } from "react-toastify";
import Spinner from "../../Comman/spinner/page";

const lineData: ChartData = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "First Dataset",
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      backgroundColor: "#2f4860",
      borderColor: "#2f4860",
      tension: 0.4,
    },
    {
      label: "Second Dataset",
      data: [28, 48, 40, 19, 86, 27, 90],
      fill: false,
      backgroundColor: "#00bb7e",
      borderColor: "#00bb7e",
      tension: 0.4,
    },
  ],
};

const Dashboard = () => {
  const [products, setProducts] = useState<Demo.Product[]>([]);
  const menu1 = useRef<Menu>(null);
  const menu2 = useRef<Menu>(null);
  const [lineOptions, setLineOptions] = useState<ChartOptions>({});
  const { layoutConfig } = useContext(LayoutContext);
  const [data, setdata] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any>([]);

  const applyLightTheme = () => {
    const lineOptions: ChartOptions = {
      plugins: {
        legend: {
          labels: {
            color: "#495057",
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#495057",
          },
          grid: {
            color: "#ebedef",
          },
        },
        y: {
          ticks: {
            color: "#495057",
          },
          grid: {
            color: "#ebedef",
          },
        },
      },
    };

    setLineOptions(lineOptions);
  };

  const applyDarkTheme = () => {
    const lineOptions = {
      plugins: {
        legend: {
          labels: {
            color: "#ebedef",
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#ebedef",
          },
          grid: {
            color: "rgba(160, 167, 181, .3)",
          },
        },
        y: {
          ticks: {
            color: "#ebedef",
          },
          grid: {
            color: "rgba(160, 167, 181, .3)",
          },
        },
      },
    };

    setLineOptions(lineOptions);
  };

  useEffect(() => {
    ProductService.getProductsSmall().then((data) => setProducts(data));
    getDashboarddata();
    setLoading(true);
    nextLocalStorage()?.removeItem("email");
    nextLocalStorage()?.removeItem("resettoken");
    nextLocalStorage()?.removeItem("path");
    nextLocalStorage()?.removeItem("option");
  }, []);

  const getDashboardData = async () => {
    try {
      const data = await client.query({
        query: GET_DASHBOARD_DATA,
      });
      if (data) {
        return data;
      }
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    }
  };

  const getDashboarddata = async () => {
    const result = await getDashboardData();
    setdata(JSON.parse(result?.data?.getDashboardData));
  };

  useEffect(() => {
    if (layoutConfig.colorScheme === "light") {
      applyLightTheme();
    } else {
      applyDarkTheme();
    }
  }, [layoutConfig.colorScheme]);

  return (
    <div className="grid">
      <div className="col-12 lg:col-6 xl:col-4 usercss">
        <div className="card mb-0">
          <div className="flex justify-content-between">
            <div>
              <span className="block text-500 font-medium ">Users</span>
              {/* <div className="text-900 font-medium text-xl">
                {data?.totalUsers}
              </div> */}
            </div>
            <div
              className="flex align-items-center justify-content-center bg-cyan-100 border-round"
              style={{ width: "3rem", height: "3rem" }}
            >
              <i className="pi pi-user text-cyan-500 text-xl" />
            </div>
          </div>
          <span className="text-green-500 font-medium">
            {data?.totalActiveUsers ? data?.totalActiveUsers : 0}
          </span>
          <span className="text-500"> active users</span>
        </div>
      </div>
      <div className="col-12 lg:col-6 xl:col-4 earning">
        <div className="card mb-0">
          <div className="flex justify-content-between">
            <div>
              <span className="block text-500 font-medium">Total Earning</span>
              {/* <div className="text-900 font-medium text-xl">
                $
                {data?.amount?.totalAmount === null
                  ? 0
                  : data?.amount?.totalAmount}
              </div> */}
            </div>
            <div
              className="flex align-items-center justify-content-center bg-orange-100 border-round"
              style={{ width: "3rem", height: "3rem" }}
            >
              <i className="pi pi-wallet text-orange-500 text-xl" />
            </div>
          </div>
          <span className="text-green-500 font-medium">
            ${data?.amount?.totalEarnings ? data?.amount?.totalEarnings : 0}
          </span>
          &nbsp;
          <span className="text-500">total earning amount</span>
        </div>
      </div>
      <div className="col-12 lg:col-6 xl:col-4 earning">
        <div className="card mb-0">
          <div className="flex justify-content-between">
            <div>
              <span className="block text-500 font-medium">Appointments</span>
              {/* <div className="text-900 font-medium text-xl">
                {data?.totalSchedules}
              </div> */}
            </div>
            <div
              className="flex align-items-center justify-content-center bg-purple-100 border-round"
              style={{ width: "3rem", height: "3rem" }}
            >
              <i className="pi pi-calendar text-purple-500 text-xl" />
            </div>
          </div>
          <span className="text-green-500 font-medium">
            {data?.todaySchedules?.length !== 0 ? data?.todaySchedules : 0}
          </span>
          <span className="text-500"> appointments today </span>
        </div>
      </div>
      <div className="col-12 lg:col-6 xl:col-4 earning">
        <div className="card mb-0">
          <div className="flex justify-content-between">
            <div>
              <span className="block text-500 font-medium">
                Cancelled Appointments
              </span>
              {/* <div className="text-900 font-medium text-xl">
                $
                {data?.amount?.totalAmount === null
                  ? 0
                  : data?.amount?.totalAmount}
              </div> */}
            </div>
            <div
              className="flex align-items-center justify-content-center bg-red-100 border-round"
              style={{ width: "3rem", height: "3rem" }}
            >
              <i className="pi pi-calendar-minus text-red-500 text-xl" />
            </div>
          </div>
          <span className="text-green-500 font-medium">
            {data?.totalCanceledSchedules ? data?.totalCanceledSchedules : 0}{" "}
          </span>
          <span className="text-500">appointments canceled</span>
        </div>
      </div>
      <div className="col-12 lg:col-6 xl:col-4 earning">
        <div className="card mb-0">
          <div className="flex justify-content-between">
            <div>
              <span className="block text-500 font-medium">
                Refunded Amount
              </span>
              {/* <div className="text-900 font-medium text-xl">
                {data?.totalSchedules}
              </div> */}
            </div>
            <div
              className="flex align-items-center justify-content-center bg-green-100 border-round"
              style={{ width: "3rem", height: "3rem" }}
            >
              <i className="pi pi-replay text-green-500 text-xl" />
            </div>
          </div>
          <span className="text-green-500 font-medium">
            $
            {data?.amount?.totalRefundAmount
              ? data?.amount?.totalRefundAmount
              : 0}
          </span>
          <span className="text-500"> total amount refunded </span>
        </div>
      </div>

      <div className="col-12 lg:col-6 xl:col-4 earning">
        <div className="card mb-0">
          <div className="flex justify-content-between ">
            <div>
              <span className="block text-500 font-medium ">Services</span>
              {/* <div className="text-900 font-medium text-xl">
                {data?.totalOrders}
              </div> */}
            </div>
            <div
              className="flex align-items-center justify-content-center bg-blue-100 border-round"
              style={{ width: "3rem", height: "3rem" }}
            >
              <i className="pi pi-book text-blue-500 text-xl" />
            </div>
          </div>
          <span className="text-green-500 font-medium">
            {data?.totalService}
          </span>
          <span className="text-500"> services</span>
        </div>
      </div>

      {/* //////////////////////// */}

      <div className="col-12 xl:col-6">
        <div className="card">
          <h5>Today's Appointment</h5>
          <DataTable
            value={data && data?.todaySchedulesData}
            rows={5}
            paginator
            responsiveLayout="scroll"
          >
            <Column
              field="first_name"
              header="Customer Name"
              style={{ width: "30%" }}
              body={(data) => (
                <span>
                  {data
                    ? `${capitalizeF(data.user?.first_name)} ${capitalizeF(
                        data.user?.last_name
                      )}`
                    : ""}
                </span>
              )}
            />
            <Column
              field="service.name"
              header="Service Name"
              style={{ width: "30%" }}
            />
            <Column
              field="start_time"
              header="Appt. Time"
              style={{ width: "40%" }}
              body={(data) => (
                <span>
                  {data ? `${data?.start_time} - ${data?.end_time}` : ""}
                </span>
              )}
            />
            <Column
              field="service.type"
              header="Appt. Type"
              style={{ width: "30%" }}
              body={(data) => (
                <span>{data && capitalizeF(data?.service.type)}</span>
              )}
            />
          </DataTable>
        </div>
      </div>

      <div className="col-12 xl:col-6">
        <div className="card">
          <div className="flex align-items-center justify-content-between mb-4">
            <h5>Notifications</h5>
            <div>
              <Button
                type="button"
                icon="pi pi-ellipsis-v"
                rounded
                text
                className="p-button-plain"
                onClick={(event) => menu2.current?.toggle(event)}
              />
              <Menu
                ref={menu2}
                popup
                model={[
                  { label: "Add New", icon: "pi pi-fw pi-plus" },
                  { label: "Remove", icon: "pi pi-fw pi-minus" },
                ]}
              />
            </div>
          </div>

          <span className="block text-600 font-medium mb-3">TODAY</span>
          <ul className="p-0 mx-0 mt-0 mb-4 list-none">
            <li className="flex align-items-center py-2 border-bottom-1 surface-border">
              <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                <i className="pi pi-dollar text-xl text-blue-500" />
              </div>
              <span className="text-900 line-height-3">
                Richard Jones
                <span className="text-700">
                  {" "}
                  has purchased a blue t-shirt for{" "}
                  <span className="text-blue-500">79$</span>
                </span>
              </span>
            </li>
            <li className="flex align-items-center py-2">
              <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-orange-100 border-circle mr-3 flex-shrink-0">
                <i className="pi pi-download text-xl text-orange-500" />
              </div>
              <span className="text-700 line-height-3">
                Your request for withdrawal of{" "}
                <span className="text-blue-500 font-medium">2500$</span> has
                been initiated.
              </span>
            </li>
          </ul>

          <span className="block text-600 font-medium mb-3">YESTERDAY</span>
          <ul className="p-0 m-0 list-none">
            <li className="flex align-items-center py-2 border-bottom-1 surface-border">
              <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                <i className="pi pi-dollar text-xl text-blue-500" />
              </div>
              <span className="text-900 line-height-3">
                Keyser Wick
                <span className="text-700">
                  {" "}
                  has purchased a black jacket for{" "}
                  <span className="text-blue-500">59$</span>
                </span>
              </span>
            </li>
            <li className="flex align-items-center py-2 border-bottom-1 surface-border">
              <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-pink-100 border-circle mr-3 flex-shrink-0">
                <i className="pi pi-question text-xl text-pink-500" />
              </div>
              <span className="text-900 line-height-3">
                Jane Davis
                <span className="text-700">
                  {" "}
                  has posted a new questions about your product.
                </span>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
