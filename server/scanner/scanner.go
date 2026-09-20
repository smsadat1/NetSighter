package scanner

func Scanner() {

	// 1. Load Nmap ProbeDB into memory
	loadNmapProbeDB(&NmapProbeDB)

	// 2. Receive a leased IP subrange from scheduler

	// 3. Scan IPs concurrently
	//    bounded to ~1000 goroutines

	// 4. Persist observation bundles to S3
	//    bounded upload concurrency

	// 5. Publish completed observation metadata to SQS
	//    bounded publish concurrency

	// 6. Report lease completion / heartbeat
}
