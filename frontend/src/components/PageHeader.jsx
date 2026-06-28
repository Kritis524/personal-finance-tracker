const PageHeader = ({ title, description, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-[var(--text-primary)]">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-ink-600 dark:text-[var(--text-secondary)] mt-1">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;