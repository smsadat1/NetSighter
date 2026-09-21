import { useEffect, useState, useRef } from "react";
import { Globe } from "./globe.js";

export default function App() {
    const containerRef = useRef(null);
    const globeRef = useRef(null);
    const [vantages, setVantages] = useState([]);
    const [regions, setRegions] = useState([]);
    const [active, setActive] = useState(0);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const globe = new Globe();

        globe.start();
        globe.render(containerRef.current);
        globe.orbitControl();
        globe.addEvent();

        globeRef.current = globe;

        return () => {
            // cleanup later
        };
    }, []);

    useEffect(() => {
        const globe = globeRef.current;

        if (!globe) {
            return;
        }

        for (const vantage of vantages) {
            globe.addMarker(vantage.longitude, vantage.latitude, vantage.status);
        }
    }, [vantages]);

    useEffect(() => {
        async function loadData() {
            const [regionsResponse, vantagesResponse] = await Promise.all([
                fetch("http://localhost:8000/status/vantages"),
                fetch("http://localhost:8000/status/locations")
            ]);

            const regionsData = await regionsResponse.json();
            const vantagesData = await vantagesResponse.json();

            setRegions(regionsData.regions);
            setActive(regionsData.active);
            setTotal(regionsData.total);
            setVantages(vantagesData.vantages ?? vantagesData);
        }

        loadData();
    }, []);

    console.log("REGIONS:", regions);
    return (
        <>
            <div
                ref={containerRef}
                style={{width: "100vw", height: "100vh"}}
            />

            <div id="info">
                <div className="title-wrapper">
                    <a>NetSighter</a>
                </div>
                
                <search>
                    <form action="/search-results" method="GET">
                        <input
                            type="search"
                            id="site-search"
                            name="q"
                            placeholder="IP / HOST / DOMAIN"
                            aria-label="Search IP, host, or domain"
                            required
                        />
                        <button type="submit">→</button>
                    </form>
                </search>
            </div>

            <div id="vantage-status">
                <div className="panel-header">
                    <span>VANTAGE REGIONS</span>
                    <strong>{active}/{total}</strong>
                </div>

                <div className="region-list">
                    {regions.map((region) => (
                        <div className="region" key={region.region}>
                            <span className={`status-dot ${region.status.toLowerCase()}`}></span>
                            <span className="region-name">{region.region}</span>
                            <span className="region-state">{region.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}