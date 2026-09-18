export interface ParsedSection {
  key: string;
  text: string;
}

export interface ParsedLyrics {
  structure: string[];
  sections: ParsedSection[];
}

/**
 * Parses freeform lyrics input into ordered sections.
 * Blocks are separated by a blank line. A block may start with a bracketed
 * label on its own line (e.g. "[Chorus]", "[Bridge]") to name and reuse that
 * section elsewhere in the song; unlabeled blocks are numbered "verse1", "verse2", ...
 */
export function parseLyricsInput(body: string): ParsedLyrics {
  const blocks = body
    .split(/\n\s*\n/)
    .map(b => b.trim())
    .filter(b => b.length > 0);

  const structure: string[] = [];
  const sectionByKey = new Map<string, string>();
  let verseCounter = 1;

  for (const block of blocks) {
    const lines = block.split('\n');
    const labelMatch = lines[0].match(/^\[(.+)\]$/);

    let key: string;
    let text: string;
    if (labelMatch) {
      key = labelMatch[1].trim().toLowerCase().replace(/\s+/g, '');
      text = lines.slice(1).join('\n').trim();
    } else {
      key = `verse${verseCounter++}`;
      text = block;
    }

    if (text.length === 0) continue;
    if (!sectionByKey.has(key)) {
      sectionByKey.set(key, text);
    }
    structure.push(key);
  }

  return {
    structure,
    sections: Array.from(sectionByKey.entries()).map(([key, text]) => ({ key, text }))
  };
}
