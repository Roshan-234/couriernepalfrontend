"use client";

import { useEffect, useRef } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import Image from "@editorjs/image";
import Code from "@editorjs/code";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: "editor",
        tools: {
          header: {
            class: Header,
            config: {
              placeholder: "Enter a header",
              levels: [1, 2, 3, 4],
              defaultLevel: 1
            }
          },
          list: {
            class: List,
            inlineToolbar: true
          },
          quote: {
            class: Quote,
            inlineToolbar: true
          },
          image: {
            class: Image,
            config: {
              endpoints: {
                byFile: "/api/blog/upload-image"
              }
            }
          },
          code: Code
        },
        data: value ? JSON.parse(value) : {},
        onChange: async () => {
          const data = await editorRef.current?.save();
          onChange(JSON.stringify(data));
        },
        placeholder: "Start writing your post..."
      });

      editorRef.current = editor;
    }

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
      }
    };
  }, []);

  return <div id="editor" className="prose max-w-none" />;
}
