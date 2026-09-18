package scanner

import (
	"net"
	"regexp"
)

/*
	Get list of open ports from an IP

	Access specific port's related request payloads from NmapProbedb and send payload
	Then match response against the related payload from match pattern list
	Repeat for all the payloads of a specific ports
	Extract data
*/

func probeOpenPort(conn net.Conn, ip string, port int) (ScannedPortInfo, error) {

	var scPortInfo ScannedPortInfo
	var response []byte

	payload := NmapProbeDB.ProbeIdx.ByPort[uint16(port)]

	if _, err := conn.Write(payload[uint16(port)].Payload); err != nil {
		// handle error
	}

	if _, err := conn.Read(response); err != nil {
		// handle error
	}

	// matche response patter
	for _, match := range payload[uint16(port)].Matches {

		matched, err := regexp.MatchString(match.Pattern, string(response))

		if err != nil {
			// handle error
		}

		if matched {
			scPortInfo.Port = port
			scPortInfo.Rarity = payload[uint16(port)].Rarity
			scPortInfo.ProbeUsed = payload[uint16(port)].Name
			scPortInfo.Transport = payload[uint16(port)].Transport
			scPortInfo.PortData.Pattern = match.Pattern
			scPortInfo.PortData.Service = match.Service
			scPortInfo.PortData.Type = match.Type
		}
	}

	return scPortInfo, nil
}
