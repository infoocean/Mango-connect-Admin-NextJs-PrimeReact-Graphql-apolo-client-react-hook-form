/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter } from "next/navigation";
import {
  useEventListener,
  useMountEffect,
  useUnmountEffect,
} from "primereact/hooks";
import React, { useContext, useEffect, useRef } from "react";
import { classNames } from "primereact/utils";
import AppFooter from "./AppFooter";
import AppSidebar from "./AppSidebar";
import AppTopbar from "./AppTopbar";
import AppConfig from "./AppConfig";
import { LayoutContext } from "./context/layoutcontext";
import { PrimeReactContext } from "primereact/api";
import { ChildContainerProps, LayoutState, AppTopbarRef } from "@/types";
import { usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_AUTHORIZATION_TOKEN } from "@/app/api/lib/graphql_queries";
import client from "@/app/api/lib/apollo-client";
import { nextLocalStorage } from "@/app/utils/commonFuns";
import { jwtDecode } from "jwt-decode";

const Layout = ({ children }: ChildContainerProps) => {
  const router = useRouter();
  const { layoutConfig, layoutState, setLayoutState } =
    useContext(LayoutContext);
  const { setRipple } = useContext(PrimeReactContext);
  const topbarRef = useRef<AppTopbarRef>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [bindMenuOutsideClickListener, unbindMenuOutsideClickListener] =
    useEventListener({
      type: "click",
      listener: (event) => {
        const isOutsideClicked = !(
          sidebarRef.current?.isSameNode(event.target as Node) ||
          sidebarRef.current?.contains(event.target as Node) ||
          topbarRef.current?.menubutton?.isSameNode(event.target as Node) ||
          topbarRef.current?.menubutton?.contains(event.target as Node)
        );

        if (isOutsideClicked) {
          hideMenu();
        }
      },
    });
  const check_token = nextLocalStorage()?.getItem("token");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // const search = searchParams.get('search')

  useEffect(() => {
    hideMenu();
    hideProfileMenu();
  }, [pathname, searchParams]);

  const [
    bindProfileMenuOutsideClickListener,
    unbindProfileMenuOutsideClickListener,
  ] = useEventListener({
    type: "click",
    listener: (event) => {
      const isOutsideClicked = !(
        topbarRef.current?.topbarmenu?.isSameNode(event.target as Node) ||
        topbarRef.current?.topbarmenu?.contains(event.target as Node) ||
        topbarRef.current?.topbarmenubutton?.isSameNode(event.target as Node) ||
        topbarRef.current?.topbarmenubutton?.contains(event.target as Node)
      );

      if (isOutsideClicked) {
        hideProfileMenu();
      }
    },
  });

  const hideMenu = () => {
    setLayoutState((prevLayoutState: LayoutState) => ({
      ...prevLayoutState,
      overlayMenuActive: false,
      staticMenuMobileActive: false,
      menuHoverActive: false,
    }));
    unbindMenuOutsideClickListener();
    unblockBodyScroll();
  };

  const hideProfileMenu = () => {
    setLayoutState((prevLayoutState: LayoutState) => ({
      ...prevLayoutState,
      profileSidebarVisible: false,
    }));
    unbindProfileMenuOutsideClickListener();
  };

  const blockBodyScroll = (): void => {
    if (document.body.classList) {
      document.body.classList.add("blocked-scroll");
    } else {
      document.body.className += " blocked-scroll";
    }
  };

  const unblockBodyScroll = (): void => {
    if (document.body.classList) {
      document.body.classList.remove("blocked-scroll");
    } else {
      document.body.className = document.body.className.replace(
        new RegExp(
          "(^|\\b)" + "blocked-scroll".split(" ").join("|") + "(\\b|$)",
          "gi"
        ),
        " "
      );
    }
  };
  useEffect(() => {
    const check_auth_token = nextLocalStorage()?.getItem("auth_token");

    if (layoutState.overlayMenuActive || layoutState.staticMenuMobileActive) {
      bindMenuOutsideClickListener();
    }
    layoutState.staticMenuMobileActive && blockBodyScroll();
    if (check_auth_token) {
      const decoded: any = jwtDecode(check_auth_token);
      const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds

      if (decoded.exp < currentTime) {
        // Token has expired, redirect to login page
        nextLocalStorage()?.removeItem("auth_token");
        nextLocalStorage()?.removeItem("token");
        nextLocalStorage()?.removeItem("id");
        nextLocalStorage()?.removeItem("option");
        get_token();
        router.push("/login");
      }
    } else {
      get_token();
    }
  }, [layoutState.overlayMenuActive, layoutState.staticMenuMobileActive]);

  useEffect(() => {
    if (layoutState.profileSidebarVisible) {
      bindProfileMenuOutsideClickListener();
    }
  }, [layoutState.profileSidebarVisible]);

  useUnmountEffect(() => {
    unbindMenuOutsideClickListener();
    unbindProfileMenuOutsideClickListener();
  });

  const containerClass = classNames("layout-wrapper", {
    "layout-overlay": layoutConfig.menuMode === "overlay",
    "layout-static": layoutConfig.menuMode === "static",
    "layout-static-inactive":
      layoutState.staticMenuDesktopInactive &&
      layoutConfig.menuMode === "static",
    "layout-overlay-active": layoutState.overlayMenuActive,
    "layout-mobile-active": layoutState.staticMenuMobileActive,
    "p-input-filled": layoutConfig.inputStyle === "filled",
    "p-ripple-disabled": !layoutConfig.ripple,
  });

  const get_token = async () => {
    const {
      data: {
        generateAuthorizationToken: { token },
      },
    } = await client.query({
      query: GET_AUTHORIZATION_TOKEN,
    });
    if (token) {
      nextLocalStorage()?.setItem("auth_token", token);
    }
  };

  return (
    <React.Fragment>
      <div className={containerClass}>
        <AppTopbar ref={topbarRef} />
        {check_token && check_token !== null ? (
          <>
            <div ref={sidebarRef} className="layout-sidebar">
              <AppSidebar />
            </div>
            <div className="layout-main-container first">
              <div className="layout-main ">{children}</div>
            </div>
            <AppConfig />
            <AppFooter />
          </>
        ) : (
          <>
            <div className="layout-main-containers second">
              <div className="layout-main ">{children}</div>
              <AppFooter />
            </div>
            <AppConfig />
          </>
        )}

        <div className="layout-mask"></div>
      </div>
    </React.Fragment>
  );
};

export default Layout;
