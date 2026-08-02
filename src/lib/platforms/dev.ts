/**
 * Developer platform definitions.
 */

import type { Platform } from "../types";
import { basicDetect, looksLikeProfile } from "../helpers";

export const DEV_PLATFORMS: Platform[] = [
  {
    id: "github",
    name: "GitHub",
    category: "Dev",
    iconSlug: "github",
    color: "181717",
    url: (u) => `https://www.github.com/${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        return looksLikeProfile(body, /<meta name="user-login"/i);
      }
      return "unknown";
    },
  },
  {
    id: "gitlab",
    name: "GitLab",
    category: "Dev",
    iconSlug: "gitlab",
    color: "FC6D26",
    url: (u) => `https://gitlab.com/${u}`,
    detect: ({ status, body }) =>
      basicDetect(status, body, /404 File Not Found/i),
  },
  {
    id: "bitbucket",
    name: "Bitbucket",
    category: "Dev",
    iconSlug: "bitbucket",
    color: "2684FF",
    url: (u) => `https://bitbucket.org/${u}/`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "codeberg",
    name: "Codeberg",
    category: "Dev",
    iconSlug: "codeberg",
    color: "2185D0",
    url: (u) => `https://codeberg.org/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "gitea",
    name: "Gitea (gitea.com)",
    category: "Dev",
    iconSlug: "gitea",
    color: "609926",
    url: (u) => `https://gitea.com/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "codepen",
    name: "CodePen",
    category: "Dev",
    iconSlug: "codepen",
    color: "000000",
    url: (u) => `https://codepen.io/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "codesandbox",
    name: "CodeSandbox",
    category: "Dev",
    iconSlug: "codesandbox",
    color: "151515",
    url: (u) => `https://codesandbox.io/u/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "replit",
    name: "Replit",
    category: "Dev",
    iconSlug: "replit",
    color: "F26207",
    url: (u) => `https://replit.com/@${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "stackoverflow",
    name: "Stack Overflow",
    category: "Dev",
    iconSlug: "stackoverflow",
    color: "F48024",
    url: (u) => `https://stackoverflow.com/users/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "stackexchange",
    name: "Stack Exchange",
    category: "Dev",
    iconSlug: "stackexchange",
    color: "1F5DB1",
    url: (u) => `https://stackexchange.com/users/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "hackernews",
    name: "Hacker News",
    category: "Dev",
    iconSlug: "hackernews",
    color: "FF6600",
    url: (u) => `https://news.ycombinator.com/user?id=${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/No such user/i.test(body)) return "not_found";
        return looksLikeProfile(body, /<td class="topcolor"/i);
      }
      return "unknown";
    },
  },
  {
    id: "devto",
    name: "Dev.to",
    category: "Dev",
    iconSlug: "devto",
    color: "0A0A0A",
    url: (u) => `https://dev.to/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "npm",
    name: "npm",
    category: "Dev",
    iconSlug: "npm",
    color: "CB3837",
    url: (u) => `https://www.npmjs.com/~${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "pypi",
    name: "PyPI",
    category: "Dev",
    iconSlug: "pypi",
    color: "3775A9",
    url: (u) => `https://pypi.org/user/${u}/`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "docker",
    name: "Docker Hub",
    category: "Dev",
    iconSlug: "docker",
    color: "2496ED",
    url: (u) => `https://hub.docker.com/u/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    category: "Dev",
    iconSlug: "huggingface",
    color: "FFD21E",
    url: (u) => `https://huggingface.co/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "keybase",
    name: "Keybase",
    category: "Dev",
    iconSlug: "keybase",
    color: "33A0FF",
    url: (u) => `https://keybase.io/${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/not on keybase/i.test(body)) return "not_found";
        return looksLikeProfile(body);
      }
      return "unknown";
    },
  },
];