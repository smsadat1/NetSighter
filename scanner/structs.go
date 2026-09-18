package scanner

type MatchInfo struct {
	Type       string   `json:"match_type"`
	Service    string   `json:"service"`
	Pattern    string   `json:"pattern"`
	Product    string   `json:"product,omitempty"`
	Version    string   `json:"version,omitempty"`
	Info       string   `json:"info,omitempty"`
	OS         string   `json:"os,omitempty"`
	DeviceType string   `json:"device_type,omitempty"`
	CPEs       []string `json:"cpes,omitempty"`
}

type ProbeInfo struct {
	Transport   string   `json:"transport"`
	Name        string   `json:"name"`
	Payload     []byte   `json:"payload"`
	Rarity      uint16   `json:"rarity"`
	TotalWaitMS uint16   `json:"total_wait_ms"`
	Ports       []uint16 `json:"ports"`
	SSLPorts    []uint16 `json:"ssl_ports"`

	Matches []MatchInfo `json:"matches"`
}

type ProbeIndex struct {
	ByPort map[uint16][]*ProbeInfo
}
type ProbeDB struct {
	ProbeInfos []ProbeInfo
	ProbeIdx   ProbeIndex
}

// build inverted-index of ports over ProbeInfos
func (pDB *ProbeDB) buildProbeIndex() {

	for i := range pDB.ProbeInfos {
		probe := pDB.ProbeInfos[i]

		for _, port := range probe.Ports {
			pDB.ProbeIdx.ByPort[port] = append(pDB.ProbeIdx.ByPort[port], &probe)
		}
	}
}

type ScannedPortInfo struct {
	Port int `json:"port"`

	Transport string `json:"transport"`
	ProbeUsed string `json:"probe_used"`
	Rarity    uint16 `json:"rarity_score"`

	PortData MatchInfo
}

type ScannedIPInfo struct {
	ObservationID       string `json:"observation_id"`
	ObservationDatetime string `json:"observation_datetime"`
	VantageRegion       string `json:"vantage_region"`
	RawDataRef          string `json:"raw_data_ref"`

	IP    string `json:"ip"`
	Ports []ScannedPortInfo
}
