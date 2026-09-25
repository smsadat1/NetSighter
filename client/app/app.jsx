import { useEffect, useState, useRef } from "react";
import { Globe } from "./globe.js";
import Search  from "./search.jsx"
import Panel from "./panel.jsx";

export default function App() {
    const containerRef = useRef(null);
    const globeRef = useRef(null);
    const [vantages, setVantages] = useState([]);
    const [regions, setRegions] = useState([]);
    const [active, setActive] = useState(0);
    const [total, setTotal] = useState(0);
    const [observation, setObservation] = useState(null);
    const [panelText, setPanelText] = useState("");
    const [typing, setTyping] = useState(false);

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


    async function handleSearch(event) {
        
        event.preventDefault();

        const ip = event.target.q.value;
        const response = await fetch(
            `http://localhost:8000/search/${ip}`, {method: "POST"}
        );
        const data = await response.json();
        
        if (!data.found) {
            setObservation({found: false, ip: ip, message: data.message});
            return;
        }
        
        globeRef.current.addMarker(data.longitude, data.latitude, "ACTIVE");
        globeRef.current.flyTo(data.longitude, data.latitude);
        
        const summaryResponse = await fetch(
            `http://localhost:8000/observation/${ip}/summary`
        );
        const summary = await summaryResponse.json();
        
        setObservation({
            found: true, ip: ip, summary: summary.summary
        });

        setPanelText("");
        setTyping(true);

        for (let i = 0; i < summary.summary.length; i += 5) {
            await new Promise(resolve => setTimeout(resolve, 15));
            setPanelText(summary.summary.slice(0, i + 5));
        }

        setPanelText(summary.summary);
        setTyping(false);
    }

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
                <Search handleSearch={handleSearch} />     
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

            <Panel observation={observation} text={panelText} typing={typing}/>           
        </>
    );
}