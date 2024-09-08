"use client";
import React, { useEffect, useRef, useState } from "react";
import client from "@/app/api/lib/apollo-client";
import { GET_ALL_SCHEDULES } from "@/app/api/lib/graphql_queries";
import { ApolloError } from "@apollo/client";
import { TabPanel, TabView } from "primereact/tabview";
import { toast } from "react-toastify";
import { Button } from "primereact/button";
import Spinner from "../../Comman/spinner/page";
import { capitalizeF } from "@/app/utils/commonFuns";

const Appointment = () => {
  const [schedular, setSchedular] = useState<any>([]);
  const [loader, setLoader] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSiteData();
    if (tableRef.current) {
      tableRef.current.addEventListener("scroll", handleScroll);
    }
    // Remove scroll event listener when component unmounts
    return () => {
      if (tableRef.current) {
        tableRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);
  const handleScroll = () => {
    const tableBody = tableRef.current;
    if (
      tableBody &&
      tableBody.scrollTop <= 0 && // user scrolled to the top
      !loader
    ) {
      loadMoreData();
    }
  };
  const loadMoreData = async () => {
    if (!loader) {
      setLoader(true);
      try {
        // Make API call to fetch additional data
        // Append the new data to the existing schedular state
        // Update loader state accordingly
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoader(false);
      }
    }
  };

  const getSiteData = async () => {
    setLoading(true);
    try {
      const { data } = await client.query({
        query: GET_ALL_SCHEDULES,
      });
      if (data && data?.getAllSchedules) {
        setSchedular(data.getAllSchedules);
        setLoading(false);
      } else {
        setLoading(false);

        console.log("@");
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

  const formatDate = (date: string) => {
    const options: any = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    // Ensuring that hours and minutes are always two digits
    const formattedHours = hours.padStart(2, "0");
    const formattedMinutes = minutes.padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}`;
  };

  const filterSchedules = (type: string) => {
    const today = new Date();
    let filteredSchedules: any[] = [];
    let uniqueDates: string[] = [];

    if (type === "Today") {
      filteredSchedules = schedular.filter((schedule: any) => {
        const scheduleDate = new Date(schedule.date);
        return (
          scheduleDate.getDate() === today.getDate() &&
          scheduleDate.getMonth() === today.getMonth() &&
          scheduleDate.getFullYear() === today.getFullYear()
        );
      });
    } else if (type === "Upcoming") {
      filteredSchedules = schedular.filter(
        (schedule: any) => new Date(schedule.date) > today
      );
    } else if (type === "Past") {
      filteredSchedules = schedular.filter((schedule: any) => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate < today && !isSameDay(scheduleDate, today);
      });
    }

    // Filter unique dates
    filteredSchedules.forEach((schedule) => {
      const scheduleDate = new Date(schedule.date).toDateString();
      if (!uniqueDates.includes(scheduleDate)) {
        uniqueDates.push(scheduleDate);
      }
    });

    return filteredSchedules.filter((schedule) =>
      uniqueDates.includes(new Date(schedule.date).toDateString())
    );
  };

  function isSameDay(date1: Date, date2: Date) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
  console.log("filterSchedules", schedular);

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div className="headingcs">
            <h4 className="headingtext">Appointments</h4>
          </div>
          <div
            className="card cardcss schdules"
            ref={tableRef}
            style={{ overflowY: "auto", maxHeight: "500px" }}
          >
            {!loading ? (
              <TabView>
                <TabPanel header="Today">
                  {filterSchedules("Today").length > 0 ? (
                    <div>
                      {filterSchedules("Today").map(
                        (schedule: any, index: number) => (
                          <div key={index}>
                            {index === 0 && (
                              <h5 className="headingtoday">
                                {formatDate(schedule.date)}
                              </h5>
                            )}
                            <div className="tablebody">
                              <table className="table todaydatacss">
                                <tbody>
                                  <tr className="tablerowtoday">
                                    <td>
                                      {formatTime(schedule.start_time)} -{" "}
                                      {formatTime(schedule.end_time)}
                                    </td>
                                    <td>
                                      {schedule?.user?.first_name +
                                        " " +
                                        schedule?.user?.last_name}
                                    </td>
                                    <td>{schedule?.user?.email}</td>
                                    <td>{capitalizeF(schedule?.type)}</td>
                                    <td className="paststatus">
                                      {schedule?.status === "active" ? (
                                        <span style={{ color: "green" }}>
                                          {capitalizeF(schedule?.status)}
                                        </span>
                                      ) : schedule?.status === "canceled" ? (
                                        <span style={{ color: "red" }}>
                                          {capitalizeF(schedule?.status)}
                                        </span>
                                      ) : (
                                        capitalizeF(schedule?.status)
                                      )}
                                    </td>
                                    {schedule?.service?.type === "offline" ? (
                                      <td>Offline&ensp;</td>
                                    ) : (
                                      <td>
                                        <Button
                                          label="Link"
                                          link
                                          className="btnLink"
                                          icon="pi pi-chevron-right"
                                          iconPos="left"
                                          onClick={() =>
                                            window.open(
                                              `${schedule?.meeting_url}`,
                                              "_blank"
                                            )
                                          }
                                        />
                                      </td>
                                    )}
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p>No schedules for today</p>
                  )}
                </TabPanel>
                <TabPanel header="Upcoming">
                  {filterSchedules("Upcoming").length > 0 ? (
                    <div>
                      {filterSchedules("Upcoming")
                        .reduce((acc: any, schedule: any) => {
                          const date = formatDate(schedule.date);
                          if (!acc.includes(date)) {
                            acc.push(date);
                          }
                          return acc;
                        }, [])
                        .map((date: string, index: number) => (
                          <div key={index}>
                            <h5 className="headingupcoming">{date}</h5>
                            <div className="upcomingtablebody">
                              <table className="table upcomingdatacss">
                                <tbody>
                                  {filterSchedules("Upcoming")
                                    .filter(
                                      (schedule: any) =>
                                        formatDate(schedule.date) === date
                                    )
                                    .map(
                                      (filteredSchedule: any, idx: number) => (
                                        <tr key={idx} className="tablerow">
                                          <div className="upcomingdatecss">
                                            <td className="tdone">
                                              {formatTime(
                                                filteredSchedule.start_time
                                              )}{" "}
                                              -{" "}
                                              {formatTime(
                                                filteredSchedule.end_time
                                              )}
                                            </td>
                                            <td className="tdone">
                                              {filteredSchedule?.user
                                                ?.first_name +
                                                " " +
                                                filteredSchedule?.user
                                                  ?.last_name}
                                            </td>
                                            <td className="tdone">
                                              {filteredSchedule?.user?.email}
                                            </td>
                                            <td className="tdone">
                                              {capitalizeF(
                                                filteredSchedule?.type
                                              )}
                                            </td>
                                            <td className="paststatus">
                                              {filteredSchedule?.status ===
                                              "active" ? (
                                                <span
                                                  style={{ color: "green" }}
                                                >
                                                  {capitalizeF(
                                                    filteredSchedule?.status
                                                  )}
                                                </span>
                                              ) : filteredSchedule?.status ===
                                                "canceled" ? (
                                                <span style={{ color: "red" }}>
                                                  {capitalizeF(
                                                    filteredSchedule?.status
                                                  )}
                                                </span>
                                              ) : (
                                                capitalizeF(
                                                  filteredSchedule?.status
                                                )
                                              )}
                                            </td>
                                            {filteredSchedule?.service?.type ===
                                            "offline" ? (
                                              <td>Offline&ensp;</td>
                                            ) : (
                                              <td>
                                                <Button
                                                  label="Link"
                                                  link
                                                  className="btnLink"
                                                  icon="pi pi-chevron-right"
                                                  iconPos="left"
                                                  onClick={() =>
                                                    window.open(
                                                      `${filteredSchedule?.meeting_url}`,
                                                      "_blank"
                                                    )
                                                  }
                                                />
                                              </td>
                                            )}
                                          </div>
                                        </tr>
                                      )
                                    )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p>No upcoming schedules</p>
                  )}
                </TabPanel>
                <TabPanel header="Past">
                  {filterSchedules("Past").length > 0 ? (
                    <div>
                      {filterSchedules("Past")
                        .reduce((acc: any, schedule: any) => {
                          const date = formatDate(schedule.date);
                          if (!acc.includes(date)) {
                            acc.push(date);
                          }
                          return acc;
                        }, [])
                        .map((date: string, index: number) => (
                          <div key={index}>
                            <h5 className="headingpast">{date}</h5>

                            <table className="table pastdatecss">
                              <tbody>
                                {filterSchedules("Past")
                                  .filter(
                                    (schedule: any) =>
                                      formatDate(schedule.date) === date
                                  )
                                  .map((filteredSchedule: any, idx: number) => (
                                    <div className="tablebody">
                                      <tr key={idx} className="tablerowpast">
                                        <td className="tdone">
                                          {formatTime(
                                            filteredSchedule.start_time
                                          )}{" "}
                                          -{" "}
                                          {formatTime(
                                            filteredSchedule.end_time
                                          )}
                                        </td>
                                        <td className="tdone">
                                          {filteredSchedule?.user?.first_name +
                                            " " +
                                            filteredSchedule?.user?.last_name}
                                        </td>
                                        <td className="tdone">
                                          {filteredSchedule?.user?.email}
                                        </td>

                                        <td className="tdone">
                                          {capitalizeF(filteredSchedule?.type)}
                                        </td>
                                        <td className="paststatus">
                                          {filteredSchedule?.status ===
                                          "active" ? (
                                            <span style={{ color: "green" }}>
                                              {capitalizeF(
                                                filteredSchedule?.status
                                              )}
                                            </span>
                                          ) : filteredSchedule?.status ===
                                            "canceled" ? (
                                            <span style={{ color: "red" }}>
                                              {capitalizeF(
                                                filteredSchedule?.status
                                              )}
                                            </span>
                                          ) : (
                                            capitalizeF(
                                              filteredSchedule?.status
                                            )
                                          )}
                                        </td>
                                        {filteredSchedule?.service?.type ===
                                        "offline" ? (
                                          <td>Offline&ensp;</td>
                                        ) : (
                                          <td>
                                            <Button
                                              label="Link"
                                              link
                                              className="btnLink"
                                              icon="pi pi-chevron-right"
                                              iconPos="left"
                                              onClick={() =>
                                                window.open(
                                                  `${filteredSchedule?.meeting_url}`,
                                                  "_blank"
                                                )
                                              }
                                            />
                                          </td>
                                        )}
                                      </tr>
                                    </div>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p>No past schedules</p>
                  )}
                </TabPanel>
              </TabView>
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

export default Appointment;
