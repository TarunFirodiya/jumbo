"use client";

import { Home, Heart, Route } from "lucide-react";
import { NavBar } from "./tubelight-navbar";
import { useLocation } from "react-router-dom";

export function Footerdemo() {
  const location = useLocation();
  const navItems = [
    {
      name: "Home",
      url: "/buildings",
      icon: Home,
    },
    {
      name: "Shortlist",
      url: "/shortlist",
      icon: Heart,
    },
    {
      name: "Visits",
      url: "/visits",
      icon: Route,
    },
  ];

  return <NavBar items={navItems} />;
}
