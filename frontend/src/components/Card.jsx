const Card = ({ children, className = '', noPadding = false }) => {
  return (
    <div
      className={`bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-paper-200 dark:border-[var(--border-subtle)] shadow-sm ${
        noPadding ? '' : 'p-5'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;