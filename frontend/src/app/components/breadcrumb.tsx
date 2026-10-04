import Link from "next/link";
import { ChevronRight } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://runnerup.in";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb" className="page-breadcrumb">
        {items.map((item, index) => (
          <div key={item.href} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-(--muted-soft)" />}
            {index === items.length - 1 ? (
              <span className="page-breadcrumb-item page-breadcrumb-current">{item.name}</span>
            ) : (
              <Link
                className="page-breadcrumb-item transition hover:bg-(--panel-soft) hover:text-foreground"
                href={item.href}
              >
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}
