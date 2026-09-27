import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Detail({ip}) {

    const [observation, setObservation] = useState(null);

    useEffect(() => {
        if (!ip) {
          return;
        }

        async function loadObservation() {
            const response = await fetch(
                `http://localhost:8000/observation/${ip}/details`
            );

            const data = await response.json();
            setObservation(data);
        }

        loadObservation();
    }, [ip]);

    if (!observation) 
    { 
        return ( 
            <div id="details-loading"> LOADING OBSERVATION... </div> 
        ); 
    } 
    
    return ( 
        <main id="observation-details"> 
            <header className="details-header"> 
                <div> <span className="details-label">OBSERVATION</span> <h1>{observation.ip}</h1> </div> 
                <div className="details-meta"> 
                    <span>{observation.observation_id}</span> 
                    <span>{observation.vantage_region.toUpperCase()}</span> 
                    <span>{observation.observed_at}</span> 
                </div> 
            </header> 
            
            <section className="details-section"> 
                <div className="section-header"> <span>SERVICES</span> <strong>{observation.services.length}</strong> </div> 
                <div className="service-list"> 
                    { 
                        observation.services.map((service, index) => ( 
                            <div className="service" key={index}> 
                                <div className="service-port"> 
                                    <strong>{service.port}</strong> 
                                    <span>{service.transport.toUpperCase()}</span> 
                                </div> 
                                <div className="service-info"> 
                                    <strong>{service.service.toUpperCase()}</strong> 
                                    <span>{service.product}</span> 
                                </div> 
                                <div className="service-version"> {service.version || "—"} </div> 
                            </div> ))
                    } 
                </div> 
            </section> 
            
            <section className="details-section analysis-section"> 
                <div className="section-header"> <span>ANALYSIS</span> </div> 
                <div className="analysis"> <ReactMarkdown children={observation.analysis} /> </div> 
            </section> 
            
            <section className="details-section"> 
                <div className="section-header"> <span>ARTIFACTS</span> </div> 
                <div className="artifact-list"> 
                    <div className="artifact"> <span>LLM MODEL</span> <strong>{observation.artifacts.llm_model}</strong> </div> 
                        <div className="artifact"> 
                            <span>PROMPT VERSION</span> <strong>{observation.artifacts.llm_prompt_version}</strong> 
                        </div> 
                    </div> 
            </section> 
            
            <div className="details-actions"> 
                <button type="button" onClick={() => window.history.back()} > ← BACK </button> 
                <button type="button" onClick={() => { 
                    const blob = new Blob( [JSON.stringify(observation, null, 4)], 
                    {type: "application/json"} ); const url = URL.createObjectURL(blob); 
                    const link = document.createElement("a"); 
                    link.href = url; 
                    link.download = `${observation.ip}.json`; 
                    link.click(); URL.revokeObjectURL(url); }} 
                > DOWNLOAD JSON </button> 
            </div> 
        </main>     
    );
}