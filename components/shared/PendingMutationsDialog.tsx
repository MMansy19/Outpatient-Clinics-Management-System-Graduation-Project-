'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  getPendingMutations,
  retryMutation,
  deleteMutation,
  getMutationLabel,
  processSyncQueue,
  addSyncListener,
} from '@/lib/offline';
import type { QueuedMutation } from '@/lib/offline';

interface PendingMutationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOnline: boolean;
}

function formatTime(ts: number) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return '';
  }
}

export function PendingMutationsDialog({
  open,
  onOpenChange,
  isOnline,
}: PendingMutationsDialogProps) {
  const [items, setItems] = useState<QueuedMutation[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const rows = await getPendingMutations();
      setItems(rows);
    } catch (err) {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void refresh();
    const unsub = addSyncListener(() => {
      void refresh();
    });
    const intervalId = setInterval(() => {
      void refresh();
    }, 3000);
    return () => {
      unsub();
      clearInterval(intervalId);
    };
  }, [open, refresh]);

  const handleSyncNow = async () => {
    setLoading(true);
    try {
      await processSyncQueue();
      await refresh();
    } catch (err) {
      toast.error('Sync failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id?: number) => {
    if (id === undefined) return;
    await retryMutation(id);
    await refresh();
    toast.info('Marked for retry');
  };

  const handleDelete = async (id?: number) => {
    if (id === undefined) return;
    await deleteMutation(id);
    await refresh();
    toast.success('Removed from queue');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Pending changes</DialogTitle>
          <DialogDescription>
            Actions you performed while offline. They will be sent to the server
            automatically once you are back online.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-2 px-2">
          {items.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No pending changes.
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((m) => (
                <li
                  key={m.clientTempId}
                  className="rounded-md border p-3 text-sm flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{getMutationLabel(m.type)}</span>
                      {m.status === 'failed' ? (
                        <Badge variant="destructive">Failed</Badge>
                      ) : m.status === 'syncing' ? (
                        <Badge variant="secondary">Syncing</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                      {m.retryCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {m.retryCount} retr{m.retryCount === 1 ? 'y' : 'ies'}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground truncate">
                      {m.method} {m.endpoint}
                    </div>
                    {m.patientName && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Patient: {m.patientName}
                      </div>
                    )}
                    <div className="mt-1 text-xs text-muted-foreground">
                      Queued: {formatTime(m.createdAt)}
                    </div>
                    {m.errorMessage && (
                      <div className="mt-1 text-xs text-destructive break-all">
                        {m.errorMessage}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {m.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetry(m.autoId)}
                      >
                        Retry
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(m.autoId)}
                    >
                      Discard
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={handleSyncNow}
            disabled={!isOnline || loading || items.length === 0}
          >
            {loading ? 'Syncing…' : isOnline ? 'Sync now' : 'Offline — auto sync on reconnect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
