const previewItemCount = 2;

type AssessmentPreviewListProps = {
  items: string[];
  title: string;
};

function AssessmentPreviewList({ items, title }: AssessmentPreviewListProps) {
  const visibleItems = items.slice(0, previewItemCount);
  const hiddenCount = items.length - visibleItems.length;

  return (
    <section aria-label={title} className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {hiddenCount > 0 ? (
          <span className="text-muted-foreground text-xs">
            +{hiddenCount} more
          </span>
        ) : null}
      </div>
      <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-sm">
        {visibleItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export { AssessmentPreviewList, type AssessmentPreviewListProps };
