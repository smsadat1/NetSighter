package scanner

import "testing"

func TestParser(t *testing.T) {

	var npDb ProbeDB
	ParseNmapProbeDb("../nmapserviceprobelist", &npDb)
	dumpProbe(&npDb)
}
