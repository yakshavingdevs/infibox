export const hashCommand = {
  name: "Hash Tools",
  shortcut: "hash",
  help: "Tools for generating non-cryptographic hashes.",
  usage: "hash <subcommand> - Generate a hash from text.",
  children: [
    {
      name: "Simple Hash",
      shortcut: "simple",
      requiresInput: true,
      type: "textarea",
      help: "Generates a simple hash of text.",
      usage: "hash simple - Enter text to hash.",
      processInput: ({ text }) => {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
          hash = (hash << 5) - hash + text.charCodeAt(i);
          hash |= 0; 
        }
        return hash.toString(16); 
      },
    },
    {
      name: "FNV-1a",
      shortcut: "fnv1a",
      requiresInput: true,
      type: "textarea",
      help: "Generates an FNV-1a hash of text.",
      usage: "hash fnv1a - Enter text to hash.",
      processInput: ({ text }) => {
        let hash = 0x811c9dc5; 
        for (let i = 0; i < text.length; i++) {
          hash ^= text.charCodeAt(i);
          hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
          hash >>>= 0; 
        }
        return hash.toString(16); 
      },
    },
    {
      name: "djb2",
      shortcut: "djb2",
      requiresInput: true,
      type: "textarea",
      help: "Generates a djb2 hash of text.",
      usage: "hash djb2 - Enter text to hash.",
      processInput: ({ text }) => {
        let hash = 5381;
        for (let i = 0; i < text.length; i++) {
          hash = (hash * 33) ^ text.charCodeAt(i);
          hash >>>= 0; 
        }
        return hash.toString(16); 
      },
    },
    {
      name: "sdbm",
      shortcut: "sdbm",
      requiresInput: true,
      type: "textarea",
      help: "Generates an sdbm hash of text.",
      usage: "hash sdbm - Enter text to hash.",
      processInput: ({ text }) => {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
          hash = text.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
          hash >>>= 0; 
        }
        return hash.toString(16); 
      },
    },
    {
      name: "Murmur3-like",
      shortcut: "murmur",
      requiresInput: true,
      type: "textarea",
      help: "Generates a simplified Murmur3-inspired hash of text.",
      usage: "hash murmur - Enter text to hash.",
      processInput: ({ text }) => {
        let hash = 0xcc9e2d51; 
        const c1 = 0x1b873593;
        for (let i = 0; i < text.length; i++) {
          let k = text.charCodeAt(i);
          k = Math.imul(k, c1); 
          k = (k << 15) | (k >>> 17); 
          k = Math.imul(k, 0xe6546b64); 
          hash ^= k;
          hash = (hash << 13) | (hash >>> 19); 
          hash = hash * 5 + 0xe6546b64;
          hash >>>= 0; 
        }
        hash ^= text.length;
        hash ^= hash >>> 16;
        hash = Math.imul(hash, 0x85ebca6b);
        hash ^= hash >>> 13;
        hash = Math.imul(hash, 0xc2b2ae35);
        hash ^= hash >>> 16;
        return hash.toString(16); 
      },
    },
  ],
};