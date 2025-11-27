import { useState, useEffect } from "react";
import { useWorkspaceStore } from "@/lib/store/workspaceStore";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";

export function useWorkspace() {
  const { workspaces, setWorkspaces, setCurrentWorkspace } =
    useWorkspaceStore();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    loadWorkspaces();
  }, [user]);

  async function loadWorkspaces() {
    try {
      setLoading(true);

      // Get workspaces where user is a member
      const { data, error } = await supabase
        .from("workspace_members")
        .select(`workspace_id, role, workspaces (*)`)
        .eq("user_id", user.id);

      if (error) throw error;

      const workspacesList = data.map((item) => ({
        ...item.workspaces,
        role: item.role,
      }));

      setWorkspaces(workspacesList);

      // Set the first workspace as current if none selected
      if (
        workspacesList.length > 0 &&
        !useWorkspaceStore.getState().currentWorkspace
      ) {
        setCurrentWorkspace(workspacesList[0]);
      }
    } catch (error) {
      console.log("Error loading workspaces:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createWorkspace(name) {
    try {
      // Generate unique invite code
      const inviteCode = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

      // Create workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert({
          name,
          owner_id: user.id,
          invite_code: inviteCode,
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      await loadWorkspaces();
      return workspace;
    } catch (error) {
      console.log("Error creating workspace:", error);
      throw error;
    }
  }

  async function joinWorkspace(inviteCode) {
    try {
      // Find workspace by invite code
      const { data: workspace, error: findError } = await supabase
        .from("workspaces")
        .select("*")
        .eq("invite_code", inviteCode)
        .single();

      if (findError) throw new Error("Invalid invite code");

      // Add user as editor
      const { error: joinError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: "editor",
        });

      if (joinError) {
        if (joinError.code === "23505") {
          throw new Error("You are already a member of this workspace");
        }
        throw joinError;
      }

      await loadWorkspaces();
      return workspace;
    } catch (error) {
      console.log("Error joining workspace:", error);
      throw error;
    }
  }

  return {
    workspaces,
    loading,
    error,
    createWorkspace,
    joinWorkspace,
    refreshWorkspaces: loadWorkspaces,
  };
}
