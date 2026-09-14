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
