package scanner

func loadNmapProbeDB(npDb *ProbeDB) {

	// TODO: replace with S3 download
	ParseNmapProbeDb("../nmapserviceprobelist", npDb)
	npDb.buildProbeIndex()
}
