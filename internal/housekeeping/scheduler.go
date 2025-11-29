package housekeeping

import (
	"context"
	"log/slog"
	"time"

	"github.com/dimiro1/lunar/internal/store"
	"github.com/robfig/cron/v3"
)

const (
	// DefaultRetentionDays is the default retention period when not specified
	DefaultRetentionDays = 7
)

// Scheduler manages periodic cleanup of old executions
type Scheduler struct {
	db   store.DB
	cron *cron.Cron
}

// NewScheduler creates a new housekeeping scheduler
func NewScheduler(db store.DB) *Scheduler {
	return &Scheduler{
		db:   db,
		cron: cron.New(),
	}
}

// Start begins the housekeeping scheduler
// Runs cleanup every hour at the top of the hour
func (s *Scheduler) Start() error {
	// Schedule cleanup to run every hour: "0 * * * *"
	_, err := s.cron.AddFunc("0 * * * *", func() {
		ctx := context.Background()
		if err := s.cleanupOldExecutions(ctx); err != nil {
			slog.Error("Failed to cleanup old executions", "error", err)
		}
	})
	if err != nil {
		return err
	}

	s.cron.Start()
	slog.Info("Housekeeping scheduler started", "schedule", "hourly")
	return nil
}

// Stop stops the housekeeping scheduler
func (s *Scheduler) Stop() {
	ctx := s.cron.Stop()
	<-ctx.Done()
	slog.Info("Housekeeping scheduler stopped")
}

// cleanupOldExecutions removes old executions based on function retention settings
func (s *Scheduler) cleanupOldExecutions(ctx context.Context) error {
	slog.Info("Cleaning up old executions")

	// Get all functions to check their retention settings
	functions, _, err := s.db.ListFunctions(ctx, store.PaginationParams{Limit: 1000, Offset: 0})
	if err != nil {
		return err
	}

	// Calculate cutoff time based on retention period
	// Use the default retention period (7 days) for all functions
	// Individual function retention periods will be used when set
	now := time.Now().Unix()
	defaultCutoffTime := now - (int64(DefaultRetentionDays) * 24 * 60 * 60)

	// Track total deletions
	var totalDeleted int64

	// For each function, determine its retention period and calculate cutoff
	for _, fn := range functions {
		retentionDays := DefaultRetentionDays
		if fn.RetentionDays != nil {
			retentionDays = *fn.RetentionDays
		}

		// Calculate function-specific cutoff time
		cutoffTime := now - (int64(retentionDays) * 24 * 60 * 60)

		slog.Debug("Checking function for cleanup",
			"function_id", fn.ID,
			"function_name", fn.Name,
			"retention_days", retentionDays,
			"cutoff_time", time.Unix(cutoffTime, 0))

		// Note: DeleteOldExecutions deletes all executions older than the cutoff
		// Since we're iterating through functions, we delete globally based on the oldest retention period
		// To optimize, we only need to delete once using the minimum cutoff time
		if cutoffTime < defaultCutoffTime {
			defaultCutoffTime = cutoffTime
		}
	}

	// Delete all executions older than the cutoff time
	deleted, err := s.db.DeleteOldExecutions(ctx, defaultCutoffTime)
	if err != nil {
		return err
	}

	totalDeleted += deleted

	slog.Info("Old executions cleanup completed",
		"total_deleted", totalDeleted,
		"cutoff_time", time.Unix(defaultCutoffTime, 0))

	return nil
}
