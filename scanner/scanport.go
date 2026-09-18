package scanner

import (
	"fmt"
	"net"
	"strconv"
	"strings"
	"time"
)

func ScanPort(ip string, port int, timeout time.Duration) ScannedIPInfo {

	conn, err := net.DialTimeout(
		"tcp",
		net.JoinHostPort(ip, strconv.Itoa(port)),
		timeout,
	)

	var scIPInfo ScannedIPInfo

	if err != nil {
		if strings.Contains(err.Error(), "too many open files") {
			fmt.Printf("Too many open files\nRetrying in %ds...\n", timeout)
			time.Sleep(timeout)
			ScanPort(ip, port, timeout)
		} else {
			// fmt.Printf("%d Closed: %v\n", port, err)
		}
		return ScannedIPInfo{}
	} else {
		scPortInfo, err := probeOpenPort(conn, ip, port)
		if err != nil {
			// handle error
		}
		scIPInfo.Ports = append(scIPInfo.Ports, scPortInfo)
	}

	conn.Close()
	return scIPInfo
}
