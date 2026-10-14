type TranslationReplacement = { parent: Node; wrapper: HTMLElement };
type Installation = { users: number; dispose: () => void };

const installations = new WeakMap<Document, Installation>();

/** Keep React's text-node references usable after Google's FONT replacement. */
export function installGoogleTranslateDomPatch(root: Node): () => void {
  const document = root.ownerDocument ?? (root as Document);
  const view = document.defaultView;
  if (!view) return () => undefined;

  const installed = installations.get(document);
  if (installed) {
    installed.users += 1;
    return releaseOnce();
  }

  const nodePrototype = view.Node.prototype;
  const characterDataPrototype = view.CharacterData.prototype;
  const originalRemoveChild = nodePrototype.removeChild;
  const originalInsertBefore = nodePrototype.insertBefore;
  const originalAppendChild = nodePrototype.appendChild;
  const originalReplaceChild = nodePrototype.replaceChild;
  const replacements = new WeakMap<Node, TranslationReplacement>();
  const sources = new WeakMap<Node, Node>();
  const candidates = new Map<Node, TranslationReplacement>();

  const isText = (node: Node | null): node is Text => node?.nodeType === 3;
  const isGoogleWrapper = (node: Node): node is HTMLElement =>
    node instanceof view.HTMLElement &&
    node.tagName === "FONT" &&
    node.style.verticalAlign === "inherit";
  const belongsToReplacement = (source: Node, wrapper: HTMLElement) =>
    source.parentNode === null || wrapper.contains(source);

  const remember = (source: Node, parent: Node, wrapper: HTMLElement) => {
    replacements.set(source, { parent, wrapper });
    sources.set(wrapper, source);
  };

  const processMutations = (records: MutationRecord[]) => {
    for (const record of records) {
      if (record.type !== "childList") continue;
      const wrappers = Array.from(record.addedNodes).filter(isGoogleWrapper);

      // replaceChild produces one record with both the old and new node.
      if (record.removedNodes.length === 1 && wrappers.length === 1) {
        const removed = record.removedNodes[0];
        const source = isText(removed) ? removed : sources.get(removed);
        if (source && belongsToReplacement(source, wrappers[0])) {
          remember(source, record.target, wrappers[0]);
        }
      }

      // Google's usual sequence inserts a FONT next to a text node, then
      // removes that exact text node. Keep the relationship across takeRecords.
      for (const wrapper of wrappers) {
        for (const sibling of [record.nextSibling, record.previousSibling]) {
          if (isText(sibling)) {
            candidates.set(sibling, { parent: record.target, wrapper });
          }
        }
      }
      for (const removed of Array.from(record.removedNodes)) {
        if (!isText(removed)) continue;
        const candidate = candidates.get(removed);
        if (
          candidate?.parent === record.target &&
          candidate.wrapper.parentNode === record.target &&
          belongsToReplacement(removed, candidate.wrapper) &&
          (record.previousSibling === candidate.wrapper ||
            record.nextSibling === candidate.wrapper)
        ) {
          remember(removed, record.target, candidate.wrapper);
        }
        candidates.delete(removed);
      }
    }
  };

  const observer = new view.MutationObserver((records) => {
    processMutations(records);
    candidates.clear();
  });
  observer.observe(root, { childList: true, subtree: true });

  const drain = () => processMutations(observer.takeRecords());
  const replacementFor = (node: Node): TranslationReplacement | undefined => {
    const replacement = replacements.get(node);
    if (!replacement) return undefined;
    if (
      node.parentNode === replacement.parent ||
      !belongsToReplacement(node, replacement.wrapper) ||
      replacement.wrapper.parentNode !== replacement.parent
    ) {
      replacements.delete(node);
      return undefined;
    }
    return replacement;
  };

  const actualNodeFor = (node: Node, parent: Node): Node => {
    const replacement = replacementFor(node);
    if (!replacement) return node;
    const wrapper = replacement.wrapper;
    // An element can never be appended or inserted into itself or into its own descendant!
    if (wrapper === parent || (wrapper.nodeType === 1 && (wrapper as Element).contains(parent))) {
      return node;
    }
    return wrapper;
  };

  const recordMove = (node: Node, parent: Node) => {
    const replacement = replacements.get(node);
    if (replacement && replacement.wrapper.parentNode === parent) {
      replacement.parent = parent;
    }
  };

  const removeChild = function <T extends Node>(this: Node, child: T): T {
    drain();
    const replacement = replacementFor(child);
    if (child.parentNode !== this && replacement?.parent === this) {
      try {
        originalRemoveChild.call(this, replacement.wrapper);
      } catch {
        // Ignore if already unlinked
      }
      replacements.delete(child);
      sources.delete(replacement.wrapper);
      return child;
    }
    // Unknown mismatches retain native DOM errors; they are not translations.
    return originalRemoveChild.call(this, child) as T;
  };

  const insertBefore = function <T extends Node>(
    this: Node,
    newNode: T,
    referenceNode: Node | null,
  ): T {
    drain();
    const referenceReplacement = referenceNode && replacementFor(referenceNode);
    const reference =
      referenceReplacement?.parent === this
        ? referenceReplacement.wrapper
        : referenceNode;
    const target = actualNodeFor(newNode, this);
    if (target === this || (target.nodeType === 1 && (target as Element).contains(this))) {
      return newNode;
    }
    try {
      originalInsertBefore.call(this, target, reference);
      recordMove(newNode, this);
    } catch (error: unknown) {
      if ((error as { name?: string })?.name === "HierarchyRequestError") {
        return newNode;
      }
      throw error;
    }
    return newNode;
  };

  const appendChild = function <T extends Node>(this: Node, newNode: T): T {
    drain();
    const target = actualNodeFor(newNode, this);
    if (target === this || (target.nodeType === 1 && (target as Element).contains(this))) {
      return newNode;
    }
    try {
      originalAppendChild.call(this, target);
      recordMove(newNode, this);
    } catch (error: unknown) {
      if ((error as { name?: string })?.name === "HierarchyRequestError") {
        return newNode;
      }
      throw error;
    }
    return newNode;
  };

  const replaceChild = function <T extends Node>(
    this: Node,
    newNode: Node,
    child: T,
  ): T {
    drain();
    const replacement = replacementFor(child);
    const oldNode =
      child.parentNode !== this && replacement?.parent === this
        ? replacement.wrapper
        : child;
    const target = actualNodeFor(newNode, this);
    if (target === this || (target.nodeType === 1 && (target as Element).contains(this))) {
      return child;
    }
    try {
      originalReplaceChild.call(this, target, oldNode);
    } catch (error: unknown) {
      if ((error as { name?: string })?.name === "HierarchyRequestError") {
        return child;
      }
      throw error;
    }
    if (newNode !== child) {
      replacements.delete(child);
      if (replacement) sources.delete(replacement.wrapper);
    }
    recordMove(newNode, this);
    return child;
  };

  nodePrototype.removeChild = removeChild;
  nodePrototype.insertBefore = insertBefore;
  nodePrototype.appendChild = appendChild;
  nodePrototype.replaceChild = replaceChild;

  const restoreText = (node: Node) => {
    drain();
    const replacement = replacementFor(node);
    if (!replacement) return;
    // React updates its original Text, not Google's new Text inside the FONT.
    // Put the original back so the update is visible and can be translated again.
    replacements.delete(node);
    sources.delete(replacement.wrapper);
    originalReplaceChild.call(replacement.parent, node, replacement.wrapper);
  };

  const propertyRestorers: Array<() => void> = [];
  const patchTextSetter = (prototype: object, property: string) => {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
    if (!descriptor?.set || !descriptor.configurable) return;
    const originalSet = descriptor.set;
    const set = function (this: Node, value: string | null) {
      if (isText(this)) restoreText(this);
      originalSet.call(this, value);
    };
    Object.defineProperty(prototype, property, { ...descriptor, set });
    propertyRestorers.push(() => {
      if (Object.getOwnPropertyDescriptor(prototype, property)?.set === set) {
        Object.defineProperty(prototype, property, descriptor);
      }
    });
  };
  patchTextSetter(nodePrototype, "nodeValue");
  patchTextSetter(nodePrototype, "textContent");
  patchTextSetter(characterDataPrototype, "data");

  const installation: Installation = {
    users: 1,
    dispose: () => {
      observer.disconnect();
      candidates.clear();
      if (nodePrototype.removeChild === removeChild) {
        nodePrototype.removeChild = originalRemoveChild;
      }
      if (nodePrototype.insertBefore === insertBefore) {
        nodePrototype.insertBefore = originalInsertBefore;
      }
      if (nodePrototype.appendChild === appendChild) {
        nodePrototype.appendChild = originalAppendChild;
      }
      if (nodePrototype.replaceChild === replaceChild) {
        nodePrototype.replaceChild = originalReplaceChild;
      }
      for (const restore of propertyRestorers) restore();
    },
  };
  installations.set(document, installation);
  return releaseOnce();

  function releaseOnce() {
    let released = false;
    return () => {
      if (released) return;
      released = true;
      const current = installations.get(document);
      if (!current) return;
      current.users -= 1;
      if (current.users === 0) {
        current.dispose();
        installations.delete(document);
      }
    };
  }
}
