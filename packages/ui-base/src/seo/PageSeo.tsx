type PageSeoProps = {
  description?: string | undefined;
  title: string;
  titlePrefix?: string | undefined;
  titleSuffix?: string | undefined;
};

function PageSeo({
  description,
  title,
  titlePrefix = "",
  titleSuffix = ""
}: PageSeoProps) {
  const pageTitle = [titlePrefix, title, titleSuffix]
    .filter(Boolean)
    .join(" | ");

  return (
    <>
      <title>{pageTitle}</title>
      {description ? <meta content={description} name="description" /> : null}
    </>
  );
}

export { PageSeo };
export type { PageSeoProps };
