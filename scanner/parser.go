// parse nmap prob database
package scanner

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
)

func readDelimited(s string, start int, delim byte) (string, int) {

	for i := start; i < len(s); i++ {
		// handle escapes in delimited bytes
		if s[i] == delim && (s[i] == s[0] || s[i-1] != '\\') {
			return s[start:i], i + 1
		}
	}
	return s[start:], len(s)
}

func parsePorts(s string) ([]uint16, error) {
	var ports []uint16

	for _, part := range strings.Split(s, ",") {
		part = strings.TrimSpace(part)

		// handle port ranges
		if strings.Contains(part, "-") {
			bounds := strings.SplitN(part, "-", 2)

			start, err := strconv.Atoi(bounds[0])
			if err != nil {
				return nil, fmt.Errorf("invalid port range %q: %w", part, err)
			}

			end, err := strconv.Atoi(bounds[1])
			if err != nil {
				return nil, fmt.Errorf("invalid port range %q: %w", part, err)
			}

			if err != nil {
				return nil, fmt.Errorf("invalid port range %q: %w", part, err)
			}

			if start > end || start < 0 || end > 65535 {
				return nil, fmt.Errorf("invalid port range %q", part)
			}

			for port := start; port <= end; port++ {
				ports = append(ports, uint16(port))
			}

			continue
		}

		port, err := strconv.Atoi(part)
		if err != nil {
			return nil, fmt.Errorf("invalid port %q: %w", part, err)
		}

		if port < 0 || port > 65535 {
			return nil, fmt.Errorf("port out of range: %d", port)
		}

		ports = append(ports, uint16(port))
	}

	return ports, nil
}

func parsesMatchOptions(matchOpts string) MatchInfo {
	var m MatchInfo

	s := strings.TrimSpace(matchOpts)

	for i := 0; i < len(s); {

		switch {
		case strings.HasPrefix(s[i:], "p/"):
			value, next := readDelimited(s, i+2, '/')
			m.Product = value
			i = next

		case strings.HasPrefix(s[i:], "v/"):
			value, next := readDelimited(s, i+2, '/')
			m.Version = value
			i = next

		case strings.HasPrefix(s[i:], "i/"):
			value, next := readDelimited(s, i+2, '/')
			m.Info = value
			i = next

		case strings.HasPrefix(s[i:], "o/"):
			value, next := readDelimited(s, i+2, '/')
			m.OS = value
			i = next

		case strings.HasPrefix(s[i:], "cpe:/"):
			value, next := readDelimited(s, i+5, '/')
			m.CPEs = append(m.CPEs, value)
			i = next

		default:
			i++
			// do nothing for invalid options
		}
	}

	return m
}

func ParseNmapProbeDb(filepath string) {

	probeDB, err := os.Open(filepath)
	if err != nil {
		log.Fatal(err)
	}

	defer probeDB.Close()

	const NEXTPROBE = "##############################NEXT PROBE##############################"

	scanner := bufio.NewScanner(probeDB)
	var p ProbeInfo
	var parsingProbe bool

	for scanner.Scan() {
		// parse da probeDB

		currLine := scanner.Text()
		fields := strings.Fields(currLine)

		// new probe
		if currLine == NEXTPROBE {
			// If already parsing a probe, save/log the previous one here.
			p = ProbeInfo{}
			parsingProbe = true
			continue
		}

		if !parsingProbe {
			continue
		}

		// probe data
		if strings.HasPrefix(currLine, "Probe") {
			p.Transport = fields[1]
			p.Name = fields[2]
			p.Payload = []byte(fields[3][2 : len(fields[3])-1])
			continue
		}

		// rarity score
		if strings.HasPrefix(currLine, "rarity") {
			rarity, err := strconv.Atoi(fields[1])
			if err != nil {
				fmt.Printf("Failed to get rarity score: %v\n", err)
				continue
			}
			p.Rarity = uint16(rarity)
			continue
		}

		// ports
		if strings.HasPrefix(currLine, "ports") {
			ports := strings.Fields(currLine)
			p.Ports, err = parsePorts(ports[1])
			if err != nil {
				fmt.Printf("Failed parsing ports: %v\n", err)
			}
			continue
		}

		// sslports
		if strings.HasPrefix(currLine, "sslports") {
			sslports := strings.Fields(currLine)
			p.SSLPorts, err = parsePorts(sslports[1])
			if err != nil {
				fmt.Printf("Failed parsing SSL ports: %v\n", err)
			}
			continue
		}

		// match queries
		var m MatchInfo
		if strings.HasPrefix(currLine, "match") || strings.HasPrefix(currLine, "softmatch") {

			fmt.Println("Match info")

			if strings.HasPrefix(currLine, "match") {
				m.Type = "match"
			}
			if strings.HasPrefix(currLine, "softmatch") {
				m.Type = "softmatch"
			}

			matchParts := strings.SplitN(currLine, " ", 3)
			m.Service = matchParts[1]

			rest := matchParts[2]
			matchDelimiter := rest[1]

			// match pattern
			start := 2
			end := strings.IndexByte(rest[start+1:], matchDelimiter)
			end += start + 1
			matchPattern := rest[start+1 : end]
			m.Pattern = matchPattern

			// match options
			options := rest[end+1:]
			mOpts := parsesMatchOptions(options)
			m.Product = mOpts.Product
			m.Version = mOpts.Version
			m.Info = mOpts.Info
			m.OS = mOpts.OS
			m.CPEs = mOpts.CPEs

			p.Matches = append(p.Matches, m)
			continue
		}

		// log probe
		fmt.Println("=================| New Probe |=================")
		fmt.Printf("Transport: %s\nProbe used: %s\nPayload: %s\nRarity: %d\n",
			p.Transport, p.Name, string(p.Payload), p.Rarity)

		fmt.Printf("Ports: ")
		for _, port := range p.Ports {
			fmt.Printf("%d ", port)
		}
		fmt.Println()

		fmt.Printf("SSL Ports: ")
		for _, sslport := range p.SSLPorts {
			fmt.Printf("%d ", sslport)
		}
		fmt.Println()

		fmt.Println("Matches")
		for _, match := range p.Matches {
			fmt.Printf("Type: %s\nService: %s\nPattern: %s\nProduct: %s\nVersion: %s\nInfo: %s\nOS: %s\n",
				match.Type, match.Service, match.Pattern, match.Product, match.Version, match.Info, match.OS)

			fmt.Printf("CPEs: ")
			for _, cpe := range match.CPEs {
				fmt.Printf("%s ", cpe)
			}
			fmt.Println()
		}
	}

	if scanner.Err() != nil {
		log.Fatal(err)
	}
}
