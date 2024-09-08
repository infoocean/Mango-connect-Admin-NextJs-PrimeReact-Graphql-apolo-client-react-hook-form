/* eslint-disable @next/next/no-img-element */
import { classNames } from "primereact/utils";
import React, {
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef,
} from "react";
import { AppTopbarRef } from "@/types";
import { LayoutContext } from "./context/layoutcontext";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { jwtDecode } from "jwt-decode";
import { Avatar } from "primereact/avatar";
import { nextLocalStorage } from "@/app/utils/commonFuns";

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
  const router = useRouter();
  const check_token = nextLocalStorage()?.getItem("token");
  const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } =
    useContext(LayoutContext);
  const menubuttonRef = useRef(null);
  const topbarmenuRef = useRef(null);
  const topbarmenubuttonRef = useRef(null);
  const menu = useRef<Menu>(null);

  useImperativeHandle(ref, () => ({
    menubutton: menubuttonRef.current,
    topbarmenu: topbarmenuRef.current,
    topbarmenubutton: topbarmenubuttonRef.current,
  }));

  const handleLogout = () => {
    nextLocalStorage()?.removeItem("token");
    nextLocalStorage()?.removeItem("id");
    nextLocalStorage()?.removeItem("auth_token");
    nextLocalStorage()?.removeItem("option");
    router.push("/login");
  };

  const nestedMenuitems = [
    {
      items: [
        {
          label: "Profile",
          icon: "pi pi-fw pi-user",
          command: () => {
            router.push("/admin/profile");
          },
        },
        {
          label: "Logout",
          icon: "pi pi-fw pi-sign-out",
          command: () => {
            handleLogout();
          },
        },
      ],
    },
  ];
  const nestedMenuProfile = [
    {
      items: [
        {
          label: "Profile",
          icon: "pi pi-fw pi-user",
          command: () => {
            router.push("/admin/profile");
          },
        },
      ],
    },
  ];
  const toggleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    menu.current?.toggle(event);
  };

  const decoded: any = check_token && jwtDecode(check_token);
  const getInitials = (name: any) => {
    const nameParts: any = name && name?.split(" ");
    return nameParts && nameParts?.map((part: any[]) => part[0])?.join("");
  };

  const handleLogoClick = () => {
    if (check_token && check_token) {
      router.push("/admin/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="layout-topbar">
      {check_token && (
        <button
          ref={menubuttonRef}
          type="button"
          className="p-link layout-menu-button layout-topbar-button"
          onClick={onMenuToggle}
        >
          <i className="pi pi-bars" />
        </button>
      )}
      <div onClick={handleLogoClick} className="ogo sitelogo">
        <img
          src={`/layout/images/banner.svg`}
          className="imagecss"
          alt="logo"
        />
      </div>

      <button
        ref={topbarmenubuttonRef}
        type="button"
        className="p-link layout-topbar-menu-button layout-topbar-button"
        onClick={showProfileSidebar}
      >
        <i className="pi pi-ellipsis-v" onClick={toggleMenu} />
      </button>

      <div
        ref={topbarmenuRef}
        className={classNames("layout-topbar-menu", {
          "layout-topbar-menu-mobile-active1":
            layoutState.profileSidebarVisible,
        })}
      >
        {check_token && (
          <button
            type="button"
            className="p-link layout-topbar-button avatar"
            onClick={toggleMenu}
          >
            {/* <i className="pi pi-cog"></i> */}
            <Avatar
              label={getInitials(decoded && decoded?.name)}
              size="large"
              shape="circle"
              className="avatarcss"
            />

            {/* <span>Settings</span> */}
            {check_token && check_token !== null ? (
              <Menu
                ref={menu}
                model={nestedMenuitems}
                popup
                className="topbar"
              />
            ) : (
              <Menu
                ref={menu}
                model={nestedMenuProfile}
                popup
                className="topbar"
              />
            )}
          </button>
        )}
      </div>
    </div>
  );
});

AppTopbar.displayName = "AppTopbar";

export default AppTopbar;
