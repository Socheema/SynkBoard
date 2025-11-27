'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { format } from 'date-fns';

export default function ChatWidget({ widget }) {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const supabaseRef = useRef(null);

  useEffect(() => {
    supabaseRef.current = createClient();
    loadMessages();

    const cleanup = subscribeToMessages();

    return cleanup;
  }, [widget.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadMessages() {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('widget_id', widget.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      console.log('💬 Loaded messages:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToMessages() {
    const supabase = createClient();

    console.log('🔌 Setting up chat realtime subscription for widget:', widget.id);

    const channel = supabase
      .channel(`chat:${widget.id}`, {
        config: {
          broadcast: { self: false }, // Don't receive own broadcasts (we'll add optimistically)
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `widget_id=eq.${widget.id}`,
        },
        (payload) => {
          console.log('✅ Chat message received:', payload.new);

          // Only add if it's not from the current user (avoid duplicates)
          if (payload.new.user_id !== user.id) {
            setMessages((prev) => {
              // Check if message already exists
              const exists = prev.some(m => m.id === payload.new.id);
              if (exists) return prev;
              return [...prev, payload.new];
            });
          } else {
            // Update the temporary message with the real one from DB
            setMessages((prev) => {
              return prev.map(m =>
                m.tempId && m.message === payload.new.message
                  ? payload.new
                  : m
              );
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Chat realtime subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up chat subscription');
      supabase.removeChannel(channel);
    };
  }

  async function sendMessage(e) {
    e.preventDefault();

    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    const userName = user.firstName || user.emailAddresses[0].emailAddress.split('@')[0];

    // Optimistic update - add message immediately to UI
    const tempMessage = {
      tempId: Date.now().toString(),
      widget_id: widget.id,
      user_id: user.id,
      user_name: userName,
      message: messageText,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          widget_id: widget.id,
          user_id: user.id,
          user_name: userName,
          message: messageText,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Message sent successfully:', data);

      // Replace temp message with real one
      setMessages((prev) =>
        prev.map(m => m.tempId === tempMessage.tempId ? data : m)
      );
    } catch (error) {
      console.error('❌ Error sending message:', error);

      // Remove optimistic message on error
      setMessages((prev) => prev.filter(m => m.tempId !== tempMessage.tempId));

      // Restore message to input
      setNewMessage(messageText);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.user_id === user.id;
            const messageId = msg.id || msg.tempId;

            return (
              <div
                key={messageId}
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback>
                    {msg.user_name?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-sm font-medium ${isOwn ? 'order-2' : ''}`}>
                      {isOwn ? 'You' : msg.user_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(msg.created_at), 'HH:mm')}
                    </span>
                    {msg.tempId && (
                      <span className="text-xs text-gray-400 italic">Sending...</span>
                    )}
                  </div>
                  <div
                    className={`inline-block px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    } ${msg.tempId ? 'opacity-70' : ''}`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
