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

  React.useEffect(() => {
    editor.update(() => {
      const editorState = editor.parseEditorState(initialState);
      editor.setEditorState(editorState);
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
  // console.log('lexicla editor....', task.content);

  // const editorState = task.content.parseEditorState(
  //   JSON.stringify(task.content),
  // );
  // if (!editorState.isEmpty()) {
  //   task.content.setEditorState(editorState);
  // }
  const initialConfig = {
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
        <InitialStatePlugin initialState={task.content} />
      </LexicalComposer>
    </div>
  );
};

// Kanban Board Component

export const KanbanBoard = ({columns, onUpdateBoard}) => {
  const [draggedItem, setDraggedItem] = useState(null);

  const onDragStart = (e: never, item: React.SetStateAction<null>) => {
    setDraggedItem(item);
  };

  const onDragOver = (e: {preventDefault: () => void}) => {
    e.preventDefault();
  };

  const onDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetColumn: {id: unknown; title?: string; tasks?: unknown},
  ) => {
    e.preventDefault();
    if (draggedItem) {
      const updatedColumns = columns.map(
        (column: {id: unknown; tasks: unknown[]}) => {
          if (column.id === draggedItem.columnId) {
            return {
              ...column,
              tasks: column.tasks.filter(
                (task: {id: unknown}) => task.id !== draggedItem.id,
              ),
            };
          }
          if (column.id === targetColumn.id) {
            return {
              ...column,
              tasks: [
                ...column.tasks,
                {...draggedItem, columnId: targetColumn.id},
              ],
            };
          }
          return column;
        },
      );
      onUpdateBoard(updatedColumns);
      setDraggedItem(null);
    }
  };

  const addTask = (columnId: number) => {
    const newTask = {
      columnId,
      content:
        '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"New Task","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
      id: Date.now(),
    };
    const updatedColumns = columns.map((column: {id: number; tasks: unknown}) =>
      column.id === columnId
        ? {...column, tasks: [...column.tasks, newTask]}
        : column,
    );
    onUpdateBoard(updatedColumns);
  };

  const deleteTask = (taskId: unknown, columnId: number) => {
    const updatedColumns = columns.map((column: {id: number; tasks: any[]}) =>
      column.id === columnId
        ? {...column, tasks: column.tasks.filter((task) => task.id !== taskId)}
        : column,
    );
    onUpdateBoard(updatedColumns);
  };

  const updateTask = (taskId: any, columnId: any, newContent: any) => {
    console.log('update task!Q!!!!!!!!!!');
    const updatedColumns = columns.map((column: {id: unknown; tasks: any[]}) =>
      column.id === columnId
        ? {
            ...column,
            tasks: column.tasks.map((task: {id: any}) =>
              task.id === taskId ? {...task, content: newContent} : task,
            ),
          }
        : column,
    );
    onUpdateBoard(updatedColumns);
  };

  const getColorOnTaskType = (title: string) => {
    switch (title) {
      case 'Not started':
        return {bgColor: '#E3E2E0', dot: '#91918E'};
      case 'In progress':
        return {bgColor: '#D2E4EF', dot: '#5B96BC'};
      case 'Done':
        return {bgColor: '#DAECDA', dot: '#6C9B7D'};
    }
  };
  return (
    <div className="KnabanNonde_container">
      {columns?.map((column: {id: number; title: string; tasks?: unknown}) => (
        <div
          key={column.id}
          onDragOver={onDragOver}
          style={{flex: 1}}
          onDrop={(e) => onDrop(e, column)}>
          <div className="KnabanNonde_taskColumn">
            <div
              style={{background: getColorOnTaskType(column.title)?.bgColor}}
              className="KnabanNonde_columnTitleContainer">
              <div
                style={{
                  background: getColorOnTaskType(column.title)?.dot,
                  borderRadius: 12,
                  height: 10,
                  marginLeft: 8,
                  width: 10,
                }}
              />
              <div className="KnabanNonde_columnTitle">{column.title}</div>
            </div>
            {column.tasks?.map((task: {id: React.Key | null | undefined}) => (
              <TaskCard
                key={task.id}
                onUpdate={updateTask}
                task={task}
                onDragStart={onDragStart}
                // onOpenModal={openModal}
                onDelete={(taskId: unknown) => deleteTask(taskId, column.id)}
              />
            ))}
            <div
              onClick={() => addTask(column.id)}
              className="KnabanNonde_columnAddBtn">
              + Add new
            </div>
          </div>
        </div>
      ))}
      {/* <Modal isOpen={modalOpen} onClose={closeModal}>
        {selectedTask && (
          <TaskEditor task={selectedTask} onUpdate={updateTask} />
        )}
      </Modal> */}
    </div>
  );
};

// Lexical Plugin Component
const KanbanPlugin = ({savedColumn, nodeKey}) => {
  const [editor] = useLexicalComposerContext();
  const [showKanban, setShowKanban] = useState(false);

  const withKanbanNode = (
    cb: (node: KanbanNode) => void,
    onUpdate?: () => void,
  ): void => {
    editor.update(
      () => {
        const node = $getNodeByKey(nodeKey);
        if ($isKanbanNode(node)) {
          cb(node);
        }
      },
      {onUpdate},
    );
  };

  //   const [modalOpen, setModalOpen] = useState(false);
  const [columns, setColumns] = useState(
    savedColumn.length === 0
      ? [
          {
            id: 'Not started',

            tasks: [],
            title: 'Not started',
          },
          {id: 'In progress', tasks: [], title: 'In progress'},
          {id: 'done', tasks: [], title: 'Done'},
        ]
      : savedColumn,
  );

  const updateBoard = (newColumns: unknown[]) => {
    setColumns(newColumns);
    // onColumnUpdate(newColumns);
    withKanbanNode((node) => {
      node.updateColumn(newColumns);
    });
    // Here you would also update the Lexical editor state
  };

  return (
    <>
      <KanbanBoard columns={columns} onUpdateBoard={updateBoard} />
    </>
  );
};

export default KanbanPlugin;
