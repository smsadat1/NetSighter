package main

import (
	"context"
	"fmt"
	"sync"
	"time"

	"golang.org/x/sync/semaphore"

	"scanner"
)

type PortScanner struct {
	ip   string
	lock *semaphore.Weighted
}

func (ps *PortScanner) StartPortScant(f int, l int, timeout time.Duration) {
	wg := sync.WaitGroup{}
	defer wg.Wait()

	for port := f; port < l; port++ {
		wg.Add(1)
		ps.lock.Acquire(context.TODO(), 1)
		go func(port int) {
			defer ps.lock.Release(1)
			defer wg.Done()
			scanner.ScanPort(ps.ip, port, timeout)
		}(port)
	}
}

func main() {

	/*
		1. Load probeDB in memory (download nmapserviceprobelist from S3)
		2. Wait for job (IP range)
		3. Start scanning and probing in parallel (upto 1000 Go routines)
		4. Send raw result to S3 and metadata to SQS as enrichment job (for CVE+CWE+CVSS worker)
	*/

	fileLimit, err := scanner.GetOpenFileLimit()
	if err != nil {
		fmt.Errorf("NetSighter: %v", err)
	}

	ps := &PortScanner{
		ip:   "127.0.0.1",
		lock: semaphore.NewWeighted(fileLimit),
	}

	ps.StartPortScant(1, 65535, 2*time.Second)
}
