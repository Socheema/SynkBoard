'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/workspaceStore';
import { useWorkspace } from '@/hook/useWorkspace';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Plus, Copy, Check } from 'lucide-react';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import JoinWorkspaceModal from './JoinWorkspaceModal';

export default function WorkspaceSwitcher() {
  const router = useRouter();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  const { workspaces, loading } = useWorkspace();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  function handleWorkspaceChange(workspace) {
    setCurrentWorkspace(workspace);
    // Navigate to the new workspace
    router.push(`/workspace/${workspace.id}`);
  }

  function handleCopyInviteCode(e, inviteCode) {
    e.stopPropagation(); // Prevent dropdown from closing
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(inviteCode);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  if (loading) {
    return (
      <div className="h-9 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 max-w-xs">
            <span className="font-medium truncate">
              {currentWorkspace ? (
                <>
                  {currentWorkspace.role === 'owner' && (
                    <span className="text-blue-600 dark:text-blue-400 mr-1">
                      [{currentWorkspace.invite_code}]
                    </span>
                  )}
                  {currentWorkspace.name}
                </>
              ) : (
                'Select Workspace'
              )}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel>Your Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleWorkspaceChange(workspace)}
              className="cursor-pointer flex items-center justify-between py-3"
            >
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-medium truncate">{workspace.name}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 capitalize">
                    {workspace.role}
                  </span>
                  {workspace.role === 'owner' && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                      {workspace.invite_code}
                    </span>
                  )}
                </div>
              </div>

              {workspace.role === 'owner' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => handleCopyInviteCode(e, workspace.invite_code)}
                  className="h-7 w-7 p-0 flex-shrink-0"
                >
                  {copiedCode === workspace.invite_code ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowCreateModal(true)}
            className="cursor-pointer text-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowJoinModal(true)}
            className="cursor-pointer text-green-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Join Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateWorkspaceModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <JoinWorkspaceModal
        open={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </>
  );
}
