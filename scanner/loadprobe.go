package scanner

func LoadNmapProbeDB() {

	var npDb ProbeDB
	// TODO: replace with S3 download
	ParseNmapProbeDb("../nmapserviceprobelist", &npDb)
	npDb.buildProbeIndex()
}
