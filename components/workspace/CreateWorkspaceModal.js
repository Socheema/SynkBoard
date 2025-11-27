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
import { Loader2, Copy, Check } from 'lucide-react';

export default function CreateWorkspaceModal({ open, onClose }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdWorkspace, setCreatedWorkspace] = useState(null);
  const [copied, setCopied] = useState(false);
  const { createWorkspace } = useWorkspace();
  const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const workspace = await createWorkspace(name.trim());

      // Show success with invite code
      setCreatedWorkspace(workspace);

      // Set as current workspace
      setCurrentWorkspace(workspace);
    } catch (err) {
      setError(err.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  }

  function handleCopyCode() {
    if (createdWorkspace?.invite_code) {
      navigator.clipboard.writeText(createdWorkspace.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleClose() {
    if (createdWorkspace) {
      // Navigate to the new workspace
      router.push(`/workspace/${createdWorkspace.id}`);
    }

    setName('');
    setCreatedWorkspace(null);
    setError('');
    setCopied(false);
    onClose();
  }

  // Success view
  if (createdWorkspace) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Workspace Created! 🎉</DialogTitle>
            <DialogDescription>
              Share this invite code with your team
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Invite Code
              </p>
              <div className="flex items-center gap-2">
                <code className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex-1">
                  {createdWorkspace.invite_code}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyCode}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Anyone with this code can join your workspace as an editor.
            </p>

            <Button onClick={handleClose} className="w-full">
              Start Collaborating →
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Create form
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Create a shared space for your team to collaborate
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="e.g., Marketing Team, Project Alpha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoFocus
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
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Workspace'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
