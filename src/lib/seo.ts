/**
 * SEO utilities for generating metadata.
 *
 * Provides functions to generate Open Graph, Twitter Card,
 * and other SEO-related metadata for pages.
 */

export interface SEOProps {
  /** Page title */
  title: string;
  /** Page description */
  description: string;
  /** Canonical URL */
  url?: string;
  /** Open Graph image URL */
  image?: string;
  /** Twitter card type */
  twitterCard?: 'summary' | 'summary_large_image';
  /** No index flag */
  noIndex?: boolean;
  /** No follow flag */
  noFollow?: boolean;
  /** Published date (for articles) */
  publishedTime?: string;
  /** Modified date */
  modifiedTime?: string;
  /** Author name */
  author?: string;
  /** Section/category */
  section?: string;
  /** Tags */
  tags?: string[];
}

const defaultSiteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ticktick-clone.com';
const defaultTitle = 'TickTick Clone';

/**
 * Generates Open Graph metadata.
 */
export function generateOpenGraph(props: SEOProps) {
  const url = props.url || defaultSiteUrl;
  const image = props.image || `${defaultSiteUrl}/og-image.png`;

  return {
    title: props.title,
    description: props.description,
    url,
    siteName: defaultTitle,
    images: [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: props.title,
      },
    ],
    locale: 'en_US',
    type: 'website',
  };
}

/**
 * Generates Twitter Card metadata.
 */
export function generateTwitterCard(props: SEOProps) {
  return {
    card: props.twitterCard || 'summary_large_image',
    title: props.title,
    description: props.description,
    images: [props.image || `${defaultSiteUrl}/og-image.png`],
  };
}

/**
 * Generates full page title with site name.
 */
export function generatePageTitle(pageTitle: string): string {
  return pageTitle === defaultTitle ? defaultTitle : `${pageTitle} | ${defaultTitle}`;
}

/**
 * Generates canonical URL.
 */
export function generateCanonicalUrl(path: string): string {
  return `${defaultSiteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Generates robots metadata.
 */
export function generateRobotsMeta(noIndex?: boolean, noFollow?: boolean) {
  return {
    index: !noIndex,
    follow: !noFollow,
    googleBot: {
      index: !noIndex,
      follow: !noFollow,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
}

/**
 * Generates JSON-LD structured data for WebApplication.
 */
export function generateWebApplicationJsonLd(props: {
  name: string;
  description: string;
  url?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: props.name,
    description: props.description,
    url: props.url || defaultSiteUrl,
    applicationCategory: props.applicationCategory || 'ProductivityApplication',
    operatingSystem: props.operatingSystem || 'Web Browser',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: props.offers || {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

/**
 * Generates JSON-LD structured data for BreadcrumbList.
 */
export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generates all SEO metadata for a page.
 * Use this in page components to generate complete metadata.
 */
export function generateSEOMetadata(props: SEOProps) {
  const canonicalUrl = props.url ? generateCanonicalUrl(props.url) : undefined;

  return {
    title: generatePageTitle(props.title),
    description: props.description,
    canonical: canonicalUrl,
    openGraph: generateOpenGraph(props),
    twitter: generateTwitterCard(props),
    robots: generateRobotsMeta(props.noIndex, props.noFollow),
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
