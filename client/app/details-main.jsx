import React from "react";
import { createRoot } from "react-dom/client";
import Detail from "./details.jsx";

const ip = new URLSearchParams(window.location.search).get("ip");

createRoot(document.getElementById("root")).render(
    <Detail ip={ip} />
);