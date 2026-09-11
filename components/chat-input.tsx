/**
 * Copyright (c) 2026 hangtiancheng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use client";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Paperclip, Send } from "lucide-react";
import type { Mode } from "@/hooks/use-chat";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Spinner } from "@/components/ui/spinner";

interface ChatInputProps {
  isStreaming: boolean;
  mode: Mode;
  onModeChange: (m: Mode) => void;
  onSend: (text: string) => void;
  onUpload: (file: File) => void;
}

export default function ChatInput({
  isStreaming,
  mode,
  onModeChange,
  onSend,
  onUpload,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // P3-9 fix: auto-resize textarea to fit content (up to ~10 lines). Kept on
  // purpose — field-sizing-content is not shipped in every browser yet.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const send = () => {
    const t = text.trim();
    if (!t || isStreaming) return;
    onSend(t);
    setText("");
  };

  return (
    <InputGroup className="bg-card rounded-3xl p-2 shadow-sm">
      <InputGroupTextarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        disabled={isStreaming}
        placeholder="Ask the Swifty Agent OnCall assistant"
        className="max-h-40 min-h-0 px-2"
        rows={1}
      />
      <InputGroupAddon align="block-end" className="justify-between pt-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <InputGroupButton
                size="icon-sm"
                variant="ghost"
                aria-label="Tools"
              >
                <MoreHorizontal />
              </InputGroupButton>
            }
          />
          <DropdownMenuContent side="top" align="start" className="w-44">
            <DropdownMenuItem onClick={() => fileRef.current?.click()}>
              <Paperclip />
              Upload file
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-2">
          <ToggleGroup
            variant="outline"
            size="sm"
            spacing={0}
            value={[mode]}
            onValueChange={(v) => {
              const next = v.at(-1);
              if (next === "quick" || next === "stream") onModeChange(next);
            }}
            aria-label="Chat mode"
          >
            <ToggleGroupItem value="quick">Quick</ToggleGroupItem>
            <ToggleGroupItem value="stream">Stream</ToggleGroupItem>
          </ToggleGroup>
          <InputGroupButton
            size="icon-sm"
            variant="default"
            onClick={send}
            disabled={isStreaming || !text.trim()}
            aria-label="Send"
          >
            {isStreaming ? <Spinner /> : <Send />}
          </InputGroupButton>
        </div>
      </InputGroupAddon>
      <input
        ref={fileRef}
        type="file"
        accept=".txt,.md,.markdown"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = "";
        }}
      />
    </InputGroup>
  );
}
