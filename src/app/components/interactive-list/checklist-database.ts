import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

/**
 * Node for to-do item
 */
export class TodoItemNode {
    children: TodoItemNode[] = [];
    name: string = '';
    isFile: boolean = false;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
    name: string = '';
    level: number = 0;
    expandable: boolean = false;
    isFile: boolean = false;
}

/**
* The Json object for to-do list data.
*/
const dirTree = {
    'console.js': {
        type: 'file',
        state: null,
    },
    Groceries: {
        children: {
            'console.js': {
                type: 'file',
                state: null,
            },
            'Organiceggs.ts': {
                type: 'file',
                state: null,
            },
            'Protein Powder.jsx': {
                type: 'file',
                state: null,
            },
            'geg': {
                type: 'directory',
                state: null,
            },
            'Fruits': {
                children: {
                    Apple: {
                        type: 'file',
                        state: null,
                    },
                    Berries: {
                        children: {
                            'Blueberry': {
                                type: 'file',
                                state: null,
                            },
                            'Raspberry': {
                                type: 'file',
                                state: null,
                            },
                        },
                        type: 'directory',
                        state: null
                    },
                    Orange: {
                        type: 'file',
                        state: null,
                    },
                },
                type: 'directory',
                state: null,
            },
            Reminders: {
                children: {
                    'Cook dinner': {
                        type: 'file',
                        state: null,
                    },
                    'Read the Material Design spec': {
                        type: 'file',
                        state: null,
                    },
                    'Upgrade Application to Angular': {
                        type: 'file',
                        state: null,
                    }
                },
                type: 'directory',
                state: null
            }
        },
        type: 'directory',
        state: null
    }
};

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {
    dataChange = new BehaviorSubject<TodoItemNode[]>([]);

    get data(): TodoItemNode[] { return this.dataChange.value; }

    constructor() {
        this.initialize();
    }

    initialize() {
        // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
        //     file node as children.
        const data = this.buildFileTree(dirTree, 0);

        // Notify the change.
        this.dataChange.next(data);
    }

    /**
     * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
     * The return value is the list of `TodoItemNode`.
     */
    buildFileTree(obj: any, level: number): TodoItemNode[] {
        return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
            const value = obj[key];
            const node = new TodoItemNode();
            node.name = key;
            node.isFile = obj[key].type === 'file' || false;

            if (typeof value === 'object' && value.children) {
                node.children = this.buildFileTree(value.children, level + 1);
            }

            return accumulator.concat(node);
        }, []);
    }

    /** Add an item to to-do list */
    insertItem(parent: TodoItemNode, name: string): TodoItemNode | undefined {
        const isMoving = confirm(`Do you want to move ${name} into ${parent.name}?`);
        console.log(isMoving);
        

        if (!isMoving) {
            return;
        }

        const isExistingName = parent.children.find(child => child.name === name);
        let isReplace;

        console.log(isExistingName);
        

        if (isExistingName) {
            isReplace = confirm(`A file or folder with the name ${name} already exists in the destination folder. Do you want to replace it?`)
        }

        if (!isReplace) {
            return;
        }
        const childIndexToDelete = parent.children.findIndex(child => child.name === name);

        delete parent.children[childIndexToDelete]

        if (!parent.children) {
            parent.children = [];
        }
        const newItem = { name } as TodoItemNode;
        parent.children.push(newItem);
        this.dataChange.next(this.data);
        return newItem;
    }

    insertItemAbove(node: TodoItemNode, name: string): TodoItemNode {
        const parentNode = this.getParentFromNodes(node);
        const newItem = { name } as TodoItemNode;
        if (parentNode != null) {
            parentNode.children.splice(parentNode.children.indexOf(node), 0, newItem);
        } else {
            this.data.splice(this.data.indexOf(node), 0, newItem);
        }
        this.dataChange.next(this.data);
        return newItem;
    }

    insertItemBelow(node: TodoItemNode, name: string): TodoItemNode {
        const parentNode = this.getParentFromNodes(node);
        const newItem = { name } as TodoItemNode;
        if (parentNode != null) {
            parentNode.children.splice(parentNode.children.indexOf(node) + 1, 0, newItem);
        } else {
            this.data.splice(this.data.indexOf(node) + 1, 0, newItem);
        }
        this.dataChange.next(this.data);
        return newItem;
    }

    getParentFromNodes(node: TodoItemNode): TodoItemNode | null {
        for (let i = 0; i < this.data.length; ++i) {
            const currentRoot = this.data[i];
            const parent = this.getParent(currentRoot, node);
            if (parent != null) {
                return parent;
            }
        }
        return null;
    }

    getParent(currentRoot: TodoItemNode, node: TodoItemNode): TodoItemNode | null {
        if (currentRoot.children && currentRoot.children.length > 0) {
            for (let i = 0; i < currentRoot.children.length; ++i) {
                const child = currentRoot.children[i];
                if (child === node) {
                    return currentRoot;
                } else if (child.children && child.children.length > 0) {
                    const parent = this.getParent(child, node);
                    if (parent != null) {
                        return parent;
                    }
                }
            }
        }
        return null;
    }

    updateItem(node: TodoItemNode, name: string) {
        node.name = name;
        this.dataChange.next(this.data);
    }

    deleteItem(node: TodoItemNode) {
        this.deleteNode(this.data, node);
        this.dataChange.next(this.data);
    }

    copyPasteItem(from: TodoItemNode, to: TodoItemNode): TodoItemNode | undefined {
        const newItem = this.insertItem(to, from.name);
        if (!newItem) {
            return;
        }
        if (from.children) {
            from.children.forEach(child => {
                this.copyPasteItem(child, newItem);
            });
        }
        return newItem;
    }

    copyPasteItemAbove(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
        const newItem = this.insertItemAbove(to, from.name);
        if (from.children) {
            from.children.forEach(child => {
                this.copyPasteItem(child, newItem);
            });
        }
        return newItem;
    }

    copyPasteItemBelow(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
        const newItem = this.insertItemBelow(to, from.name);
        if (from.children) {
            from.children.forEach(child => {
                this.copyPasteItem(child, newItem);
            });
        }
        return newItem;
    }

    deleteNode(nodes: TodoItemNode[], nodeToDelete: TodoItemNode) {
        const index = nodes.indexOf(nodeToDelete, 0);
        if (index > -1) {
            nodes.splice(index, 1);
        } else {
            nodes.forEach(node => {
                if (node.children && node.children.length > 0) {
                    this.deleteNode(node.children, nodeToDelete);
                }
            });
        }
    }
}