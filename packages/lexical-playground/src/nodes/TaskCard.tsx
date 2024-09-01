/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import './KanbanComponent.css';

import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {HeadingNode} from '@lexical/rich-text';
import {$getNodeByKey, $getRoot, EditorState, LexicalEditor} from 'lexical';
import React, {useEffect, useState} from 'react';

import {$createKanbanNode, $isKanbanNode, KanbanNode} from './KanbanNode.tsx';

const InitialStatePlugin = ({initialState}: {initialState: string}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Only update if the initialState has changed
    editor.update(() => {
      const currentEditorState = editor.getEditorState();
      const parsedInitialState = editor.parseEditorState(initialState);

      // Check if the new state is different from the current state
      if (currentEditorState !== parsedInitialState) {
        editor.setEditorState(parsedInitialState);
      }
    });
  }, [editor, initialState]);

  return null;
};

interface TaskCardProps {
  task: {
    id: string;
    columnId: string;
    content: string; // Change this to string
  };
  onDragStart: (e: React.DragEvent, task: any) => void;
  onUpdate: (taskId: string, columnId: string, content: string) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onDragStart,
  onUpdate,
  onDelete,
}) => {
  const initialConfig = {
    editorState: task.content,
    namespace: `TaskCard-${task.id}`,
    onError: (error: Error) => console.error(error),
  };

  const updateContent = (editorState: EditorState) => {
    onUpdate(task.id, task.columnId, JSON.stringify(editorState));
  };
  return (
    <div
      draggable={true}
      onDragStart={(e) => onDragStart(e, task)}
      className="KnabanNonde_taskCard">
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="KnabanNonde_taskCardContentEdit" />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <OnChangePlugin onChange={updateContent} />
        {/* <InitialStatePlugin initialState={task.content} /> */}
      </LexicalComposer>
    </div>
  );
};
export default React.memo(TaskCard);
