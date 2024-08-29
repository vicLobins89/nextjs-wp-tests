import parse, { domToReact } from "html-react-parser";
import Link from "next/link";
import Image from "next/image";
import { WORDPRESS_SITE_URL, HEADLESS_SITE_URL } from "./constants";

export function fixInternalLinks(html) {
  const regex = new RegExp(`href="${WORDPRESS_SITE_URL}`, 'g');
  const replacement = `data-internal-link="true" href="${HEADLESS_SITE_URL}`;

  return html.replace(regex, replacement);
}

export default function parseHtml(html) {
  // Replace internal URLs.
  let content = fixInternalLinks(html);

  const options = {
    replace: ({ name, attribs, children }) => {
      // Convert internal links to Next.js Link components.
      const isInternalLink =
        name === 'a' && attribs["data-internal-link"] === 'true';

      if (isInternalLink) {
        if (attribs.class) {
          attribs.className = attribs.class;
          delete attribs.class;
        }

        return (
          <Link href={attribs.href} {...attribs}>
            {domToReact(children, options)}
          </Link>
        );
      }

      // Convert img tags to Image components.
      const isInternalImage =
        name === 'img' && attribs.src.startsWith(WORDPRESS_SITE_URL);

      if (isInternalImage) {
        if (attribs.class) {
          attribs.className = attribs.class;
          delete attribs.class;
        }

        return (
          <Image src={attribs.src} {...attribs} />
        );
      }
    },
  };

  return parse(content, options);
}