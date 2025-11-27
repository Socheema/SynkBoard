'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/hook/useWorkspace';
import { useWorkspaceStore } from '@/lib/store/workspaceStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function JoinWorkspaceModal({ open, onClose }) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { joinWorkspace } = useWorkspace();
  const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!inviteCode.trim()) {
      setError('Invite code is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const workspace = await joinWorkspace(inviteCode.trim().toUpperCase());

      // Set as current workspace
      setCurrentWorkspace(workspace);

      // Navigate to the workspace
      router.push(`/workspace/${workspace.id}`);

      // Close modal and reset
      setInviteCode('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to join workspace');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Workspace</DialogTitle>
          <DialogDescription>
            Enter the invite code shared by your team
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="e.g., ABC12XYZ"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              disabled={loading}
              autoFocus
              maxLength={8}
              className="uppercase"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Workspace'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
