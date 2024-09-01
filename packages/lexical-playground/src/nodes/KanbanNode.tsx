/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {
  DecoratorNode,
  LexicalEditor,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';

import KanbanPlugin, {KanbanBoard} from './KanbanComponent';

export type SerializedKanbanNode = Spread<
  {
    columns: unknown[];
  },
  SerializedLexicalNode
>;
export class KanbanNode extends DecoratorNode<JSX.Element> {
  _columns: unknown[];

  static getType() {
    return 'kanban';
  }

  static clone(node: KanbanNode) {
    return new KanbanNode(node._columns, node.__key);
  }
  constructor(columns: unknown[], key?: NodeKey) {
    super(key);
    this._columns = columns;
  }
  createDOM() {
    const div = document.createElement('div');
    div.className = 'kanban-board-container';
    return div;
  }

  updateDOM() {
    return false;
  }
  exportJSON(): SerializedKanbanNode {
    return {
      columns: this._columns,
      type: 'kanban',
      version: 1,
    };
  }
  static importJSON(serializedNode: SerializedKanbanNode): KanbanNode {
    const node = $createKanbanNode(serializedNode.columns);
    return node;
  }
  updateColumn(column: unknown[]): void {
    const self = this.getWritable();
    self._columns = column;
  }
  decorate() {
    return <KanbanPlugin nodeKey={this.__key} savedColumn={this._columns} />;
  }
}

export function $createKanbanNode(columns: unknown[]) {
  return new KanbanNode(columns);
}

export function $isKanbanNode(node: unknown) {
  return node instanceof KanbanNode;
}
