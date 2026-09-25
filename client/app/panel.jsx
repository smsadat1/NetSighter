import ReactMarkdown from "react-markdown";

export default function Panel({ observation, text, typing }) {
    
    
    if (!observation) {
        return null;
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
                <button type="button">SHOW DETAILS</button>
                <button type="button">DOWNLOAD RAW</button>
                <span className="panel-meta">{observation.observation_id}</span>
            </div>
        </div>
    );
}