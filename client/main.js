import { Globe } from "./globe.js";

const globe = new Globe();

globe.start();
globe.render();
globe.orbitControl();
globe.addEvent();
globe.addMarker(1.3043, 103.4343, "ACTIVE")