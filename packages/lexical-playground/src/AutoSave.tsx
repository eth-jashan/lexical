/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {SerializedEditorState, SerializedLexicalNode} from 'lexical';
import {useEffect} from 'react';

const STORAGE_KEY = 'lexical_editor_state';

const saveEditorStateToStorage = (
  editorState: SerializedEditorState<SerializedLexicalNode>,
) => {
  const serializedState = JSON.stringify(editorState);
  localStorage.setItem(STORAGE_KEY, serializedState);
};

const loadEditorStateFromStorage = () => {
  const serializedState = localStorage.getItem(STORAGE_KEY);
  return serializedState ? JSON.parse(serializedState) : null;
};

export const useAutoSave = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const savedEditorState = loadEditorStateFromStorage();
    if (savedEditorState) {
      editor.update(() => {
        const editorState = editor.parseEditorState(savedEditorState);
        editor.setEditorState(editorState);
      });
    }
  }, [editor]);

  useEffect(() => {
    const saveState = () => {
      editor.update(() => {
        const editorState = editor.getEditorState();
        const serializedState = editorState.toJSON();
        saveEditorStateToStorage(serializedState);
      });
    };

    return editor.registerUpdateListener(() => {
      saveState();
    });
  }, [editor]);
};
