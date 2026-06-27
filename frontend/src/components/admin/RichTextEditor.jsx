import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import {
    MdFormatBold, MdFormatItalic, MdCode, MdFormatListBulleted, MdFormatListNumbered,
    MdFormatQuote, MdTitle, MdHorizontalRule,
} from 'react-icons/md';

function ToolbarBtn({ active, onClick, title, children }) {
    return (
        <button
            type="button"
            title={title}
            onMouseDown={(e) => { e.preventDefault(); onClick(); }}
            className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition ${
                active ? 'bg-clay text-white' : 'text-ink-soft hover:bg-ink/[0.06] hover:text-ink'
            }`}
        >
            {children}
        </button>
    );
}

/**
 * TipTap rich-text editor. Emits HTML via onChange; render that HTML elsewhere
 * inside a `.prose-cs` container for matching styles.
 */
export default function RichTextEditor({ value, onChange, placeholder = 'Write the problem description…' }) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value || '',
        editorProps: {
            attributes: {
                class: 'prose-cs min-h-[220px] max-h-[420px] overflow-y-auto px-4 py-3 outline-none',
            },
        },
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    // Sync external value changes (e.g. when editing a different problem) into the editor.
    useEffect(() => {
        if (editor && value !== undefined && value !== editor.getHTML()) {
            editor.commands.setContent(value || '', false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, editor]);

    if (!editor) return null;

    return (
        <div className="overflow-hidden rounded-xl border border-line bg-paper">
            <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-cream px-2 py-1.5">
                <ToolbarBtn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><MdFormatBold className="h-4 w-4" /></ToolbarBtn>
                <ToolbarBtn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><MdFormatItalic className="h-4 w-4" /></ToolbarBtn>
                <ToolbarBtn title="Heading" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><MdTitle className="h-4 w-4" /></ToolbarBtn>
                <span className="mx-1 h-5 w-px bg-line" />
                <ToolbarBtn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><MdFormatListBulleted className="h-4 w-4" /></ToolbarBtn>
                <ToolbarBtn title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><MdFormatListNumbered className="h-4 w-4" /></ToolbarBtn>
                <span className="mx-1 h-5 w-px bg-line" />
                <ToolbarBtn title="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}><MdCode className="h-4 w-4" /></ToolbarBtn>
                <ToolbarBtn title="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{'{}'}</ToolbarBtn>
                <ToolbarBtn title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><MdFormatQuote className="h-4 w-4" /></ToolbarBtn>
                <ToolbarBtn title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><MdHorizontalRule className="h-4 w-4" /></ToolbarBtn>
            </div>
            <EditorContent editor={editor} placeholder={placeholder} />
        </div>
    );
}
