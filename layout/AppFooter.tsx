/* eslint-disable @next/next/no-img-element */

import React, { useContext } from "react";
import { LayoutContext } from "./context/layoutcontext";

const AppFooter = () => {
  const { layoutConfig } = useContext(LayoutContext);

  return (
    <div className="layout-footer">
      <img
        src={`/layout/images/logo1.png`}
        alt="Logo"
        height="30"
        className="mr-1"
      />
      by
      <span className="font-medium ml-2">MangoConnect</span>
    </div>
  );
};

export default AppFooter;
