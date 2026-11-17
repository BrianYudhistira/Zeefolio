import { Head } from "@inertiajs/react";

export default function SeoHead({ seo, fallbackTitle = "Portfolio" }) {
    const title = seo?.title || fallbackTitle;

    return (
        <Head title={title}>
            {seo?.description && (
                <meta
                    head-key="description"
                    name="description"
                    content={seo.description}
                />
            )}
            {seo?.robots && (
                <meta
                    head-key="robots"
                    name="robots"
                    content={seo.robots}
                />
            )}
            {seo?.canonical && (
                <link
                    head-key="canonical"
                    rel="canonical"
                    href={seo.canonical}
                />
            )}

            {seo?.og?.type && (
                <meta
                    head-key="og:type"
                    property="og:type"
                    content={seo.og.type}
                />
            )}
            {seo?.og?.site_name && (
                <meta
                    head-key="og:site_name"
                    property="og:site_name"
                    content={seo.og.site_name}
                />
            )}
            {seo?.og?.title && (
                <meta
                    head-key="og:title"
                    property="og:title"
                    content={seo.og.title}
                />
            )}
            {seo?.og?.description && (
                <meta
                    head-key="og:description"
                    property="og:description"
                    content={seo.og.description}
                />
            )}
            {seo?.og?.url && (
                <meta
                    head-key="og:url"
                    property="og:url"
                    content={seo.og.url}
                />
            )}
            {seo?.og?.image && (
                <meta
                    head-key="og:image"
                    property="og:image"
                    content={seo.og.image}
                />
            )}

            {seo?.twitter?.card && (
                <meta
                    head-key="twitter:card"
                    name="twitter:card"
                    content={seo.twitter.card}
                />
            )}
            {seo?.twitter?.title && (
                <meta
                    head-key="twitter:title"
                    name="twitter:title"
                    content={seo.twitter.title}
                />
            )}
            {seo?.twitter?.description && (
                <meta
                    head-key="twitter:description"
                    name="twitter:description"
                    content={seo.twitter.description}
                />
            )}
            {seo?.twitter?.image && (
                <meta
                    head-key="twitter:image"
                    name="twitter:image"
                    content={seo.twitter.image}
                />
            )}

            {seo?.json_ld && (
                <script head-key="json-ld" type="application/ld+json">
                    {JSON.stringify(seo.json_ld)}
                </script>
            )}
        </Head>
    );
}
