import { Globe } from "./globe.js";

const globe = new Globe();

globe.start();
globe.render();
globe.orbitControl();
globe.addEvent();

globe.addMarker(103.8198, 1.3521, "ACTIVE");    // Singapore
globe.addMarker(72.8774, 19.0761, "OFFLINE");   // Mumbai
globe.addMarker(8.6821, 50.1109, "ACTIVE");    // Frankfurt
globe.addMarker(-78.65, 37.43, "IDLE");         // Virginia
globe.addMarker(55.296249, 25.276987, "ACTIVE") // Dubai
globe.addMarker(139.6917, 35.6895, "IDLE")      // Tokyo