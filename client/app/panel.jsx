import ReactMarkdown from "react-markdown";

export default function Panel({ observation, text, typing, showDetails }) {
    
    if (!observation) {
        return null;
    }

    function downloadJSON() {
        const blob = new Blob([JSON.stringify(observation, null, 4)], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `${observation.ip}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    return (
        <div id="observation-panel">
            <div className="panel-header">
                <span>OBSERVATION</span>
                <strong>{observation.ip}</strong>
            </div>

            {!observation.found ? (
                <div className="panel-message">
                    {observation.message}
                </div>
            ) : (
                <div className="panel-content">
                    <ReactMarkdown children={text} />
                    {typing && <span className="cursor">▋</span>} 
                </div>       
            )}
            <div className="panel-actions">
                <button type="button" onClick={() =>  { console.log("DETAIL IP:", observation.ip); showDetails(observation.ip); }}> SHOW DETAILS </button>
                <button type="button" onClick={downloadJSON}> DOWNLOAD JSON </button>
                <span className="panel-meta">{observation.observation_id}</span>
            </div>
        </div>
    );
}