"use client";

import { useEffect, useRef, useId } from "react";
import EditorJS, { ToolConstructable, OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import Code from "@editorjs/code";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const holder = useId();
  const initialValue = useRef(value);
  const changeHandler = useRef(onChange);
  changeHandler.current = onChange;
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    let initial: OutputData = { blocks: [] };
    try { initial = initialValue.current ? JSON.parse(initialValue.current) : { blocks: [] }; } catch { initial = { blocks: [{ type: "paragraph", data: { text: initialValue.current } }] }; }
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder,
        tools: {
          header: {
            class: Header as unknown as ToolConstructable,
            config: {
              placeholder: "Enter a header",
              levels: [1, 2, 3, 4],
              defaultLevel: 1,
            },
          },
          list: {
            class: List as unknown as ToolConstructable,
            inlineToolbar: true,
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
          },
          code: Code,
        },
        data: initial,
        onChange: async () => {
          const data = await editorRef.current?.save();
          if (data) changeHandler.current(JSON.stringify(data));
        },
        placeholder: "Start writing your post...",
      });

      editorRef.current = editor;
    }

    return () => {
      const editor = editorRef.current;
      editorRef.current = null;
      if (editor) void editor.isReady.then(() => editor.destroy()).catch(() => {});
    };
  }, [holder]);

  return <div id={holder} className="prose max-w-none" />;
}
