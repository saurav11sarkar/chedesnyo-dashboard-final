"use client";

import { useEffect } from "react";

export default function GoogleTranslatePatch() {
  useEffect(() => {
    const originalRemoveChild = Node.prototype.removeChild;
    // @ts-expect-error - patching prototype
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (child.parentNode !== this) {
        if (child.parentNode) {
          child.parentNode.removeChild(child);
        }
        return child;
      }
      return originalRemoveChild.call(this, child) as T;
    };

    const originalInsertBefore = Node.prototype.insertBefore;
    // @ts-expect-error - patching prototype
    Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        return newNode;
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    };
  }, []);

  return null;
}
