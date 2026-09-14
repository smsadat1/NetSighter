package scanner

import (
	"fmt"
	"io"
	"net"
	"strconv"
	"strings"
	"time"
)

func ScanPort(ip string, port int, timeout time.Duration) {

	conn, err := net.DialTimeout(
		"tcp",
		net.JoinHostPort(ip, strconv.Itoa(port)),
		timeout,
	)

	if err != nil {
		if strings.Contains(err.Error(), "too many open files") {
			fmt.Printf("Too many open files\nRetrying in %ds...\n", timeout)
			time.Sleep(timeout)
			ScanPort(ip, port, timeout)
		} else {
			// fmt.Printf("%d Closed: %v\n", port, err)
		}
		return
	}

	conn.SetReadDeadline(time.Now().Add(timeout))
	fmt.Printf("Port: %d\nState: Open\n", port)

	buffer := make([]byte, 2048)
	tmp := make([]byte, 256)

	for {
		n, err := conn.Read(buffer)
		if err != nil {
			if err != io.EOF {
				fmt.Println("read error:", err)
			}
			break
		}
		buffer = append(buffer, tmp[:n]...)

	}
	fmt.Printf("Total size: %d\n", len(buffer))
	fmt.Printf("Description: %s\n", string(buffer))

	conn.Close()
}
