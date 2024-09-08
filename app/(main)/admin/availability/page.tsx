"use client";
import React, { useEffect, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { toast } from "react-toastify";
import client from "@/app/api/lib/apollo-client";
import { GET_AVAILABILITY_BY_ID } from "@/app/api/lib/graphql_queries";
import { Button } from "primereact/button";
import { nextLocalStorage } from "@/app/utils/commonFuns";

const Availability = () => {
  const [loader, setLoader] = useState(false);
  const user_id: any = nextLocalStorage()?.getItem("id");
  const [addedSlots, setAddedSlots] = useState<any>([]);

  const initialAvailability = [
    { day: "SUN", slots: [], isEnable: true },
    { day: "MON", slots: [], isEnable: true },
    { day: "TUE", slots: [], isEnable: true },
    { day: "WED", slots: [], isEnable: true },
    { day: "THU", slots: [], isEnable: true },
    { day: "FRI", slots: [], isEnable: true },
    { day: "SAT", slots: [], isEnable: true },
  ];

  const [availability, setAvailability] = useState<any>(initialAvailability);
  const [selectedTimes, setSelectedTimes] = useState<any>({});
  const [availabilityData, setAvailabilityData] = useState<any>(null);

  useEffect(() => {
    if (!availabilityData) {
      const initialData: any = {
        weekly: {},
        holiday: { dates: [] },
        date: { dates: [] },
      };

      initialAvailability.forEach((day) => {
        const dayName = day.day.toLowerCase();
        initialData.weekly[dayName] = [
          { startTime: "10:00", endTime: "09:30" },
        ];
      });

      setAvailabilityData(initialData);
    }
  }, [availabilityData]);

  const handleSaveAvailability = () => {
    const weeklyAvailability: any = {
      key: "weekly",
      value: {
        sun: [],
        mon: [],
        tue: [],
        wed: [],
        thu: [],
        fri: [],
        sat: [],
      },
    };

    availability.forEach((day: any) => {
      const dayName = day.day.toLowerCase();

      if (!day.isEnable) {
        weeklyAvailability.value[dayName].push({ isEnable: false });
      } else {
        const hasExistingSlots = day.slots.length > 0;

        // Set the initial slot to 10:00 - 18:30 for the first time
        if (!hasExistingSlots) {
          weeklyAvailability.value[dayName].push({
            isEnable: true,
            time: [null],
          });
        } else {
          // If slots exist, include them without a null default slot
          const slots = day.slots.map((slot: string) => ({
            startTime: slot.split(" - ")[0],
            endTime: slot.split(" - ")[1],
          }));
          weeklyAvailability.value[dayName].push({
            isEnable: true,
            time: slots,
          });
        }
      }
    });

    console.log("Generated Weekly Availability:", [weeklyAvailability]);
  };

  const handleAddSlot = (dayIndex: any) => {
    const updatedAvailability = [...availability];
    const defaultEndTime =
      availabilityData?.weekly[
        initialAvailability[dayIndex].day.toLowerCase()
      ][0]?.endTime || "18:00";
    const lastSlotEndTime =
      updatedAvailability[dayIndex].slots.length > 0
        ? updatedAvailability[dayIndex].slots[
            updatedAvailability[dayIndex].slots.length - 1
          ].split(" - ")[1]
        : defaultEndTime;

    console.log("lastSlotEndTime", lastSlotEndTime);
    const startTime = addMinutesToTime(lastSlotEndTime, 30);

    const isOverlap = updatedAvailability[dayIndex].slots.some(
      (slot: string) => {
        const [existingStartTime, existingEndTime] = slot.split(" - ");
        return startTime < existingEndTime && existingStartTime < startTime;
      }
    );

    if (isOverlap) {
      toast.error(
        "The new slot overlaps with an existing slot. Please select a different time."
      );
      return;
    }

    const endTime = addMinutesToTime(startTime, 60);

    if (parseInt(endTime.split(":")[0], 10) >= 24) {
      toast.error(
        "The new slot cannot exceed 24:00 hours. Please select a different time."
      );
      return;
    }

    const newSlot = {
      day: initialAvailability[dayIndex].day,
      startTime,
      endTime,
    };

    setAddedSlots([...addedSlots, newSlot]);
    updatedAvailability[dayIndex].slots.push(`${startTime} - ${endTime}`);
    setAvailability(updatedAvailability);
  };

  const addMinutesToTime = (time: string, minutes: number) => {
    const [hour, minute] = time.split(":").map(Number);
    const totalMinutes = hour * 60 + minute + minutes;
    const newHour = Math.floor(totalMinutes / 60);
    const newMinute = totalMinutes % 60;
    return `${String(newHour).padStart(2, "0")}:${String(newMinute).padStart(
      2,
      "0"
    )}`;
  };

  const handleStartTimeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    dayIndex: number,
    slotIndex?: number
  ) => {
    const dayName = initialAvailability[dayIndex].day.toLowerCase();
    const startTime = event.target.value;
    const endTime = availabilityData?.weekly[dayName][0]?.endTime || "18:00";

    setAvailabilityData((prevData: any) => {
      const newData = {
        ...prevData,
        weekly: {
          ...prevData.weekly,
          [dayName]: [{ startTime, endTime }],
        },
      };
      if (slotIndex !== undefined) {
        const updatedAvailability = [...availability];
        updatedAvailability[dayIndex].slots[
          slotIndex
        ] = `${startTime} - ${endTime}`;
        setAvailability(updatedAvailability);
        setSelectedTimes((prevSelectedTimes: any) => ({
          ...prevSelectedTimes,
          [dayIndex]: { ...prevSelectedTimes[dayIndex], startTime },
        }));
      }
      return newData;
    });
  };

  const handleEndTimeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    dayIndex: number,
    slotIndex?: number
  ) => {
    const dayName = initialAvailability[dayIndex].day.toLowerCase();
    const startTime =
      availabilityData?.weekly[dayName][0]?.startTime || "10:00";
    const endTime = event.target.value;

    const startTimeMinutes =
      parseInt(startTime.split(":")[0], 10) * 60 +
      parseInt(startTime.split(":")[1], 10);
    const endTimeMinutes =
      parseInt(endTime.split(":")[0], 10) * 60 +
      parseInt(endTime.split(":")[1], 10);

    if (endTimeMinutes <= startTimeMinutes) {
      toast.error("End time should be greater than start time.");
      return;
    }

    setAvailabilityData((prevData: any) => {
      const newData = {
        ...prevData,
        weekly: {
          ...prevData.weekly,
          [dayName]: [{ startTime, endTime }],
        },
      };
      if (slotIndex !== undefined) {
        const updatedAvailability = [...availability];
        updatedAvailability[dayIndex].slots[
          slotIndex
        ] = `${startTime} - ${endTime}`;
        setAvailability(updatedAvailability);
        setSelectedTimes((prevSelectedTimes: any) => ({
          ...prevSelectedTimes,
          [dayIndex]: { ...prevSelectedTimes[dayIndex], endTime },
        }));
      }
      return newData;
    });
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 1; hour <= 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${String(hour).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}`;
        options.push(time);
      }
    }
    return options;
  };

  const handleDeleteSlot = (dayIndex: any, slotIndex: any) => {
    const updatedAvailability = [...availability];
    updatedAvailability[dayIndex].slots.splice(slotIndex, 1);
    setAvailability(updatedAvailability);
  };

  const handleDaySelect = (dayIndex: any) => {
    const updatedAvailability = [...availability];
    updatedAvailability[dayIndex].isEnable =
      !updatedAvailability[dayIndex].isEnable;
    setAvailability(updatedAvailability);
  };

  useEffect(() => {
    // getAvailability();
  }, []);

  const getAvailability = async () => {
    try {
      const response = await client.query({
        query: GET_AVAILABILITY_BY_ID,
        variables: { id: user_id },
      });

      if (response.data.getAvailabilityById.success) {
        const availabilityData = response.data.getAvailabilityById.data;

        const updatedAvailability = initialAvailability.map((day) => {
          const dayName = day.day.toLowerCase();
          const slots = availabilityData.weekly[dayName] || [];
          return {
            day: day.day,
            slots: slots.map(
              (slot: any) => `${slot.startTime} - ${slot.endTime}`
            ),
            isEnable: true,
          };
        });

        setAvailability(updatedAvailability);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  return (
    <>
      <div className="grid">
        <div className="col-12">
          <div className="card">
            <div className="wrapperclass">
              <div className="headingcs">
                <h4 className="headingtext">Availability</h4>
              </div>
              <div className="p-inputgroup inputSearch">
                <Button
                  onClick={handleSaveAvailability}
                  className="p-button-success btnsave"
                >
                  Save Availability
                </Button>
              </div>
            </div>
            <div className="card cardcss">
              <TabView>
                <TabPanel header="Availability">
                  <br />
                  <div className="grid availabiltyc">
                    <div className="col-12 lg:col-6 xl:col-6">
                      <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                          <div className="avail1">
                            <h5>Weekly hours</h5>
                            <table>
                              <tbody>
                                {initialAvailability.map((day, dayIndex) => (
                                  <div className="mainavailblediv">
                                    <div
                                      key={dayIndex}
                                      className="avaliablealign"
                                    >
                                      <div className="available2nddiv">
                                        <input
                                          type="checkbox"
                                          checked={
                                            availability[dayIndex].isEnable
                                          }
                                          onChange={() =>
                                            handleDaySelect(dayIndex)
                                          }
                                          className="availableCheckbox"
                                        />
                                        <h3 className="headingAvailable">
                                          {day.day}
                                        </h3>
                                        {!availability[dayIndex].isEnable ? (
                                          <div className="text-red-500 unavailable">
                                            Unavailable
                                          </div>
                                        ) : (
                                          <div className="slotdiv">
                                            {availability[dayIndex].slots.map(
                                              (slot: any, slotIndex: any) => (
                                                <ul className="availablelistdiv">
                                                  <select
                                                    value={slot.split(" - ")[0]}
                                                    onChange={(event) =>
                                                      handleStartTimeChange(
                                                        event,
                                                        dayIndex,
                                                        slotIndex
                                                      )
                                                    }
                                                    className="availabletime"
                                                  >
                                                    {generateTimeOptions().map(
                                                      (time) => (
                                                        <option
                                                          key={time}
                                                          value={time}
                                                        >
                                                          {time}
                                                        </option>
                                                      )
                                                    )}
                                                  </select>{" "}
                                                  -{" "}
                                                  <select
                                                    value={slot.split(" - ")[1]}
                                                    onChange={(event) =>
                                                      handleEndTimeChange(
                                                        event,
                                                        dayIndex,
                                                        slotIndex
                                                      )
                                                    }
                                                    className="availabletime"
                                                  >
                                                    {generateTimeOptions().map(
                                                      (time) => (
                                                        <option
                                                          key={time}
                                                          value={time}
                                                        >
                                                          {time}
                                                        </option>
                                                      )
                                                    )}
                                                  </select>
                                                  <Button
                                                    onClick={() =>
                                                      handleDeleteSlot(
                                                        dayIndex,
                                                        slotIndex
                                                      )
                                                    }
                                                    className="availablecross"
                                                    icon="pi pi-times"
                                                  />
                                                  <br />
                                                </ul>
                                              )
                                            )}
                                          </div>
                                        )}
                                        <Button
                                          onClick={() =>
                                            handleAddSlot(dayIndex)
                                          }
                                          icon="pi pi-plus"
                                          className="availablebtn"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 lg:col-6 xl:col-6">
                      <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                          <div className="avail2">
                            <h5>Date-specific hours</h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabPanel>
                <TabPanel header="Holidays">
                  <div className="m-0">
                    <h5>Holiday</h5>
                  </div>
                </TabPanel>
              </TabView>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Availability;
