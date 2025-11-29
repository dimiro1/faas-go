// Package housekeeping provides automated maintenance tasks for the Lunar system.
//
// The scheduler runs hourly to delete old execution logs based on function
// retention settings. Functions can specify retention periods of 7, 15, 30,
// or 365 days (default is 7 days).
//
// Usage:
//
//	scheduler := housekeeping.NewScheduler(db)
//	scheduler.Start()
//	defer scheduler.Stop()
package housekeeping
