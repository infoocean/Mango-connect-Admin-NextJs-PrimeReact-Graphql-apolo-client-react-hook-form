"use client";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Divider } from "primereact/divider";
import { ConfirmPopup } from "primereact/confirmpopup";
import { toast } from "react-toastify";
import Spinner from "@/app/(main)/Comman/spinner/page";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { serviceValidation } from "@/app/validation/validations";
import { ErrorFormMsg } from "@/demo/components/ErrorMessgae";
import { Editor } from "primereact/editor";
import { Dropdown } from "primereact/dropdown";
import Image from "next/image";
import { ApolloError } from "@apollo/client";
import { CREATE_SERVICES } from "@/app/api/lib/graphql_mutation";
import client from "@/app/api/lib/apollo-client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Dialog } from "primereact/dialog";
import moment from "moment";
import { capitalizeF, transformString } from "@/app/utils/commonFuns";

const AddServices: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [text, setText] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<any>("");
  const [type, setType] = useState<any>("");
  const serviceType = [{ name: "Online" }, { name: "Offline" }];
  const [image, setImage] = useState<any>(null);
  const [imageFile, setImageFile] = useState<any>(null);
  const [addedSlots, setAddedSlots] = useState<any>([]);

  const [calendarOpen, setCalendarOpen] = useState<any>(false);
  const [selectedDates, setSelectedDates] = useState<any>([]);

  const [holidayCalendarOpen, setHolidayCalendarOpen] = useState<any>(false);
  const [selectedHolidayDates, setSelectedHolidayDates] = useState<any>([]);

  const initialAvailability = [
    { day: "SUN", slots: ["10:00 - 11:00"], isEnable: true },
    { day: "MON", slots: ["10:00 - 11:00"], isEnable: true },
    { day: "TUE", slots: ["10:00 - 11:00"], isEnable: true },
    { day: "WED", slots: ["10:00 - 11:00"], isEnable: true },
    { day: "THU", slots: ["10:00 - 11:00"], isEnable: true },
    { day: "FRI", slots: ["10:00 - 11:00"], isEnable: true },
    { day: "SAT", slots: ["10:00 - 11:00"], isEnable: true },
  ];

  const [availability, setAvailability] = useState<any>(initialAvailability);
  const [selectedTimes, setSelectedTimes] = useState<any>({});
  const [availabilityData, setAvailabilityData] = useState<any>(null);
  const fileInputRef = useRef<any>(null);
  const [slots, setSlots] = useState<any>([]);
  const [specificDate, setSpecificDate] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(serviceValidation),
  });

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
      addSlot();
      setAvailabilityData(initialData);
    }
  }, [availabilityData]);

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

  const statusType = [
    { name: "Active" },
    { name: "Archive" },
    { name: "Draft" },
  ];

  const onSubmitSiteConfig = async (data: any) => {
    setLoader(true);
    const dateAvailibility =
      selectedDates &&
      selectedDates.map((date: any) => ({
        date: date,
        time: slots.map((slot: any) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      }));
    const transformedArray =
      selectedHolidayDates &&
      selectedHolidayDates.map((dateString: any) => ({
        date: dateString,
      }));
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

        if (!hasExistingSlots) {
          weeklyAvailability.value[dayName].push({
            isEnable: true,
            time: [null],
          });
        } else {
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

    if (imageFile === null) {
      toast.error("Image field is required");
    } else {
      const availability = {
        availability: [
          {
            key: "weekly",
            value: weeklyAvailability.value,
          },
          {
            key: "date",
            value: dateAvailibility,
          },
          {
            key: "holiday",
            value: transformedArray,
          },
        ],
      };
      try {
        const response = await client.mutate({
          mutation: CREATE_SERVICES,
          variables: {
            name: data.name,
            duration: parseInt(data.duration),
            fee: parseFloat(data.fee),
            image: imageFile, // Directly pass the file object
            status: transformString(data.status),
            type: transformString(data.type),
            short_description: data.description,
            availability: availability,
          },
          context: {
            useMultipart: true, // Important to tell Apollo Client to use multipart/form-data
          },
        });

        if (response && response?.data?.createService) {
          setLoader(false);
          toast.success("Service create successfully");
          setTimeout(() => {
            window.location.replace("/admin/services");
            // router.push("/admin/services");
          }, 2000);
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
    }
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files && e.target.files[0];
    setImageFile(file);
    if (file) {
      let reader = new FileReader();
      reader.onload = (e: any) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
      setValue("image", file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setValue("image", null);
  };

  const handleBack = () => {
    router.push("/admin/services");
  };

  const handleCalendarClose = () => {
    setCalendarOpen(false);
    setHolidayCalendarOpen(false);
  };

  const handleDateSelect = (date: any) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    if (selectedDates.includes(dateString)) {
      setSelectedDates(selectedDates.filter((d: any) => d !== dateString));
    } else {
      setSelectedDates([...selectedDates, dateString]);
    }
  };

  const handleHolidayDateSelect = (date: any) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    if (selectedHolidayDates.includes(dateString)) {
      setSelectedHolidayDates(
        selectedHolidayDates.filter((d: any) => d !== dateString)
      );
    } else {
      setSelectedHolidayDates([...selectedHolidayDates, dateString]);
    }
  };

  const isDateSelected = (date: any) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    return selectedDates.includes(dateString);
  };

  const isDateHolidaySelected = (date: any) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    return selectedHolidayDates.includes(dateString);
  };

  const generateTimeOptionDate = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = String(hour).padStart(2, "0");
        const formattedMinute = String(minute).padStart(2, "0");
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  };
  const timeOptions = generateTimeOptionDate();

  const addSlot = () => {
    // Ensure there is at least one slot
    if (slots.length === 0) {
      setSlots([{ startTime: "10:00", endTime: "11:00" }]);
      return;
    }

    // Get the end time of the last slot
    const lastSlotEndTime = slots[slots.length - 1].endTime;
    const [lastHour, lastMinute] = lastSlotEndTime.split(":").map(Number);

    // Calculate the start time of the new slot by adding 30 minutes to the end time of the last slot
    let newHour = lastHour;
    let newMinute = lastMinute + 30;
    if (newMinute >= 60) {
      newHour++;
      newMinute -= 60;
    }

    // Format the new start time
    const newStartTime = `${String(newHour).padStart(2, "0")}:${String(
      newMinute
    ).padStart(2, "0")}`;

    // Calculate the end time of the new slot by adding 1 hour to the new start time
    const newEndTime = `${String(newHour + 1).padStart(2, "0")}:${String(
      newMinute
    ).padStart(2, "0")}`;

    // Add the new slot to the slots array
    const updatedSlots = [
      ...slots,
      { startTime: newStartTime, endTime: newEndTime },
    ];
    setSlots(updatedSlots);
  };
  const handleSlotStartTimeChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number
  ) => {
    const selectedStartTime = e.target.value;
    const updatedSlots = [...slots]; // Create a copy of the slots array
    updatedSlots[index].startTime = selectedStartTime; // Update the start time of the slot at the specified index

    // Check if the selected start time falls within the range of any existing time slots
    const isStartTimeValid = updatedSlots.every((slot, i) => {
      if (i === index) return true; // Skip the current slot being edited
      const startTime = new Date(`2000-01-01T${slot.startTime}`);
      const endTime = new Date(`2000-01-01T${slot.endTime}`);
      const selectedTime = new Date(`2000-01-01T${selectedStartTime}`);
      return selectedTime < startTime || selectedTime > endTime;
    });

    if (!isStartTimeValid) {
      // Display error message or handle invalid start time
      // For example, set an error state
      toast.error("Selected start time conflicts with existing time slots");
      return;
    }

    // Clear any previous error message if start time is valid

    setSlots(updatedSlots); // Update the state with the modified slots array
  };

  const handleSlotEndTimeChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number
  ) => {
    const selectedEndTime = e.target.value;
    const updatedSlots = [...slots]; // Create a copy of the slots array
    updatedSlots[index].endTime = selectedEndTime; // Update the end time of the slot at the specified index

    // Check if the selected end time overlaps with existing slots
    const isEndTimeValid = updatedSlots.every((slot, i) => {
      if (i === index) return true; // Skip the current slot being edited
      const startTime = new Date(`2000-01-01T${slot.startTime}`);
      const endTime = new Date(`2000-01-01T${slot.endTime}`);
      const selectedTime = new Date(`2000-01-01T${selectedEndTime}`);
      return selectedTime < startTime || selectedTime > endTime;
    });

    if (!isEndTimeValid) {
      // Display error message using toast
      toast.error("Selected end time conflicts with existing time slots");
      return;
    }

    // Clear any previous error message if end time is valid
    setSlots(updatedSlots); // Update the state with the modified slots array
  };
  const handleDeleteDateSlot1 = (indexToDelete: any) => {
    const updatedSlots = slots.filter(
      (_: any, index: any) => index !== indexToDelete
    );
    setSlots(updatedSlots);
  };

  const handleDeleteDateSlot = (dateIndex: any) => {
    const updatedDates = specificDate.value.dates.filter(
      (_: any, dIndex: any) => dIndex !== dateIndex
    );

    setSpecificDate({
      ...specificDate,
      value: {
        dates: updatedDates,
      },
    });
  };
  const handleMerge = () => {
    handleCalendarClose();
    const mergedArray =
      selectedDates &&
      selectedDates.map((date: any) => ({
        date: date,
        time: slots.map((slot: any) => ({ ...slot })),
      }));

    const mergedData = {
      key: "date",
      value: {
        dates: mergedArray,
      },
    };
    setSpecificDate(mergedData);
  };

  const handleHolidayMerge = () => {
    setHolidayCalendarOpen(false);
  };

  const handleHolidayDeleteDate = (indexToDelete: any) => {
    const updatedSlots = selectedHolidayDates.filter(
      (_: any, index: any) => index !== indexToDelete
    );
    setSelectedHolidayDates(updatedSlots);
  };

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div className="datatable-editing-demo">
            <div className="wrapperclass">
              <div className="headingcs">
                <h4 className="headingtext">Add Service</h4>
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
            <ConfirmPopup />
            {!loading ? (
              <form onSubmit={handleSubmit(onSubmitSiteConfig)}>
                <div className="grid servicess">
                  <div className="col-12 lg:col-6 xl:col-8">
                    <div className="card mb-0 card1">
                      <div>
                        <br />
                        <div className="flex flex-column gap-2">
                          <label htmlFor="username" className="stripeheading">
                            Service name
                          </label>
                          <InputText
                            id="name"
                            type="text"
                            {...register("name")}
                            placeholder="Service name"
                            className="inputfieldcss"
                            defaultValue={""}
                          />
                          {errors && errors.name ? (
                            <p className="errorcss">
                              <small id="username-help">
                                {ErrorFormMsg(errors?.name?.message)}
                              </small>
                            </p>
                          ) : (
                            ""
                          )}
                        </div>
                        <br />
                        <div className="flex flex-column gap-2">
                          <label htmlFor="username" className="stripeheading">
                            Short description
                          </label>
                          <Controller
                            name="description"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              <Editor
                                value={text}
                                onTextChange={(e: any) => {
                                  setText(e.htmlValue);
                                  field.onChange(e.htmlValue);
                                }}
                                style={{ height: "100px" }}
                              />
                            )}
                          />
                          {errors && errors.description ? (
                            <p className="errorcss">
                              <small id="username-help">
                                {ErrorFormMsg(errors?.description?.message)}
                              </small>
                            </p>
                          ) : (
                            ""
                          )}
                        </div>
                        <br />
                        <div className="flex flex-column gap-2">
                          <label htmlFor="username" className="stripeheading">
                            Duration (minutes)
                          </label>
                          <InputText
                            id="duration"
                            type="text"
                            {...register("duration")}
                            placeholder="Duration"
                            className="inputfieldcss"
                            defaultValue={""}
                          />
                          {errors && errors.duration ? (
                            <p className="errorcss">
                              <small id="username-help">
                                {ErrorFormMsg(errors?.duration?.message)}
                              </small>
                            </p>
                          ) : (
                            ""
                          )}
                        </div>
                        <br />
                        <div className="flex flex-column gap-2">
                          <label htmlFor="username" className="stripeheading">
                            Price ($)
                          </label>
                          <InputText
                            id="fee"
                            type="text"
                            {...register("fee")}
                            placeholder="Price"
                            className="inputfieldcss"
                            defaultValue={""}
                          />
                          {errors && errors.fee ? (
                            <p className="errorcss">
                              <small id="username-help">
                                {ErrorFormMsg(errors?.fee?.message)}
                              </small>
                            </p>
                          ) : (
                            ""
                          )}
                        </div>
                        <br />
                        <div className="flex flex-column gap-2">
                          <label htmlFor="username" className="stripeheading">
                            Image
                          </label>
                          <div className="flex justify-content-left imagecss1">
                            <div className="image-upload-container">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="imagefilecs"
                              />
                              {image && (
                                <div className="image-preview-container">
                                  <Button
                                    icon="pi pi-times"
                                    className="remove-image-button"
                                    onClick={handleRemoveImage}
                                  />
                                  <Image
                                    src={image}
                                    alt="Uploaded Preview"
                                    className="image-preview"
                                    width={55}
                                    height={55}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <br />
                        <div className="flex flex-column">
                          <label htmlFor="username" className="stripeheading">
                            Availability
                          </label>
                          <div className="grid availabiltyb">
                            <div className="col-12 lg:col-6 xl:col-12 availabilitygrid">
                              <div className="card mb-0">
                                <div className="flex justify-content-between mb-3">
                                  <div className="avail1">
                                    <h5>Weekly hours</h5>
                                    <table>
                                      <tbody>
                                        {initialAvailability.map(
                                          (day, dayIndex) => (
                                            <div
                                              key={dayIndex}
                                              className="mainavailblediv"
                                            >
                                              <div className="avaliablealign1add">
                                                <div className="available2nddiv11">
                                                  <input
                                                    type="checkbox"
                                                    checked={
                                                      availability[dayIndex]
                                                        .isEnable
                                                    }
                                                    onChange={() =>
                                                      handleDaySelect(dayIndex)
                                                    }
                                                    className="availableCheckbox"
                                                  />
                                                  <h3 className="headingAvailable">
                                                    {day.day}
                                                  </h3>
                                                  {!availability[dayIndex]
                                                    .isEnable ? (
                                                    <div className="text-red-500 unavailable">
                                                      Unavailable
                                                    </div>
                                                  ) : (
                                                    <div className="slotdiv">
                                                      {availability[
                                                        dayIndex
                                                      ].slots.map(
                                                        (
                                                          slot: any,
                                                          slotIndex: any
                                                        ) => (
                                                          <ul
                                                            key={slotIndex}
                                                            className="availablelistdiv"
                                                          >
                                                            <select
                                                              value={
                                                                slot.split(
                                                                  " - "
                                                                )[0]
                                                              }
                                                              onChange={(
                                                                event
                                                              ) =>
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
                                                              value={
                                                                slot.split(
                                                                  " - "
                                                                )[1]
                                                              }
                                                              onChange={(
                                                                event
                                                              ) =>
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
                                                            {availability[
                                                              dayIndex
                                                            ].slots.length >
                                                            1 ? (
                                                              // Render the cross button only if there are more than one slot
                                                              <Button
                                                                onClick={() =>
                                                                  handleDeleteSlot(
                                                                    dayIndex,
                                                                    slotIndex
                                                                  )
                                                                }
                                                                type="button"
                                                                className="availablecross"
                                                                icon="pi pi-times"
                                                              />
                                                            ) : (
                                                              <Button
                                                                disabled
                                                                type="button"
                                                                className="availablecross"
                                                                icon="pi pi-times"
                                                              />
                                                            )}
                                                            <br />
                                                          </ul>
                                                        )
                                                      )}
                                                    </div>
                                                  )}
                                                  {availability[dayIndex]
                                                    .isEnable && (
                                                    <Button
                                                      onClick={() =>
                                                        handleAddSlot(dayIndex)
                                                      }
                                                      type="button"
                                                      icon="pi pi-plus"
                                                      className="availablebtn"
                                                    />
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-12 lg:col-6 xl:col-12 availabilitygrid">
                              <div className="card mb-0">
                                <div className="flex justify-content-between mb-3">
                                  <div className="avail2">
                                    <h5 className="subheadingservice">
                                      Date-specific hours
                                    </h5>
                                  </div>
                                </div>
                                <Button
                                  label="Add date-specific hours"
                                  icon="pi pi-plus"
                                  className="specificbtn"
                                  onClick={() => setCalendarOpen(true)}
                                  type="button"
                                />
                                {(specificDate &&
                                  specificDate?.value?.dates?.length === 0) ||
                                specificDate === null ? (
                                  ""
                                ) : (
                                  <div className="margindiv">
                                    {specificDate &&
                                      specificDate.value.dates.map(
                                        (dateItem: any, index: any) => (
                                          <div
                                            key={index}
                                            className="specificDateShow"
                                          >
                                            <div>
                                              <p>
                                                <i
                                                  className="pi pi-calendar-plus"
                                                  style={{
                                                    fontSize: "14px",
                                                  }}
                                                ></i>{" "}
                                                {moment(dateItem.date).format(
                                                  "MMM DD, YYYY"
                                                )}
                                              </p>
                                            </div>
                                            <div className="timediv">
                                              {dateItem.time.map(
                                                (
                                                  timeSlot: any,
                                                  timeIndex: any
                                                ) => (
                                                  <>
                                                    <div
                                                      key={timeIndex}
                                                      className="timeslotdiv"
                                                    >
                                                      <p>
                                                        {timeSlot.startTime} -{" "}
                                                        {timeSlot.endTime}
                                                      </p>
                                                    </div>
                                                  </>
                                                )
                                              )}
                                            </div>
                                            <Button
                                              onClick={() =>
                                                handleDeleteDateSlot(index)
                                              }
                                              type="button"
                                              className="availablecross2"
                                              icon="pi pi-times"
                                            />
                                          </div>
                                        )
                                      )}
                                  </div>
                                )}{" "}
                                <Dialog
                                  visible={calendarOpen}
                                  onHide={handleCalendarClose}
                                  header="Select the date(s) you want to assign specific hours"
                                  modal
                                  style={{ width: "352px" }}
                                >
                                  <div className="calendar-container">
                                    <DatePicker
                                      inline
                                      selected={null} // no single selected date
                                      onChange={handleDateSelect}
                                      highlightDates={selectedDates.map(
                                        (date: any) => new Date(date)
                                      )}
                                      dayClassName={(date) =>
                                        isDateSelected(date)
                                          ? "selected-date"
                                          : ""
                                      }
                                      dateFormat="MMMM d, yyyy h:mm aa"
                                    />
                                    <div>
                                      <p className="hourcss">
                                        What hours are you available?
                                      </p>

                                      <div className="maindategrid">
                                        <div className="dategrid">
                                          {slots.map(
                                            (slot: any, index: any) => (
                                              <div key={index}>
                                                <select
                                                  className="availableDatetime2"
                                                  value={slot.startTime}
                                                  onChange={(e) =>
                                                    handleSlotStartTimeChange(
                                                      e,
                                                      index
                                                    )
                                                  }
                                                >
                                                  {timeOptions.map(
                                                    (time, index) => (
                                                      <option
                                                        key={index}
                                                        value={time}
                                                      >
                                                        {time}
                                                      </option>
                                                    )
                                                  )}
                                                </select>{" "}
                                                -{" "}
                                                <select
                                                  className="availableDatetime2"
                                                  value={slot.endTime} // Set the value attribute to the end time of the current slot
                                                  onChange={(e) =>
                                                    handleSlotEndTimeChange(
                                                      e,
                                                      index
                                                    )
                                                  } // Update the end time of the slot in the slots array
                                                >
                                                  {timeOptions.map(
                                                    (time, index) => (
                                                      <option
                                                        key={index}
                                                        value={time}
                                                      >
                                                        {time}
                                                      </option>
                                                    )
                                                  )}
                                                </select>
                                                <Button
                                                  onClick={() =>
                                                    handleDeleteDateSlot1(index)
                                                  }
                                                  type="button"
                                                  className="availablecross"
                                                  icon="pi pi-times"
                                                />
                                              </div>
                                            )
                                          )}
                                        </div>

                                        <div>
                                          <Button
                                            onClick={addSlot}
                                            type="button"
                                            icon="pi pi-plus"
                                            className="availablebtn"
                                          />
                                        </div>
                                      </div>
                                      <Divider />

                                      <span className="calenderpopoubtn">
                                        <Button
                                          type="button"
                                          label="Cancel"
                                          onClick={handleCalendarClose}
                                          className="cancelbtncalender"
                                        />
                                        <Button
                                          type="button"
                                          label="Apply"
                                          onClick={handleMerge}
                                          className="applybtncalender"
                                        />
                                      </span>
                                    </div>
                                  </div>
                                </Dialog>
                              </div>
                            </div>
                            <br />
                            <div className="col-12 lg:col-6 xl:col-12 availabilitygrid">
                              <div className="card mb-0">
                                <div className="flex justify-content-between mb-3">
                                  <div className="avail2">
                                    <h5 className="subheadingservice">
                                      Holidays
                                    </h5>
                                  </div>
                                </div>
                                <Button
                                  label="Select date for holidays"
                                  icon="pi pi-plus"
                                  className="specificbtn"
                                  onClick={() => setHolidayCalendarOpen(true)}
                                  type="button"
                                />
                                {selectedHolidayDates &&
                                selectedHolidayDates?.length === 0 ? (
                                  ""
                                ) : (
                                  <div className="holidayouterdiv">
                                    {selectedHolidayDates &&
                                      selectedHolidayDates.map(
                                        (slot: any, index: any) => (
                                          <>
                                            <div
                                              key={index}
                                              className="holidaycross"
                                            >
                                              <p className="dateholiday">
                                                {" "}
                                                <i
                                                  className="pi pi-calendar-plus"
                                                  style={{
                                                    fontSize: "14px",
                                                  }}
                                                ></i>
                                                &nbsp;&nbsp;
                                                {moment(slot).format(
                                                  "MMM DD, YYYY"
                                                )}
                                              </p>
                                              <p className="displayholidaynone">
                                                &emsp;&emsp; - &emsp;&nbsp;
                                              </p>
                                              <Button
                                                onClick={() =>
                                                  handleHolidayDeleteDate(index)
                                                }
                                                type="button"
                                                className="availablecross2"
                                                icon="pi pi-times"
                                              />
                                            </div>
                                          </>
                                        )
                                      )}
                                  </div>
                                )}

                                <Dialog
                                  visible={holidayCalendarOpen}
                                  onHide={handleCalendarClose}
                                  header="Select the date(s) you want to assign holidays"
                                  modal
                                  style={{ width: "352px" }}
                                >
                                  <div className="calendar-container">
                                    <DatePicker
                                      inline
                                      selected={null} // no single selected date
                                      onChange={handleHolidayDateSelect}
                                      highlightDates={selectedHolidayDates.map(
                                        (date: any) => new Date(date)
                                      )}
                                      dayClassName={(date) =>
                                        isDateHolidaySelected(date)
                                          ? "selected-date"
                                          : ""
                                      }
                                      dateFormat="MMMM d, yyyy h:mm aa"
                                    />
                                    <div>
                                      {selectedHolidayDates &&
                                      selectedHolidayDates?.length === 0 ? (
                                        <p className="hourcss">
                                          No dates selecte for holidays
                                        </p>
                                      ) : (
                                        <p className="hourcss">
                                          Selected dates for holidays
                                        </p>
                                      )}
                                      <div className="maindategrid">
                                        <div className="dategrid">
                                          {selectedHolidayDates &&
                                            selectedHolidayDates.map(
                                              (slot: any, index: any) => (
                                                <div key={index}>
                                                  <p className="dateholiday">
                                                    {" "}
                                                    <i
                                                      className="pi pi-calendar-plus"
                                                      style={{
                                                        fontSize: "14px",
                                                      }}
                                                    ></i>
                                                    &nbsp;&nbsp;
                                                    {moment(slot).format(
                                                      "MMM DD, YYYY"
                                                    )}
                                                  </p>
                                                </div>
                                              )
                                            )}
                                        </div>
                                      </div>
                                      <Divider />

                                      <span className="calenderpopoubtn">
                                        <Button
                                          type="button"
                                          label="Cancel"
                                          onClick={handleCalendarClose}
                                          className="cancelbtncalender"
                                        />
                                        <Button
                                          type="button"
                                          label="Close"
                                          onClick={handleCalendarClose}
                                          className="applybtncalender"
                                        />
                                      </span>
                                    </div>
                                  </div>
                                </Dialog>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <br />
                    </div>
                  </div>
                  <div className="col-12 lg:col-6 xl:col-4">
                    <div className="card mb-0 card2">
                      <br />
                      <div className="flex flex-column gap-2">
                        <label htmlFor="username" className="stripeheading">
                          Status
                        </label>
                        <div className="flex justify-content-left">
                          <Dropdown
                            value={selectedStatus}
                            {...register("status")}
                            onChange={(e) => setSelectedStatus(e.value)}
                            options={statusType}
                            optionLabel="name"
                            placeholder="Status"
                            className="w-full typedropdown"
                          />
                        </div>
                        {errors && errors.status ? (
                          <p className="errorcss">
                            <small id="username-help">
                              {ErrorFormMsg(errors?.status?.message)}
                            </small>
                          </p>
                        ) : (
                          ""
                        )}
                      </div>
                      <br />
                      <div className="flex flex-column gap-2">
                        <label htmlFor="username" className="stripeheading">
                          Type
                        </label>
                        <div className="flex justify-content-left">
                          <Dropdown
                            value={type}
                            {...register("type")}
                            onChange={(e) => setType(e.value)}
                            options={serviceType}
                            optionLabel="name"
                            placeholder="Type"
                            className="w-full typedropdown"
                          />
                        </div>
                        {errors && errors.type ? (
                          <p className="errorcss">
                            <small id="username-help">
                              {ErrorFormMsg(errors?.type?.message)}
                            </small>
                          </p>
                        ) : (
                          ""
                        )}
                      </div>
                      <br />
                      <br />
                      <div className="divsave">
                        {!loader ? (
                          <>
                            <Button
                              label="Save"
                              type="submit"
                              className="p-button-success btnsave1 service"
                            />
                          </>
                        ) : (
                          <Button
                            label="Loading..."
                            className="p-button-success btnsave"
                          />
                        )}
                      </div>
                    </div>
                  </div>
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

export default AddServices;
