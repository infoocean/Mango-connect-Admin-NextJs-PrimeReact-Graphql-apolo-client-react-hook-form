/* eslint-disable @next/next/no-img-element */

import React, { useContext } from "react";
import AppMenuitem from "./AppMenuitem";
import { LayoutContext } from "./context/layoutcontext";
import { MenuProvider } from "./context/menucontext";
import Link from "next/link";
import { AppMenuItem } from "@/types";
import { usePathname, useRouter } from "next/navigation";
import { nextLocalStorage } from "@/app/utils/commonFuns";

const AppMenu = () => {
  const router = usePathname();
  const routerpath = useRouter();
  const { layoutConfig } = useContext(LayoutContext);
  const icons =
    router && router === "/admin/configuration"
      ? " pi pi-spin pi-cog"
      : "pi pi-fw pi-cog";

  const handleLogout: any = () => {
    nextLocalStorage()?.removeItem("token");
    nextLocalStorage()?.removeItem("id");
    nextLocalStorage()?.removeItem("auth_token");
    nextLocalStorage()?.removeItem("option");
    routerpath.push("/login");
  };

  const model: AppMenuItem[] = [
    {
      label: "",
      items: [
        {
          label: "Dashboard",
          icon: "pi pi-fw pi-home",
          to: "/admin/dashboard",
        },
        {
          label: "Customers",
          icon: "pi pi-fw pi-user",
          to: "/admin/customers",
        },
        {
          label: "Appointments",
          icon: "pi pi-fw pi-calendar",
          to: "/admin/appointment",
        },
        {
          label: "Invoices",
          icon: "pi pi-fw pi-book",
          to: "/admin/invoices",
        },
        {
          label: "Services",
          icon: "pi pi-fw pi-ticket",
          to: "/admin/services",
        },
        // {
        //   label: "Availability",
        //   icon: "pi pi-fw pi-id-card",
        //   to: "/admin/availability",
        // },
        {
          label: "Configurations",
          icon: icons,
          items: [
            {
              label: "Site Configuration",
              to: "/admin/configuration/site_config",
            },
            // {
            //   label: "Stripe Keys",
            //   to: "/admin/configuration/stripe_keys",
            // },
            {
              label: "Integrations",
              to: "/admin/configuration/integrations",
            },
            // {
            //   label: "Appointment Configuration",
            //   to: "/admin/configuration/appointment_config",
            // },
            {
              label: "Email Templates",
              to: "/admin/configuration/email",
            },
          ],
        },
        {
          label: "Logout",
          icon: "pi pi-fw pi-sign-out",
          command({ originalEvent, item }) {
            handleLogout();
          },
        },
      ],
    },
  ];

  return (
    <MenuProvider>
      <ul className="layout-menu">
        {model.map((item, i) => {
          return !item?.seperator ? (
            <AppMenuitem item={item} root={true} index={i} key={item.label} />
          ) : (
            <li className="menu-separator"></li>
          );
        })}
      </ul>
    </MenuProvider>
  );
};

export default AppMenu;
