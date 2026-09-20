package scanner

import unix "golang.org/x/sys/unix"

func GetOpenFileLimit() (int64, error) {

	var rlim unix.Rlimit
	if err := unix.Getrlimit(unix.RLIMIT_NOFILE, &rlim); err != nil {
		return 0, err
	}

	return int64(rlim.Cur), nil
}
