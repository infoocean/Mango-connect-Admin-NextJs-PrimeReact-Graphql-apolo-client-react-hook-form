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
import { editserviceValidation } from "@/app/validation/validations";
import { ErrorFormMsg } from "@/demo/components/ErrorMessgae";
import { Dropdown } from "primereact/dropdown";
import Image from "next/image";
import { ApolloError } from "@apollo/client";
import { EDIT_SERVICES } from "@/app/api/lib/graphql_mutation";
import client from "@/app/api/lib/apollo-client";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Dialog } from "primereact/dialog";
import moment from "moment";
import { GET_SERVICE_DETAIL } from "@/app/api/lib/graphql_queries";
// import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const DatePicker = dynamic(() => import("react-datepicker"), { ssr: false });

const EditServices: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  let getId: any = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  // const [text, setText] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<any>("");
  const [type, setType] = useState<any>("");

  const [image, setImage] = useState<any>(null);
  const [imageFile, setImageFile] = useState<any>(null);
  const [addedSlots, setAddedSlots] = useState<any>([]);
  const [getServiceData, setServiceData] = useState<any>([]);
  const [serviceAvailability, setServiceAvailability] = useState<any>([]);
  const [holidayCalendarOpen, setHolidayCalendarOpen] = useState<any>(false);
  const [selectedHolidayDates, setSelectedHolidayDates] = useState<any>([]);

  const [calendarOpen, setCalendarOpen] = useState<any>(false);
  const [selectedDates, setSelectedDates] = useState<any>([]);
  const [weeklyAvailability, setWeeklyAvailability] = useState<any>({
    sun: [{ time: null, isEnable: false }],
    mon: [{ time: null, isEnable: false }],
    tue: [{ time: null, isEnable: false }],
    wed: [{ time: null, isEnable: false }],
    thu: [{ time: null, isEnable: false }],
    fri: [{ time: null, isEnable: false }],
    sat: [{ time: null, isEnable: false }],
  });
  const daysOrder: any = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  const [availabilityData, setAvailabilityData] = useState<any>(null);
  const fileInputRef = useRef<any>(null);
  const [slots, setSlots] = useState<any>([]);
  const [specificDate, setSpecificDate] = useState<any>(null);
  const [text, setText] = useState<any>("");
  const [description, setDescription] = useState<any>("");
  const [dateData, setDateData] = useState<any>([]);
  const [holidayData, setHolidayData] = useState<any>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(editserviceValidation),
  });
  useEffect(() => {
    getServiceDetail();
    if (!availabilityData) {
      const initialData: any = {
        weekly: {},
        holiday: { dates: [] },
        date: { dates: [] },
      };

      addSlot();
      setAvailabilityData(initialData);
    }
  }, [availabilityData]);

  const getServiceDetail = async () => {
    setLoading(true);
    try {
      const data = await client.query({
        query: GET_SERVICE_DETAIL,
        variables: {
          getServiceDetailsByIdId: parseInt(getId),
        },
      });

      if (data && data?.data) {
        const parseServiceData = JSON.parse(data?.data?.getServiceDetailsById);
        setServiceAvailability(parseServiceData?.availability);
        const dateAerray = parseServiceData?.availability.find(
          (item: any) => item.key === "date"
        );
        const weeklydata = parseServiceData?.availability.find(
          (item: any) => item.key === "weekly"
        );
        const holidayData = parseServiceData?.availability.find(
          (item: any) => item.key === "holiday"
        );
        setHolidayData(holidayData);
        setDateData(dateAerray);
        setWeeklyData(weeklydata);
        const transformedArray = {
          key: "date",
          value: {
            dates: dateAerray.value.map((item: any) => ({
              date: item.date,
              time: item.time.map((timeItem: any) => ({
                startTime: timeItem.startTime,
                endTime: timeItem.endTime,
              })),
            })),
          },
        };
        setSpecificDate(transformedArray);
        setServiceData(parseServiceData && parseServiceData?.service);
        const service = parseServiceData?.service;

        if (service) {
          const shortDescription = service?.short_description || "";
          setDescription(shortDescription);
          setValue("name", service.name || "");
          setText(service.short_description || "");
          setValue("description", service.short_description || "");
          setValue("duration", service.duration || "");
          setValue("fee", service.fee || "");
          setValue("status", service.status || "");
          setSelectedStatus({ name: service.status });
          setType({ name: service.type });
        }

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
  // Function to set weekly availability data
  const setWeeklyData = (data: any) => {
    setWeeklyAvailability(data.value);
  };

  const handleAddSlot = (day: any) => {
    const updatedAvailability: any = { ...weeklyAvailability };
    if (!updatedAvailability[day][0].time) {
      updatedAvailability[day][0].time = [];
    }

    const dayAvailability = updatedAvailability[day][0];
    const lastSlotEndTime =
      dayAvailability.time.length > 0
        ? dayAvailability.time[dayAvailability.time.length - 1].endTime
        : "00:00";

    const startTime = addMinutesToTime(lastSlotEndTime, 30);
    const endTime = addMinutesToTime(startTime, 60);

    const newSlot = { startTime, endTime };

    if (isOverlap(dayAvailability.time, newSlot)) {
      toast.error(
        "The new slot overlaps with an existing slot. Please select a different time."
      );
      return;
    }

    if (parseInt(endTime.split(":")[0], 10) >= 24) {
      toast.error(
        "The new slot cannot exceed 24:00 hours. Please select a different time."
      );
      return;
    }

    dayAvailability.time.push(newSlot);
    setWeeklyAvailability(updatedAvailability);
  };
  const handleStartTimeChange = (event: any, day: any, slotIndex: any) => {
    const updatedAvailability: any = { ...weeklyAvailability };
    const newStartTime = event.target.value;
    const currentEndTime = updatedAvailability[day][0].time[slotIndex].endTime;

    const newSlot = { startTime: newStartTime, endTime: currentEndTime };

    const remainingSlots = updatedAvailability[day][0].time.filter(
      (_: any, index: any) => index !== slotIndex
    );
    if (isOverlap(remainingSlots, newSlot)) {
      toast.error(
        "The new start time overlaps with an existing slot. Please select a different time."
      );
      return;
    }

    updatedAvailability[day][0].time[slotIndex].startTime = newStartTime;
    setWeeklyAvailability(updatedAvailability);
  };

  const handleEndTimeChange = (event: any, day: any, slotIndex: any) => {
    const updatedAvailability: any = { ...weeklyAvailability };
    const newEndTime = event.target.value;
    const currentStartTime =
      updatedAvailability[day][0].time[slotIndex].startTime;

    // Create the new slot object with the updated end time
    const newSlot = { startTime: currentStartTime, endTime: newEndTime };

    // Get the other time slots for the same day, excluding the one being updated
    const remainingSlots = updatedAvailability[day][0].time.filter(
      (_: any, index: any) => index !== slotIndex
    );

    // Check for overlaps with other slots
    if (isOverlap(remainingSlots, newSlot)) {
      toast.error(
        "The new end time overlaps with an existing slot. Please select a different time."
      );
      return;
    }

    // Update the slot's end time if no overlap is found
    updatedAvailability[day][0].time[slotIndex].endTime = newEndTime;
    setWeeklyAvailability(updatedAvailability);
  };

  const isOverlap = (timeSlots: any, newSlot: any) => {
    const newStart = newSlot.startTime;
    const newEnd = newSlot.endTime;

    return timeSlots.some((slot: any) => {
      const existingStart = slot.startTime;
      const existingEnd = slot.endTime;

      // Check if the new slot overlaps with any existing slot
      return (
        (newStart < existingEnd && newEnd > existingStart) ||
        (newStart < existingEnd && newEnd > existingStart) ||
        newEnd === existingStart ||
        newStart === existingEnd
      );
    });
  };
  const handleDeleteSlot = (day: any, slotIndex: any) => {
    const updatedAvailability: any = { ...weeklyAvailability };
    updatedAvailability[day][0].time.splice(slotIndex, 1);
    setWeeklyAvailability(updatedAvailability);
  };

  const handleDaySelect = (day: any) => {
    const updatedAvailability: any = { ...weeklyAvailability };
    updatedAvailability[day][0].isEnable =
      !updatedAvailability[day][0].isEnable;
    setWeeklyAvailability(updatedAvailability);
  };

  const addMinutesToTime = (time: any, minutes: any) => {
    const [hour, minute] = time.split(":").map(Number);
    const totalMinutes = hour * 60 + minute + minutes;
    const newHour = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const newMinute = (totalMinutes % 60).toString().padStart(2, "0");
    return `${newHour}:${newMinute}`;
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let i = 0; i < 24 * 60; i += 30) {
      const hours = Math.floor(i / 60)
        .toString()
        .padStart(2, "0");
      const minutes = (i % 60).toString().padStart(2, "0");
      times.push(`${hours}:${minutes}`);
    }
    return times;
  };
  const statusType = [
    { name: "active" },
    { name: "archive" },
    { name: "draft" },
  ];
  const serviceType = [{ name: "online" }, { name: "offline" }];

  const onSubmitSiteConfig = async (data: any) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API}/${getServiceData?.image}`
    );
    const blob = await response.blob();
    const file = new File([blob], "image.jpg", { type: blob.type });

    setLoader(true);

    const availability = {
      availability: [
        {
          key: "weekly",
          value: weeklyAvailability,
        },
        {
          key: "date",
          value: specificDate.value.dates,
        },
        {
          key: "holiday",
          value: holidayData?.value,
        },
      ],
    };

    try {
      const response = await client.mutate({
        mutation: EDIT_SERVICES,
        variables: {
          id: parseInt(getId),
          name: data.name,
          duration: parseInt(data.duration),
          fee: parseFloat(data.fee),
          image: imageFile === null ? file : imageFile,
          status: selectedStatus?.name,
          type: type.name,
          short_description: description,
          availability: availability,
        },
        context: {
          useMultipart: true, // Important to tell Apollo Client to use multipart/form-data
        },
      });
      if (response && response?.data) {
        setLoader(false);
        toast.success("Service update successfully");
        setTimeout(() => {
          // window.location.replace("/admin/services");
          router.push("/admin/services");
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

  const isDateSelected = (date: any) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    return selectedDates.includes(dateString);
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
    const mergeDates = mergedData.value.dates;
    const specificDates = specificDate.value.dates;

    // Iterate over each date in mergeData
    mergeDates.forEach((mergeDate: any) => {
      // Find the corresponding date in specificDateData
      const specificDateIndex = specificDates.findIndex(
        (specificDate: any) => specificDate.date === mergeDate.date
      );

      // If the date exists in specificDateData, update it
      if (specificDateIndex !== -1) {
        specificDates[specificDateIndex] = mergeDate;
      } else {
        // If the date doesn't exist, add it to specificDateData
        specificDates.push(mergeDate);
      }
    });
    const mergedData1 = {
      key: "date",
      value: {
        dates: specificDates,
      },
    };

    setSpecificDate(mergedData1);
  };

  const handleChange = (html: string) => {
    setDescription(html);
  };

  const handleHolidayDateSelect = (date: any) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    let updatedSelectedDates;

    if (selectedHolidayDates.includes(dateString)) {
      updatedSelectedDates = selectedHolidayDates.filter(
        (d: any) => d !== dateString
      );
    } else {
      updatedSelectedDates = [...selectedHolidayDates, dateString];
    }

    setSelectedHolidayDates(updatedSelectedDates);

    const existingDates = holidayData.value.map((slot: any) => slot.date);
    const combinedDates = [...existingDates, ...updatedSelectedDates];
    const uniqueDates = Array.from(new Set(combinedDates));

    const updatedValue = uniqueDates.map((date) => ({ date }));
    setHolidayData({ ...holidayData, value: updatedValue });
  };

  const isDateHolidaySelected = (date: any) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    return selectedHolidayDates.includes(dateString);
  };

  const handleHolidayDeleteDate = (indexToDelete: any) => {
    const updatedSlots = holidayData.value.filter(
      (_: any, index: any) => index !== indexToDelete
    );
    console.log("updatedSlots", updatedSlots);
    setHolidayData({ ...holidayData, value: updatedSlots });
  };

  const handleHolidayMerge = () => {
    const existingDates = holidayData.value.map((slot: any) => slot.date);
    const combinedDates = [...existingDates, ...selectedHolidayDates];

    // Ensure unique dates
    const uniqueDates = combinedDates.filter(
      (date, index, self) => self.indexOf(date) === index
    );

    const updatedValue = uniqueDates.map((date) => ({ date }));
    setHolidayData({ ...holidayData, value: updatedValue });
    setHolidayCalendarOpen(false);
  };

  const orderedAvailability: any = {};
  daysOrder.forEach((day: any) => {
    if (weeklyAvailability[day]) {
      orderedAvailability[day] = weeklyAvailability[day];
    }
  });

  console.log(
    orderedAvailability,
    "weeklyAvailabilityweeklyAvailability",
    weeklyAvailability
  );

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div className="datatable-editing-demo">
            <div className="wrapperclass">
              <div className="headingcs">
                <h4 className="headingtext">Edit Service</h4>
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
                          <ReactQuill
                            theme="snow"
                            {...register("description")}
                            defaultValue={
                              (getServiceData &&
                                getServiceData?.short_description) ||
                              description
                            }
                            onChange={handleChange}
                          />
                          {errors?.description && (
                            <p className="errorcss">
                              <small id="username-help">
                                {ErrorFormMsg(errors?.description?.message)}
                              </small>
                            </p>
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
                              {getServiceData &&
                              getServiceData?.image &&
                              image === null ? (
                                <Image
                                  src={
                                    process.env.NEXT_PUBLIC_SERVER_API +
                                    "/" +
                                    getServiceData?.image
                                  }
                                  alt="Uploaded Preview"
                                  className="image-preview"
                                  width={55}
                                  height={55}
                                />
                              ) : (
                                ""
                              )}
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
                                        {/* {Object.entries(weeklyAvailability).map(
                                          (
                                            [day, availability]: any,
                                            dayIndex: any
                                          ) => (
                                            <div
                                              className="mainavailblediv"
                                              key={dayIndex}
                                            >
                                              <div className="avaliablealign">
                                                <div className="available2nddiv">
                                                  <input
                                                    type="checkbox"
                                                    checked={
                                                      availability[0].isEnable
                                                    }
                                                    onChange={() =>
                                                      handleDaySelect(day)
                                                    }
                                                    className="availableCheckbox"
                                                  />
                                                  <h3 className="headingAvailable">
                                                    {day.toUpperCase()}
                                                  </h3>
                                                  {!availability[0].isEnable ? (
                                                    <div className="text-red-500 unavailable">
                                                      Unavailable
                                                    </div>
                                                  ) : (
                                                    <>
                                                      <div className="slotdiv">
                                                        {availability[0].time &&
                                                        availability[0].time
                                                          .length > 0 ? (
                                                          availability[0].time.map(
                                                            (
                                                              slot: any,
                                                              slotIndex: any
                                                            ) => (
                                                              <ul
                                                                className="availablelistdiv"
                                                                key={slotIndex}
                                                              >
                                                                <select
                                                                  defaultValue={
                                                                    slot.startTime
                                                                  }
                                                                  onChange={(
                                                                    event
                                                                  ) =>
                                                                    handleStartTimeChange(
                                                                      event,
                                                                      day,
                                                                      slotIndex
                                                                    )
                                                                  }
                                                                  className="availabletime"
                                                                >
                                                                  {generateTimeOptions().map(
                                                                    (time) => (
                                                                      <option
                                                                        key={
                                                                          time
                                                                        }
                                                                        value={
                                                                          time
                                                                        }
                                                                      >
                                                                        {time}
                                                                      </option>
                                                                    )
                                                                  )}
                                                                </select>{" "}
                                                                -{" "}
                                                                <select
                                                                  defaultValue={
                                                                    slot.endTime
                                                                  }
                                                                  onChange={(
                                                                    event
                                                                  ) =>
                                                                    handleEndTimeChange(
                                                                      event,
                                                                      day,
                                                                      slotIndex
                                                                    )
                                                                  }
                                                                  className="availabletime"
                                                                >
                                                                  {generateTimeOptions().map(
                                                                    (time) => (
                                                                      <option
                                                                        key={
                                                                          time
                                                                        }
                                                                        value={
                                                                          time
                                                                        }
                                                                      >
                                                                        {time}
                                                                      </option>
                                                                    )
                                                                  )}
                                                                </select>
                                                                <Button
                                                                  onClick={() =>
                                                                    handleDeleteSlot(
                                                                      day,
                                                                      slotIndex
                                                                    )
                                                                  }
                                                                  className="availablecross"
                                                                  icon="pi pi-times"
                                                                  disabled={
                                                                    availability[0]
                                                                      .time
                                                                      .length ===
                                                                    1
                                                                  }
                                                                />
                                                                <br />
                                                              </ul>
                                                            )
                                                          )
                                                        ) : (
                                                          <div>
                                                            No slots available
                                                          </div>
                                                        )}
                                                      </div>
                                                      <Button
                                                        onClick={() =>
                                                          handleAddSlot(day)
                                                        }
                                                        type="button"
                                                        icon="pi pi-plus"
                                                        className="availablebtn"
                                                      />
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          )
                                        )} */}
                                        {Object.entries(
                                          orderedAvailability
                                        ).map(
                                          (
                                            [day, availability]: any,
                                            dayIndex: any
                                          ) => (
                                            <div
                                              className="mainavailblediv"
                                              key={dayIndex}
                                            >
                                              <div className="avaliablealign">
                                                <div className="available2nddiv">
                                                  <input
                                                    type="checkbox"
                                                    checked={
                                                      availability[0].isEnable
                                                    }
                                                    onChange={() =>
                                                      handleDaySelect(day)
                                                    }
                                                    className="availableCheckbox"
                                                  />
                                                  <h3 className="headingAvailable">
                                                    {day.toUpperCase()}
                                                  </h3>
                                                  {!availability[0].isEnable ? (
                                                    <div className="text-red-500 unavailable">
                                                      Unavailable
                                                    </div>
                                                  ) : (
                                                    <>
                                                      <div className="slotdiv">
                                                        {availability &&
                                                          availability[0]
                                                            ?.time &&
                                                          availability[0]?.time?.map(
                                                            (
                                                              slot: any,
                                                              slotIndex: any
                                                            ) => (
                                                              <ul
                                                                className="availablelistdiv"
                                                                key={slotIndex}
                                                              >
                                                                <select
                                                                  defaultValue={
                                                                    slot.startTime
                                                                  }
                                                                  onChange={(
                                                                    event
                                                                  ) =>
                                                                    handleStartTimeChange(
                                                                      event,
                                                                      day,
                                                                      slotIndex
                                                                    )
                                                                  }
                                                                  className="availabletime"
                                                                >
                                                                  {generateTimeOptions().map(
                                                                    (time) => (
                                                                      <option
                                                                        key={
                                                                          time
                                                                        }
                                                                        value={
                                                                          time
                                                                        }
                                                                      >
                                                                        {time}
                                                                      </option>
                                                                    )
                                                                  )}
                                                                </select>{" "}
                                                                -{" "}
                                                                <select
                                                                  defaultValue={
                                                                    slot.endTime
                                                                  }
                                                                  onChange={(
                                                                    event
                                                                  ) =>
                                                                    handleEndTimeChange(
                                                                      event,
                                                                      day,
                                                                      slotIndex
                                                                    )
                                                                  }
                                                                  className="availabletime"
                                                                >
                                                                  {generateTimeOptions().map(
                                                                    (time) => (
                                                                      <option
                                                                        key={
                                                                          time
                                                                        }
                                                                        value={
                                                                          time
                                                                        }
                                                                      >
                                                                        {time}
                                                                      </option>
                                                                    )
                                                                  )}
                                                                </select>
                                                                <Button
                                                                  type="button"
                                                                  onClick={() =>
                                                                    handleDeleteSlot(
                                                                      day,
                                                                      slotIndex
                                                                    )
                                                                  }
                                                                  className="availablecross"
                                                                  icon="pi pi-times"
                                                                  disabled={
                                                                    availability[0]
                                                                      .time
                                                                      .length ===
                                                                    1
                                                                  }
                                                                />
                                                                <br />
                                                              </ul>
                                                            )
                                                          )}
                                                      </div>
                                                      <Button
                                                        onClick={() =>
                                                          handleAddSlot(day)
                                                        }
                                                        type="button"
                                                        icon="pi pi-plus"
                                                        className="availablebtn"
                                                      />
                                                    </>
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
                                    <h5>Date-specific hours</h5>
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
                                {holidayData && holidayData?.length === 0 ? (
                                  ""
                                ) : (
                                  <div className="holidayouterdiv">
                                    {holidayData &&
                                      holidayData?.value?.map(
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
                                                {moment(slot?.date).format(
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
                                      {holidayData &&
                                      holidayData?.length === 0 ? (
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
                                          {holidayData &&
                                            holidayData?.value?.map(
                                              (slot: any, index: any) => (
                                                <div
                                                  key={index}
                                                  className="alignholiday"
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
                                                    {moment(slot.date).format(
                                                      "MMM DD, YYYY"
                                                    )}
                                                  </p>
                                                  <Button
                                                    onClick={() =>
                                                      handleHolidayDeleteDate(
                                                        index
                                                      )
                                                    }
                                                    type="button"
                                                    className="availablecross2"
                                                    icon="pi pi-times"
                                                  />
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
                              label="Update"
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

export default EditServices;
