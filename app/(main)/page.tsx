"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import LoginPage from "../(full-page)/login/page";
import Dashboard from "./admin/dashboard/page";
import { nextLocalStorage } from "../utils/commonFuns";

const MainComponent = () => {
  const check_token = nextLocalStorage()?.getItem("token");

  return (
    <div className="">
      {check_token && check_token !== null ? <Dashboard /> : <LoginPage />}
    </div>
  );
};

export default MainComponent;
