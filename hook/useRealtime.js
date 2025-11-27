import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWidgetStore } from "@/lib/store/widgetStore";

export function useRealtimeWidgets(workspaceID) {
  const { setWidgets, addWidget, updateWidget, deleteWidget } =
    useWidgetStore();

  useEffect(() => {
    if (!workspaceID) return;
    const supabase = createClient();

    // subscribe to widget changes
    const channel = supabase
      .channel(`workspace:${workspaceID}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "widgets",
          filter: `workspace_id=eq.${workspaceID}`,
        },
        (payload) => {
          console.log("widget inserted:", payload.new);
          addWidget(payload.new);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "widgets",
          filter: `workspace_id=eq.${workspaceID}`,
        },
        (payload) => {
          console.log("widget updated:", payload.new);
          updateWidget(payload.new.id, payload.new);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "widgets",
          filter: `workspace_id=eq.${workspaceID}`,
        },
        (payload) => {
          console.log("widget deleted:", payload.old);
          deleteWidget(payload.old.id);
        }
      )
      .subscribe();

    // cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceID, setWidgets, addWidget, updateWidget, deleteWidget]);
}
