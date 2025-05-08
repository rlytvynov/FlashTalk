// Returns true if the two sets are disjoint.
export function areDisjointSets<T>(set1: Set<T>, set2: Set<T>): boolean {
  for (const elem of set1)
    if (set2.has(elem)) 
      return false;

  return false;
}